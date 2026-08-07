"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TrendingUp, Scale, MapPinned, CalendarClock, ChevronRight } from "lucide-react";

export default function BienvenidaPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState<string>("");
  const [rutaAsignada, setRutaAsignada] = useState<boolean>(false);
  const [fechaRenovacion, setFechaRenovacion] = useState<string | null>(null);

  const [restantesMovimientos, setRestantesMovimientos] = useState<number | null>(null);
  const [restantesFiscal, setRestantesFiscal] = useState<number | null>(null);

  useEffect(() => {
    async function validarUsuario() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("nombre, role, fecha_renovacion")
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

      // Comprobar si tiene alguna ruta ya creada en rutas_cliente
      const { count, error: errorRutas } = await supabase
        .from("rutas_cliente")
        .select("id", { count: "exact", head: true })
        .eq("cliente_id", user.id);

      if (errorRutas) {
        console.error("Error al comprobar rutas del cliente:", errorRutas);
      }

      setRutaAsignada((count ?? 0) > 0);

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

  const formatearFechaRenovacion = (fecha: string | null) => {
    if (!fecha) return null;
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm font-bold text-slate-500">
          Cargando MoneyMap...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white p-6 md:p-8 flex flex-col">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-black text-[#0B3A6E]">
          Bienvenido
        </h1>

        <p className="mt-2 text-slate-600">
          Hola, {nombre}. Tu dinero, con dirección.
        </p>
      </div>

      {/* Botonera estilo fintech: filas con icono en badge de color */}
      <section className="mt-6 grid grid-cols-1 gap-3">
        <button
          onClick={() => router.push("/dashboard/ingresos_gastos")}
          className="group flex items-center gap-3.5 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 shadow-sm transition-all duration-300 hover:border-[#0B3A6E]/40 hover:bg-slate-100/30 hover:-translate-y-0.5 text-left"
        >
          <div className="bg-[#0B3A6E]/10 p-2.5 rounded-xl shrink-0">
            <TrendingUp size={20} className="text-[#0B3A6E]" />
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
            <Scale size={20} className="text-amber-600" />
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

        {rutaAsignada ? (
          <button
            onClick={() => router.push("/ruta")}
            className="group flex items-center gap-3.5 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 shadow-sm transition-all duration-300 hover:border-emerald-500/40 hover:bg-slate-100/30 hover:-translate-y-0.5 text-left"
          >
            <div className="bg-emerald-500/10 p-2.5 rounded-xl shrink-0">
              <MapPinned size={20} className="text-emerald-600" />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-[#0B3A6E] transition-colors">
                Tu Ruta
              </h2>
              <p className="mt-1 text-[11px] text-slate-500 font-medium leading-normal">
                Sigue el plan personalizado hacia tus objetivos.
              </p>
            </div>

            <ChevronRight size={16} className="text-slate-300 shrink-0" />
          </button>
        ) : (
          <button
            onClick={() => router.push("/cita")}
            className="group flex items-center gap-3.5 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 shadow-sm transition-all duration-300 hover:border-emerald-500/40 hover:bg-slate-100/30 hover:-translate-y-0.5 text-left"
          >
            <div className="bg-emerald-500/10 p-2.5 rounded-xl shrink-0">
              <MapPinned size={20} className="text-emerald-600" />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-[#0B3A6E] transition-colors">
                Solicitar Ruta
              </h2>
              <p className="mt-1 text-[11px] text-slate-500 font-medium leading-normal">
                Reserva una hora exclusiva con tu asesor para trazar tu estrategia.
              </p>
            </div>

            <ChevronRight size={16} className="text-slate-300 shrink-0" />
          </button>
        )}
      </section>

      {/* Indicador discreto de próxima renovación, al fondo */}
      <div className="mt-auto pt-8 flex justify-center sm:justify-start">
        {fechaRenovacion ? (
          <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <CalendarClock size={12} />
            Próxima renovación: {formatearFechaRenovacion(fechaRenovacion)}
          </span>
        ) : null}
      </div>

    </main>
  );
}