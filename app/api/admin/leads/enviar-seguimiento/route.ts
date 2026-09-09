import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVerifiedAdmin } from "@/lib/serverAuth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { user, error } = await getVerifiedAdmin(request as any);
  if (error || !user) return NextResponse.json({ error }, { status: 401 });

  const { email, nombre } = await request.json();
  if (!email) return NextResponse.json({ error: "Falta el email." }, { status: 400 });

  const { error: sendError } = await resend.emails.send({
    from: "MoneyMap <hola@moneymap.es>",
    replyTo: "hola.moneymap@gmail.com",
    to: [email],
    subject: `${nombre ? `${nombre}, ` : ""}esto es lo que MoneyMap puede hacer por ti`,
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
                      Hace poco probaste una de nuestras herramientas gratuitas. Esto es solo una pequeña muestra de lo que MoneyMap hace por ti cada mes:
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px 16px 40px;">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:8px 0;color:#334155;font-size:13px;">✅ Análisis automatizado de tus gastos e ingresos, sin límite.</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#334155;font-size:13px;">✅ Estudio y optimización de tu estructura fiscal.</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#334155;font-size:13px;">✅ Una ruta financiera personalizada, trazada con un asesor real.</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#334155;font-size:13px;">✅ Formación continua y seguimiento de una cartera de inversión modelo de la comunidad MoneyMap.</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#334155;font-size:13px;">✅ Noticias relevantes y soporte cercano, siempre que lo necesites.</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:16px 40px 32px 40px;">
                    <a href="https://www.moneymap.es" style="background-color:#1FA187;color:#ffffff;text-decoration:none;font-weight:bold;font-size:13px;padding:14px 28px;border-radius:10px;display:inline-block;">Descubrir MoneyMap</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 40px 32px 40px;border-top:1px solid #eef2f6;">
                    <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 MoneyMap. Si prefieres no recibir más emails, responde a este correo y lo gestionamos.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `,
  });

  if (sendError) {
    console.error("Error al enviar seguimiento:", sendError);
    return NextResponse.json({ error: "No se pudo enviar el email." }, { status: 500 });
  }

  await supabaseAdmin.from("documentos_enviados").insert({
    email_destinatario: email,
    nombre_destinatario: nombre || null,
    tipo_documento: "quiz", // placeholder informativo; ver nota abajo
    asunto: "Email de seguimiento comercial",
  });

  return NextResponse.json({ ok: true });
}