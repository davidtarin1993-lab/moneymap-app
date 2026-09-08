import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVerifiedAdmin } from "@/lib/serverAuth";

export async function GET(request: Request) {
  const { user, error } = await getVerifiedAdmin(request as any);
  if (error || !user) return NextResponse.json({ error }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const clienteId = searchParams.get("clienteId");
  if (!clienteId) return NextResponse.json({ error: "Falta el clienteId." }, { status: 400 });

  const { data: extractos, error: extractosError } = await supabaseAdmin
    .from("extractos_fiscales")
    .select("id, archivo_nombre, archivo_path, estado, verificacion, ejercicios_detectados, registros_detectados, registros_completos, error_mensaje, created_at, procesado_at")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false });

  if (extractosError) {
    return NextResponse.json({ error: "No se pudieron cargar las declaraciones." }, { status: 500 });
  }

  const extractosConEnlace = await Promise.all(
    (extractos ?? []).map(async (ext) => {
      const { data: urlFirmada } = await supabaseAdmin.storage
        .from("extractos-fiscales")
        .createSignedUrl(ext.archivo_path, 60 * 60 * 24);
      return { ...ext, urlDescarga: urlFirmada?.signedUrl ?? null };
    })
  );

  return NextResponse.json({ extractos: extractosConEnlace });
}