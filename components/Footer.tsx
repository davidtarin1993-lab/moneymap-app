"use client";

import Link from "next/link";

// Ponlo en la misma carpeta que Header.tsx y Navigation.tsx
const ENLACES_RRSS = {
  instagram: "https://www.instagram.com/moneymap_es/",
  tiktok: "https://www.tiktok.com/@moneymap_es",
  pinterest: "https://www.pinterest.com/moneymap_es",
};

// Lucide no incluye los logos de TikTok/Pinterest, así que van como SVG propio
// (mismo estilo "stroke" que el resto de iconos de la app).
function IconoInstagram({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconoTikTok({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3c.3 2.1 1.8 3.7 4 4v3c-1.5 0-2.9-.4-4-1.2V15a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.1a3 3 0 1 0 2 2.8V3h3Z" />
    </svg>
  );
}

function IconoPinterest({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.5 19c.8-2.5 1.5-5 2-7.5M12.5 5.5c3 0 4.5 2 4.5 4.3 0 2.8-1.4 5.2-4 5.2-1 0-1.8-.5-2.1-1.1" />
    </svg>
  );
}

export default function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 px-4 py-6">
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-3">
          <a
            href={ENLACES_RRSS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="MoneyMap en Instagram"
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#0B3A6E] hover:border-[#0B3A6E]/30 transition-colors"
          >
            <IconoInstagram />
          </a>
          <a
            href={ENLACES_RRSS.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="MoneyMap en TikTok"
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#0B3A6E] hover:border-[#0B3A6E]/30 transition-colors"
          >
            <IconoTikTok />
          </a>
          <a
            href={ENLACES_RRSS.pinterest}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="MoneyMap en Pinterest"
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#0B3A6E] hover:border-[#0B3A6E]/30 transition-colors"
          >
            <IconoPinterest />
          </a>
        </div>

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
