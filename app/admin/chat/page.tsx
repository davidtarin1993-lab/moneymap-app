"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MessageCircle, Send } from "lucide-react";

interface Conversacion {
  clienteId: string;
  nombre: string;
  email: string;
  ultimoMensaje: string;
  ultimaFecha: string;
}

interface Mensaje {
  id: string;
  cliente_id: string;
  remitente: "cliente" | "admin";
  contenido: string;
  created_at: string;
}

export default function AdminChatPage() {
  const router = useRouter();
  const [validando, setValidando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [respuesta, setRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef<HTMLDivElement | null>(null);

  const obtenerToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  useEffect(() => {
    async function validarAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (!profile || profile.role !== "admin") { router.push("/bienvenida"); return; }

      setAutorizado(true);
      setValidando(false);
    }
    validarAdmin();
  }, [router]);

  const cargarConversaciones = async () => {
    const token = await obtenerToken();
    if (!token) return;
    const response = await fetch("/api/admin/chat/list", { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    setConversaciones(data.conversaciones ?? []);
  };

  useEffect(() => { if (autorizado) cargarConversaciones(); }, [autorizado]);

  useEffect(() => {
    if (!autorizado) return;
    const canal = supabase
      .channel("admin-chat-global")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_mensajes" }, () => cargarConversaciones())
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [autorizado]);

  useEffect(() => {
    if (!clienteSeleccionado) return;

    async function cargarMensajes() {
      const { data } = await supabase.from("chat_mensajes").select("*")
        .eq("cliente_id", clienteSeleccionado).order("created_at", { ascending: true });
      setMensajes(data ?? []);
    }
    cargarMensajes();

    const canal = supabase
      .channel(`admin-chat-${clienteSeleccionado}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_mensajes", filter: `cliente_id=eq.${clienteSeleccionado}` },
        (payload) => setMensajes((prev) => [...prev, payload.new as Mensaje]))
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [clienteSeleccionado]);

  useEffect(() => { finRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mensajes]);

  const enviarRespuesta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSeleccionado || !respuesta.trim() || enviando) return;
    setEnviando(true);
    try {
      const { error } = await supabase.from("chat_mensajes").insert({
        cliente_id: clienteSeleccionado, remitente: "admin", contenido: respuesta.trim(),
      });
      if (error) throw error;
      setRespuesta("");
    } catch (err) {
      console.error("Error al enviar respuesta:", err);
    } finally {
      setEnviando(false);
    }
  };

  if (validando) {
    return <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <p className="text-sm font-bold text-slate-500">Validando acceso...</p>
    </div>;
  }
  if (!autorizado) return null;

  const conversacionActiva = conversaciones.find((c) => c.clienteId === clienteSeleccionado);

  return (
    <div className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 font-sans pb-32 antialiased">
      <header className="mb-5 border-b border-slate-100 pb-3">
        <h1 className="text-xl font-black text-[#0B3A6E] tracking-tight uppercase flex items-center gap-2">
          <MessageCircle size={20} /> Chat con Clientes
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">Conversaciones en tiempo real con tus clientes.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-3 md:col-span-1 max-h-[70vh] overflow-y-auto">
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2 px-1">
            Conversaciones ({conversaciones.length})
          </h2>
          {conversaciones.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic px-1 py-4 text-center">Aún no hay mensajes de clientes.</p>
          ) : (
            <div className="space-y-1.5">
              {conversaciones.map((c) => (
                <button key={c.clienteId} onClick={() => setClienteSeleccionado(c.clienteId)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                    clienteSeleccionado === c.clienteId ? "bg-[#0B3A6E] border-[#0B3A6E] text-white" : "bg-white border-slate-200 text-slate-700 hover:border-[#0B3A6E]/40"
                  }`}>
                  <p className="text-xs font-black truncate">{c.nombre}</p>
                  <p className={`text-[10px] truncate mt-0.5 ${clienteSeleccionado === c.clienteId ? "text-white/70" : "text-slate-400"}`}>
                    {c.ultimoMensaje}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:col-span-2 flex flex-col h-[70vh]">
          {!clienteSeleccionado ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-bold">
              Selecciona una conversación para ver los mensajes.
            </div>
          ) : (
            <>
              <div className="border-b border-slate-200 pb-2 mb-3">
                <p className="text-xs font-black text-[#0B3A6E]">{conversacionActiva?.nombre}</p>
                <p className="text-[10px] text-slate-400">{conversacionActiva?.email}</p>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {mensajes.map((m) => (
                  <div key={m.id} className={`rounded-2xl p-3 shadow-sm border max-w-[80%] ${
                    m.remitente === "admin" ? "bg-[#0B3A6E]/5 border-[#0B3A6E]/10 ml-auto" : "bg-white border-slate-200"
                  }`}>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {m.remitente === "admin" ? "Tú (Admin)" : conversacionActiva?.nombre}
                    </p>
                    <p className="mt-1 text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{m.contenido}</p>
                  </div>
                ))}
                <div ref={finRef} />
              </div>
              <form onSubmit={enviarRespuesta} className="flex gap-2 mt-3">
                <input type="text" value={respuesta} onChange={(e) => setRespuesta(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="flex-1 rounded-2xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-[#0B3A6E]" />
                <button type="submit" disabled={enviando}
                  className="bg-[#1FA187] text-white px-4 rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm hover:bg-[#1fa187]/90 disabled:opacity-60">
                  <Send size={14} />
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}