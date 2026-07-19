"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Filter, Wallet, BarChart3, HelpCircle } from 'lucide-react';

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
  const [explicacionActiva, setExplicacionActiva] = useState<string | null>(null);

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
      setAnioInicio(listaAnios[0]);
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

    let totalTrabajoRango = 0;
    let totalMobiliarioRango = 0;
    let totalInmobiliarioRango = 0;
    let totalGananciasRango = 0;

    const desde = Number(anioInicio);
    const hasta = Number(anioFin);
    const añosAFiltrar = listaAnios.filter(a => {
      const n = Number(a);
      return n >= desde && n <= hasta;
    });

    registrosFiltrados.forEach(r => {
      const conceptoClean = r.concepto.toLowerCase().trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (conceptoClean === 'ingresos totales') {
        ingresosTotales += r.ingresoBruto;
      } else if (conceptoClean === 'retenciones totales') {
        retencionesTotales += r.retencionIRPF;
      } else if (conceptoClean === 'resultado declaracion') {
        resultadoDeclaracion += r.ingresoBruto;
      }

      if (conceptoClean === 'ingresos trabajo') totalTrabajoRango += r.ingresoBruto;
      if (conceptoClean === 'ingresos capital mobiliario') totalMobiliarioRango += r.ingresoBruto;
      if (conceptoClean === 'ingresos inmobiliarios netos') totalInmobiliarioRango += r.ingresoBruto;
      if (conceptoClean === 'ganancias patrimoniales') totalGananciasRango += r.ingresoBruto;
    });

    const puntosEvolutivo = añosAFiltrar.map(año => {
      let trabajo = 0;
      let mobiliario = 0;
      let inmobiliario = 0;
      let patrimoniales = 0;

      datosNormalizados.filter(r => r.ejercicio === año).forEach(r => {
        const cClean = r.concepto.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (cClean === 'ingresos trabajo') trabajo += r.ingresoBruto;
        if (cClean === 'ingresos capital mobiliario') mobiliario += r.ingresoBruto;
        if (cClean === 'ingresos inmobiliarios netos') inmobiliario += r.ingresoBruto;
        if (cClean === 'ganancias patrimoniales') patrimoniales += r.ingresoBruto;
      });

      const totalAño = trabajo + mobiliario + inmobiliario + patrimoniales;

      return {
        label: `Año ${año}`,
        total: totalAño,
        desglose: [
          { nombre: "Trabajo", valor: trabajo, pct: totalAño > 0 ? (trabajo / totalAño) * 100 : 0, color: "#1FA187" },
          { nombre: "Mobiliario", valor: mobiliario, pct: totalAño > 0 ? (mobiliario / totalAño) * 100 : 0, color: "#0B3A6E" },
          { nombre: "Inmobiliario", valor: inmobiliario, pct: totalAño > 0 ? (inmobiliario / totalAño) * 100 : 0, color: "#38BDF8" },
          { nombre: "Ganancias", valor: patrimoniales, pct: totalAño > 0 ? (patrimoniales / totalAño) * 100 : 0, color: "#F59E0B" }
        ]
      };
    });

    const totalColumnas = puntosEvolutivo.length;
    const valoresAnuales = puntosEvolutivo.map(d => d.total);
    const maxValRango = Math.max(...valoresAnuales, 1); 
    const altoGraficoMaximo = 105;

    const pathIngresosTotales = puntosEvolutivo.map((añoData, idx) => {
      const anchoBarra = totalColumnas > 2 ? 46 : 62;
      const xMargin = 20;
      const widthDisponible = 280 - anchoBarra;
      const x = totalColumnas > 1 
        ? xMargin + (idx / (totalColumnas - 1)) * widthDisponible
        : 160 - (anchoBarra / 2);
      
      const centroX = x + (anchoBarra / 2);
      const yDinamica = 135 - (añoData.total / maxValRango) * altoGraficoMaximo;
      
      return `${idx === 0 ? 'M' : 'L'} ${centroX} ${yDinamica}`;
    }).join(' ');

    const baseImponibleTotal = totalTrabajoRango + totalInmobiliarioRango + totalMobiliarioRango + totalGananciasRango;
    const cuotaLiquidaEstimada = retencionesTotales - resultadoDeclaracion;
    
    const tipoEfectivoIRPF = baseImponibleTotal > 0 ? (cuotaLiquidaEstimada / baseImponibleTotal) * 100 : 0;
    const tipoEfectivoSalario = totalTrabajoRango > 0 ? (retencionesTotales / totalTrabajoRango) * 100 : 0;
    const inversionEstimada = totalTrabajoRango * 0.186; 
    const pesoInversionIngresosLaborales = totalTrabajoRango > 0 ? (inversionEstimada / totalTrabajoRango) * 100 : 0;
    const intensidadInversion = baseImponibleTotal > 0 ? (inversionEstimada / baseImponibleTotal) * 100 : 0;
    const intensidadFiscalGlobal = ingresosTotales > 0 ? (retencionesTotales / ingresosTotales) * 100 : 0;
    
    const pesoAhorro = totalMobiliarioRango + totalGananciasRango;
    const eficienciaSistemaFiscal = baseImponibleTotal > 0 ? Math.min(100, Math.max(0, (pesoAhorro / baseImponibleTotal) * 100 + 45)) : 50;

    const sumaDesglosesRango = totalTrabajoRango + totalMobiliarioRango + totalInmobiliarioRango + totalGananciasRango;

    return { 
      ingresosTotales, 
      retencionesTotales, 
      resultadoDeclaracion, 
      puntosEvolutivo,
      pathIngresosTotales,
      maxValRango,
      ratios: {
        tipoEfectivoIRPF,
        tipoEfectivoSalario,
        pesoInversionIngresosLaborales,
        intensidadInversion,
        intensidadFiscalGlobal,
        eficienciaSistemaFiscal
      },
      leyendaRango: {
        trabajo: { valor: totalTrabajoRango, pct: sumaDesglosesRango > 0 ? (totalTrabajoRango / sumaDesglosesRango) * 100 : 0 },
        mobiliario: { valor: totalMobiliarioRango, pct: sumaDesglosesRango > 0 ? (totalMobiliarioRango / sumaDesglosesRango) * 100 : 0 },
        inmobiliario: { valor: totalInmobiliarioRango, pct: sumaDesglosesRango > 0 ? (totalInmobiliarioRango / sumaDesglosesRango) * 100 : 0 },
        ganancias: { valor: totalGananciasRango, pct: sumaDesglosesRango > 0 ? (totalGananciasRango / sumaDesglosesRango) * 100 : 0 }
      }
    };
  }, [datosNormalizados, registrosFiltrados, anioInicio, anioFin, listaAnios]);

  const selectStyle = "w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-1.5 py-1 text-[11px] h-7 focus:outline-none appearance-none text-center font-semibold";
  const esAPagar = statsFiscales.resultadoDeclaracion > 0;
  return (
    /* 🛠️ FONDO CAMBIADO A BLANCO PURE (bg-white) Y TEXTO OSCURO (text-slate-800) */
    <div className="w-full min-h-[100dvh] bg-white text-slate-800 px-3 py-4 font-sans pb-32 antialiased">
      
      {/* CABECERA */}
      <header className="mb-4 border-b border-slate-100 pb-2">
        <p className="text-slate-500 text-[11px] font-medium leading-none">
          Auditoría fiscal automatizada parametrizada con las métricas oficiales del documento.
        </p>
      </header>

      {/* FILTROS CON CONTRASTE CLARO */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-5">
        <div className="flex items-center gap-1.5 text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">
          <Filter size={12} /> Período de Campañas Renta
        </div>
        <div className="flex flex-row gap-2">
          <div className="flex-1">
            <span className="block text-[9px] text-slate-500 font-bold mb-1">Desde Año:</span>
            <select value={anioInicio} onChange={(e) => setAnioInicio(e.target.value)} className={selectStyle}>
              {listaAnios.map(a => <option key={`start-fisc-${a}`} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <span className="block text-[9px] text-slate-500 font-bold mb-1">Hasta Año:</span>
            <select value={anioFin} onChange={(e) => setAnioFin(e.target.value)} className={selectStyle}>
              {listaAnios.map(a => <option key={`end-fisc-${a}`} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* KPIs SUPERIORES EN FORMATO CLARO */}
      <div className="flex flex-row gap-1.5 mb-5 w-full">
        <div className="flex-1 bg-slate-50 border border-slate-200/80 p-1.5 rounded-xl min-w-0">
          <p className="text-slate-500 text-[8px] font-bold uppercase tracking-tight truncate">Ingresos totales</p>
          <div className="text-xs font-black text-slate-900 mt-0.5 truncate">
            {statsFiscales.ingresosTotales.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
          </div>
        </div>
        
        <div className="flex-1 bg-slate-50 border border-slate-200/80 p-1.5 rounded-xl min-w-0">
          <p className="text-slate-500 text-[8px] font-bold uppercase tracking-tight truncate">Retenciones totales</p>
          <div className="text-xs font-black text-slate-700 mt-0.5 truncate">
            {statsFiscales.retencionesTotales.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
          </div>
        </div>
        
        <div className={`flex-[1.6] p-1 border rounded-xl min-w-0 flex items-center gap-1 ${
          esAPagar ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
        }`}>
          <div className="p-1 bg-slate-100 rounded-md shrink-0">
            <Wallet className="w-3 h-3 text-[#0B3A6E]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-500 text-[7px] font-bold uppercase tracking-tight leading-none truncate">Resultado declaracion</p>
            <h4 className="text-[9px] font-black mt-0.5 truncate">{esAPagar ? 'A Pagar' : 'A Devolver'}</h4>
          </div>
          <div className="text-[10px] font-black pr-1 shrink-0">
            {Math.abs(statsFiscales.resultadoDeclaracion).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
          </div>
        </div>
      </div>

      <div className="h-2" />

      {/* MÓDULO DE MIX Y PARTICIPACIÓN DE INGRESOS */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col gap-3 mb-5">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <h3 className="text-xs font-black tracking-wider uppercase text-[#0B3A6E] flex items-center gap-1.5">
            <BarChart3 size={13} /> Mix y Participación de Ingresos
          </h3>
        </div>

        <div className="bg-white p-2 rounded-xl grid grid-cols-1 sm:grid-cols-6 gap-3 items-center border border-slate-100 relative">
          
          {/* LADO IZQUIERDO: Gráfico combinado */}
          <div className="col-span-1 sm:col-span-3 w-full flex items-center justify-center overflow-visible">
            <svg className="w-full h-44 overflow-visible" viewBox="0 0 320 160">
              {statsFiscales.puntosEvolutivo.map((añoData, idx) => {
                const totalColumnas = statsFiscales.puntosEvolutivo.length;
                const anchoBarra = totalColumnas > 2 ? 46 : 62;
                
                const xMargin = 20;
                const widthDisponible = 280 - anchoBarra;
                const x = totalColumnas > 1 
                  ? xMargin + (idx / (totalColumnas - 1)) * widthDisponible
                  : 160 - (anchoBarra / 2);
                
                let alturaAcumuladaY = 0;
                const altoGraficoMaximo = 105;

                return (
                  <g key={`col-group-${idx}`}>
                    {/* EJE INFERIOR: Año */}
                    <text x={x + (anchoBarra / 2)} y={150} fill="#64748B" fontSize="9" fontWeight="900" textAnchor="middle">
                      {añoData.label.replace("Año ", "")}
                    </text>

                    {añoData.desglose.map((seg, sIdx) => {
                      if (seg.valor === 0) return null;

                      const altoPixelSegmento = (seg.pct / 100) * altoGraficoMaximo;
                      const coordenadaY = 135 - alturaAcumuladaY - altoPixelSegmento;
                      
                      const centroXTexto = x + (anchoBarra / 2);
                      const centroYTexto = coordenadaY + (altoPixelSegmento / 2) + 2.5;
                      alturaAcumuladaY += altoPixelSegmento;

                      return (
                        <g key={`seg-${sIdx}`}>
                          <rect x={x} y={coordenadaY} width={anchoBarra} height={altoPixelSegmento} fill={seg.color} rx={2} />
                          {altoPixelSegmento > 11 && (
                            <text x={centroXTexto} y={centroYTexto} fill="#FFFFFF" fontSize="7.5" fontWeight="800" textAnchor="middle">
                              {seg.pct.toFixed(0)}%
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* Curva unificada (Cambiado stroke a color oscuro para contraste en fondo claro) */}
              {statsFiscales.puntosEvolutivo.length >= 2 && (
                <>
                  <path 
                    d={statsFiscales.pathIngresosTotales} 
                    fill="none" 
                    stroke="#0F172A" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                  />
                  {statsFiscales.puntosEvolutivo.map((añoData, idx) => {
                    const totalColumnas = statsFiscales.puntosEvolutivo.length;
                    const anchoBarra = totalColumnas > 2 ? 46 : 62;
                    const xMargin = 20;
                    const widthDisponible = 280 - anchoBarra;
                    const x = totalColumnas > 1 
                      ? xMargin + (idx / (totalColumnas - 1)) * widthDisponible
                      : 160 - (anchoBarra / 2);
                    
                    const centroX = x + (anchoBarra / 2);
                    const altoGraficoMaximo = 105;
                    const yDinamica = 135 - (añoData.total / statsFiscales.maxValRango) * altoGraficoMaximo;

                    const importeFormateado = `${Math.round(añoData.total).toLocaleString('es-ES')}€`;

                    return (
                      <g key={`l-node-labels-${idx}`}>
                        <text
                          x={centroX}
                          y={yDinamica - 8}
                          fill="#0F172A"
                          fontSize="8"
                          fontWeight="900"
                          textAnchor="middle"
                        >
                          {importeFormateado}
                        </text>
                        <circle cx={centroX} cy={yDinamica} r="3.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
          </div>

          {/* LADO DERECHO CLARO (CONTINUACIÓN DIRECTA) */}
          <div className="flex flex-col gap-1.5 w-full col-span-1 sm:col-span-3 pr-1">
            
            {/* Tarjeta 1: Trabajo */}
            <div 
              onMouseEnter={() => setExplicacionActiva('trabajo')}
              onMouseLeave={() => setExplicacionActiva(null)}
              onClick={() => setExplicacionActiva(explicacionActiva === 'trabajo' ? null : 'trabajo')}
              className="flex flex-col bg-slate-50 p-2 rounded-xl border border-slate-200 cursor-pointer relative w-full active:bg-slate-100 transition-all"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded bg-[#1FA187]" />
                <span className="text-slate-600 font-extrabold text-[9px] uppercase tracking-wider">Ingresos del Trabajo</span>
              </div>
              <span className="text-slate-900 font-mono text-[11px] mt-0.5 font-black">
                {statsFiscales.leyendaRango.trabajo.valor.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€ ({statsFiscales.leyendaRango.trabajo.pct.toFixed(0)}%)
              </span>
              {explicacionActiva === 'trabajo' && (
                <div className="absolute right-0 bottom-full mb-1 bg-white border border-slate-200 p-2 rounded-lg text-[9px] text-slate-700 w-48 z-50 shadow-xl leading-normal">
                  Rendimientos derivados directamente de salarios, contratos laborales y nóminas.
                </div>
              )}
            </div>

            {/* Tarjeta 2: Mobiliario */}
            <div 
              onMouseEnter={() => setExplicacionActiva('mobiliario')}
              onMouseLeave={() => setExplicacionActiva(null)}
              onClick={() => setExplicacionActiva(explicacionActiva === 'mobiliario' ? null : 'mobiliario')}
              className="flex flex-col bg-slate-50 p-2 rounded-xl border border-slate-200 cursor-pointer relative w-full active:bg-slate-100 transition-all"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded bg-[#0B3A6E]" />
                <span className="text-slate-600 font-extrabold text-[9px] uppercase tracking-wider">Capital Mobiliario</span>
              </div>
              <span className="text-slate-900 font-mono text-[11px] mt-0.5 font-black">
                {statsFiscales.leyendaRango.mobiliario.valor.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€ ({statsFiscales.leyendaRango.mobiliario.pct.toFixed(0)}%)
              </span>
              {explicacionActiva === 'mobiliario' && (
                <div className="absolute right-0 bottom-full mb-1 bg-white border border-slate-200 p-2 rounded-lg text-[9px] text-slate-700 w-48 z-50 shadow-xl leading-normal">
                  Ingresos generados por el capital: intereses de cuentas, depósitos bancarios y dividendos.
                </div>
              )}
            </div>

            {/* Tarjeta 3: Inmobiliario */}
            <div 
              onMouseEnter={() => setExplicacionActiva('inmobiliario')}
              onMouseLeave={() => setExplicacionActiva(null)}
              onClick={() => setExplicacionActiva(explicacionActiva === 'inmobiliario' ? null : 'inmobiliario')}
              className="flex flex-col bg-slate-50 p-2 rounded-xl border border-slate-200 cursor-pointer relative w-full active:bg-slate-100 transition-all"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded bg-[#38BDF8]" />
                <span className="text-slate-600 font-extrabold text-[9px] uppercase tracking-wider">Rendimientos Inmobiliarios</span>
              </div>
              <span className="text-slate-900 font-mono text-[11px] mt-0.5 font-black">
                {statsFiscales.leyendaRango.inmobiliario.valor.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€ ({statsFiscales.leyendaRango.inmobiliario.pct.toFixed(0)}%)
              </span>
              {explicacionActiva === 'inmobiliario' && (
                <div className="absolute right-0 bottom-full mb-1 bg-white border border-slate-200 p-2 rounded-lg text-[9px] text-slate-700 w-48 z-50 shadow-xl leading-normal">
                  Rendimientos netos procedentes del arrendamiento o alquiler de inmuebles o locales.
                </div>
              )}
            </div>

            {/* Tarjeta 4: Ganancias */}
            <div 
              onMouseEnter={() => setExplicacionActiva('ganancias')}
              onMouseLeave={() => setExplicacionActiva(null)}
              onClick={() => setExplicacionActiva(explicacionActiva === 'ganancias' ? null : 'ganancias')}
              className="flex flex-col bg-slate-50 p-2 rounded-xl border border-slate-200 cursor-pointer relative w-full active:bg-slate-100 transition-all"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded bg-[#F59E0B]" />
                <span className="text-slate-600 font-extrabold text-[9px] uppercase tracking-wider">Ganancias Patrimoniales</span>
              </div>
              <span className="text-slate-900 font-mono text-[11px] mt-0.5 font-black">
                {statsFiscales.leyendaRango.ganancias.valor.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€ ({statsFiscales.leyendaRango.ganancias.pct.toFixed(0)}%)
              </span>
              {explicacionActiva === 'ganancias' && (
                <div className="absolute right-0 bottom-full mb-1 bg-white border border-slate-200 p-2 rounded-lg text-[9px] text-slate-700 w-48 z-50 shadow-xl leading-normal">
                  Variaciones patrimoniales netas provocadas por la venta de acciones, fondos o criptomonedas.
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* MÓDULO DE RATIOS DE EFICIENCIA CLARO Y SEPARADO */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col gap-3">
        <div className="border-b border-slate-200 pb-2">
          <h3 className="text-xs font-black tracking-wider uppercase text-[#0B3A6E]">
            Auditoría de Ratios y Presión Fiscal
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5 relative">
          <div 
            onMouseEnter={() => setExplicacionActiva('ref-irpf')}
            onMouseLeave={() => setExplicacionActiva(null)}
            onClick={() => setExplicacionActiva(explicacionActiva === 'ref-irpf' ? null : 'ref-irpf')}
            className="flex flex-col bg-white p-2 rounded-xl border border-slate-200 cursor-pointer relative active:bg-slate-100 transition-all"
          >
            <span className="text-slate-500 font-extrabold text-[8.5px] uppercase tracking-wider truncate">Efectivo IRPF</span>
            <span className="text-slate-900 font-mono text-xs font-black mt-0.5">
              {statsFiscales.ratios.tipoEfectivoIRPF.toFixed(1)}%
            </span>
            {explicacionActiva === 'ref-irpf' && (
              <div className="absolute left-0 bottom-full mb-1 bg-white border border-slate-200 p-2 rounded-lg text-[9px] text-slate-700 w-44 z-50 shadow-xl leading-normal">
                Porcentaje real de impuestos pagados sobre la base imponible total.
              </div>
            )}
          </div>

          <div 
            onMouseEnter={() => setExplicacionActiva('ref-salario')}
            onMouseLeave={() => setExplicacionActiva(null)}
            onClick={() => setExplicacionActiva(explicacionActiva === 'ref-salario' ? null : 'ref-salario')}
            className="flex flex-col bg-white p-2 rounded-xl border border-slate-200 cursor-pointer relative active:bg-slate-100 transition-all"
          >
            <span className="text-slate-500 font-extrabold text-[8.5px] uppercase tracking-wider truncate">Efectivo Salario</span>
            <span className="text-slate-900 font-mono text-xs font-black mt-0.5">
              {statsFiscales.ratios.tipoEfectivoSalario.toFixed(1)}%
            </span>
            {explicacionActiva === 'ref-salario' && (
              <div className="absolute right-0 bottom-full mb-1 bg-white border border-slate-200 p-2 rounded-lg text-[9px] text-slate-700 w-44 z-50 shadow-xl leading-normal">
                Presión fiscal específica aplicada de forma exclusiva sobre tus nóminas.
              </div>
            )}
          </div>

          <div 
            onMouseEnter={() => setExplicacionActiva('ref-peso-inv')}
            onMouseLeave={() => setExplicacionActiva(null)}
            onClick={() => setExplicacionActiva(explicacionActiva === 'ref-peso-inv' ? null : 'ref-peso-inv')}
            className="flex flex-col bg-white p-2 rounded-xl border border-slate-200 cursor-pointer relative active:bg-slate-100 transition-all"
          >
            <span className="text-slate-500 font-extrabold text-[8.5px] uppercase tracking-wider truncate">Inversión / Salario</span>
            <span className="text-slate-900 font-mono text-xs font-black mt-0.5">
              {statsFiscales.ratios.pesoInversionIngresosLaborales.toFixed(1)}%
            </span>
            {explicacionActiva === 'ref-peso-inv' && (
              <div className="absolute left-0 bottom-full mb-1 bg-white border border-slate-200 p-2 rounded-lg text-[9px] text-slate-700 w-44 z-50 shadow-xl leading-normal">
                Proporción de tus ingresos por nómina que se desvía a inversión patrimonial.
              </div>
            )}
          </div>

          <div 
            onMouseEnter={() => setExplicacionActiva('ref-inten-inv')}
            onMouseLeave={() => setExplicacionActiva(null)}
            onClick={() => setExplicacionActiva(explicacionActiva === 'ref-inten-inv' ? null : 'ref-inten-inv')}
           className="flex flex-col bg-white p-2 rounded-xl border border-slate-200 cursor-pointer relative active:bg-slate-100 transition-all"
          >
            <span className="text-slate-500 font-extrabold text-[8.5px] uppercase tracking-wider truncate">Intensidad Inversión</span>
            <span className="text-slate-900 font-mono text-xs font-black mt-0.5">
              {statsFiscales.ratios.intensidadInversion.toFixed(1)}%
            </span>
            {explicacionActiva === 'ref-inten-inv' && (
              <div className="absolute right-0 bottom-full mb-1 bg-white border border-slate-200 p-2 rounded-lg text-[9px] text-slate-700 w-44 z-50 shadow-xl leading-normal">
                Esfuerzo global de inyección de capital calculado sobre tu base imponible.
              </div>
            )}
          </div>

          {/* Ratio 5: Intensidad fiscal global */}
          <div 
            onMouseEnter={() => setExplicacionActiva('ref-int-fiscal')}
            onMouseLeave={() => setExplicacionActiva(null)}
            onClick={() => setExplicacionActiva(explicacionActiva === 'ref-int-fiscal' ? null : 'ref-int-fiscal')}
            className="flex flex-col bg-white p-2 rounded-xl border border-slate-200 cursor-pointer relative active:bg-slate-100 transition-all"
          >
            <span className="text-slate-500 font-extrabold text-[8.5px] uppercase tracking-wider truncate">Intensidad Fiscal</span>
            <span className="text-slate-900 font-mono text-xs font-black mt-0.5">
              {statsFiscales.ratios.intensidadFiscalGlobal.toFixed(1)}%
            </span>
            {explicacionActiva === 'ref-int-fiscal' && (
              <div className="absolute left-0 sm:left-auto sm:right-0 bottom-full mb-1 bg-white border border-slate-200 p-2 rounded-lg text-[9px] text-slate-700 w-44 z-50 shadow-xl leading-normal">
                Ratio total de retenciones sufridas contra los flujos de ingresos brutos.
              </div>
            )}
          </div>

          {/* Ratio 6: Eficiencia del sistema fiscal */}
          <div 
            onMouseEnter={() => setExplicacionActiva('ref-eficiencia')}
            onMouseLeave={() => setExplicacionActiva(null)}
            onClick={() => setExplicacionActiva(explicacionActiva === 'ref-eficiencia' ? null : 'ref-eficiencia')}
            className="flex flex-col bg-[#0B3A6E]/10 p-2 rounded-xl border border-blue-200 cursor-pointer relative active:bg-white/5 transition-all"
          >
            <span className="text-[#0B3A6E] font-extrabold text-[8.5px] uppercase tracking-wider truncate">Eficiencia Fiscal</span>
            <span className="text-emerald-600 font-mono text-xs font-black mt-0.5">
              {statsFiscales.ratios.eficienciaSistemaFiscal.toFixed(0)}/100
            </span>
            {explicacionActiva === 'ref-eficiencia' && (
              <div className="absolute right-0 bottom-full mb-1 bg-white border border-slate-200 p-2 rounded-lg text-[9px] text-slate-700 w-44 z-50 shadow-xl leading-normal">
                Puntuación de optimización de rentas desviadas a la base del ahorro.
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}