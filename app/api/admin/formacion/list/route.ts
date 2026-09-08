import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVerifiedAdmin } from "@/lib/serverAuth";

const SECCIONES_FORMACION = ["pildoras", "noticias", "cartera"];

export async function GET(request: Request) {
  const { user, error } = await getVerifiedAdmin(request as any);
  if (error || !user) return NextResponse.json({ error }, { status: 401 });

  const { data: clientes, error: clientesError } = await supabaseAdmin
    .from("profiles")
    .select("id, nombre, email")
    .eq("role", "user");

  if (clientesError) return NextResponse.json({ error: clientesError.message }, { status: 500 });

  const { data: visitas } = await supabaseAdmin
    .from("eventos_pagina")
    .select("cliente_id, seccion, created_at")
    .in("seccion", SECCIONES_FORMACION);

  const { data: quizzes } = await supabaseAdmin
    .from("resultados_quiz")
    .select("cliente_id, created_at");

  const ultimaVisitaPorCliente = new Map<string, string>();
  const totalVisitasPorCliente = new Map<string, number>();
  for (const v of visitas ?? []) {
    totalVisitasPorCliente.set(v.cliente_id, (totalVisitasPorCliente.get(v.cliente_id) ?? 0) + 1);
    const actual = ultimaVisitaPorCliente.get(v.cliente_id);
    if (!actual || v.created_at > actual) ultimaVisitaPorCliente.set(v.cliente_id, v.created_at);
  }

  const totalQuizzesPorCliente = new Map<string, number>();
  for (const q of quizzes ?? []) {
    totalQuizzesPorCliente.set(q.cliente_id, (totalQuizzesPorCliente.get(q.cliente_id) ?? 0) + 1);
  }

  const resultado = (clientes ?? []).map((c) => ({
    clienteId: c.id,
    nombre: c.nombre,
    email: c.email,
    ultimaVisitaFormacion: ultimaVisitaPorCliente.get(c.id) ?? null,
    totalVisitasFormacion: totalVisitasPorCliente.get(c.id) ?? 0,
    totalQuizzes: totalQuizzesPorCliente.get(c.id) ?? 0,
  }));

  resultado.sort((a, b) => (b.ultimaVisitaFormacion ?? "").localeCompare(a.ultimaVisitaFormacion ?? ""));

  return NextResponse.json({ clientes: resultado });
}