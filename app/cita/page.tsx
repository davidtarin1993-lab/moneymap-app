"use client";

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, MessageSquare, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface FranjaHoraria {
  hora: string;
  disponible: boolean;
  motivoBloqueo?: string;
}

export default function ReservarCitaPage() {
  // Estados para controlar los datos de la cita y la UI
  const [fecha, setFecha] = useState<string>('');
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>('');
  const [comentarios, setComentarios] = useState<string>('');
  const [enviado, setEnviado] = useState<boolean>(false);

  // 🛠️ MODIFICADO: Extendida la jornada hasta las 21:00 y simplificado el texto a "Ocupado"
  const horarioDia = useMemo<FranjaHoraria[]>(() => [
    { hora: "08:00", disponible: false, motivoBloqueo: "Ocupado" },
    { hora: "09:00", disponible: false, motivoBloqueo: "Ocupado" },
    { hora: "10:00", disponible: false, motivoBloqueo: "Ocupado" },
    { hora: "11:00", disponible: false, motivoBloqueo: "Ocupado" },
    { hora: "12:00", disponible: false, motivoBloqueo: "Ocupado" },
    { hora: "13:00", disponible: false, motivoBloqueo: "Ocupado" },
    { hora: "14:00", disponible: false, motivoBloqueo: "Ocupado" },
    { hora: "15:00", disponible: false, motivoBloqueo: "Ocupado" },
    { hora: "16:00", disponible: true },
    { hora: "17:00", disponible: true },
    { hora: "18:00", disponible: true },
    { hora: "19:00", disponible: true },
    { hora: "20:00", disponible: true },
    { hora: "21:00", disponible: true }, // NUEVO: Añadida la franja de las 21h
  ], []);

  // Función manejadora del envío (Preparada para el futuro disparo de Email API)
  const handleReservarCita = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fecha || !horaSeleccionada) return;

    const datosParaEmail = {
      fechaCita: fecha,
      horaCita: horaSeleccionada,
      detallesConsulta: comentarios,
      destinatario: "tu-correo@moneymap.com",
      fechaPeticion: new Date().toISOString()
    };

    console.log("Disparando datos para futuro Email automático:", datosParaEmail);
    setEnviado(true);
  };
  return (
    <div className="w-full min-h-[100dvh] bg-white text-slate-800 px-4 py-5 font-sans pb-32 antialiased">
      
      {/* CABECERA */}
      <header className="mb-4 border-b border-slate-100 pb-3">
        <h2 className="text-base font-black tracking-tight text-[#0B3A6E] uppercase">
          Asesoramiento Personalizado MoneyMap
        </h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Reserva una sesión estratégica para auditar tu Excel patrimonial y optimizar tu IRPF.
        </p>
      </header>

      {enviado ? (
        /* PANTALLA DE ÉXITO TRAS CONFIRMAR RESERVA */
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center my-6 flex flex-col items-center gap-3">
          <CheckCircle2 size={36} className="text-emerald-500" />
          <h3 className="text-sm font-black text-emerald-800 uppercase">¡Cita Solicitada con Éxito!</h3>
          <p className="text-xs text-emerald-700 max-w-xs leading-normal">
            La fecha <span className="font-bold">{fecha}</span> a las <span className="font-bold">{horaSeleccionada}</span> ha quedado pre-reservada. En el futuro, este botón disparará un correo de confirmación automática.
          </p>
          <button 
            onClick={() => { setEnviado(false); setHoraSeleccionada(''); setComentarios(''); }}
            className="mt-2 text-xs font-bold text-[#0B3A6E] underline"
          >
            Reservar otra cita
          </button>
        </div>
      ) : (
        <form onSubmit={handleReservarCita} className="flex flex-col gap-4">
          
          {/* SECCIÓN 1: SELECCIÓN DE FECHA */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <label className="flex items-center gap-1.5 text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">
              <Calendar size={13} /> 1. Elige la Fecha
            </label>
            <div className="relative">
              <input 
                type="date" 
                value={fecha}
                required
                onChange={(e) => setFecha(e.target.value)}
                min={new Date().toISOString().split('T')[0]} // Evita reservar días pasados
                className="w-full bg-white border border-slate-200 text-slate-800 font-semibold rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0B3A6E] transition-all"
              />
            </div>
          </div>

          {/* SECCIÓN 2: SELECCIÓN DE HORA CON BLOQUEOS */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <label className="flex items-center gap-1.5 text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">
              <Clock size={13} /> 2. Selecciona Horario Disponible
            </label>
            
            <div className="flex flex-col gap-2 max-h-[35vh] overflow-y-auto pr-0.5">
              {horarioDia.map((item) => (
                <div key={`time-slot-${item.hora}`} className="w-full">
                  {!item.disponible ? (
                    /* 🛠️ CELDA BLOQUEADA DE MAÑANA (8:00 a 15:00) REDUCIDA Y LIMPIA */
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 border border-slate-200/60 opacity-60 text-slate-400 select-none">
                      <span className="font-mono text-xs font-bold">{item.hora}</span>
                      <span className="text-[9px] font-bold uppercase tracking-tight text-rose-500/80 flex items-center gap-1 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-md">
                        <ShieldAlert size={10} /> {item.motivoBloqueo}
                      </span>
                    </div>
                  ) : (
                    /* CELDA DISPONIBLE DE TARDE */
                    <button
                      type="button"
                      onClick={() => setHoraSeleccionada(item.hora)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all ${
                        horaSeleccionada === item.hora
                          ? 'bg-[#0B3A6E] border-[#0B3A6E] text-white font-bold shadow-md'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 active:bg-slate-200'
                      }`}
                    >
                      <span className="font-mono text-xs font-extrabold">{item.hora}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        horaSeleccionada === item.hora ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#0B3A6E]'
                      }`}>
                        Disponible
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* SECCIÓN 3: COMENTARIOS Y DETALLES */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <label className="flex items-center gap-1.5 text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">
              <MessageSquare size={13} /> 3. Motivo e Información de la Cita
            </label>
            <textarea
              rows={3}
              placeholder="Escribe aquí los temas que te gustaría tratar (ej: revisar modelo de retenciones de mi nómina, dudas sobre fondos indexados...)"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 font-medium rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#0B3A6E] transition-all resize-none"
            />
          </div>

          {/* BOTÓN DE CONFIRMACIÓN PREMIUM */}
          <button
            type="submit"
            disabled={!fecha || !horaSeleccionada}
            className={`w-full text-xs font-black uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md ${
              fecha && horaSeleccionada
                ? 'bg-[#0B3A6E] text-white hover:bg-[#11498a] active:scale-[0.98]'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <Send size={12} /> Confirmar Solicitud de Cita
          </button>

        </form>
      )}

    </div>
  );
}