import Link from "next/link";

export default function FormacionPage() {
  return (
    /* 🛠️ ENTORNO CLARO: Fondo blanco puro, texto principal oscuro y scroll vertical fluido (overflow-y-auto) */
    <main className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 md:py-10 overflow-y-auto antialiased">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        
        {/* CABECERA CON CONTRATE CORREGIDO */}
        <header className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl" role="img" aria-label="Academia">🎓</span>
            <h1 className="text-2xl md:text-3xl font-black text-[#0B3A6E] tracking-tight">Academia</h1>
          </div>
          <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-xl font-medium leading-normal">
            Potencia tu inteligencia financiera. Selecciona una sección para acceder a nuestros contenidos exclusivos.
          </p>
        </header>

        {/* 🛠️ MODIFICADO: Forzado a una sola columna vertical estricta (grid-cols-1) en móvil, iPad y PC */}
        <section className="grid grid-cols-1 gap-3.5 w-full items-stretch">
          {/* Tarjeta 1: Noticias */}
          <Link href="/formacion/noticias" className="group block bg-slate-50 rounded-2xl p-4.5 border border-slate-200/80 shadow-sm transition-all duration-300 hover:border-blue-500/40 hover:bg-slate-100/30 hover:-translate-y-0.5">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start gap-3.5">
                <div className="bg-blue-500/10 p-2.5 rounded-xl text-xl shrink-0"><span>📰</span></div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-[#0B3A6E] transition-colors">Noticias Financieras</h2>
                  <p className="mt-1 text-[11px] text-slate-500 font-medium leading-normal">Análisis diario del mercado global explicado de forma sencilla y directa.</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Tarjeta 2: Píldoras */}
          <Link href="/formacion/pildoras" className="group block bg-slate-50 rounded-2xl p-4.5 border border-slate-200/80 shadow-sm transition-all duration-300 hover:border-emerald-500/40 hover:bg-slate-100/30 hover:-translate-y-0.5">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start gap-3.5">
                <div className="bg-emerald-500/10 p-2.5 rounded-xl text-xl shrink-0"><span>💊</span></div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-[#0B3A6E] transition-colors">Píldoras de Aprendizaje</h2>
                  <p className="mt-1 text-[11px] text-slate-500 font-medium leading-normal">Lecciones express de 3 minutos con conceptos macroeconómicos clave.</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Tarjeta 2.2: Cursos Completos */}
          <Link href="/formacion/cursos" className="group block bg-slate-50 rounded-2xl p-4.5 border border-slate-200/80 shadow-sm transition-all duration-300 hover:border-blue-600/40 hover:bg-slate-100/30 hover:-translate-y-0.5">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start gap-3.5">
                <div className="bg-blue-600/10 p-2.5 rounded-xl text-xl shrink-0"><span>🎓</span></div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-[#0B3A6E] transition-colors">Cursos Especializados</h2>
                  <p className="mt-1 text-[11px] text-slate-500 font-medium leading-normal">Programas formativos estructurados por módulos para dominar tus finanzas paso a paso.</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Tarjeta 3: Cartera */}
          <Link href="/formacion/cartera_moneymap" className="group block bg-slate-50 rounded-2xl p-4.5 border border-slate-200/80 shadow-sm transition-all duration-300 hover:border-amber-500/40 hover:bg-slate-100/30 hover:-translate-y-0.5">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start gap-3.5">
                <div className="bg-amber-500/10 p-2.5 rounded-xl text-xl shrink-0"><span>💰</span></div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-[#0B3A6E] transition-colors">Carteras de Inversión</h2>
                  <p className="mt-1 text-[11px] text-slate-500 font-medium leading-normal">Seguimiento en tiempo real de portafolios modelo y tesis estratégicas activas.</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Tarjeta 4: Calculadora */}
          <Link href="/formacion/calculadora" className="group block bg-slate-50 rounded-2xl p-4.5 border border-slate-200/80 shadow-sm transition-all duration-300 hover:border-violet-500/40 hover:bg-slate-100/30 hover:-translate-y-0.5">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start gap-3.5">
                <div className="bg-violet-500/10 p-2.5 rounded-xl text-xl shrink-0"><span>📊</span></div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-[#0B3A6E] transition-colors">Calculadora Estratégica</h2>
                  <p className="mt-1 text-[11px] text-slate-500 font-medium leading-normal">Simula tus objetivos de interés compuesto y proyecta tu patrimonio futuro.</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Tarjeta 5: Perfilador */}
          <Link href="/formacion/survey_economy" className="group block bg-slate-50 rounded-2xl p-4.5 border border-slate-200/80 shadow-sm transition-all duration-300 hover:border-fuchsia-500/40 hover:bg-slate-100/30 hover:-translate-y-0.5">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start gap-3.5">
                <div className="bg-fuchsia-500/10 p-2.5 rounded-xl text-xl shrink-0"><span>🎯</span></div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-[#0B3A6E] transition-colors">Perfilador de Riesgo</h2>
                  <p className="mt-1 text-[11px] text-slate-500 font-medium leading-normal">Auditoría y encuesta económica para descubrir tu perfil de inversor ideal.</p>
                </div>
              </div>
            </div>
          </Link>

        </section>
      </div>
    </main>
  );
}
