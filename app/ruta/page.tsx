export default function RutaPage() {

  return (

    <main className="max-w-md mx-auto px-5 py-4">

 

 

      {/* OBJETIVO ACTUAL */}

 

      <section className="bg-[#0B3A6E] rounded-3xl p-6 mt-4 shadow-xl">

         <p className="text-[#1FA187] text-sm font-semibold uppercase">

          Mi Ruta

        </p>


        <p className="text-white/70 text-sm">

          Objetivo principal

        </p>

 

        <h2 className="text-2xl font-bold text-white mt-2">

          Fondo de emergencia

        </h2>

 

        <p className="text-white/70 mt-3">

          Objetivo: 5.000 €

        </p>

 

        <p className="text-white/70">

          Situación actual: 3.000 €

        </p>

 

      </section>

 

      {/* PROGRESO */}

 

      <section className="bg-[#111827] rounded-3xl p-6 mt-4 shadow-xl">

 

        <div className="flex justify-between items-center">

 

          <h3 className="font-bold text-white">

            Progreso

          </h3>

 

          <span className="text-[#1FA187] font-bold">

            60%

          </span>

 

        </div>

 

        <div className="mt-4 h-4 bg-white/10 rounded-full overflow-hidden">

 

          <div

            className="h-full bg-[#1FA187] rounded-full"

            style={{ width: "60%" }}

          />

 

        </div>

 

      </section>

 

      {/* SIGUIENTE ACCIÓN */}

 

      <section className="bg-[#111827] rounded-3xl p-6 mt-4 shadow-xl">

 

        <h3 className="font-bold text-[#1FA187]">

          Próxima acción

        </h3>

 

        <p className="mt-3 text-white leading-7">

          Destinar 250 € este mes al fondo de emergencia para acercarte al próximo hito.

        </p>

 

      </section>

 

      {/* HITOS */}

 

      <section className="bg-[#111827] rounded-3xl p-6 mt-4 shadow-xl">

 

        <h3 className="font-bold text-white mb-4">

          Hitos de la ruta

        </h3>

 

        <div className="space-y-3">

 

          <div className="flex items-center gap-3">

            <span className="text-[#1FA187]">✅</span>

            <span style={{ color: 'white' }}>Punto de partida completado</span>

          </div>

 

          <div className="flex items-center gap-3">

            <span className="text-[#1FA187]">✅</span>

            <span style={{ color: 'white' }}>Primer informe entregado</span>

          </div>

 

          <div className="flex items-center gap-3">

            <span className="text-white/40">⬜</span>

            <span style={{ color: 'white' }}>75% del objetivo alcanzado</span>

          </div>

 

          <div className="flex items-center gap-3">

            <span className="text-white/40">⬜</span>

            <span style={{ color: 'white' }}>Objetivo completado</span>

          </div>

 

        </div>

 

      </section>

 

    </main>

  );

}