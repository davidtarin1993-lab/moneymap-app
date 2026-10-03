"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  TrendingUp,
  Scale,
  MapPinned,
  ChevronRight,
  GraduationCap,
  Sparkles,
  LineChart,
  LifeBuoy,
  CalendarClock,
  Settings,
} from "lucide-react";
import { NIVELES, calcularMesesTranscurridos, obtenerNivel } from "@/lib/niveles";

type EstadoRuta = "tiene" | "solicitada" | "ninguna";

export default function BienvenidaPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [estadoRuta, setEstadoRuta] = useState<EstadoRuta>("ninguna");
  const [fechaRenovacion, setFechaRenovacion] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);

  const [restantesMovimientos, setRestantesMovimientos] = useState<number | null>(null);
  const [restantesFiscal, setRestantesFiscal] = useState<number | null>(null);

  useEffect(() => {
    async function validarUsuario() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? "");
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
      ? "Sigue el plan que ya trazamos contigo."
      : estadoRuta === "solicitada"
      ? "Tu gestor la está preparando fuera de línea."
      : "Un gestor prepara tu ruta financiera de forma personalizada, sin necesidad de hablar en directo.";

  return (
    <main className="bg-white flex flex-col">
      <div className="flex flex-col p-5 md:p-8 max-w-2xl mx-auto w-full space-y-4">

        {/* CABECERA */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-xl bg-[#0B3A6E] text-white flex items-center justify-center text-sm font-black shrink-0">
            {nombre.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-black text-slate-900 tracking-tight truncate">Hola, {nombre}</h1>
            <p className="text-slate-400 text-[11px] font-semibold">Tu dinero, con dirección.</p>
          </div>
        </div>

        {/* NIVEL — con gráfica ascendente */}
        <section className="bg-gradient-to-br from-[#0B3A6E] to-[#0B3A6E]/90 rounded-2xl p-4 shadow-md relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-[#1FA187]/25 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={13} className="text-[#1FA187]" />
                <span className="text-[8.5px] font-black uppercase tracking-widest text-[#1FA187]">
                  Nivel {indiceActual + 1} de {NIVELES.length}
                </span>
              </div>
              <p className="text-sm font-black text-white truncate">{nivelActual.nombre}</p>
              <p className="text-[10.5px] text-white/60 font-medium mt-0.5 leading-relaxed">
                {nivelActual.descripcion}
              </p>
            </div>

            <div className="flex items-end gap-1 h-10 shrink-0">
              {NIVELES.map((_, idx) => {
                const alturaPct = ((idx + 1) / NIVELES.length) * 100;
                const activo = idx <= indiceActual;
                const esActual = idx === indiceActual;
                return (
                  <div key={idx} className="flex flex-col items-center justify-end h-full">
                    {esActual && (
                      <span className="w-1 h-1 rounded-full bg-[#1FA187] mb-0.5" />
                    )}
                    <div
                      className={`w-2 rounded-t-sm transition-all ${activo ? "bg-[#1FA187]" : "bg-white/15"}`}
                      style={{ height: `${alturaPct}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-2 mt-3 pt-3 border-t border-white/10">
            <p className="text-[10px] text-white/50 font-medium">
              {siguienteNivel
                ? <>Próximo: <span className="text-white/80 font-bold">{siguienteNivel.nombre}</span> en {mesesParaSiguiente} {mesesParaSiguiente === 1 ? "mes" : "meses"}</>
                : "Nivel máximo alcanzado 🎉"}
            </p>
          </div>
        </section>

        {/* BLOQUE 1: MIDE TUS GASTOS */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-[#0B3A6E]/10 p-1.5 rounded-lg">
              <TrendingUp size={15} className="text-[#0B3A6E]" />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Analiza tus gastos y fiscalidad</h2>
              <p className="text-[10px] text-slate-400 font-medium">Analiza tus finanzas con IA.</p>
            </div>
          </div>

          <div className="space-y-2">
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
                <p className="mt-0.5 text-[10px] text-slate-500 font-medium">Clasificación automática de ingresos y gastos.</p>
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
                <p className="mt-0.5 text-[10px] text-slate-500 font-medium">Revisa tu declaración con el especialista IA.</p>
              </div>
              <ChevronRight size={14} className="text-slate-300 shrink-0" />
            </button>
          </div>
        </section>

        {/* BLOQUE 2: SOLICITA TU RUTA */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="bg-emerald-500/10 p-1.5 rounded-lg">
              <MapPinned size={15} className="text-emerald-600" />
            </div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Solicita tu Ruta</h2>
          </div>
          <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed mb-3">
            {descripcionRuta}
          </p>
          <button
            onClick={() => router.push("/ruta")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all"
          >
            {etiquetaRuta}
          </button>
        </section>

        {/* BLOQUE 3: APRENDE Y MÍDETE */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-violet-500/10 p-1.5 rounded-lg">
              <GraduationCap size={15} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Aprende y mídete</h2>
              <p className="text-[10px] text-slate-400 font-medium">Formación y herramientas para conocerte mejor.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => router.push("/formacion")}
              className="flex flex-col items-center gap-1.5 bg-slate-50 rounded-xl p-2.5 border border-slate-200 hover:border-violet-500/30 transition-all"
            >
              <div className="bg-violet-500/10 p-2 rounded-xl">
                <GraduationCap size={17} className="text-violet-600" />
              </div>
              <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-700 text-center leading-tight">Academia</span>
              <span className="text-[7.5px] text-slate-400 font-medium text-center leading-tight -mt-0.5">
                Píldoras y noticias
              </span>
            </button>

            <button
              onClick={() => router.push("/aplicaciones")}
              className="flex flex-col items-center gap-1.5 bg-slate-50 rounded-xl p-2.5 border border-slate-200 hover:border-fuchsia-500/30 transition-all"
            >
              <div className="bg-fuchsia-500/10 p-2 rounded-xl">
                <Sparkles size={17} className="text-fuchsia-600" />
              </div>
              <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-700 text-center leading-tight">Aplicaciones</span>
              <span className="text-[7.5px] text-slate-400 font-medium text-center leading-tight -mt-0.5">
                Test y calculadoras
              </span>
            </button>

            <button
              onClick={() => router.push("/formacion/cartera_moneymap")}
              className="flex flex-col items-center gap-1.5 bg-slate-50 rounded-xl p-2.5 border border-slate-200 hover:border-cyan-500/30 transition-all"
            >
              <div className="bg-cyan-500/10 p-2 rounded-xl">
                <LineChart size={17} className="text-cyan-600" />
              </div>
              <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-700 text-center leading-tight">Cartera</span>
              <span className="text-[7.5px] text-slate-400 font-medium text-center leading-tight -mt-0.5">
                Inversión MoneyMap
              </span>
            </button>
          </div>
        </section>

        {/* BLOQUE 4: SOPORTE */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="bg-[#0B3A6E]/10 p-2 rounded-xl shrink-0">
                <LifeBuoy size={17} className="text-[#0B3A6E]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">¿Necesitas algo más?</h2>
                <p className="text-[10px] text-slate-500 font-medium">Habla con soporte, te respondemos rápido.</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/chat")}
              className="shrink-0 bg-[#0B3A6E] hover:bg-[#11498a] text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all"
            >
              Soporte
            </button>
          </div>
        </section>

        {/* TIRA DE PERFIL COMPACTA */}
        <Link
          href="/perfil"
          className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-3.5 hover:border-[#0B3A6E]/30 transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-600 shrink-0">
              {nombre.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-slate-800 truncate">{email}</p>
              <p className="text-[9.5px] text-slate-400 font-medium flex items-center gap-1">
                {fechaInicio ? `Cliente desde ${formatearFecha(fechaInicio)}` : "Cliente MoneyMap"}
                {fechaRenovacion && (
                  <>
                    <span>·</span>
                    <CalendarClock size={9} className="inline" />
                    {formatearFecha(fechaRenovacion)}
                  </>
                )}
              </p>
            </div>
          </div>
          <Settings size={15} className="text-slate-300 shrink-0" />
        </Link>
      </div>
    </main>
  );
}