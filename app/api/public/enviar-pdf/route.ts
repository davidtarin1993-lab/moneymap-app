import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const TIPOS_VALIDOS = ["hipoteca", "quiz", "perfil_inversor", "proyeccion", "analizador_gastos"];

function esEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, nombre, tipoDocumento, asunto, pdfBase64, nombreArchivo } = body;

    if (!email || !esEmailValido(email)) {
      return NextResponse.json({ error: "Introduce un email válido." }, { status: 400 });
    }
    if (!TIPOS_VALIDOS.includes(tipoDocumento)) {
      return NextResponse.json({ error: "Tipo de documento no válido." }, { status: 400 });
    }
    if (!pdfBase64) {
      return NextResponse.json({ error: "Falta el documento a enviar." }, { status: 400 });
    }

    const destinatarioAdmin = process.env.ADMIN_NOTIFICATION_EMAIL;

    const { error: sendError } = await resend.emails.send({
      from: "MoneyMap <hola@moneymap.es>",
      replyTo: "hola.moneymap@gmail.com",
      to: [email],
      ...(destinatarioAdmin ? { bcc: [destinatarioAdmin] } : {}),
      subject: asunto || "Tu documento de MoneyMap",
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color:#334155;">
          <p>Hola${nombre ? ` ${nombre}` : ""},</p>
          <p>Aquí tienes tu documento adjunto en PDF.</p>
          <p style="color:#94a3b8;font-size:12px;">MoneyMap — Tu dinero, con dirección.</p>
        </div>
      `,
      attachments: [
        { filename: nombreArchivo || "documento-moneymap.pdf", content: pdfBase64 },
      ],
    });

    if (sendError) {
      console.error("Error al enviar PDF por email:", sendError);
      return NextResponse.json({ error: "No se pudo enviar el documento." }, { status: 500 });
    }

    const { error: insertError } = await supabaseAdmin.from("documentos_enviados").insert({
      email_destinatario: String(email).trim().toLowerCase(),
      nombre_destinatario: nombre?.trim() || null,
      tipo_documento: tipoDocumento,
      asunto: asunto || null,
    });

    if (insertError) {
      console.error("Error al registrar documento enviado:", insertError);
      // No devolvemos error al usuario: el email ya se envió correctamente,
      // el registro es solo para tu panel de admin.
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en /api/public/enviar-pdf:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}