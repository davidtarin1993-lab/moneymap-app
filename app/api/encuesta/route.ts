import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Guardar en: app/api/encuesta/route.ts
export async function POST(request: Request) {
  try {
    const datos = await request.json();

    const destinatario = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (!destinatario) {
      console.error("Falta la variable de entorno ADMIN_NOTIFICATION_EMAIL.");
      return NextResponse.json({ error: "No se pudo enviar la encuesta. Inténtalo más tarde." }, { status: 500 });
    }

    const fila = (etiqueta: string, valor: unknown) => {
      if (valor === null || valor === undefined || valor === "") return "";
      return `
        <tr>
          <td style="padding:6px 10px; font-weight:bold; color:#0B3A6E; white-space:nowrap; vertical-align:top;">${etiqueta}</td>
          <td style="padding:6px 10px; color:#334155;">${String(valor)}</td>
        </tr>`;
    };

    const html = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color:#334155; max-width:600px;">
        <h2 style="color:#0B3A6E;">Nueva respuesta — Encuesta MoneyMap</h2>
        <table style="border-collapse:collapse; width:100%;">
          ${fila("Perfil del encuestado", datos.perfil)}
          ${fila("Sensación general (1-5)", datos.sentimiento)}
          ${fila("Confianza en la herramienta (1-5)", datos.confianza)}
          ${fila("Utilidad · Movimientos Bancarios", datos.utilidadMovimientos)}
          ${fila("Utilidad · Fiscalidad", datos.utilidadFiscalidad)}
          ${fila("Utilidad · Ruta", datos.utilidadRuta)}
          ${fila("Utilidad · Academia", datos.utilidadAcademia)}
          ${fila("Utilidad · Aplicaciones/Calculadoras", datos.utilidadAplicaciones)}
          ${fila("Utilidad · Cartera MoneyMap", datos.utilidadCartera)}
          ${fila("Utilidad · Soporte", datos.utilidadSoporte)}
          ${fila("Facilidad de uso (1-5)", datos.facilidadUso)}
          ${fila("Qué le resultó confuso", datos.queConfundio)}
          ${fila("Opinión sobre el precio", datos.opinionPrecio)}
          ${fila("¿Pagaría por MoneyMap?", datos.pagarias)}
          ${fila("Probabilidad de recomendarlo (0-10)", datos.nps)}
          ${fila("¿Debería seguir desarrollándose?", datos.futuro)}
          ${fila("Mejoras sugeridas", datos.mejoras)}
          ${fila("Email de contacto (opcional)", datos.emailContacto)}
        </table>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: "MoneyMap <hola@moneymap.es>",
      to: [destinatario],
      subject: "Nueva respuesta — Encuesta MoneyMap",
      html,
    });

    if (error) {
      console.error("Error enviando encuesta:", error);
      return NextResponse.json({ error: "No se pudo enviar la encuesta." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en /api/encuesta:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
