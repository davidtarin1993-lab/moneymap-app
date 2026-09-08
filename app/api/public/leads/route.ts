import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const ORIGENES_VALIDOS = ["quiz", "perfil_inversor", "hipoteca"];

function esEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, nombre, origen, resultadoResumen, utmSource, utmMedium, utmCampaign } = body;

    if (!email || !esEmailValido(email)) {
      return NextResponse.json({ error: "Introduce un email válido." }, { status: 400 });
    }
    if (!ORIGENES_VALIDOS.includes(origen)) {
      return NextResponse.json({ error: "Origen no válido." }, { status: 400 });
    }

    const { error: insertError } = await supabaseAdmin.from("leads_captados").insert({
      email: String(email).trim().toLowerCase(),
      nombre: nombre?.trim() || null,
      origen,
      resultado_resumen: resultadoResumen ?? null,
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
    });

    if (insertError) {
      console.error("Error al guardar lead:", insertError);
      return NextResponse.json({ error: "No se pudo guardar tu resultado." }, { status: 500 });
    }

    // Notificación interna, no bloqueante
    const destinatario = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (destinatario) {
      resend.emails.send({
        from: "MoneyMap <hola@moneymap.es>",
        replyTo: "hola.moneymap@gmail.com",
        to: [destinatario],
        subject: `Nuevo lead: ${origen}`,
        html: `<p><strong>Email:</strong> ${email}</p><p><strong>Origen:</strong> ${origen}</p><p><strong>Nombre:</strong> ${nombre || "—"}</p>`,
      }).catch((e) => console.error("Error notificando lead:", e));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en /api/public/leads:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}