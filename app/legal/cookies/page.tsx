"use client";

import { Cookie } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 font-sans pb-32 antialiased">
      <header className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-5">
        <div className="bg-[#0B3A6E] p-2.5 rounded-2xl shrink-0">
          <Cookie size={20} className="text-[#1FA187]" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#0B3A6E] tracking-tight">Política de Cookies</h1>
          <p className="text-[11px] text-slate-400 font-medium">Última actualización: 3 de octubre de 2026</p>
        </div>
      </header>

      <div className="space-y-5 text-sm leading-relaxed text-slate-700 max-w-2xl">
        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">1. ¿Qué son las cookies?</h2>
          <p>
            Una cookie es un pequeño archivo que se almacena en tu navegador al visitar un sitio
            web. Permite, entre otras cosas, recordar tus preferencias y mantener tu sesión
            iniciada.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">2. Cookies que utilizamos</h2>
          <p>Actualmente, MoneyMap utiliza únicamente:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Cookies técnicas/necesarias:</strong> imprescindibles para que la plataforma
              funcione — mantienen tu sesión iniciada (autenticación) y permiten la navegación
              segura entre páginas. Estas cookies no requieren consentimiento porque son esenciales
              para el servicio.
            </li>
          </ul>
          <p className="mt-2">
            No utilizamos, a día de hoy, cookies de analítica ni de publicidad de terceros. Si en el
            futuro se incorporan, esta política se actualizará y se solicitará tu consentimiento
            antes de activarlas.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">3. Cómo gestionar las cookies</h2>
          <p>
            Puedes configurar tu navegador para bloquear o eliminar las cookies en cualquier
            momento. Ten en cuenta que bloquear las cookies técnicas puede impedir el correcto
            funcionamiento de MoneyMap (por ejemplo, mantener tu sesión iniciada).
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">4. Más información</h2>
          <p>
            Si tienes dudas sobre esta política, escríbenos a{" "}
            <a href="mailto:hola.moneymap@gmail.com" className="text-[#0B3A6E] font-bold underline">
              hola.moneymap@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
