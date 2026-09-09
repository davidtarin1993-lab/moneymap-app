import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generarJustificantePDF, calcularValidoHasta } from './facturas';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, nombre, apellido, fechaNacimiento, plan } = await request.json();
    if (!email || !nombre || !apellido) {
      return NextResponse.json({ error: 'Faltan datos obligatorios.' }, { status: 400 });
    }
    const esAnual = plan === 'anual';
    const logoPath = path.join(process.cwd(), 'public', 'Multimedia', 'portada.png');
    const logoBuffer = fs.readFileSync(logoPath);

    const numeroBase = Date.now().toString().slice(-8);
    const ahora = new Date();
    const clienteNombre = `${nombre} ${apellido}`;

    const justificante = await generarJustificantePDF({
      numero: `MM-${numeroBase}-${esAnual ? 'A' : 'M'}`,
      concepto: esAnual ? 'Suscripción anual MoneyMap' : 'Suscripción mensual MoneyMap',
      importe: esAnual ? 99.99 : 8.99,
      clienteNombre,
      fechaEmision: ahora,
      validoHasta: calcularValidoHasta(ahora, esAnual ? 'anual' : 'mensual'),
      logoBytes: logoBuffer,
    });

    const { data, error } = await resend.emails.send({
      from: 'MoneyMap <hola@moneymap.es>',
      to: [email],
      subject: '¡Bienvenido a MoneyMap! No te vas a arrepentir 🎉',
      html: plantillaBienvenida({ nombre, apellido, fechaNacimiento, esAnual }),
      attachments: [
        { filename: `justificante-${esAnual ? 'anual' : 'mensual'}-moneymap.pdf`, content: Buffer.from(justificante).toString('base64') },
        { filename: 'logo.png', content: logoBuffer.toString('base64'), contentId: 'logo-moneymap' },
      ],
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: 'Error al enviar el email de bienvenida.' }, { status: 500 });
  }
}

function plantillaBienvenida({ nombre, apellido, fechaNacimiento, esAnual }: { nombre: string; apellido: string; fechaNacimiento: string; esAnual: boolean }) {
  const fechaNacFormateada = fechaNacimiento
    ? new Date(fechaNacimiento).toLocaleDateString('es-ES')
    : '—';

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
                  <img src="cid:logo-moneymap" alt="MoneyMap" width="180" style="display:block;" />
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:0 40px 24px 40px;">
                  <h1 style="color:#0B3A6E;font-size:24px;margin:0 0 8px 0;">¡Bienvenido a MoneyMap, ${nombre}!</h1>
                  <p style="color:#64748b;font-size:14px;margin:0;">Enhorabuena por dar el paso. No te vas a arrepentir.</p>
                </td>
              </tr>

              <tr>
                <td style="padding:0 40px 24px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <p style="color:#0B3A6E;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px 0;">Tus datos de registro</p>
                        <p style="color:#334155;font-size:13px;margin:0 0 4px 0;"><strong>Nombre:</strong> ${nombre} ${apellido}</p>
                        <p style="color:#334155;font-size:13px;margin:0;"><strong>Fecha de nacimiento:</strong> ${fechaNacFormateada}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 40px 24px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="padding:12px 0;border-bottom:1px solid #eef2f6;"><span style="color:#1FA187;font-weight:bold;">&#10003;</span><span style="color:#334155;font-size:14px;"> Análisis automatizado de tus gastos e ingresos.</span></td></tr>
                    <tr><td style="padding:12px 0;border-bottom:1px solid #eef2f6;"><span style="color:#1FA187;font-weight:bold;">&#10003;</span><span style="color:#334155;font-size:14px;"> Estudio y optimización de tu estructura fiscal.</span></td></tr>
                    <tr><td style="padding:12px 0;border-bottom:1px solid #eef2f6;"><span style="color:#1FA187;font-weight:bold;">&#10003;</span><span style="color:#334155;font-size:14px;"> Aprende de finanzas y mantente siempre actualizado.</span></td></tr>
                    <tr><td style="padding:12px 0;"><span style="color:#1FA187;font-weight:bold;">&#10003;</span><span style="color:#334155;font-size:14px;"> Sigue en tiempo real la cartera oficial de MoneyMap.</span></td></tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 40px 24px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
                    <tr>
                      <td style="padding:24px;">
                        <p style="color:#0B3A6E;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px 0;">Tu plan: ${esAnual ? 'Anual — 99,99€/año' : 'Mensual — 8,99€/mes'}</p>
                        <p style="color:#334155;font-size:13px;margin:0 0 16px 0;">Elige cómo prefieres pagar:</p>

                        <table cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td align="center" style="padding-bottom:16px;">
                              <a href="https://www.moneymap.es/pago" style="background-color:#1FA187;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:14px 28px;border-radius:10px;display:inline-block;">Suscribirme ahora con PayPal</a>
                            </td>
                          </tr>
                        </table>

                        <p style="color:#94a3b8;font-size:11px;margin:0 0 8px 0;">— o si prefieres transferencia bancaria —</p>
                        <p style="color:#334155;font-size:13px;margin:0 0 4px 0;"><strong>IBAN:</strong> ES0500810291210006602975</p>
                        <p style="color:#334155;font-size:13px;margin:0 0 4px 0;"><strong>Titular:</strong> David Tarín</p>
                        <p style="color:#334155;font-size:13px;margin:0 0 4px 0;"><strong>Concepto:</strong> MoneyMap - ${nombre}</p>
                        <p style="color:#334155;font-size:13px;margin:0;"><strong>Importe:</strong> ${esAnual ? '99,99€' : '8,99€'}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 40px 24px 40px;">
                  <p style="color:#64748b;font-size:12px;margin:0 0 12px 0;">Te adjuntamos un justificante de pago con los datos de tu suscripción — guárdalo para tu control personal.</p>
                  <p style="color:#64748b;font-size:12px;margin:0;">Si pagas por transferencia, escríbenos a <a href="mailto:hola.moneymap@gmail.com" style="color:#0B3A6E;">hola.moneymap@gmail.com</a> indicando tu nombre. En cuanto identifiquemos tu pago, te daremos de alta en la aplicación en <strong style="color:#0B3A6E;">menos de 24 horas</strong>.</p>
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