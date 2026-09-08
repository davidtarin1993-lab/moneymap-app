import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { llamarGemini, extraerJSON } from "@/lib/gemini";
import { PROMPT_CLASIFICADOR } from "@/lib/prompts/clasificadorOperativa";

export const runtime = "nodejs";
export const maxDuration = 60;

const LIMITE_MOVIMIENTOS = 50;
const LIMITE_INTENTOS_24H = 3;

function normalizarTexto(txt: string): string {
  return String(txt ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

const PALABRAS_CLAVE_CABECERA = ["fecha", "date", "concepto", "descripcion", "detalle", "importe", "amount", "monto", "cantidad", "saldo", "balance", "valor"];

function detectarFilaCabecera(filas: any[][]): number {
  const LIMITE = Math.min(filas.length, 25);
  for (let i = 0; i < LIMITE; i++) {
    const fila = filas[i] ?? [];
    const coincidencias = fila
      .map((c: any) => normalizarTexto(c))
      .filter((c: string) => PALABRAS_CLAVE_CABECERA.some((p) => c.includes(p))).length;
    if (coincidencias >= 2) return i;
  }
  return 0;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconocida";

    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("intentos_publicos")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .eq("tipo", "analizador_gastos")
      .gte("created_at", hace24h);

    if ((count ?? 0) >= LIMITE_INTENTOS_24H) {
      return NextResponse.json(
        { error: "Has alcanzado el límite de pruebas gratuitas por hoy. Regístrate en MoneyMap para uso ilimitado." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const archivo = formData.get("archivo") as File | null;
    if (!archivo) return NextResponse.json({ error: "No se ha recibido ningún archivo." }, { status: 400 });

    const extension = archivo.name.split(".").pop()?.toLowerCase();
    if (extension !== "xlsx" && extension !== "xls" && extension !== "pdf") {
      return NextResponse.json({ error: "Solo se admiten archivos .xlsx, .xls o .pdf." }, { status: 400 });
    }

    await supabaseAdmin.from("intentos_publicos").insert({ ip, tipo: "analizador_gastos" });

    const arrayBuffer = await archivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let clasificacion: any[] = [];

    if (extension === "xlsx" || extension === "xls") {
      const libro = XLSX.read(buffer, { type: "buffer" });
      const hoja = libro.Sheets[libro.SheetNames[0]];
      const todasLasFilas = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: "" }) as any[][];
      const indiceCabecera = detectarFilaCabecera(todasLasFilas);
      const filasLimitadas = todasLasFilas.slice(indiceCabecera, indiceCabecera + 1 + LIMITE_MOVIMIENTOS);
      const hojaLimpia = XLSX.utils.aoa_to_sheet(filasLimitadas);
      const csv = XLSX.utils.sheet_to_csv(hojaLimpia);

      const respuesta = await llamarGemini([
        {
          text: `${PROMPT_CLASIFICADOR}\n\nEsto es una versión de PRUEBA GRATUITA (máximo ${LIMITE_MOVIMIENTOS} movimientos). Clasifica las filas de este CSV:\n\n${csv}`,
        },
      ]);
      const resultado = extraerJSON(respuesta);
      clasificacion = (resultado.clasificacion ?? []).slice(0, LIMITE_MOVIMIENTOS);
    } else {
      const base64 = buffer.toString("base64");
      const respuesta = await llamarGemini([
        {
          text: `${PROMPT_CLASIFICADOR}\n\nEsto es una versión de PRUEBA GRATUITA. Clasifica como máximo los primeros ${LIMITE_MOVIMIENTOS} movimientos que encuentres en el documento.`,
        },
        { inline_data: { mime_type: "application/pdf", data: base64 } },
      ]);
      const resultado = extraerJSON(respuesta);
      clasificacion = (resultado.clasificacion ?? []).slice(0, LIMITE_MOVIMIENTOS);
    }

    const movimientos = clasificacion
      .filter((item: any) => item.tipo_movimiento === "gasto" || item.tipo_movimiento === "ingreso")
      .map((item: any) => ({
        importe: Number(item.importe) || 0,
        tipo: item.tipo_movimiento === "ingreso" ? "ingreso" : "gasto",
        categoria: item.categoria_principal || "Otros",
      }));

    const ingresosTotales = movimientos.filter((m) => m.tipo === "ingreso").reduce((s, m) => s + Math.abs(m.importe), 0);
    const gastosTotales = movimientos.filter((m) => m.tipo === "gasto").reduce((s, m) => s + Math.abs(m.importe), 0);
    const ahorroNeto = ingresosTotales - gastosTotales;
    const tasaAhorro = ingresosTotales > 0 ? (ahorroNeto / ingresosTotales) * 100 : 0;

    const porCategoria: Record<string, number> = {};
    for (const m of movimientos) {
      if (m.tipo !== "gasto") continue;
      porCategoria[m.categoria] = (porCategoria[m.categoria] ?? 0) + Math.abs(m.importe);
    }
    const topCategorias = Object.entries(porCategoria)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([categoria, importe]) => ({ categoria, importe: Math.round(importe) }));

    return NextResponse.json({
      ok: true,
      ingresosTotales: Math.round(ingresosTotales),
      gastosTotales: Math.round(gastosTotales),
      ahorroNeto: Math.round(ahorroNeto),
      tasaAhorro: Math.round(tasaAhorro * 10) / 10,
      topCategorias,
      movimientosAnalizados: movimientos.length,
      limiteAplicado: LIMITE_MOVIMIENTOS,
    });
  } catch (err: any) {
    console.error("Error en analizador express:", err);
    return NextResponse.json({ error: "No se pudo procesar el archivo. Inténtalo de nuevo." }, { status: 500 });
  }
}