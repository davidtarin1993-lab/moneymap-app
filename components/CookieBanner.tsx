"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const CLAVE_CONSENTIMIENTO = "moneymap_consentimiento_cookies";

// Ponlo en la misma carpeta que Header.tsx y Navigation.tsx
//
// NOTA: si en el futuro añades cookies de analítica/publicidad de terceros
// (Google Analytics, Meta Pixel, etc.), ese código debe cargarse solo cuando
// localStorage.getItem("moneymap_consentimiento_cookies") === "todas".
// Con solo cookies técnicas (como ahora), este banner es informativo.
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_CONSENTIMIENTO);
      if (!guardado) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function guardarConsentimiento(valor: "todas" | "necesarias") {
    try {
      localStorage.setItem(CLAVE_CONSENTIMIENTO, valor);
    } catch {
      // si el navegador bloquea localStorage, simplemente no lo recordamos
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-[60] bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 max-w-md mx-auto">
      <div className="flex items-start gap-2 mb-2.5">
        <div className="bg-[#0B3A6E] p-1.5 rounded-xl shrink-0">
          <Cookie size={14} className="text-[#1FA187]" />
        </div>
        <p className="text-[10.5px] text-slate-600 font-medium leading-relaxed">
          Usamos cookies técnicas necesarias para que MoneyMap funcione correctamente.{" "}
          <Link href="/legal/cookies" className="text-[#0B3A6E] font-bold underline">
            Más información
          </Link>
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => guardarConsentimiento("necesarias")}
          className="flex-1 bg-slate-100 text-slate-600 text-[10.5px] font-black uppercase tracking-wide rounded-xl py-2"
        >
          Solo necesarias
        </button>
        <button
          onClick={() => guardarConsentimiento("todas")}
          className="flex-1 bg-[#0B3A6E] text-white text-[10.5px] font-black uppercase tracking-wide rounded-xl py-2"
        >
          Aceptar todas
        </button>
      </div>
    </div>
  );
}
