import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const DIAS_ENTRE_SOLICITUDES = 30;

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const [{ data: rutas }, { data: ultimaSolicitud }, { count: countMovimientos }, { count: countFiscal }] = await Promise.all([
      supabaseAdmin
        .from("rutas_cliente")
        .select("id, titulo, descripcion, importe_objetivo, importe_actual, proxima_accion, hitos, created_at")
        .eq("cliente_id", user.id)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("solicitudes_ruta")
        .select("created_at")
        .eq("cliente_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from("extractos_bancarios")
        .select("id", { count: "exact", head: true })
        .eq("cliente_id", user.id),
      supabaseAdmin
        .from("extractos_fiscales")
        .select("id", { count: "exact", head: true })
        .eq("cliente_id", user.id),
    ]);

    let puedeSolicitar = true;
    let proximaFechaDisponible: string | null = null;

    if (ultimaSolicitud?.created_at) {
      const fechaLimite = new Date(ultimaSolicitud.created_at);
      fechaLimite.setDate(fechaLimite.getDate() + DIAS_ENTRE_SOLICITUDES);

      if (fechaLimite > new Date()) {
        puedeSolicitar = false;
        proximaFechaDisponible = fechaLimite.toISOString();
      }
    }

    return NextResponse.json({
      rutas: rutas ?? [],
      puedeSolicitar,
      proximaFechaDisponible,
      documentacion: {
        movimientos: (countMovimientos ?? 0) > 0,
        fiscal: (countFiscal ?? 0) > 0,
      },
    });
  } catch (err) {
    console.error("Error en /api/dashboard/rutas/estado:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}