"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, Info, Mail, ArrowRight, CheckCircle2 , FileDown} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useUtmParams } from "@/lib/useUtmParams";
import { generarPdfResultado } from "@/lib/generarPdfResultado";

function SimuladorHipotecaContenido() {
  const { utmSource, utmMedium, utmCampaign } = useUtmParams();

  const [precioVivienda, setPrecioVivienda] = useState("250000");
  const [entradaPct, setEntradaPct] = useState("20");
  const [plazoAnios, setPlazoAnios] = useState("25");

  const [tipoHipoteca, setTipoHipoteca] = useState<"fijo" | "variable">("fijo");
  const [tipoInteresFijo, setTipoInteresFijo] = useState("3.2");
  const [diferencial, setDiferencial] = useState("0.9");
  const [euriborActual, setEuriborActual] = useState("2.6");

  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

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
  const descargarPdf = () => {
    generarPdfResultado({
      tituloDocumento: "Simulación de Hipoteca",
      subtitulo: `Vivienda de ${Number(precioVivienda).toLocaleString("es-ES")}€ a tipo ${tipoHipoteca === "fijo" ? "fijo" : "variable"}, a ${plazoAnios} años.`,
      nombreCliente: nombre || undefined,
      metricasDestacadas: [
        { etiqueta: "Cuota mensual", valor: `${formato(resultado.cuotaMensual)}€` },
        { etiqueta: "Entrada", valor: `${formato(resultado.entrada)}€` },
        { etiqueta: "Total intereses", valor: `${formato(resultado.totalIntereses)}€` },
      ],
      secciones: [
        {
          titulo: "Desglose",
          contenido: `Capital a financiar: ${formato(resultado.capitalPrestado)}€\nTotal a pagar en ${plazoAnios} años: ${formato(resultado.totalPagado)}€\nTasa aplicada: ${tasaAnualEfectiva.toFixed(2)}%`,
        },
        {
          titulo: "Aviso",
          contenido: "Estimación orientativa. No incluye seguros, comisiones ni gastos de notaría/registro.",
        },
      ],
      nombreArchivo: "moneymap-simulacion-hipoteca.pdf",
    });
  };
  const handleEnviarEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErrorEnvio(null);

    try {
      const response = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          nombre,
          origen: "hipoteca",
          resultadoResumen: {
            precioVivienda, tipoHipoteca, cuotaMensual: Math.round(resultado.cuotaMensual),
          },
          utmSource,
          utmMedium,
          utmCampaign,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo enviar.");

      setEmailEnviado(true);
    } catch (err: any) {
      setErrorEnvio(err.message || "Error inesperado.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 md:py-10 pb-16 antialiased">
      <div className="max-w-lg mx-auto w-full">

        <div className="flex justify-center mb-4">
          <Image src="/Multimedia/portada.png" alt="MoneyMap" width={160} height={46} className="object-contain" unoptimized />
        </div>

        <header className="border-b border-slate-100 pb-5 mb-5 text-center">
          <div className="flex items-center justify-center gap-3">
            <Home size={30} className="text-[#0B3A6E]" />
            <h1 className="text-2xl md:text-3xl font-black text-[#0B3A6E] tracking-tight">Simulador de Hipoteca</h1>
          </div>
          <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-md mx-auto font-medium leading-normal">
            Calcula tu cuota mensual a tipo fijo o variable. Gratis, sin registro.
          </p>
        </header>

        <div className="inline-flex bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1 mb-4">
          <button type="button" onClick={() => setTipoHipoteca("fijo")}
            className={`text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-lg transition-all ${tipoHipoteca === "fijo" ? "bg-[#0B3A6E] text-white" : "text-slate-500"}`}>
            Tipo Fijo
          </button>
          <button type="button" onClick={() => setTipoHipoteca("variable")}
            className={`text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-lg transition-all ${tipoHipoteca === "variable" ? "bg-[#0B3A6E] text-white" : "text-slate-500"}`}>
            Tipo Variable
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 mb-4">
          <div>
            <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Precio de la vivienda (€)</label>
            <input type="number" value={precioVivienda} onChange={(e) => setPrecioVivienda(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Entrada (%)</label>
              <input type="number" value={entradaPct} onChange={(e) => setEntradaPct(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]" />
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Plazo (años)</label>
              <input type="number" value={plazoAnios} onChange={(e) => setPlazoAnios(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]" />
            </div>
          </div>

          {tipoHipoteca === "fijo" ? (
            <div>
              <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Tipo de interés fijo anual (%)</label>
              <input type="number" step="0.1" value={tipoInteresFijo} onChange={(e) => setTipoInteresFijo(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#0B3A6E]" />
            </div>
          ) : (
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
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">Entrada necesaria</p>
            <p className="text-sm font-black text-slate-800 mt-0.5">{formato(resultado.entrada)}€</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">Intereses totales</p>
            <p className="text-sm font-black text-amber-700 mt-0.5">{formato(resultado.totalIntereses)}€</p>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-cyan-50 border border-cyan-100 rounded-xl p-3 mb-5">
          <Info size={13} className="text-cyan-700 shrink-0 mt-0.5" />
          <p className="text-[10px] text-cyan-800 font-bold leading-relaxed">
            Estimación orientativa. No incluye seguros, comisiones ni gastos de notaría/registro.
          </p>
        </div>
        <button onClick={descargarPdf}
          className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl p-3 text-xs font-black uppercase tracking-wider transition-all mb-4">
          <FileDown size={14} /> Descargar simulación en PDF
        </button>
        {/* CAPTURA DE LEAD — muro suave, no bloquea el cálculo */}
        {!emailEnviado ? (
          <div className="bg-[#1FA187]/10 border border-[#1FA187]/30 rounded-2xl p-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Mail size={14} className="text-[#1FA187]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1FA187]">¿Quieres guardar este cálculo?</h3>
            </div>
            <p className="text-[11px] text-slate-600 font-medium mb-4">
              Déjanos tu email y te lo enviamos, además de un análisis con un asesor de MoneyMap si lo necesitas.
            </p>
            <form onSubmit={handleEnviarEmail} className="space-y-2.5">
              <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1FA187] font-medium" />
              <input type="email" required placeholder="Tu correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1FA187] font-medium" />
              <button type="submit" disabled={enviando}
                className="w-full bg-[#1FA187] hover:bg-[#198771] disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all">
                {enviando ? "Enviando..." : <>Enviarme este cálculo <ArrowRight size={14} /></>}
              </button>
              {errorEnvio && <p className="text-red-500 text-[10px] font-bold text-center">{errorEnvio}</p>}
            </form>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
            <CheckCircle2 size={20} className="text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-black text-emerald-800">¡Listo! Te lo hemos guardado.</p>
            <Link href="/" className="inline-flex items-center gap-1.5 mt-3 text-[#0B3A6E] text-xs font-black uppercase underline">
              Conocer MoneyMap <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SimuladorHipotecaPublicoPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen bg-white" />}>
      <SimuladorHipotecaContenido />
    </Suspense>
  );
}