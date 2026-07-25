"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Lock } from "lucide-react";

export default function RestablecerContrasenaPage() {
  const router = useRouter();

  const [sesionLista, setSesionLista] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [completado, setCompletado] = useState(false);

  useEffect(() => {
    // Supabase procesa automáticamente el token de recuperación que viene en la URL
    // (#access_token=...&type=recovery) y dispara este evento cuando la sesión está lista.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setSesionLista(true);
      }
    });

    // Por si el evento ya ocurrió antes de montar el listener, comprobamos la sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSesionLista(true);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (password.length < 6) {
      setMensaje({ tipo: "error", texto: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }

    if (password !== password2) {
      setMensaje({ tipo: "error", texto: "Las contraseñas no coinciden." });
      return;
    }

    setCargando(true);

    const { error } = await supabase.auth.updateUser({ password });

    setCargando(false);

    if (error) {
      setMensaje({ tipo: "error", texto: error.message });
      return;
    }

    setCompletado(true);
    setTimeout(() => {
      router.push("/login");
    }, 2500);
  };

  if (!sesionLista) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center px-4">
        <p className="text-sm font-bold text-slate-500 text-center">
          Verificando tu enlace de acceso...
          <br />
          <span className="text-xs font-medium text-slate-400">
            Si tarda mucho, es posible que el enlace haya caducado. Solicita uno nuevo desde el login.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-5">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 bg-[#0B3A6E]/5 text-[#0B3A6E] rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck size={20} />
          </div>
          <h1 className="text-base font-black text-[#0B3A6E] uppercase tracking-tight">
            Crea tu contraseña
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">
            Elige una contraseña segura para acceder a MoneyMap.
          </p>
        </div>

        {completado ? (
          <div className="text-center space-y-2 py-4">
            <p className="text-xs font-black text-emerald-600">¡Contraseña creada con éxito!</p>
            <p className="text-[11px] text-slate-500">Redirigiéndote al login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Lock size={10} /> Nueva contraseña
              </label>
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Lock size={10} /> Repite la contraseña
              </label>
              <input
                type="password"
                required
                placeholder="Repite la contraseña"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
              />
            </div>

            {mensaje && (
              <p className={`text-[10px] font-bold text-center ${mensaje.tipo === "error" ? "text-red-500" : "text-emerald-600"}`}>
                {mensaje.texto}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-[#1FA187] hover:bg-[#198771] disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all"
            >
              {cargando ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}