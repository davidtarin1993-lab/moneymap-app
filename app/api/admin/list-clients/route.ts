import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVerifiedAdmin } from "@/lib/serverAuth";

export async function GET(request: NextRequest) {
  const { user, error } = await getVerifiedAdmin(request);

  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { data, error: clientesError } = await supabaseAdmin
    .from("profiles")
    .select("id, nombre, email, created_at, fecha_renovacion, ultima_conexion")
    .eq("role", "user")
    .order("created_at", { ascending: false });

  if (clientesError) {
    return NextResponse.json({ error: clientesError.message }, { status: 500 });
  }

  const { data: authUsersData, error: authError } =
    await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

  const mapaUltimaConexionAuth = new Map<string, string | null>();
  const mapaSuspendido = new Map<string, boolean>();

  if (!authError && authUsersData?.users) {
    for (const u of authUsersData.users) {
      mapaUltimaConexionAuth.set(u.id, u.last_sign_in_at ?? null);
      const bannedUntil = (u as any).banned_until;
      mapaSuspendido.set(u.id, !!bannedUntil && new Date(bannedUntil) > new Date());
    }
  }

  // Última interacción con Movimientos Bancarios (extractos + preguntas IA de movimientos)
  const { data: extractosBancarios } = await supabaseAdmin
    .from("extractos_bancarios")
    .select("cliente_id, created_at");

  const { data: mensajesMovimientos } = await supabaseAdmin
    .from("analisis_ia_mensajes")
    .select("cliente_id, created_at, tipo")
    .neq("tipo", "fiscal");

  const mapaUltimoMovimientos = new Map<string, string>();
  const actualizarMaximo = (mapa: Map<string, string>, clienteId: string, fecha: string) => {
    const actual = mapa.get(clienteId);
    if (!actual || fecha > actual) mapa.set(clienteId, fecha);
  };

  for (const e of extractosBancarios ?? []) actualizarMaximo(mapaUltimoMovimientos, e.cliente_id, e.created_at);
  for (const m of mensajesMovimientos ?? []) actualizarMaximo(mapaUltimoMovimientos, m.cliente_id, m.created_at);

  // Última interacción con Fiscalidad (extractos fiscales + preguntas IA fiscal)
  const { data: extractosFiscales } = await supabaseAdmin
    .from("extractos_fiscales")
    .select("cliente_id, created_at");

  const { data: mensajesFiscal } = await supabaseAdmin
    .from("analisis_ia_mensajes")
    .select("cliente_id, created_at, tipo")
    .eq("tipo", "fiscal");

  const mapaUltimoFiscal = new Map<string, string>();
  for (const e of extractosFiscales ?? []) actualizarMaximo(mapaUltimoFiscal, e.cliente_id, e.created_at);
  for (const m of mensajesFiscal ?? []) actualizarMaximo(mapaUltimoFiscal, m.cliente_id, m.created_at);

  // Flag de si tiene alguna Ruta creada
  const { data: rutas } = await supabaseAdmin
    .from("rutas_cliente")
    .select("cliente_id");

  const setConRuta = new Set((rutas ?? []).map((r) => r.cliente_id));

  const clientes = (data ?? []).map((cliente) => ({
    ...cliente,
    last_sign_in_at: cliente.ultima_conexion ?? mapaUltimaConexionAuth.get(cliente.id) ?? null,
    suspendido: mapaSuspendido.get(cliente.id) ?? false,
    ultimaInteraccionMovimientos: mapaUltimoMovimientos.get(cliente.id) ?? null,
    ultimaInteraccionFiscal: mapaUltimoFiscal.get(cliente.id) ?? null,
    tieneRuta: setConRuta.has(cliente.id),
  }));

  return NextResponse.json({ clientes });
}