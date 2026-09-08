import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVerifiedAdmin } from "@/lib/serverAuth";

const SECCIONES_FORMACION = ["pildoras", "noticias", "cartera"];

export async function GET(request: Request) {
  const { user, error } = await getVerifiedAdmin(request as any);
  if (error || !user) return NextResponse.json({ error }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const clienteId = searchParams.get("clienteId");
  if (!clienteId) return NextResponse.json({ error: "Falta el clienteId." }, { status: 400 });

  const [{ data: visitas }, { data: quizzes }] = await Promise.all([
    supabaseAdmin
      .from("eventos_pagina")
      .select("seccion, created_at")
      .eq("cliente_id", clienteId)
      .in("seccion", SECCIONES_FORMACION)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("resultados_quiz")
      .select("id, puntuacion_global, puntuaciones_categoria, segundos_empleados, created_at")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    visitas: visitas ?? [],
    quizzes: quizzes ?? [],
  });
}