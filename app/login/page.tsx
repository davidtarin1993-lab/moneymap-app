"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, ShieldAlert, KeyRound, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [recordar, setRecordar] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);

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
      /**
       * 1. Login con Supabase
       */
      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
      console.log("LOGIN DATA:", loginData);
      console.log("LOGIN ERROR:", loginError);

      if (loginError) {
        throw new Error(loginError.message);
      }

      const user = loginData.user;
      console.log("usuario logado");
      console.log(user);
      if (!user) {
        throw new Error("No se ha podido recuperar el usuario autenticado.");
      }

      /**
       * 2. Recordar email si el usuario lo marca
       */
      if (typeof window !== "undefined") {
        if (recordar) {
          localStorage.setItem("moneymap_remembered_email", email);
        } else {
          localStorage.removeItem("moneymap_remembered_email");
        }
      }

      /**
       * 3. Buscar perfil en la tabla profiles
       */
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, nombre, role")
        .eq("id", user.id)
        .single();
        console.log("PROFILE:", profile);
        console.log("PROFILE ERROR:", profileError);
      if (profileError) {
        throw new Error(
          "Login correcto, pero no se ha encontrado el perfil del usuario en la tabla profiles."
        );
      }

      if (!profile) {
        throw new Error("El usuario no tiene perfil asociado.");
      }

      /**
       * 4. Redirección por rol
       */
      console.log("ROLE:")
      console.log(profile.role)
      if (profile.role === "admin") {
        setMensajeExito("¡Éxito! Iniciando sesión como Administrador...");
        console.log("VOY A ADMIN")
        router.push("/admin");
        return;
      }

      if (profile.role === "user") {
        setMensajeExito("¡Éxito! Redirigiendo a la bienvenida...");
        console.log("VOY A BIENVENIDA")
        router.push("/bienvenida");
        return;
      }

      /**
       * 5. Si el rol no es válido
       */
      throw new Error("El usuario no tiene un rol válido asignado.");

    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error al iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
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
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
              />
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
    </div>
  );
}