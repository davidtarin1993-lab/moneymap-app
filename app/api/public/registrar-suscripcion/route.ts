import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function esEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { nombre, email, plan, subscriptionId } = await request.json();

    if (!nombre?.trim() || !email || !esEmailValido(email)) {
      return NextResponse.json({ error: "Faltan datos válidos (nombre y email)." }, { status: 400 });
    }
    if (plan !== "mensual" && plan !== "anual") {
      return NextResponse.json({ error: "Plan no válido." }, { status: 400 });
    }
    if (!subscriptionId) {
      return NextResponse.json({ error: "Falta el ID de suscripción de PayPal." }, { status: 400 });
    }

    const { error: insertError } = await supabaseAdmin.from("suscripciones_paypal").insert({
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      plan,
      subscription_id: subscriptionId,
    });

    if (insertError) {
      console.error("Error al guardar suscripción:", insertError);
      return NextResponse.json({ error: "No se pudo registrar la suscripción." }, { status: 500 });
    }

    const destinatario = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (destinatario) {
      resend.emails.send({
        from: "MoneyMap <hola@moneymap.es>",
        to: [destinatario],
        subject: `🎉 Nueva suscripción de pago — ${nombre}`,
        html: `
          <div style="font-family: Arial, sans-serif; font-size: 14px; color:#334155;">
            <h2 style="color:#0B3A6E;">Nueva suscripción confirmada en PayPal</h2>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Plan:</strong> ${plan === "mensual" ? "Mensual (8,99€)" : "Anual (99,99€)"}</p>
            <p><strong>ID de suscripción PayPal:</strong> ${subscriptionId}</p>
            <p style="color:#94a3b8;font-size:12px;margin-top:16px;">Ve a /admin y da de alta a este cliente manualmente con este email.</p>
          </div>
        `,
      }).catch((e) => console.error("Error notificando suscripción:", e));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en /api/public/registrar-suscripcion:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}