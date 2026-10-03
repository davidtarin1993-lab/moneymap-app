"use client";

import { Scale } from "lucide-react";

export default function AvisoLegalPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 font-sans pb-32 antialiased">
      <header className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-5">
        <div className="bg-[#0B3A6E] p-2.5 rounded-2xl shrink-0">
          <Scale size={20} className="text-[#1FA187]" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#0B3A6E] tracking-tight">Aviso Legal</h1>
          <p className="text-[11px] text-slate-400 font-medium">Última actualización: 3 de octubre de 2026</p>
        </div>
      </header>

      <div className="space-y-5 text-sm leading-relaxed text-slate-700 max-w-2xl">
        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">1. Datos identificativos</h2>
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
            Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de que el
            titular de este sitio web (<strong>moneymap.es</strong>, en adelante &quot;MoneyMap&quot;) es:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Titular:</strong> David Tarín</li>
            <li><strong>NIF:</strong> 21008942Y</li>
            <li><strong>Domicilio:</strong> Carrer Alacant, 11, Tavernes Blanques (Valencia), España</li>
            <li>
              <strong>Email de contacto:</strong>{" "}
              <a href="mailto:hola.moneymap@gmail.com" className="text-[#0B3A6E] font-bold underline">
                hola.moneymap@gmail.com
              </a>
            </li>
            <li><strong>Actividad:</strong> prestación de servicios digitales de gestión y educación financiera personal</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">2. Objeto</h2>
          <p>
            MoneyMap es una plataforma digital que ofrece herramientas de gestión y educación
            financiera personal: visualización de movimientos e ingresos, apoyo en materia fiscal,
            contenido educativo, calculadoras y herramientas de simulación, y un servicio de
            soporte. El acceso y uso de este sitio web atribuye la condición de usuario e implica
            la aceptación plena de las condiciones incluidas en este Aviso Legal.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">3. Condiciones de uso</h2>
          <p>
            El usuario se compromete a hacer un uso adecuado y lícito del sitio web, de conformidad
            con la legislación aplicable, la buena fe, el orden público y el presente Aviso Legal.
            Queda prohibido el uso del sitio web con fines ilícitos, lesivos de los derechos e
            intereses de terceros, o que de cualquier forma puedan dañar, inutilizar, sobrecargar o
            deteriorar el sitio web o impedir su normal utilización.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">4. Propiedad intelectual e industrial</h2>
          <p>
            Todos los contenidos del sitio web (textos, imágenes, logotipos, diseño, código fuente,
            estructura de navegación, bases de datos y demás elementos) son titularidad de David
            Tarín o de terceros que han autorizado su uso, y están protegidos por la normativa de
            propiedad intelectual e industrial. Queda prohibida su reproducción, distribución o
            comunicación pública, total o parcial, sin autorización expresa.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">5. Exclusión de responsabilidad</h2>
          <p>
            El contenido de MoneyMap, incluidos los consejos, calculadoras y simulaciones, tiene
            carácter meramente informativo y educativo. No constituye asesoramiento financiero,
            fiscal, legal o de inversión de carácter profesional, ni sustituye la consulta con un
            profesional cualificado. Las decisiones financieras que el usuario adopte a partir de
            la información de la plataforma son de su exclusiva responsabilidad.
          </p>
          <p className="mt-2">
            El titular no garantiza la disponibilidad, continuidad ni infalibilidad del
            funcionamiento del sitio web, y no se responsabiliza de los daños y perjuicios que
            pudieran derivarse de su uso.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">6. Enlaces a terceros</h2>
          <p>
            Este sitio web puede incluir enlaces a páginas de terceros. El titular no se hace
            responsable del contenido ni de las políticas de privacidad de dichos sitios.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">7. Legislación aplicable</h2>
          <p>
            Las presentes condiciones se rigen por la legislación española. Para la resolución de
            cualquier controversia, las partes se someterán a los juzgados y tribunales que
            correspondan conforme a la normativa de protección de consumidores y usuarios
            aplicable.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2">8. Modificaciones</h2>
          <p>
            El titular se reserva el derecho a modificar el presente Aviso Legal para adaptarlo a
            novedades legislativas o cambios en el servicio. Se recomienda revisar este documento
            periódicamente.
          </p>
        </section>
      </div>
    </div>
  );
}
