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
  const suspender = body.suspender === true;

  if (!id) {
    return NextResponse.json({ error: "Falta el id del cliente." }, { status: 400 });
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
    ban_duration: suspender ? "87600h" : "none",
  });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}