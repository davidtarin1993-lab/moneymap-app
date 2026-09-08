import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVerifiedAdmin } from "@/lib/serverAuth";

const UMBRAL_SESION_MINUTOS = 30;

function agruparEnSesiones(timestamps: string[]): number[] {
  if (timestamps.length === 0) return [];
  const ordenados = [...timestamps].sort();
  const duracionesMinutos: number[] = [];

  let inicioSesion = new Date(ordenados[0]).getTime();
  let ultimoEvento = inicioSesion;

  for (let i = 1; i < ordenados.length; i++) {
    const actual = new Date(ordenados[i]).getTime();
    const gapMinutos = (actual - ultimoEvento) / 60000;

    if (gapMinutos > UMBRAL_SESION_MINUTOS) {
      const duracion = (ultimoEvento - inicioSesion) / 60000;
      if (duracion > 0) duracionesMinutos.push(duracion);
      inicioSesion = actual;
    }

    ultimoEvento = actual;
  }

  const duracionFinal = (ultimoEvento - inicioSesion) / 60000;
  if (duracionFinal > 0) duracionesMinutos.push(duracionFinal);

  return duracionesMinutos;
}

export async function GET(request: Request) {
  const { user, error } = await getVerifiedAdmin(request as any);
  if (error || !user) return NextResponse.json({ error }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const mesParam = searchParams.get("mes"); // formato "YYYY-MM", opcional

  let desde: Date;
  let hasta: Date;

  if (mesParam) {
    const [anio, mes] = mesParam.split("-").map(Number);
    desde = new Date(Date.UTC(anio, mes - 1, 1));
    hasta = new Date(Date.UTC(anio, mes, 1));
  } else {
    hasta = new Date();
    desde = new Date();
    desde.setDate(desde.getDate() - 30);
  }

  const ahora = new Date();
  const hace7dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
  const hace30dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { count: totalClientes } = await supabaseAdmin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "user");

  const { data: conexiones7d } = await supabaseAdmin
    .from("eventos_conexion")
    .select("cliente_id")
    .gte("created_at", hace7dias.toISOString());

  const { data: conexiones30d } = await supabaseAdmin
    .from("eventos_conexion")
    .select("cliente_id")
    .gte("created_at", hace30dias.toISOString());

  const { data: conexionesPeriodo } = await supabaseAdmin
    .from("eventos_conexion")
    .select("cliente_id, created_at")
    .gte("created_at", desde.toISOString())
    .lt("created_at", hasta.toISOString());

  const { data: paginasPeriodo } = await supabaseAdmin
    .from("eventos_pagina")
    .select("cliente_id, seccion, created_at")
    .gte("created_at", desde.toISOString())
    .lt("created_at", hasta.toISOString());

  // Heatmap: día de la semana (0=domingo) x hora
  const heatmap: Record<string, number> = {};
  for (const c of conexionesPeriodo ?? []) {
    const fecha = new Date(c.created_at);
    const clave = `${fecha.getDay()}-${fecha.getHours()}`;
    heatmap[clave] = (heatmap[clave] ?? 0) + 1;
  }

  // Visitas por sección
  const visitasPorSeccion: Record<string, number> = {
    movimientos: 0, fiscalidad: 0, ruta: 0, pildoras: 0, noticias: 0, cartera: 0,
  };
  for (const p of paginasPeriodo ?? []) {
    if (visitasPorSeccion[p.seccion] !== undefined) visitasPorSeccion[p.seccion]++;
  }

  // Frecuencia media: conexiones del periodo / clientes distintos que se conectaron
  const clientesConConexion = new Set((conexionesPeriodo ?? []).map((c) => c.cliente_id));
  const frecuenciaMedia = clientesConConexion.size > 0
    ? (conexionesPeriodo?.length ?? 0) / clientesConConexion.size
    : 0;

  // Duración media de sesión: agrupamos conexiones + páginas por cliente
  const eventosPorCliente = new Map<string, string[]>();
  for (const c of conexionesPeriodo ?? []) {
    if (!eventosPorCliente.has(c.cliente_id)) eventosPorCliente.set(c.cliente_id, []);
    eventosPorCliente.get(c.cliente_id)!.push(c.created_at);
  }
  for (const p of paginasPeriodo ?? []) {
    if (!eventosPorCliente.has(p.cliente_id)) eventosPorCliente.set(p.cliente_id, []);
    eventosPorCliente.get(p.cliente_id)!.push(p.created_at);
  }

  const todasLasDuraciones: number[] = [];
  for (const timestamps of eventosPorCliente.values()) {
    todasLasDuraciones.push(...agruparEnSesiones(timestamps));
  }

  const duracionMediaMinutos = todasLasDuraciones.length > 0
    ? todasLasDuraciones.reduce((a, b) => a + b, 0) / todasLasDuraciones.length
    : null;

  return NextResponse.json({
    totalClientes: totalClientes ?? 0,
    conexionesUltimaSemana: new Set((conexiones7d ?? []).map((c) => c.cliente_id)).size,
    conexionesUltimoMes: new Set((conexiones30d ?? []).map((c) => c.cliente_id)).size,
    heatmap,
    visitasPorSeccion,
    frecuenciaMedia: Math.round(frecuenciaMedia * 10) / 10,
    duracionMediaMinutos: duracionMediaMinutos !== null ? Math.round(duracionMediaMinutos) : null,
    sesionesAnalizadas: todasLasDuraciones.length,
  });
}