import Link from "next/link";
import { Target, Sparkles, Calculator, Home, ChevronRight } from "lucide-react";

const CONOCETE_MEJOR = [
  {
    href: "/formacion/quiz",
    icono: Sparkles,
    color: "emerald",
    titulo: "Quiz Financiero",
    descripcion: "40 preguntas para descubrir tu puntuación y en qué áreas deberías mejorar.",
  },
  {
    href: "/formacion/survey_economy",
    icono: Target,
    color: "fuchsia",
    titulo: "Perfilador de Riesgo",
    descripcion: "Un test completo para descubrir tu perfil real como inversor.",
  },
];

const HERRAMIENTAS = [
  {
    href: "/formacion/hipoteca",
    icono: Home,
    color: "blue",
    titulo: "Simulador de Hipoteca",
    descripcion: "Calcula tu cuota mensual a tipo fijo o variable y el coste total del préstamo.",
  },
  {
    href: "/formacion/calculadora",
    icono: Calculator,
    color: "violet",
    titulo: "Proyector de Patrimonio",
    descripcion: "Simula tus objetivos de interés compuesto y proyecta tu patrimonio futuro.",
  },
];

const ESTILOS_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  violet: { bg: "bg-violet-500/10", text: "text-violet-600", border: "hover:border-violet-500/40" },
  fuchsia: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-600", border: "hover:border-fuchsia-500/40" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-600", border: "hover:border-blue-500/40" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "hover:border-emerald-500/40" },
};

function TarjetaApp({ item }: { item: typeof CONOCETE_MEJOR[number] }) {
  const estilo = ESTILOS_COLOR[item.color];
  const Icono = item.icono;
  return (
    <Link
      href={item.href}
      className={"group flex items-center gap-3.5 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 shadow-sm transition-all duration-300 " + estilo.border + " hover:bg-slate-100/30 hover:-translate-y-0.5"}
    >
      <div className={estilo.bg + " p-2.5 rounded-xl shrink-0"}>
        <Icono size={20} className={estilo.text} />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-[#0B3A6E] transition-colors">
          {item.titulo}
        </h2>
        <p className="mt-1 text-[11px] text-slate-500 font-medium leading-normal">{item.descripcion}</p>
      </div>
      <ChevronRight size={16} className="text-slate-300 shrink-0 self-center" />
    </Link>
  );
}

export default function AplicacionesPage() {
  return (
    <main className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 md:py-10 overflow-y-auto antialiased">
      <div className="max-w-3xl mx-auto w-full space-y-8">

        <header className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl" role="img" aria-label="Aplicaciones">🧰</span>
            <h1 className="text-2xl md:text-3xl font-black text-[#0B3A6E] tracking-tight">Aplicaciones</h1>
          </div>
          <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-xl font-medium leading-normal">
            Herramientas interactivas para calcular y descubrir más sobre tu situación financiera.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">Conócete mejor</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONOCETE_MEJOR.map((item) => <TarjetaApp key={item.href} item={item} />)}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">Herramientas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HERRAMIENTAS.map((item) => <TarjetaApp key={item.href} item={item} />)}
          </div>
        </section>

      </div>
    </main>
  );
}