import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
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

    const body = await request.json();
    const {
      clienteId,
      titulo,
      descripcion,
      importeObjetivo,
      importeActual,
      proximaAccion,
      hitosTexto,
    } = body;

    if (!clienteId || !titulo) {
      return NextResponse.json({ error: "Faltan campos obligatorios (cliente y título)." }, { status: 400 });
    }

    // Convertimos el texto de hitos (una línea por hito) en el JSON esperado.
    // Prefijo "[x]" al inicio de la línea = hito completado; si no, pendiente.
    const hitos = String(hitosTexto ?? "")
      .split("\n")
      .map((linea: string) => linea.trim())
      .filter((linea: string) => linea.length > 0)
      .map((linea: string) => {
        const hecho = linea.toLowerCase().startsWith("[x]");
        const texto = linea.replace(/^\[x\]|\[\s?\]/i, "").trim();
        return { texto, hecho };
      });

    const { error: insertError } = await supabaseAdmin
      .from("rutas_cliente")
      .insert({
        cliente_id: clienteId,
        titulo,
        descripcion: descripcion || null,
        importe_objetivo: importeObjetivo ? Number(importeObjetivo) : null,
        importe_actual: importeActual ? Number(importeActual) : null,
        proxima_accion: proximaAccion || null,
        hitos,
      });

    if (insertError) {
      console.error("Error al insertar ruta:", insertError);
      return NextResponse.json({ error: "No se pudo crear la ruta." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en /api/admin/rutas/crear:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}