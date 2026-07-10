"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Filter, Wallet } from 'lucide-react';

interface RegistroFiscal {
  ejercicio: string;
  concepto: string;
  ingresoBruto: number;
  retencionIRPF: number;
  subcategoria: string;
}

interface FiscalProps {
  datosExcel: any[];
}

export default function FiscalidadClientDashboard({ datosExcel }: FiscalProps) {
  const [anioInicio, setAnioInicio] = useState<string>('');
  const [anioFin, setAnioFin] = useState<string>('');

  const datosNormalizados = useMemo<RegistroFiscal[]>(() => {
    if (!datosExcel || !Array.isArray(datosExcel)) return [];
    return datosExcel.map(r => ({
      ejercicio: String(r.ejercicio || '2024'),
      concepto: r.concepto || 'Registro',
      ingresoBruto: Number(r.ingresoBruto) || 0,
      retencionIRPF: Number(r.retencionIRPF) || 0,
      subcategoria: r.subcategoria || 'General'
    }));
  }, [datosExcel]);

  const listaAnios = useMemo(() => {
    const ejs = datosNormalizados.map(d => d.ejercicio).filter(Boolean);
    return Array.from(new Set(ejs)).sort((a, b) => a.localeCompare(b));
  }, [datosNormalizados]);

  useEffect(() => {
    if (listaAnios.length > 0) {
      setAnioInicio(listaAnios[listaAnios.length - 1]); // Preseleccionar el año más reciente de forma activa
      setAnioFin(listaAnios[listaAnios.length - 1]);
    }
  }, [listaAnios]);

  const registrosFiltrados = useMemo(() => {
    const desde = Number(anioInicio);
    const hasta = Number(anioFin);
    return datosNormalizados.filter(r => {
      const ejNum = Number(r.ejercicio);
      return ejNum >= desde && ejNum <= hasta;
    });
  }, [datosNormalizados, anioInicio, anioFin]);

  const statsFiscales = useMemo(() => {
    let ingresosTotales = 0;
    let retencionesTotales = 0;
    let resultadoDeclaracion = 0;

    registrosFiltrados.forEach(r => {
      // Limpieza de acentos idéntica a la del servidor para casar las claves al vuelo
      const conceptoClean = r.concepto.toLowerCase().trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (conceptoClean === 'ingresos totales') {
        ingresosTotales += r.ingresoBruto;
      } else if (conceptoClean === 'retenciones totales') {
        retencionesTotales += r.retencionIRPF;
      } else if (conceptoClean === 'resultado declaracion') {
        // Absorbe de forma directa la cuantía limpia del archivo Excel
        resultadoDeclaracion += r.ingresoBruto;
      }
    });

    return { ingresosTotales, retencionesTotales, resultadoDeclaracion };
  }, [registrosFiltrados]);

  const selectStyle = "w-full bg-slate-900 border border-white/10 text-white rounded-xl px-1.5 py-1 text-[11px] h-7 focus:outline-none appearance-none text-center";

  // REGLA DE NEGOCIO FISCAL: Si es positivo, sale "A pagar" (Rojo). Si es negativo o cero, "A devolver" (Verde).
  const esAPagar = statsFiscales.resultadoDeclaracion > 0;

  return (
    <div className="w-full min-h-[100dvh] bg-[#0F172A] text-white px-3 py-4 font-sans pb-32 antialiased">
      
      {/* CABECERA */}
      <header className="mb-3 border-b border-white/5 pb-2">
        <p className="text-slate-400 text-[11px] font-medium leading-none">
          Auditoría fiscal automatizada parametrizada con las métricas oficiales del documento.
        </p>
      </header>

      {/* FILTROS */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1FA187] uppercase tracking-wider mb-2">
          <Filter size={12} /> Período de Campañas Renta
        </div>
        <div className="flex flex-row gap-2">
          <div className="flex-1">
            <span className="block text-[9px] text-slate-400 font-semibold mb-1">Desde Año:</span>
            <select value={anioInicio} onChange={(e) => setAnioInicio(e.target.value)} className={selectStyle}>
              {listaAnios.map(a => <option key={`start-fisc-${a}`} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <span className="block text-[9px] text-slate-400 font-semibold mb-1">Hasta Año:</span>
            <select value={anioFin} onChange={(e) => setAnioFin(e.target.value)} className={selectStyle}>
              {listaAnios.map(a => <option key={`end-fisc-${a}`} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* KPIs SUPERIORES SIN ERRORES Y CON COLOR REACTIVO FISCAL */}
      <div className="flex flex-row gap-1.5 mb-3 w-full">
        
        {/* Tarjeta 1: Ingresos totales */}
        <div className="flex-1 bg-white/5 border border-white/10 p-1.5 rounded-xl min-w-0">
          <p className="text-slate-400 text-[8px] font-bold uppercase tracking-tight truncate">Ingresos totales</p>
          <div className="text-xs font-black text-white mt-0.5 truncate">
            {statsFiscales.ingresosTotales.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
          </div>
        </div>
        
        {/* Tarjeta 2: Retenciones totales */}
        <div className="flex-1 bg-white/5 border border-white/10 p-1.5 rounded-xl min-w-0">
          <p className="text-slate-400 text-[8px] font-bold uppercase tracking-tight truncate">Retenciones totales</p>
          <div className="text-xs font-black text-slate-300 mt-0.5 truncate">
            {statsFiscales.retencionesTotales.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
          </div>
        </div>
        
        {/* Tarjeta 3: Resultado declaración (CORREGIDA CON COLOR REACTIVO DE NEGOCIO) */}
        <div className={`flex-[1.6] p-1 border rounded-xl min-w-0 flex items-center gap-1 ${
          esAPagar 
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          <div className="p-1 bg-[#0B3A6E] rounded-md shrink-0">
            <Wallet className="w-3 h-3 text-[#1FA187]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-400 text-[7px] font-bold uppercase tracking-tight leading-none truncate">Resultado declaración</p>
            <h4 className="text-[9px] font-black mt-0.5 truncate">
              {esAPagar ? 'A Pagar' : 'A Devolver'}
            </h4>
          </div>
          <div className="text-[10px] font-black pr-1 shrink-0">
            {Math.abs(statsFiscales.resultadoDeclaracion).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
          </div>
        </div>

      </div>

    </div>
  );
}
