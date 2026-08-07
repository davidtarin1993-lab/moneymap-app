import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    await supabaseAdmin
      .from("profiles")
      .update({ ultima_conexion: new Date().toISOString() })
      .eq("id", user.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error registrando conexión:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}