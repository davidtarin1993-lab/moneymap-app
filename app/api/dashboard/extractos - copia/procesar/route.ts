import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { llamarGemini, extraerJSON } from "@/lib/gemini";
import { PROMPT_CLASIFICADOR } from "@/lib/prompts/clasificadorOperativa";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ItemClasificado {
  fecha: string;
  descripcion_original: string;
  importe: number;
  tipo_movimiento: string;
  categoria_principal: string;
  subcategoria: string;
  categoria_reducida: string;
  naturaleza_gasto: string;
}

function mapearAMovimientosGrafico(clasificacion: ItemClasificado[]) {
  return clasificacion
    .filter((item) => item.tipo_movimiento === "gasto" || item.tipo_movimiento === "ingreso")
    .map((item) => ({
      fecha: item.fecha,
      descripcion: item.descripcion_original,
      importe: item.importe,
      tipo: item.tipo_movimiento === "ingreso" ? "ingreso" : "gasto",
      categoria: item.categoria_principal,
      subcategoria: item.subcategoria,
      naturaleza: item.naturaleza_gasto === "fijo" ? "fijo" : item.naturaleza_gasto === "variable" ? "variable" : "no aplica",
    }));
}

function normalizarTexto(txt: string): string {
  return String(txt ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const PALABRAS_CLAVE_CABECERA = [
  "fecha", "date", "concepto", "descripcion", "detalle",
  "importe", "amount", "monto", "cantidad", "saldo", "balance", "valor",
];

function detectarFilaCabecera(filas: any[][]): number {
  const LIMITE_BUSQUEDA = Math.min(filas.length, 25);

  for (let i = 0; i < LIMITE_BUSQUEDA; i++) {
    const fila = filas[i] ?? [];
    const celdasNormalizadas = fila.map((c) => normalizarTexto(c));
    const coincidencias = celdasNormalizadas.filter((c) =>
      PALABRAS_CLAVE_CABECERA.some((palabra) => c.includes(palabra))
    ).length;

    // Consideramos que es la fila de cabecera real si al menos 2 columnas
    // coinciden con nombres típicos de un extracto bancario
    if (coincidencias >= 2) {
      return i;
    }
  }

  return 0; // fallback: si no detectamos nada, asumimos que empieza en la primera fila
}

export async function POST(request: Request) {
  let extractoId: string | null = null;

  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const formData = await request.formData();
    const archivo = formData.get("archivo") as File | null;

    if (!archivo) {
      return NextResponse.json({ error: "No se ha recibido ningún archivo." }, { status: 400 });
    }

    const nombreArchivo = archivo.name;
    const extension = nombreArchivo.split(".").pop()?.toLowerCase();

    if (extension !== "xlsx" && extension !== "xls" && extension !== "pdf") {
      return NextResponse.json({ error: "Solo se admiten archivos .xlsx, .xls o .pdf." }, { status: 400 });
    }

    const arrayBuffer = await archivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Subir el archivo original a Storage
    const pathStorage = `${user.id}/${Date.now()}-${nombreArchivo}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("extractos")
      .upload(pathStorage, buffer, { contentType: archivo.type });

    if (uploadError) {
      return NextResponse.json({ error: "No se pudo guardar el archivo original." }, { status: 500 });
    }

    // 2. Registrar el extracto como "procesando"
    const { data: extractoInsertado, error: insertError } = await supabaseAdmin
      .from("extractos_bancarios")
      .insert({
        cliente_id: user.id,
        archivo_nombre: nombreArchivo,
        archivo_path: pathStorage,
        archivo_tipo: extension,
        estado: "procesando",
      })
      .select("id")
      .single();

    if (insertError || !extractoInsertado) {
      return NextResponse.json({ error: "No se pudo registrar el extracto." }, { status: 500 });
    }

    extractoId = extractoInsertado.id;

    // 3. Construir el contenido y clasificar (troceado por lotes para xlsx/xls)
    let filasOrigen = 0;
    let clasificacion: ItemClasificado[] = [];
    const TAMANO_LOTE = 40;
    if (extension === "xlsx" || extension === "xls") {
      const libro = XLSX.read(buffer, { type: "buffer" });
      const hoja = libro.Sheets[libro.SheetNames[0]];

      // Leemos como matriz de filas para poder detectar dónde empieza la tabla real
      const todasLasFilas = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: "" }) as any[][];
      const indiceCabecera = detectarFilaCabecera(todasLasFilas);
      const filasDesdeHeader = todasLasFilas.slice(indiceCabecera);

      // Reconstruimos una hoja limpia solo con la tabla real (sin la introducción) y la pasamos a CSV
      const hojaLimpia = XLSX.utils.aoa_to_sheet(filasDesdeHeader);
      const csvCompleto = XLSX.utils.sheet_to_csv(hojaLimpia);

      const lineasCSV = csvCompleto.split("\n").filter((l) => l.trim() !== "");
      const cabecera = lineasCSV[0];
      const filasCSV = lineasCSV.slice(1);
      filasOrigen = filasCSV.length;

      const TAMANO_LOTE_AJUSTADO = 25;
      const lotes: string[][] = [];
      for (let i = 0; i < filasCSV.length; i += TAMANO_LOTE_AJUSTADO) {
        lotes.push(filasCSV.slice(i, i + TAMANO_LOTE_AJUSTADO));
      }

      const procesarLote = async (lote: string[], idx: number, intento: number): Promise<ItemClasificado[]> => {
        const csvLote = [cabecera, ...lote].join("\n");
        try {
          const respuestaLote = await llamarGemini([
            {
              text: `${PROMPT_CLASIFICADOR}\n\nEste es el FRAGMENTO ${idx + 1} de ${lotes.length} del extracto bancario, en formato CSV, con ${lote.length} filas de movimientos (sin contar la cabecera). Clasifica TODAS y CADA UNA de las ${lote.length} filas de este fragmento, sin omitir ninguna, aunque parezcan repetidas, duplicadas o poco relevantes. El array "clasificacion" de tu respuesta debe tener exactamente ${lote.length} elementos, uno por cada fila de datos:\n\n${csvLote}`,
            },
          ]);
          const resultado = extraerJSON(respuestaLote);
          const items = (resultado.clasificacion ?? []) as ItemClasificado[];

          if (items.length < lote.length && intento < 2) {
            console.warn(`Lote ${idx + 1}: esperadas ${lote.length}, recibidas ${items.length}. Reintentando (intento ${intento + 1})...`);
            return procesarLote(lote, idx, intento + 1);
          }

          return items;
        } catch (errorLote) {
          console.error(`Error procesando lote ${idx + 1} (intento ${intento + 1}):`, errorLote);

          if (intento < 2) {
            return procesarLote(lote, idx, intento + 1);
          }

          return [];
        }
      };

      const resultadosLotes = await Promise.all(
        lotes.map((lote, idx) => procesarLote(lote, idx, 0))
      );


      clasificacion = resultadosLotes.flat();
    } else {
      const base64 = buffer.toString("base64");
      const respuestaTexto = await llamarGemini([
        { text: PROMPT_CLASIFICADOR },
        { inline_data: { mime_type: "application/pdf", data: base64 } },
      ]);
      const resultado = extraerJSON(respuestaTexto);
      clasificacion = resultado.clasificacion ?? [];
    }

    // 4. Mapear al formato del gráfico y verificar integridad
    const movimientosGrafico = mapearAMovimientosGrafico(clasificacion);

    let verificacion: "completo" | "incompleto" | "no_verificable" = "no_verificable";

    if (extension === "xlsx" || extension === "xls") {
      verificacion = clasificacion.length >= filasOrigen ? "completo" : "incompleto";
    }

    await supabaseAdmin
      .from("extractos_bancarios")
      .update({
        estado: "completado",
        clasificacion_completa: clasificacion,
        movimientos_grafico: movimientosGrafico,
        movimientos_detectados_origen: extension === "pdf" ? null : filasOrigen,
        movimientos_clasificados: clasificacion.length,
        verificacion,
        procesado_at: new Date().toISOString(),
      })
      .eq("id", extractoId);

    return NextResponse.json({
      ok: true,
      movimientos: movimientosGrafico,
      verificacion,
      movimientosDetectadosOrigen: extension === "pdf" ? null : filasOrigen,
      movimientosClasificados: clasificacion.length,
    });
  } catch (err: any) {
    console.error("Error procesando extracto:", err);

    if (extractoId) {
      await supabaseAdmin
        .from("extractos_bancarios")
        .update({ estado: "error", error_mensaje: err.message ?? "Error desconocido" })
        .eq("id", extractoId);
    }

    return NextResponse.json({ error: "No se pudo procesar el extracto. " + (err.message ?? "") }, { status: 500 });
  }
}