"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, ShieldAlert, KeyRound, CheckCircle, X , Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";


export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [recordar, setRecordar] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
const [mostrarPassword, setMostrarPassword] = useState<boolean>(false);

  // Estados para el modal de "¿Olvidaste tu contraseña?"
  const [mostrarRecuperar, setMostrarRecuperar] = useState<boolean>(false);
  const [emailRecuperar, setEmailRecuperar] = useState<string>("");
  const [enviandoRecuperar, setEnviandoRecuperar] = useState<boolean>(false);
  const [enviadoRecuperar, setEnviadoRecuperar] = useState<boolean>(false);
  const [errorRecuperar, setErrorRecuperar] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("moneymap_remembered_email");

      if (savedEmail) {
        setEmail(savedEmail);
        setRecordar(true);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setMensajeExito(null);
    setCargando(true);

    try {
      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        throw new Error(loginError.message);
      }

      const user = loginData.user;
      if (!user) {
        throw new Error("No se ha podido recuperar el usuario autenticado.");
      }

      if (typeof window !== "undefined") {
        if (recordar) {
          localStorage.setItem("moneymap_remembered_email", email);
        } else {
          localStorage.removeItem("moneymap_remembered_email");
        }
      }
      // Registrar la conexión (no bloqueante: si falla, no rompe el login)
      if (loginData.session?.access_token) {
        fetch("/api/auth/registrar-conexion", {
          method: "POST",
          headers: { Authorization: `Bearer ${loginData.session.access_token}` },
        }).catch((err) => console.error("No se pudo registrar la conexión:", err));
      }
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, nombre, role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw new Error(
          "Login correcto, pero no se ha encontrado el perfil del usuario en la tabla profiles."
        );
      }

      if (!profile) {
        throw new Error("El usuario no tiene perfil asociado.");
      }

      if (profile.role === "admin") {
        setMensajeExito("¡Éxito! Iniciando sesión como Administrador...");
        router.push("/admin");
        return;
      }

      if (profile.role === "user") {
        setMensajeExito("¡Éxito! Redirigiendo a la bienvenida...");
        router.push("/bienvenida");
        return;
      }

      throw new Error("El usuario no tiene un rol válido asignado.");

    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error al iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const abrirModalRecuperar = () => {
    setErrorRecuperar("");
    setEnviadoRecuperar(false);
    setEmailRecuperar(email); // precargamos con el email ya escrito en el login, si lo hay
    setMostrarRecuperar(true);
  };

  const handleRecuperarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRecuperar("");
    setEnviandoRecuperar(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperar, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/restablecer-contrasena`,
      });

      if (error) {
        throw new Error(error.message);
      }

      setEnviadoRecuperar(true);
    } catch (err: any) {
      setErrorRecuperar(err?.message || "No se pudo enviar el email de recuperación.");
    } finally {
      setEnviandoRecuperar(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center px-4 pt-12 font-sans antialiased">
      <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-base font-black text-[#0B3A6E] tracking-tight uppercase">
            Acceso Clientes
          </h2>
          <p className="text-slate-500 text-[10px] font-semibold leading-tight">
            Introduce tus credenciales de MoneyMap.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-center gap-2 text-rose-700 text-[10px] font-semibold">
            <ShieldAlert size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {mensajeExito && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2 text-emerald-700 text-[10px] font-semibold">
            <CheckCircle size={14} className="shrink-0" />
            <span>{mensajeExito}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-[8.5px] text-slate-500 font-bold uppercase tracking-wider pl-1">
              Correo Electrónico
            </label>

            <div className="relative">
              <Mail
                size={12}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                required
                placeholder="ejemplo@moneymap.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
              />
            </div>
          </div>

<div className="space-y-1">
            <label className="block text-[8.5px] text-slate-500 font-bold uppercase tracking-wider pl-1">
              Contraseña
            </label>

            <div className="relative">
              <Lock
                size={12}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type={mostrarPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl pl-9 pr-9 py-1.5 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
              />

              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {mostrarPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] px-1 pt-0.5">
            <label className="flex items-center gap-1.5 text-slate-500 font-bold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={recordar}
                onChange={(e) => setRecordar(e.target.checked)}
                className="rounded border-slate-300 text-[#0B3A6E] w-3.5 h-3.5 accent-[#0B3A6E]"
              />
              <span>Recordarme</span>
            </label>

            <button
              type="button"
              onClick={abrirModalRecuperar}
              className="text-[#0B3A6E] font-extrabold hover:underline flex items-center gap-0.5"
            >
              <KeyRound size={10} />
              ¿Olvidaste la clave?
            </button>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={`w-full text-xs font-black uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm ${
              cargando
                ? "bg-slate-200 text-slate-400 border border-slate-300"
                : "bg-[#0B3A6E] text-white hover:bg-[#11498a]"
            }`}
          >
            <LogIn size={11} />
            {cargando ? "Autenticando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>

      {/* MODAL: ¿Olvidaste tu contraseña? */}
      {mostrarRecuperar && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 border border-slate-200 shadow-2xl relative space-y-4">
            <button
              onClick={() => setMostrarRecuperar(false)}
              className="absolute top-4 right-4 p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 bg-[#0B3A6E]/5 text-[#0B3A6E] rounded-full flex items-center justify-center mx-auto">
                <KeyRound size={18} />
              </div>
              <h3 className="text-sm font-black text-[#0B3A6E] uppercase tracking-tight">
                Recuperar contraseña
              </h3>
              <p className="text-[11px] text-slate-400 font-medium px-2">
                Te enviaremos un enlace a tu correo para crear una contraseña nueva.
              </p>
            </div>

            {enviadoRecuperar ? (
              <div className="py-4 text-center space-y-2">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle size={18} />
                </div>
                <p className="text-[11px] text-slate-500 font-medium px-2">
                  Si ese correo existe en nuestro sistema, te hemos enviado un enlace. Revisa tu bandeja de entrada o spam.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRecuperarPassword} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[8.5px] text-slate-500 font-bold uppercase tracking-wider pl-1">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@moneymap.com"
                      value={emailRecuperar}
                      onChange={(e) => setEmailRecuperar(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
                    />
                  </div>
                </div>

                {errorRecuperar && (
                  <p className="text-red-500 text-[10px] font-bold text-center">{errorRecuperar}</p>
                )}

                <button
                  type="submit"
                  disabled={enviandoRecuperar}
                  className="w-full bg-[#0B3A6E] hover:bg-[#11498a] disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider py-2.5 rounded-xl transition-all"
                >
                  {enviandoRecuperar ? "Enviando..." : "Enviar enlace"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}