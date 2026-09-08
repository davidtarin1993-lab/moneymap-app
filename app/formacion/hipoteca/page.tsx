"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Home, Info } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function SimuladorHipotecaPage() {
  const router = useRouter();
  const [cargandoAuth, setCargandoAuth] = useState(true);

  const [precioVivienda, setPrecioVivienda] = useState("250000");
  const [entradaPct, setEntradaPct] = useState("20");
  const [plazoAnios, setPlazoAnios] = useState("25");

  const [tipoHipoteca, setTipoHipoteca] = useState<"fijo" | "variable">("fijo");
  const [tipoInteresFijo, setTipoInteresFijo] = useState("3.2");
  const [diferencial, setDiferencial] = useState("0.9");
  const [euriborActual, setEuriborActual] = useState("2.6");

  useEffect(() => {
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCargandoAuth(false);
    }
    verificar();
  }, [router]);

  const tasaAnualEfectiva = tipoHipoteca === "fijo"
    ? Number(tipoInteresFijo) || 0
    : (Number(diferencial) || 0) + (Number(euriborActual) || 0);

  const resultado = useMemo(() => {
    const precio = Number(precioVivienda) || 0;
    const entrada = precio * ((Number(entradaPct) || 0) / 100);
    const capitalPrestado = precio - entrada;
    const meses = (Number(plazoAnios) || 1) * 12;
    const tasaMensual = tasaAnualEfectiva / 100 / 12;

    let cuotaMensual = 0;
    if (tasaMensual > 0) {
      cuotaMensual = capitalPrestado * (tasaMensual * Math.pow(1 + tasaMensual, meses)) / (Math.pow(1 + tasaMensual, meses) - 1);
    } else {
      cuotaMensual = capitalPrestado / meses;
    }

    const totalPagado = cuotaMensual * meses;
    const totalIntereses = totalPagado - capitalPrestado;

    return {
      entrada,
      capitalPrestado,
      cuotaMensual: isFinite(cuotaMensual) ? cuotaMensual : 0,
      totalPagado: isFinite(totalPagado) ? totalPagado : 0,
      totalIntereses: isFinite(totalIntereses) ? totalIntereses : 0,
    };
  }, [precioVivienda, entradaPct, plazoAnios, tasaAnualEfectiva]);

  const datosPie = [
    { name: "Capital prestado", value: resultado.capitalPrestado, color: "#0B3A6E" },
    { name: "Intereses totales", value: Math.max(resultado.totalIntereses, 0), color: "#B45309" },
  ];

  const formato = (n: number) => n.toLocaleString("es-ES", { maximumFractionDigits: 0 });

  if (cargandoAuth) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm font-bold text-slate-500">Cargando...</p>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 md:py-10 pb-24 antialiased">
      <div className="max-w-lg mx-auto w-full">
        <Link href="/aplicaciones" className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-[#0B3A6E] mb-3">
          <ArrowLeft size={12} /> Volver a Aplicaciones
        </Link>

        <header className="border-b border-slate-100 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <Home size={32} className="text-[#0B3A6E]" />
            <h1 className="text-2xl md:text-3xl font-black text-[#0B3A6E] tracking-tight">Simulador de Hipoteca</h1>
          </div>
          <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-xl font-medium leading-normal">
            Calcula tu cuota mensual estimada a tipo fijo o variable.
          </p>
        </header>

        {/* SELECTOR FIJO / VARIABLE */}
        <div className="inline-flex bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1 mb-4">
          <button
            type="button"
            onClick={() => setTipoHipoteca("fijo")}
            className={`text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-lg transition-all ${
              tipoHipoteca === "fijo" ? "bg-[#0B3A6E] text-white" : "text-slate-500"
            }`}
          >
            Tipo Fijo
          </button>
          <button
            type="button"
            onClick={() => setTipoHipoteca("variable")}
            className={`text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-lg transition-all ${
              tipoHipoteca === "variable" ? "bg-[#0B3A6E] text-white" : "text-slate-500"
            }`}
          >
            Tipo Variable
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 mb-4">
          <div>
            <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Precio de la vivienda (€)</label>
            <input
              type="number"
              value={precioVivienda}
              onChange={(e) => setPrecioVivienda(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Entrada (%)</label>
              <input
                type="number"
                value={entradaPct}
                onChange={(e) => setEntradaPct(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]"
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Plazo (años)</label>
              <input
                type="number"
                value={plazoAnios}
                onChange={(e) => setPlazoAnios(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]"
              />
            </div>
          </div>

          {tipoHipoteca === "fijo" ? (
            <div>
              <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Tipo de interés fijo anual (%)</label>
              <input
                type="number"
                step="0.1"
                value={tipoInteresFijo}
                onChange={(e) => setTipoInteresFijo(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Diferencial (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={diferencial}
                  onChange={(e) => setDiferencial(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Euríbor actual (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={euriborActual}
                  onChange={(e) => setEuriborActual(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]"
                />
              </div>
            </div>
          )}

          {tipoHipoteca === "variable" && (
            <p className="text-[10px] text-slate-400 font-medium">
              Tasa aplicada estimada: <span className="font-black text-slate-600">{tasaAnualEfectiva.toFixed(2)}%</span> (diferencial + euríbor actual)
            </p>
          )}
        </div>

        <div className="bg-[#0B3A6E] rounded-2xl p-5 text-center mb-4 shadow-md">
          <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Cuota mensual estimada</p>
          <p className="text-3xl font-black text-white mt-1">{formato(resultado.cuotaMensual)}€<span className="text-sm text-white/50">/mes</span></p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Reparto del coste total</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={datosPie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {datosPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(value: any) => `${formato(Number(value))}€`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {datosPie.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[10px] font-bold text-slate-600">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">Entrada necesaria</p>
            <p className="text-sm font-black text-slate-800 mt-0.5">{formato(resultado.entrada)}€</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">Capital a financiar</p>
            <p className="text-sm font-black text-slate-800 mt-0.5">{formato(resultado.capitalPrestado)}€</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">Intereses totales</p>
            <p className="text-sm font-black text-amber-700 mt-0.5">{formato(resultado.totalIntereses)}€</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">Total a pagar</p>
            <p className="text-sm font-black text-slate-800 mt-0.5">{formato(resultado.totalPagado)}€</p>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-cyan-50 border border-cyan-100 rounded-xl p-3">
          <Info size={13} className="text-cyan-700 shrink-0 mt-0.5" />
          <p className="text-[10px] text-cyan-800 font-bold leading-relaxed">
            {tipoHipoteca === "fijo"
              ? "Estimación orientativa con cuota fija (sistema francés). No incluye seguros, comisiones ni gastos de notaría/registro."
              : "Estimación orientativa usando el euríbor actual + tu diferencial como tasa constante. En una hipoteca variable real, la cuota se revisa periódicamente (normalmente cada 6 o 12 meses) y puede subir o bajar según evolucione el euríbor. No incluye seguros, comisiones ni gastos de notaría/registro."}
          </p>
        </div>
      </div>
    </main>
  );
}