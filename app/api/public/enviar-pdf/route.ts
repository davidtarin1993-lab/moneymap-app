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
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial, Helvetica, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                  <tr>
                    <td align="center" style="padding:32px 40px 20px 40px;border-bottom:3px solid #0B3A6E;">
                      <img src="https://www.moneymap.es/Multimedia/portada.png" alt="MoneyMap" width="180" style="display:block;margin:0 auto;" />
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px 40px 16px 40px;">
                      <h1 style="color:#0B3A6E;font-size:20px;margin:0 0 12px 0;">${nombre ? `Hola ${nombre},` : "Hola,"}</h1>
                      <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 16px 0;">
                        Aquí tienes tu documento en PDF tal como lo solicitaste — lo encontrarás adjunto a este correo.
                      </p>
                      <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 16px 0;">
                        Esto es solo una muestra de lo que MoneyMap puede hacer por ti: análisis automático de tus finanzas, optimización fiscal y una ruta personalizada junto a un asesor real.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:0 40px 32px 40px;">
                      <a href="https://www.moneymap.es" style="background-color:#1FA187;color:#ffffff;text-decoration:none;font-weight:bold;font-size:13px;padding:14px 28px;border-radius:10px;display:inline-block;">Descubrir MoneyMap</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 40px 32px 40px;border-top:1px solid #eef2f6;">
                      <p style="color:#0B3A6E;font-size:13px;font-weight:bold;margin:0 0 2px 0;">El equipo de MoneyMap</p>
                      <p style="color:#94a3b8;font-size:11px;margin:0;">Tu dinero, con dirección.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 40px 32px 40px;border-top:1px solid #eef2f6;">
                      <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 MoneyMap. Si tienes cualquier duda, responde a este correo y te ayudamos encantados.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
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