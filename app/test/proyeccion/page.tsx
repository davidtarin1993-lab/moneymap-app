"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LineChart, Mail, ArrowRight, CheckCircle2, FileDown } from "lucide-react";
import { useUtmParams } from "@/lib/useUtmParams";
import { generarPdfResultado } from "@/lib/generarPdfResultado";

function ProyeccionContenido() {
  const { utmSource, utmMedium, utmCampaign } = useUtmParams();

  const [modo, setModo] = useState<"proyeccion" | "objetivo">("proyeccion");

  const [inicial, setInicial] = useState<number>(1000);
  const [ahorroMensual, setAhorroMensual] = useState<number>(200);
  const [interesAnual, setInteresAnual] = useState<number>(8);
  const [anios, setAnios] = useState<number>(10);
  const [metaFinanciera, setMetaFinanciera] = useState<number>(50000);

  const [capitalFinal, setCapitalFinal] = useState<number>(0);
  const [totalAportado, setTotalAportado] = useState<number>(0);
  const [interesesGenerados, setInteresesGenerados] = useState<number>(0);
  const [ahorroNecesario, setAhorroNecesario] = useState<number>(0);
  const [historicoAnual, setHistoricoAnual] = useState<Array<{ anio: number; aportado: number; interes: number; total: number }>>([]);

  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

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

        if (m % 12 === 0) {
          const anioActual = m / 12;
          datosGrafico.push({
            anio: anioActual,
            aportado: Math.round(aportaciones),
            interes: Math.round(totalSuma - aportaciones),
            total: Math.round(totalSuma),
          });
        }
      }

      setCapitalFinal(Math.round(totalSuma));
      setTotalAportado(Math.round(aportaciones));
      setInteresesGenerados(Math.round(totalSuma - aportaciones));
      setHistoricoAnual(datosGrafico);
    } else {
      const factorCompuesto = Math.pow(1 + tasaMensual, meses);
      const acumuladoInicial = inicial * factorCompuesto;
      let cantidadRestante = metaFinanciera - acumuladoInicial;

      let cuotaMensual = 0;
      if (cantidadRestante > 0 && tasaMensual > 0) {
        cuotaMensual = cantidadRestante / (((Math.pow(1 + tasaMensual, meses)) - 1) / tasaMensual);
      } else if (cantidadRestante > 0) {
        cuotaMensual = cantidadRestante / meses;
      }

      const cuotaFinal = Math.max(0, Math.round(cuotaMensual));
      setAhorroNecesario(cuotaFinal);

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
            total: Math.round(totalSuma),
          });
        }
      }
      setCapitalFinal(Math.round(totalSuma));
      setTotalAportado(Math.round(aportaciones));
      setInteresesGenerados(Math.round(totalSuma - aportaciones));
      setHistoricoAnual(datosGrafico);
    }
  }, [inicial, ahorroMensual, interesAnual, anios, metaFinanciera, modo]);

  const valorMaximoGrafico = historicoAnual.length > 0 ? Math.max(...historicoAnual.map((d) => d.total)) : 1;

  const handleEnviarEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const response = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          nombre,
          origen: "proyeccion",
          resultadoResumen: { modo, capitalFinal, totalAportado, interesesGenerados, anios },
          utmSource,
          utmMedium,
          utmCampaign,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setEmailEnviado(true);
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  const descargarPdf = async () => {
    await generarPdfResultado({
      tituloDocumento: modo === "proyeccion" ? "Tu Proyección de Ahorro" : "Tu Plan hacia tu Objetivo",
      subtitulo:
        modo === "proyeccion"
          ? `Proyección a ${anios} años con ${ahorroMensual.toLocaleString("es-ES")}€/mes y ${interesAnual}% de interés anual estimado.`
          : `Plan para alcanzar ${metaFinanciera.toLocaleString("es-ES")}€ en ${anios} años.`,
      nombreCliente: nombre || undefined,
      metricasDestacadas:
        modo === "proyeccion"
          ? [
              { etiqueta: "Capital final", valor: `${capitalFinal.toLocaleString("es-ES")}€` },
              { etiqueta: "Aportado", valor: `${totalAportado.toLocaleString("es-ES")}€` },
              { etiqueta: "Intereses", valor: `+${interesesGenerados.toLocaleString("es-ES")}€` },
            ]
          : [
              { etiqueta: "Ahorro necesario", valor: `${ahorroNecesario.toLocaleString("es-ES")}€/mes` },
              { etiqueta: "Capital final", valor: `${capitalFinal.toLocaleString("es-ES")}€` },
              { etiqueta: "Intereses", valor: `+${interesesGenerados.toLocaleString("es-ES")}€` },
            ],
      secciones: [
        {
          titulo: "Parámetros usados",
          contenido: `Inversión inicial: ${inicial.toLocaleString("es-ES")}€\nInterés anual estimado: ${interesAnual}%\nHorizonte temporal: ${anios} años${
            modo === "objetivo" ? `\nMeta: ${metaFinanciera.toLocaleString("es-ES")}€` : ""
          }`,
        },
        {
          titulo: "Nota",
          contenido: "Esta es una proyección orientativa basada en una rentabilidad constante estimada; los mercados reales son variables. MoneyMap te ayuda a trazar y hacer seguimiento real de tu ruta financiera junto a un asesor.",
        },
      ],
      nombreArchivo: "moneymap-proyeccion-patrimonio.pdf",
    });
  };

  return (
    <main className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 md:py-10 pb-16 antialiased">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex justify-center mb-4">
          <Image src="/Multimedia/portada.png" alt="MoneyMap" width={160} height={46} className="object-contain" unoptimized />
        </div>

        <header className="border-b border-slate-100 pb-5 mb-5 text-center">
          <div className="flex items-center justify-center gap-3">
            <LineChart size={30} className="text-[#0B3A6E]" />
            <h1 className="text-2xl md:text-3xl font-black text-[#0B3A6E] tracking-tight">Proyector de Patrimonio</h1>
          </div>
          <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-md mx-auto font-medium leading-normal">
            Simula el crecimiento de tu dinero con interés compuesto. Gratis, sin registro.
          </p>
        </header>

        <div className="bg-slate-100 p-1.5 rounded-2xl flex w-full gap-1 mb-5">
          <button
            onClick={() => setModo("proyeccion")}
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              modo === "proyeccion" ? "bg-[#0B3A6E] text-white shadow-sm" : "text-slate-600"
            }`}
          >
            Proyectar mi Ahorro
          </button>
          <button
            onClick={() => setModo("objetivo")}
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              modo === "objetivo" ? "bg-[#0B3A6E] text-white shadow-sm" : "text-slate-600"
            }`}
          >
            Alcanzar un Objetivo
          </button>
        </div>

        <div className="bg-[#0B3A6E] rounded-3xl p-5 space-y-5 shadow-md mb-4">
          <div className="grid grid-cols-2 gap-3">
            {modo === "objetivo" && (
              <div className="col-span-2 space-y-1.5">
                <label className="text-[9px] font-bold text-violet-300 uppercase tracking-wider">¿Qué capital quieres conseguir? (€)</label>
                <input
                  type="number"
                  value={metaFinanciera}
                  onChange={(e) => setMetaFinanciera(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-violet-500/10 border border-violet-500/30 rounded-xl p-3 text-white text-sm font-bold focus:outline-none focus:border-violet-500"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-white/60 uppercase">Inversión Inicial (€)</label>
              <input
                type="number"
                value={inicial}
                onChange={(e) => setInicial(Math.max(0, Number(e.target.value)))}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-blue-400"
              />
            </div>

            {modo === "proyeccion" && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-white/60 uppercase">Ahorro Mensual (€)</label>
                <input
                  type="number"
                  value={ahorroMensual}
                  onChange={(e) => setAhorroMensual(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-white/60 uppercase">Interés Anual (%)</label>
              <input
                type="number"
                value={interesAnual}
                onChange={(e) => setInteresAnual(Math.max(0, Number(e.target.value)))}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-white/60 uppercase">Horizonte (Años)</label>
              <input
                type="number"
                value={anios}
                onChange={(e) => setAnios(Math.min(40, Math.max(1, Number(e.target.value))))}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between text-[10px] text-white/60 font-medium">
              <span>Crecimiento a lo largo del tiempo</span>
              <div className="flex gap-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-sm inline-block" />Aportado</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#1FA187] rounded-sm inline-block" />Intereses</span>
              </div>
            </div>

            <div className="h-32 flex items-end justify-between gap-1 px-1 bg-white/[0.03] rounded-xl overflow-x-auto">
              {historicoAnual.map((d) => {
                const pctA = (d.aportado / valorMaximoGrafico) * 100;
                const pctI = (d.interes / valorMaximoGrafico) * 100;
                return (
                  <div key={d.anio} className="flex-1 min-w-[14px] max-w-[28px] flex flex-col items-center h-full justify-end">
                    <div className="w-full flex flex-col justify-end rounded-t-sm overflow-hidden h-full">
                      <div style={{ height: `${pctI}%` }} className="w-full bg-[#1FA187] opacity-80" />
                      <div style={{ height: `${pctA}%` }} className="w-full bg-blue-500 opacity-90" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4">
          {modo === "objetivo" && (
            <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl mb-3">
              <p className="text-[9px] font-bold text-violet-700 uppercase tracking-wider">Ahorro Requerido</p>
              <p className="text-xl font-black text-violet-600 mt-0.5">{ahorroNecesario.toLocaleString("es-ES")} €/mes</p>
            </div>
          )}
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Capital final estimado</p>
          <p className="text-3xl font-black text-slate-900 mt-0.5">{capitalFinal.toLocaleString("es-ES")}€</p>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200">
            <div>
              <p className="text-[8.5px] font-bold text-slate-400 uppercase">Capital propio</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">{totalAportado.toLocaleString("es-ES")}€</p>
            </div>
            <div>
              <p className="text-[8.5px] font-bold text-slate-400 uppercase">Intereses</p>
              <p className="text-sm font-black text-[#1FA187] mt-0.5">+{interesesGenerados.toLocaleString("es-ES")}€</p>
            </div>
          </div>
        </div>

        <button
          onClick={descargarPdf}
          className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl p-3 text-xs font-black uppercase tracking-wider transition-all mb-4"
        >
          <FileDown size={14} /> Descargar proyección en PDF
        </button>

        {!emailEnviado ? (
          <div className="bg-[#1FA187]/10 border border-[#1FA187]/30 rounded-2xl p-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Mail size={14} className="text-[#1FA187]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1FA187]">¿Quieres guardar esta simulación?</h3>
            </div>
            <p className="text-[11px] text-slate-600 font-medium mb-4">
              Déjanos tu email y te la enviamos, junto con ideas para acelerar tu plan.
            </p>
            <form onSubmit={handleEnviarEmail} className="space-y-2.5">
              <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1FA187] font-medium" />
              <input type="email" required placeholder="Tu correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1FA187] font-medium" />
              <button type="submit" disabled={enviando}
                className="w-full bg-[#1FA187] hover:bg-[#198771] disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all">
                {enviando ? "Enviando..." : <>Enviarme esta simulación <ArrowRight size={14} /></>}
              </button>
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

export default function ProyeccionPublicaPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen bg-white" />}>
      <ProyeccionContenido />
    </Suspense>
  );
}