import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { fecha, hora, email, mensaje } = await request.json();

    if (!fecha || !hora || !email || !mensaje) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
    }

  if (!fecha || !hora || !email || !mensaje) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
    }

    console.log('DEBUG - to:', JSON.stringify(['davidtarin1993@gmail.com']));
    console.log('DEBUG - api key presente:', !!process.env.RESEND_API_KEY, process.env.RESEND_API_KEY?.slice(0, 6));

    const { data, error } = await resend.emails.send({
      from: 'MoneyMap <onboarding@resend.dev>', // cámbialo por tu dominio verificado en Resend cuando lo tengas
      to: ['davidtarin1993@gmail.com'],       // <-- pon aquí el email donde quieres recibir los avisos
      replyTo: email,
      subject: `Nueva solicitud de cita — ${fecha} a las ${hora}`,
      html: `
        <h2>Nueva solicitud de cita</h2>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <p><strong>Hora:</strong> ${hora}</p>
        <p><strong>Email del cliente:</strong> ${email}</p>
        <p><strong>Consulta:</strong></p>
        <p>${mensaje}</p>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: 'Error al enviar el email.' }, { status: 500 });
  }
}