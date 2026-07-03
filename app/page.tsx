import Image from "next/image";
import Link from "next/link";
import { FileText, Calendar, Compass } from "lucide-react"; // Importamos iconos para enriquecer los datos

export default function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 pb-24 md:pb-6">

      {/* HERO PRINCIPAL */}
      <section className="relative bg-white rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.12)]"> 
        <div className="grid lg:grid-cols-2 items-center min-h-[340px]">
          {/* TEXTO */}
          <div className="relative z-20 p-6 md:p-8">
            <div className="inline-flex items-center rounded-full bg-[#1FA187]/10 px-4 py-2 text-sm font-medium text-[#1FA187] mb-4">
              👋 Bienvenido de nuevo
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#0B3A6E]">
              Hola David.
            </h1>
            <h2 className="mt-3 text-xl md:text-2xl font-bold text-[#1FA187]">
              Tu dinero, con dirección.
            </h2>
            <p className="mt-4 text-slate-600 text-base md:text-lg leading-7 max-w-xl">
              La claridad precede a las buenas decisiones.
              Consulta tu situación actual, revisa tu evolución
              financiera y continúa avanzando in tu ruta.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard" className="bg-[#0B3A6E] text-white px-5 py-3 rounded-2xl font-bold hover:opacity-90 transition">
                Ver Mi MoneyMap
              </Link>
              <Link href="/chat" className="border border-[#0B3A6E]/20 text-[#0B3A6E] px-5 py-3 rounded-2xl font-bold hover:bg-slate-50 transition">
                Abrir Chat
              </Link>
            </div>
          </div>

          {/* IMAGEN */}
          <div className="relative flex items-center justify-center h-full min-h-[280px]">
            <Image
              src="/Multimedia/Pagina_inicial.png"
              alt="MoneyMap"
              width={300}
              height={300}
              priority
              className="object-contain max-h-[1000px] w-auto opacity-95"
            />
          </div>
        </div>
      </section>

{/* CAJA UNIFICADA DE RESUMEN FINANCIERO (ESTILO COMPACTO VERTICAL MÓVIL) */}
<section className="bg-[#0B3A6E] rounded-2xl p-4 mt-4 shadow-xl text-white">
  
  {/* Cabecera compacta con doble título */}
  <div className="border-b border-white/10 pb-3 mb-3">
    <h3 className="text-xl font-black tracking-tight">
      Resumen de tu cuenta
    </h3>
    <p className="text-[#1FA187] text-xs font-bold mt-0.5 uppercase tracking-wider flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-[#1FA187] inline-block animate-pulse"></span>
      Estado de situación actual
    </p>
  </div>

  {/* Contenedor vertical compacto */}
  <div className="flex flex-col gap-3">
    
    {/* Indicador 1 */}
    <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl">
      <div className="p-2 bg-white/10 rounded-lg shrink-0">
        <FileText className="w-5 h-5 text-[#1FA187]" />
      </div>
      <div>
        <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider leading-none">Último informe disponible</p>
        <h4 className="text-base font-bold mt-0.5">Junio 2026</h4>
      </div>
    </div>

    {/* Indicador 2 */}
    <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl">
      <div className="p-2 bg-white/10 rounded-lg shrink-0">
        <Calendar className="w-5 h-5 text-[#1FA187]" />
      </div>
      <div>
        <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider leading-none">Próximo informe</p>
        <h4 className="text-base font-bold mt-0.5">01 Julio 2026</h4>
      </div>
    </div>

    {/* Indicador 3 */}
    <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl">
      <div className="p-2 bg-white/10 rounded-lg shrink-0">
        <Compass className="w-5 h-5 text-[#1FA187]" />
      </div>
      <div>
        <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider leading-none">Ruta activa</p>
        <h4 className="text-base font-bold mt-0.5">Fondo de emergencia</h4>
      </div>
    </div>

  </div>
</section>
    </main>
  );
}
