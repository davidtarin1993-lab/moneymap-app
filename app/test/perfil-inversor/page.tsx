"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Target, Mail, ArrowRight, RotateCcw, Download, Info, Sparkles } from "lucide-react";
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

const PREGUNTAS: Pregunta[] = [
  { id: "horizonte", pregunta: "¿En cuánto tiempo crees que necesitarás usar el dinero que quieres invertir?", opciones: [
    { texto: "Menos de 1 año", puntos: 1 }, { texto: "Entre 1 y 3 años", puntos: 2 }, { texto: "Entre 3 y 7 años", puntos: 3 },
    { texto: "Entre 7 y 15 años", puntos: 4 }, { texto: "Más de 15 años", puntos: 5 } ] },
  { id: "reaccion_caida", pregunta: "Si tu inversión cae un 20% en pocos meses, ¿qué harías?", opciones: [
    { texto: "Vendería todo inmediatamente para no perder más", puntos: 1 }, { texto: "Vendería una parte por seguridad", puntos: 2 },
    { texto: "No haría nada, esperaría a que se recupere", puntos: 3 }, { texto: "Me lo replantearía pero probablemente aguantaría", puntos: 4 },
    { texto: "Aprovecharía para invertir más a precio más bajo", puntos: 5 } ] },
  { id: "conocimiento", pregunta: "¿Cómo describirías tu conocimiento sobre productos financieros?", opciones: [
    { texto: "Ninguno, es la primera vez que me lo planteo", puntos: 1 }, { texto: "Básico, sé lo esencial", puntos: 2 },
    { texto: "Medio, entiendo la mayoría de conceptos", puntos: 3 }, { texto: "Avanzado, invierto desde hace tiempo", puntos: 4 },
    { texto: "Experto, sigo los mercados activamente", puntos: 5 } ] },
  { id: "estabilidad_ingresos", pregunta: "¿Cómo de estables son tus ingresos actuales?", opciones: [
    { texto: "Muy inestables, varían mucho mes a mes", puntos: 1 }, { texto: "Algo variables", puntos: 2 },
    { texto: "Bastante estables", puntos: 3 }, { texto: "Estables, contrato indefinido o similar", puntos: 4 },
    { texto: "Muy estables y con margen amplio de ahorro", puntos: 5 } ] },
  { id: "porcentaje_patrimonio", pregunta: "¿Qué parte de tus ahorros totales estarías dispuesto a invertir con riesgo?", opciones: [
    { texto: "Nada, prefiero tenerlo todo seguro", puntos: 1 }, { texto: "Menos de un 10%", puntos: 2 },
    { texto: "Entre un 10% y un 30%", puntos: 3 }, { texto: "Entre un 30% y un 60%", puntos: 4 }, { texto: "Más de un 60%", puntos: 5 } ] },
  { id: "experiencia_previa", pregunta: "¿Has invertido alguna vez en bolsa, fondos o similar?", opciones: [
    { texto: "Nunca", puntos: 1 }, { texto: "Una vez, con poco dinero", puntos: 2 }, { texto: "Sí, ocasionalmente", puntos: 3 },
    { texto: "Sí, de forma regular", puntos: 4 }, { texto: "Sí, gestiono varias posiciones activamente", puntos: 5 } ] },
  { id: "objetivo_principal", pregunta: "¿Cuál es tu prioridad principal con este dinero?", opciones: [
    { texto: "Proteger el capital, no perder nada", puntos: 1 }, { texto: "Proteger el capital pero ganarle a la inflación", puntos: 2 },
    { texto: "Un equilibrio entre crecimiento y seguridad", puntos: 3 }, { texto: "Crecimiento, acepto algo de riesgo", puntos: 4 },
    { texto: "Máximo crecimiento posible, asumo el riesgo", puntos: 5 } ] },
  { id: "reaccion_noticias", pregunta: "Cuando lees noticias sobre caídas de la bolsa, ¿cómo te sientes?", opciones: [
    { texto: "Me genera mucha ansiedad", puntos: 1 }, { texto: "Me preocupa bastante", puntos: 2 },
    { texto: "Me preocupa un poco pero lo llevo bien", puntos: 3 }, { texto: "Me resulta indiferente", puntos: 4 },
    { texto: "Me parece una oportunidad", puntos: 5 } ] },
  { id: "colchon_seguridad", pregunta: "¿Tienes ya un fondo de emergencia (3-6 meses de gastos) aparte de este dinero?", opciones: [
    { texto: "No, y este sería mi único ahorro", puntos: 1 }, { texto: "Tengo una parte", puntos: 2 }, { texto: "Sí, aunque justo", puntos: 3 },
    { texto: "Sí, bien cubierto", puntos: 4 }, { texto: "Sí, y con margen de sobra", puntos: 5 } ] },
  { id: "edad_aprox", pregunta: "¿En qué etapa de tu vida financiera te encuentras?", opciones: [
    { texto: "Cerca de la jubilación o ya jubilado", puntos: 1 }, { texto: "A menos de 15 años de jubilarme", puntos: 2 },
    { texto: "En mitad de mi vida laboral", puntos: 3 }, { texto: "En los primeros años de mi vida laboral", puntos: 4 },
    { texto: "Muy al principio, con décadas de horizonte por delante", puntos: 5 } ] },
  { id: "dependientes", pregunta: "¿Cuántas personas dependen económicamente de ti?", opciones: [
    { texto: "3 o más", puntos: 1 }, { texto: "2", puntos: 2 }, { texto: "1", puntos: 3 },
    { texto: "Ninguna, pero prefiero ser prudente", puntos: 4 }, { texto: "Ninguna, tengo total libertad de decisión", puntos: 5 } ] },
  { id: "conocimiento_volatilidad", pregunta: "¿Entiendes que a más rentabilidad potencial, normalmente hay más volatilidad (subidas y bajadas)?", opciones: [
    { texto: "No lo tenía claro", puntos: 1 }, { texto: "Más o menos", puntos: 2 }, { texto: "Sí, lo entiendo bien", puntos: 3 },
    { texto: "Sí, y lo tengo muy interiorizado", puntos: 4 }, { texto: "Sí, y ajusto mis decisiones en consecuencia", puntos: 5 } ] },
  { id: "capacidad_ahorro_extra", pregunta: "Si perdieras parte de esta inversión, ¿podrías seguir ahorrando con normalidad?", opciones: [
    { texto: "No, me afectaría gravemente a mi día a día", puntos: 1 }, { texto: "Me costaría bastante", puntos: 2 },
    { texto: "Podría seguir con cierto esfuerzo", puntos: 3 }, { texto: "Sí, sin apenas notarlo", puntos: 4 },
    { texto: "Sí, sin ningún impacto en absoluto", puntos: 5 } ] },
  { id: "frecuencia_revision", pregunta: "¿Con qué frecuencia crees que revisarías el valor de tu inversión?", opciones: [
    { texto: "A diario, y me generaría ansiedad", puntos: 1 }, { texto: "Varias veces por semana", puntos: 2 },
    { texto: "Una vez al mes aproximadamente", puntos: 3 }, { texto: "Cada varios meses", puntos: 4 },
    { texto: "Rara vez, confío en el largo plazo", puntos: 5 } ] },
  { id: "diversificacion_actual", pregunta: "¿Cómo está repartido tu patrimonio actual?", opciones: [
    { texto: "Todo en efectivo o cuenta corriente", puntos: 1 }, { texto: "Mayormente en efectivo, algo en depósitos", puntos: 2 },
    { texto: "Repartido entre efectivo e inversión moderada", puntos: 3 }, { texto: "Bien diversificado entre varios activos", puntos: 4 },
    { texto: "Ampliamente diversificado, incluyendo activos de mayor riesgo", puntos: 5 } ] },
  { id: "motivacion_aprender", pregunta: "¿Cuánto interés tienes en seguir aprendiendo sobre inversión?", opciones: [
    { texto: "Ninguno, prefiero no complicarme", puntos: 1 }, { texto: "Algo, si me lo explican fácil", puntos: 2 },
    { texto: "Bastante, me gusta entender en qué invierto", puntos: 3 }, { texto: "Mucho, leo y me informo con frecuencia", puntos: 4 },
    { texto: "Es una de mis prioridades formativas actuales", puntos: 5 } ] },
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

const PERFILES: Perfil[] = [
  { nombre: "Conservador", rango: [15, 26], color: "#0891B2",
    descripcion: "Priorizas la seguridad de tu capital por encima de todo. Prefieres crecer poco pero dormir tranquilo, y las caídas de mercado te generan bastante inquietud.",
    ejemploCartera: "Perfiles conservadores suelen inclinarse hacia depósitos, renta fija a corto plazo y fondos monetarios." },
  { nombre: "Moderado", rango: [27, 38], color: "#1FA187",
    descripcion: "Buscas un equilibrio: aceptas algo de riesgo si eso te ayuda a batir la inflación, pero sin exponerte a grandes vaivenes.",
    ejemploCartera: "Perfiles moderados suelen combinar renta fija con una parte pequeña de renta variable diversificada." },
  { nombre: "Equilibrado", rango: [39, 50], color: "#0B3A6E",
    descripcion: "Tienes un buen equilibrio entre crecimiento y seguridad. Entiendes que asumir cierto riesgo es necesario para obtener mejores rendimientos a largo plazo.",
    ejemploCartera: "Perfiles equilibrados suelen repartir su cartera de forma similar entre renta fija y renta variable diversificada." },
  { nombre: "Dinámico", rango: [51, 62], color: "#B45309",
    descripcion: "Estás cómodo asumiendo riesgo a cambio de mayor potencial de crecimiento, y tienes horizonte temporal e ingresos para sostenerlo.",
    ejemploCartera: "Perfiles dinámicos suelen inclinar su cartera mayoritariamente hacia renta variable diversificada globalmente." },
  { nombre: "Arriesgado", rango: [63, 75], color: "#BE123C",
    descripcion: "Buscas maximizar el crecimiento y las caídas de mercado no te generan grandes preocupaciones. Tienes experiencia, conocimiento y margen para asumir riesgo elevado.",
    ejemploCartera: "Perfiles arriesgados suelen concentrar su cartera casi por completo en renta variable, incluyendo mercados emergentes o sectores concretos." },
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
              <Download size={14} /> Descargar informe en PDF
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