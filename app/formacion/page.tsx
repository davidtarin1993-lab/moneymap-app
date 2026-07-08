// app/formacion/page.tsx
import Link from "next/link";

export default function FormacionPage() {
  return (
    <main className="w-full h-screen bg-white text-gray-900 px-4 py-6 md:py-10 overflow-hidden antialiased">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        <header className="border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl" role="img" aria-label="Academia">🎓</span>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Academia</h1>
          </div>
          <p className="mt-2 text-sm text-gray-500 max-w-xl">
            Potencia tu inteligencia financiera. Selecciona una sección para acceder a nuestros contenidos exclusivos.
          </p>
        </header>

        {/* Ajustado a grid-cols-5 en escritorio para albergar el test de perfil */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-stretch">
          
          {/* Tarjeta 1: Noticias */}
          <Link href="/formacion/noticias" className="group block bg-[#111827] rounded-3xl p-5 shadow-sm border border-white/5 transition-all duration-300 hover:border-blue-500/40 hover:-translate-y-1 h-full">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/10 p-2.5 rounded-xl text-xl">📰</div>
                <div>
                  <h2 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Noticias</h2>
                  <p className="mt-1 text-[11px] text-white/60 leading-normal">Análisis diario del mercado explicado de forma sencilla.</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Tarjeta 2: Píldoras */}
          <Link href="/formacion/pildoras" className="group block bg-[#111827] rounded-3xl p-5 shadow-sm border border-white/5 transition-all duration-300 hover:border-emerald-500/40 hover:-translate-y-1 h-full">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-emerald-500/10 p-2.5 rounded-xl text-xl">💊</div>
                <div>
                  <h2 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Píldoras</h2>
                  <p className="mt-1 text-[11px] text-white/60 leading-normal">Lecciones express de 3 minutos con conceptos clave.</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Tarjeta 3: Cartera */}
          <Link href="/formacion/cartera_moneymap" className="group block bg-[#111827] rounded-3xl p-5 shadow-sm border border-white/5 transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 h-full">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-amber-500/10 p-2.5 rounded-xl text-xl">💰</div>
                <div>
                  <h2 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Cartera</h2>
                  <p className="mt-1 text-[11px] text-white/60 leading-normal">Seguimiento de portafolios y tesis de inversión en vivo.</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Tarjeta 4: Calculadora de Interés Compuesto */}
          <Link href="/formacion/calculadora" className="group block bg-[#111827] rounded-3xl p-5 shadow-sm border border-white/5 transition-all duration-300 hover:border-violet-500/40 hover:-translate-y-1 h-full">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-violet-500/10 p-2.5 rounded-xl text-xl">📊</div>
                <div>
                  <h2 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">Calculadora</h2>
                  <p className="mt-1 text-[11px] text-white/60 leading-normal">Simula tus objetivos y proyecta tu futuro financiero futuro.</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Tarjeta 5: Encuesta Económica / Perfil de Inversor */}
          <Link href="/formacion/survey_economy" className="group block bg-[#111827] rounded-3xl p-5 shadow-sm border border-white/5 transition-all duration-300 hover:border-fuchsia-500/40 hover:-translate-y-1 h-full">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-fuchsia-500/10 p-2.5 rounded-xl text-xl">🎯</div>
                <div>
                  <h2 className="text-sm font-bold text-white group-hover:text-fuchsia-400 transition-colors">Perfilador</h2>
                  <p className="mt-1 text-[11px] text-white/60 leading-normal">Encuesta económica para descubrir tu perfil de inversor ideal.</p>
                </div>
              </div>
            </div>
          </Link>

        </section>
      </div>
    </main>
  );
}
