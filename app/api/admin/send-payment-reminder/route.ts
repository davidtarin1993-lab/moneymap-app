import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVerifiedAdmin } from "@/lib/serverAuth";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { user, error } = await getVerifiedAdmin(request);

  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const body = await request.json();
  const id = body.id?.trim();

  if (!id) {
    return NextResponse.json({ error: "Falta el id del cliente." }, { status: 400 });
  }

  const { data: perfil, error: perfilError } = await supabaseAdmin
    .from("profiles")
    .select("nombre, email")
    .eq("id", id)
    .single();

  if (perfilError || !perfil) {
    return NextResponse.json({ error: "No se ha encontrado el cliente." }, { status: 404 });
  }

  try {
    const logoPath = path.join(process.cwd(), "public", "Multimedia", "portada.png");
    const logoBuffer = fs.readFileSync(logoPath);

    const { error: sendError } = await resend.emails.send({
      from: "MoneyMap <onboarding@resend.dev>",
      to: [perfil.email],
      subject: "Recordatorio: tu suscripción a MoneyMap necesita renovarse",
      html: plantillaRecordatorio(perfil.nombre),
      attachments: [
        { filename: "logo.png", content: logoBuffer.toString("base64"), contentId: "logo-moneymap" },
      ],
    });

    if (sendError) {
      return NextResponse.json({ error: "No se pudo enviar el recordatorio." }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: "No se pudo enviar el recordatorio." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function plantillaRecordatorio(nombre: string) {
  return `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial, Helvetica, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="500" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">

              <tr>
                <td align="center" style="padding:32px 40px 16px 40px;">
                  <img src="cid:logo-moneymap" alt="MoneyMap" width="160" style="display:block;" />
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:0 40px 16px 40px;">
                  <h1 style="color:#0B3A6E;font-size:20px;margin:0 0 8px 0;">Hola ${nombre},</h1>
                  <p style="color:#64748b;font-size:14px;margin:0;">Tu suscripción a MoneyMap está pendiente de renovación.</p>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:8px 40px 32px 40px;">
                  <p style="color:#334155;font-size:13px;margin:0;">Para que no pierdas el acceso a tus herramientas, realiza el pago lo antes posible por transferencia o PayPal, como hiciste en tu alta.</p>
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