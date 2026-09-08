import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVerifiedAdmin } from "@/lib/serverAuth";

export async function GET(request: Request) {
  const { user, error } = await getVerifiedAdmin(request as any);
  if (error || !user) return NextResponse.json({ error }, { status: 401 });

  const { data: clientes, error: clientesError } = await supabaseAdmin
    .from("profiles")
    .select("id, nombre, email")
    .eq("role", "user");

  if (clientesError) {
    return NextResponse.json({ error: clientesError.message }, { status: 500 });
  }

  const { data: extractos } = await supabaseAdmin
    .from("extractos_fiscales")
    .select("cliente_id, archivo_nombre, estado, verificacion, ejercicios_detectados, registros_detectados, created_at")
    .order("created_at", { ascending: false });

  const ultimoPorCliente = new Map<string, any>();
  for (const ext of extractos ?? []) {
    if (!ultimoPorCliente.has(ext.cliente_id)) ultimoPorCliente.set(ext.cliente_id, ext);
  }

  const resultado = (clientes ?? []).map((c) => ({
    clienteId: c.id,
    nombre: c.nombre,
    email: c.email,
    ultimoExtracto: ultimoPorCliente.get(c.id) ?? null,
  }));

  resultado.sort((a, b) => {
    const fa = a.ultimoExtracto?.created_at ?? "";
    const fb = b.ultimoExtracto?.created_at ?? "";
    return fb.localeCompare(fa);
  });

  return NextResponse.json({ clientes: resultado });
}