"use client";

import React, { useState } from 'react';
import { Shield, BarChart2, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Option {
  text: string;
  points: number; // Conservador = 1, Moderado = 2, Agresivo = 3
}

interface Question {
  id: number;
  questionText: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    questionText: "¿Cuál es tu principal objetivo financiero?",
    options: [
      { text: "Proteger mi dinero y evitar pérdidas a toda costa.", points: 1 },
      { text: "Lograr un equilibrio entre crecimiento estable y seguridad.", points: 2 },
      { text: "Maximizar mis ganancias a largo plazo, asumiendo riesgos.", points: 3 },
    ],
  },
  {
    id: 2,
    questionText: "Si tu inversión cae un 20% debido al mercado, ¿qué haces?",
    options: [
      { text: "Vendo todo inmediatamente para no perder más capital.", points: 1 },
      { text: "Mantengo la inversión esperando que el mercado se recupere.", points: 2 },
      { text: "Compro más acciones aprovechando los precios bajos.", points: 3 },
    ],
  },
  {
    id: 3,
    questionText: "¿Por cuánto tiempo planeas mantener tus inversiones?",
    options: [
      { text: "A corto plazo: Menos de 2 años.", points: 1 },
      { text: "A medio plazo: Entre 3 y 5 años.", points: 2 },
      { text: "A largo plazo: Más de 5 o 10 años.", points: 3 },
    ],
  },
  {
    id: 4,
    questionText: "¿Cuál es tu nivel de conocimiento sobre mercados financieros?",
    options: [
      { text: "Bajo. Prefiero depósitos y productos garantizados.", points: 1 },
      { text: "Medio. Entiendo los fondos indexados y la renta fija/variable.", points: 2 },
      { text: "Alto. Invierto de forma habitual en bolsa, ETFs o criptoactivos.", points: 3 },
    ],
  },
  {
    id: 5,
    questionText: "¿Qué porcentaje de tus ingresos mensuales puedes destinar a la inversión?",
    options: [
      { text: "Menos del 10%, mi presupuesto actual es bastante ajustado.", points: 1 },
      { text: "Entre el 10% y el 25%, tengo capacidad de ahorro estable.", points: 2 },
      { text: "Más del 25%, mis finanzas están muy saneadas.", points: 3 },
    ],
  },
  {
    id: 6,
    questionText: "De las siguientes opciones, ¿cuál describe mejor tu situación laboral?",
    options: [
      { text: "Ingresos variables (Autónomo o desempleado actualmente).", points: 1 },
      { text: "Ingresos estables (Empleado por cuenta ajena con contrato).", points: 2 },
      { text: "Ingresos muy seguros (Funcionario del Estado o pensionista).", points: 3 },
    ],
  },
  {
    id: 7,
    questionText: "Si te ofrecen una inversión donde puedes ganar mucho pero también perder la mitad de lo invertido:",
    options: [
      { text: "No me interesa en absoluto, prefiero dormir tranquilo.", points: 1 },
      { text: "Lo evaluaría detenidamente metiendo solo una cantidad mínima.", points: 2 },
      { text: "Invierto sin dudarlo, el que no arriesga no gana.", points: 3 },
    ],
  },
  {
    id: 8,
    questionText: "¿Qué es lo que más te preocuparía tras realizar una inversión?",
    options: [
      { text: "Ver que el saldo disminuye respecto al día anterior.", points: 1 },
      { text: "Que la rentabilidad no consiga superar a la inflación actual.", points: 2 },
      { text: "Perder una gran oportunidad del mercado por ser cobarde.", points: 3 },
    ],
  },
];

export default function TestInversor() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (points: number) => {
    const nextScore = score + points;
    setScore(nextScore);

    if (currentQuestion + 1 < QUESTIONS.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
  };

  const getProfile = () => {
    // Escala basada en 8 preguntas (Mínimo: 8 puntos, Máximo: 24 puntos)
    if (score <= 12) {
      return {
        title: "Conservador",
        desc: "Priorizas la seguridad de tu capital. Prefieres rentabilidades bajas pero estables antes que arriesgarte a sufrir pérdidas temporales.",
        icon: Shield,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      };
    } else if (score <= 18) {
      return {
        title: "Moderado",
        desc: "Buscas un equilibrio. Estás dispuesto a asumir fluctuaciones moderadas a cambio de un crecimiento superior a la inflación.",
        icon: BarChart2,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      };
    } else {
      return {
        title: "Agresivo",
        desc: "Buscas la máxima rentabilidad. Comprendes perfectamente la volatilidad del mercado y toleras caídas fuertes a corto plazo para ganar más a largo plazo.",
        icon: Zap,
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      };
    }
  };

  const profile = getProfile();

  return (
    <section className="bg-[#0F172A] rounded-2xl p-5 mt-4 shadow-xl border border-white/10 text-white max-w-md mx-auto">
      
      {showResult ? (
        <div className="flex flex-col items-center text-center py-4">
          <div className={`p-4 rounded-full border ${profile.color} mb-4`}>
            <profile.icon size={40} />
          </div>
          
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tu perfil es</p>
          <h3 className="text-3xl font-black mt-1 tracking-tight text-white">{profile.title}</h3>
          
          <p className="mt-3 text-sm text-slate-300 leading-relaxed px-2">
            {profile.desc}
          </p>

          <button
            onClick={resetQuiz}
            className="mt-6 flex items-center gap-2 bg-[#0B3A6E] hover:bg-[#144d8c] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all w-full justify-center shadow-lg"
          >
            <RefreshCw size={16} />
            Repetir test
          </button>
        </div>
      ) : (
        <div>
          {/* Encabezado e indicador de progreso compacto */}
          <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
            <h3 className="text-base font-black tracking-tight flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#1FA187]" />
              Perfil de Inversor
            </h3>
            <span className="text-xs font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
              {currentQuestion + 1} de {QUESTIONS.length}
            </span>
          </div>

          {/* Enunciado de la pregunta */}
          <h4 className="text-base font-bold leading-snug min-h-[48px] text-slate-100">
            {QUESTIONS[currentQuestion].questionText}
          </h4>

          {/* Opciones de respuesta apretaditas */}
          <div className="flex flex-col gap-2.5 mt-4">
            {QUESTIONS[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option.points)}
                className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/5 active:bg-[#0B3A6E] active:border-[#0B3A6E] p-3 rounded-xl transition-all text-xs font-medium leading-normal text-slate-300 hover:text-white"
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
