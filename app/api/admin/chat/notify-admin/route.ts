import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;

export async function POST(request: Request) {
  try {
    const { clienteNombre, clienteEmail, contenido } = await request.json();

    if (!contenido) {
      return NextResponse.json({ error: "Falta el contenido del mensaje." }, { status: 400 });
    }

    await resend.emails.send({
      from: "MoneyMap <onboarding@resend.dev>",
      to: ADMIN_EMAIL!,
      subject: `Nuevo mensaje de ${clienteNombre || "un cliente"} en el chat`,
      html: `
        <div style="font-family: sans-serif;">
          <h2>Nuevo mensaje en el chat de MoneyMap</h2>
          <p><strong>Cliente:</strong> ${clienteNombre || "Desconocido"} (${clienteEmail || "sin email"})</p>
          <p><strong>Mensaje:</strong></p>
          <p style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;">${contenido}</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/chat">Responder en el panel de administración</a></p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error enviando email de notificación:", err);
    return NextResponse.json({ error: "No se pudo enviar el email." }, { status: 500 });
  }
}