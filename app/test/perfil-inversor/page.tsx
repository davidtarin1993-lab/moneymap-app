"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Target, Mail, ArrowRight, RotateCcw, Info, Sparkles,FileDown } from "lucide-react";
import { useUtmParams } from "@/lib/useUtmParams";
import { generarPdfResultado } from "@/lib/generarPdfResultado";

interface Opcion {
  texto: string;
  puntos: number;
}

interface Pregunta {
  id: string;
  pregunta: string;
  opciones: Opcion[];
}

// 👉 PEGA AQUÍ el mismo array PREGUNTAS (15 preguntas) que ya tienes en
// app/formacion/survey_economy/page.tsx — es idéntico, cópialo tal cual.
const PREGUNTAS: Pregunta[] = [
  /* ... mismo contenido que en app/formacion/survey_economy/page.tsx ... */
];

const PUNTOS_MIN = PREGUNTAS.length * 1;
const PUNTOS_MAX = PREGUNTAS.length * 5;

interface Perfil {
  nombre: string;
  rango: [number, number];
  color: string;
  descripcion: string;
  ejemploCartera: string;
}

// 👉 PEGA AQUÍ el mismo array PERFILES que ya tienes en app/formacion/survey_economy/page.tsx
const PERFILES: Perfil[] = [
  /* ... mismo contenido que en app/formacion/survey_economy/page.tsx ... */
];

function PerfilInversorContenido() {
  const { utmSource, utmMedium, utmCampaign } = useUtmParams();

  const [pasoActual, setPasoActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [testTerminado, setTestTerminado] = useState(false);

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
      setTimeout(() => setTestTerminado(true), 220);
    }
  };

  const puntuacionTotal = Object.values(respuestas).reduce((a, b) => a + b, 0);
  const perfil = PERFILES.find((p) => puntuacionTotal >= p.rango[0] && puntuacionTotal <= p.rango[1]) ?? PERFILES[2];
  const posicionGauge = ((puntuacionTotal - PUNTOS_MIN) / (PUNTOS_MAX - PUNTOS_MIN)) * 100;
  const descargarPdf = async () => {
    await generarPdfResultado({
      tituloDocumento: "Tu Perfil de Inversor",
      subtitulo: "Resultado de tu perfilador de riesgo con MoneyMap.",
      nombreCliente: nombre || undefined,
      metricasDestacadas: [{ etiqueta: "Perfil", valor: perfil.nombre }],
      secciones: [
        { titulo: "Descripción de tu perfil", contenido: perfil.descripcion },
        { titulo: "Orientación de cartera", contenido: perfil.ejemploCartera + " Contenido educativo, no constituye asesoramiento de inversión." },
      ],
      nombreArchivo: "moneymap-perfil-inversor.pdf",
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
          origen: "perfil_inversor",
          resultadoResumen: { perfil: perfil.nombre, puntuacionTotal },
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
    setTestTerminado(false);
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
            <span className="text-3xl md:text-4xl" role="img" aria-label="Perfilador">🎯</span>
            <h1 className="text-2xl md:text-3xl font-black text-[#0B3A6E] tracking-tight">Perfilador de Riesgo</h1>
          </div>
          <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-md mx-auto font-medium leading-normal">
            15 preguntas para descubrir si eres un inversor conservador, moderado o arriesgado. Gratis, sin registro.
          </p>
        </header>

        {!testTerminado ? (
          <div className="space-y-5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Pregunta {pasoActual + 1} de {PREGUNTAS.length}
            </span>

            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-fuchsia-500 rounded-full transition-all duration-300" style={{ width: `${progreso}%` }} />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <p className="text-sm font-black text-slate-800 leading-relaxed mb-4">{pregunta.pregunta}</p>
              <div className="space-y-2">
                {pregunta.opciones.map((op, idx) => (
                  <button
                    key={idx}
                    onClick={() => responder(op)}
                    className="w-full text-left bg-white border border-slate-200 hover:border-fuchsia-500 hover:bg-fuchsia-50 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 transition-all active:scale-[0.99]"
                  >
                    {op.texto}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : !emailEnviado ? (
          <div className="space-y-5">
            <div className="rounded-3xl p-6 text-center shadow-md bg-slate-800 relative overflow-hidden">
              <Target size={26} className="text-white/70 mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase tracking-wider text-white/60">Tu perfil inversor</p>
              <p className="text-2xl font-black text-white mt-1 blur-sm select-none">{perfil.nombre}</p>
              <p className="text-[10px] text-white/50 font-medium mt-1">Desbloquea tu resultado abajo 👇</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-1.5 mb-2">
                <Mail size={14} className="text-fuchsia-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-fuchsia-700">Ver mi perfil completo</h3>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mb-4">
                Introduce tu email y te mostramos tu perfil de inversor y qué tipo de cartera encaja contigo.
              </p>

              <form onSubmit={handleEnviarEmail} className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-fuchsia-500 font-medium"
                />
                <input
                  type="email"
                  required
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-fuchsia-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  {enviando ? "Enviando..." : <>Ver mi perfil <ArrowRight size={14} /></>}
                </button>
                {errorEnvio && <p className="text-red-500 text-[10px] font-bold text-center">{errorEnvio}</p>}
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-3xl p-6 text-center shadow-md" style={{ backgroundColor: perfil.color }}>
              <Target size={26} className="text-white/80 mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Tu perfil inversor</p>
              <p className="text-2xl font-black text-white mt-1">{perfil.nombre}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="relative h-3 rounded-full overflow-hidden flex">
                {PERFILES.map((p) => (
                  <div key={p.nombre} className="flex-1 h-full" style={{ backgroundColor: p.color, opacity: 0.35 }} />
                ))}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md"
                  style={{ left: `calc(${Math.min(Math.max(posicionGauge, 2), 98)}% - 6px)`, backgroundColor: perfil.color }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                {PERFILES.map((p) => (
                  <span key={p.nombre} className="text-[7.5px] font-black uppercase text-slate-400 flex-1 text-center">{p.nombre}</span>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-700 font-medium leading-relaxed">{perfil.descripcion}</p>
              <p className="mt-3 text-[11px] text-slate-500 font-medium leading-relaxed">{perfil.ejemploCartera}</p>
            </div>

            <div className="flex items-start gap-2 bg-cyan-50 border border-cyan-100 rounded-xl p-3">
              <Info size={13} className="text-cyan-700 shrink-0 mt-0.5" />
              <p className="text-[10px] text-cyan-800 font-bold leading-relaxed">
                Contenido educativo. No constituye asesoramiento ni recomendación de inversión personalizada.
              </p>
            </div>

            <div className="bg-[#1FA187]/10 border border-[#1FA187]/30 rounded-2xl p-5 text-center">
              <Sparkles size={20} className="text-[#1FA187] mx-auto mb-2" />
              <p className="text-sm font-black text-slate-800 mb-1">¿Quieres invertir con estrategia real?</p>
              <p className="text-[11px] text-slate-500 font-medium mb-3">
                Con MoneyMap sigues en tiempo real una cartera modelo y trazas tu ruta financiera con un asesor.
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
              <RotateCcw size={14} /> Repetir el test
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PerfilInversorPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen bg-white" />}>
      <PerfilInversorContenido />
    </Suspense>
  );
}