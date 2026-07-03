export default function PerfilPage() {

  return (

    <main className="max-w-md mx-auto px-5 py-4">

 

      {/* PERFIL */}

 

      <section className="bg-[#111827] rounded-3xl p-4 shadow-xl">

 

        <div className="flex items-center gap-4">

 

          <div

            className="

              w-14

              h-14

              rounded-full

              bg-[#0B3A6E]

              flex

              items-center

              justify-center

              text-lg

              font-bold

            "

          >

            DT

          </div>

 

          <div>

            <h1 className="text-xl font-black text-white">

              David Tarín

            </h1>

 

            <p className="text-[#1FA187] text-sm font-medium">

              MoneyMap Premium

            </p>

          </div>

 

        </div>

 

      </section>

 

      {/* DATOS PERSONALES */}

 

      <section className="bg-[#111827] rounded-3xl p-4 mt-4 shadow-xl">

 

        <h2 className="text-sm font-bold text-[#1FA187] uppercase">

          Datos personales

        </h2>

 

        <div className="mt-4 space-y-3">

 

          <div>

            <p className="text-white/50 text-xs">

              Email

            </p>

 

            <p className="text-white">

              david@email.com

            </p>

          </div>

 

          <div>

            <p className="text-white/50 text-xs">

              Teléfono

            </p>

 

            <p className="text-white">

              +34 600 000 000

            </p>

          </div>

 

        </div>

 

      </section>

 

      {/* ACTIVIDAD */}

 

      <section className="bg-[#111827] rounded-3xl p-4 mt-4 shadow-xl">

 

        <h2 className="text-sm font-bold text-[#1FA187] uppercase">

          Actividad

        </h2>

 

        <div className="mt-4 space-y-3">

 

          <div className="flex justify-between">

            <span className="text-white/60">

              Último informe

            </span>

 

            <span className="text-white">

              Junio 2026

            </span>

          </div>

 

          <div className="flex justify-between">

            <span className="text-white/60">

              Próximo informe

            </span>

 

            <span className="text-white">

              01 Jul 2026

            </span>

          </div>

 

          <div className="flex justify-between">

            <span className="text-white/60">

              Ruta activa

            </span>

 

            <span className="text-white">

              Emergencia

            </span>

          </div>

 

        </div>

 

      </section>

 

      {/* SUSCRIPCIÓN */}

 

      <section className="bg-[#111827] rounded-3xl p-4 mt-4 shadow-xl">

 

        <h2 className="text-sm font-bold text-[#1FA187] uppercase">

          Suscripción

        </h2>

 

        <div className="mt-4 flex justify-between items-center">

 

          <div>

            <p className="text-white">

              MoneyMap Premium

            </p>

 

            <p className="text-xs text-white/50 mt-1">

              Próxima renovación

            </p>

          </div>

 

          <span className="font-semibold text-white">

            01 Ago 2026

          </span>

 

        </div>

 

      </section>

 

      {/* CERRAR SESIÓN */}

 

      <button

        className="

          w-full

          mt-4

          bg-white

          border

          border-red-500/20

          rounded-3xl

          p-4

          text-red-300

          font-semibold

        "

      >

        Cerrar sesión

      </button>

 

    </main>

  );

}

 