import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVerifiedAdmin } from "@/lib/serverAuth";
import { Resend } from "resend";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getVerifiedAdmin(request);

    if (error || !user) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const body = await request.json();

    const nombre = body.nombre?.trim();
    const email = body.email?.trim();
    const fechaRenovacion = body.fechaRenovacion || null;
    const role = body.role === "admin" ? "admin" : "user";

    if (!nombre || !email) {
      return NextResponse.json(
        { error: "Nombre y email son obligatorios." },
        { status: 400 }
      );
    }

    const passwordTemporal = crypto.randomBytes(16).toString("hex");

    const { data: createdUser, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: passwordTemporal,
        email_confirm: true,
        user_metadata: { nombre, role },
      });

    if (createUserError || !createdUser.user) {
      console.error("Error al crear usuario en Supabase Auth:", createUserError);
      return NextResponse.json(
        { error: createUserError?.message || "No se ha podido crear el usuario." },
        { status: 500 }
      );
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: createdUser.user.id,
          email,
          nombre,
          role,
          fecha_renovacion: fechaRenovacion,
        },
        { onConflict: "id" }
      );

    if (profileError) {
      console.error("Error al guardar el perfil:", profileError);
      await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/restablecer-contrasena`,
        },
      });

    let avisoEmail: string | null = null;

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Error al generar el enlace de acceso:", linkError);
      avisoEmail = "El cliente se creó correctamente, pero no se pudo generar el enlace de acceso.";
    } else {
      try {
        const logoPath = path.join(process.cwd(), "public", "Multimedia", "portada.png");
        const logoBuffer = fs.readFileSync(logoPath);

        const { error: sendError } = await resend.emails.send({
          from: "MoneyMap <hola@moneymap.es>",
          replyTo: "hola.moneymap@gmail.com",
          to: [email],
          subject: "Tu acceso a MoneyMap ya está activo",
          html: plantillaAcceso(nombre, linkData.properties.action_link),
          attachments: [
            { filename: "logo.png", content: logoBuffer.toString("base64"), contentId: "logo-moneymap" },
          ],
        });

        if (sendError) {
          console.error("Error al enviar email de acceso (Resend):", sendError);
          avisoEmail = "El cliente se creó correctamente, pero el email de acceso no se pudo enviar.";
        }
      } catch (errEmail: any) {
        console.error("Excepción al preparar/enviar el email de acceso:", errEmail?.message || errEmail);
        avisoEmail = "El cliente se creó correctamente, pero el email de acceso no se pudo enviar.";
      }
    }

    return NextResponse.json({
      ok: true,
      avisoEmail,
      cliente: {
        id: createdUser.user.id,
        email,
        nombre,
        role,
        fecha_renovacion: fechaRenovacion,
      },
    });
  } catch (errGeneral: any) {
    console.error("Error inesperado en /api/admin/create-client:", errGeneral?.message || errGeneral, errGeneral?.stack);
    return NextResponse.json(
      { error: errGeneral?.message || "Error interno inesperado al dar de alta el cliente." },
      { status: 500 }
    );
  }
}

function plantillaAcceso(nombre: string, enlace: string) {
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
                  <h1 style="color:#0B3A6E;font-size:22px;margin:0 0 8px 0;">¡Ya tienes acceso, ${nombre}!</h1>
                  <p style="color:#64748b;font-size:14px;margin:0;">Hemos revisado tu pago y tus datos. Tu cuenta ya está activa.</p>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:8px 40px 24px 40px;">
                  <p style="color:#334155;font-size:13px;margin:0 0 20px 0;">Antes de entrar, crea tu contraseña personal pulsando el siguiente botón:</p>
                  <a href="${enlace}" style="background-color:#1FA187;color:#ffffff;text-decoration:none;font-weight:bold;font-size:13px;padding:14px 28px;border-radius:10px;display:inline-block;">Crear mi contraseña</a>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:0 40px 32px 40px;">
                  <p style="color:#94a3b8;font-size:11px;margin:0;">Si no reconoces esta solicitud, puedes ignorar este correo.</p>
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