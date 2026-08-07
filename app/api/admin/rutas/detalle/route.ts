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

    const { data: rutas, error } = await supabaseAdmin
      .from("rutas_cliente")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "No se pudieron cargar las rutas." }, { status: 500 });
    }

    return NextResponse.json({ rutas: rutas ?? [] });
  } catch (err) {
    console.error("Error en /api/admin/rutas/detalle:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}