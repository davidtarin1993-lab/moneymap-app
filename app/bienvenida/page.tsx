"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  TrendingUp,
  Scale,
  MapPinned,
  CalendarClock,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  GraduationCap,
  Award,
} from "lucide-react";
import { NIVELES, calcularMesesTranscurridos, obtenerNivel } from "@/lib/niveles";

interface Nivel {
  umbralMeses: number;
  nombre: string;
  descripcion: string;
}


type EstadoRuta = "tiene" | "solicitada" | "ninguna";

export default function BienvenidaPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string>("");
  const [estadoRuta, setEstadoRuta] = useState<EstadoRuta>("ninguna");
  const [fechaRenovacion, setFechaRenovacion] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);

  const [restantesMovimientos, setRestantesMovimientos] = useState<number | null>(null);
  const [restantesFiscal, setRestantesFiscal] = useState<number | null>(null);

  const [mostrarOpcionesDashboard, setMostrarOpcionesDashboard] = useState(false);
  const [solicitandoRuta, setSolicitandoRuta] = useState(false);

  useEffect(() => {
    async function validarUsuario() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      if (user.created_at) setFechaInicio(new Date(user.created_at));

      const { data: profile } = await supabase
        .from("profiles")
        .select("nombre, role, fecha_renovacion, ruta_solicitada")
        .eq("id", user.id)
        .single();

      if (!profile) {
        router.push("/login");
        return;
      }

      if (profile.role === "admin") {
        router.push("/admin");
        return;
      }

      setNombre(profile.nombre ?? "Cliente");
      setFechaRenovacion(profile.fecha_renovacion ?? null);
      setLoading(false);

      const { count } = await supabase
        .from("rutas_cliente")
        .select("id", { count: "exact", head: true })
        .eq("cliente_id", user.id);

      if ((count ?? 0) > 0) {
        setEstadoRuta("tiene");
      } else if (profile.ruta_solicitada) {
        setEstadoRuta("solicitada");
      } else {
        setEstadoRuta("ninguna");
      }

      cargarContadoresIA();
    }

    validarUsuario();
  }, [router]);

  const cargarContadoresIA = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const [respMovimientos, respFiscal] = await Promise.all([
        fetch("/api/dashboard/analisis-ia", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/dashboard/analisis-ia-fiscal", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (respMovimientos.ok) {
        const dataMov = await respMovimientos.json();
        setRestantesMovimientos(dataMov.restantes ?? null);
      }

      if (respFiscal.ok) {
        const dataFiscal = await respFiscal.json();
        setRestantesFiscal(dataFiscal.restantes ?? null);
      }
    } catch (err) {
      console.error("Error al cargar contadores de IA:", err);
    }
  };

  const formatearFecha = (fecha: Date | string | null) => {
    if (!fecha) return null;
    return new Date(fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm font-bold text-slate-500">Cargando MoneyMap...</p>
      </div>
    );
  }

  const mesesTranscurridos = fechaInicio ? calcularMesesTranscurridos(fechaInicio) : 0;
  const { indiceActual, nivelActual, siguienteNivel, mesesParaSiguiente } = obtenerNivel(mesesTranscurridos);

  const etiquetaRuta =
    estadoRuta === "tiene" ? "Tu Ruta" : estadoRuta === "solicitada" ? "Consultar la ruta" : "Solicitar Ruta";

  const descripcionRuta =
    estadoRuta === "tiene"
      ? "Sigue tu plan"
      : estadoRuta === "solicitada"
      ? "En preparación"
      : "Pide tu plan";

   return (
    <main className="bg-white flex flex-col">
      <div className="flex flex-col p-5 md:p-8 max-w-2xl mx-auto w-full space-y-4">

        {/* CABECERA SOBRIA */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-xl bg-[#0B3A6E] text-white flex items-center justify-center text-sm font-black shrink-0">
            {nombre.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-black text-slate-900 tracking-tight truncate">Hola, {nombre}</h1>
          </div>
        </div>

        {/* BLOQUE 1: ACCESO DIRECTO */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">Acceso directo</h2>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => setMostrarOpcionesDashboard(!mostrarOpcionesDashboard)}
              className={`flex flex-col items-center gap-1.5 rounded-xl p-3 border transition-all ${
                mostrarOpcionesDashboard ? "bg-[#0B3A6E]/5 border-[#0B3A6E]/40" : "bg-slate-50 border-slate-200 hover:border-[#0B3A6E]/30"
              }`}
            >
              <div className="bg-[#0B3A6E]/10 p-2 rounded-xl">
                <LayoutDashboard size={18} className="text-[#0B3A6E]" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-700 text-center leading-tight">
                Dashboard
              </span>
              <span className="text-[8.5px] text-slate-400 font-medium text-center leading-tight -mt-1">
                Tus finanzas
              </span>

              <div className="flex flex-col gap-0.5 w-full mt-0.5">
                {restantesMovimientos !== null && (
                  <span className="text-[7px] font-black text-[#0B3A6E] bg-[#0B3A6E]/10 px-1 py-0.5 rounded-full text-center">
                    Movimientos {restantesMovimientos}/3
                  </span>
                )}
                {restantesFiscal !== null && (
                  <span className="text-[7px] font-black text-amber-700 bg-amber-100 px-1 py-0.5 rounded-full text-center">
                    Fiscalidad {restantesFiscal}/3
                  </span>
                )}
              </div>

              <ChevronDown size={10} className={`text-slate-300 transition-transform ${mostrarOpcionesDashboard ? "rotate-180" : ""}`} />
            </button>

            <button
              onClick={() => router.push("/ruta")}
              className="flex flex-col items-center gap-1.5 bg-slate-50 rounded-xl p-3 border border-slate-200 hover:border-emerald-500/30 transition-all"
            >
              <div className="bg-emerald-500/10 p-2 rounded-xl">
                <MapPinned size={18} className="text-emerald-600" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-700 text-center leading-tight">
                {etiquetaRuta}
              </span>
              <span className="text-[8.5px] text-slate-400 font-medium text-center leading-tight -mt-1">
                {descripcionRuta}
              </span>
            </button>

            <button
              onClick={() => router.push("/formacion")}
              className="flex flex-col items-center gap-1.5 bg-slate-50 rounded-xl p-3 border border-slate-200 hover:border-violet-500/30 transition-all"
            >
              <div className="bg-violet-500/10 p-2 rounded-xl">
                <GraduationCap size={18} className="text-violet-600" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-700 text-center leading-tight">
                Formación
              </span>
              <span className="text-[8.5px] text-slate-400 font-medium text-center leading-tight -mt-1">
                Píldoras y noticias
              </span>
            </button>
          </div>

          {mostrarOpcionesDashboard && (
            <div className="mt-3 space-y-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => router.push("/dashboard/ingresos_gastos")}
                className="w-full flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200 hover:border-[#0B3A6E]/30 transition-all text-left"
              >
                <div className="bg-[#0B3A6E]/10 p-1.5 rounded-lg shrink-0">
                  <TrendingUp size={16} className="text-[#0B3A6E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[10.5px] font-black uppercase tracking-wider text-slate-700">Movimientos Bancarios</h3>
                    {restantesMovimientos !== null && (
                      <span className="text-[7.5px] font-black uppercase bg-[#0B3A6E]/10 text-[#0B3A6E] px-1.5 py-0.5 rounded-full shrink-0">
                        {restantesMovimientos}/3 IA hoy
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500 font-medium">Analiza tus ingresos y gastos con IA.</p>
                </div>
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
              </button>

              <button
                onClick={() => router.push("/dashboard/fiscalidad")}
                className="w-full flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200 hover:border-amber-500/30 transition-all text-left"
              >
                <div className="bg-amber-500/10 p-1.5 rounded-lg shrink-0">
                  <Scale size={16} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[10.5px] font-black uppercase tracking-wider text-slate-700">Fiscalidad</h3>
                    {restantesFiscal !== null && (
                      <span className="text-[7.5px] font-black uppercase bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full shrink-0">
                        {restantesFiscal}/3 IA hoy
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500 font-medium">Revisa tu declaración con el especialista fiscal IA.</p>
                </div>
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
              </button>
            </div>
          )}
        </section>

        {/* BLOQUE 2: PERFIL */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tu perfil</h2>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-600 shrink-0">
              {nombre.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-800 truncate">{nombre}</p>
              <p className="text-[10px] text-slate-400 font-medium">
                {fechaInicio ? `Cliente desde ${formatearFecha(fechaInicio)}` : "Cliente MoneyMap"}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Award size={13} className="text-[#1FA187]" />
              <span className="text-[8.5px] font-black uppercase tracking-wider text-[#1FA187]">
                Nivel {indiceActual + 1} de {NIVELES.length}
              </span>
            </div>
            <p className="text-[13px] font-black text-slate-800">{nivelActual.nombre}</p>
            <p className="text-[10.5px] text-slate-500 font-medium mt-0.5 leading-relaxed">
              {nivelActual.descripcion}
            </p>

            <div className="mt-2.5 h-1.5 bg-slate-200 rounded-full overflow-hidden flex gap-0.5">
              {NIVELES.map((_, idx) => (
                <div key={idx} className={`flex-1 rounded-full ${idx <= indiceActual ? "bg-[#1FA187]" : "bg-slate-300"}`} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="min-w-0">
              <p className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">Próximo nivel</p>
              {siguienteNivel ? (
                <p className="text-[11px] font-black text-slate-700 truncate">
                  {siguienteNivel.nombre} <span className="text-slate-400 font-medium">· {mesesParaSiguiente} {mesesParaSiguiente === 1 ? "mes" : "meses"}</span>
                </p>
              ) : (
                <p className="text-[11px] font-black text-slate-700">Nivel máximo alcanzado 🎉</p>
              )}
            </div>
          </div>

          {fechaRenovacion && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium pt-1">
              <CalendarClock size={11} />
              Próxima renovación: {formatearFecha(fechaRenovacion)}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}