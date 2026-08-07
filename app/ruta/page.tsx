"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle2,
  Circle,
  Target,
  TrendingUp,
  Sparkles,
  ChevronDown,
  CalendarClock,
  CalendarPlus,
} from "lucide-react";

interface Hito {
  texto: string;
  hecho: boolean;
}

interface Ruta {
  id: string;
  titulo: string;
  descripcion: string | null;
  importe_objetivo: number | null;
  importe_actual: number | null;
  proxima_accion: string | null;
  hitos: Hito[];
  created_at: string;
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function RutaPage() {
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [rutaAbierta, setRutaAbierta] = useState<string | null>(null);

  useEffect(() => {
    async function cargarRutas() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data, error } = await supabase
        .from("rutas_cliente")
        .select("*")
        .eq("cliente_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar rutas:", error);
      }

      if (!data || data.length === 0) {
        // Sin ninguna ruta todavía: lo mandamos a reservar la cita
        router.push("/cita");
        return;
      }

      setRutas(data as Ruta[]);
      setRutaAbierta(data[0].id); // la más reciente empieza abierta
      setCargando(false);
    }

    cargarRutas();
  }, [router]);

  if (cargando) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm font-bold text-slate-500">Cargando tu ruta...</p>
      </div>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-6 md:py-10 pb-24">
      <header className="border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label="Ruta">🧭</span>
          <h1 className="text-2xl font-black text-[#0B3A6E] tracking-tight">Tu Ruta</h1>
        </div>
        <p className="mt-2 text-xs text-slate-500 font-medium">
          {rutas.length > 1
            ? `Tienes ${rutas.length} informes de ruta trazados junto a tu asesor.`
            : "Plan personalizado trazado junto a tu asesor."}
        </p>
      </header>

      <div className="space-y-3">
        {rutas.map((ruta) => {
          const abierta = rutaAbierta === ruta.id;
          const objetivo = ruta.importe_objetivo ?? 0;
          const actual = ruta.importe_actual ?? 0;
          const progreso = objetivo > 0 ? Math.round((actual / objetivo) * 100) : 0;

          return (
            <div key={ruta.id} className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* CABECERA DESPLEGABLE */}
              <button
                onClick={() => setRutaAbierta(abierta ? null : ruta.id)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <div className="bg-[#0B3A6E]/10 p-2 rounded-xl shrink-0">
                  <Target size={16} className="text-[#0B3A6E]" />
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-black text-slate-900 truncate">{ruta.titulo}</h2>
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-0.5">
                    <CalendarClock size={11} />
                    {formatearFecha(ruta.created_at)}
                  </span>
                </div>

                {objetivo > 0 && (
                  <span className="text-[#1FA187] font-black text-xs shrink-0">{progreso}%</span>
                )}

                <ChevronDown
                  size={16}
                  className={`text-slate-400 shrink-0 transition-transform ${abierta ? "rotate-180" : ""}`}
                />
              </button>

              {/* CONTENIDO DESPLEGADO */}
              {abierta && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-200 pt-3">
                  {ruta.descripcion && (
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      {ruta.descripcion}
                    </p>
                  )}

                  {objetivo > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-[#0B3A6E]">
                          {actual.toLocaleString("es-ES")}€
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold">
                          de {objetivo.toLocaleString("es-ES")}€
                        </span>
                      </div>

                      <div className="mt-2.5 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1FA187] rounded-full transition-all"
                          style={{ width: `${Math.min(progreso, 100)}%` }}
                        />
                      </div>

                      {objetivo > actual && (
                        <p className="mt-1.5 text-[10px] text-slate-400 font-medium">
                          Te quedan {(objetivo - actual).toLocaleString("es-ES")}€ para completar este objetivo.
                        </p>
                      )}
                    </div>
                  )}

                  {ruta.proxima_accion && (
                    <div className="bg-[#0B3A6E]/5 border border-[#0B3A6E]/10 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={13} className="text-[#0B3A6E]" />
                        <h3 className="text-[10px] font-black text-[#0B3A6E] uppercase tracking-wider">
                          Próxima acción
                        </h3>
                      </div>
                      <p className="mt-1.5 text-[12px] text-slate-700 leading-relaxed font-medium">
                        {ruta.proxima_accion}
                      </p>
                    </div>
                  )}

                  {ruta.hitos && ruta.hitos.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <TrendingUp size={13} className="text-slate-700" />
                        <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                          Hitos
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {ruta.hitos.map((hito, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            {hito.hecho ? (
                              <CheckCircle2 size={14} className="text-[#1FA187] shrink-0" />
                            ) : (
                              <Circle size={14} className="text-slate-300 shrink-0" />
                            )}
                            <span className={`text-[11px] font-medium ${hito.hecho ? "text-slate-700" : "text-slate-400"}`}>
                              {hito.texto}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SIEMPRE AL FINAL: SOLICITAR HORA (aunque haya varias rutas) */}
      <button
        onClick={() => router.push("/cita")}
        className="w-full flex items-center justify-center gap-2 bg-[#0B3A6E] hover:bg-[#11498a] text-white rounded-2xl p-4 mt-5 text-xs font-black uppercase tracking-wider transition-all"
      >
        <CalendarPlus size={16} />
        Solicitar hora
      </button>
    </main>
  );
}