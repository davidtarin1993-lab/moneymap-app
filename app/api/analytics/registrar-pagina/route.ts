import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const SECCIONES_VALIDAS = ["movimientos", "fiscalidad", "ruta", "pildoras", "noticias", "cartera"];

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { seccion } = await request.json();

    if (!SECCIONES_VALIDAS.includes(seccion)) {
      return NextResponse.json({ error: "Sección no válida." }, { status: 400 });
    }

    await supabaseAdmin.from("eventos_pagina").insert({ cliente_id: user.id, seccion });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error registrando visita:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}