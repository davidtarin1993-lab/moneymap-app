import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { nombre, email, mensaje } = await request.json();

    if (!nombre?.trim() || !email?.trim() || !mensaje?.trim()) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }

    const destinatario = process.env.ADMIN_NOTIFICATION_EMAIL;

    if (!destinatario) {
      console.error("Falta la variable de entorno ADMIN_NOTIFICATION_EMAIL.");
      return NextResponse.json({ error: "No se pudo enviar la consulta. Inténtalo más tarde." }, { status: 500 });
    }

    const { error } = await resend.emails.send({
      from: "MoneyMap <hola@moneymap.es>",
      to: [destinatario],
      replyTo: email,
      subject: `Nueva consulta de ${nombre} desde la web`,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color:#334155;">
          <h2 style="color:#0B3A6E;">Nueva consulta desde la landing</h2>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mensaje:</strong></p>
          <p style="white-space:pre-wrap;">${mensaje}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error enviando consulta:", error);
      return NextResponse.json({ error: "No se pudo enviar la consulta." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en /api/contacto:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}