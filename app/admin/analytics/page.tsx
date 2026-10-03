"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  BarChart3,
  ArrowLeft,
  Users,
  Wifi,
  Clock,
  Repeat,
  TrendingUp,
  Scale,
  MapPinned,
  Pill,
  Newspaper,
  LineChart as LineChartIcon,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface ConexionesPorClienteItem {
  clienteId: string;
  nombre: string;
  conexiones: number;
}

interface DatosResumen {
  totalClientes: number;
  conexionesUltimaSemana: number;
  conexionesUltimoMes: number;
  heatmap: Record<string, number>;
  visitasPorSeccion: Record<string, number>;
  conexionesPorCliente: ConexionesPorClienteItem[];
  frecuenciaMedia: number;
  duracionMediaMinutos: number | null;
  sesionesAnalizadas: number;
}

interface Cliente {
  id: string;
  email: string;
  nombre: string | null;
}

interface FiltroDiaHora {
  dia: number;
  hora: number;
}

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const COLORES_DIAS: Record<string, string> = {
  Dom: "#94A3B8",
  Lun: "#0B3A6E",
  Mar: "#1FA187",
  Mié: "#B45309",
  Jue: "#7C3AED",
  Vie: "#2563EB",
  Sáb: "#DC2626",
};

const SECCIONES_INFO: Record<string, { label: string; icono: React.ReactNode; color: string }> = {
  movimientos: { label: "Movimientos", icono: <TrendingUp size={12} />, color: "#0B3A6E" },
  fiscalidad: { label: "Fiscalidad", icono: <Scale size={12} />, color: "#B45309" },
  ruta: { label: "Ruta", icono: <MapPinned size={12} />, color: "#059669" },
  pildoras: { label: "Píldoras", icono: <Pill size={12} />, color: "#7C3AED" },
  noticias: { label: "Noticias", icono: <Newspaper size={12} />, color: "#2563EB" },
  cartera: { label: "Cartera", icono: <LineChartIcon size={12} />, color: "#0891B2" },
};

function generarOpcionesMeses(): { valor: string; label: string }[] {
  const opciones = [];
  const hoy = new Date();
  for (let i = 0; i < 12; i++) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const valor = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    const label = fecha.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    opciones.push({ valor, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return opciones;
}

// Punto clicable de cada línea del gráfico día/hora: al pulsar, filtra el resto
// de la página a esa combinación exacta de día + hora.
function PuntoClicable(props: any) {
  const { cx, cy, dataKey, payload, stroke, onSeleccionar, filtroActivo } = props;
  if (cx === undefined || cy === undefined || !payload) return null;
  const horaNum = parseInt(String(payload.hora).replace("h", ""), 10);
  const diaIdx = DIAS.indexOf(dataKey);
  const esSeleccionado = !!filtroActivo && filtroActivo.dia === diaIdx && filtroActivo.hora === horaNum;

  function manejarClic() {
    if (diaIdx === -1 || Number.isNaN(horaNum)) return;
    onSeleccionar(diaIdx, horaNum);
  }

  return (
    <g style={{ cursor: "pointer" }} onClick={manejarClic}>
      {/* zona de clic ampliada (invisible) — el punto visible es demasiado pequeño para pulsarlo con precisión */}
      <circle cx={cx} cy={cy} r={11} fill="transparent" />
      <circle
        cx={cx}
        cy={cy}
        r={esSeleccionado ? 6 : 3.5}
        fill={stroke}
        stroke="white"
        strokeWidth={esSeleccionado ? 2 : 1}
      />
    </g>
  );
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [validando, setValidando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [datos, setDatos] = useState<DatosResumen | null>(null);
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("");

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("");
  const [filtroDiaHora, setFiltroDiaHora] = useState<FiltroDiaHora | null>(null);

  const opcionesMeses = generarOpcionesMeses();

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

  // Cargamos el listado de clientes una sola vez, para el selector.
  useEffect(() => {
    async function cargarClientes() {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const response = await fetch("/api/admin/analytics/clientes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      setClientes(data.clientes ?? []);
    }
    if (autorizado) cargarClientes();
  }, [autorizado]);

  // Al cambiar de cliente o de mes, el punto seleccionado del gráfico ya no es
  // fiable (podría no existir en el nuevo periodo), así que lo limpiamos.
  useEffect(() => {
    setFiltroDiaHora(null);
  }, [clienteSeleccionado, mesSeleccionado]);

  useEffect(() => {
    async function cargarDatos() {
      setCargandoDatos(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const params = new URLSearchParams();
      if (mesSeleccionado) params.set("mes", mesSeleccionado);
      if (clienteSeleccionado) params.set("clienteId", clienteSeleccionado);
      if (filtroDiaHora) {
        params.set("dia", String(filtroDiaHora.dia));
        params.set("hora", String(filtroDiaHora.hora));
      }

      const url = `/api/admin/analytics/resumen${params.toString() ? `?${params.toString()}` : ""}`;

      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setDatos(data);
      setCargandoDatos(false);
    }

    if (autorizado) cargarDatos();
  }, [autorizado, mesSeleccionado, clienteSeleccionado, filtroDiaHora]);

  if (validando) {
    return <div className="w-full min-h-screen bg-white flex items-center justify-center"><p className="text-sm font-bold text-slate-500">Validando acceso...</p></div>;
  }
  if (!autorizado) return null;

  const datosBarChart = datos
    ? Object.entries(datos.visitasPorSeccion).map(([key, valor]) => ({
        nombre: SECCIONES_INFO[key]?.label ?? key,
        visitas: valor,
      }))
    : [];

  // Transformamos el heatmap (clave "dia-hora") en series por hora, una línea por
  // día de la semana, para el gráfico de líneas.
  const datosLinea = datos
    ? Array.from({ length: 24 }, (_, hora) => {
        const punto: Record<string, number | string> = { hora: `${hora}h` };
        DIAS.forEach((dia, diaIdx) => {
          punto[dia] = datos.heatmap[`${diaIdx}-${hora}`] ?? 0;
        });
        return punto;
      })
    : [];

  function etiquetaCliente(c: Cliente): string {
    return c.nombre?.trim() || c.email;
  }

  const clientesFiltrados = clientes.filter((c) =>
    etiquetaCliente(c).toLowerCase().includes(busquedaCliente.toLowerCase())
  );

  const clienteSeleccionadoObj = clientes.find((c) => c.id === clienteSeleccionado);
  const nombreClienteSeleccionado = clienteSeleccionadoObj ? etiquetaCliente(clienteSeleccionadoObj) : "";

  function manejarSeleccionPunto(dia: number, hora: number) {
    setFiltroDiaHora((actual) =>
      actual && actual.dia === dia && actual.hora === hora ? null : { dia, hora }
    );
  }

  function quitarFiltros() {
    setClienteSeleccionado("");
    setBusquedaCliente("");
    setFiltroDiaHora(null);
  }

  return (
    <div className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 font-sans pb-32 antialiased">
      <header className="mb-5 border-b border-slate-100 pb-3">
        <Link href="/admin" className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-[#0B3A6E] mb-2">
          <ArrowLeft size={12} /> Volver al panel
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-black text-[#0B3A6E] tracking-tight uppercase flex items-center gap-2">
            <BarChart3 size={20} /> Analítica de Uso
          </h1>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-[#0B3A6E]"
            >
              <option value="">Últimos 30 días</option>
              {opcionesMeses.map((m) => (
                <option key={m.valor} value={m.valor}>{m.label}</option>
              ))}
            </select>

            <div className="flex flex-col gap-1">
              <input
                type="text"
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
                placeholder="Buscar cliente..."
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-[#0B3A6E] w-40"
              />
            </div>

            <select
              value={clienteSeleccionado}
              onChange={(e) => setClienteSeleccionado(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-[#0B3A6E] max-w-[200px]"
            >
              <option value="">Todos los clientes</option>
              {clientesFiltrados.map((c) => (
                <option key={c.id} value={c.id}>{etiquetaCliente(c)}</option>
              ))}
            </select>
          </div>
        </div>

        {(clienteSeleccionado || filtroDiaHora) && (
          <div className="flex items-center justify-between gap-2 bg-[#0B3A6E]/5 border border-[#0B3A6E]/15 rounded-xl px-3 py-2 mt-3">
            <p className="text-[10px] font-bold text-[#0B3A6E] flex items-center gap-1 flex-wrap">
              {clienteSeleccionado && (
                <span className="bg-[#0B3A6E] text-white rounded-full px-2 py-0.5">{nombreClienteSeleccionado}</span>
              )}
              {filtroDiaHora && (
                <span className="bg-[#1FA187] text-white rounded-full px-2 py-0.5">
                  {DIAS[filtroDiaHora.dia]} a las {filtroDiaHora.hora}h
                </span>
              )}
            </p>
            <button
              onClick={quitarFiltros}
              className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 hover:text-[#0B3A6E] shrink-0"
            >
              <X size={11} /> Quitar filtros
            </button>
          </div>
        )}
      </header>

      {cargandoDatos || !datos ? (
        <p className="text-sm font-bold text-slate-500">Cargando datos...</p>
      ) : (
        <div className="space-y-5">

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1"><Users size={12} /><span className="text-[8.5px] font-black uppercase">{clienteSeleccionado ? "Cliente" : "Clientes"}</span></div>
              <p className={`font-black text-[#0B3A6E] ${clienteSeleccionado ? "text-[12px] truncate" : "text-xl"}`}>
                {clienteSeleccionado ? nombreClienteSeleccionado : datos.totalClientes}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1"><Wifi size={12} /><span className="text-[8.5px] font-black uppercase">Últ. semana</span></div>
              <p className="text-xl font-black text-emerald-600">{datos.conexionesUltimaSemana}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1"><Wifi size={12} /><span className="text-[8.5px] font-black uppercase">Últ. mes</span></div>
              <p className="text-xl font-black text-blue-600">{datos.conexionesUltimoMes}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1"><Repeat size={12} /><span className="text-[8.5px] font-black uppercase">Frecuencia</span></div>
              <p className="text-xl font-black text-slate-800">{datos.frecuenciaMedia}<span className="text-[10px] font-bold text-slate-400"> /cliente</span></p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1"><Clock size={12} /><span className="text-[8.5px] font-black uppercase">Sesión media</span></div>
              <p className="text-xl font-black text-slate-800">
                {datos.duracionMediaMinutos !== null ? `${datos.duracionMediaMinutos} min` : "—"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* CONEXIONES POR CLIENTE — tabla */}
            <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-1">Conexiones por cliente</h2>
              <p className="text-[9px] text-slate-400 font-medium mb-3">Toca un cliente para filtrar por él.</p>
              <div className="max-h-56 overflow-y-auto pr-1 space-y-1">
                {datos.conexionesPorCliente.length === 0 && (
                  <p className="text-[10px] text-slate-400 font-medium">Sin datos en este periodo.</p>
                )}
                {datos.conexionesPorCliente.map((c) => {
                  const activo = c.clienteId === clienteSeleccionado;
                  return (
                    <button
                      key={c.clienteId}
                      onClick={() => setClienteSeleccionado(activo ? "" : c.clienteId)}
                      className={`w-full flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left transition-colors ${
                        activo ? "bg-[#0B3A6E] text-white" : "bg-white hover:bg-[#0B3A6E]/5 text-slate-700"
                      }`}
                    >
                      <span className="text-[10.5px] font-bold truncate">{c.nombre}</span>
                      <span className={`text-[10.5px] font-black shrink-0 ${activo ? "text-white" : "text-[#0B3A6E]"}`}>
                        {c.conexiones}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* CONEXIONES POR DÍA Y HORA — gráfico de líneas */}
            <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-1">Conexiones por día y hora</h2>
              <p className="text-[9px] text-slate-400 font-medium mb-3">Toca un punto para filtrar los indicadores y el gráfico de la derecha.</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datosLinea} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="hora" tick={{ fontSize: 9, fontWeight: 700 }} interval={2} />
                    <YAxis tick={{ fontSize: 9, fontWeight: 700 }} allowDecimals={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                    {DIAS.map((dia) => (
                      <Line
                        key={dia}
                        type="monotone"
                        dataKey={dia}
                        stroke={COLORES_DIAS[dia]}
                        strokeWidth={1.75}
                        dot={(props) => (
                          <PuntoClicable
                            key={`${dia}-${props.payload?.hora}`}
                            {...props}
                            onSeleccionar={manejarSeleccionPunto}
                            filtroActivo={filtroDiaHora}
                          />
                        )}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[9px] text-slate-400 font-medium mt-2">
                {datos.sesionesAnalizadas} sesiones analizadas en el periodo seleccionado.
              </p>
            </section>

            {/* VISITAS POR SECCIÓN */}
            <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-3">Visitas por sección</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosBarChart} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="nombre" type="category" width={80} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip />
                    <Bar dataKey="visitas" fill="#0B3A6E" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                {Object.entries(datos.visitasPorSeccion).map(([key, valor]) => (
                  <div key={key} className="bg-white border border-slate-200 rounded-xl p-2 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1" style={{ color: SECCIONES_INFO[key]?.color }}>
                      {SECCIONES_INFO[key]?.icono}
                    </div>
                    <p className="text-sm font-black text-slate-800">{valor}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase">{SECCIONES_INFO[key]?.label}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
