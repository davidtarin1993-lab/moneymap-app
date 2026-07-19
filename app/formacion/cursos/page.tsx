"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, GraduationCap, Award, Search, Clock, PlayCircle, Star, HelpCircle, Layers } from 'lucide-react';

interface Curso {
  id: string;
  titulo: string;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  duracion: string;
  modulos: number;
  progreso: number;
  instructor: string;
  valoracion: number;
  categoria: 'Fiscalidad' | 'Inversión' | 'Ahorro' | 'Trading';
  descripcion: string;
}

export default function AcademiaClientDashboard() {
  const [busqueda, setBusqueda] = useState<string>('');
  const [nivelSeleccionado, setNivelSeleccionado] = useState<string>('Todos');
  const [cursoDetalleActivo, setCursoDetalleActivo] = useState<string | null>(null);

  const cursosAcademia = useMemo<Curso[]>(() => [
    {
      id: "cur-1",
      titulo: "Estrategias de Optimización Fiscal",
      nivel: "Intermedio",
      duracion: "4h 15m",
      modulos: 6,
      progreso: 65,
      instructor: "David Fiscal Team",
      valoracion: 4.9,
      categoria: "Fiscalidad",
      descripcion: "Aprende a estructurar tus ingresos (trabajo, capital, inmobiliario) para reducir legalmente el impacto del IRPF."
    },
    {
      id: "cur-2",
      titulo: "Introducción a la Inversión Indexada",
      nivel: "Principiante",
      duracion: "2h 40m",
      modulos: 4,
      progreso: 100,
      instructor: "MoneyMap Academy",
      valoracion: 4.8,
      categoria: "Inversión",
      descripcion: "Descubre el poder del interés compuesto utilizando fondos indexados y ETFs de bajo coste con gestión pasiva."
    },
    {
      id: "cur-3",
      titulo: "Gestión Avanzada de Patrimonio y Costes",
      nivel: "Avanzado",
      duracion: "6h 20m",
      modulos: 8,
      progreso: 12,
      instructor: "Executive Advisor",
      valoracion: 5.0,
      categoria: "Ahorro",
      descripcion: "Modelos avanzados de auditoría de flujos de caja personales, segmentación de costes estructurales y optimización de capital."
    },
    {
      id: "cur-4",
      titulo: "Análisis Táctico de Criptoactivos",
      nivel: "Avanzado",
      duracion: "3h 50m",
      modulos: 5,
      progreso: 0,
      instructor: "Blockchain Specialist",
      valoracion: 4.6,
      categoria: "Trading",
      descripcion: "Evaluación de métricas on-chain, fiscalidad cripto específica y gestión del riesgo patrimonial en entornos volátiles."
    }
  ], []);

  const cursosFiltrados = useMemo(() => {
    return cursosAcademia.filter(curso => {
      const cumpleNivel = nivelSeleccionado === 'Todos' || curso.nivel === nivelSeleccionado;
      const cumpleBusqueda = curso.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
                             curso.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
                             curso.categoria.toLowerCase().includes(busqueda.toLowerCase());
      return cumpleNivel && cumpleBusqueda;
    });
  }, [cursosAcademia, busqueda, nivelSeleccionado]);

  const statsAcademia = useMemo(() => {
    const totales = cursosAcademia.length;
    const completados = cursosAcademia.filter(c => c.progreso === 100).length;
    const enProgreso = cursosAcademia.filter(c => c.progreso > 0 && c.progreso < 100).length;
    return { totales, completados, enProgreso };
  }, [cursosAcademia]);
  return (
    /* 🛠️ ENTORNO CLARO: Fondo blanco puro y textos en slate oscuro */
    <div className="w-full min-h-[100dvh] bg-white text-slate-800 px-3 py-4 font-sans pb-32 antialiased">
      
      {/* CABECERA */}
      <header className="mb-3 border-b border-slate-100 pb-2">
        <p className="text-slate-500 text-[11px] font-medium leading-none">
          Formación patrimonial estratégica, tracks de inversión y optimización fiscal avanzada.
        </p>
      </header>

      {/* BARRA DE BÚSQUEDA Y CONTROL CON FILTROS CLAROS */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 mb-3 flex flex-col gap-2">
        <div className="relative w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar cursos, categorías o estrategias..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#1FA187] transition-all"
          />
        </div>

        {/* SELECTOR DE NIVEL RÁPIDO COMPATIBLE */}
        <div className="flex gap-1.5 overflow-x-auto pt-0.5 scrollbar-none">
          {['Todos', 'Principiante', 'Intermedio', 'Avanzado'].map((nivel) => (
            <button
              key={`level-btn-${nivel}`}
              onClick={() => setNivelSeleccionado(nivel)}
              className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl border transition-all shrink-0 ${
                nivelSeleccionado === nivel
                  ? 'bg-[#0B3A6E] border-blue-600/20 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-500 active:bg-slate-100'
              }`}
            >
              {nivel}
            </button>
          ))}
        </div>
      </section>

      {/* METRICAS DE PROGRESS TRACK */}
      <div className="flex flex-row gap-1.5 mb-4 w-full">
        <div className="flex-1 bg-slate-50 border border-slate-200 p-1.5 rounded-xl min-w-0 flex items-center gap-2">
          <div className="p-1 bg-blue-50 border border-blue-100 rounded-md shrink-0">
            <BookOpen className="w-3 h-3 text-[#0B3A6E]" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 text-[7px] font-bold uppercase tracking-tight leading-none">Cursos Itinerario</p>
            <h4 className="text-[11px] font-black mt-0.5 text-slate-900">{statsAcademia.totales}</h4>
          </div>
        </div>
        <div className="flex-1 bg-slate-50 border border-slate-200 p-1.5 rounded-xl min-w-0 flex items-center gap-2">
          <div className="p-1 bg-amber-50 border border-amber-100 rounded-md shrink-0">
            <Clock className="w-3 h-3 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 text-[7px] font-bold uppercase tracking-tight leading-none">En Progreso</p>
            <h4 className="text-[11px] font-black mt-0.5 text-amber-600">{statsAcademia.enProgreso}</h4>
          </div>
        </div>
        <div className="flex-[1.2] bg-slate-50 border border-slate-200 p-1.5 rounded-xl min-w-0 flex items-center gap-2">
          <div className="p-1 bg-emerald-50 border border-emerald-100 rounded-md shrink-0">
            <Award className="w-3 h-3 text-[#1FA187]" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 text-[7px] font-bold uppercase tracking-tight leading-none">Certificaciones</p>
            <h4 className="text-[11px] font-black mt-0.5 text-emerald-600">{statsAcademia.completados} Obtb.</h4>
          </div>
        </div>
      </div>
      {/* CUADRÍCULA DE CURSOS REEQUILIBRADA EN ENTORNO CLARO */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
          <GraduationCap size={14} className="text-[#1FA187]" />
          <h3 className="text-xs font-black tracking-wider uppercase text-slate-700">Biblioteca de Formación</h3>
        </div>

        {cursosFiltrados.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-6">No se encontraron cursos que coincidan con tu track.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cursosFiltrados.map((curso) => {
              const completado = curso.progreso === 100;
              const sinIniciar = curso.progreso === 0;

              return (
                <div
                  key={`curso-card-${curso.id}`}
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl p-3 flex flex-col justify-between gap-2.5 relative hover:border-slate-300 transition-all"
                >
                  {/* Fila superior: Categoria y Etiquetas de Nivel */}
                  <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider">
                    <span className="bg-blue-50 text-[#0B3A6E] px-2 py-0.5 rounded-md border border-blue-100">
                      {curso.categoria}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md border ${
                      curso.nivel === 'Principiante' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      curso.nivel === 'Intermedio' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                      'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                      {curso.nivel}
                    </span>
                  </div>

                  {/* Título e Instructor */}
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black tracking-tight text-slate-900 leading-tight">
                      {curso.titulo}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">Por {curso.instructor}</p>
                  </div>

                  {/* Datos de Duración y Módulos */}
                  <div className="flex items-center gap-3 text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="text-slate-400" /> {curso.duracion}
                    </div>
                    <div className="flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5 text-slate-400" /> {curso.modulos} Módulos
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-600 ml-auto font-mono">
                      <Star size={9} fill="#F59E0B" className="text-amber-500" /> {curso.valoracion.toFixed(1)}
                    </div>
                  </div>

                  {/* Barra de progreso limpia */}
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
                      <span>Progreso del Curso</span>
                      <span className="font-mono text-slate-800 font-black">{curso.progreso}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          completado ? 'bg-emerald-500' : 'bg-[#1FA187]'
                        }`} 
                        style={{ width: `${curso.progreso}%` }} 
                      />
                    </div>
                  </div>

                  {/* Botones de Acción y Temarios flotantes claros */}
                  <div className="flex items-center justify-between pt-1 gap-1">
                    <button
                      onClick={() => setCursoDetalleActivo(cursoDetalleActivo === curso.id ? null : curso.id)}
                      className="text-[9px] font-extrabold text-slate-400 flex items-center gap-0.5 hover:text-slate-700"
                    >
                      <HelpCircle size={10} /> Temario
                    </button>

                    <button className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl flex items-center gap-1 transition-all ${
                      completado ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      sinIniciar ? 'bg-[#1FA187] text-white hover:bg-[#1fa187]/90' :
                      'bg-amber-500 text-slate-950 font-black hover:bg-amber-400'
                    }`}>
                      <PlayCircle size={11} /> 
                      {completado ? 'Repasar' : sinIniciar ? 'Iniciar' : 'Continuar'}
                    </button>

                    {/* Pop-up flotante de Temario con contraste claro */}
                    {cursoDetalleActivo === curso.id && (
                      <div className="absolute left-0 right-0 bottom-full mb-2 bg-white border border-slate-200 p-2.5 rounded-xl text-[10px] text-slate-600 z-50 shadow-xl space-y-1">
                        <p className="font-black text-[#1FA187] uppercase tracking-wider text-[8px]">Ficha de Estrategia:</p>
                        <p className="leading-normal font-medium">{curso.descripcion}</p>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
