"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Users, Sparkles, Target, Home, Mail, TrendingUp, LineChart, Trash2, Send } from "lucide-react";

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
  const [procesando, setProcesando] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

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

  const cargarLeads = async () => {
    const token = await obtenerToken();
    if (!token) return;
    const response = await fetch("/api/admin/leads/list", { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    setLeads(data.leads ?? []);
  };

  useEffect(() => {
    if (autorizado) cargarLeads();
  }, [autorizado]);

  useEffect(() => {
    if (!mensajeExito) return;
    const t = setTimeout(() => setMensajeExito(null), 3000);
    return () => clearTimeout(t);
  }, [mensajeExito]);

  const eliminarLead = async (lead: Lead) => {
    if (!confirm(`¿Eliminar el lead de ${lead.email}? Esta acción no se puede deshacer.`)) return;

    setProcesando(lead.id);
    try {
      const token = await obtenerToken();
      if (!token) return;
      const response = await fetch("/api/admin/leads/eliminar", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leadId: lead.id }),
      });
      if (!response.ok) throw new Error("No se pudo eliminar.");
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
      setMensajeExito("Lead eliminado.");
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el lead.");
    } finally {
      setProcesando(null);
    }
  };

  const enviarSeguimiento = async (lead: Lead) => {
    if (!confirm(`¿Enviar email comercial de MoneyMap a ${lead.email}?`)) return;

    setProcesando(lead.id);
    try {
      const token = await obtenerToken();
      if (!token) return;
      const response = await fetch("/api/admin/leads/enviar-seguimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: lead.email, nombre: lead.nombre }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo enviar.");
      setMensajeExito(`Email enviado a ${lead.email}.`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "No se pudo enviar el email.");
    } finally {
      setProcesando(null);
    }
  };

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
        <p className="text-slate-500 text-xs mt-0.5">Emails capturados desde las herramientas públicas (Quiz, Perfilador, Simulador de hipoteca, Análisis de gastos, Proyección).</p>
      </header>

      {mensajeExito && (
        <div className="mb-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl px-3 py-2">
          {mensajeExito}
        </div>
      )}

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
            const ocupado = procesando === lead.id;
            return (
              <div key={lead.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${info?.color ?? "bg-slate-100 text-slate-500"}`}>
                  <Icono size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-800 truncate">{lead.email}</p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {lead.nombre ? `${lead.nombre} · ` : ""}{info?.label ?? lead.origen}
                    {lead.utm_source ? ` · ${lead.utm_source}` : ""}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0 hidden sm:block">{formatearFecha(lead.created_at)}</span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => enviarSeguimiento(lead)}
                    disabled={ocupado}
                    title="Enviar email comercial"
                    className="p-2 rounded-lg bg-[#1FA187]/10 text-[#1FA187] hover:bg-[#1FA187]/20 disabled:opacity-50 transition-all"
                  >
                    <Send size={13} />
                  </button>
                  <button
                    onClick={() => eliminarLead(lead)}
                    disabled={ocupado}
                    title="Eliminar lead"
                    className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-50 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}