"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { GraduationCap, ArrowLeft, Pill, Newspaper, LineChart, Trophy, Clock } from "lucide-react";

interface ClienteResumen {
  clienteId: string;
  nombre: string;
  email: string;
  ultimaVisitaFormacion: string | null;
  totalVisitasFormacion: number;
  totalQuizzes: number;
}

interface Visita {
  seccion: string;
  created_at: string;
}

interface ResultadoQuiz {
  id: string;
  puntuacion_global: number;
  puntuaciones_categoria: { categoria: string; puntuacion: number }[];
  segundos_empleados: number | null;
  created_at: string;
}

const ICONOS_SECCION: Record<string, { icono: any; label: string; color: string }> = {
  pildoras: { icono: Pill, label: "Píldoras", color: "text-violet-600 bg-violet-500/10" },
  noticias: { icono: Newspaper, label: "Noticias", color: "text-blue-600 bg-blue-500/10" },
  cartera: { icono: LineChart, label: "Cartera", color: "text-cyan-600 bg-cyan-500/10" },
};

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminFormacionPage() {
  const router = useRouter();
  const [validando, setValidando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [clientes, setClientes] = useState<ClienteResumen[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteResumen | null>(null);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [quizzes, setQuizzes] = useState<ResultadoQuiz[]>([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

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

  useEffect(() => {
    async function cargarClientes() {
      const token = await obtenerToken();
      if (!token) return;
      const response = await fetch("/api/admin/formacion/list", { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setClientes(data.clientes ?? []);
    }
    if (autorizado) cargarClientes();
  }, [autorizado]);

  const abrirCliente = async (cliente: ClienteResumen) => {
    setClienteSeleccionado(cliente);
    setCargandoDetalle(true);
    const token = await obtenerToken();
    if (!token) return;
    const response = await fetch(`/api/admin/formacion/detalle?clienteId=${cliente.clienteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setVisitas(data.visitas ?? []);
    setQuizzes(data.quizzes ?? []);
    setCargandoDetalle(false);
  };

  if (validando) {
    return <div className="w-full min-h-screen bg-white flex items-center justify-center"><p className="text-sm font-bold text-slate-500">Validando acceso...</p></div>;
  }
  if (!autorizado) return null;

  return (
    <div className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 font-sans antialiased">
      <header className="mb-5 border-b border-slate-100 pb-3">
        <Link href="/admin" className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-[#0B3A6E] mb-2">
          <ArrowLeft size={12} /> Volver al panel
        </Link>
        <h1 className="text-xl font-black text-[#0B3A6E] tracking-tight uppercase flex items-center gap-2">
          <GraduationCap size={20} /> Actividad en Formación
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">Visitas a Píldoras, Noticias y Cartera, y resultados del Quiz financiero por cliente.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-3 md:col-span-1 max-h-[75vh] overflow-y-auto">
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2 px-1">Clientes ({clientes.length})</h2>
          <div className="space-y-1.5">
            {clientes.map((c) => (
              <button
                key={c.clienteId}
                onClick={() => abrirCliente(c)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                  clienteSeleccionado?.clienteId === c.clienteId ? "bg-[#0B3A6E] border-[#0B3A6E] text-white" : "bg-white border-slate-200 text-slate-700 hover:border-[#0B3A6E]/40"
                }`}
              >
                <p className="text-xs font-black truncate">{c.nombre}</p>
                <div className={`flex items-center gap-2 mt-0.5 text-[9.5px] ${clienteSeleccionado?.clienteId === c.clienteId ? "text-white/70" : "text-slate-400"}`}>
                  <span>{c.totalVisitasFormacion} visitas</span>
                  <span>·</span>
                  <span>{c.totalQuizzes} quiz</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:col-span-2 max-h-[75vh] overflow-y-auto">
          {!clienteSeleccionado ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold py-20">Selecciona un cliente.</div>
          ) : cargandoDetalle ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold py-20">Cargando...</div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="border-b border-slate-200 pb-2">
                <p className="text-xs font-black text-[#0B3A6E]">{clienteSeleccionado.nombre}</p>
                <p className="text-[10px] text-slate-400">{clienteSeleccionado.email}</p>
              </div>

              {/* QUIZZES */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Trophy size={12} /> Resultados del Quiz
                </h3>
                {quizzes.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">Este cliente aún no ha completado el quiz.</p>
                ) : (
                  <div className="space-y-2">
                    {quizzes.map((q) => (
                      <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-[#0B3A6E]">{q.puntuacion_global}/100</span>
                          <span className="text-[10px] text-slate-400 font-medium">{formatearFecha(q.created_at)}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {q.puntuaciones_categoria.map((cat) => (
                            <span key={cat.categoria} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {cat.categoria}: {cat.puntuacion}%
                            </span>
                          ))}
                        </div>
                        {q.segundos_empleados !== null && (
                          <p className="flex items-center gap-1 text-[9.5px] text-slate-400 mt-1.5">
                            <Clock size={10} /> {Math.floor(q.segundos_empleados / 60)}:{String(q.segundos_empleados % 60).padStart(2, "0")} empleados
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* VISITAS */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Historial de visitas</h3>
                {visitas.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">Sin visitas registradas a Píldoras, Noticias o Cartera.</p>
                ) : (
                  <div className="space-y-1.5">
                    {visitas.map((v, idx) => {
                      const info = ICONOS_SECCION[v.seccion];
                      const Icono = info?.icono;
                      return (
                        <div key={idx} className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg px-3 py-2">
                          <div className={`p-1.5 rounded-lg shrink-0 ${info?.color ?? "bg-slate-100 text-slate-500"}`}>
                            {Icono ? <Icono size={13} /> : null}
                          </div>
                          <span className="text-xs font-bold text-slate-700 flex-1">{info?.label ?? v.seccion}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{formatearFecha(v.created_at)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}