"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MapPinned, Plus, CalendarClock, CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ClienteResumen {
  clienteId: string;
  nombre: string;
  email: string;
  numRutas: number;
  ultimaRuta: { titulo: string; created_at: string } | null;
}

interface Hito {
  texto: string;
  hecho: boolean;
}

interface Ruta {
  id: string;
  titulo: string;
  descripcion: string | null;
  importe_objetivo: number | null;
  importe_actual: number | null;
  proxima_accion: string | null;
  hitos: Hito[];
  created_at: string;
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AdminRutasPage() {
  const router = useRouter();
  const [validando, setValidando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  const [clientes, setClientes] = useState<ClienteResumen[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteResumen | null>(null);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [importeObjetivo, setImporteObjetivo] = useState("");
  const [importeActual, setImporteActual] = useState("");
  const [proximaAccion, setProximaAccion] = useState("");
  const [hitosTexto, setHitosTexto] = useState("");

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

  const cargarClientes = async () => {
    const token = await obtenerToken();
    if (!token) return;

    const response = await fetch("/api/admin/rutas/list", { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    setClientes(data.clientes ?? []);
  };

  useEffect(() => { if (autorizado) cargarClientes(); }, [autorizado]);

  const abrirCliente = async (cliente: ClienteResumen) => {
    setClienteSeleccionado(cliente);
    setMostrarFormulario(false);
    setMensaje(null);
    setCargandoDetalle(true);

    const token = await obtenerToken();
    if (!token) return;

    const response = await fetch(`/api/admin/rutas/detalle?clienteId=${cliente.clienteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    setRutas(data.rutas ?? []);
    setCargandoDetalle(false);
  };

  const limpiarFormulario = () => {
    setTitulo("");
    setDescripcion("");
    setImporteObjetivo("");
    setImporteActual("");
    setProximaAccion("");
    setHitosTexto("");
  };

  const handleCrearRuta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSeleccionado || !titulo.trim()) return;

    setGuardando(true);
    setMensaje(null);

    try {
      const token = await obtenerToken();
      if (!token) return;

      const response = await fetch("/api/admin/rutas/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clienteId: clienteSeleccionado.clienteId,
          titulo,
          descripcion,
          importeObjetivo,
          importeActual,
          proximaAccion,
          hitosTexto,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo crear la ruta.");
      }

      setMensaje({ tipo: "exito", texto: "Ruta creada correctamente." });
      limpiarFormulario();
      setMostrarFormulario(false);
      await abrirCliente(clienteSeleccionado);
      await cargarClientes();
    } catch (err: any) {
      setMensaje({ tipo: "error", texto: err.message || "Error al crear la ruta." });
    } finally {
      setGuardando(false);
    }
  };

  if (validando) {
    return <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <p className="text-sm font-bold text-slate-500">Validando acceso...</p>
    </div>;
  }
  if (!autorizado) return null;

  return (
    <div className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 font-sans pb-32 antialiased">
      <header className="mb-5 border-b border-slate-100 pb-3">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-[#0B3A6E] mb-2"
        >
          <ArrowLeft size={12} /> Volver al panel
        </Link>
        <h1 className="text-xl font-black text-[#0B3A6E] tracking-tight uppercase flex items-center gap-2">
          <MapPinned size={20} /> Rutas de Clientes
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Crea y revisa las rutas/estrategias trazadas para cada cliente.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-3 md:col-span-1 max-h-[75vh] overflow-y-auto">
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2 px-1">
            Clientes ({clientes.length})
          </h2>

          <div className="space-y-1.5">
            {clientes.map((c) => (
              <button
                key={c.clienteId}
                onClick={() => abrirCliente(c)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                  clienteSeleccionado?.clienteId === c.clienteId
                    ? "bg-[#0B3A6E] border-[#0B3A6E] text-white"
                    : "bg-white border-slate-200 text-slate-700 hover:border-[#0B3A6E]/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black truncate">{c.nombre}</p>
                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                    clienteSeleccionado?.clienteId === c.clienteId ? "bg-white/20 text-white" : "bg-[#0B3A6E]/10 text-[#0B3A6E]"
                  }`}>
                    {c.numRutas} {c.numRutas === 1 ? "ruta" : "rutas"}
                  </span>
                </div>
                <p className={`text-[10px] truncate mt-0.5 ${clienteSeleccionado?.clienteId === c.clienteId ? "text-white/70" : "text-slate-400"}`}>
                  {c.ultimaRuta ? `Última: ${c.ultimaRuta.titulo}` : "Sin ruta creada"}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:col-span-2 max-h-[75vh] overflow-y-auto">
          {!clienteSeleccionado ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold py-20">
              Selecciona un cliente para ver o crear sus rutas.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <p className="text-xs font-black text-[#0B3A6E]">{clienteSeleccionado.nombre}</p>
                  <p className="text-[10px] text-slate-400">{clienteSeleccionado.email}</p>
                </div>
                <button
                  onClick={() => setMostrarFormulario(!mostrarFormulario)}
                  className="flex items-center gap-1 text-[10px] font-black uppercase bg-[#0B3A6E] text-white px-3 py-1.5 rounded-xl hover:bg-[#11498a]"
                >
                  <Plus size={12} /> Nueva ruta
                </button>
              </div>

              {mensaje && (
                <div className={`text-[11px] font-bold rounded-xl p-2.5 ${
                  mensaje.tipo === "exito" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}>
                  {mensaje.texto}
                </div>
              )}

              {mostrarFormulario && (
                <form onSubmit={handleCrearRuta} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Título *</label>
                    <input
                      type="text"
                      required
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Fondo de emergencia"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#0B3A6E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Descripción</label>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      rows={2}
                      placeholder="Un colchón de seguridad para..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#0B3A6E] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Importe objetivo (€)</label>
                      <input
                        type="number"
                        value={importeObjetivo}
                        onChange={(e) => setImporteObjetivo(e.target.value)}
                        placeholder="5000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#0B3A6E]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Importe actual (€)</label>
                      <input
                        type="number"
                        value={importeActual}
                        onChange={(e) => setImporteActual(e.target.value)}
                        placeholder="3000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#0B3A6E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Próxima acción</label>
                    <input
                      type="text"
                      value={proximaAccion}
                      onChange={(e) => setProximaAccion(e.target.value)}
                      placeholder="Destinar 250€ este mes al fondo de emergencia..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#0B3A6E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">
                      Hitos (uno por línea — empieza con [x] si ya está completado)
                    </label>
                    <textarea
                      value={hitosTexto}
                      onChange={(e) => setHitosTexto(e.target.value)}
                      rows={4}
                      placeholder={"[x] Punto de partida completado\n[x] Primer informe entregado\n[ ] 75% del objetivo alcanzado\n[ ] Objetivo completado"}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#0B3A6E] resize-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={guardando}
                    className="w-full bg-[#1FA187] hover:bg-[#198771] text-white text-xs font-black uppercase tracking-wider py-2 rounded-xl disabled:opacity-50"
                  >
                    {guardando ? "Guardando..." : "Crear ruta"}
                  </button>
                </form>
              )}

              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                  Historial de rutas
                </p>

                {cargandoDetalle ? (
                  <p className="text-[11px] text-slate-400 italic">Cargando...</p>
                ) : rutas.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">Este cliente aún no tiene ninguna ruta creada.</p>
                ) : (
                  rutas.map((ruta) => {
                    const objetivo = ruta.importe_objetivo ?? 0;
                    const actual = ruta.importe_actual ?? 0;
                    const progreso = objetivo > 0 ? Math.round((actual / objetivo) * 100) : 0;

                    return (
                      <div key={ruta.id} className="bg-white border border-slate-200 rounded-xl p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-black text-slate-800">{ruta.titulo}</p>
                          <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                            <CalendarClock size={10} /> {formatearFecha(ruta.created_at)}
                          </span>
                        </div>

                        {objetivo > 0 && (
                          <p className="text-[10px] text-slate-500 mt-1">
                            {actual.toLocaleString("es-ES")}€ de {objetivo.toLocaleString("es-ES")}€ ({progreso}%)
                          </p>
                        )}

                        {ruta.hitos && ruta.hitos.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {ruta.hitos.map((h, idx) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                {h.hecho ? (
                                  <CheckCircle2 size={11} className="text-[#1FA187] shrink-0" />
                                ) : (
                                  <Circle size={11} className="text-slate-300 shrink-0" />
                                )}
                                <span className={`text-[10px] ${h.hecho ? "text-slate-700" : "text-slate-400"}`}>{h.texto}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}