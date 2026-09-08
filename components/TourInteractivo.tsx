"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Sparkles,
  BarChart3,
  Scale,
  MapPinned,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Newspaper,
  LineChart,
  Info,
  Pill,
  FileSpreadsheet,
  LifeBuoy,
  FileText,
} from "lucide-react";

interface Paso {
  icono: React.ReactNode;
  titulo: string;
  descripcion: string;
  colorAccento: string;
  mockup: React.ReactNode;
}

export default function TourInteractivo() {
  const [pasoActivo, setPasoActivo] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const intervaloRef = useRef<NodeJS.Timeout | null>(null);

  const pasos: Paso[] = [
    {
      icono: <Upload size={20} />,
      titulo: "Sube tu extracto bancario",
      descripcion: "Sube tu extracto en Excel o PDF tal cual lo descargas del banco, sin tener que ordenarlo ni tratarlo antes.",
      colorAccento: "#0B3A6E",
      mockup: (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-3 shadow-sm">
          <div className="bg-[#0B3A6E]/10 p-3 rounded-xl">
            <Upload size={22} className="text-[#0B3A6E]" />
          </div>
          <div className="flex-1">
            <div className="h-2.5 w-32 bg-slate-200 rounded-full mb-2" />
            <div className="h-2.5 w-20 bg-slate-100 rounded-full" />
          </div>
          <div className="text-[10px] font-black uppercase bg-[#0B3A6E] text-white px-3 py-2 rounded-lg">
            Subir
          </div>
        </div>
      ),
    },
    {
      icono: <Sparkles size={20} />,
      titulo: "La IA lo clasifica todo",
      descripcion: "Cada movimiento se clasifica automáticamente por categoría, naturaleza (fijo/variable) y nivel de necesidad, en segundos.",
      colorAccento: "#1FA187",
      mockup: (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2.5 shadow-sm">
          {[
            { label: "Supermercado", color: "bg-emerald-100 text-emerald-700" },
            { label: "Alquiler", color: "bg-blue-100 text-blue-700" },
            { label: "Suscripciones", color: "bg-amber-100 text-amber-700" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-2.5 w-24 bg-slate-100 rounded-full" />
              <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${item.color}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      icono: <BarChart3 size={20} />,
      titulo: "Dashboard de ingresos y gastos",
      descripcion: "Visualiza tu tasa de ahorro, tus gastos fijos vs. variables, y detecta desvíos con gráficos claros y accionables.",
      colorAccento: "#0B3A6E",
      mockup: (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-end gap-2 h-20">
            {[40, 65, 50, 80, 60, 90].map((alto, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-[#0B3A6E] to-[#1FA187] rounded-t-md"
                style={{ height: `${alto}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[9px] text-slate-400 font-bold">
            <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span>
          </div>
        </div>
      ),
    },
    {
      icono: <FileText size={20} />,
      titulo: "Sube tu declaración de la renta",
      descripcion: "Sube tu declaración en PDF y deja que la IA extraiga automáticamente todas las métricas clave, ejercicio a ejercicio.",
      colorAccento: "#B45309",
      mockup: (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-3 shadow-sm">
          <div className="bg-amber-500/10 p-3 rounded-xl">
            <FileText size={22} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="h-2.5 w-32 bg-slate-200 rounded-full mb-2" />
            <div className="h-2.5 w-20 bg-slate-100 rounded-full" />
          </div>
          <div className="text-[10px] font-black uppercase bg-amber-500 text-white px-3 py-2 rounded-lg">
            Subir
          </div>
        </div>
      ),
    },
    {
      icono: <FileSpreadsheet size={20} />,
      titulo: "Dashboard de Fiscalidad",
      descripcion: "Visualiza tu evolución fiscal por ejercicio: ingresos, retenciones y resultado, todo en un mismo panel.",
      colorAccento: "#B45309",
      mockup: (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2.5">
          {[
            { label: "2023", valor: "68%" },
            { label: "2024", valor: "74%" },
            { label: "2025", valor: "81%" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="text-[9px] font-black text-slate-400 uppercase w-8 shrink-0">{item.label}</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: item.valor }} />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      icono: <Scale size={20} />,
      titulo: "Especialista fiscal IA",
      descripcion: "Recibe recomendaciones de optimización fiscal con tu propio especialista IA disponible cada día.",
      colorAccento: "#B45309",
      mockup: (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2.5">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
            <div className="h-2.5 w-full bg-amber-200/60 rounded-full mb-2" />
            <div className="h-2.5 w-3/4 bg-amber-200/60 rounded-full" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-700 uppercase">
            <Sparkles size={12} /> 3 consultas al día incluidas
          </div>
        </div>
      ),
    },
    {
      icono: <MapPinned size={20} />,
      titulo: "Solicita tu ruta personalizada",
      descripcion: "Será preparada por un asesor en el menor tiempo posible. Antes, deberás compartir tus movimientos bancarios, fiscalidad y saldos.",
      colorAccento: "#059669",
      mockup: (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-black text-slate-500 uppercase">Progreso</span>
            <span className="text-[#1FA187] font-black text-base">60%</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full w-3/5 bg-[#1FA187] rounded-full" />
          </div>
          <div className="mt-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#1FA187]" />
              <div className="h-2 w-28 bg-slate-100 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#1FA187]" />
              <div className="h-2 w-20 bg-slate-100 rounded-full" />
            </div>
          </div>
        </div>
      ),
    },
    {
      icono: <Pill size={20} />,
      titulo: "Píldoras educativas",
      descripcion: "Lecciones express de 3 minutos con conceptos financieros y macroeconómicos clave, para aprender sin complicarte.",
      colorAccento: "#7C3AED",
      mockup: (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="bg-violet-100 text-violet-700 rounded-lg p-1.5 shrink-0">
                <Pill size={13} />
              </div>
              <div className="flex-1">
                <div className="h-2 w-full bg-slate-100 rounded-full mb-1" />
                <div className="h-1.5 w-1/2 bg-slate-100 rounded-full" />
              </div>
              <span className="text-[8px] font-black text-violet-600 uppercase shrink-0">3 min</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      icono: <Newspaper size={20} />,
      titulo: "Noticias financieras",
      descripcion: "Análisis diario del mercado global explicado de forma sencilla y directa, sin jerga innecesaria.",
      colorAccento: "#2563EB",
      mockup: (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase">
            <Newspaper size={13} /> Hoy
          </div>
          <div className="h-2.5 w-full bg-slate-200 rounded-full" />
          <div className="h-2.5 w-4/5 bg-slate-200 rounded-full" />
          <div className="h-2.5 w-2/3 bg-slate-100 rounded-full" />
        </div>
      ),
    },
    {
      icono: <LineChart size={20} />,
      titulo: "Cartera de Inversión MoneyMap",
      descripcion: "Sigue en tiempo real el comportamiento de carteras modelo con fines puramente educativos.",
      colorAccento: "#0891B2",
      mockup: (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <svg viewBox="0 0 200 50" className="w-full h-12">
            <path
              d="M 0 40 L 30 32 L 60 36 L 90 20 L 120 24 L 150 10 L 180 14 L 200 4"
              fill="none"
              stroke="#0891B2"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <div className="flex items-start gap-1.5 bg-cyan-50 border border-cyan-100 rounded-lg p-2">
            <Info size={12} className="text-cyan-700 shrink-0 mt-0.5" />
            <span className="text-[9px] font-bold text-cyan-700 leading-tight">
              Contenido educativo. No constituye asesoramiento ni recomendación de inversión.
            </span>
          </div>
        </div>
      ),
    },
    {
      icono: <LifeBuoy size={20} />,
      titulo: "Soporte técnico de la plataforma",
      descripcion: "¿Algo no funciona como esperabas? Resolvemos cualquier duda sobre el funcionamiento de la aplicación en menos de 72 horas.",
      colorAccento: "#0B3A6E",
      mockup: (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3">
          <div className="bg-[#0B3A6E]/10 p-3 rounded-xl">
            <LifeBuoy size={22} className="text-[#0B3A6E]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-[#0B3A6E] uppercase mb-1.5">
              <CheckCircle2 size={12} /> Respuesta garantizada
            </div>
            <div className="h-2.5 w-24 bg-slate-100 rounded-full" />
          </div>
        </div>
      ),
    },
  ];

  const paso = pasos[pasoActivo];
  const total = pasos.length;

  const irAnterior = () => {
    setAutoplay(false);
    setPasoActivo((p) => (p === 0 ? total - 1 : p - 1));
  };

  const irSiguiente = () => {
    setAutoplay(false);
    setPasoActivo((p) => (p === total - 1 ? 0 : p + 1));
  };

  const irAPaso = (i: number) => {
    setAutoplay(false);
    setPasoActivo(i);
  };

  useEffect(() => {
    if (!autoplay) return;

    intervaloRef.current = setInterval(() => {
      setPasoActivo((p) => (p === total - 1 ? 0 : p + 1));
    }, 4000);

    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [autoplay, total]);

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#1FA187] bg-[#1FA187]/10 px-3 py-1.5 rounded-full mb-3">
          <Sparkles size={11} /> Recorrido interactivo
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-[#0B3A6E] uppercase tracking-tight">
          Así funciona MoneyMap
        </h2>
        <p className="text-slate-500 text-sm font-medium mt-2 max-w-xl mx-auto">
          Todo lo que encontrarás dentro de la plataforma, en un recorrido rápido.
        </p>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-[2rem] p-7 md:p-10 shadow-lg relative overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-[0.06] pointer-events-none"
          style={{ backgroundColor: paso.colorAccento }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
          <div>
            <div
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider px-3.5 py-2 rounded-full mb-4"
              style={{ backgroundColor: `${paso.colorAccento}1A`, color: paso.colorAccento }}
            >
              {paso.icono}
              Paso {pasoActivo + 1} de {total}
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 leading-tight">{paso.titulo}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{paso.descripcion}</p>
          </div>

          <div>{paso.mockup}</div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 relative z-10">
          <button
            onClick={irAnterior}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-white hover:border-[#0B3A6E]/30 transition-all"
            aria-label="Paso anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-[60%]">
            {pasos.map((_, i) => (
              <button
                key={i}
                onClick={() => irAPaso(i)}
                className={`h-2 rounded-full transition-all ${
                  i === pasoActivo ? "w-7 bg-[#0B3A6E]" : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Ir al paso ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={irSiguiente}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-white hover:border-[#0B3A6E]/30 transition-all"
            aria-label="Siguiente paso"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}