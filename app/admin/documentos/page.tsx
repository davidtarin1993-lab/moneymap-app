"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, FileDown, Home, Sparkles, Target, LineChart, TrendingUp } from "lucide-react";

interface Documento {
  id: string;
  email_destinatario: string;
  nombre_destinatario: string | null;
  tipo_documento: string;
  asunto: string | null;
  created_at: string;
}

const INFO_TIPO: Record<string, { label: string; icono: any; color: string }> = {
  hipoteca: { label: "Simulación Hipoteca", icono: Home, color: "text-blue-600 bg-blue-500/10" },
  quiz: { label: "Quiz Financiero", icono: Sparkles, color: "text-emerald-600 bg-emerald-500/10" },
  perfil_inversor: { label: "Perfil Inversor", icono: Target, color: "text-fuchsia-600 bg-fuchsia-500/10" },
  proyeccion: { label: "Proyección Patrimonio", icono: LineChart, color: "text-violet-600 bg-violet-500/10" },
  analizador_gastos: { label: "Análisis de Gastos", icono: TrendingUp, color: "text-amber-600 bg-amber-500/10" },
};

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminDocumentosPage() {
  const router = useRouter();
  const [validando, setValidando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [documentos, setDocumentos] = useState<Documento[]>([]);

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
    async function cargarDocumentos() {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const response = await fetch("/api/admin/documentos/list", { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setDocumentos(data.documentos ?? []);
    }
    if (autorizado) cargarDocumentos();
  }, [autorizado]);

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
          <FileDown size={20} /> Documentos Enviados ({documentos.length})
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">Registro de PDFs enviados automáticamente desde las herramientas públicas.</p>
      </header>

      <div className="space-y-2">
        {documentos.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Aún no se ha enviado ningún documento.</p>
        ) : (
          documentos.map((doc) => {
            const info = INFO_TIPO[doc.tipo_documento];
            const Icono = info?.icono ?? FileDown;
            return (
              <div key={doc.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${info?.color ?? "bg-slate-100 text-slate-500"}`}>
                  <Icono size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-800 truncate">{doc.email_destinatario}</p>
                  <p className="text-[10px] text-slate-400">
                    {doc.nombre_destinatario ? `${doc.nombre_destinatario} · ` : ""}{info?.label ?? doc.tipo_documento}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">{formatearFecha(doc.created_at)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}