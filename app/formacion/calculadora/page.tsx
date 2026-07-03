"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function CalculadoraPage() {
  // Selector de Modo: 'proyeccion' (Ver cuánto tendré) o 'objetivo' (Ver cómo llegar a X)
  const [modo, setModo] = useState<"proyeccion" | "objetivo">("proyeccion");

  // Inputs Comunes y de Proyección
  const [inicial, setInicial] = useState<number>(1000);
  const [ahorroMensual, setAhorroMensual] = useState<number>(200);
  const [interesAnual, setInteresAnual] = useState<number>(8);
  const [anios, setAnios] = useState<number>(10);

  // Inputs Exclusivos de Modo Objetivo
  const [metaFinanciera, setMetaFinanciera] = useState<number>(50000);

  // Estados de Salida / Resultados
  const [capitalFinal, setCapitalFinal] = useState<number>(0);
  const [totalAportado, setTotalAportado] = useState<number>(0);
  const [interesesGenerados, setInteresesGenerados] = useState<number>(0);
  const [ahorroNecesario, setAhorroNecesario] = useState<number>(0);
  
  // Histórico anual para renderizar el gráfico dinámico
  const [historicoAnual, setHistoricoAnual] = useState<Array<{ anio: number; aportado: number; interes: number; total: number }>>([]);

  // Efecto de cálculo matemático en tiempo real
  useEffect(() => {
    const tasaMensual = (interesAnual / 100) / 12;
    const meses = anios * 12;

    if (modo === "proyeccion") {
      let totalSuma = inicial;
      let aportaciones = inicial;
      const datosGrafico = [];

      for (let m = 1; m <= meses; m++) {
        totalSuma = totalSuma * (1 + tasaMensual) + ahorroMensual;
        aportaciones += ahorroMensual;

        // Guardamos el corte al final de cada año
        if (m % 12 === 0) {
          const anioActual = m / 12;
          datosGrafico.push({
            anio: anioActual,
            aportado: Math.round(aportaciones),
            interes: Math.round(totalSuma - aportaciones),
            total: Math.round(totalSuma)
          });
        }
      }

      setCapitalFinal(Math.round(totalSuma));
      setTotalAportado(Math.round(aportaciones));
      setInteresesGenerados(Math.round(totalSuma - aportaciones));
      setHistoricoAnual(datosGrafico);

    } else {
      // MODO OBJETIVO: Calcular la cuota mensual necesaria para llegar a la Meta
      let factorCompuesto = Math.pow(1 + tasaMensual, meses);
      let acumuladoInicial = inicial * factorCompuesto;
      let cantidadRestante = metaFinanciera - acumuladoInicial;

      let cuotaMensual = 0;
      if (cantidadRestante > 0 && tasaMensual > 0) {
        cuotaMensual = cantidadRestante = cantidadRestante / (((Math.pow(1 + tasaMensual, meses)) - 1) / tasaMensual);
      } else if (cantidadRestante > 0) {
        cuotaMensual = cantidadRestante / meses;
      }

      const cuotaFinal = Math.max(0, Math.round(cuotaMensual));
      setAhorroNecesario(cuotaFinal);

      // Re-simular con la cuota calculada para pintar el gráfico del objetivo
      let totalSuma = inicial;
      let aportaciones = inicial;
      const datosGrafico = [];

      for (let m = 1; m <= meses; m++) {
        totalSuma = totalSuma * (1 + tasaMensual) + cuotaFinal;
        aportaciones += cuotaFinal;

        if (m % 12 === 0) {
          datosGrafico.push({
            anio: m / 12,
            aportado: Math.round(aportaciones),
            interes: Math.round(totalSuma - aportaciones),
            total: Math.round(totalSuma)
          });
        }
      }
      setCapitalFinal(Math.round(totalSuma));
      setTotalAportado(Math.round(aportaciones));
      setInteresesGenerados(Math.round(totalSuma - aportaciones));
      setHistoricoAnual(datosGrafico);
    }
  }, [inicial, ahorroMensual, interesAnual, anios, metaFinanciera, modo]);

  // Encontrar el valor máximo para escalar proporcionalmente las barras del gráfico
  const valorMaximoGrafico = historicoAnual.length > 0 ? Math.max(...historicoAnual.map(d => d.total)) : 1;

  return (
    <main className="w-full min-h-screen bg-white text-gray-900 px-4 py-6 md:py-10 antialiased">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* ENCABEZADO */}
        <header className="border-b border-gray-100 pb-5">
          <Link href="/formacion" className="text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors w-fit flex items-center gap-1 mb-2">
            ← Volver a la Academia
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl">📊</span>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Simulador Financiero</h1>
          </div>
        </header>

        {/* SELECTOR DE MODO (ESTILO FINTECH) */}
        <div className="bg-gray-100 p-1.5 rounded-2xl flex w-full sm:w-fit gap-1">
          <button
            onClick={() => setModo("proyeccion")}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              modo === "proyeccion" ? "bg-[#111827] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Proyectar mi Ahorro
          </button>
          <button
            onClick={() => setModo("objetivo")}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              modo === "objetivo" ? "bg-[#111827] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Alcanzar un Objetivo
          </button>
        </div>

        {/* CONTENEDOR CENTRAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* PANEL DE CONFIGURACIÓN */}
          <div className="md:col-span-2 bg-[#111827] rounded-3xl p-6 md:p-8 space-y-6 shadow-md border border-white/5">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">
              {modo === "proyeccion" ? "Datos de tu Inversión" : "Define tu Meta"}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* INPUT EXCLUSIVO MODO OBJETIVO */}
              {modo === "objetivo" && (
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-violet-400 uppercase tracking-wider">¿Qué capital quieres conseguir? (€)</label>
                  <input
                    type="number"
                    value={metaFinanciera}
                    onChange={(e) => setMetaFinanciera(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-violet-500/10 border border-violet-500/30 rounded-2xl p-4 text-white text-lg font-bold focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              )}

              {/* Inversión Inicial */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/70 uppercase">Inversión Inicial (€)</label>
                <input
                  type="number"
                  value={inicial}
                  onChange={(e) => setInicial(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Ahorro Mensual (Oculto en modo objetivo) */}
              {modo === "proyeccion" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/70 uppercase">Ahorro Mensual (€)</label>
                  <input
                    type="number"
                    value={ahorroMensual}
                    onChange={(e) => setAhorroMensual(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Tasa de Interés */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/70 uppercase">Interés Anual Estimado (%)</label>
                <input
                  type="number"
                  value={interesAnual}
                  onChange={(e) => setInteresAnual(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Plazo temporal */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/70 uppercase">Horizonte Temporal (Años)</label>
                <input
                  type="number"
                  value={anios}
                  onChange={(e) => setAnios(Math.min(40, Math.max(1, Number(e.target.value))))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* GRÁFICO INTERACTIVO NATIVO FINTECH */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs text-white/60 font-medium">
                <span>Crecimiento de tu dinero a lo largo del tiempo</span>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-600 rounded-sm inline-block"></span>Aportado</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#1FA187] rounded-sm inline-block"></span>Intereses</span>
                </div>
              </div>

              {/* Contenedor Barras del Gráfico */}
              <div className="h-44 flex items-end justify-between gap-1 pt-4 px-2 bg-white/[0.02] rounded-2xl border border-white/5 overflow-x-auto scrollbar-none">
                {historicoAnual.map((d) => {
                  const pctA = (d.aportado / valorMaximoGrafico) * 100;
                  const pctI = (d.interes / valorMaximoGrafico) * 100;
                  return (
                    <div key={d.anio} className="flex-1 min-w-[20px] max-w-[40px] flex flex-col items-center h-full justify-end group relative">
                      <div className="absolute bottom-full mb-2 bg-gray-950 text-white text-[10px] p-2 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 w-28 text-center shadow-xl">
                        <p className="font-bold text-white/50">Año {d.anio}</p>
                        <p className="text-blue-400">Inv: {d.aportado}€</p>
                        <p className="text-[#1FA187]">Int: {d.interes}€</p>
                      </div>
                      <div className="w-full flex flex-col justify-end rounded-t-md overflow-hidden h-full">
                        <div style={{ height: `${pctI}%` }} className="w-full bg-[#1FA187] opacity-80"></div>
                        <div style={{ height: `${pctA}%` }} className="w-full bg-blue-600 opacity-90"></div>
                      </div>
                      <span className="text-[10px] text-white/40 mt-1">A{d.anio}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PANEL LATERAL DE RESULTADOS */}
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3">Resultados del Plan</h2>
            {modo === "objetivo" && (
              <div className="p-4 bg-violet-50 border border-violet-100 rounded-2xl">
                <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">Ahorro Requerido</p>
                <p className="text-2xl font-black text-violet-600 mt-1">{ahorroNecesario.toLocaleString("es-ES")} €/mes</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monto Total Estimado</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{capitalFinal.toLocaleString("es-ES")} €</p>
              </div>
              <div className="pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Capital Propio</p>
                  <p className="text-base font-bold text-gray-800 mt-0.5">{totalAportado.toLocaleString("es-ES")} €</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Intereses</p>
                  <p className="text-base font-bold text-[#1FA187] mt-0.5">+{interesesGenerados.toLocaleString("es-ES")} €</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
