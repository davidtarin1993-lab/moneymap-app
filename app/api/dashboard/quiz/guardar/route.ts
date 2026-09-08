import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { puntuacionGlobal, puntuacionesCategoria, segundosEmpleados } = await request.json();

    if (typeof puntuacionGlobal !== "number" || !puntuacionesCategoria) {
      return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
    }

    const { error: insertError } = await supabaseAdmin.from("resultados_quiz").insert({
      cliente_id: user.id,
      puntuacion_global: puntuacionGlobal,
      puntuaciones_categoria: puntuacionesCategoria,
      segundos_empleados: segundosEmpleados ?? null,
    });

    if (insertError) {
      console.error("Error al guardar resultado del quiz:", insertError);
      return NextResponse.json({ error: "No se pudo guardar el resultado." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en /api/dashboard/quiz/guardar:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}