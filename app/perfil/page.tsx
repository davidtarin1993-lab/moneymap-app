"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { NIVELES, calcularMesesTranscurridos, obtenerNivel } from "@/lib/niveles";
import {
  User,
  Mail,
  CalendarClock,
  Award,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

export default function PerfilPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [fechaRenovacion, setFechaRenovacion] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [exitoPassword, setExitoPassword] = useState(false);

  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  useEffect(() => {
    async function cargarPerfil() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      if (user.created_at) setFechaInicio(new Date(user.created_at));
      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("nombre, fecha_renovacion")
        .eq("id", user.id)
        .single();

      if (profile) {
        setNombre(profile.nombre ?? "Cliente");
        setFechaRenovacion(profile.fecha_renovacion ?? null);
      }

      setLoading(false);
    }

    cargarPerfil();
  }, [router]);

  const formatearFecha = (fecha: Date | string | null) => {
    if (!fecha) return null;
    return new Date(fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPassword(null);
    setExitoPassword(false);

    if (nuevaPassword.length < 8) {
      setErrorPassword("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setErrorPassword("Las contraseñas no coinciden.");
      return;
    }

    setCambiandoPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: nuevaPassword });
      if (error) {
        setErrorPassword(error.message || "No se pudo actualizar la contraseña.");
        return;
      }
      setExitoPassword(true);
      setNuevaPassword("");
      setConfirmarPassword("");
    } catch (err) {
      setErrorPassword("Error inesperado al actualizar la contraseña.");
    } finally {
      setCambiandoPassword(false);
    }
  };

  const handleSalir = async () => {
    setCerrandoSesion(true);
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm font-bold text-slate-500">Cargando perfil...</p>
      </div>
    );
  }

  const mesesTranscurridos = fechaInicio ? calcularMesesTranscurridos(fechaInicio) : 0;
  const { indiceActual, nivelActual, siguienteNivel, mesesParaSiguiente } = obtenerNivel(mesesTranscurridos);

  return (
    <main className="bg-white flex flex-col">
      <div className="flex flex-col p-4 md:p-6 max-w-2xl mx-auto w-full space-y-3">
        {/* CABECERA */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-11 h-11 rounded-xl bg-[#0B3A6E] text-white flex items-center justify-center text-sm font-black shrink-0">
            {nombre.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-black text-slate-900 tracking-tight truncate">Tu perfil</h1>
            <p className="text-slate-400 text-[11px] font-semibold">Gestiona tu cuenta MoneyMap.</p>
          </div>
        </div>

        {/* BLOQUE 1: DATOS DE CUENTA */}
        <section className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-2.5">
          <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Datos de la cuenta</h2>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <User size={11} className="text-[#0B3A6E] shrink-0" />
                <p className="text-[7.5px] font-black uppercase tracking-wider text-slate-400">Nombre</p>
              </div>
              <p className="text-[11px] font-black text-slate-800 truncate">{nombre}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Mail size={11} className="text-[#0B3A6E] shrink-0" />
                <p className="text-[7.5px] font-black uppercase tracking-wider text-slate-400">Correo</p>
              </div>
              <p className="text-[11px] font-black text-slate-800 truncate">{email}</p>
            </div>
          </div>

          {fechaRenovacion && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <CalendarClock size={11} className="text-[#0B3A6E] shrink-0" />
                <p className="text-[7.5px] font-black uppercase tracking-wider text-slate-400">Próxima renovación</p>
              </div>
              <p className="text-[11px] font-black text-slate-800 truncate">{formatearFecha(fechaRenovacion)}</p>
            </div>
          )}
          {/* CAMBIAR CONTRASEÑA */}
          <div className="pt-1.5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lock size={12} className="text-slate-500" />
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Cambiar contraseña</p>
            </div>

            <form onSubmit={handleCambiarPassword} className="space-y-1.5">
              <div className="relative">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 pr-9 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {mostrarPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <input
                type={mostrarPassword ? "text" : "password"}
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                placeholder="Confirmar nueva contraseña"
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
              />

              <button
                type="submit"
                disabled={cambiandoPassword || !nuevaPassword || !confirmarPassword}
                className="w-full bg-[#0B3A6E] hover:bg-[#11498a] disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-wider rounded-xl py-2.5 transition-all"
              >
                {cambiandoPassword ? "Actualizando..." : "Actualizar contraseña"}
              </button>

              {errorPassword && (
                <p className="text-red-500 text-[10px] font-bold text-center">{errorPassword}</p>
              )}
              {exitoPassword && (
                <p className="flex items-center justify-center gap-1 text-emerald-600 text-[10px] font-bold text-center">
                  <CheckCircle2 size={12} /> Contraseña actualizada correctamente.
                </p>
              )}
            </form>
          </div>
        </section>

        {/* BLOQUE 2: NIVEL */}
        <section className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-2">
          <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tu nivel</h2>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
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

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">Próximo nivel</p>
            {siguienteNivel ? (
              <p className="text-[11px] font-black text-slate-700">
                {siguienteNivel.nombre} <span className="text-slate-400 font-medium">· {mesesParaSiguiente} {mesesParaSiguiente === 1 ? "mes" : "meses"}</span>
              </p>
            ) : (
              <p className="text-[11px] font-black text-slate-700">Nivel máximo alcanzado 🎉</p>
            )}
          </div>
        </section>

        {/* SALIR */}
        <button
          onClick={handleSalir}
          disabled={cerrandoSesion}
          className="w-full flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-60 rounded-2xl p-3 text-xs font-black uppercase tracking-wider transition-all"
                  >
          <LogOut size={15} />
          {cerrandoSesion ? "Cerrando sesión..." : "Salir"}
        </button>

      </div>
    </main>
  );
}