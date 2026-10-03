"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";

const ENLACES_RRSS = {
  instagram: "https://www.instagram.com/moneymap_es/",
  tiktok: "https://www.tiktok.com/@moneymap_es",
  pinterest: "https://www.pinterest.com/moneymap_es",
};

// Lucide no incluye los logos de TikTok/Pinterest, así que van como SVG propio
// (mismo estilo "stroke" que el resto de iconos de la app).
function IconoInstagram({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconoTikTok({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3c.3 2.1 1.8 3.7 4 4v3c-1.5 0-2.9-.4-4-1.2V15a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.1a3 3 0 1 0 2 2.8V3h3Z" />
    </svg>
  );
}

function IconoPinterest({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.5 19c.8-2.5 1.5-5 2-7.5M12.5 5.5c3 0 4.5 2 4.5 4.3 0 2.8-1.4 5.2-4 5.2-1 0-1.8-.5-2.1-1.1" />
    </svg>
  );
}

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
      <div className="flex items-center gap-3">
        <Link href="/bienvenida" className="flex items-center gap-3">
          <Image
            src="/Multimedia/portada.png"
            alt="MoneyMap"
            width={160}
            height={160}
            priority
          />
        </Link>

        <div className="flex items-center gap-1.5">
          <a
            href={ENLACES_RRSS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="MoneyMap en Instagram"
            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#0B3A6E] transition-colors"
          >
            <IconoInstagram />
          </a>
          <a
            href={ENLACES_RRSS.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="MoneyMap en TikTok"
            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#0B3A6E] transition-colors"
          >
            <IconoTikTok />
          </a>
          <a
            href={ENLACES_RRSS.pinterest}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="MoneyMap en Pinterest"
            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#0B3A6E] transition-colors"
          >
            <IconoPinterest />
          </a>
        </div>
      </div>

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
