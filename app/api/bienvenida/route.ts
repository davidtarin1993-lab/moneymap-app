import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Falta el email.' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'MoneyMap <bienvenida@TU-DOMINIO.com>', // requiere dominio verificado en Resend
      to: [email],
      subject: '¡Bienvenido a MoneyMap! No te vas a arrepentir 🎉',
      html: plantillaBienvenida(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: 'Error al enviar el email de bienvenida.' }, { status: 500 });
  }
}

function plantillaBienvenida() {
  return `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial, Helvetica, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
              
              <tr>
                <td align="center" style="padding:32px 40px 16px 40px;">
                  <img src="https://TU-DOMINIO.com/Multimedia/portada.png" alt="MoneyMap" width="180" style="display:block;" />
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:0 40px 24px 40px;">
                  <h1 style="color:#0B3A6E;font-size:24px;margin:0 0 8px 0;">¡Bienvenido a MoneyMap!</h1>
                  <p style="color:#64748b;font-size:14px;margin:0;">Enhorabuena por dar el paso. No te vas a arrepentir.</p>
                </td>
              </tr>

              <tr>
                <td style="padding:0 40px 24px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:12px 0;border-bottom:1px solid #eef2f6;">
                        <span style="color:#1FA187;font-weight:bold;">&#10003;</span>
                        <span style="color:#334155;font-size:14px;"> Análisis automatizado de tus gastos e ingresos.</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:12px 0;border-bottom:1px solid #eef2f6;">
                        <span style="color:#1FA187;font-weight:bold;">&#10003;</span>
                        <span style="color:#334155;font-size:14px;"> Estudio y optimización de tu estructura fiscal.</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:12px 0;border-bottom:1px solid #eef2f6;">
                        <span style="color:#1FA187;font-weight:bold;">&#10003;</span>
                        <span style="color:#334155;font-size:14px;"> Aprende de finanzas y mantente siempre actualizado.</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:12px 0;">
                        <span style="color:#1FA187;font-weight:bold;">&#10003;</span>
                        <span style="color:#334155;font-size:14px;"> Sigue en tiempo real la cartera oficial de MoneyMap.</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 40px 32px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
                    <tr>
                      <td style="padding:24px;">
                        <p style="color:#0B3A6E;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px 0;">Formas de pago</p>
                        <p style="color:#334155;font-size:13px;margin:0 0 4px 0;"><strong>Transferencia (IBAN):</strong></p>
                        <p style="color:#0B3A6E;font-size:14px;font-family:monospace;margin:0 0 16px 0;">ES00 0000 0000 0000 0000 0000</p>
                        <p style="color:#334155;font-size:13px;margin:0 0 4px 0;"><strong>PayPal:</strong></p>
                        <p style="color:#0B3A6E;font-size:14px;margin:0;">paypal.me/TU-USUARIO</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:16px 40px 32px 40px;border-top:1px solid #eef2f6;">
                  <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 MoneyMap. Todos los derechos reservados.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}