export default function ChatPage() {
  return (
    /* 🛠️ ENTORNO CLARO: Fondo blanco puro, límites máximos controlados y tipografía en slate oscuro */
    <main className="max-w-4xl mx-auto w-full bg-white text-slate-800 px-3 py-5 font-sans pb-32 antialiased">

      {/* CABECERA: Transformada a un bloque claro de alta gama con sutil borde de marca */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-black text-[#0B3A6E] flex items-center gap-2">
          <span>💬</span> Assistant IA
        </h1>
        <p className="mt-2 text-slate-500 text-xs md:text-sm font-medium leading-normal max-w-xl">
          Tu dinero necesita dirección, no más esfuerzo. Conversa en tiempo real con el consultor inteligente de MoneyMap.
        </p>
      </section>

      {/* 🛠️ SUGERENCIAS RÁPIDAS: Eliminados los fondos oscuros (#111827) por cajas claras premium */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5">
        <button className="bg-slate-50 border border-slate-200 text-slate-700 p-3.5 rounded-2xl text-left text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:border-[#0B3A6E] hover:bg-slate-100/50 active:scale-[0.99]">
          Analiza mis gastos
        </button>

        <button className="bg-slate-50 border border-slate-200 text-slate-700 p-3.5 rounded-2xl text-left text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:border-[#0B3A6E] hover:bg-slate-100/50 active:scale-[0.99]">
          Resume mi situación
        </button>

        <button className="bg-slate-50 border border-slate-200 text-slate-700 p-3.5 rounded-2xl text-left text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:border-[#0B3A6E] hover:bg-slate-100/50 active:scale-[0.99]">
          Detecta desvíos
        </button>

        <button className="bg-slate-50 border border-slate-200 text-slate-700 p-3.5 rounded-2xl text-left text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:border-[#0B3A6E] hover:bg-slate-100/50 active:scale-[0.99]">
          Construye mi ruta
        </button>
      </section>
      {/* VENTANA DE CONVERSACIÓN / HISTORIAL */}
      <section className="mt-5 space-y-4">
        {/* Burbuja del asistente adaptada para destacar sobre el fondo blanco */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <p className="font-black text-[11px] uppercase tracking-wider text-[#0B3A6E]">
            MoneyMap Advisor
          </p>
          <p className="mt-1.5 text-xs md:text-sm text-slate-700 font-medium leading-relaxed">
            Hola David. ¿Qué aspecto de tu situación financiera te gustaría revisar hoy? Puedes pinchar una sugerencia o redactar tu consulta.
          </p>
        </div>
      </section>

      {/* CAJA DE TEXTO E INPUT CENTRAL DE ENVIAR */}
      <section className="mt-5">
        <div className="flex gap-2.5">
          <input
            type="text"
            placeholder="Escribe tu consulta patrimonial..."
            className="
              flex-1
              rounded-2xl
              border
              border-slate-200
              bg-white
              text-slate-800
              placeholder-slate-400
              px-4
              py-3
              text-xs
              font-medium
              focus:outline-none
              focus:border-[#0B3A6E]
              transition-all
            "
          />

          <button
            className="
              bg-[#1FA187]
              text-white
              px-5
              rounded-2xl
              text-xs
              font-black
              uppercase
              tracking-wider
              shadow-sm
              hover:bg-[#1fa187]/90
              active:scale-[0.97]
              transition-all
            "
          >
            Enviar
          </button>
        </div>
      </section>

    </main>
  );
}
