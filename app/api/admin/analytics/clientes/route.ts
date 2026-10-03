import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVerifiedAdmin } from "@/lib/serverAuth";

// Lista ligera de clientes para el selector de la página de analítica.
// Guardar en: app/api/admin/analytics/clientes/route.ts
export async function GET(request: Request) {
  const { user, error } = await getVerifiedAdmin(request as any);
  if (error || !user) return NextResponse.json({ error }, { status: 401 });

  const { data, error: errorClientes } = await supabaseAdmin
    .from("profiles")
    .select("id, email, nombre")
    .eq("role", "user")
    .order("nombre", { ascending: true });

  if (errorClientes) {
    return NextResponse.json({ error: errorClientes.message }, { status: 500 });
  }

  return NextResponse.json({ clientes: data ?? [] });
}
