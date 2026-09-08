import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { llamarGemini, extraerJSON } from "@/lib/gemini";
import { PROMPT_FISCAL } from "@/lib/prompts/clasificadorFiscal";

export const runtime = "nodejs";
export const maxDuration = 60;

interface RegistroFiscalCrudo {
  metrica: string;
  fecha_operativa: string;
  importe: number;
  casilla: string;
  ejercicio: string;
  documento_origen: string;
}

interface RegistroFiscal {
  ejercicio: string;
  concepto: string;
  ingresoBruto: number;
  retencionIRPF: number;
  subcategoria: string;
}

function normalizarTexto(txt: string): string {
  return String(txt ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function mapearARegistrosFiscales(registros: RegistroFiscalCrudo[]): RegistroFiscal[] {
  return registros.map((r) => {
    const metricaStr = r.metrica || "";
    const metricaClean = normalizarTexto(metricaStr);
    let ingresoBruto = 0;
    let retencionIRPF = 0;

    if (metricaClean === "ingresos totales" || metricaClean === "ingresos trabajo") {
      ingresoBruto = Math.abs(r.importe);
    } else if (metricaClean === "retenciones totales" || metricaClean === "retenciones trabajo") {
      retencionIRPF = Math.abs(r.importe);
    } else {
      ingresoBruto = r.importe;
    }

    return {
      ejercicio: String(r.ejercicio ?? "2024"),
      concepto: metricaStr,
      ingresoBruto: Math.round(ingresoBruto * 100) / 100,
      retencionIRPF: Math.round(retencionIRPF * 100) / 100,
      subcategoria: metricaStr,
    };
  });
}

const METRICAS_ESPERADAS = 15;

export async function POST(request: Request) {
  let extractoId: string | null = null;

  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const formData = await request.formData();
    const archivo = formData.get("archivo") as File | null;
    const loteId = formData.get("loteId") as string | null;

    if (!archivo) {
      return NextResponse.json({ error: "No se ha recibido ningún archivo." }, { status: 400 });
    }

    const nombreArchivo = archivo.name;
    const extension = nombreArchivo.split(".").pop()?.toLowerCase();

    if (extension !== "pdf") {
      return NextResponse.json({ error: "Solo se admiten declaraciones en PDF." }, { status: 400 });
    }

    const arrayBuffer = await archivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pathStorage = `${user.id}/${Date.now()}-${nombreArchivo}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("extractos-fiscales")
      .upload(pathStorage, buffer, { contentType: archivo.type });

    if (uploadError) {
      return NextResponse.json({ error: "No se pudo guardar el archivo original." }, { status: 500 });
    }

    const { data: extractoInsertado, error: insertError } = await supabaseAdmin
      .from("extractos_fiscales")
      .insert({
        cliente_id: user.id,
        archivo_nombre: nombreArchivo,
        archivo_path: pathStorage,
        estado: "procesando",
        lote_id: loteId,
      })
      .select("id")
      .single();

    if (insertError || !extractoInsertado) {
      return NextResponse.json({ error: "No se pudo registrar el extracto." }, { status: 500 });
    }

    extractoId = extractoInsertado.id;

    const base64 = buffer.toString("base64");
    const respuestaTexto = await llamarGemini([
      { text: PROMPT_FISCAL },
      { inline_data: { mime_type: "application/pdf", data: base64 } },
    ]);

    const resultado = extraerJSON(respuestaTexto);
    const registrosCrudos: RegistroFiscalCrudo[] = resultado.registros ?? [];
    const registrosGrafico = mapearARegistrosFiscales(registrosCrudos);

    const ejerciciosDetectados = new Set(registrosCrudos.map((r) => r.ejercicio)).size;
    const esperados = ejerciciosDetectados * METRICAS_ESPERADAS;

    let verificacion: "completo" | "incompleto" | "no_verificable" = "no_verificable";
    if (ejerciciosDetectados > 0) {
      verificacion = registrosCrudos.length >= esperados ? "completo" : "incompleto";
    }

    await supabaseAdmin
      .from("extractos_fiscales")
      .update({
        estado: "completado",
        registros_completos: registrosCrudos,
        registros_grafico: registrosGrafico,
        ejercicios_detectados: ejerciciosDetectados,
        registros_detectados: registrosCrudos.length,
        verificacion,
        procesado_at: new Date().toISOString(),
      })
      .eq("id", extractoId);

    return NextResponse.json({
      ok: true,
      registros: registrosGrafico,
      verificacion,
      ejerciciosDetectados,
      registrosDetectados: registrosCrudos.length,
    });
  } catch (err: any) {
    console.error("Error procesando declaración fiscal:", err);

    if (extractoId) {
      await supabaseAdmin
        .from("extractos_fiscales")
        .update({ estado: "error", error_mensaje: err.message ?? "Error desconocido" })
        .eq("id", extractoId);
    }

    return NextResponse.json({ error: "No se pudo procesar la declaración. " + (err.message ?? "") }, { status: 500 });
  }
}