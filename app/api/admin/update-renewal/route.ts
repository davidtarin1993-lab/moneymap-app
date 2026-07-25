import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVerifiedAdmin } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  const { user, error } = await getVerifiedAdmin(request);

  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const body = await request.json();
  const id = body.id?.trim();
  const fechaRenovacion = body.fechaRenovacion; // puede venir vacío para borrarla

  if (!id) {
    return NextResponse.json({ error: "Falta el id del cliente." }, { status: 400 });
  }

  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({ fecha_renovacion: fechaRenovacion || null })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}