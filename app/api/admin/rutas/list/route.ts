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

    const { data: rutas } = await supabaseAdmin
      .from("rutas_cliente")
      .select("cliente_id, titulo, created_at")
      .order("created_at", { ascending: false });

    const conteoPorCliente = new Map<string, number>();
    const ultimaPorCliente = new Map<string, { titulo: string; created_at: string }>();

    for (const r of rutas ?? []) {
      conteoPorCliente.set(r.cliente_id, (conteoPorCliente.get(r.cliente_id) ?? 0) + 1);
      if (!ultimaPorCliente.has(r.cliente_id)) {
        ultimaPorCliente.set(r.cliente_id, { titulo: r.titulo, created_at: r.created_at });
      }
    }

    const resultado = (clientes ?? []).map((c) => ({
      clienteId: c.id,
      nombre: c.nombre,
      email: c.email,
      numRutas: conteoPorCliente.get(c.id) ?? 0,
      ultimaRuta: ultimaPorCliente.get(c.id) ?? null,
    }));

    resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));

    return NextResponse.json({ clientes: resultado });
  } catch (err) {
    console.error("Error en /api/admin/rutas/list:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}