import React from "react";

type NavItem = {
  title: string;
  subtitle: string;
  icon: string;
  primary?: boolean;
};

export default function Page() {
  const navItems: NavItem[] = [
    {
      title: "Mi MoneyMap",
      subtitle: "Cuadro de mando",
      icon: "📊",
      primary: true,
    },
    {
      title: "Informes",
      subtitle: "PDFs y análisis",
      icon: "📄",
    },
    {
      title: "Mi Ruta",
      subtitle: "Objetivos y foco",
      icon: "🧭",
    },
    {
      title: "Chat",
      subtitle: "Asistente MoneyMap",
      icon: "💬",
      primary: true,
    },
    {
      title: "Formación",
      subtitle: "Guías y cursos",
      icon: "📚",
    },
    {
      title: "Novedades",
      subtitle: "Avisos y noticias",
      icon: "📰",
    },
    {
      title: "Perfil",
      subtitle: "Datos y acceso",
      icon: "⚙️",
    },
  ];

  const quickActions: string[] = [
    "Analiza mis gastos",
    "Resúmeme mi situación",
    "Explícame este indicador",
    "Muéstrame mis desvíos",
  ];

  return (
    <main className="min-h-screen bg-[#020B14] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">
              Money<span className="text-[#1FA187]">Map</span>
            </h1>
            <p className="text-white/60">
              Tu dinero, con dirección
            </p>
          </div>

          <button className="rounded-2xl bg-[#1FA187] px-5 py-3 font-bold text-[#020B14]">
            Admin
          </button>
        </header>

        <section className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="inline-flex rounded-lg bg-[#1FA187] px-4 py-2 text-sm font-bold text-[#020B14]">
              Claridad. Orden. Dirección.
            </div>

            <h2 className="mt-6 text-5xl font-black uppercase md:text-7xl">
              Beta 0.1
              <span className="block text-[#1FA187]">
                por ti.
              </span>
            </h2>

            <p className="mt-6 text-lg text-white/70">
              Bienvenido a tu zona privada MoneyMap.
              Consulta tu cuadro de mando,
              descarga informes, accede a formación
              y conversa con tu asistente financiero.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="rounded-2xl bg-[#1FA187] px-6 py-4 font-bold text-[#020B14]">
                Ver Mi MoneyMap
              </button>

              <button className="rounded-2xl border border-white/20 px-6 py-4 font-bold">
                Abrir Chat
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#061725] p-8">
            <div className="mb-4 text-sm font-bold text-[#1FA187]">
              MAPA ACTUAL DEL DINERO
            </div>

            <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-[#1FA187]/40">
              <div className="text-center">
                <div className="text-6xl">🧭</div>
                <p className="mt-4 font-bold">
                  Tu ruta empieza aquí
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h3 className="text-3xl font-black uppercase">
            Accesos principales
          </h3>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-7">
            {navItems.map((item) => (
              <button
                key={item.title}
                className={`rounded-3xl border p-5 text-left transition ${
                  item.primary
                    ? "border-[#1FA187] bg-[#1FA187]/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="mb-4 text-3xl">
                  {item.icon}
                </div>

                <h4 className="font-black">
                  {item.title}
                </h4>

                <p className="mt-2 text-xs text-white/60">
                  {item.subtitle}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="font-bold text-[#1FA187]">
              Chat MoneyMap
            </p>

            <h3 className="mt-2 text-3xl font-black">
              ¿Qué necesitas revisar hoy?
            </h3>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  className="rounded-2xl border border-[#1FA187]/20 bg-[#1FA187]/10 p-3 text-left"
                >
                  {action}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <input
                type="text"
                placeholder="Escribe tu consulta..."
                className="flex-1 rounded-2xl bg-[#061725] px-4 py-3 outline-none"
              />

              <button className="rounded-2xl bg-[#1FA187] px-4 py-3 font-bold text-[#020B14]">
                Enviar
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-3xl font-black">
              Bienvenido a MoneyMap
            </h3>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Card
                title="Mi MoneyMap"
                text="Cuadro de mando financiero."
              />

              <Card
                title="Informes"
                text="Informes personalizados."
              />

              <Card
                title="Formación"
                text="Academia MoneyMap."
              />

              <Card
                title="Novedades"
                text="Noticias y avisos."
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-[#061725] p-4">
      <h4 className="font-bold text-[#1FA187]">
        {title}
      </h4>

      <p className="mt-2 text-sm text-white/60">
        {text}
      </p>
    </div>
  );
}