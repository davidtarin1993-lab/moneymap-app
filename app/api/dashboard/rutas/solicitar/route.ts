import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const DIAS_ENTRE_SOLICITUDES = 30;

const ETIQUETAS_OBJETIVO: Record<string, string> = {
  ahorro: "Ahorro general",
  fondo_emergencia: "Fondo de emergencia",
  vivienda: "Compra de vivienda",
  inversion: "Inversión / hacer crecer mi dinero",
  jubilacion: "Jubilación / largo plazo",
  reducir_deuda: "Reducir deudas",
  otro: "Otro",
};

const ETIQUETAS_HORIZONTE: Record<string, string> = {
  "6": "6 meses",
  "12": "1 año",
  "24": "2 años",
  "36": "3 años",
  "60": "5 años",
  "120": "10 años o más",
};

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const body = await request.json();
    const {
      tipoObjetivo,
      objetivoDescripcion,
      saldoActual,
      importeObjetivo,
      horizonteMeses,
      ingresosMensualesAprox,
      notasAdicionales,
    } = body;

    if (!tipoObjetivo || !objetivoDescripcion?.trim()) {
      return NextResponse.json({ error: "Falta el tipo de objetivo y su descripción." }, { status: 400 });
    }

    const { data: ultimaSolicitud } = await supabaseAdmin
      .from("solicitudes_ruta")
      .select("created_at")
      .eq("cliente_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (ultimaSolicitud?.created_at) {
      const fechaLimite = new Date(ultimaSolicitud.created_at);
      fechaLimite.setDate(fechaLimite.getDate() + DIAS_ENTRE_SOLICITUDES);
      if (fechaLimite > new Date()) {
        return NextResponse.json(
          { error: `Ya has solicitado una ruta recientemente. Podrás pedir otra a partir del ${fechaLimite.toLocaleDateString("es-ES")}.` },
          { status: 429 }
        );
      }
    }

    const { data: perfil } = await supabaseAdmin
      .from("profiles")
      .select("nombre, email")
      .eq("id", user.id)
      .single();

    const { error: insertError } = await supabaseAdmin.from("solicitudes_ruta").insert({
      cliente_id: user.id,
      tipo_objetivo: tipoObjetivo,
      objetivo_descripcion: objetivoDescripcion,
      saldo_actual: saldoActual ? Number(saldoActual) : null,
      importe_objetivo: importeObjetivo ? Number(importeObjetivo) : null,
      horizonte_meses: horizonteMeses ? Number(horizonteMeses) : null,
      ingresos_mensuales_aprox: ingresosMensualesAprox ? Number(ingresosMensualesAprox) : null,
      notas_adicionales: notasAdicionales || null,
      estado: "pendiente",
    });

    if (insertError) {
      console.error("Error al guardar solicitud de ruta:", insertError);
      return NextResponse.json({ error: "No se pudo registrar la solicitud." }, { status: 500 });
    }

    await supabaseAdmin.from("profiles").update({ ruta_solicitada: true }).eq("id", user.id);

    const destinatario = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (destinatario) {
      try {
        await resend.emails.send({
          from: "MoneyMap <hola@moneymap.es>",
          replyTo: "hola.moneymap@gmail.com",
          to: [destinatario],
          subject: `Nueva solicitud de ruta — ${perfil?.nombre ?? "Cliente"}`,
          html: `
            <div style="font-family: Arial, sans-serif; font-size: 14px; color:#334155;">
              <h2 style="color:#0B3A6E;">Nueva solicitud de ruta financiera</h2>
              <p><strong>Cliente:</strong> ${perfil?.nombre ?? "—"} (${perfil?.email ?? "—"})</p>
              <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
              <p><strong>Tipo de objetivo:</strong> ${ETIQUETAS_OBJETIVO[tipoObjetivo] ?? tipoObjetivo}</p>
              <p><strong>Descripción:</strong><br/>${String(objetivoDescripcion).replace(/\n/g, "<br/>")}</p>
              <p><strong>Saldo actual:</strong> ${saldoActual ? `${Number(saldoActual).toLocaleString("es-ES")}€` : "No indicado"}</p>
              <p><strong>Importe objetivo:</strong> ${importeObjetivo ? `${Number(importeObjetivo).toLocaleString("es-ES")}€` : "No indicado"}</p>
              <p><strong>Horizonte temporal:</strong> ${horizonteMeses ? (ETIQUETAS_HORIZONTE[String(horizonteMeses)] ?? `${horizonteMeses} meses`) : "No indicado"}</p>
              <p><strong>Ingresos mensuales aprox.:</strong> ${ingresosMensualesAprox ? `${Number(ingresosMensualesAprox).toLocaleString("es-ES")}€` : "No indicado"}</p>
              ${notasAdicionales ? `<p><strong>Notas adicionales:</strong><br/>${String(notasAdicionales).replace(/\n/g, "<br/>")}</p>` : ""}
              <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
              <p style="color:#94a3b8;font-size:12px;">Revisa la documentación del cliente en el panel de admin antes de trazar la ruta.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Error enviando email de solicitud de ruta:", emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en /api/dashboard/rutas/solicitar:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}