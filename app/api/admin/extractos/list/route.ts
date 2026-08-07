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

    const { data: clientes, error: clientesError } = await supabaseAdmin
      .from("profiles")
      .select("id, nombre, email")
      .neq("role", "admin");

    if (clientesError) {
      return NextResponse.json({ error: "No se pudieron cargar los clientes." }, { status: 500 });
    }

    const { data: extractos } = await supabaseAdmin
      .from("extractos_bancarios")
      .select("cliente_id, archivo_nombre, estado, verificacion, movimientos_detectados_origen, movimientos_clasificados, created_at")
      .order("created_at", { ascending: false });

    const ultimoExtractoPorCliente = new Map<string, any>();
    for (const ext of extractos ?? []) {
      if (!ultimoExtractoPorCliente.has(ext.cliente_id)) {
        ultimoExtractoPorCliente.set(ext.cliente_id, ext);
      }
    }

    // Conteo de preguntas IA por cliente, separado por tipo de asistente
    const { data: mensajesIA } = await supabaseAdmin
      .from("analisis_ia_mensajes")
      .select("cliente_id, tipo")
      .eq("rol", "usuario");

    const conteoMovimientosPorCliente = new Map<string, number>();
    const conteoFiscalPorCliente = new Map<string, number>();

    for (const m of mensajesIA ?? []) {
      if (m.tipo === "fiscal") {
        conteoFiscalPorCliente.set(m.cliente_id, (conteoFiscalPorCliente.get(m.cliente_id) ?? 0) + 1);
      } else {
        conteoMovimientosPorCliente.set(m.cliente_id, (conteoMovimientosPorCliente.get(m.cliente_id) ?? 0) + 1);
      }
    }

    const resultado = (clientes ?? []).map((c) => ({
      clienteId: c.id,
      nombre: c.nombre,
      email: c.email,
      ultimoExtracto: ultimoExtractoPorCliente.get(c.id) ?? null,
      preguntasMovimientosUsadas: conteoMovimientosPorCliente.get(c.id) ?? 0,
      preguntasFiscalUsadas: conteoFiscalPorCliente.get(c.id) ?? 0,
    }));

    resultado.sort((a, b) => {
      const fechaA = a.ultimoExtracto?.created_at ?? "";
      const fechaB = b.ultimoExtracto?.created_at ?? "";
      return fechaB.localeCompare(fechaA);
    });

    return NextResponse.json({ clientes: resultado });
  } catch (err) {
    console.error("Error en /api/admin/extractos/list:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}