import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const ahora = new Date().toISOString();

    await Promise.all([
      supabaseAdmin.from("profiles").update({ ultima_conexion: ahora }).eq("id", user.id),
      supabaseAdmin.from("eventos_conexion").insert({ cliente_id: user.id, created_at: ahora }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error registrando conexión:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}