export default function ChatPage() {

  return (

    <main className="max-w-4xl mx-auto">

 

      <section className="bg-[#0B3A6E] rounded-3xl p-8">

 

        <h1 className="text-3xl font-black text-white">

          💬 Assistant

        </h1>

 

        <p className="mt-3 text-white/80">

          Tu dinero necesita dirección,

          no más esfuerzo.

        </p>

 

      </section>

 

      <section className="grid gap-3 mt-6">

 

        <button className="bg-[#111827] text-white p-4 rounded-2xl text-left">

          Analiza mis gastos

        </button>

 

        <button className="bg-[#111827] text-white p-4 rounded-2xl text-left">

          Resume mi situación

        </button>

 

        <button className="bg-[#111827] text-white p-4 rounded-2xl text-left">

          Detecta desvíos

        </button>

 

        <button className="bg-[#111827] text-white p-4 rounded-2xl text-left">

          Construye mi ruta

        </button>

 

      </section>

 

      <section className="mt-6 space-y-4">

 

        <div className="bg-white rounded-3xl p-5 shadow-sm">

          <p className="font-bold text-[#0B3A6E]">

            MoneyMap

          </p>

 

          <p className="mt-2 text-slate-600">

            Hola David. ¿Qué aspecto de tu situación

            financiera te gustaría revisar hoy? 

          </p>

        </div>

 

      </section>

 

      <section className="mt-6">

 

        <div className="flex gap-3">

 

          <input

            type="text"

            placeholder="Escribe tu consulta..."

            className="

              flex-1

              rounded-2xl

              border

              px-4

              py-4

            "

          />

 

          <button
            className="

              bg-[#1FA187]

              text-white

              px-6

              rounded-2xl

              font-bold

            "
            
          >

            Enviar

          </button>

 

        </div>

 

      </section>

 

    </main>

  );

}