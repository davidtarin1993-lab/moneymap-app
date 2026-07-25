import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface DatosFactura {
  numero: string;
  concepto: string;
  importe: number;
  codigoDescuento?: string;
  clienteNombre: string;
  fechaEmision: Date;
  validoHasta: Date;
  logoBytes: Uint8Array;
}

const formatoFecha = (fecha: Date) =>
  fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

export async function generarFacturaPDF({
  numero, concepto, importe, codigoDescuento, clienteNombre, fechaEmision, validoHasta, logoBytes,
}: DatosFactura): Promise<Uint8Array> {
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

  page.drawText('Factura Simplificada', { x: marginX, y, size: 20, font: fontBold, color: negro });
  y -= 30;

  const filaCampo = (label: string, valor: string) => {
    page.drawText(label, { x: marginX, y, size: 9, font: fontBold, color: gris });
    page.drawText(valor, { x: marginX + 160, y, size: 9, font: fontRegular, color: negro });
    y -= 18;
  };

  //filaCampo('Nombre de la empresa emisora', 'MoneyMap Fintech, S.L.');
  //filaCampo('CIF', 'TU-CIF-AQUI');           // <-- sustituye por tu CIF real
  //filaCampo('Dirección', 'TU DIRECCIÓN FISCAL AQUÍ'); // <-- sustituye por tu dirección real
  filaCampo('Emitida por', 'David Tarín');
  filaCampo('DNI', '21008942Y');
  
  y -= 8;
  filaCampo('Nº de factura', numero);
  filaCampo('Fecha de emisión', formatoFecha(fechaEmision));
  filaCampo('Cliente', clienteNombre);
  filaCampo('Válido hasta', formatoFecha(validoHasta));

  y -= 10;
  page.drawLine({ start: { x: marginX, y }, end: { x: width - marginX, y }, thickness: 1, color: rgb(0.9, 0.92, 0.94) });
  y -= 24;

  page.drawText('Descripción de la operación:', { x: marginX, y, size: 9, font: fontBold, color: gris });
  page.drawText('Precio:', { x: width - marginX - 60, y, size: 9, font: fontBold, color: gris });
  y -= 18;

  page.drawText(concepto, { x: marginX, y, size: 10, font: fontRegular, color: negro });
  page.drawText(`${importe.toFixed(2)} €`, { x: width - marginX - 60, y, size: 10, font: fontRegular, color: negro });
  y -= 24;

  if (codigoDescuento) {
    page.drawText(`Código de descuento aplicado: ${codigoDescuento}`, { x: marginX, y, size: 9, font: fontRegular, color: verde });
    y -= 24;
  }

  page.drawText('Tipo de IVA:', { x: marginX, y, size: 9, font: fontBold, color: gris });
  y -= 16;
  page.drawText('• 21% (incluido en el precio)', { x: marginX, y, size: 9, font: fontRegular, color: negro });
  y -= 30;

  page.drawRectangle({ x: marginX, y: y - 10, width: width - marginX * 2, height: 36, color: rgb(0.93, 0.98, 0.96) });
  page.drawText('Total factura (IVA incluido)', { x: marginX + 10, y: y + 3, size: 10, font: fontBold, color: azul });
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