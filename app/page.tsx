"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, ArrowRight, CheckCircle2, CalendarDays, Info, ShieldCheck, X, Undo2, Send, Calendar, Clock, MessageSquare, Mail } from 'lucide-react';

export default function LandingPage() {
  const [emailLead, setEmailLead] = useState('');
  
  // Estados para la tarjeta interactiva del Experto
  const [mostrarInformacion, setMostrarInformacion] = useState(false);
  const [mostrarModalCita, setMostrarModalCita] = useState(false);

  // Campos del formulario de reserva
  const [fechaCita, setFechaCita] = useState('');
  const [horaCita, setHoraCita] = useState('');
  const [emailCita, setEmailCita] = useState('');
  const [mensajeCita, setMensajeCita] = useState('');
  const [enviadoCita, setEnviadoCita] = useState(false);
  const [enviandoCita, setEnviandoCita] = useState(false);
  const [errorCita, setErrorCita] = useState('');

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Correo registrado con éxito: ${emailLead}`);
    setEmailLead('');
  };

const handleReservaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCita('');
    setEnviandoCita(true);

    try {
      const res = await fetch('/api/reservar-cita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha: fechaCita,
          hora: horaCita,
          email: emailCita,
          mensaje: mensajeCita,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo enviar la solicitud.');
      }

      setEnviadoCita(true);
      setTimeout(() => {
        setMostrarModalCita(false);
        setEnviadoCita(false);
        setFechaCita('');
        setHoraCita('');
        setEmailCita('');
        setMensajeCita('');
      }, 3000);
    } catch (err) {
      setErrorCita(err instanceof Error ? err.message : 'Error inesperado.');
    } finally {
      setEnviandoCita(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-800 font-sans antialiased flex flex-col justify-between overflow-x-hidden selection:bg-[#0B3A6E]/10">
      
      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-200/60 relative z-10">
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
      {/* 2. CONTENIDO CENTRAL ESTRUCTURA NETFLIX EN TONOS CLAROS */}
      <main className="w-full max-w-6xl mx-auto px-6 pt-12 pb-20 flex flex-col items-center justify-center relative z-10 space-y-12">
        
        {/* Titular Principal de Impacto */}
        <div className="text-center space-y-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight uppercase text-[#0B3A6E]">
            Tu dinero necesita <span className="text-[#1FA187]">dirección</span>, <br /> no más esfuerzo.
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-semibold max-w-xl mx-auto">
            Herramientas patrimoniales y consultoría experta en una sola suscripción sin permanencia.
          </p>
        </div>

        {/* CONTENEDOR BILATERAL DE PLANES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-stretch">
          
          {/* BLOQUE IZQUIERDO: SUSCRIPCIÓN COMPLETA DE HERRAMIENTAS */}
          <div className="bg-slate-50 border-2 border-[#0B3A6E]/30 rounded-3xl p-8 flex flex-col justify-between shadow-xs relative group hover:border-[#1FA187]/60 transition-all">
            <div className="absolute top-4 right-4 bg-[#0B3A6E] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
              Acceso en 24 horas
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1FA187]">Suscripción</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#0B3A6E]">15€</span>
                  <span className="text-slate-500 text-xs font-bold">/ al mes</span>
                </div>
              </div>

              {/* Lista de características */}
              <ul className="space-y-3 text-left">
                <li className="flex items-start gap-2.5 text-xs text-slate-600 font-bold">
                  <CheckCircle2 size={15} className="text-[#1FA187] shrink-0 mt-0.5" />
                  <span>Análisis automatizado de tus gastos e ingresos.</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-600 font-bold">
                  <CheckCircle2 size={15} className="text-[#1FA187] shrink-0 mt-0.5" />
                  <span>Estudio y optimización de tu estructura fiscal.</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-600 font-bold">
                  <CheckCircle2 size={15} className="text-[#1FA187] shrink-0 mt-0.5" />
                  <span>Aprende de finanzas y mantente siempre actualizado.</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-600 font-bold">
                  <CheckCircle2 size={15} className="text-[#1FA187] shrink-0 mt-0.5" />
                  <span>Sigue en tiempo real la cartera oficial de MoneyMap.</span>
                </li>
              </ul>
            </div>

            {/* Captación de email estilo Netflix abajo */}
            <form onSubmit={handleLeadSubmit} className="mt-8 pt-6 border-t border-slate-200 space-y-3">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider text-center md:text-left">
                ¿Quieres empezar ya? Introduce tu correo:
              </p>
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
                  className="bg-[#1FA187] hover:bg-[#198771] text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shadow-sm"
                >
                  Empezar <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>

          {/* BLOQUE DERECHO INTERACTIVO: ASESORAMIENTO UNO A UNO */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-xs relative min-h-[380px] transition-all duration-300">
            
            {/* Cabecera dinámica de la tarjeta */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#1FA187]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consultoría Estratégica</span>
              </div>
              
              {!mostrarInformacion ? (
                <button 
                  onClick={() => setMostrarInformacion(true)}
                  className="text-[10px] font-black bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 uppercase tracking-wider shadow-2xs"
                >
                  <Info size={11} /> Experto
                </button>
              ) : (
                <button 
                  onClick={() => setMostrarInformacion(false)}
                  className="text-[10px] font-black bg-[#0B3A6E] text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 uppercase tracking-wider shadow-2xs"
                >
                  <Undo2 size={11} /> Volver
                </button>
              )}
            </div>

           {/* VISTA A: MENSAJE COMERCIAL (FRONT) */}
            {!mostrarInformacion ? (
              <div className="w-full my-auto py-4 text-left space-y-3.5">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-[#0B3A6E] uppercase tracking-tight">
                    Asesoramiento Uno a Uno
                  </h3>
                  <p className="text-slate-600 text-xs font-bold leading-normal">
                    ¿Te quedan dudas o necesitas un plan a tu medida? 
                  </p>
                </div>
                
                {/* Lista de viñetas profesionales */}
                <ul className="space-y-2 text-left">
                  <li className="flex items-start gap-2 text-slate-500 text-[11px] font-semibold leading-normal">
                    <span className="text-[#1FA187] font-black mt-0.5">•</span>
                    <span>Diseñamos una estrategia patrimonial adaptada a tus objetivos específicos de inversión y protección.</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-500 text-[11px] font-semibold leading-normal">
                    <span className="text-[#1FA187] font-black mt-0.5">•</span>
                    <span>Analizamos y comparamos tus propuestas de financiación e hipotecas para asegurar las mejores condiciones del mercado.</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-500 text-[11px] font-semibold leading-normal">
                    <span className="text-[#1FA187] font-black mt-0.5">•</span>
                    <span>Formación y resolución de consultas complejas.</span>
                  </li>
                </ul>
              </div>
            ) : (
              /* VISTA B: MI INFORMACIÓN Y PERFIL (BACK) */
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center my-auto py-4">
                <div className="sm:col-span-4 flex justify-center">
                  <Image 
                    src="/Multimedia/experto.png" 
                    alt="David Tarín"
                    width={128}
                    height={128}
                    className="object-cover rounded-2xl border-2 border-[#1FA187]"
                    unoptimized
                  />
                </div>
                
                <div className="sm:col-span-8 text-center sm:text-left space-y-1.5">
                  <h3 className="text-sm font-black text-[#0B3A6E] uppercase tracking-tight">David Tarín</h3>
                  <p className="text-[10px] font-black text-[#1FA187] uppercase tracking-widest">Asesor Estratégico Principal</p>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                    Máster especializado en dirección financiera y gestión patrimonial avanzada con certificación regulatoria oficial para el asesoramiento de inversiones. Cuenta con una sólida trayectoria en analítica de datos aplicada a la Banca Privada, optimización fiscal corporativa y desarrollo de herramientas fintech de gestión de flujos de caja. Profesor en programas de posgrado financieros enfocados en la eficiencia patrimonial.
                  </p>
                </div>
              </div>
            )}

            {/* Botón de acción de reserva */}
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => setMostrarModalCita(true)}
                className="w-full bg-white text-[#0B3A6E] text-xs font-black uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all border border-slate-200 shadow-2xs"
              >
                <CalendarDays size={14} /> Reservar Sesión con Experto
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* 3. POPUP MODAL INTERACTIVO DE RESERVA DE CITA */}
      {mostrarModalCita && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl relative space-y-4">
            
            {/* Cerrar modal */}
            <button 
              onClick={() => setMostrarModalCita(false)}
              className="absolute top-4 right-4 p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 bg-[#0B3A6E]/5 text-[#0B3A6E] rounded-full flex items-center justify-center mx-auto">
                <CalendarDays size={20} />
              </div>
              <h3 className="text-base font-black text-[#0B3A6E] uppercase tracking-tight">Agendar Sesión de Consultoría</h3>
       <p className="text-[11px] text-slate-400 font-medium">Selecciona tu horario y detalla tu consulta financiera.</p>
          </div>

          {enviadoCita ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">¡Solicitud Enviada!</h4>
              <p className="text-[11px] text-slate-500 font-medium">Recibirás respuesta en menos de 24 horas.</p>
            </div>
          ) : (
            <form onSubmit={handleReservaSubmit} className="space-y-3.5">
              
              {/* Inputs de fecha y hora agrupados */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1"><Calendar size={10}/> Fecha</label>
                  <input 
                    type="date" 
                    required 
                    value={fechaCita}
                    onChange={(e) => setFechaCita(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1"><Clock size={10}/> Hora (Desde 16:00)</label>
                  <select
                    required
                    value={horaCita}
                    onChange={(e) => setHoraCita(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
                  >
                    <option value="" disabled>Selecciona hora</option>
                    {Array.from({ length: 13 }, (_, i) => {
                      const totalMinutos = 16 * 60 + i * 30; // desde las 16:00, cada 30 min
                      const h = Math.floor(totalMinutos / 60).toString().padStart(2, '0');
                      const m = (totalMinutos % 60).toString().padStart(2, '0');
                      const valor = `${h}:${m}`;
                      return <option key={valor} value={valor}>{valor}</option>;
                    })}
                  </select>
                </div>
              </div>

              {/* Input de correo electrónico */}
              <div className="space-y-1">
                <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1"><Mail size={10}/> Correo Electrónico</label>
                <input 
                  type="email" 
                  required 
                  placeholder="ejemplo@correo.com"
                  value={emailCita}
                  onChange={(e) => setEmailCita(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
                />
              </div>

              {/* Input de consulta */}
              <div className="space-y-1">
                <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1"><MessageSquare size={10}/> ¿Qué necesitas consultar?</label>
                <textarea 
                  required 
                  rows={3}
                  placeholder="Detalla brevemente tu situación financiera o dudas impositivas..."
                  value={mensajeCita}
                  onChange={(e) => setMensajeCita(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium resize-none"
                />
              </div>

              {errorCita && (
                <p className="text-red-500 text-[10px] font-bold text-center">{errorCita}</p>
              )}

              {/* Botón de envío modificado */}
              <button
                type="submit"
                disabled={enviandoCita}
                className="w-full bg-[#1FA187] hover:bg-[#198771] disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#1FA187]/10"
              >
                <Send size={12} /> {enviandoCita ? 'Enviando...' : 'Solicitar Cita'}
              </button>
            </form>
          )}

        </div>
      </div>
    )}

    {/* 4. PIE DE PÁGINA */}
    <footer className="w-full text-center py-6 border-t border-slate-100 text-slate-400 text-[10px] font-bold tracking-wide uppercase bg-white z-10 relative">
      © {new Date().getFullYear()} MoneyMap. Todos los derechos reservados.
    </footer>

  </div>
);
}