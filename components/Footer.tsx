"use client";

import Link from "next/link";

// Ponlo en la misma carpeta que Header.tsx y Navigation.tsx
export default function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 px-4 py-6">
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-3 text-center">
        <p className="text-[10px] font-bold text-slate-400">
          © {anioActual} MoneyMap. Todos los derechos reservados.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          <Link href="/legal/aviso-legal" className="text-[10px] font-bold text-slate-500 hover:text-[#0B3A6E] uppercase tracking-wide">
            Aviso Legal
          </Link>
          <Link href="/legal/privacidad" className="text-[10px] font-bold text-slate-500 hover:text-[#0B3A6E] uppercase tracking-wide">
            Privacidad
          </Link>
          <Link href="/legal/cookies" className="text-[10px] font-bold text-slate-500 hover:text-[#0B3A6E] uppercase tracking-wide">
            Cookies
          </Link>
          <Link href="/legal/terminos" className="text-[10px] font-bold text-slate-500 hover:text-[#0B3A6E] uppercase tracking-wide">
            Términos y Condiciones
          </Link>
        </nav>
        <p className="text-[9px] text-slate-400 font-medium max-w-md leading-relaxed">
          El contenido de MoneyMap tiene carácter informativo y no constituye asesoramiento
          financiero o fiscal profesional.
        </p>
      </div>
    </footer>
  );
}
