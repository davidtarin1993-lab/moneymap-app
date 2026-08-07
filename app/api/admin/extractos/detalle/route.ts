import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { data: perfilAdmin } = await supabaseAdmin
      .from("profiles").select("role").eq("id", user.id).single();

    if (!perfilAdmin || perfilAdmin.role !== "admin") {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get("clienteId");

    if (!clienteId) {
      return NextResponse.json({ error: "Falta el clienteId." }, { status: 400 });
    }

    const { data: extractos, error: extractosError } = await supabaseAdmin
      .from("extractos_bancarios")
      .select("id, archivo_nombre, archivo_path, archivo_tipo, estado, verificacion, movimientos_detectados_origen, movimientos_clasificados, clasificacion_completa, error_mensaje, created_at, procesado_at")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false });

    if (extractosError) {
      return NextResponse.json({ error: "No se pudieron cargar los extractos." }, { status: 500 });
    }

    const extractosConEnlace = await Promise.all(
      (extractos ?? []).map(async (ext) => {
        const { data: urlFirmada } = await supabaseAdmin.storage
          .from("extractos")
          .createSignedUrl(ext.archivo_path, 60 * 60 * 24);

        return { ...ext, urlDescarga: urlFirmada?.signedUrl ?? null };
      })
    );

    const { data: todosMensajesIA } = await supabaseAdmin
      .from("analisis_ia_mensajes")
      .select("rol, contenido, tipo, created_at")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: true });

    const mensajesIAMovimientos = (todosMensajesIA ?? []).filter((m) => m.tipo !== "fiscal");
    const mensajesIAFiscal = (todosMensajesIA ?? []).filter((m) => m.tipo === "fiscal");

    return NextResponse.json({
      extractos: extractosConEnlace,
      mensajesIAMovimientos,
      mensajesIAFiscal,
    });
  } catch (err) {
    console.error("Error en /api/admin/extractos/detalle:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}