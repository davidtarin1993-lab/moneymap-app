"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Clock,
  Trophy,
  Mail,
  ArrowRight,
  RotateCcw,
  FileDown
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useUtmParams } from "@/lib/useUtmParams";
import { generarPdfResultado } from "@/lib/generarPdfResultado";

interface Opcion {
  texto: string;
  puntos: 0 | 1 | 2 | 3;
}

interface Pregunta {
  id: string;
  categoria: "Ahorro" | "Presupuesto" | "Deudas" | "Inversión" | "Planificación";
  pregunta: string;
  opciones: Opcion[];
}

// 👉 PEGA AQUÍ el mismo array PREGUNTAS (40 preguntas) que ya tienes en
// app/formacion/quiz/page.tsx — es idéntico, cópialo tal cual.
const PREGUNTAS: Pregunta[] = [
  /* ... mismo contenido que en app/formacion/quiz/page.tsx ... */
];

const CATEGORIAS = ["Ahorro", "Presupuesto", "Deudas", "Inversión", "Planificación"] as const;

function QuizPublicoContenido() {
  const { utmSource, utmMedium, utmCampaign } = useUtmParams();

  const [pasoActual, setPasoActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [quizTerminado, setQuizTerminado] = useState(false);

  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const pregunta = PREGUNTAS[pasoActual];
  const progreso = (pasoActual / PREGUNTAS.length) * 100;

  const responder = (opcion: Opcion) => {
    const nuevasRespuestas = { ...respuestas, [pregunta.id]: opcion.puntos };
    setRespuestas(nuevasRespuestas);

    if (pasoActual < PREGUNTAS.length - 1) {
      setTimeout(() => setPasoActual((p) => p + 1), 220);
    } else {
      setTimeout(() => setQuizTerminado(true), 220);
    }
  };

  const puntuacionesPorCategoria = CATEGORIAS.map((cat) => {
    const preguntasCat = PREGUNTAS.filter((p) => p.categoria === cat);
    const maxPuntos = preguntasCat.length * 3;
    const puntosObtenidos = preguntasCat.reduce((sum, p) => sum + (respuestas[p.id] ?? 0), 0);
    return { categoria: cat, puntuacion: maxPuntos > 0 ? Math.round((puntosObtenidos / maxPuntos) * 100) : 0 };
  });

  const puntuacionGlobal = Math.round(
    puntuacionesPorCategoria.reduce((sum, c) => sum + c.puntuacion, 0) / puntuacionesPorCategoria.length
  );
  const descargarPdf = async () => {
    await generarPdfResultado({
      tituloDocumento: "Tu Quiz Financiero",
      subtitulo: "Resultado de tu evaluación financiera personal con MoneyMap.",
      nombreCliente: nombre || undefined,
      metricasDestacadas: [{ etiqueta: "Puntuación global", valor: `${puntuacionGlobal}/100` }],
      secciones: [
        {
          titulo: "Tu mapa de habilidades",
          contenido: puntuacionesPorCategoria.map((c) => `${c.categoria}: ${c.puntuacion}%`).join("\n"),
        },
        {
          titulo: "Recomendación principal",
          contenido: `Tu área con más margen de mejora es ${puntuacionesPorCategoria.sort((a, b) => a.puntuacion - b.puntuacion)[0].categoria}. Trabajarla te ayudará a subir tu puntuación global.`,
        },
      ],
      nombreArchivo: "moneymap-quiz-financiero.pdf",
    });
  };
  const handleEnviarEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErrorEnvio(null);

    try {
      const response = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          nombre,
          origen: "quiz",
          resultadoResumen: { puntuacionGlobal, puntuacionesPorCategoria },
          utmSource,
          utmMedium,
          utmCampaign,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo enviar.");

      setEmailEnviado(true);
    } catch (err: any) {
      setErrorEnvio(err.message || "Error inesperado.");
    } finally {
      setEnviando(false);
    }
  };

  const reiniciar = () => {
    setPasoActual(0);
    setRespuestas({});
    setQuizTerminado(false);
    setEmailEnviado(false);
    setEmail("");
    setNombre("");
  };

  return (
    <main className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 md:py-10 pb-16 antialiased">
      <div className="max-w-lg mx-auto w-full">

        <div className="flex justify-center mb-4">
          <Image src="/Multimedia/portada.png" alt="MoneyMap" width={160} height={46} className="object-contain" unoptimized />
        </div>

        <header className="border-b border-slate-100 pb-5 mb-5 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl md:text-4xl" role="img" aria-label="Quiz">🎮</span>
            <h1 className="text-2xl md:text-3xl font-black text-[#0B3A6E] tracking-tight">Quiz Financiero</h1>
          </div>
          <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-md mx-auto font-medium leading-normal">
            40 preguntas rápidas para descubrir tu puntuación financiera y en qué deberías mejorar. Gratis, sin registro.
          </p>
        </header>

        {!quizTerminado ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Pregunta {pasoActual + 1} de {PREGUNTAS.length}
              </span>
            </div>

            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#1FA187] rounded-full transition-all duration-300" style={{ width: `${progreso}%` }} />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-[#0B3A6E]/10 text-[#0B3A6E] px-2 py-1 rounded-full mb-3">
                {pregunta.categoria}
              </span>
              <p className="text-sm font-black text-slate-800 leading-relaxed mb-4">{pregunta.pregunta}</p>

              <div className="space-y-2">
                {pregunta.opciones.map((op, idx) => (
                  <button
                    key={idx}
                    onClick={() => responder(op)}
                    className="w-full text-left bg-white border border-slate-200 hover:border-[#0B3A6E] hover:bg-[#0B3A6E]/5 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 transition-all active:scale-[0.99]"
                  >
                    {op.texto}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : !emailEnviado ? (
          <div className="space-y-5">
            {/* TEASER: solo mostramos la puntuación global, sin desglose */}
            <div className="bg-[#0B3A6E] rounded-3xl p-6 text-center shadow-md relative overflow-hidden">
              <Trophy size={28} className="text-[#1FA187] mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Tu puntuación financiera</p>
              <p className="text-4xl font-black text-white mt-1 blur-sm select-none">{puntuacionGlobal}<span className="text-lg text-white/50">/100</span></p>
              <p className="text-[10px] text-white/60 font-medium mt-1">Desbloquea tu resultado completo abajo 👇</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-1.5 mb-2">
                <Mail size={14} className="text-[#0B3A6E]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0B3A6E]">Ver mi informe completo</h3>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mb-4">
                Introduce tu email y te mostramos tu puntuación exacta, el desglose por área y en qué deberías mejorar.
              </p>

              <form onSubmit={handleEnviarEmail} className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1FA187] font-medium"
                />
                <input
                  type="email"
                  required
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1FA187] font-medium"
                />
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full bg-[#1FA187] hover:bg-[#198771] disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  {enviando ? "Enviando..." : <>Ver mi resultado <ArrowRight size={14} /></>}
                </button>
                {errorEnvio && <p className="text-red-500 text-[10px] font-bold text-center">{errorEnvio}</p>}
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-[#0B3A6E] rounded-3xl p-6 text-center shadow-md">
              <Trophy size={28} className="text-[#1FA187] mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Tu puntuación financiera</p>
              <p className="text-4xl font-black text-white mt-1">{puntuacionGlobal}<span className="text-lg text-white/50">/100</span></p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Tu mapa de habilidades</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={puntuacionesPorCategoria} outerRadius="75%">
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="categoria" tick={{ fontSize: 10, fontWeight: 700, fill: "#475569" }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="puntuacion" stroke="#0B3A6E" fill="#1FA187" fillOpacity={0.35} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#1FA187]/10 border border-[#1FA187]/30 rounded-2xl p-5 text-center">
              <Sparkles size={20} className="text-[#1FA187] mx-auto mb-2" />
              <p className="text-sm font-black text-slate-800 mb-1">¿Quieres mejorar estos números de verdad?</p>
              <p className="text-[11px] text-slate-500 font-medium mb-3">
                MoneyMap analiza tus movimientos y tu fiscalidad con IA, y traza contigo una ruta personalizada hacia tus objetivos.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 bg-[#0B3A6E] hover:bg-[#11498a] text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
              >
                Conocer MoneyMap <ArrowRight size={14} />
              </Link>
            </div>
            <button
              onClick={descargarPdf}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl p-3 text-xs font-black uppercase tracking-wider transition-all"
            >
              <FileDown size={14} /> Descargar informe en PDF
            </button>
            <button
              onClick={reiniciar}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl p-3 text-xs font-black uppercase tracking-wider transition-all"
            >
              <RotateCcw size={14} /> Repetir el quiz
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function QuizPublicoPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen bg-white" />}>
      <QuizPublicoContenido />
    </Suspense>
  );
}