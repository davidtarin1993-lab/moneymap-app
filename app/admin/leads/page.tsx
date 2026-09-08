"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Users, Sparkles, Target, Home, Mail, TrendingUp, LineChart } from "lucide-react";

interface Lead {
  id: string;
  email: string;
  nombre: string | null;
  origen: string;
  resultado_resumen: any;
  utm_source: string | null;
  created_at: string;
}

const INFO_ORIGEN: Record<string, { label: string; icono: any; color: string }> = {
  quiz: { label: "Quiz Financiero", icono: Sparkles, color: "text-emerald-600 bg-emerald-500/10" },
  perfil_inversor: { label: "Perfilador de Riesgo", icono: Target, color: "text-fuchsia-600 bg-fuchsia-500/10" },
  hipoteca: { label: "Simulador Hipoteca", icono: Home, color: "text-blue-600 bg-blue-500/10" },
  analizador_gastos: { label: "Análisis de Gastos", icono: TrendingUp, color: "text-amber-600 bg-amber-500/10" },
  proyeccion: { label: "Proyección Patrimonio", icono: LineChart, color: "text-violet-600 bg-violet-500/10" },
};

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminLeadsPage() {
  const router = useRouter();
  const [validando, setValidando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filtro, setFiltro] = useState<string>("todos");

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
    async function cargarLeads() {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const response = await fetch("/api/admin/leads/list", { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setLeads(data.leads ?? []);
    }
    if (autorizado) cargarLeads();
  }, [autorizado]);

  if (validando) {
    return <div className="w-full min-h-screen bg-white flex items-center justify-center"><p className="text-sm font-bold text-slate-500">Validando acceso...</p></div>;
  }
  if (!autorizado) return null;

  const leadsFiltrados = filtro === "todos" ? leads : leads.filter((l) => l.origen === filtro);

  return (
    <div className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 font-sans antialiased">
      <header className="mb-5 border-b border-slate-100 pb-3">
        <Link href="/admin" className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-[#0B3A6E] mb-2">
          <ArrowLeft size={12} /> Volver al panel
        </Link>
        <h1 className="text-xl font-black text-[#0B3A6E] tracking-tight uppercase flex items-center gap-2">
          <Users size={20} /> Leads captados ({leads.length})
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">Emails capturados desde las herramientas públicas (Quiz, Perfilador, Simulador de hipoteca).</p>
      </header>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["todos", "quiz", "perfil_inversor", "hipoteca", "analizador_gastos", "proyeccion"].map((f) => (
            <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
              filtro === f ? "bg-[#0B3A6E] text-white border-[#0B3A6E]" : "bg-white text-slate-500 border-slate-200"
            }`}
          >
            {f === "todos" ? "Todos" : INFO_ORIGEN[f]?.label ?? f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {leadsFiltrados.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No hay leads con este filtro todavía.</p>
        ) : (
          leadsFiltrados.map((lead) => {
            const info = INFO_ORIGEN[lead.origen];
            const Icono = info?.icono ?? Mail;
            return (
              <div key={lead.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${info?.color ?? "bg-slate-100 text-slate-500"}`}>
                  <Icono size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-800 truncate">{lead.email}</p>
                  <p className="text-[10px] text-slate-400">
                    {lead.nombre ? `${lead.nombre} · ` : ""}{info?.label ?? lead.origen}
                    {lead.utm_source ? ` · ${lead.utm_source}` : ""}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">{formatearFecha(lead.created_at)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}