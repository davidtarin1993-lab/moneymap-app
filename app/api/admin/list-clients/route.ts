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
    .select("id, nombre, email, created_at, fecha_renovacion")
    .eq("role", "user")
    .order("created_at", { ascending: false });

  if (clientesError) {
    return NextResponse.json({ error: clientesError.message }, { status: 500 });
  }

  const { data: authUsersData, error: authError } =
    await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

  const mapaUltimaConexion = new Map<string, string | null>();
  const mapaSuspendido = new Map<string, boolean>();

  if (!authError && authUsersData?.users) {
    for (const u of authUsersData.users) {
      mapaUltimaConexion.set(u.id, u.last_sign_in_at ?? null);
      const bannedUntil = (u as any).banned_until;
      mapaSuspendido.set(u.id, !!bannedUntil && new Date(bannedUntil) > new Date());
    }
  }

  const clientes = (data ?? []).map((cliente) => ({
    ...cliente,
    last_sign_in_at: mapaUltimaConexion.get(cliente.id) ?? null,
    suspendido: mapaSuspendido.get(cliente.id) ?? false,
  }));

  return NextResponse.json({ clientes });
}