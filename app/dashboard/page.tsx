import Link from "next/link";

export default function DashboardSelectorPage() {
  return (
    <main className="w-full h-screen bg-white text-slate-800 px-4 py-6 md:py-10 overflow-hidden antialiased">
      <div className="max-w-4xl mx-auto w-full space-y-8">

        {/* CABECERA */}
        <header className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl" role="img" aria-label="MoneyMap Analytics">🎯</span>
            <h1 className="text-2xl md:text-3xl font-black text-[#0B3A6E] tracking-tight">
              MoneyMap Executive Analytics
            </h1>
          </div>
          <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-xl font-medium leading-normal">
            Bienvenido a tu suite de control patrimonial. Selecciona el módulo analítico para evaluar y optimizar tus posiciones financieras.
          </p>
        </header>

        {/* CONTENEDOR DE DOS COLUMNAS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-stretch">

          {/* Módulo 1: Análisis de Ingresos y Gastos */}
          <Link
            href="/dashboard/ingresos_gastos"
            className="group block bg-slate-50 rounded-2xl p-4.5 border border-slate-200/80 shadow-sm transition-all duration-300 hover:border-[#0B3A6E]/40 hover:bg-slate-100/30 hover:-translate-y-0.5"
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start gap-3.5">
                <div className="bg-[#0B3A6E]/10 p-2.5 rounded-xl text-xl shrink-0">
                  <span>📈</span>
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-[#0B3A6E] transition-colors">
                    Análisis de Ingresos y Gastos
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-500 font-medium leading-normal">
                    Mapeo inteligente de movimientos bancarios. Evalúa tu tasa estructural de ahorro, diagnostica ingresos fijos y neutraliza fugas de capital hormiga en tiempo real.
                  </p>
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[#0B3A6E] font-bold pt-3 group-hover:underline">
                Acceder
              </div>
            </div>
          </Link>

          {/* Módulo 2: Análisis de Fiscalidad / IRPF */}
          <Link
            href="/dashboard/fiscalidad"
            className="group block bg-slate-50 rounded-2xl p-4.5 border border-slate-200/80 shadow-sm transition-all duration-300 hover:border-[#0B3A6E]/40 hover:bg-slate-100/30 hover:-translate-y-0.5"
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start gap-3.5">
                <div className="bg-[#0B3A6E]/10 p-2.5 rounded-xl text-xl shrink-0">
                  <span>⚖️</span>
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-[#0B3A6E] transition-colors">
                    Optimización Fiscal e IRPF
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-500 font-medium leading-normal">
                    Auditoría impositiva proactiva. Simula el impacto de tus retenciones, calcula deducciones legales eficientes y maximiza tu rentabilidad neta frente al marco tributario.
                  </p>
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[#0B3A6E] font-bold pt-3 group-hover:underline">
                Acceder 
              </div>
            </div>
          </Link>

        </section>
      </div>
    </main>
  );
}
