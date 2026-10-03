"use client";

import { ShieldCheck } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 font-sans pb-32 antialiased">
      <header className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-5">
        <div className="bg-[#0B3A6E] p-2.5 rounded-2xl shrink-0">
          <ShieldCheck size={20} className="text-[#1FA187]" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#0B3A6E] tracking-tight">Política de Privacidad</h1>
          <p className="text-[11px] text-slate-400 font-medium">Última actualización: 3 de octubre de 2026</p>
        </div>
      </header>

      <div className="space-y-5 text-sm leading-relaxed text-slate-700 max-w-2xl">
        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">1. Responsable del tratamiento</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Responsable:</strong> David Tarín</li>
            <li><strong>NIF:</strong> 21008942Y</li>
            <li><strong>Domicilio:</strong> Carrer Alacant, 11, Tavernes Blanques (Valencia), España</li>
            <li>
              <strong>Email de contacto:</strong>{" "}
              <a href="mailto:hola.moneymap@gmail.com" className="text-[#0B3A6E] font-bold underline">
                hola.moneymap@gmail.com
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">2. Datos que recogemos</h2>
          <p>Recogemos y tratamos las siguientes categorías de datos:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Datos de registro:</strong> nombre y correo electrónico.</li>
            <li>
              <strong>Datos financieros que subes voluntariamente:</strong> extractos bancarios y
              documentos fiscales (declaraciones de la renta) que cargas en la plataforma para que
              MoneyMap los procese y te muestre tu información financiera.
            </li>
            <li>
              <strong>Datos de uso:</strong> conexiones, páginas visitadas y tiempo de uso dentro de
              la aplicación, con el fin de mejorar el servicio.
            </li>
            <li>
              <strong>Datos de pago:</strong> MoneyMap no almacena datos de tu tarjeta ni cuenta
              bancaria; la gestión del pago de la suscripción la realiza PayPal como pasarela de
              pago independiente, conforme a su propia política de privacidad.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">3. Finalidades del tratamiento</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Prestar el servicio: mostrar tu información financiera, fiscal y herramientas asociadas.</li>
            <li>Gestionar tu cuenta y tu suscripción.</li>
            <li>Dar soporte ante tus consultas.</li>
            <li>Analizar el uso agregado de la plataforma para mejorarla.</li>
            <li>Enviar comunicaciones relacionadas con el servicio (confirmaciones, avisos, novedades).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">4. Base legal del tratamiento</h2>
          <p>
            El tratamiento de tus datos se basa en: la <strong>ejecución del contrato de
            prestación de servicio</strong> (al registrarte y usar MoneyMap), tu{" "}
            <strong>consentimiento</strong> para el tratamiento de los documentos financieros y
            fiscales que subes voluntariamente, y el <strong>interés legítimo</strong> del
            responsable para garantizar la seguridad y mejorar el servicio mediante analítica
            agregada de uso.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">5. Conservación de los datos</h2>
          <p>
            Tus datos se conservarán mientras mantengas tu cuenta activa en MoneyMap. Tras la baja,
            se conservarán durante los plazos legalmente exigibles y, transcurridos estos, serán
            eliminados o anonimizados.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">6. Destinatarios y encargados del tratamiento</h2>
          <p>Para prestar el servicio, compartimos datos con los siguientes proveedores, que actúan como encargados del tratamiento:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Supabase</strong> — base de datos y autenticación de usuarios.</li>
            <li><strong>Vercel</strong> — alojamiento (hosting) de la aplicación.</li>
            <li><strong>PayPal</strong> — gestión de los pagos de la suscripción.</li>
            <li><strong>Google (Gemini)</strong> — procesamiento de IA para la herramienta de análisis de gastos.</li>
          </ul>
          <p className="mt-2">
            Estos proveedores pueden estar ubicados fuera del Espacio Económico Europeo. En esos
            casos, el tratamiento se realiza bajo las garantías previstas por el RGPD (como las
            Cláusulas Contractuales Tipo aprobadas por la Comisión Europea).
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">7. Tus derechos</h2>
          <p>
            Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación
            del tratamiento y portabilidad de tus datos escribiendo a{" "}
            <a href="mailto:hola.moneymap@gmail.com" className="text-[#0B3A6E] font-bold underline">
              hola.moneymap@gmail.com
            </a>
            , indicando el derecho que deseas ejercer y adjuntando copia de tu documento de
            identidad.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">8. Seguridad</h2>
          <p>
            Aplicamos medidas técnicas y organizativas razonables para proteger tus datos frente a
            accesos no autorizados, pérdida o alteración.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">9. Reclamaciones</h2>
          <p>
            Si consideras que el tratamiento de tus datos no se ajusta a la normativa vigente,
            puedes presentar una reclamación ante la Agencia Española de Protección de Datos
            (AEPD) —{" "}
            <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-[#0B3A6E] font-bold underline">
              www.aepd.es
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
