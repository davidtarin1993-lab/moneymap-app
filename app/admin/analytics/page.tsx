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
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface DatosResumen {
  totalClientes: number;
  conexionesUltimaSemana: number;
  conexionesUltimoMes: number;
  heatmap: Record<string, number>;
  visitasPorSeccion: Record<string, number>;
  frecuenciaMedia: number;
  duracionMediaMinutos: number | null;
  sesionesAnalizadas: number;
}

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

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

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [validando, setValidando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [datos, setDatos] = useState<DatosResumen | null>(null);
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("");

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

  useEffect(() => {
    async function cargarDatos() {
      setCargandoDatos(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const url = mesSeleccionado
        ? `/api/admin/analytics/resumen?mes=${mesSeleccionado}`
        : `/api/admin/analytics/resumen`;

      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setDatos(data);
      setCargandoDatos(false);
    }

    if (autorizado) cargarDatos();
  }, [autorizado, mesSeleccionado]);

  if (validando) {
    return <div className="w-full min-h-screen bg-white flex items-center justify-center"><p className="text-sm font-bold text-slate-500">Validando acceso...</p></div>;
  }
  if (!autorizado) return null;

  const maxHeatmap = datos ? Math.max(1, ...Object.values(datos.heatmap)) : 1;

  const datosBarChart = datos
    ? Object.entries(datos.visitasPorSeccion).map(([key, valor]) => ({
        nombre: SECCIONES_INFO[key]?.label ?? key,
        visitas: valor,
      }))
    : [];

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
        </div>
      </header>

      {cargandoDatos || !datos ? (
        <p className="text-sm font-bold text-slate-500">Cargando datos...</p>
      ) : (
        <div className="space-y-5">

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1"><Users size={12} /><span className="text-[8.5px] font-black uppercase">Clientes</span></div>
              <p className="text-xl font-black text-[#0B3A6E]">{datos.totalClientes}</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* HEATMAP DÍA/HORA */}
            <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-3">Conexiones por día y hora</h2>
              <div className="overflow-x-auto">
                <div className="min-w-[560px]">
                  <div className="flex gap-[3px] pl-8 mb-1">
                    {Array.from({ length: 24 }, (_, h) => (
                      <div key={h} className="w-4 text-center text-[7px] text-slate-400 font-bold">{h % 3 === 0 ? h : ""}</div>
                    ))}
                  </div>
                  {DIAS.map((dia, diaIdx) => (
                    <div key={dia} className="flex items-center gap-[3px] mb-[3px]">
                      <div className="w-7 text-[8px] font-black text-slate-500 uppercase shrink-0">{dia}</div>
                      {Array.from({ length: 24 }, (_, hora) => {
                        const valor = datos.heatmap[`${diaIdx}-${hora}`] ?? 0;
                        const intensidad = valor / maxHeatmap;
                        return (
                          <div
                            key={hora}
                            title={`${dia} ${hora}:00 — ${valor} conexiones`}
                            className="w-4 h-4 rounded-sm"
                            style={{
                              backgroundColor: valor === 0 ? "#F1F5F9" : `rgba(11, 58, 110, ${0.15 + intensidad * 0.85})`,
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[9px] text-slate-400 font-medium mt-3">
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