import Link from "next/link";
import { Pill, Newspaper, LineChart, GraduationCap, Calculator, Target, ChevronRight , Sparkles} from "lucide-react";

const SECCIONES = [
  {
    href: "/formacion/pildoras",
    icono: Pill,
    color: "emerald",
    titulo: "Píldoras de Aprendizaje",
    descripcion: "Lecciones express de 3 minutos con conceptos macroeconómicos clave.",
  },
  {
    href: "/formacion/noticias",
    icono: Newspaper,
    color: "blue",
    titulo: "Noticias Financieras",
    descripcion: "Análisis diario del mercado global explicado de forma sencilla y directa.",
  },
  {
    href: "/formacion/cartera_moneymap",
    icono: LineChart,
    color: "amber",
    titulo: "Cartera de Inversión",
    descripcion: "Seguimiento en tiempo real de portafolios modelo y tesis estratégicas activas.",
  },

];

const ESTILOS_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-600", border: "hover:border-blue-500/40" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "hover:border-emerald-500/40" },
  sky: { bg: "bg-sky-500/10", text: "text-sky-600", border: "hover:border-sky-500/40" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-600", border: "hover:border-amber-500/40" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-600", border: "hover:border-violet-500/40" },
  fuchsia: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-600", border: "hover:border-fuchsia-500/40" },
};

export default function FormacionPage() {
  return (
    <main className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 md:py-10 overflow-y-auto antialiased">
      <div className="max-w-3xl mx-auto w-full space-y-6">

        <header className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl" role="img" aria-label="Academia">🎓</span>
            <h1 className="text-2xl md:text-3xl font-black text-[#0B3A6E] tracking-tight">Academia</h1>
          </div>
          <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-xl font-medium leading-normal">
            Potencia tu inteligencia financiera. Selecciona una sección para acceder a nuestros contenidos exclusivos.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SECCIONES.map(({ href, icono: Icono, color, titulo, descripcion }) => {
            const estilo = ESTILOS_COLOR[color];
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3.5 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 shadow-sm transition-all duration-300 ${estilo.border} hover:bg-slate-100/30 hover:-translate-y-0.5`}
              >
                <div className={`${estilo.bg} p-2.5 rounded-xl shrink-0`}>
                  <Icono size={20} className={estilo.text} />
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-[#0B3A6E] transition-colors">
                    {titulo}
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-500 font-medium leading-normal">
                    {descripcion}
                  </p>
                </div>

                <ChevronRight size={16} className="text-slate-300 shrink-0 self-center" />
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}