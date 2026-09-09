import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface DatosJustificante {
  numero: string;
  concepto: string;
  importe: number;
  clienteNombre: string;
  fechaEmision: Date;
  validoHasta: Date;
  logoBytes: Uint8Array;
}

const formatoFecha = (fecha: Date) =>
  fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

export async function generarJustificantePDF({
  numero, concepto, importe, clienteNombre, fechaEmision, validoHasta, logoBytes,
}: DatosJustificante): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([420, 560]);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const logoImg = await pdfDoc.embedPng(logoBytes);

  const azul = rgb(0.043, 0.227, 0.431);
  const verde = rgb(0.122, 0.631, 0.529);
  const gris = rgb(0.42, 0.47, 0.52);
  const negro = rgb(0.1, 0.12, 0.15);
  const { width } = page.getSize();
  const marginX = 36;
  let y = 500;

  const logoDims = logoImg.scale(0.3);
  page.drawImage(logoImg, { x: marginX, y, width: logoDims.width, height: logoDims.height });
  y -= logoDims.height + 24;

  page.drawText('Justificante de Pago', { x: marginX, y, size: 20, font: fontBold, color: negro });
  y -= 30;

  const filaCampo = (label: string, valor: string) => {
    page.drawText(label, { x: marginX, y, size: 9, font: fontBold, color: gris });
    page.drawText(valor, { x: marginX + 160, y, size: 9, font: fontRegular, color: negro });
    y -= 18;
  };

  filaCampo('Emitido por', 'David Tarín — MoneyMap');
  y -= 8;
  filaCampo('Nº de referencia', numero);
  filaCampo('Fecha de emisión', formatoFecha(fechaEmision));
  filaCampo('Cliente', clienteNombre);
  filaCampo('Válido hasta', formatoFecha(validoHasta));

  y -= 10;
  page.drawLine({ start: { x: marginX, y }, end: { x: width - marginX, y }, thickness: 1, color: rgb(0.9, 0.92, 0.94) });
  y -= 24;

  page.drawText('Descripción del servicio:', { x: marginX, y, size: 9, font: fontBold, color: gris });
  page.drawText('Importe:', { x: width - marginX - 60, y, size: 9, font: fontBold, color: gris });
  y -= 18;

  page.drawText(concepto, { x: marginX, y, size: 10, font: fontRegular, color: negro });
  page.drawText(`${importe.toFixed(2)} €`, { x: width - marginX - 60, y, size: 10, font: fontRegular, color: negro });
  y -= 30;

  page.drawText(
    'Este documento es un justificante informativo del pago realizado.',
    { x: marginX, y, size: 8, font: fontRegular, color: gris }
  );
  y -= 12;
  page.drawText(
    'No tiene validez como factura fiscal ni incluye desglose de IVA.',
    { x: marginX, y, size: 8, font: fontRegular, color: gris }
  );
  y -= 30;

  page.drawRectangle({ x: marginX, y: y - 10, width: width - marginX * 2, height: 36, color: rgb(0.93, 0.98, 0.96) });
  page.drawText('Total pagado', { x: marginX + 10, y: y + 3, size: 10, font: fontBold, color: azul });
  page.drawText(`${importe.toFixed(2)} €`, { x: width - marginX - 70, y: y + 3, size: 12, font: fontBold, color: verde });

  return pdfDoc.save();
}

export function calcularValidoHasta(fechaBase: Date, tipo: 'mensual' | 'anual'): Date {
  const fecha = new Date(fechaBase);
  if (tipo === 'mensual') {
    fecha.setMonth(fecha.getMonth() + 1);
    fecha.setDate(fecha.getDate() + 2);
  } else {
    fecha.setFullYear(fecha.getFullYear() + 1);
    fecha.setDate(fecha.getDate() + 7);
  }
  return fecha;
}