import jsPDF from "jspdf";

interface MetricaPdf {
  etiqueta: string;
  valor: string;
}

interface SeccionPdf {
  titulo: string;
  contenido: string;
}

interface ConfigPdf {
  tituloDocumento: string;
  subtitulo: string;
  nombreCliente?: string;
  metricasDestacadas: MetricaPdf[];
  secciones: SeccionPdf[];
  nombreArchivo: string;
}

export function generarPdfResultado(config: ConfigPdf) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const anchoPagina = 210;
  let y = 48;

  // Cabecera de marca
  doc.setFillColor(11, 58, 110);
  doc.rect(0, 0, anchoPagina, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("MoneyMap", 15, 20);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Tu dinero, con dirección.", 15, 27);

  // Título
  doc.setTextColor(11, 58, 110);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(config.tituloDocumento, 15, y);
  y += 8;

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const subtituloLineas = doc.splitTextToSize(config.subtitulo, anchoPagina - 30);
  doc.text(subtituloLineas, 15, y);
  y += subtituloLineas.length * 5 + 8;

  if (config.nombreCliente) {
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Preparado para: ${config.nombreCliente}`, 15, y);
    y += 6;
  }
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, 15, y);
  y += 12;

  // Métricas destacadas
  if (config.metricasDestacadas.length > 0) {
    const gap = 5;
    const anchoCaja = (anchoPagina - 30 - (config.metricasDestacadas.length - 1) * gap) / config.metricasDestacadas.length;
    config.metricasDestacadas.forEach((m, i) => {
      const x = 15 + i * (anchoCaja + gap);
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(x, y, anchoCaja, 22, 2, 2, "F");
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.text(m.etiqueta.toUpperCase(), x + 3, y + 7);
      doc.setTextColor(11, 58, 110);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(m.valor, x + 3, y + 16);
      doc.setFont("helvetica", "normal");
    });
    y += 32;
  }

  // Secciones
  config.secciones.forEach((s) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(11, 58, 110);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(s.titulo, 15, y);
    y += 6;

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lineas = doc.splitTextToSize(s.contenido, anchoPagina - 30);
    doc.text(lineas, 15, y);
    y += lineas.length * 5 + 8;
  });

  // CTA final
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  doc.setFillColor(31, 161, 135);
  doc.roundedRect(15, y, anchoPagina - 30, 20, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("¿Quieres profundizar? Regístrate en MoneyMap", 20, y + 12);

  doc.save(config.nombreArchivo);
}