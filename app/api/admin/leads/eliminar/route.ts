import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVerifiedAdmin } from "@/lib/serverAuth";

export async function POST(request: Request) {
  const { user, error } = await getVerifiedAdmin(request as any);
  if (error || !user) return NextResponse.json({ error }, { status: 401 });

  const { leadId } = await request.json();
  if (!leadId) return NextResponse.json({ error: "Falta el leadId." }, { status: 400 });

  const { error: deleteError } = await supabaseAdmin
    .from("leads_captados")
    .delete()
    .eq("id", leadId);

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}