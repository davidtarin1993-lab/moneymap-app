import jsPDF from "jspdf";

interface MetricaPdf {
  etiqueta: string;
  valor: string;
}

interface SeccionPdf {
  titulo: string;
  contenido: string;
}

interface SegmentoGrafico {
  etiqueta: string;
  valor: number;
  color: string;
}

interface ConfigPdf {
  tituloDocumento: string;
  subtitulo: string;
  nombreCliente?: string;
  emailCliente?: string;
  metricasDestacadas: MetricaPdf[];
  graficoDistribucion?: SegmentoGrafico[];
  tituloGrafico?: string;
  secciones: SeccionPdf[];
  nombreArchivo: string;
}

async function cargarImagenBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function dibujarLogoVectorial(doc: jsPDF) {
  const cx = 21;
  const cy = 17;

  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy, 7, "F");

  doc.setFillColor(31, 161, 135);
  doc.rect(cx - 3.5, cy + 1, 1.6, 3.5, "F");
  doc.rect(cx - 1, cy - 1.5, 1.6, 6, "F");
  doc.rect(cx + 1.5, cy - 4, 1.6, 8.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("MoneyMap", 32, 20);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Tu dinero, con dirección.", 32, 27);
}

function dibujarGraficoDistribucion(doc: jsPDF, segmentos: SegmentoGrafico[], titulo: string, yInicial: number): number {
  const anchoPagina = 210;
  const anchoBarra = anchoPagina - 30;
  let y = yInicial;

  doc.setTextColor(11, 58, 110);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, 15, y);
  y += 6;

  const total = segmentos.reduce((sum, s) => sum + s.valor, 0) || 1;

  let xCursor = 15;
  const alturaBarra = 8;
  segmentos.forEach((seg) => {
    const anchoSegmento = (seg.valor / total) * anchoBarra;
    const [r, g, b] = hexARgb(seg.color);
    doc.setFillColor(r, g, b);
    doc.rect(xCursor, y, Math.max(anchoSegmento, 0), alturaBarra, "F");
    xCursor += anchoSegmento;
  });
  y += alturaBarra + 6;

  segmentos.forEach((seg) => {
    const [r, g, b] = hexARgb(seg.color);
    doc.setFillColor(r, g, b);
    doc.circle(17, y - 1.3, 1.5, "F");
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const pct = Math.round((seg.valor / total) * 100);
    doc.text(`${seg.etiqueta}: ${seg.valor.toLocaleString("es-ES", { maximumFractionDigits: 0 })}€ (${pct}%)`, 21, y);
    y += 6;
  });

  return y + 4;
}

function hexARgb(hex: string): [number, number, number] {
  const limpio = hex.replace("#", "");
  const r = parseInt(limpio.substring(0, 2), 16);
  const g = parseInt(limpio.substring(2, 4), 16);
  const b = parseInt(limpio.substring(4, 6), 16);
  return [r, g, b];
}

async function construirDocumento(config: ConfigPdf): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const anchoPagina = 210;
  let y = 48;

  doc.setFillColor(11, 58, 110);
  doc.rect(0, 0, anchoPagina, 35, "F");

  const logoDataUrl = await cargarImagenBase64(
    typeof window !== "undefined" ? `${window.location.origin}/Multimedia/portada.png` : "/Multimedia/portada.png"
  );

  if (logoDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(12, 6, 62, 23, 3, 3, "F");
    try {
      doc.addImage(logoDataUrl, "PNG", 16, 10, 54, 15.75);
    } catch {
      dibujarLogoVectorial(doc);
    }
  } else {
    dibujarLogoVectorial(doc);
  }

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
  if (config.emailCliente) {
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Email: ${config.emailCliente}`, 15, y);
    y += 6;
  }
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, 15, y);
  y += 12;

  if (config.metricasDestacadas.length > 0) {
    const gap = 5;
    const anchoCaja = (anchoPagina - 30 - (config.metricasDestacadas.length - 1) * gap) / config.metricasDestacadas.length;
    config.metricasDestacadas.forEach((m, i) => {
      const x = 15 + i * (anchoCaja + gap);
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(x, y, anchoCaja, 22, 2, 2, "F");
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      const etiquetaLineas = doc.splitTextToSize(m.etiqueta.toUpperCase(), anchoCaja - 4);
      doc.text(etiquetaLineas, x + 3, y + 7);
      doc.setTextColor(11, 58, 110);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(m.valor, x + 3, y + 17);
      doc.setFont("helvetica", "normal");
    });
    y += 32;
  }

  if (config.graficoDistribucion && config.graficoDistribucion.length > 0) {
    if (y > 230) {
      doc.addPage();
      y = 20;
    }
    y = dibujarGraficoDistribucion(doc, config.graficoDistribucion, config.tituloGrafico || "Distribución", y);
  }

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

  return doc;
}

export async function generarPdfResultado(config: ConfigPdf) {
  const doc = await construirDocumento(config);
  doc.save(config.nombreArchivo);
}

export async function generarPdfBase64(config: ConfigPdf): Promise<string> {
  const doc = await construirDocumento(config);
  const datauri = doc.output("datauristring");
  return datauri.split(",")[1];
}