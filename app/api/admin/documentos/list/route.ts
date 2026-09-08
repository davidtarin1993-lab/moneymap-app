import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVerifiedAdmin } from "@/lib/serverAuth";

export async function GET(request: Request) {
  const { user, error } = await getVerifiedAdmin(request as any);
  if (error || !user) return NextResponse.json({ error }, { status: 401 });

  const { data, error: listError } = await supabaseAdmin
    .from("documentos_enviados")
    .select("*")
    .order("created_at", { ascending: false });

  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

  return NextResponse.json({ documentos: data ?? [] });
}