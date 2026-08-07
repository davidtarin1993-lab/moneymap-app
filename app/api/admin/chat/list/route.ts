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

    const { data: mensajes, error: mensajesError } = await supabaseAdmin
      .from("chat_mensajes")
      .select("cliente_id, contenido, created_at")
      .order("created_at", { ascending: false });

    if (mensajesError) {
      return NextResponse.json({ error: "No se pudieron cargar las conversaciones." }, { status: 500 });
    }

    const porCliente = new Map<string, { ultimoMensaje: string; ultimaFecha: string }>();
    for (const m of mensajes ?? []) {
      if (!porCliente.has(m.cliente_id)) {
        porCliente.set(m.cliente_id, { ultimoMensaje: m.contenido, ultimaFecha: m.created_at });
      }
    }

    const clienteIds = Array.from(porCliente.keys());
    if (clienteIds.length === 0) return NextResponse.json({ conversaciones: [] });

    const { data: perfiles } = await supabaseAdmin
      .from("profiles").select("id, nombre, email").in("id", clienteIds);

    const conversaciones = clienteIds.map((id) => {
      const perfil = perfiles?.find((p) => p.id === id);
      const info = porCliente.get(id)!;
      return {
        clienteId: id,
        nombre: perfil?.nombre ?? "Cliente desconocido",
        email: perfil?.email ?? "",
        ultimoMensaje: info.ultimoMensaje,
        ultimaFecha: info.ultimaFecha,
      };
    });

    conversaciones.sort((a, b) => new Date(b.ultimaFecha).getTime() - new Date(a.ultimaFecha).getTime());

    return NextResponse.json({ conversaciones });
  } catch (err) {
    console.error("Error en /api/admin/chat/list:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}