"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, ArrowRight, CheckCircle2, Sparkles, X, MessageCircleQuestion, TrendingUp, Home, Target, LineChart } from 'lucide-react';
import TourInteractivo from "@/components/TourInteractivo";

const CARACTERISTICAS = [
  "Análisis automatizado de tus gastos e ingresos.",
  "Estudio y optimización de tu estructura fiscal.",
  "Trazamos tus objetivos y te acompañamos en su seguimiento.",
  "Aprende de finanzas y mantente siempre actualizado.",
  "Sigue en tiempo real la cartera oficial de MoneyMap.",
];

const PRECIO_MENSUAL = 9.99;
const PRECIO_ANUAL = 99.99;
const EQUIVALENTE_MENSUAL_ANUAL = (PRECIO_ANUAL / 12).toFixed(2);
const PORCENTAJE_AHORRO = Math.round(((PRECIO_MENSUAL * 12 - PRECIO_ANUAL) / (PRECIO_MENSUAL * 12)) * 100);

export default function LandingPage() {
  const [emailLead, setEmailLead] = useState('');
  const [mostrarTour, setMostrarTour] = useState(false);
  const [mostrarConsulta, setMostrarConsulta] = useState(false);

  // Registro del cliente
  const [planLead, setPlanLead] = useState<'mensual' | 'anual'>('mensual');
  const [nombreLead, setNombreLead] = useState('');
  const [apellidoLead, setApellidoLead] = useState('');
  const [fechaNacimientoLead, setFechaNacimientoLead] = useState('');
  const [enviandoLead, setEnviandoLead] = useState(false);
  const [enviadoLead, setEnviadoLead] = useState(false);
  const [errorLead, setErrorLead] = useState('');

  // Formulario de consulta (pop-up)
  const [nombreConsulta, setNombreConsulta] = useState('');
  const [emailConsulta, setEmailConsulta] = useState('');
  const [mensajeConsulta, setMensajeConsulta] = useState('');
  const [enviandoConsulta, setEnviandoConsulta] = useState(false);
  const [enviadoConsulta, setEnviadoConsulta] = useState(false);
  const [errorConsulta, setErrorConsulta] = useState('');

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLead('');
    setEnviandoLead(true);
    try {
      const res = await fetch('/api/bienvenida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailLead,
          nombre: nombreLead,
          apellido: apellidoLead,
          fechaNacimiento: fechaNacimientoLead,
          plan: planLead,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar el email.');
      setEnviadoLead(true);
      setNombreLead('');
      setApellidoLead('');
      setFechaNacimientoLead('');
      setEmailLead('');
    } catch (err) {
      setErrorLead(err instanceof Error ? err.message : 'Error inesperado.');
    } finally {
      setEnviandoLead(false);
    }
  };

  const handleConsultaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorConsulta('');
    setEnviandoConsulta(true);
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreConsulta,
          email: emailConsulta,
          mensaje: mensajeConsulta,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar la consulta.');
      setEnviadoConsulta(true);
      setNombreConsulta('');
      setEmailConsulta('');
      setMensajeConsulta('');
    } catch (err) {
      setErrorConsulta(err instanceof Error ? err.message : 'Error inesperado.');
    } finally {
      setEnviandoConsulta(false);
    }
  };

  const cerrarConsulta = () => {
    setMostrarConsulta(false);
    setEnviadoConsulta(false);
    setErrorConsulta('');
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-800 font-sans antialiased flex flex-col overflow-x-hidden selection:bg-[#0B3A6E]/10">

      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-3 flex items-center justify-between border-b border-slate-200/60 relative z-10">
        <div className="flex items-center">
          <Image
            src="/Multimedia/portada.png"
            alt="MoneyMap"
            width={240}
            height={70}
            className="object-contain"
            priority
            unoptimized
          />
        </div>

        <Link
          href="/login"
          className="text-xs font-black uppercase tracking-wider px-5 py-2.5 bg-[#0B3A6E] hover:bg-[#11498a] rounded-xl text-white transition-all flex items-center gap-1.5 shadow-sm"
        >
          <User size={14} /> Acceso Clientes
        </Link>
      </nav>

      {/* 2. CONTENIDO CENTRAL */}
      <main className="w-full max-w-6xl mx-auto px-6 py-5 flex-1 flex flex-col items-center justify-center relative z-10 space-y-5">

        {/* Titular Principal de Impacto */}
      <div className="text-center space-y-2 max-w-3xl">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight uppercase text-[#0B3A6E]">
            Tu dinero necesita <span className="text-[#1FA187]">dirección</span>, no más esfuerzo.
        </h1>
        <p className="text-slate-500 text-xs md:text-sm font-semibold max-w-xl mx-auto">
          Herramientas patrimoniales y consultoría experta en una sola suscripción.
        </p>
      </div>

        {/* BLOQUE 1: ASÍ FUNCIONA + TODO LO QUE INCLUYE */}
        <div className="w-full max-w-xl mx-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">            
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#1FA187]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#0B3A6E]">
                Así funciona MoneyMap
              </h2>
            </div>

            <ul className="space-y-3 text-left">
              {CARACTERISTICAS.map((texto, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-bold">
                  <CheckCircle2 size={15} className="text-[#1FA187] shrink-0 mt-0.5" />
                  <span>{texto}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMostrarTour(true)}
                className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#0B3A6E] bg-white border border-[#0B3A6E]/15 px-3 py-2.5 rounded-xl hover:bg-[#0B3A6E]/5 transition-all"
              >
                <Sparkles size={12} />
                Ver recorrido interactivo
              </button>

              <button
                type="button"
                onClick={() => setMostrarConsulta(true)}
                className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white bg-[#0B3A6E] hover:bg-[#11498a] px-3 py-2.5 rounded-xl transition-all"
              >
                <MessageCircleQuestion size={12} />
                ¿Tienes dudas? Escríbenos
              </button>
            </div>
          </div>
        </div>
        {/* BLOQUE PRUÉBANOS GRATIS */}
        <div className="w-full max-w-xl mx-auto">
          <div className="bg-gradient-to-br from-[#0B3A6E] to-[#0B3A6E]/90 rounded-3xl p-7 shadow-lg relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#1FA187]/25 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 text-center mb-5">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#1FA187] bg-[#1FA187]/15 px-3 py-1.5 rounded-full mb-3">
                <Sparkles size={11} /> Pruébalo gratis ahora
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                Pruébanos antes de decidir
              </h2>
              <p className="text-white/60 text-xs font-medium mt-1.5 max-w-sm mx-auto">
               Prueba la demo y descubre lo que tienes dentro. Sin cuenta, sin compromiso — y esto es solo una pequeña parte de todo lo que te espera.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <Link href="/test/hipoteca" className="flex flex-col items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-3.5 transition-all text-center">
                <Home size={20} className="text-[#1FA187]" />
                <span className="text-[10px] font-black uppercase tracking-wide text-white leading-tight">
                  Simula tu hipoteca
                </span>
              </Link>

              <Link href="/test/perfil-inversor" className="flex flex-col items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-3.5 transition-all text-center">
                <Target size={20} className="text-[#1FA187]" />
                <span className="text-[10px] font-black uppercase tracking-wide text-white leading-tight">
                  Tu perfil inversor
                </span>
              </Link>

              <Link href="/test/quiz" className="flex flex-col items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-3.5 transition-all text-center">
                <Sparkles size={20} className="text-[#1FA187]" />
                <span className="text-[10px] font-black uppercase tracking-wide text-white leading-tight">
                  Quiz financiero
                </span>
              </Link>

              <Link href="/test/proyeccion" className="flex flex-col items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-3.5 transition-all text-center">
                <LineChart size={20} className="text-[#1FA187]" />
                <span className="text-[10px] font-black uppercase tracking-wide text-white leading-tight">
                  Proyecta tu ahorro
                </span>
              </Link>
              <Link href="/test/analizador-gastos" className="flex flex-col items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-3.5 transition-all text-center">
                <TrendingUp size={20} className="text-[#1FA187]" />
                <span className="text-[10px] font-black uppercase tracking-wide text-white leading-tight">
                  Analiza tus gastos
                </span>
              </Link>             

              <div className="flex flex-col items-center justify-center gap-1 bg-[#1FA187]/15 border border-[#1FA187]/30 rounded-2xl p-3.5 text-center">
                <span className="text-[10px] font-black uppercase tracking-wide text-[#1FA187] leading-tight">
                  Mucho más...
                </span>
                <span className="text-[9px] text-white/50 font-medium leading-tight">
                  dentro de MoneyMap
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* BLOQUE 2: SUSCRIPCIÓN */}
        <div className="w-full max-w-xl mx-auto">
          <div className="bg-slate-50 border-2 border-[#0B3A6E]/30 rounded-3xl p-8 flex flex-col justify-between shadow-xs relative group hover:border-[#1FA187]/60 transition-all">
            <div className="absolute top-1 right-4 bg-[#0B3A6E] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
              Acceso en 24 horas
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1FA187]">Suscripción</h3>

              {/* Selector Mensual / Anual */}
              <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setPlanLead('mensual')}
                  className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
                    planLead === 'mensual' ? 'bg-[#0B3A6E] text-white' : 'text-slate-500'
                  }`}
                >
                  Mensual
                </button>
                <button
                  type="button"
                  onClick={() => setPlanLead('anual')}
                  className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    planLead === 'anual' ? 'bg-[#0B3A6E] text-white' : 'text-slate-500'
                  }`}
                >
                  Anual
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${planLead === 'anual' ? 'bg-[#1FA187] text-white' : 'bg-[#1FA187]/10 text-[#1FA187]'}`}>
                    -{PORCENTAJE_AHORRO}%
                  </span>
                </button>
              </div>

              <div className="flex items-baseline gap-1">
                {planLead === 'mensual' ? (
                  <>
                    <span className="text-4xl font-black text-[#0B3A6E]">{PRECIO_MENSUAL}€</span>
                    <span className="text-slate-500 text-xs font-bold">/ al mes</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-black text-[#0B3A6E]">{PRECIO_ANUAL}€</span>
                    <span className="text-slate-500 text-xs font-bold">/ al año</span>
                    <span className="text-[10px] text-[#1FA187] font-black ml-1">
                      (equivale a {EQUIVALENTE_MENSUAL_ANUAL}€/mes)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Captación de email estilo Netflix abajo */}
            {enviadoLead ? (
              <div className="mt-8 pt-6 border-t border-slate-200 text-center space-y-2 py-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 size={20} />
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">¡Revisa tu correo!</h4>
                <p className="text-[11px] text-slate-500 font-medium px-4">
                  Te hemos enviado un email de bienvenida. Si no lo ves en tu bandeja de entrada en unos minutos, revisa también la carpeta de spam o promociones.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="mt-8 pt-6 border-t border-slate-200 space-y-3">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider text-center md:text-left">
                  ¿Quieres empezar ya? Regístrate:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nombre"
                    value={nombreLead}
                    onChange={(e) => setNombreLead(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1FA187] font-medium shadow-2xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Apellidos"
                    value={apellidoLead}
                    onChange={(e) => setApellidoLead(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1FA187] font-medium shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaNacimientoLead}
                    onChange={(e) => setFechaNacimientoLead(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1FA187] font-medium shadow-2xs"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Tu correo electrónico"
                    value={emailLead}
                    onChange={(e) => setEmailLead(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 text-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#1FA187] font-medium shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={enviandoLead}
                    className="bg-[#1FA187] hover:bg-[#198771] disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shadow-sm"
                  >
                    {enviandoLead ? 'Enviando...' : <>Empezar <ArrowRight size={14} /></>}
                  </button>
                </div>
                {errorLead && (
                  <p className="text-red-500 text-[10px] font-bold text-center">{errorLead}</p>
                )}
              </form>
            )}

          </div>
        </div>
      </main>

      {/* 3. MODAL: TOUR INTERACTIVO */}
      {mostrarTour && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setMostrarTour(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all z-10"
            >
              <X size={16} />
            </button>

            <div className="p-6 md:p-8">
              <TourInteractivo />
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: FORMULARIO DE CONSULTA */}
      {mostrarConsulta && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl relative">
            <button
              onClick={cerrarConsulta}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all z-10"
            >
              <X size={16} />
            </button>

            <div className="p-6 md:p-8">
              {enviadoConsulta ? (
                <div className="text-center space-y-2 py-6">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 size={20} />
                  </div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">¡Consulta enviada!</h4>
                  <p className="text-[11px] text-slate-500 font-medium px-4">
                    Te responderemos lo antes posible al email que nos has indicado.
                  </p>
                  <button
                    onClick={cerrarConsulta}
                    className="mt-2 text-[10px] font-black uppercase tracking-wider text-[#0B3A6E] underline"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircleQuestion size={16} className="text-[#0B3A6E]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0B3A6E]">
                      Cuéntanos tu duda
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mb-4">
                    Te responderemos por email lo antes posible.
                  </p>

                  <form onSubmit={handleConsultaSubmit} className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre"
                      value={nombreConsulta}
                      onChange={(e) => setNombreConsulta(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1FA187] font-medium shadow-2xs"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Tu correo electrónico"
                      value={emailConsulta}
                      onChange={(e) => setEmailConsulta(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1FA187] font-medium shadow-2xs"
                    />
                    <textarea
                      required
                      rows={4}
                      placeholder="¿Qué te gustaría saber?"
                      value={mensajeConsulta}
                      onChange={(e) => setMensajeConsulta(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1FA187] font-medium shadow-2xs resize-none"
                    />

                    <button
                      type="submit"
                      disabled={enviandoConsulta}
                      className="w-full bg-[#0B3A6E] hover:bg-[#11498a] disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      {enviandoConsulta ? 'Enviando...' : <>Enviar consulta <ArrowRight size={14} /></>}
                    </button>

                    {errorConsulta && (
                      <p className="text-red-500 text-[10px] font-bold text-center">{errorConsulta}</p>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. PIE DE PÁGINA */}
      <footer className="w-full text-center py-2 border-t border-slate-100 text-slate-400 text-[9px] font-bold tracking-wide uppercase bg-white z-10 relative">
        © {new Date().getFullYear()} MoneyMap. Todos los derechos reservados.
      </footer>

    </div>
  );
}