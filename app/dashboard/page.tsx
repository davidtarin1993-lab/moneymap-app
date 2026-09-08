"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TrendingUp, Scale, ChevronRight } from "lucide-react";

export default function DashboardHubPage() {
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [restantesMovimientos, setRestantesMovimientos] = useState<number | null>(null);
  const [restantesFiscal, setRestantesFiscal] = useState<number | null>(null);

  useEffect(() => {
    async function iniciar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCargando(false);
      cargarContadores();
    }
    iniciar();
  }, [router]);

  const cargarContadores = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const [respMovimientos, respFiscal] = await Promise.all([
        fetch("/api/dashboard/analisis-ia", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/dashboard/analisis-ia-fiscal", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (respMovimientos.ok) {
        const data = await respMovimientos.json();
        setRestantesMovimientos(data.restantes ?? null);
      }
      if (respFiscal.ok) {
        const data = await respFiscal.json();
        setRestantesFiscal(data.restantes ?? null);
      }
    } catch (err) {
      console.error("Error al cargar contadores IA:", err);
    }
  };

  if (cargando) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm font-bold text-slate-500">Cargando...</p>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 md:py-10 antialiased">
      <div className="max-w-3xl mx-auto w-full space-y-6">

        <header className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl" role="img" aria-label="Mapa">🗺️</span>
            <h1 className="text-2xl md:text-3xl font-black text-[#0B3A6E] tracking-tight">Tu Mapa Financiero</h1>
          </div>
          <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-xl font-medium leading-normal">
            Elige qué quieres revisar: tus movimientos bancarios o tu situación fiscal.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-3.5">
          <button
            onClick={() => router.push("/dashboard/ingresos_gastos")}
            className="group flex items-center gap-3.5 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 shadow-sm transition-all duration-300 hover:border-[#0B3A6E]/40 hover:bg-slate-100/30 hover:-translate-y-0.5 text-left"
          >
            <div className="bg-[#0B3A6E]/10 p-2.5 rounded-xl shrink-0">
              <TrendingUp size={22} className="text-[#0B3A6E]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-[#0B3A6E] transition-colors">
                  Movimientos Bancarios
                </h2>
                {restantesMovimientos !== null && (
                  <span className="text-[8px] font-black uppercase bg-[#0B3A6E]/10 text-[#0B3A6E] px-1.5 py-0.5 rounded-full shrink-0">
                    {restantesMovimientos}/3 IA hoy
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-500 font-medium leading-normal">
                Analiza tus ingresos y gastos, con recomendaciones del asistente IA.
              </p>
            </div>
            <ChevronRight size={16} className="text-slate-300 shrink-0" />
          </button>

          <button
            onClick={() => router.push("/dashboard/fiscalidad")}
            className="group flex items-center gap-3.5 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 shadow-sm transition-all duration-300 hover:border-amber-500/40 hover:bg-slate-100/30 hover:-translate-y-0.5 text-left"
          >
            <div className="bg-amber-500/10 p-2.5 rounded-xl shrink-0">
              <Scale size={22} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-[#0B3A6E] transition-colors">
                  Fiscalidad
                </h2>
                {restantesFiscal !== null && (
                  <span className="text-[8px] font-black uppercase bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full shrink-0">
                    {restantesFiscal}/3 IA hoy
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-500 font-medium leading-normal">
                Revisa tu declaración de la renta con el especialista fiscal IA.
              </p>
            </div>
            <ChevronRight size={16} className="text-slate-300 shrink-0" />
          </button>
        </section>
      </div>
    </main>
  );
}