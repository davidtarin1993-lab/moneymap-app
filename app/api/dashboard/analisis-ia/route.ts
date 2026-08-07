import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { llamarGemini } from "@/lib/gemini";

export const runtime = "nodejs";

const LIMITE_INTERACCIONES = 3;

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

    const { pregunta, movimientosFiltrados, rangoFechas } = await request.json();

    const inicioDelDia = obtenerInicioDelDiaISO();

    // 1. Contar interacciones de HOY
    const { count, error: countError } = await supabaseAdmin
      .from("analisis_ia_mensajes")
      .select("id", { count: "exact", head: true })
      .eq("cliente_id", user.id)
      .eq("rol", "usuario")
      .gte("created_at", inicioDelDia);

    if (countError) {
      return NextResponse.json({ error: "No se pudo comprobar el límite de consultas." }, { status: 500 });
    }

    const usadas = count ?? 0;

    if (usadas >= LIMITE_INTERACCIONES) {
      return NextResponse.json(
        { error: "Has alcanzado el límite de 3 consultas diarias al asistente de análisis. Vuelve a intentarlo mañana.", limiteAlcanzado: true, restantes: 0 },
        { status: 403 }
      );
    }

    // 2. Recuperar historial previo (de siempre, para dar contexto, no solo de hoy)
    const { data: historial } = await supabaseAdmin
      .from("analisis_ia_mensajes")
      .select("rol, contenido")
      .eq("cliente_id", user.id)
      .order("created_at", { ascending: true });

    const contextoHistorico = (historial ?? [])
      .map((m) => `${m.rol === "usuario" ? "Cliente" : "Asistente"}: ${m.contenido}`)
      .join("\n\n");

    const preguntaFinal = pregunta?.trim()
      || "Haz un análisis exhaustivo de mis movimientos en este período y dame recomendaciones concretas.";

    const promptCompleto = `Eres un asesor financiero de MoneyMap. Analiza los siguientes movimientos del cliente correspondientes al período ${rangoFechas ?? "seleccionado"} y responde a su consulta con recomendaciones concretas, claras y accionables. Tono profesional, cercano y sin tecnicismos innecesarios. Máximo 200 palabras.

Movimientos del período (JSON):
${JSON.stringify(movimientosFiltrados ?? []).slice(0, 12000)}

${contextoHistorico ? `Conversación previa:\n${contextoHistorico}\n\n` : ""}Consulta del cliente: ${preguntaFinal}`;

    // 3. Llamar a Gemini
    const respuestaIA = await llamarGemini([{ text: promptCompleto }]);

    // 4. Registrar ambos mensajes
    await supabaseAdmin.from("analisis_ia_mensajes").insert([
      { cliente_id: user.id, rol: "usuario", contenido: preguntaFinal },
      { cliente_id: user.id, rol: "ia", contenido: respuestaIA },
    ]);

    return NextResponse.json({
      respuesta: respuestaIA,
      restantes: LIMITE_INTERACCIONES - (usadas + 1),
    });
  } catch (err: any) {
    console.error("Error en analisis-ia:", err);
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
      .gte("created_at", inicioDelDia);

    if (countError) {
      return NextResponse.json({ error: "No se pudo consultar el contador." }, { status: 500 });
    }

    // Historial completo (todos los días) para mostrar la conversación entera
    const { data: historial } = await supabaseAdmin
      .from("analisis_ia_mensajes")
      .select("rol, contenido")
      .eq("cliente_id", user.id)
      .order("created_at", { ascending: true });

    const usadas = count ?? 0;

    return NextResponse.json({
      usadas,
      restantes: Math.max(0, LIMITE_INTERACCIONES - usadas),
      limite: LIMITE_INTERACCIONES,
      historial: historial ?? [],
    });
  } catch (err: any) {
    console.error("Error en GET analisis-ia:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}