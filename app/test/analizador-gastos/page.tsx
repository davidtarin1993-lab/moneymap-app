"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Upload, TrendingUp, Mail, ArrowRight, CheckCircle2, FileDown } from "lucide-react";
import { useUtmParams } from "@/lib/useUtmParams";
import { generarPdfResultado } from "@/lib/generarPdfResultado";

interface Resultado {
  ingresosTotales: number;
  gastosTotales: number;
  ahorroNeto: number;
  tasaAhorro: number;
  topCategorias: { categoria: string; importe: number }[];
  movimientosAnalizados: number;
  limiteAplicado: number;
}

function AnalizadorContenido() {
  const { utmSource, utmMedium, utmCampaign } = useUtmParams();

  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleSubirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setSubiendo(true);
    setError(null);
    setResultado(null);

    try {
      const formData = new FormData();
      formData.append("archivo", archivo);

      const response = await fetch("/api/public/analizador-express/procesar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo procesar el archivo.");

      setResultado(data);
    } catch (err: any) {
      setError(err.message || "Error inesperado.");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  };

  const handleEnviarEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultado) return;
    setEnviando(true);

    try {
      const response = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          nombre,
          origen: "analizador_gastos",
          resultadoResumen: resultado,
          utmSource,
          utmMedium,
          utmCampaign,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setEmailEnviado(true);
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  const descargarPdf = () => {
    if (!resultado) return;
    generarPdfResultado({
      tituloDocumento: "Análisis Gratuito de Gastos",
      subtitulo: `Resumen de tus ${resultado.movimientosAnalizados} movimientos analizados (versión de prueba, máx. ${resultado.limiteAplicado}).`,
      nombreCliente: nombre || undefined,
      metricasDestacadas: [
        { etiqueta: "Ingresos", valor: `${resultado.ingresosTotales.toLocaleString("es-ES")}€` },
        { etiqueta: "Gastos", valor: `${resultado.gastosTotales.toLocaleString("es-ES")}€` },
        { etiqueta: "Ahorro", valor: `${resultado.ahorroNeto.toLocaleString("es-ES")}€` },
      ],
      secciones: [
        {
          titulo: "Tasa de ahorro",
          contenido: `Tu tasa de ahorro estimada es del ${resultado.tasaAhorro}%. ${
            resultado.tasaAhorro < 10
              ? "Está por debajo del 10-20% recomendado — hay margen de mejora."
              : "Está en un rango saludable, ¡sigue así!"
          }`,
        },
        {
          titulo: "En qué se va tu dinero",
          contenido: resultado.topCategorias
            .map((c, i) => `${i + 1}. ${c.categoria}: ${c.importe.toLocaleString("es-ES")}€`)
            .join("\n"),
        },
        {
          titulo: "Nota",
          contenido: "Este es un análisis gratuito y limitado. MoneyMap analiza automáticamente todos tus movimientos, clasifica gastos fijos vs. variables, y traza una ruta financiera personalizada junto a un asesor.",
        },
      ],
      nombreArchivo: "moneymap-analisis-gastos.pdf",
    });
  };

  return (
    <main className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 md:py-10 pb-16 antialiased">
      <div className="max-w-lg mx-auto w-full">
        <div className="flex justify-center mb-4">
          <Image src="/Multimedia/portada.png" alt="MoneyMap" width={160} height={46} className="object-contain" unoptimized />
        </div>

        <header className="border-b border-slate-100 pb-5 mb-5 text-center">
          <div className="flex items-center justify-center gap-3">
            <TrendingUp size={30} className="text-[#0B3A6E]" />
            <h1 className="text-2xl md:text-3xl font-black text-[#0B3A6E] tracking-tight">Analizador de Gastos</h1>
          </div>
          <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-md mx-auto font-medium leading-normal">
            Sube tu extracto bancario y descubre en 30 segundos en qué se va tu dinero. Gratis, sin registro, hasta 50 movimientos.
          </p>
        </header>

        {!resultado ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
            <div className="bg-[#0B3A6E]/10 p-4 rounded-2xl inline-flex mb-3">
              <Upload size={24} className="text-[#0B3A6E]" />
            </div>
            <p className="text-xs text-slate-500 font-medium mb-4">Excel (.xlsx, .xls) o PDF de tu banco</p>

            <label className={`inline-block text-center text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl cursor-pointer transition-all ${
              subiendo ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-[#0B3A6E] text-white hover:bg-[#11498a]"
            }`}>
              {subiendo ? "Analizando con IA..." : "Subir extracto"}
              <input type="file" accept=".xlsx,.xls,.pdf" onChange={handleSubirArchivo} disabled={subiendo} className="hidden" />
            </label>

            {error && <p className="text-red-500 text-[10px] font-bold mt-3">{error}</p>}

            <p className="text-[9px] text-slate-400 font-medium mt-4">
              🔒 No guardamos tu archivo. Se procesa y se descarta al instante.
            </p>
          </div>
        ) : !emailEnviado ? (
          <div className="space-y-5">
            <div className="bg-[#0B3A6E] rounded-3xl p-6 shadow-md relative overflow-hidden">
              <p className="text-[10px] font-black uppercase tracking-wider text-white/70 mb-3">Vista previa de tu análisis</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-white/10 rounded-xl p-2 text-center">
                  <p className="text-[8px] text-white/60 font-bold uppercase">Ingresos</p>
                  <p className="text-sm font-black text-white">{resultado.ingresosTotales.toLocaleString("es-ES")}€</p>
                </div>
                <div className="bg-white/10 rounded-xl p-2 text-center">
                  <p className="text-[8px] text-white/60 font-bold uppercase">Gastos</p>
                  <p className="text-sm font-black text-white">{resultado.gastosTotales.toLocaleString("es-ES")}€</p>
                </div>
                <div className="bg-white/10 rounded-xl p-2 text-center blur-sm select-none">
                  <p className="text-[8px] text-white/60 font-bold uppercase">Ahorro</p>
                  <p className="text-sm font-black text-white">{resultado.ahorroNeto.toLocaleString("es-ES")}€</p>
                </div>
              </div>
              <p className="text-[10px] text-white/60 font-medium text-center">Desbloquea el desglose completo abajo 👇</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-1.5 mb-2">
                <Mail size={14} className="text-[#0B3A6E]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0B3A6E]">Ver mi informe completo</h3>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mb-4">
                Déjanos tu email y te mostramos tu tasa de ahorro y tus 3 categorías de mayor gasto.
              </p>
              <form onSubmit={handleEnviarEmail} className="space-y-2.5">
                <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1FA187] font-medium" />
                <input type="email" required placeholder="Tu correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1FA187] font-medium" />
                <button type="submit" disabled={enviando}
                  className="w-full bg-[#1FA187] hover:bg-[#198771] disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all">
                  {enviando ? "Enviando..." : <>Ver mi informe <ArrowRight size={14} /></>}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-[#0B3A6E] rounded-3xl p-6 text-center shadow-md">
              <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Tu tasa de ahorro</p>
              <p className="text-4xl font-black text-white mt-1">{resultado.tasaAhorro}%</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                <p className="text-[8px] text-slate-400 font-bold uppercase">Ingresos</p>
                <p className="text-sm font-black text-slate-800">{resultado.ingresosTotales.toLocaleString("es-ES")}€</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                <p className="text-[8px] text-slate-400 font-bold uppercase">Gastos</p>
                <p className="text-sm font-black text-rose-600">{resultado.gastosTotales.toLocaleString("es-ES")}€</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                <p className="text-[8px] text-slate-400 font-bold uppercase">Ahorro</p>
                <p className="text-sm font-black text-[#1FA187]">{resultado.ahorroNeto.toLocaleString("es-ES")}€</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">Tus 3 categorías de mayor gasto</p>
              <div className="space-y-2">
                {resultado.topCategorias.map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
                    <span className="text-xs font-bold text-slate-700">{i + 1}. {c.categoria}</span>
                    <span className="text-xs font-black text-slate-800">{c.importe.toLocaleString("es-ES")}€</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={descargarPdf}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl p-3 text-xs font-black uppercase tracking-wider transition-all">
              <FileDown size={14} /> Descargar informe en PDF
            </button>

            <div className="bg-[#1FA187]/10 border border-[#1FA187]/30 rounded-2xl p-5 text-center">
              <CheckCircle2 size={20} className="text-[#1FA187] mx-auto mb-2" />
              <p className="text-sm font-black text-slate-800 mb-1">Esto es solo el 1%</p>
              <p className="text-[11px] text-slate-500 font-medium mb-3">
                MoneyMap clasifica automáticamente todos tus movimientos cada mes, sin límite, y traza contigo una ruta financiera real.
              </p>
              <Link href="/" className="inline-flex items-center gap-1.5 bg-[#0B3A6E] hover:bg-[#11498a] text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all">
                Conocer MoneyMap <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AnalizadorGastosPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen bg-white" />}>
      <AnalizadorContenido />
    </Suspense>
  );
}