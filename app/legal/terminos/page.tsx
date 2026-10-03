"use client";

import { FileText } from "lucide-react";

export default function TerminosPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 font-sans pb-32 antialiased">
      <header className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-5">
        <div className="bg-[#0B3A6E] p-2.5 rounded-2xl shrink-0">
          <FileText size={20} className="text-[#1FA187]" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#0B3A6E] tracking-tight">Términos y Condiciones</h1>
          <p className="text-[11px] text-slate-400 font-medium">Última actualización: 3 de octubre de 2026</p>
        </div>
      </header>

      <div className="space-y-5 text-sm leading-relaxed text-slate-700 max-w-2xl">
        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">1. Objeto</h2>
          <p>
            Las presentes condiciones regulan el acceso y uso de MoneyMap, plataforma digital de
            gestión y educación financiera personal, titularidad de David Tarín (NIF 21008942Y),
            así como la contratación de la suscripción de pago asociada.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">2. Registro de usuario</h2>
          <p>
            Para acceder a determinadas funcionalidades es necesario registrarse facilitando datos
            veraces. El usuario es responsable de la confidencialidad de sus credenciales de
            acceso.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">3. Descripción del servicio</h2>
          <p>
            MoneyMap ofrece, bajo un modelo freemium: visualización de movimientos e ingresos,
            apoyo en materia fiscal, consejos de carácter informativo (que en ningún caso
            constituyen recomendaciones financieras formales), herramientas y calculadoras, y
            soporte al usuario. El acceso a funcionalidades avanzadas requiere una suscripción de
            pago.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">4. Precio y forma de pago</h2>
          <p>
            La suscripción tiene un precio de <strong>9,99 €/mes</strong> o{" "}
            <strong>99,99 €/año</strong>, impuestos incluidos cuando corresponda. El pago se
            gestiona a través de PayPal. Tras cada pago recibirás un justificante de pago; dado que
            el titular se encuentra en proceso de alta formal como actividad económica, este
            justificante no tiene, por el momento, la consideración de factura fiscal.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">5. Duración, renovación y baja</h2>
          <p>
            La suscripción se renueva automáticamente por periodos iguales al contratado
            (mensual o anual), salvo cancelación por parte del usuario antes de la fecha de
            renovación. La baja puede solicitarse en cualquier momento desde tu perfil o
            escribiendo a{" "}
            <a href="mailto:hola.moneymap@gmail.com" className="text-[#0B3A6E] font-bold underline">
              hola.moneymap@gmail.com
            </a>
            , y será efectiva al finalizar el periodo ya pagado.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">6. Derecho de desistimiento</h2>
          <p>
            De acuerdo con el artículo 103 del Texto Refundido de la Ley General para la Defensa de
            los Consumidores y Usuarios, el derecho de desistimiento de 14 días naturales no resulta
            aplicable una vez que, con tu consentimiento expreso previo, el servicio digital ha
            comenzado a prestarse antes de finalizar dicho plazo.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">7. Naturaleza informativa del servicio</h2>
          <p>
            El contenido de MoneyMap (consejos, herramientas, simuladores) tiene carácter
            informativo y educativo, y no constituye asesoramiento financiero, fiscal o de
            inversión de carácter profesional. Las decisiones que el usuario adopte a partir de
            dicha información son de su exclusiva responsabilidad.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">8. Propiedad intelectual</h2>
          <p>
            Todos los elementos de la plataforma están protegidos por derechos de propiedad
            intelectual e industrial titularidad de David Tarín o de terceros autorizantes.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">9. Modificación de las condiciones</h2>
          <p>
            El titular podrá modificar estas condiciones en cualquier momento. Las modificaciones
            relevantes se comunicarán al usuario con antelación razonable.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">10. Legislación y resolución de conflictos</h2>
          <p>
            Estas condiciones se rigen por la legislación española. Para disputas derivadas de una
            compra online, puedes acudir también a la plataforma europea de resolución de litigios
            en línea:{" "}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-[#0B3A6E] font-bold underline">
              ec.europa.eu/consumers/odr
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
