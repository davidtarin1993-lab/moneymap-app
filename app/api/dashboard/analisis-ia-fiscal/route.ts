import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { llamarGemini } from "@/lib/gemini";

export const runtime = "nodejs";

const LIMITE_INTERACCIONES = 3;
const TIPO_ASISTENTE = "fiscal";

function obtenerInicioDelDiaISO(): string {
  const ahora = new Date();
  const inicio = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate(), 0, 0, 0));
  return inicio.toISOString();
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { pregunta, registrosFiltrados, rangoEjercicios } = await request.json();

    const inicioDelDia = obtenerInicioDelDiaISO();

    const { count, error: countError } = await supabaseAdmin
      .from("analisis_ia_mensajes")
      .select("id", { count: "exact", head: true })
      .eq("cliente_id", user.id)
      .eq("rol", "usuario")
      .eq("tipo", TIPO_ASISTENTE)
      .gte("created_at", inicioDelDia);

    if (countError) {
      return NextResponse.json({ error: "No se pudo comprobar el límite de consultas." }, { status: 500 });
    }

    const usadas = count ?? 0;

    if (usadas >= LIMITE_INTERACCIONES) {
      return NextResponse.json(
        { error: "Has alcanzado el límite de 3 consultas diarias al especialista fiscal. Vuelve a intentarlo mañana.", limiteAlcanzado: true, restantes: 0 },
        { status: 403 }
      );
    }

    const { data: historial } = await supabaseAdmin
      .from("analisis_ia_mensajes")
      .select("rol, contenido")
      .eq("cliente_id", user.id)
      .eq("tipo", TIPO_ASISTENTE)
      .order("created_at", { ascending: true });

    const contextoHistorico = (historial ?? [])
      .map((m) => `${m.rol === "usuario" ? "Cliente" : "Especialista"}: ${m.contenido}`)
      .join("\n\n");

    const preguntaFinal = pregunta?.trim()
      || "Haz un análisis fiscal exhaustivo de mis datos en este rango de ejercicios y dame recomendaciones de optimización fiscal concretas.";

    const promptCompleto = `Eres un especialista en fiscalidad de MoneyMap, experto en IRPF español (Modelo 100). Analiza los siguientes datos fiscales del cliente correspondientes a los ejercicios ${rangoEjercicios ?? "seleccionados"} y responde a su consulta con recomendaciones de optimización fiscal concretas, claras y accionables (por ejemplo: aportaciones a planes de pensiones, aprovechamiento de deducciones autonómicas, gestión de la base del ahorro frente a la general, planificación de ganancias/pérdidas patrimoniales, etc.). Tono profesional, cercano y sin tecnicismos innecesarios. Máximo 200 palabras. Si la recomendación requiere una decisión fiscal relevante (ej. una operación de gran importe), aclara brevemente que conviene confirmarlo con asesoría fiscal personalizada antes de actuar.

Datos fiscales del rango de ejercicios seleccionado (JSON):
${JSON.stringify(registrosFiltrados ?? []).slice(0, 12000)}

${contextoHistorico ? `Conversación previa:\n${contextoHistorico}\n\n` : ""}Consulta del cliente: ${preguntaFinal}`;

    const respuestaIA = await llamarGemini([{ text: promptCompleto }]);

    await supabaseAdmin.from("analisis_ia_mensajes").insert([
      { cliente_id: user.id, rol: "usuario", contenido: preguntaFinal, tipo: TIPO_ASISTENTE },
      { cliente_id: user.id, rol: "ia", contenido: respuestaIA, tipo: TIPO_ASISTENTE },
    ]);

    return NextResponse.json({
      respuesta: respuestaIA,
      restantes: LIMITE_INTERACCIONES - (usadas + 1),
    });
  } catch (err: any) {
    console.error("Error en analisis-ia-fiscal:", err);
    return NextResponse.json({ error: "No se pudo generar el análisis. " + (err.message ?? "") }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const inicioDelDia = obtenerInicioDelDiaISO();

    const { count, error: countError } = await supabaseAdmin
      .from("analisis_ia_mensajes")
      .select("id", { count: "exact", head: true })
      .eq("cliente_id", user.id)
      .eq("rol", "usuario")
      .eq("tipo", TIPO_ASISTENTE)
      .gte("created_at", inicioDelDia);

    if (countError) {
      return NextResponse.json({ error: "No se pudo consultar el contador." }, { status: 500 });
    }

    const { data: historial } = await supabaseAdmin
      .from("analisis_ia_mensajes")
      .select("rol, contenido")
      .eq("cliente_id", user.id)
      .eq("tipo", TIPO_ASISTENTE)
      .order("created_at", { ascending: true });

    const usadas = count ?? 0;

    return NextResponse.json({
      usadas,
      restantes: Math.max(0, LIMITE_INTERACCIONES - usadas),
      limite: LIMITE_INTERACCIONES,
      historial: historial ?? [],
    });
  } catch (err: any) {
    console.error("Error en GET analisis-ia-fiscal:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}