"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LineChart as LineChartIcon, Mail, ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useUtmParams } from "@/lib/useUtmParams";
import { generarPdfBase64 } from "@/lib/generarPdfResultado";

function ProyeccionContenido() {
  const { utmSource, utmMedium, utmCampaign } = useUtmParams();

  const [modo, setModo] = useState<"proyeccion" | "objetivo">("proyeccion");

  const [inicial, setInicial] = useState<number>(1000);
  const [ahorroMensual, setAhorroMensual] = useState<number>(200);
  const [interesAnual, setInteresAnual] = useState<number>(8);
  const [anios, setAnios] = useState<number>(10);
  const [metaFinanciera, setMetaFinanciera] = useState<number>(50000);

  const [mostrarTabla, setMostrarTabla] = useState(false);

  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const [capitalFinal, setCapitalFinal] = useState<number>(0);
  const [totalAportado, setTotalAportado] = useState<number>(0);
  const [interesesGenerados, setInteresesGenerados] = useState<number>(0);
  const [ahorroNecesario, setAhorroNecesario] = useState<number>(0);
  const [historicoAnual, setHistoricoAnual] = useState<Array<{ anio: number; aportado: number; interes: number; total: number }>>([]);

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

  const formato = (n: number) => n.toLocaleString("es-ES", { maximumFractionDigits: 0 });

  const handleEnviarPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErrorEnvio(null);

    try {
      const metricas = modo === "proyeccion"
        ? [
            { etiqueta: "Capital final", valor: `${formato(capitalFinal)}€` },
            { etiqueta: "Aportado", valor: `${formato(totalAportado)}€` },
            { etiqueta: "Intereses", valor: `+${formato(interesesGenerados)}€` },
          ]
        : [
            { etiqueta: "Ahorro necesario", valor: `${formato(ahorroNecesario)}€/mes` },
            { etiqueta: "Capital final", valor: `${formato(capitalFinal)}€` },
            { etiqueta: "Intereses", valor: `+${formato(interesesGenerados)}€` },
          ];

      const pdfBase64 = await generarPdfBase64({
        tituloDocumento: modo === "proyeccion" ? "Tu Proyección de Ahorro" : "Tu Plan hacia tu Objetivo",
        subtitulo:
          modo === "proyeccion"
            ? `Proyección a ${anios} años con ${ahorroMensual.toLocaleString("es-ES")}€/mes y ${interesAnual}% de interés anual estimado.`
            : `Plan para alcanzar ${metaFinanciera.toLocaleString("es-ES")}€ en ${anios} años.`,
        nombreCliente: nombre || undefined,
        emailCliente: email,
        metricasDestacadas: metricas,
        tabla: {
          titulo: "Evolución año a año",
          columnas: ["Año", "Aportado", "Intereses", "Total"],
          filas: historicoAnual.map((d) => [
            d.anio,
            `${formato(d.aportado)}€`,
            `${formato(d.interes)}€`,
            `${formato(d.total)}€`,
          ]),
        },
        secciones: [
          {
            titulo: "Parámetros usados",
            contenido: `Inversión inicial: ${inicial.toLocaleString("es-ES")}€\nInterés anual estimado: ${interesAnual}%\nHorizonte temporal: ${anios} años${
              modo === "objetivo" ? `\nMeta: ${metaFinanciera.toLocaleString("es-ES")}€` : ""
            }`,
          },
          {
            titulo: "Nota",
            contenido: "Esta es una proyección orientativa basada en una rentabilidad constante estimada; los mercados reales son variables.",
          },
        ],
        nombreArchivo: "moneymap-proyeccion-patrimonio.pdf",
      });

      const response = await fetch("/api/public/enviar-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          nombre,
          tipoDocumento: "proyeccion",
          asunto: "Tu proyección de patrimonio — MoneyMap",
          pdfBase64,
          nombreArchivo: "moneymap-proyeccion-patrimonio.pdf",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo enviar el documento.");

      fetch("/api/public/leads", {
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
      }).catch(() => {});

      setEmailEnviado(true);
    } catch (err: any) {
      setErrorEnvio(err.message || "No se pudo enviar el documento. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 md:py-10 pb-16 antialiased">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex justify-center mb-4">
          <Image src="/Multimedia/portada.png" alt="MoneyMap" width={160} height={46} className="object-contain" unoptimized />
        </div>

        <header className="border-b border-slate-100 pb-5 mb-5 text-center">
          <div className="flex items-center justify-center gap-3">
            <LineChartIcon size={30} className="text-[#0B3A6E]" />
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

            <div className="h-40 bg-white/[0.03] rounded-xl p-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historicoAnual} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <XAxis dataKey="anio" tick={{ fontSize: 9, fontWeight: 700, fill: "rgba(255,255,255,0.6)" }} tickFormatter={(v) => `A${v}`} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value: any, name: any) => [`${formato(Number(value))}€`, name === "aportado" ? "Aportado" : "Intereses"]}
                    labelFormatter={(l) => `Año ${l}`}
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  />
                  <Bar dataKey="aportado" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="interes" stackId="a" fill="#1FA187" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4">
          {modo === "objetivo" && (
            <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl mb-3">
              <p className="text-[9px] font-bold text-violet-700 uppercase tracking-wider">Ahorro Requerido</p>
              <p className="text-xl font-black text-violet-600 mt-0.5">{formato(ahorroNecesario)} €/mes</p>
            </div>
          )}
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Capital final estimado</p>
          <p className="text-3xl font-black text-slate-900 mt-0.5">{formato(capitalFinal)}€</p>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200">
            <div>
              <p className="text-[8.5px] font-bold text-slate-400 uppercase">Capital propio</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">{formato(totalAportado)}€</p>
            </div>
            <div>
              <p className="text-[8.5px] font-bold text-slate-400 uppercase">Intereses</p>
              <p className="text-sm font-black text-[#1FA187] mt-0.5">+{formato(interesesGenerados)}€</p>
            </div>
          </div>
        </div>

        {/* TABLA DE EVOLUCIÓN (DESPLEGABLE, GRATIS) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden mb-4">
          <button
            onClick={() => setMostrarTabla(!mostrarTabla)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Evolución año a año</span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${mostrarTabla ? "rotate-180" : ""}`} />
          </button>

          {mostrarTabla && (
            <div className="border-t border-slate-200 max-h-64 overflow-y-auto">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-slate-100">
                  <tr className="text-left text-slate-500 font-black uppercase">
                    <th className="px-3 py-2">Año</th>
                    <th className="px-3 py-2 text-right">Aportado</th>
                    <th className="px-3 py-2 text-right">Intereses</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoAnual.map((d) => (
                    <tr key={d.anio} className="border-t border-slate-100">
                      <td className="px-3 py-1.5 font-bold text-slate-700">{d.anio}</td>
                      <td className="px-3 py-1.5 text-right text-blue-600">{formato(d.aportado)}€</td>
                      <td className="px-3 py-1.5 text-right text-[#1FA187] font-bold">{formato(d.interes)}€</td>
                      <td className="px-3 py-1.5 text-right text-slate-800 font-black">{formato(d.total)}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!emailEnviado ? (
          <div className="bg-[#1FA187]/10 border border-[#1FA187]/30 rounded-2xl p-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Mail size={14} className="text-[#1FA187]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1FA187]">Recibe esta proyección en tu email</h3>
            </div>
            <p className="text-[11px] text-slate-600 font-medium mb-4">
              Te enviamos un PDF con todos estos datos, incluida la evolución año a año.
            </p>
            <form onSubmit={handleEnviarPdf} className="space-y-2.5">
              <input type="text" required placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1FA187] font-medium" />
              <input type="email" required placeholder="Tu correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1FA187] font-medium" />
              <button type="submit" disabled={enviando}
                className="w-full bg-[#1FA187] hover:bg-[#198771] disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all">
                {enviando ? "Enviando..." : <>Enviarme el PDF <ArrowRight size={14} /></>}
              </button>
              {errorEnvio && <p className="text-red-500 text-[10px] font-bold text-center">{errorEnvio}</p>}
            </form>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
            <CheckCircle2 size={20} className="text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-black text-emerald-800">¡Enviado! Revisa tu bandeja de entrada.</p>
            <Link href="/" className="inline-flex items-center gap-1.5 mt-3 text-[#0B3A6E] text-[11px] font-black uppercase underline">
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