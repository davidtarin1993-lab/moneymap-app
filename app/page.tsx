import Image from "next/image";

import Link from "next/link";

 

export default function HomePage() {

  return (

    <main className="max-w-7xl mx-auto">

 

      {/* HERO PRINCIPAL */}

 

      <section

  className="

    relative

    bg-white

    rounded-3xl

    overflow-hidden

    shadow-[0_25px_60px_rgba(0,0,0,0.12)]

  "

> 

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

        financiera y continúa avanzando en tu ruta.

      </p>

 

      <div className="mt-6 flex flex-wrap gap-3">

 

        <Link

          href="/dashboard"

          className="

            bg-[#0B3A6E]

            text-white

            px-5

            py-3

            rounded-2xl

            font-bold

            hover:opacity-90

            transition

          "

        >

          Ver Mi MoneyMap

        </Link>

 

        <Link

          href="/chat"

          className="

            border

            border-[#0B3A6E]/20

            text-[#0B3A6E]

            px-5

            py-3

            rounded-2xl

            font-bold

            hover:bg-slate-50

            transition

          "

        >

          Abrir Chat

        </Link>

 

      </div>

 

    </div>

 

    {/* IMAGEN */}

 

    <div className="relative flex items-center justify-center h-full min-h-[280px]">

 

      <Image

        src="/Multimedia/Pagina_inicial.png"

        alt="MoneyMap"

        width={500}

        height={500}

        priority

        className="

          object-contain

          max-h-[1000px]

          w-auto

          opacity-95

        "

      />

 

    </div>

 

  </div>

</section>

 
 

      {/* TARJETAS CLIENTE */}

 

      <section className="grid md:grid-cols-3 gap-4 mt-6">

 

        <div className="bg-[#0B3A6E] rounded-3xl p-6 shadow-lg">

 

          <p className="text-white/70 text-sm">

            Último informe disponible

          </p>

 

          <h3 className="text-2xl font-bold text-white mt-2">

            Junio 2026

          </h3>

 

        </div>

 

        <div className="bg-[#0B3A6E] rounded-3xl p-6 shadow-lg">

 

          <p className="text-white/70 text-sm">

            Próximo informe

          </p>

 

          <h3 className="text-2xl font-bold text-white mt-2">

            01 Julio 2026

          </h3>

 

        </div>

 

        <div className="bg-[#0B3A6E] rounded-3xl p-6 shadow-lg">

 

          <p className="text-white/70 text-sm">

            Ruta activa

          </p>

 

          <h3 className="text-2xl font-bold text-white mt-2">

            Fondo de emergencia

          </h3>

 

        </div>

 

      </section>

 

      {/* MENSAJE */}

 

      <section

        className="

          mt-6

          bg-white

          rounded-3xl

          p-6

          shadow-[0_15px_40px_rgba(0,0,0,0.08)]

        "

      >

        <h3 className="text-xl font-bold text-[#0B3A6E]">

          Tu punto de partida

        </h3>

 

        <p className="mt-4 text-slate-600 leading-7">

          Tu último análisis ya está disponible.

          Continúa revisando tu evolución financiera para

          detectar posibles desvíos y tomar decisiones con

          mayor claridad.

        </p>

 

      </section>

 

    </main>

  );

}

 