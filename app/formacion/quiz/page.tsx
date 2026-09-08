"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Sparkles,
  Clock,
  CheckCircle2,
  Trophy,
  RotateCcw,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

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

const PREGUNTAS: Pregunta[] = [
  // AHORRO
  { id: "a1", categoria: "Ahorro", pregunta: "¿Qué porcentaje aproximado de tus ingresos mensuales consigues ahorrar?", opciones: [
    { texto: "Nada, gasto todo lo que ingreso", puntos: 0 }, { texto: "Entre un 1% y un 5%", puntos: 1 },
    { texto: "Entre un 5% y un 15%", puntos: 2 }, { texto: "Más de un 15%", puntos: 3 } ] },
  { id: "a2", categoria: "Ahorro", pregunta: "Si tuvieras un gasto imprevisto de 1.000€ mañana, ¿podrías cubrirlo sin pedir prestado?", opciones: [
    { texto: "No, tendría que pedir dinero prestado", puntos: 0 }, { texto: "Podría cubrir una parte", puntos: 1 },
    { texto: "Sí, aunque me dejaría sin margen", puntos: 2 }, { texto: "Sí, sin ningún problema", puntos: 3 } ] },
  { id: "a3", categoria: "Ahorro", pregunta: "¿Tienes una cuenta o hucha separada exclusivamente para ahorrar?", opciones: [
    { texto: "No, todo está mezclado en la misma cuenta", puntos: 0 }, { texto: "Tengo una pero apenas la uso", puntos: 1 },
    { texto: "Sí, y la uso de vez en cuando", puntos: 2 }, { texto: "Sí, y transfiero a ella cada mes", puntos: 3 } ] },
  { id: "a4", categoria: "Ahorro", pregunta: "¿Tu ahorro es automático (transferencia programada) o manual (lo que sobra al final)?", opciones: [
    { texto: "No ahorro de ninguna forma", puntos: 0 }, { texto: "Ahorro lo que sobra, si sobra algo", puntos: 1 },
    { texto: "Intento apartar algo manualmente cada mes", puntos: 2 }, { texto: "Tengo una transferencia automática programada", puntos: 3 } ] },
  { id: "a5", categoria: "Ahorro", pregunta: "¿Cuántos meses de gastos básicos tienes cubiertos con tus ahorros actuales?", opciones: [
    { texto: "Ninguno", puntos: 0 }, { texto: "Menos de 1 mes", puntos: 1 },
    { texto: "Entre 1 y 3 meses", puntos: 2 }, { texto: "Más de 3 meses", puntos: 3 } ] },
  { id: "a6", categoria: "Ahorro", pregunta: "Cuando recibes un ingreso extra (paga doble, regalo, devolución de Hacienda...), ¿qué haces normalmente?", opciones: [
    { texto: "Lo gasto todo casi de inmediato", puntos: 0 }, { texto: "Gasto la mayoría y ahorro un poco", puntos: 1 },
    { texto: "Ahorro la mayoría y gasto un poco", puntos: 2 }, { texto: "Lo ahorro o invierto prácticamente todo", puntos: 3 } ] },
  { id: "a7", categoria: "Ahorro", pregunta: "¿Revisas cuánto has ahorrado en el último año?", opciones: [
    { texto: "Nunca lo he mirado", puntos: 0 }, { texto: "Alguna vez, sin mucha atención", puntos: 1 },
    { texto: "Sí, un par de veces al año", puntos: 2 }, { texto: "Sí, hago seguimiento regular", puntos: 3 } ] },
  { id: "a8", categoria: "Ahorro", pregunta: "¿Cómo describirías tu relación general con el ahorro?", opciones: [
    { texto: "Me cuesta mucho, es un punto débil claro", puntos: 0 }, { texto: "Lo intento pero no soy constante", puntos: 1 },
    { texto: "Ahorro con cierta regularidad", puntos: 2 }, { texto: "Es un hábito muy consolidado en mi día a día", puntos: 3 } ] },

  // PRESUPUESTO
  { id: "p1", categoria: "Presupuesto", pregunta: "¿Llevas un control (mental o escrito) de en qué se va tu dinero cada mes?", opciones: [
    { texto: "No tengo ni idea de en qué se va", puntos: 0 }, { texto: "Tengo una idea aproximada", puntos: 1 },
    { texto: "Reviso mis movimientos de vez en cuando", puntos: 2 }, { texto: "Sí, tengo un presupuesto claro y lo sigo", puntos: 3 } ] },
  { id: "p2", categoria: "Presupuesto", pregunta: "¿Con qué frecuencia tus gastos superan tus ingresos en un mes normal?", opciones: [
    { texto: "Casi todos los meses", puntos: 0 }, { texto: "Algunos meses sí", puntos: 1 },
    { texto: "Muy de vez en cuando", puntos: 2 }, { texto: "Nunca, siempre gasto por debajo de lo que ingreso", puntos: 3 } ] },
  { id: "p3", categoria: "Presupuesto", pregunta: "¿Sabrías decir ahora mismo, sin mirar el móvil, cuánto has gastado este mes en ocio?", opciones: [
    { texto: "No tengo ni idea", puntos: 0 }, { texto: "Una idea muy vaga", puntos: 1 },
    { texto: "Una cifra bastante aproximada", puntos: 2 }, { texto: "Sí, lo sé con bastante precisión", puntos: 3 } ] },
  { id: "p4", categoria: "Presupuesto", pregunta: "¿Distingues entre gastos fijos (alquiler, seguros...) y variables (ocio, caprichos...) en tu cabeza?", opciones: [
    { texto: "No hago esa distinción", puntos: 0 }, { texto: "Más o menos", puntos: 1 },
    { texto: "Sí, tengo clara la diferencia", puntos: 2 }, { texto: "Sí, y sé exactamente cuánto supone cada uno", puntos: 3 } ] },
  { id: "p5", categoria: "Presupuesto", pregunta: "Cuando algo sube de precio (luz, alquiler...), ¿ajustas tu presupuesto para compensarlo?", opciones: [
    { texto: "No me doy cuenta hasta que es un problema", puntos: 0 }, { texto: "Lo noto pero no reacciono", puntos: 1 },
    { texto: "Intento ajustar otros gastos", puntos: 2 }, { texto: "Sí, reviso y reajusto activamente", puntos: 3 } ] },
  { id: "p6", categoria: "Presupuesto", pregunta: "¿Usas alguna app, hoja de cálculo o herramienta para llevar tus finanzas?", opciones: [
    { texto: "No, nada de nada", puntos: 0 }, { texto: "Lo he probado pero lo dejé", puntos: 1 },
    { texto: "Uso algo de vez en cuando", puntos: 2 }, { texto: "Sí, la reviso con regularidad", puntos: 3 } ] },
  { id: "p7", categoria: "Presupuesto", pregunta: "¿Te sorprenden tus gastos a final de mes?", opciones: [
    { texto: "Siempre, nunca sé en qué se ha ido el dinero", puntos: 0 }, { texto: "A veces", puntos: 1 },
    { texto: "Raramente", puntos: 2 }, { texto: "Nunca, siempre coincide con lo previsto", puntos: 3 } ] },
  { id: "p8", categoria: "Presupuesto", pregunta: "¿Tienes un límite mental o real para gastos de ocio/caprichos cada mes?", opciones: [
    { texto: "No, gasto según me apetece en el momento", puntos: 0 }, { texto: "Tengo una idea pero no la sigo", puntos: 1 },
    { texto: "Intento respetar un límite aproximado", puntos: 2 }, { texto: "Sí, tengo un límite claro y lo cumplo", puntos: 3 } ] },

  // DEUDAS
  { id: "d1", categoria: "Deudas", pregunta: "¿Qué tipo de deudas tienes actualmente?", opciones: [
    { texto: "Deudas de tarjetas de crédito o préstamos rápidos", puntos: 0 }, { texto: "Un préstamo personal o de coche", puntos: 1 },
    { texto: "Solo hipoteca", puntos: 2 }, { texto: "Ninguna deuda", puntos: 3 } ] },
  { id: "d2", categoria: "Deudas", pregunta: "¿Pagas siempre el total de tu tarjeta de crédito antes de que generen intereses?", opciones: [
    { texto: "No suelo pagarlo todo", puntos: 0 }, { texto: "A veces", puntos: 1 },
    { texto: "Casi siempre", puntos: 2 }, { texto: "Siempre, o no uso tarjeta de crédito", puntos: 3 } ] },
  { id: "d3", categoria: "Deudas", pregunta: "¿Qué porcentaje de tus ingresos mensuales se va en pagar deudas (sin contar hipoteca)?", opciones: [
    { texto: "Más de un 30%", puntos: 0 }, { texto: "Entre un 15% y un 30%", puntos: 1 },
    { texto: "Menos de un 15%", puntos: 2 }, { texto: "0%, no tengo deudas fuera de la hipoteca", puntos: 3 } ] },
  { id: "d4", categoria: "Deudas", pregunta: "¿Sabrías decir el tipo de interés exacto que pagas en tus deudas actuales?", opciones: [
    { texto: "No tengo ni idea", puntos: 0 }, { texto: "Una idea muy aproximada", puntos: 1 },
    { texto: "Lo sé con bastante precisión", puntos: 2 }, { texto: "Lo sé exactamente, o no tengo deudas", puntos: 3 } ] },
  { id: "d5", categoria: "Deudas", pregunta: "¿Has usado alguna vez un préstamo rápido o 'minicrédito' para llegar a fin de mes?", opciones: [
    { texto: "Sí, varias veces", puntos: 0 }, { texto: "Sí, una vez", puntos: 1 },
    { texto: "No, pero he estado cerca de necesitarlo", puntos: 2 }, { texto: "Nunca lo he necesitado", puntos: 3 } ] },
  { id: "d6", categoria: "Deudas", pregunta: "Si tuvieras varias deudas, ¿sabrías priorizar cuál pagar antes según su interés?", opciones: [
    { texto: "No, pagaría la que me resultase más cómoda", puntos: 0 }, { texto: "Tendría que pensarlo bastante", puntos: 1 },
    { texto: "Sí, más o menos sabría priorizar", puntos: 2 }, { texto: "Sí, tengo claro que se paga primero la de mayor interés", puntos: 3 } ] },
  { id: "d7", categoria: "Deudas", pregunta: "¿Tienes un plan concreto para terminar de pagar tus deudas actuales?", opciones: [
    { texto: "No, ni me lo he planteado", puntos: 0 }, { texto: "Tengo una idea vaga", puntos: 1 },
    { texto: "Sí, más o menos sé cuándo terminaré", puntos: 2 }, { texto: "Sí, tengo fecha y plan claros, o no tengo deudas", puntos: 3 } ] },
  { id: "d8", categoria: "Deudas", pregunta: "¿Cómo te sientes respecto a tu nivel de deuda actual?", opciones: [
    { texto: "Me genera bastante estrés", puntos: 0 }, { texto: "Me preocupa de vez en cuando", puntos: 1 },
    { texto: "Lo tengo bastante controlado", puntos: 2 }, { texto: "No me preocupa en absoluto", puntos: 3 } ] },

  // INVERSIÓN
  { id: "i1", categoria: "Inversión", pregunta: "¿Tienes parte de tus ahorros invertidos (fondos, acciones, planes de pensiones...)?", opciones: [
    { texto: "No, todo está en la cuenta corriente", puntos: 0 }, { texto: "Tengo algo pero no sé muy bien en qué", puntos: 1 },
    { texto: "Sí, en uno o dos productos que entiendo", puntos: 2 }, { texto: "Sí, en una cartera diversificada que entiendo bien", puntos: 3 } ] },
  { id: "i2", categoria: "Inversión", pregunta: "¿Sabrías explicar la diferencia entre una acción y un fondo indexado?", opciones: [
    { texto: "No, no tengo ni idea", puntos: 0 }, { texto: "Más o menos", puntos: 1 },
    { texto: "Sí, con bastante seguridad", puntos: 2 }, { texto: "Sí, y también entiendo cómo diversifican el riesgo", puntos: 3 } ] },
  { id: "i3", categoria: "Inversión", pregunta: "¿Entiendes el concepto de interés compuesto y por qué importa empezar pronto?", opciones: [
    { texto: "No lo entiendo bien", puntos: 0 }, { texto: "Tengo una idea básica", puntos: 1 },
    { texto: "Sí, lo entiendo bien", puntos: 2 }, { texto: "Sí, y ya lo aplico en mis decisiones", puntos: 3 } ] },
  { id: "i4", categoria: "Inversión", pregunta: "¿Sabrías qué son las comisiones de gestión y cómo afectan a tu rentabilidad a largo plazo?", opciones: [
    { texto: "No sabía que existían", puntos: 0 }, { texto: "Las he oído mencionar", puntos: 1 },
    { texto: "Sí, sé que importan y las reviso", puntos: 2 }, { texto: "Sí, comparo comisiones antes de invertir", puntos: 3 } ] },
  { id: "i5", categoria: "Inversión", pregunta: "¿Qué es la diversificación y la aplicas en tus decisiones?", opciones: [
    { texto: "No sé qué es", puntos: 0 }, { texto: "Sé lo que es pero no la aplico", puntos: 1 },
    { texto: "La aplico parcialmente", puntos: 2 }, { texto: "La aplico de forma consciente y consistente", puntos: 3 } ] },
  { id: "i6", categoria: "Inversión", pregunta: "¿Tienes claro el riesgo real de dejar todos tus ahorros en la cuenta corriente a largo plazo (inflación)?", opciones: [
    { texto: "No lo había pensado", puntos: 0 }, { texto: "Lo he oído pero no le doy importancia", puntos: 1 },
    { texto: "Sí, soy consciente de ello", puntos: 2 }, { texto: "Sí, y por eso invierto parte de mis ahorros", puntos: 3 } ] },
  { id: "i7", categoria: "Inversión", pregunta: "¿Revisas periódicamente cómo evolucionan tus inversiones (si las tienes)?", opciones: [
    { texto: "No tengo inversiones / nunca las reviso", puntos: 0 }, { texto: "Las miro muy de vez en cuando", puntos: 1 },
    { texto: "Las reviso cada pocos meses", puntos: 2 }, { texto: "Hago seguimiento regular y estructurado", puntos: 3 } ] },
  { id: "i8", categoria: "Inversión", pregunta: "¿Sabrías identificar una estafa de inversión ('te doblo el dinero en un mes')?", opciones: [
    { texto: "No estoy seguro de reconocerla", puntos: 0 }, { texto: "Creo que sí, aunque con dudas", puntos: 1 },
    { texto: "Sí, identifico las señales típicas", puntos: 2 }, { texto: "Sí, con total seguridad", puntos: 3 } ] },

  // PLANIFICACIÓN
  { id: "pl1", categoria: "Planificación", pregunta: "¿Tienes claro cuánto necesitarás ahorrado para tu jubilación?", opciones: [
    { texto: "Nunca lo he pensado", puntos: 0 }, { texto: "Lo he pensado pero no he calculado nada", puntos: 1 },
    { texto: "Tengo una estimación aproximada", puntos: 2 }, { texto: "Sí, tengo un plan con cifras concretas", puntos: 3 } ] },
  { id: "pl2", categoria: "Planificación", pregunta: "¿Tienes objetivos financieros a más de 5 años (vivienda, jubilación, patrimonio...)?", opciones: [
    { texto: "No tengo objetivos definidos", puntos: 0 }, { texto: "Tengo alguna idea vaga", puntos: 1 },
    { texto: "Tengo 1 o 2 objetivos claros", puntos: 2 }, { texto: "Tengo varios objetivos con plazos y cifras", puntos: 3 } ] },
  { id: "pl3", categoria: "Planificación", pregunta: "¿Tienes contratado algún seguro de vida, salud o similar acorde a tu situación?", opciones: [
    { texto: "No tengo ninguno y no me lo he planteado", puntos: 0 }, { texto: "Lo he pensado pero no he actuado", puntos: 1 },
    { texto: "Tengo lo básico", puntos: 2 }, { texto: "Tengo mi cobertura bien revisada y adaptada", puntos: 3 } ] },
  { id: "pl4", categoria: "Planificación", pregunta: "¿Sabes aproximadamente cuál es tu patrimonio neto total (lo que tienes menos lo que debes)?", opciones: [
    { texto: "No tengo ni idea", puntos: 0 }, { texto: "Una idea muy vaga", puntos: 1 },
    { texto: "Una cifra bastante aproximada", puntos: 2 }, { texto: "La conozco con precisión y la actualizo", puntos: 3 } ] },
  { id: "pl5", categoria: "Planificación", pregunta: "¿Has hablado alguna vez con un asesor financiero sobre tu situación?", opciones: [
    { texto: "Nunca", puntos: 0 }, { texto: "Lo he pensado pero no lo he hecho", puntos: 1 },
    { texto: "Sí, una vez puntual", puntos: 2 }, { texto: "Sí, tengo seguimiento regular", puntos: 3 } ] },
  { id: "pl6", categoria: "Planificación", pregunta: "¿Revisas tu situación financiera completa al menos una vez al año?", opciones: [
    { texto: "Nunca hago una revisión completa", puntos: 0 }, { texto: "Muy de vez en cuando", puntos: 1 },
    { texto: "Sí, aproximadamente una vez al año", puntos: 2 }, { texto: "Sí, de forma regular y estructurada", puntos: 3 } ] },
  { id: "pl7", categoria: "Planificación", pregunta: "¿Tienes en cuenta la inflación al planificar objetivos a largo plazo?", opciones: [
    { texto: "No lo había considerado", puntos: 0 }, { texto: "Lo sé pero no lo aplico en mis cálculos", puntos: 1 },
    { texto: "Lo tengo en cuenta de forma aproximada", puntos: 2 }, { texto: "Sí, ajusto mis cálculos por inflación", puntos: 3 } ] },
  { id: "pl8", categoria: "Planificación", pregunta: "En general, ¿sientes que tienes el control de tu futuro financiero?", opciones: [
    { texto: "No, siento que voy improvisando", puntos: 0 }, { texto: "Un poco, pero con muchas dudas", puntos: 1 },
    { texto: "Bastante, aunque con margen de mejora", puntos: 2 }, { texto: "Sí, siento que tengo un buen control", puntos: 3 } ] },
];

const CATEGORIAS = ["Ahorro", "Presupuesto", "Deudas", "Inversión", "Planificación"] as const;

export default function QuizFinancieroPage() {
  const router = useRouter();
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [pasoActual, setPasoActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCargandoAuth(false);
    }
    verificar();
  }, [router]);

  useEffect(() => {
    if (mostrarResultado) return;
    const intervalo = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(intervalo);
  }, [mostrarResultado]);

  const pregunta = PREGUNTAS[pasoActual];
  const progreso = (pasoActual / PREGUNTAS.length) * 100;

  const guardarResultado = async (
    puntuacionesCategoria: { categoria: string; puntuacion: number }[],
    puntuacionGlobal: number,
    segundosFinal: number
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      fetch("/api/dashboard/quiz/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          puntuacionGlobal,
          puntuacionesCategoria,
          segundosEmpleados: segundosFinal,
        }),
        keepalive: true,
      }).catch((err) => console.error("Error al guardar resultado del quiz:", err));
    } catch (err) {
      console.error("Error al guardar resultado del quiz:", err);
    }
  };

  const responder = (opcion: Opcion) => {
    const nuevasRespuestas = { ...respuestas, [pregunta.id]: opcion.puntos };
    setRespuestas(nuevasRespuestas);

    if (pasoActual < PREGUNTAS.length - 1) {
      setTimeout(() => setPasoActual((p) => p + 1), 220);
    } else {
      setTimeout(() => {
        setMostrarResultado(true);

        const puntuaciones = CATEGORIAS.map((cat) => {
          const preguntasCat = PREGUNTAS.filter((p) => p.categoria === cat);
          const maxPuntos = preguntasCat.length * 3;
          const puntosObtenidos = preguntasCat.reduce((sum, p) => sum + (nuevasRespuestas[p.id] ?? 0), 0);
          return { categoria: cat, puntuacion: maxPuntos > 0 ? Math.round((puntosObtenidos / maxPuntos) * 100) : 0 };
        });
        const global = Math.round(puntuaciones.reduce((sum, c) => sum + c.puntuacion, 0) / puntuaciones.length);

        guardarResultado(puntuaciones, global, segundos);
      }, 220);
    }
  };

  const puntuacionesPorCategoria = CATEGORIAS.map((cat) => {
    const preguntasCat = PREGUNTAS.filter((p) => p.categoria === cat);
    const maxPuntos = preguntasCat.length * 3;
    const puntosObtenidos = preguntasCat.reduce((sum, p) => sum + (respuestas[p.id] ?? 0), 0);
    return {
      categoria: cat,
      puntuacion: maxPuntos > 0 ? Math.round((puntosObtenidos / maxPuntos) * 100) : 0,
    };
  });

  const categoriaMasDebil = [...puntuacionesPorCategoria].sort((a, b) => a.puntuacion - b.puntuacion)[0];
  const puntuacionGlobal = Math.round(
    puntuacionesPorCategoria.reduce((sum, c) => sum + c.puntuacion, 0) / puntuacionesPorCategoria.length
  );

  const RECOMENDACIONES: Record<string, string> = {
    Ahorro: "Empieza por algo pequeño: automatiza una transferencia mensual a una cuenta de ahorro separada, aunque sea de 20-30€. La constancia importa más que la cantidad.",
    Presupuesto: "Prueba a revisar tus movimientos clasificados en tu Dashboard una vez a la semana — te ayudará a detectar patrones de gasto sin necesidad de una hoja de cálculo.",
    Deudas: "Si tienes deuda de tarjeta o préstamos rápidos, prioriza cancelarla antes de invertir: sus intereses suelen superar cualquier rentabilidad esperada de una inversión.",
    Inversión: "No hace falta ser un experto para empezar: los fondos indexados diversificados son un buen punto de partida para aprender invirtiendo poco a poco.",
    Planificación: "Marca un objetivo con cifra y fecha concreta (ej. '10.000€ en 3 años para la entrada de un piso') — puedes trazarlo con tu asesor en la sección Ruta.",
  };

  const formatearTiempo = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const reiniciar = () => {
    setPasoActual(0);
    setRespuestas({});
    setMostrarResultado(false);
    setSegundos(0);
  };

  if (cargandoAuth) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm font-bold text-slate-500">Cargando...</p>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 md:py-10 pb-24 antialiased">
      <div className="max-w-lg mx-auto w-full">
        <Link href="/formacion" className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-[#0B3A6E] mb-3">
          <ArrowLeft size={12} /> Volver a Academia
        </Link>

        <header className="border-b border-slate-100 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl" role="img" aria-label="Quiz">🎮</span>
            <h1 className="text-2xl md:text-3xl font-black text-[#0B3A6E] tracking-tight">Quiz Financiero</h1>
          </div>
          <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-xl font-medium leading-normal">
            40 preguntas rápidas para descubrir tus puntos fuertes y en qué deberías mejorar. Unos 7-8 minutos.
          </p>
        </header>

        {!mostrarResultado ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Pregunta {pasoActual + 1} de {PREGUNTAS.length}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-black text-slate-400">
                <Clock size={11} /> {formatearTiempo(segundos)}
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
        ) : (
          <div className="space-y-5">
            <div className="bg-[#0B3A6E] rounded-3xl p-6 text-center shadow-md">
              <Trophy size={28} className="text-[#1FA187] mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Tu puntuación financiera</p>
              <p className="text-4xl font-black text-white mt-1">{puntuacionGlobal}<span className="text-lg text-white/50">/100</span></p>
              <p className="text-[10px] text-white/60 font-medium mt-1">Completado en {formatearTiempo(segundos)}</p>
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

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles size={13} className="text-amber-600" />
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                  Tu área con más margen de mejora: {categoriaMasDebil.categoria}
                </p>
              </div>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                {RECOMENDACIONES[categoriaMasDebil.categoria]}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {puntuacionesPorCategoria.map((c) => (
                <div key={c.categoria} className="bg-white border border-slate-200 rounded-xl p-3">
                  <p className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">{c.categoria}</p>
                  <p className="text-sm font-black text-[#0B3A6E] mt-0.5">{c.puntuacion}%</p>
                </div>
              ))}
            </div>

            <button
              onClick={reiniciar}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl p-3.5 text-xs font-black uppercase tracking-wider transition-all"
            >
              <RotateCcw size={14} /> Repetir el quiz
            </button>
          </div>
        )}
      </div>
    </main>
  );
}