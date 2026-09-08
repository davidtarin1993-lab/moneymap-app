"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LifeBuoy, HelpCircle, TrendingUp, GraduationCap } from "lucide-react";

interface Mensaje {
  id: string;
  cliente_id: string;
  remitente: "cliente" | "admin";
  contenido: string;
  created_at: string;
}

const SUGERENCIAS = [
  { texto: "Tengo una duda sobre cómo funciona la app", icono: HelpCircle },
  { texto: "Quiero consultar algo sobre mis finanzas", icono: TrendingUp },
  { texto: "Me gustaría una recomendación de formación", icono: GraduationCap },
  { texto: "Necesito ayuda con mi cuenta", icono: LifeBuoy },
];

function formatearFechaDivisor(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);

  const esMismoDia = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (esMismoDia(fecha, hoy)) return "Hoy";
  if (esMismoDia(fecha, ayer)) return "Ayer";

  return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
}

export default function ChatPage() {
  const router = useRouter();
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function iniciar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      setUserId(user.id);

      const { data: perfil } = await supabase.from("profiles").select("nombre").eq("id", user.id).single();
      setNombre(perfil?.nombre ?? "");

      const { data: historico } = await supabase
        .from("chat_mensajes").select("*").eq("cliente_id", user.id).order("created_at", { ascending: true });

      setMensajes(historico ?? []);
      setCargandoAuth(false);
    }
    iniciar();
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    const canal = supabase
      .channel(`chat-cliente-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_mensajes", filter: `cliente_id=eq.${userId}` },
        (payload) => setMensajes((prev) => [...prev, payload.new as Mensaje]))
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [userId]);

  useEffect(() => { finRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mensajes]);

  const enviarMensaje = async (contenido: string) => {
    if (!userId || !contenido.trim() || enviando) return;
    setEnviando(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email ?? "";

      const { error } = await supabase.from("chat_mensajes").insert({
        cliente_id: userId, remitente: "cliente", contenido: contenido.trim(),
      });
      if (error) throw error;

      setTexto("");

      fetch("/api/chat/notify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteNombre: nombre, clienteEmail: email, contenido: contenido.trim() }),
      }).catch((e) => console.error("Error al notificar por email:", e));
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    } finally {
      setEnviando(false);
    }
  };

  if (cargandoAuth) {
    return <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <p className="text-sm font-bold text-slate-500">Cargando soporte...</p>
    </div>;
  }

  const hayConversacion = mensajes.length > 0;

  return (
    <main className="max-w-4xl mx-auto w-full bg-white text-slate-800 px-3 py-5 font-sans pb-32 antialiased">

      <header className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl md:text-4xl" role="img" aria-label="Soporte">🛟</span>
          <h1 className="text-2xl md:text-3xl font-black text-[#0B3A6E] tracking-tight">Soporte</h1>
        </div>
        <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-xl font-medium leading-normal">
          Escríbenos si tienes cualquier duda sobre el funcionamiento de la app, quieres consultar algo
          sobre tus finanzas, o te gustaría que tratemos algún tema de formación. Tu asesor te responderá lo antes posible.
        </p>
      </header>

      {!hayConversacion && (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5">
          {SUGERENCIAS.map(({ texto: s, icono: Icono }) => (
            <button key={s} onClick={() => enviarMensaje(s)}
              className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 text-slate-700 p-3.5 rounded-2xl text-left text-xs font-bold transition-all duration-200 hover:border-[#0B3A6E] hover:bg-slate-100/50 active:scale-[0.99]">
              <div className="bg-[#0B3A6E]/10 p-1.5 rounded-lg shrink-0">
                <Icono size={14} className="text-[#0B3A6E]" />
              </div>
              <span className="leading-tight">{s}</span>
            </button>
          ))}
        </section>
      )}




      <section className="mt-5 space-y-1">
        {!hayConversacion && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <p className="font-black text-[11px] uppercase tracking-wider text-[#0B3A6E]">MoneyMap Soporte</p>
            <p className="mt-1.5 text-xs md:text-sm text-slate-700 font-medium leading-relaxed">
              Hola {nombre || "de nuevo"}. Cuéntanos qué necesitas: una duda sobre la app, una consulta financiera o un tema de formación que te interese.
            </p>
          </div>
        )}

        {mensajes.map((m, idx) => {
          const fechaActual = new Date(m.created_at).toDateString();
          const fechaAnterior = idx > 0 ? new Date(mensajes[idx - 1].created_at).toDateString() : null;
          const mostrarDivisor = fechaActual !== fechaAnterior;

          return (
            <div key={m.id}>
              {mostrarDivisor && (
                <div className="sticky top-9 z-10 flex justify-center py-2">
                  <span className="bg-slate-800/80 text-white text-[9.5px] font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
                    {formatearFechaDivisor(m.created_at)}
                  </span>
                </div>
              )}

              <div className={`rounded-2xl p-4 shadow-sm border mb-3 ${
                m.remitente === "admin" ? "bg-slate-50 border-slate-200/80" : "bg-[#0B3A6E]/5 border-[#0B3A6E]/10 ml-6"
              }`}>
                <p className={`font-black text-[11px] uppercase tracking-wider ${
                  m.remitente === "admin" ? "text-[#0B3A6E]" : "text-slate-500"
                }`}>
                  {m.remitente === "admin" ? "MoneyMap Soporte" : "Tú"}
                </p>
                <p className="mt-1.5 text-xs md:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                  {m.contenido}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={finRef} />
      </section>

      <section className="mt-5 sticky bottom-2">
        <form onSubmit={(e) => { e.preventDefault(); enviarMensaje(texto); }} className="flex gap-2.5">
          <input type="text" value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe tu consulta..."
            className="flex-1 rounded-2xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#0B3A6E] transition-all shadow-sm" />
          <button type="submit" disabled={enviando}
            className="bg-[#1FA187] text-white px-5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm hover:bg-[#1fa187]/90 active:scale-[0.97] transition-all disabled:opacity-60">
            Enviar
          </button>
        </form>
      </section>
    </main>
  );
}