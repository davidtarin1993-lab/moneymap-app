"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";

export default function BienvenidaPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState<string>("");

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
        .select("nombre, role")
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
      setLoading(false);
    }

    validarUsuario();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
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
    <main className="min-h-screen bg-white p-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#0B3A6E]">
            Bienvenido a MoneyMap
          </h1>

          <p className="mt-2 text-slate-600">
            Hola, {nombre}. Tu dinero, con dirección.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <LogOut size={13} />
          Salir
        </button>
      </div>

      <section className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <h2 className="text-sm font-black text-[#0B3A6E] uppercase tracking-wider">
          Punto de partida
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Aquí empezará la ruta financiera personalizada del cliente.
        </p>
      </section>
    </main>
  );
}
 