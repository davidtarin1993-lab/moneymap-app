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

function filtrarPorDiaHora<T extends { created_at: string }>(
  rows: T[],
  dia: number | null,
  hora: number | null
): T[] {
  if (dia === null && hora === null) return rows;
  return rows.filter((r) => {
    const fecha = new Date(r.created_at);
    if (dia !== null && fecha.getDay() !== dia) return false;
    if (hora !== null && fecha.getHours() !== hora) return false;
    return true;
  });
}

export async function GET(request: Request) {
  const { user, error } = await getVerifiedAdmin(request as any);
  if (error || !user) return NextResponse.json({ error }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const mesParam = searchParams.get("mes"); // formato "YYYY-MM", opcional
  const clienteIdParam = searchParams.get("clienteId"); // opcional, filtra a un cliente concreto
  const diaParam = searchParams.get("dia"); // opcional, "0".."6" (clic en el gráfico)
  const horaParam = searchParams.get("hora"); // opcional, "0".."23" (clic en el gráfico)

  const diaFiltro = diaParam !== null && diaParam !== "" ? Number(diaParam) : null;
  const horaFiltro = horaParam !== null && horaParam !== "" ? Number(horaParam) : null;

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

  let queryConexiones7d = supabaseAdmin
    .from("eventos_conexion")
    .select("cliente_id")
    .gte("created_at", hace7dias.toISOString());
  if (clienteIdParam) queryConexiones7d = queryConexiones7d.eq("cliente_id", clienteIdParam);
  const { data: conexiones7d } = await queryConexiones7d;

  let queryConexiones30d = supabaseAdmin
    .from("eventos_conexion")
    .select("cliente_id")
    .gte("created_at", hace30dias.toISOString());
  if (clienteIdParam) queryConexiones30d = queryConexiones30d.eq("cliente_id", clienteIdParam);
  const { data: conexiones30d } = await queryConexiones30d;

  let queryConexionesPeriodo = supabaseAdmin
    .from("eventos_conexion")
    .select("cliente_id, created_at")
    .gte("created_at", desde.toISOString())
    .lt("created_at", hasta.toISOString());
  if (clienteIdParam) queryConexionesPeriodo = queryConexionesPeriodo.eq("cliente_id", clienteIdParam);
  const { data: conexionesPeriodo } = await queryConexionesPeriodo;

  let queryPaginasPeriodo = supabaseAdmin
    .from("eventos_pagina")
    .select("cliente_id, seccion, created_at")
    .gte("created_at", desde.toISOString())
    .lt("created_at", hasta.toISOString());
  if (clienteIdParam) queryPaginasPeriodo = queryPaginasPeriodo.eq("cliente_id", clienteIdParam);
  const { data: paginasPeriodo } = await queryPaginasPeriodo;

  // Heatmap/línea: día de la semana (0=domingo) x hora — SIEMPRE sobre el total del
  // periodo + cliente seleccionado (sin aplicar el filtro de día/hora), para que el
  // gráfico siga mostrando toda la distribución y se pueda seguir seleccionando otro punto.
  const heatmap: Record<string, number> = {};
  for (const c of conexionesPeriodo ?? []) {
    const fecha = new Date(c.created_at);
    const clave = `${fecha.getDay()}-${fecha.getHours()}`;
    heatmap[clave] = (heatmap[clave] ?? 0) + 1;
  }

  // A partir de aquí, aplicamos el filtro de día/hora (si lo hay, viene de un clic
  // en el gráfico) para recalcular indicadores y visitas por sección.
  const conexionesFiltradas = filtrarPorDiaHora(conexionesPeriodo ?? [], diaFiltro, horaFiltro);
  const paginasFiltradas = filtrarPorDiaHora(paginasPeriodo ?? [], diaFiltro, horaFiltro);

  // Visitas por sección
  const visitasPorSeccion: Record<string, number> = {
    movimientos: 0, fiscalidad: 0, ruta: 0, pildoras: 0, noticias: 0, cartera: 0,
  };
  for (const p of paginasFiltradas) {
    if (visitasPorSeccion[p.seccion] !== undefined) visitasPorSeccion[p.seccion]++;
  }

  // Frecuencia media: conexiones del periodo (filtrado) / clientes distintos que se conectaron
  const clientesConConexion = new Set(conexionesFiltradas.map((c) => c.cliente_id));
  const frecuenciaMedia = clientesConConexion.size > 0
    ? conexionesFiltradas.length / clientesConConexion.size
    : 0;

  // Duración media de sesión: agrupamos conexiones + páginas por cliente
  const eventosPorCliente = new Map<string, string[]>();
  for (const c of conexionesFiltradas) {
    if (!eventosPorCliente.has(c.cliente_id)) eventosPorCliente.set(c.cliente_id, []);
    eventosPorCliente.get(c.cliente_id)!.push(c.created_at);
  }
  for (const p of paginasFiltradas) {
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

  // Cuando se filtra a un único cliente, "conexiones última semana/mes" como recuento
  // de clientes distintos deja de tener sentido (siempre sería 0 o 1) — mostramos el
  // número de conexiones de ese cliente en su lugar.
  const conexionesUltimaSemana = clienteIdParam
    ? (conexiones7d ?? []).length
    : new Set((conexiones7d ?? []).map((c) => c.cliente_id)).size;

  const conexionesUltimoMes = clienteIdParam
    ? (conexiones30d ?? []).length
    : new Set((conexiones30d ?? []).map((c) => c.cliente_id)).size;

  // Conexiones por cliente (para la tabla lateral) — respeta los mismos filtros
  // de periodo/cliente/día/hora que el resto de indicadores.
  const conteoConexionesPorCliente = new Map<string, number>();
  for (const c of conexionesFiltradas) {
    conteoConexionesPorCliente.set(c.cliente_id, (conteoConexionesPorCliente.get(c.cliente_id) ?? 0) + 1);
  }

  let queryPerfiles = supabaseAdmin
    .from("profiles")
    .select("id, nombre, email")
    .eq("role", "user");
  if (clienteIdParam) queryPerfiles = queryPerfiles.eq("id", clienteIdParam);
  const { data: perfiles } = await queryPerfiles;

  const conexionesPorCliente = (perfiles ?? [])
    .map((p) => ({
      clienteId: p.id as string,
      nombre: (p.nombre as string | null)?.trim() || (p.email as string),
      conexiones: conteoConexionesPorCliente.get(p.id as string) ?? 0,
    }))
    .sort((a, b) => b.conexiones - a.conexiones);

  return NextResponse.json({
    totalClientes: totalClientes ?? 0,
    conexionesUltimaSemana,
    conexionesUltimoMes,
    heatmap,
    visitasPorSeccion,
    conexionesPorCliente,
    frecuenciaMedia: Math.round(frecuenciaMedia * 10) / 10,
    duracionMediaMinutos: duracionMediaMinutos !== null ? Math.round(duracionMediaMinutos) : null,
    sesionesAnalizadas: todasLasDuraciones.length,
  });
}
