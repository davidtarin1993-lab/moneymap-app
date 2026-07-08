import Link from "next/link";

export default function DashboardSelectorPage() {
  return (
    <main className="w-full h-screen bg-white text-gray-900 px-4 py-6 md:py-10 overflow-hidden antialiased">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* CABECERA EXECUTIVA */}
        <header className="border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl" role="img" aria-label="MoneyMap Analytics">🎯</span>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">MoneyMap Executive Analytics</h1>
          </div>
          <p className="mt-2 text-sm text-gray-500 max-w-xl">
            Bienvenido a tu suite de control patrimonial. Selecciona el módulo analítico para evaluar y optimizar tus posiciones financieras.
          </p>
        </header>

        {/* CONTENEDOR DE DOS COLUMNAS EQUILIBRADAS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
          
          {/* Módulo 1: Análisis de Ingresos y Gastos */}
          <Link 
            href="/dashboard/ingresos_gastos" 
            className="group block bg-[#111827] rounded-3xl p-6 shadow-sm border border-white/5 transition-all duration-300 hover:border-blue-500/40 hover:-translate-y-1 h-full"
          >
            <div className="flex flex-col h-full justify-between space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/10 p-3 rounded-2xl text-2xl flex items-center justify-center shrink-0">
                  📈
                </div>
                <div>
                  <h2 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    Auditoría de Flujo de Caja
                  </h2>
                  <p className="mt-2 text-xs text-white/60 leading-relaxed">
                    Mapeo inteligente de movimientos bancarios. Evalúa tu tasa estructural de ahorro, diagnostica ingresos fijos y neutraliza fugas de capital hormiga en tiempo real.
                  </p>
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold pt-2 group-hover:underline">
                Acceder al Analizador →
              </div>
            </div>
          </Link>

          {/* Módulo 2: Análisis de Fiscalidad / IRPF */}
          <Link 
            href="/dashboard/fiscalidad" 
            className="group block bg-[#111827] rounded-3xl p-6 shadow-sm border border-white/5 transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 h-full"
          >
            <div className="flex flex-col h-full justify-between space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-amber-500/10 p-3 rounded-2xl text-2xl flex items-center justify-center shrink-0">
                  ⚖️
                </div>
                <div>
                  <h2 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    Optimización Fiscal e IRPF
                  </h2>
                  <p className="mt-2 text-xs text-white/60 leading-relaxed">
                    Auditoría impositiva proactiva. Simula el impacto de tus retenciones, calcula deducciones legales eficientes y maximiza tu rentabilidad neta frente al marco tributario.
                  </p>
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold pt-2 group-hover:underline">
                Acceder al Planificador →
              </div>
            </div>
          </Link>

        </section>
      </div>
    </main>
  );
}
