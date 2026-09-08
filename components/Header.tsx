"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // No mostramos el botón en /login (nadie ha entrado aún) ni en /admin
  // (el panel de admin ya tiene su propio botón de salir)
  const mostrarLogout = pathname !== "/login" && !pathname.startsWith("/admin");

  return (
    <header className="px-4 py-3 flex items-center justify-between">
      <Link href="/bienvenida" className="flex items-center gap-3">
        <Image
          src="/Multimedia/portada.png"
          alt="MoneyMap"
          width={160}
          height={160}
          priority
        />
      </Link>

      {mostrarLogout && (
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
        >
          <LogOut size={13} />
          Salir
        </button>
      )}
    </header>
  );
}