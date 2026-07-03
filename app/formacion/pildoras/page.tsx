"use client";

import Link from "next/link";
import { useState } from "react";
import { pildoras } from "./pildorasData"; // <-- CONEXIÓN AUTOMÁTICA

const categorias = ["Todas", "Inversión", "Macroeconomía", "Ahorro", "Fiscalidad"];

export default function PildorasPage() {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");

  // Calcula automáticamente si la píldora se subió hace menos de una semana
  const esPildoraReciente = (fechaStr: string) => {
    try {
      const meses: { [key: string]: number } = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
      };
      const partes = fechaStr.split(" ");
      const dia = parseInt(partes[0], 10);   // [0] coge el primer elemento (el día)
      const mes = meses[partes[1]];          // [1] coge el segundo elemento (el mes)
      const anio = parseInt(partes[2], 10);  // [2] coge el tercer elemento (el año)
      
      const fechaPildora = new Date(anio, mes, dia);
      const fechaActual = new Date();
      const diferenciaTiempo = fechaActual.getTime() - fechaPildora.getTime();
      const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));
      
      return diferenciaDias >= 0 && diferenciaDias <= 7;
    } catch (e) {
      return false;
    }
  };

  const pildorasFiltradas = pildoras.filter((pildora) => {
    const coincideBusqueda = pildora.titulo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaSeleccionada === "Todas" ? true : pildora.categoria === categoriaSeleccionada;
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <main className="w-full min-h-screen bg-white text-gray-900 px-4 py-6 md:py-10 antialiased">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        <header className="border-b border-gray-100 pb-5">
          <div className="flex flex-col gap-2">
            <Link href="/formacion" className="text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors w-fit flex items-center gap-1">
              ← Volver a la Academia
            </Link>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl md:text-4xl">💊</span>
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Píldoras de Aprendizaje</h1>
            </div>
            <p className="mt-1 text-sm text-gray-500 max-w-xl">
              Lecciones express de pocos minutos. Conceptos financieros explicados de forma directa.
            </p>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar concepto o píldora..."
            className="w-full md:w-72 rounded-2xl bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <div className="w-full overflow-x-auto flex gap-2 pb-1 scrollbar-none">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                onClick={() => setCategoriaSeleccionada(categoria)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                  categoriaSeleccionada === categoria ? "bg-[#111827] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {pildorasFiltradas.map((pildora) => (
            <Link key={pildora.id} href={`/formacion/pildoras/${pildora.id}`} className="group block bg-[#111827] rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200">
              <div className="flex flex-col h-full justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40 flex items-center gap-1">⏱️ {pildora.duracion}</span>
                    {esPildoraReciente(pildora.fecha) && (
                      <span className="bg-[#1FA187] text-black text-[10px] font-black px-2 py-0.5 rounded-full">NUEVO</span>
                    )}
                  </div>
                  <h2 className="mt-3 text-base md:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">{pildora.titulo}</h2>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-[#1FA187] text-xs font-semibold uppercase tracking-wider">{pildora.categoria}</span>
                  <span className="text-white text-xs font-medium">Iniciar lección →</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
