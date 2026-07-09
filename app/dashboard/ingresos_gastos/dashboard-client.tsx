"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Filter, Wallet, ShieldAlert, BarChart3, LineChart, PieChart } from 'lucide-react';

interface Movimiento {
  fecha: string;
  descripcion: string;
  importe: number;
  tipo: 'ingreso' | 'gasto';
  categoria: string;
  subcategoria: string;
  naturaleza: 'fijo' | 'variable' | 'no aplica';
}

interface DashboardProps {
  datosExcel: any[]; // Cambiado a any[] temporalmente para blindar la entrada de datos frente a errores
}

export default function MoneyMapClientDashboard({ datosExcel }: DashboardProps) {
  // Estados para el período seleccionado
  const [mesInicio, setMesInicio] = useState<string>('01');
  const [anioInicio, setAnioInicio] = useState<string>('');
  const [mesFin, setMesFin] = useState<string>('12');
  const [anioFin, setAnioFin] = useState<string>('');

  // NUEVO: Estados para controlar la ventana flotante interactiva
  const [modalAbierta, setModalAbierta] = useState<boolean>(false);
  const [modalTitulo, setModalTitulo] = useState<string>('');
  const [modalDatos, setModalDatos] = useState<{ nombre: string; total: number; porcentaje: number }[]>([]);

  const NOMBRES_MESES = [
    { valor: "01", nombre: "Ene" }, 
    { valor: "02", nombre: "Feb" },
    { valor: "03", nombre: "Mar" }, 
    { valor: "04", nombre: "Abr" },
    { valor: "05", nombre: "May" }, // Corregido: cambiado 'map' por 'valor'
    { valor: "06", nombre: "Jun" }, // Corregido: cambiado 'json' por 'valor'
    { valor: "07", nombre: "Jul" }, 
    { valor: "08", nombre: "Ago" },
    { valor: "09", nombre: "Sep" }, 
    { valor: "10", nombre: "Oct" },
    { valor: "11", nombre: "Nov" }, 
    { valor: "12", nombre: "Dic" }
  ];

  // Forzamos la normalización segura de los datos que entran del Excel
  const datosNormalizados = useMemo<Movimiento[]>(() => {
    if (!datosExcel || !Array.isArray(datosExcel)) return [];
    return datosExcel.map(mov => ({
      fecha: mov.fecha || '',
      descripcion: mov.descripcion || '',
      importe: Number(mov.importe) || 0,
      tipo: mov.tipo || 'gasto',
      categoria: mov.categoria || 'Otros',
      subcategoria: mov.subcategoria || mov.categoriaReducida || mov.categoria || 'General',
      naturaleza: mov.naturaleza || 'variable'
    }));
  }, [datosExcel]);

  // Extraer años únicos del archivo Excel usando los datos normalizados
  const listaAnios = useMemo(() => {
    const anios = datosNormalizados.map(m => m.fecha.split('-')[0]).filter(Boolean);
    return Array.from(new Set(anios)).sort((a, b) => a.localeCompare(b));
  }, [datosNormalizados]);

  // Autodetectar límites de fechas del Excel al cargar la página
  useEffect(() => {
    if (datosNormalizados && datosNormalizados.length > 0) {
      const datosOrdenados = [...datosNormalizados].sort((a, b) => a.fecha.localeCompare(b.fecha));
      const primeraFecha = datosOrdenados[0]?.fecha;
      const ultimaFecha = datosOrdenados[datosOrdenados.length - 1]?.fecha;
      
      if (primeraFecha && ultimaFecha) {
        const [aIni, mIni] = primeraFecha.split('-');
        const [aFin, mFin] = ultimaFecha.split('-');
        setAnioInicio(aIni); setMesInicio(mIni);
        setAnioFin(aFin); setMesFin(mFin);
      }
    }
  }, [datosNormalizados]);

  // Filtrado de movimientos por el rango YYYYMM
  const movimientosFiltrados = useMemo(() => {
    const periodoDesde = Number(`${anioInicio}${mesInicio}`);
    const periodoHasta = Number(`${anioFin}${mesFin}`);

    return datosNormalizados.filter(mov => {
      if (!mov || !mov.fecha) return false;
      const [anioMov, mesMov] = mov.fecha.split('-');
      const periodoMov = Number(`${anioMov}${mesMov}`);
      return periodoMov >= periodoDesde && periodoMov <= periodoHasta;
    });
  }, [datosNormalizados, anioInicio, mesInicio, anioFin, mesFin]);

// ==========================================
  // CONSOLIDACIÓN GLOBAL DE CRUCE TEMPORAL (DESGLOSE POR SUBCATEGORÍA - CATEGORIA REDUCIDA)
  // ==========================================
  const analiticaGlobal = useMemo(() => {
    let ingresosTotales = 0;
    let gastosTotales = 0;
    let totalNomina = 0;
    let gastosFijos = 0;
    let gastosVariables = 0;

    const ingCategoriasMap: { [key: string]: number } = {};
    const gastCategoriasMap: { [key: string]: number } = {};
    const evolutivoIngMap: { [key: string]: number } = {};
    const evolutivoGastMap: { [key: string]: number } = {};
    
    // Contenedores para las subcategorías (Columnas categoria_reducida del Excel)
    const subfijosMap: { [key: string]: number } = {};
    const subvariablesMap: { [key: string]: number } = {};
    const subCategoriasPorCategoriaMap: { [key: string]: { [sub: string]: number } } = {};

    movimientosFiltrados.forEach(mov => {
      const valor = Number(mov.importe) || 0;
      const valorAbs = Math.abs(valor);
      const [anio, mes] = mov.fecha.split('-');
      const clavePeriodo = `${anio}-${mes}`;
      
      // Categoría principal para el listado del módulo (ej: Vivienda, Ocio)
      const catClean = mov.categoria || 'Otros';
      
      // 🛠️ CORRECCIÓN DEFINITIVA: Extraemos estrictamente la subcategoría (categoriaReducida) para el menú flotante
      const subClean = mov.subcategoria  || 'General'; 

      const naturalezaLimpia = String(mov.naturaleza || '')
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      // 1. CONDICIÓN DE INGRESOS
      if (mov.tipo === 'ingreso' || valor > 0) {
        ingresosTotales += valorAbs;
        ingCategoriasMap[catClean] = (ingCategoriasMap[catClean] || 0) + valorAbs;
        evolutivoIngMap[clavePeriodo] = (evolutivoIngMap[clavePeriodo] || 0) + valorAbs;
        if (catClean.toLowerCase().includes('nomina') || catClean.toLowerCase().includes('sueldo')|| catClean.toLowerCase().includes('salario')) {
          totalNomina += valorAbs;
        }
      } 
      // 2. CONDICIÓN DE GASTOS
      else {
        gastosTotales += valorAbs;
        gastCategoriasMap[catClean] = (gastCategoriasMap[catClean] || 0) + valorAbs;
        evolutivoGastMap[clavePeriodo] = (evolutivoGastMap[clavePeriodo] || 0) + valorAbs;
        
        if (naturalezaLimpia.includes('fij')) {
          gastosFijos += valorAbs;
          // Guardamos la subcategoría agrupada en el mapa de fijos
          subfijosMap[subClean] = (subfijosMap[subClean] || 0) + valorAbs;
        } else {
          gastosVariables += valorAbs;
          // Guardamos la subcategoría agrupada en el mapa de variables
          subvariablesMap[subClean] = (subvariablesMap[subClean] || 0) + valorAbs;
        }

        // Registro cruzado de subcategorías por cada categoría principal
        if (!subCategoriasPorCategoriaMap[catClean]) {
          subCategoriasPorCategoriaMap[catClean] = {};
        }
        subCategoriasPorCategoriaMap[catClean][subClean] = (subCategoriasPorCategoriaMap[catClean][subClean] || 0) + valorAbs;
      }
    });

    // Cálculos estructurales finales
    const ahorroNeto = ingresosTotales - gastosTotales;
    const tasaAhorro = ingresosTotales > 0 ? (ahorroNeto / ingresosTotales) * 100 : 0;
    const porcentajeNomina = ingresosTotales > 0 ? (totalNomina / ingresosTotales) * 100 : 0;
    const porcentajeFijos = gastosTotales > 0 ? (gastosFijos / gastosTotales) * 100 : 0;

    const distribucionIngresos = Object.keys(ingCategoriasMap).map(cat => ({
      nombre: cat, 
      total: ingCategoriasMap[cat], 
      porcentaje: ingresosTotales > 0 ? (ingCategoriasMap[cat] / ingresosTotales) * 100 : 0
    })).sort((a, b) => b.total - a.total);

    const top10Gastos = Object.keys(gastCategoriasMap).map(cat => ({
      nombre: cat, 
      total: gastCategoriasMap[cat], 
      porcentaje: gastosTotales > 0 ? (gastCategoriasMap[cat] / gastosTotales) * 100 : 0
    })).sort((a, b) => b.total - a.total).slice(0, 10);

    const todosLosPeriodos = Array.from(new Set([...Object.keys(evolutivoIngMap), ...Object.keys(evolutivoGastMap)])).sort();
    
    const puntosHistoricos = todosLosPeriodos.map(per => {
      const [a, m] = per.split('-');
      const mesNombre = NOMBRES_MESES.find(nm => nm.valor === m)?.nombre || m;
      return {
        label: `${mesNombre} ${a.slice(-2)}`,
        ingreso: evolutivoIngMap[per] || 0,
        gasto: evolutivoGastMap[per] || 0
      };
    });

    const puntosValidos = puntosHistoricos.length > 0 ? puntosHistoricos : [{ ingreso: 1, gasto: 1 }];
    const maxIng = Math.max(...puntosValidos.map(d => d.ingreso), 1);
    const maxGast = Math.max(...puntosValidos.map(d => d.gasto), 1);
    const maxGlobal = Math.max(maxIng, maxGast);

    // Función auxiliar para ordenar y recortar el Top 10 de subcategorías
    const obtenerTop10Sub = (mapaOrigen: { [key: string]: number }, totalGrupo: number) => {
      return Object.keys(mapaOrigen).map(sub => ({
        nombre: sub,
        total: mapaOrigen[sub],
        porcentaje: totalGrupo > 0 ? (mapaOrigen[sub] / totalGrupo) * 100 : 0
      })).sort((a, b) => b.total - a.total).slice(0, 10);
    };

    return {
      ingresosTotales, gastosTotales, gastosFijos, gastosVariables, ahorroNeto, tasaAhorro,
      porcentajeNomina, porcentajeFijos, distribucionIngresos, top10Gastos, puntosHistoricos, maxGlobal,
      top10SubFijos: obtenerTop10Sub(subfijosMap, gastosFijos),
      top10SubVariables: obtenerTop10Sub(subvariablesMap, gastosVariables),
      obtenerSubPorCategoria: (cat: string, totalCat: number) => obtenerTop10Sub(subCategoriasPorCategoriaMap[cat] || {}, totalCat)
    };
  }, [movimientosFiltrados]);

  // Generador de rutas SVG paralelas (Ingresos vs Gastos)
  const graficosCodo = useMemo(() => {
    const datos = analiticaGlobal.puntosHistoricos;
    if (datos.length < 2) return { pathIng: "", pathGast: "" };

    const maxIng = Math.max(...datos.map(d => d.ingreso), 1);
    const maxGast = Math.max(...datos.map(d => d.gasto), 1);
    const maxGlobal = Math.max(maxIng, maxGast);

    const width = 300; 
    const height = 45;

    const pathIng = datos.map((d, i) => {
      const x = (i / (datos.length - 1)) * width;
      const y = height - (d.ingreso / maxGlobal) * height + 5;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const pathGast = datos.map((d, i) => {
      const x = (i / (datos.length - 1)) * width;
      const y = height - (d.gasto / maxGlobal) * height + 5;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return { pathIng, pathGast, maxGlobal };
  }, [analiticaGlobal.puntosHistoricos]);

 // Extraemos las propiedades de graficosCodo para que TypeScript las vea globales
  const { pathIng, pathGast, maxGlobal } = graficosCodo;

  const selectStyle = "w-full bg-slate-900 border border-white/10 text-white rounded-xl px-1.5 py-1 text-[11px] h-7 focus:outline-none appearance-none text-center";

      // AGREGAR ESTO DENTRO DE analiticaGlobal (Cerca de donde procesas los mapas)
    const subfijosMap: { [key: string]: number } = {};
    const subvariablesMap: { [key: string]: number } = {};
    const subCategoriasPorCategoriaMap: { [key: string]: { [sub: string]: number } } = {};

    movimientosFiltrados.forEach(mov => {
      const valor = Number(mov.importe) || 0;
      const valorAbs = Math.abs(valor);
      const catClean = mov.categoria || 'Otros';
      const subClean = mov.descripcion || 'General'; // Usamos la descripción/concepto como subcategoría detallada

      if (mov.tipo === 'gasto' || valor < 0) {
        // Inicializar mapa secundario por categoría principal
        if (!subCategoriasPorCategoriaMap[catClean]) {
          subCategoriasPorCategoriaMap[catClean] = {};
        }
        subCategoriasPorCategoriaMap[catClean][subClean] = (subCategoriasPorCategoriaMap[catClean][subClean] || 0) + valorAbs;

        // Clasificar por naturaleza estructural
        if (mov.naturaleza === 'fijo') {
          subfijosMap[subClean] = (subfijosMap[subClean] || 0) + valorAbs;
        } else {
          subvariablesMap[subClean] = (subvariablesMap[subClean] || 0) + valorAbs;
        }
      }
    });

    // Formatear funciones rápidas de ordenación TOP 10 para la UI
    const obtenerTop10Sub = (mapaOrigen: { [key: string]: number }, totalGrupo: number) => {
      return Object.keys(mapaOrigen).map(sub => ({
        nombre: sub,
        total: mapaOrigen[sub],
        porcentaje: totalGrupo > 0 ? (mapaOrigen[sub] / totalGrupo) * 100 : 0
      })).sort((a, b) => b.total - a.total).slice(0, 10);
    };

  return (
    <div className="w-full min-h-screen bg-[#0F172A] text-white px-3 py-4 font-sans pb-24 antialiased">
      
      {/* CABECERA COMPACTA SIN TÍTULO DUPLICADO */}
      <header className="mb-4 border-b border-white/5 pb-2.5">
        <p className="text-slate-400 text-xs font-medium leading-relaxed">
       Auditoría cruzada automatizada de flujos de caja, costes y tendencias en tiempo real.
        </p>
      </header>

      {/* FILTROS */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold w-10 uppercase">Desde:</span>
            <div className="flex-1 flex gap-1">
              <select value={mesInicio} onChange={(e) => setMesInicio(e.target.value)} className={selectStyle}>
                {NOMBRES_MESES.map(m => <option key={m.valor} value={m.valor}>{m.nombre}</option>)}
              </select>
              <select value={anioInicio} onChange={(e) => setAnioInicio(e.target.value)} className={selectStyle}>
                {listaAnios.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold w-10 uppercase">Hasta:</span>
            <div className="flex-1 flex gap-1">
              <select value={mesFin} onChange={(e) => setMesFin(e.target.value)} className={selectStyle}>
                {NOMBRES_MESES.map(m => <option key={m.valor} value={m.valor}>{m.nombre}</option>)}
              </select>
              <select value={anioFin} onChange={(e) => setAnioFin(e.target.value)} className={selectStyle}>
                {listaAnios.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

 {/* KPIs GENERALES (4 TARJETAS EN FILA HORIZONTAL COMPACTA) */}
      <div className="flex flex-row gap-1.5 mb-3 w-full">
        
        {/* Tarjeta 1: Ingresos */}
        <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 p-1.5 rounded-xl min-w-0">
          <p className="text-slate-400 text-[8px] font-bold uppercase tracking-tight">Ingresos</p>
          <div className="text-xs font-black text-emerald-400 mt-0.5 truncate">
            +{analiticaGlobal.ingresosTotales.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
          </div>
        </div>
        
        {/* Tarjeta 2: Gastos */}
        <div className="flex-1 bg-rose-500/10 border border-rose-500/20 p-1.5 rounded-xl min-w-0">
          <p className="text-slate-400 text-[8px] font-bold uppercase tracking-tight">Gastos</p>
          <div className="text-xs font-black text-rose-400 mt-0.5 truncate">
            -{analiticaGlobal.gastosTotales.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
          </div>
        </div>
        
        {/* Tarjeta 3: Ahorro Neto */}
        <div className={`flex-1 p-1.5 rounded-xl min-w-0 border ${analiticaGlobal.ahorroNeto >= 0 ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
          <p className="text-slate-400 text-[8px] font-bold uppercase tracking-tight">Ahorro</p>
          <div className="text-xs font-black mt-0.5 truncate">
            {analiticaGlobal.ahorroNeto >= 0 ? '+' : ''}{analiticaGlobal.ahorroNeto.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
          </div>
        </div>

        {/* Tarjeta 4: Tasa de Ahorro (Formato Strategy Card adaptado a la fila) */}
        <div className={`flex-[1.5] p-1 border rounded-xl min-w-0 flex items-center gap-1 bg-white/5 border-white/10`}>
          {/* Icono a la izquierda */}
          <div className="p-1 bg-[#0B3A6E] rounded-md shrink-0">
            <Wallet className="w-3 h-3 text-[#1FA187]" />
          </div>
          
          {/* Textos apilados en el centro */}
          <div className="flex-1 min-w-0">
            <p className="text-slate-400 text-[7px] font-medium uppercase tracking-tight leading-none">Tasa de ahorro %</p>
            <h4 className="text-[11px] font-black text-white mt-0.5 truncate">{analiticaGlobal.tasaAhorro.toFixed(1)}%</h4>
          </div>
          

        </div>

      </div>

      {/* MÓDULO 1: AUDITORÍA DE INGRESOS */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-3 mb-3">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <h3 className="text-xs font-black tracking-wider uppercase text-[#1FA187] flex items-center gap-1.5">
            <BarChart3 size={13} /> Auditoría de Ingresos
          </h3>
          <div className="bg-emerald-500/10 text-emerald-400 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
            {analiticaGlobal.porcentajeNomina.toFixed(0)}% Nómina
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Distribución por Naturaleza</p>
          <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto pr-0.5">
            {analiticaGlobal.distribucionIngresos.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-200">
                  <span className="truncate max-w-[70%]">{item.nombre}</span>
                  <span>{item.total.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€ ({item.porcentaje.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${item.porcentaje}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 pt-1 border-t border-white/5">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
            <LineChart size={11} /> Tendencia de Entrada (Gastos de fondo)
          </div>
          {analiticaGlobal.puntosHistoricos.length >= 2 && (
            <div className="bg-slate-900/40 p-2 rounded-xl flex flex-col items-center">
              <svg className="w-full h-14 overflow-visible" viewBox="0 0 300 55">
                {/* Líneas de tendencia */}
                <path d={graficosCodo.pathGast} fill="none" stroke="#EF4444" strokeWidth="1" strokeDasharray="3,3" opacity="0.25" />
                <path d={graficosCodo.pathIng} fill="none" stroke="#1FA187" strokeWidth="2" strokeLinecap="round" />
                
                {/* Nodos punteados en cada mes */}
                {analiticaGlobal.puntosHistoricos.map((d, i) => {
                  const x = (i / (analiticaGlobal.puntosHistoricos.length - 1)) * 300;
                  
                  // Calculamos el máximo aquí mismo de forma aislada e infalible
                  const valoresIng = analiticaGlobal.puntosHistoricos.map(p => p.ingreso);
                  const valoresGast = analiticaGlobal.puntosHistoricos.map(p => p.gasto);
                  const maxLocal = Math.max(...valoresIng, ...valoresGast, 1);
                  
                  const y = 45 - (d.ingreso / maxLocal) * 45 + 5;
                  return <circle key={i} cx={x} cy={y} r="2.5" fill="#1FA187" />;
                })}
              </svg>
              
              {/* Eje X optimizado: Muestra la etiqueta cada 3 meses */}
              <div className="w-full flex justify-between text-[8px] text-slate-400 mt-1.5 font-medium px-1">
                {analiticaGlobal.puntosHistoricos.map((d, i) => {
                  const totalNodos = analiticaGlobal.puntosHistoricos.length;
                  // Renderiza obligatoriamente el primero, el último y los intermedios cada 3 meses
                  if (i === 0 || i === totalNodos - 1 || i % 3 === 0) {
                    return <span key={i} className="truncate max-w-[40px] text-center">{d.label}</span>;
                  }
                  // Si no corresponde, pinta un hueco vacío invisible para mantener la alineación flex-row
                  return <span key={i} className="w-0 block h-0" />;
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MÓDULO 2: AUDITORÍA DE GASTOS (CON ACCIONES CLICK) */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-3 mb-3">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <h3 className="text-xs font-black tracking-wider uppercase text-rose-400 flex items-center gap-1.5">
            <PieChart size={13} /> Auditoría de Gastos
          </h3>
          <div className="bg-rose-500/10 text-rose-400 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
            {analiticaGlobal.porcentajeFijos.toFixed(0)}% Estructural
          </div>
        </div>

        {/* Naturaleza de Gastos Cliqueables */}
        <div className="grid grid-cols-2 gap-2">
          <div 
            onClick={() => {
              setModalTitulo("Desglose: Gastos Fijos por Subcategoría");
              setModalDatos(analiticaGlobal.top10SubFijos);
              setModalAbierta(true);
            }}
            className="bg-slate-900/50 p-2 rounded-xl border border-white/5 cursor-pointer active:bg-white/5 transition-all"
          >
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Gastos Fijos 🔍</span>
            <span className="text-xs font-black text-white mt-0.5 block">{analiticaGlobal.gastosFijos.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
            <span className="text-[9px] text-slate-400 font-medium block">{analiticaGlobal.porcentajeFijos.toFixed(0)}% estructural</span>
          </div>

          <div 
            onClick={() => {
              setModalTitulo("Desglose: Gastos Variables por Subcategoría");
              setModalDatos(analiticaGlobal.top10SubVariables);
              setModalAbierta(true);
            }}
            className="bg-slate-900/50 p-2 rounded-xl border border-white/5 cursor-pointer active:bg-white/5 transition-all"
          >
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Gastos Variables 🔍</span>
            <span className="text-xs font-black text-white mt-0.5 block">{analiticaGlobal.gastosVariables.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
            <span className="text-[9px] text-slate-400 font-medium block">{(100 - analiticaGlobal.porcentajeFijos).toFixed(0)}% discrecional</span>
          </div>
        </div>

        {/* Top 10 Subcategorías de Gastos Cliqueables */}
        <div className="flex flex-col gap-2">
          {/* CORREGIDO: Cambiado de Categorías Principales a Subcategorías */}
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Top 10 Subcategorías de Gastos</p>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-0.5">
            {analiticaGlobal.top10Gastos.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No hay gastos registrados en este período.</p>
            ) : (
              analiticaGlobal.top10Gastos.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => {
                    setModalTitulo(`Desglose Detallado: ${item.nombre}`);
                    setModalDatos(analiticaGlobal.obtenerSubPorCategoria(item.nombre, item.total));
                    setModalAbierta(true);
                  }}
                  className="space-y-0.5 cursor-pointer p-1 rounded-lg hover:bg-white/5 active:bg-white/5 transition-all"
                >
                  <div className="flex justify-between text-[11px] font-semibold text-slate-200">
                    <span className="truncate max-w-[65%] text-slate-300">
                      <span className="text-slate-500 font-mono text-[9px] mr-1">{idx + 1}.</span>
                      {item.nombre} 🔍
                    </span>
                    <span className="text-rose-400">{item.total.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€ ({item.porcentaje.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-rose-400" style={{ width: `${item.porcentaje}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Evolutivo Gráfico */}
        <div className="flex flex-col gap-1 pt-1 border-t border-white/5">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
            <LineChart size={11} /> Tendencia de Salida (Ingresos de fondo)
          </div>
          {analiticaGlobal.puntosHistoricos.length >= 2 && (
            <div className="bg-slate-900/40 p-2 rounded-xl flex flex-col items-center">
              <svg className="w-full h-14 overflow-visible" viewBox="0 0 300 55">
                <path d={graficosCodo.pathIng} fill="none" stroke="#1FA187" strokeWidth="1" strokeDasharray="3,3" opacity="0.25" />
                <path d={graficosCodo.pathGast} fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                
                {analiticaGlobal.puntosHistoricos.map((d, i) => {
                  const x = (i / (analiticaGlobal.puntosHistoricos.length - 1)) * 300;
                  const valoresIng = analiticaGlobal.puntosHistoricos.map(p => p.ingreso);
                  const valoresGast = analiticaGlobal.puntosHistoricos.map(p => p.gasto);
                  const maxLocal = Math.max(...valoresIng, ...valoresGast, 1);
                  const y = 45 - (d.gasto / maxLocal) * 45 + 5;
                  return <circle key={i} cx={x} cy={y} r="2.5" fill="#EF4444" />;
                })}
              </svg>
              
              <div className="w-full flex justify-between text-[8px] text-slate-400 mt-1.5 font-medium px-1">
                {analiticaGlobal.puntosHistoricos.map((d, i) => {
                  const totalNodos = analiticaGlobal.puntosHistoricos.length;
                  if (i === 0 || i === totalNodos - 1 || i % 3 === 0) {
                    return <span key={i} className="truncate max-w-[40px] text-center">{d.label}</span>;
                  }
                  return <span key={i} className="w-0 block h-0" />;
                })}
              </div>
            </div>
          )}
        </div>
      </section>


  {/* ==========================================
          VENTANA MODAL FLOTANTE (CORREGIDA PARA NO SOLAPAR)
         ========================================== */}
      {modalAbierta && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center">
          <div className="absolute inset-0" onClick={() => setModalAbierta(false)} />
          
          <div className="relative bg-slate-900 w-full max-w-md rounded-t-3xl p-4 border-t border-white/10 shadow-2xl max-h-[75vh] flex flex-col z-10 pb-20">
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-3 shrink-0" onClick={() => setModalAbierta(false)} />
            
            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
              <h4 className="text-sm font-black tracking-tight text-rose-400">{modalTitulo}</h4>
              <button 
                onClick={() => setModalAbierta(false)}
                className="text-xs font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-xl active:bg-white/10"
              >
                Cerrar
              </button>
            </div>

            <div className="flex flex-col gap-2.5 overflow-y-auto pr-0.5 max-h-[45vh]">
              {modalDatos.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">No se hallaron subcategorías cargadas.</p>
              ) : (
                modalDatos.map((sub, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span className="truncate max-w-[75%]">
                        <span className="text-slate-600 mr-1 font-mono text-[10px]">{sIdx + 1}.</span>
                        {sub.nombre}
                      </span>
                      <span className="text-white font-mono">{sub.total.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-400 rounded-full" style={{ width: `${sub.porcentaje}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}