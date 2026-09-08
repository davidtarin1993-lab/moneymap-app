import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVerifiedAdmin } from "@/lib/serverAuth";

export async function GET(request: Request) {
  const { user, error } = await getVerifiedAdmin(request as any);
  if (error || !user) return NextResponse.json({ error }, { status: 401 });

  const { data: leads, error: leadsError } = await supabaseAdmin
    .from("leads_captados")
    .select("*")
    .order("created_at", { ascending: false });

  if (leadsError) return NextResponse.json({ error: leadsError.message }, { status: 500 });

  return NextResponse.json({ leads: leads ?? [] });
}