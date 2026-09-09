"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Home, Info, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type TipoHipoteca = "fijo" | "variable" | "mixta";

export default function SimuladorHipotecaPage() {
  const router = useRouter();
  const [cargandoAuth, setCargandoAuth] = useState(true);

  const [precioVivienda, setPrecioVivienda] = useState("250000");
  const [sinEntrada, setSinEntrada] = useState(false);
  const [entradaPct, setEntradaPct] = useState("20");
  const [plazoAnios, setPlazoAnios] = useState("25");

  const [tipoHipoteca, setTipoHipoteca] = useState<TipoHipoteca>("fijo");
  const [tipoInteresFijo, setTipoInteresFijo] = useState("3.2");
  const [diferencial, setDiferencial] = useState("0.9");
  const [euriborActual, setEuriborActual] = useState("2.6");
  const [aniosFijoMixta, setAniosFijoMixta] = useState("5");

  const [mostrarAmortizacion, setMostrarAmortizacion] = useState(false);

  useEffect(() => {
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCargandoAuth(false);
    }
    verificar();
  }, [router]);

  const resultado = useMemo(() => {
    const precio = Number(precioVivienda) || 0;
    const entradaPctEfectivo = sinEntrada ? 0 : (Number(entradaPct) || 0);
    const entrada = precio * (entradaPctEfectivo / 100);
    const capitalPrestado = precio - entrada;
    const mesesTotal = (Number(plazoAnios) || 1) * 12;

    let cuotaFija = 0, cuotaVariable = 0, mesesFijo = 0;
    let cuotaMensualUnica = 0;
    let rFijo = 0, rVariable = 0, rUnica = 0;

    if (tipoHipoteca === "mixta") {
      mesesFijo = Math.min((Number(aniosFijoMixta) || 0) * 12, mesesTotal);
      rFijo = (Number(tipoInteresFijo) || 0) / 100 / 12;
      rVariable = ((Number(diferencial) || 0) + (Number(euriborActual) || 0)) / 100 / 12;

      if (rFijo > 0) {
        cuotaFija = capitalPrestado * (rFijo * Math.pow(1 + rFijo, mesesTotal)) / (Math.pow(1 + rFijo, mesesTotal) - 1);
      } else {
        cuotaFija = capitalPrestado / mesesTotal;
      }

      let saldoTrasFijo = capitalPrestado;
      if (rFijo > 0) {
        saldoTrasFijo = capitalPrestado * Math.pow(1 + rFijo, mesesFijo) - cuotaFija * ((Math.pow(1 + rFijo, mesesFijo) - 1) / rFijo);
      } else {
        saldoTrasFijo = capitalPrestado - cuotaFija * mesesFijo;
      }
      saldoTrasFijo = Math.max(saldoTrasFijo, 0);

      const mesesVariable = mesesTotal - mesesFijo;
      if (mesesVariable > 0) {
        if (rVariable > 0) {
          cuotaVariable = saldoTrasFijo * (rVariable * Math.pow(1 + rVariable, mesesVariable)) / (Math.pow(1 + rVariable, mesesVariable) - 1);
        } else {
          cuotaVariable = saldoTrasFijo / mesesVariable;
        }
      }
    } else {
      const tasaAnual = tipoHipoteca === "fijo"
        ? (Number(tipoInteresFijo) || 0)
        : ((Number(diferencial) || 0) + (Number(euriborActual) || 0));
      rUnica = tasaAnual / 100 / 12;
      if (rUnica > 0) {
        cuotaMensualUnica = capitalPrestado * (rUnica * Math.pow(1 + rUnica, mesesTotal)) / (Math.pow(1 + rUnica, mesesTotal) - 1);
      } else {
        cuotaMensualUnica = capitalPrestado / mesesTotal;
      }
    }

    let saldo = capitalPrestado;
    const porAnio: Record<number, { anio: number; capital: number; interes: number; saldo: number }> = {};
    let totalPagado = 0;

    for (let m = 1; m <= mesesTotal; m++) {
      const enFaseFija = tipoHipoteca === "mixta" && m <= mesesFijo;
      const rMes = tipoHipoteca === "mixta" ? (enFaseFija ? rFijo : rVariable) : rUnica;
      const cuotaMes = tipoHipoteca === "mixta" ? (enFaseFija ? cuotaFija : cuotaVariable) : cuotaMensualUnica;

      const interesMes = saldo * rMes;
      let capitalMes = cuotaMes - interesMes;
      if (capitalMes > saldo) capitalMes = saldo;
      if (capitalMes < 0) capitalMes = 0;
      saldo = Math.max(saldo - capitalMes, 0);
      totalPagado += capitalMes + interesMes;

      const anio = Math.ceil(m / 12);
      if (!porAnio[anio]) porAnio[anio] = { anio, capital: 0, interes: 0, saldo: 0 };
      porAnio[anio].capital += capitalMes;
      porAnio[anio].interes += interesMes;
      porAnio[anio].saldo = saldo;
    }

    const datosPorAnio = Object.values(porAnio).map((d) => ({
      anio: d.anio,
      capital: Math.round(d.capital),
      interes: Math.round(d.interes),
      cuota: Math.round(d.capital + d.interes),
      saldo: Math.round(d.saldo),
    }));

    const totalIntereses = totalPagado - capitalPrestado;

    return {
      entrada,
      capitalPrestado,
      cuotaMensual: tipoHipoteca === "mixta" ? cuotaFija : cuotaMensualUnica,
      cuotaFija,
      cuotaVariable,
      totalPagado: isFinite(totalPagado) ? totalPagado : 0,
      totalIntereses: isFinite(totalIntereses) ? totalIntereses : 0,
      datosPorAnio,
    };
  }, [precioVivienda, sinEntrada, entradaPct, plazoAnios, tipoHipoteca, tipoInteresFijo, diferencial, euriborActual, aniosFijoMixta]);

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
            Calcula tu cuota mensual a tipo fijo, variable o mixto.
          </p>
        </header>

        <div className="inline-flex bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1 mb-4 w-full">
          <button type="button" onClick={() => setTipoHipoteca("fijo")}
            className={`flex-1 text-[10.5px] font-black uppercase tracking-wider px-2 py-2 rounded-lg transition-all ${tipoHipoteca === "fijo" ? "bg-[#0B3A6E] text-white" : "text-slate-500"}`}>
            Fijo
          </button>
          <button type="button" onClick={() => setTipoHipoteca("variable")}
            className={`flex-1 text-[10.5px] font-black uppercase tracking-wider px-2 py-2 rounded-lg transition-all ${tipoHipoteca === "variable" ? "bg-[#0B3A6E] text-white" : "text-slate-500"}`}>
            Variable
          </button>
          <button type="button" onClick={() => setTipoHipoteca("mixta")}
            className={`flex-1 text-[10.5px] font-black uppercase tracking-wider px-2 py-2 rounded-lg transition-all ${tipoHipoteca === "mixta" ? "bg-[#0B3A6E] text-white" : "text-slate-500"}`}>
            Mixta
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 mb-4">
          <div>
            <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Precio de la vivienda (€)</label>
            <input type="number" value={precioVivienda} onChange={(e) => setPrecioVivienda(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]" />
          </div>

          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2.5">
            <label htmlFor="sinEntrada" className="text-[10.5px] font-bold text-slate-600">Sin entrada (financiación 100%)</label>
            <button
              type="button"
              id="sinEntrada"
              onClick={() => setSinEntrada(!sinEntrada)}
              className={`w-9 h-5 rounded-full transition-all relative shrink-0 ${sinEntrada ? "bg-[#1FA187]" : "bg-slate-300"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${sinEntrada ? "left-4.5" : "left-0.5"}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Entrada (%)</label>
              <input type="number" value={sinEntrada ? 0 : entradaPct} onChange={(e) => setEntradaPct(e.target.value)}
                disabled={sinEntrada}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E] disabled:opacity-40 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Plazo (años)</label>
              <input type="number" value={plazoAnios} onChange={(e) => setPlazoAnios(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]" />
            </div>
          </div>

          {tipoHipoteca === "fijo" && (
            <div>
              <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Tipo de interés fijo anual (%)</label>
              <input type="number" step="0.1" value={tipoInteresFijo} onChange={(e) => setTipoInteresFijo(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]" />
            </div>
          )}

          {tipoHipoteca === "variable" && (
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Diferencial (%)</label>
                <input type="number" step="0.05" value={diferencial} onChange={(e) => setDiferencial(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]" />
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Euríbor actual (%)</label>
                <input type="number" step="0.05" value={euriborActual} onChange={(e) => setEuriborActual(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]" />
              </div>
            </div>
          )}

          {tipoHipoteca === "mixta" && (
            <>
              <div>
                <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Años a tipo fijo</label>
                <input type="number" value={aniosFijoMixta} onChange={(e) => setAniosFijoMixta(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Tipo fijo inicial (%)</label>
                  <input type="number" step="0.1" value={tipoInteresFijo} onChange={(e) => setTipoInteresFijo(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]" />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Euríbor actual (%)</label>
                  <input type="number" step="0.05" value={euriborActual} onChange={(e) => setEuriborActual(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]" />
                </div>
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Diferencial variable posterior (%)</label>
                <input type="number" step="0.05" value={diferencial} onChange={(e) => setDiferencial(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]" />
              </div>
            </>
          )}
        </div>

        {tipoHipoteca === "mixta" ? (
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div className="bg-[#0B3A6E] rounded-2xl p-4 text-center shadow-md">
              <p className="text-[9px] font-black uppercase tracking-wider text-white/70">Cuota fija ({aniosFijoMixta} años)</p>
              <p className="text-xl font-black text-white mt-1">{formato(resultado.cuotaFija ?? 0)}€</p>
            </div>
            <div className="bg-amber-600 rounded-2xl p-4 text-center shadow-md">
              <p className="text-[9px] font-black uppercase tracking-wider text-white/70">Cuota variable (resto)</p>
              <p className="text-xl font-black text-white mt-1">{formato(resultado.cuotaVariable ?? 0)}€</p>
            </div>
          </div>
        ) : (
          <div className="bg-[#0B3A6E] rounded-2xl p-5 text-center mb-4 shadow-md">
            <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Cuota mensual estimada</p>
            <p className="text-3xl font-black text-white mt-1">{formato(resultado.cuotaMensual)}€<span className="text-sm text-white/50">/mes</span></p>
          </div>
        )}

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

        {/* CUADRO DE AMORTIZACIÓN (DESPLEGABLE) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden mb-4">
          <button
            onClick={() => setMostrarAmortizacion(!mostrarAmortizacion)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Cuadro de amortización</span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${mostrarAmortizacion ? "rotate-180" : ""}`} />
          </button>

          {mostrarAmortizacion && (
            <div className="border-t border-slate-200 max-h-64 overflow-y-auto">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-slate-100">
                  <tr className="text-left text-slate-500 font-black uppercase">
                    <th className="px-3 py-2">Año</th>
                    <th className="px-3 py-2 text-right">Cuota</th>
                    <th className="px-3 py-2 text-right">Capital</th>
                    <th className="px-3 py-2 text-right">Intereses</th>
                    <th className="px-3 py-2 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.datosPorAnio.map((d) => (
                    <tr key={d.anio} className="border-t border-slate-100">
                      <td className="px-3 py-1.5 font-bold text-slate-700">{d.anio}</td>
                      <td className="px-3 py-1.5 text-right">{formato(d.cuota)}€</td>
                      <td className="px-3 py-1.5 text-right text-[#0B3A6E] font-bold">{formato(d.capital)}€</td>
                      <td className="px-3 py-1.5 text-right text-amber-700">{formato(d.interes)}€</td>
                      <td className="px-3 py-1.5 text-right text-slate-500">{formato(d.saldo)}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={`grid gap-2.5 mb-4 ${resultado.entrada > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
          {resultado.entrada > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <p className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">Entrada</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">{formato(resultado.entrada)}€</p>
            </div>
          )}
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">Total prestado</p>
            <p className="text-sm font-black text-slate-800 mt-0.5">{formato(resultado.capitalPrestado)}€</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">Intereses a pagar</p>
            <p className="text-sm font-black text-amber-700 mt-0.5">{formato(resultado.totalIntereses)}€</p>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-cyan-50 border border-cyan-100 rounded-xl p-3">
          <Info size={13} className="text-cyan-700 shrink-0 mt-0.5" />
          <p className="text-[10px] text-cyan-800 font-bold leading-relaxed">
            Estimación orientativa. No incluye seguros, comisiones ni gastos de notaría/registro. En hipotecas variables o mixtas, la cuota real se revisa periódicamente según el euríbor.
          </p>
        </div>
      </div>
    </main>
  );
}