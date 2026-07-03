"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { listaMovimientos, capitalInicialSoporte } from "./carteraData";

export default function CarteraPage() {
  const [mostrarDisclaimer, setMostrarDisclaimer] = useState<boolean>(false);
  const [pestañaMovimientos, setPestañaMovimientos] = useState<"abiertos" | "cerrados">("abiertos");
  const [movimientoExpandido, setMovimientoExpandido] = useState<number | null>(null);

  const [capitalActual, setCapitalActual] = useState<number>(capitalInicialSoporte);
  const [rentabilidadTotal, setRentabilidadTotal] = useState<number>(0);
  const [distribucion, setDistribucion] = useState<Array<{ nombre: string; porcentaje: number; color: string }>>([]);

  useEffect(() => {
    const dclAceptado = localStorage.getItem("moneymap_disclaimer_aceptado");
    if (!dclAceptado) setMostrarDisclaimer(true);

    let gananciasCerradasTotales = 0;
    let totalCosteActivosVivos = 0;
    
    const valoresMercadoActual = { Acciones: 0, Cripto: 0, Oro: 0, Liquidez: 0 };

    listaMovimientos.forEach((m) => {
      const valorInversionInicial = m.precio * m.titulos;

      if (m.estado === "Abierto") {
        totalCosteActivosVivos += valorInversionInicial;
        // Revalorización pedagógica simulada del +15% sobre lo invertido realmente
        valoresMercadoActual[m.categoria] += valorInversionInicial * 1.15;
      }
      
      if (m.estado === "Cerrado" && m.precioVenta) {
        const beneficioOperacion = (m.precioVenta - m.precio) * m.titulos;
        gananciasCerradasTotales += beneficioOperacion;
      }
    });

    const totalValorActivosVivos = valoresMercadoActual.Acciones + valoresMercadoActual.Cripto + valoresMercadoActual.Oro;
    const liquidezRestanteEfectiva = capitalInicialSoporte - totalCosteActivosVivos + gananciasCerradasTotales;
    
    const valorTotalCartera = Math.round(liquidezRestanteEfectiva + totalValorActivosVivos);
    
    setCapitalActual(valorTotalCartera);
    setRentabilidadTotal(parseFloat((((valorTotalCartera - capitalInicialSoporte) / capitalInicialSoporte) * 100).toFixed(1)));

    const divisor = valorTotalCartera || 1;
    const pctAcciones = Math.round((valoresMercadoActual.Acciones / divisor) * 100);
    const pctCripto = Math.round((valoresMercadoActual.Cripto / divisor) * 100);
    const pctOro = Math.round((valoresMercadoActual.Oro / divisor) * 100);
    
    const pctLiquidez = 100 - (pctAcciones + pctCripto + pctOro);

    setDistribucion([
      { nombre: "Renta Variable (Acciones/ETFs)", porcentaje: pctAcciones, color: "bg-blue-600" },
      { nombre: "Criptoactivos (BTC/ETH)", porcentaje: pctCripto, color: "bg-amber-500" },
      { nombre: "Oro y Materias Primas", porcentaje: pctOro, color: "bg-yellow-600" },
      { nombre: "Liquidez (Monetarios)", porcentaje: pctLiquidez, color: "bg-emerald-600" }
    ]);
  }, []);

  const toggleExpandir = (id: number) => {
    setMovimientoExpandido(movimientoExpandido === id ? null : id);
  };

  const cerrarDisclaimer = () => {
    localStorage.setItem("moneymap_disclaimer_aceptado", "true");
    setMostrarDisclaimer(false);
  };

  const movimientosFiltrados = listaMovimientos.filter(m => 
    pestañaMovimientos === "abiertos" ? m.estado === "Abierto" : m.estado === "Cerrado"
  );

  return (
    <main className="w-full min-h-screen bg-white text-gray-900 px-4 py-6 md:py-10 antialiased relative">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* ENCABEZADO */}
        <header className="border-b border-gray-100 pb-5">
          <Link href="/formacion" className="text-xs font-semibold text-gray-400 hover:text-gray-900 flex items-center gap-1 mb-2">
            ← Volver a la Academia
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl md:text-4xl">💰</span>
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Cartera Modelo MoneyMap</h1>
            </div>
          </div>
        </header>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#111827] rounded-3xl p-5 text-white border border-white/5 shadow-sm">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Rentabilidad Histórica</p>
            <p className="text-3xl font-black text-[#1FA187] mt-1">+{rentabilidadTotal}%</p>
          </div>
          <div className="bg-[#111827] rounded-3xl p-5 text-white border border-white/5 shadow-sm">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Capital Inicial</p>
            <p className="text-2xl font-black mt-1.5">{capitalInicialSoporte.toLocaleString("es-ES")} €</p>
          </div>
          <div className="bg-[#111827] rounded-3xl p-5 text-white border border-white/5 shadow-sm">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Valor Actual Cartera</p>
            <p className="text-2xl font-black text-blue-400 mt-1.5">{capitalActual.toLocaleString("es-ES")} €</p>
          </div>
        </div>

        {/* GRÁFICO DE DISTRIBUCIÓN */}
        <section className="bg-gray-50 border border-gray-200 rounded-3xl p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900">Distribución Dinámica de Activos (% del Valor Actual)</h2>
          <div className="w-full h-7 rounded-2xl overflow-hidden flex shadow-inner">
            {distribucion.map((activo) => (
              <div 
                key={activo.nombre} 
                style={{ width: `${activo.porcentaje}%` }} 
                className={`${activo.color} h-full relative group transition-all duration-200`}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {distribucion.map((activo) => (
              <div key={activo.nombre} className="flex items-center gap-2 text-xs">
                <span className={`w-3 h-3 rounded-full ${activo.color} flex-shrink-0`}></span>
                <span className="text-gray-500 font-medium">{activo.nombre}:</span>
                <span className="font-bold text-gray-800">{activo.porcentaje}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* HISTORIAL INTERACTIVO */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 className="text-base font-bold text-gray-900">Operaciones de la Cuenta</h2>
            <div className="bg-gray-100 p-1 rounded-xl flex gap-1 text-xs font-bold">
              <button onClick={() => setPestañaMovimientos("abiertos")} className={`px-3 py-1.5 rounded-lg transition-all ${pestañaMovimientos === "abiertos" ? "bg-[#111827] text-white" : "text-gray-500"}`}>Abiertos</button>
              <button onClick={() => setPestañaMovimientos("cerrados")} className={`px-3 py-1.5 rounded-lg transition-all ${pestañaMovimientos === "cerrados" ? "bg-[#111827] text-white" : "text-gray-500"}`}>Cerrados</button>
            </div>
          </div>

          <div className="space-y-2">
            {movimientosFiltrados.map((m) => {
              const estaAbierto = movimientoExpandido === m.id;
              
              // Valores monetarios totales reales en cartera (Precio * Títulos)
              const valorCompraTotal = m.precio * m.titulos;
              const valorVentaTotal = m.precioVenta ? m.precioVenta * m.titulos : 0;

              let rendimientoOperacionStr = "";
              if (m.estado === "Cerrado" && m.precioVenta) {
                const gananciaPorcentaje = ((m.precioVenta - m.precio) / m.precio) * 100;
                const gananciaEuros = valorVentaTotal - valorCompraTotal;
                rendimientoOperacionStr = `+${gananciaEuros.toFixed(2)}€ (+${gananciaPorcentaje.toFixed(1)}%)`;
              }

              return (
                <div key={m.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-200">
                  <button onClick={() => toggleExpandir(m.id)} className="w-full flex items-center justify-between p-4 text-xs md:text-sm text-left hover:bg-gray-50/60 focus:outline-none">
                    <div className="flex items-center gap-3">
                      <span className={`font-black px-2 py-1 rounded-lg text-[10px] ${m.tipo === "COMPRA" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                        {m.tipo}
                      </span>
                      <div>
                        <p className="font-bold text-gray-800 flex items-center gap-1.5">
                          {m.activo}
                          <span className="text-[10px] text-gray-400 font-normal">{estaAbierto ? "▲" : "▼"}</span>
                        </p>
                        {/* FECHA ABAJO: Organizada jerárquicamente debajo de los títulos */}
                        <div className="text-[11px] text-gray-400 space-y-0.5 mt-0.5">
                          <p className="font-medium">Volumen: {m.titulos} títulos</p>
                          <p className="text-[10px] opacity-80">{m.fecha}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {m.estado === "Abierto" ? (
                        /* SOLUCIÓN AL DESCUADRE: Muestra el valor invertido real en tu tarta de patrimonio */
                        <p className="font-bold text-gray-900">Valor de compra: {valorCompraTotal.toLocaleString("es-ES")} €</p>
                      ) : (
                        <>
                        Compra: {valorCompraTotal.toLocaleString("es-ES")}€
                          <p className="text-gray-400 text-[11px] line-through">Compra: {valorCompraTotal.toLocaleString("es-ES")}€</p>
                          <p className="font-bold text-gray-900">Venta: {valorVentaTotal.toLocaleString("es-ES")} €</p>
                        </>
                      )}
                      {m.estado === "Cerrado" && <p className="text-[11px] font-black text-[#1FA187]">{rendimientoOperacionStr}</p>}
                    </div>
                  </button>

                  {/* DESPLEGABLE MOTIVACIÓN */}
                  {estaAbierto && (
                    <div className="px-4 pb-4 pt-1 bg-gray-50/70 border-t border-gray-100/60 text-xs text-gray-600 leading-relaxed animate-fadeIn">
                      <div className="bg-white border border-gray-200/60 rounded-xl p-3 space-y-1">
                        <p className="font-bold text-[#111827] uppercase tracking-wider text-[10px] text-gray-400">Tesis y Detalles Educativos:</p>
                        <p className="text-gray-600">{m.motivacion}</p>
                        <div className="text-[11px] text-gray-400 pt-1 space-y-0.5">
                          <p>Precio unitario de adquisición: {m.precio.toLocaleString("es-ES")} €</p>
                          {m.precioVenta && <p>Precio unitario de liquidación: {m.precioVenta.toLocaleString("es-ES")} €</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* POP-UP LEGAL */}
      {mostrarDisclaimer && (
        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 flex flex-col space-y-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-black text-gray-900 uppercase">Aviso Legal Obligatorio</h3>
            </div>
            <div className="text-xs text-gray-500 overflow-y-auto space-y-3 leading-relaxed">
              <p>Invertir desde Cero no representa un servicio de inversión. Este es un espacio de <strong>formación y educación financiera</strong> de carácter genérico y no personalizado.</p>
              <p className="font-bold text-gray-800 bg-gray-50 p-2.5 rounded-xl border border-gray-200">CADA ALUMNO/A ES RESPONSABLE DE SUS DECISIONES DE COMPRA O VENTA DE VALORES O DE CUALQUIER OTRO ACTIVO FINANCIERO.</p>
            </div>
            <button onClick={cerrarDisclaimer} className="w-full bg-[#111827] text-white text-xs font-bold p-3.5 rounded-2xl hover:bg-gray-800">
              Comprendo y Acepto las Condiciones
            </button>
          </div>
        </div>
      )}
    </main>
  );
}