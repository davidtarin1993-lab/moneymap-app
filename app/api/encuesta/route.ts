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
      const texto = Array.isArray(valor) ? valor.join(", ") : String(valor);
      if (!texto) return "";
      return `
        <tr>
          <td style="padding:6px 10px; font-weight:bold; color:#0B3A6E; white-space:nowrap; vertical-align:top;">${etiqueta}</td>
          <td style="padding:6px 10px; color:#334155;">${texto}</td>
        </tr>`;
    };

    const seccion = (titulo: string) => `
      <tr>
        <td colspan="2" style="padding:14px 10px 4px; font-weight:bold; color:#1FA187; text-transform:uppercase; font-size:11px; letter-spacing:0.05em; border-top:1px solid #e2e8f0;">${titulo}</td>
      </tr>`;

    const html = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color:#334155; max-width:600px;">
        <h2 style="color:#0B3A6E;">Nueva respuesta — Encuesta MoneyMap</h2>
        <table style="border-collapse:collapse; width:100%;">
          ${seccion("General")}
          ${fila("Perfil del encuestado", datos.perfil)}
          ${fila("Sensación general (1-5)", datos.sentimiento)}
          ${fila("Confianza en la herramienta (1-5)", datos.confianza)}
          ${fila("Área que más le interesa", datos.interesPrincipal)}

          ${seccion("Gastos y movimientos")}
          ${fila("Utilidad (1-5)", datos.utilidadMovimientos)}
          ${fila("Precisión de la clasificación automática", datos.precisionClasificacion)}
          ${fila("Qué echa en falta", datos.faltaGastos)}

          ${seccion("Fiscalidad")}
          ${fila("Utilidad (1-5)", datos.utilidadFiscalidad)}
          ${fila("¿Ayudó con la declaración?", datos.ayudaFiscal)}
          ${fila("Dudas fiscales que le gustaría cubrir", datos.dudasFiscales)}

          ${seccion("Ruta")}
          ${fila("Utilidad (1-5)", datos.utilidadRuta)}
          ${fila("¿La ruta se ajustaba a su situación?", datos.rutaAjustada)}
          ${fila("Qué cambiaría del proceso", datos.cambiariaRuta)}

          ${seccion("Academia")}
          ${fila("Utilidad (1-5)", datos.utilidadAcademia)}
          ${fila("Formato preferido", datos.formatoPreferido)}
          ${fila("Temas que le gustaría aprender", datos.temasAprender)}

          ${seccion("Apps y calculadoras")}
          ${fila("Utilidad (1-5)", datos.utilidadAplicaciones)}
          ${fila("Apps usadas", datos.appsUsadas)}
          ${fila("Fiabilidad de los resultados", datos.fiabilidadApps)}

          ${seccion("Cartera de inversión")}
          ${fila("Utilidad (1-5)", datos.utilidadCartera)}
          ${fila("¿Invertiría replicando la cartera?", datos.invertiriasCartera)}
          ${fila("Qué echa en falta", datos.faltaCartera)}

          ${seccion("Soporte")}
          ${fila("Utilidad (1-5)", datos.utilidadSoporte)}
          ${fila("Tiempo de respuesta", datos.tiempoRespuesta)}

          ${seccion("General (cont.)")}
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
