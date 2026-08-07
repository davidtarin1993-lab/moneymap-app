"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FiscalidadClientDashboard from "./fiscal-client";
import registrosBackup from "./registros_fiscales_backup.json";
import { Upload } from "lucide-react";

export default function FiscalidadPage() {
  const router = useRouter();

  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [registros, setRegistros] = useState<any[]>([]);
  const [estadoExtracto, setEstadoExtracto] = useState<"procesando" | "completado" | "error" | "sin_datos">("sin_datos");
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);
  const [archivoNombre, setArchivoNombre] = useState<string | null>(null);
  const [verificacion, setVerificacion] = useState<string | null>(null);
  const [ejerciciosDetectados, setEjerciciosDetectados] = useState<number | null>(null);
  const [registrosDetectados, setRegistrosDetectados] = useState<number | null>(null);

  const cargarUltimoExtracto = async (uid: string) => {
    const { data } = await supabase
      .from("extractos_fiscales")
      .select("estado, registros_grafico, archivo_nombre, verificacion, ejercicios_detectados, registros_detectados")
      .eq("cliente_id", uid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.estado === "completado" && data.registros_grafico) {
      setRegistros(data.registros_grafico);
      setEstadoExtracto("completado");
      setArchivoNombre(data.archivo_nombre);
      setVerificacion(data.verificacion);
      setEjerciciosDetectados(data.ejercicios_detectados);
      setRegistrosDetectados(data.registros_detectados);
    } else if (data?.estado === "procesando") {
      setEstadoExtracto("procesando");
      setArchivoNombre(data.archivo_nombre);
    } else if (data?.estado === "error") {
      setEstadoExtracto("error");
      setRegistros(registrosBackup as any[]);
    } else {
      setRegistros(registrosBackup as any[]);
      setEstadoExtracto("sin_datos");
    }
  };

  useEffect(() => {
    async function iniciar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      await cargarUltimoExtracto(user.id);
      setCargandoAuth(false);
    }
    iniciar();
  }, [router]);

  const handleSubirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo || !userId) return;

    const extension = archivo.name.split(".").pop()?.toLowerCase();
    if (extension !== "pdf") {
      setErrorSubida("Solo se admiten declaraciones de la renta en PDF.");
      return;
    }

    setSubiendo(true);
    setErrorSubida(null);
    setEstadoExtracto("procesando");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { router.push("/login"); return; }

      const formData = new FormData();
      formData.append("archivo", archivo);

      const response = await fetch("/api/dashboard/extractos-fiscales/procesar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorSubida(data.error || "No se pudo procesar la declaración.");
        setEstadoExtracto("error");
        return;
      }

      setRegistros(data.registros ?? []);
      setEstadoExtracto("completado");
      setArchivoNombre(archivo.name);
      setVerificacion(data.verificacion);
      setEjerciciosDetectados(data.ejerciciosDetectados);
      setRegistrosDetectados(data.registrosDetectados);
    } catch (err) {
      console.error("Error al subir declaración:", err);
      setErrorSubida("Error de red al subir el archivo.");
      setEstadoExtracto("error");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  };

  if (cargandoAuth) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm font-bold text-slate-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <div className="max-w-4xl mx-auto px-3 pt-4">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center gap-2.5 justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-[#0B3A6E]/10 p-2 rounded-xl shrink-0">
              <Upload size={16} className="text-[#0B3A6E]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Sube tu declaración de la renta</p>
              <p className="text-[10px] text-slate-500 truncate">
                {estadoExtracto === "procesando" && "Analizando tu declaración con IA..."}
                {estadoExtracto === "completado" && archivoNombre && `Última analizada: ${archivoNombre}`}
                {estadoExtracto === "error" && "Hubo un error al procesar el último archivo."}
                {estadoExtracto === "sin_datos" && "Aún no has subido ninguna declaración (viendo datos de ejemplo)."}
              </p>
            </div>
          </div>

          <label className={`shrink-0 text-center text-[11px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
            subiendo ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-[#0B3A6E] text-white hover:bg-[#11498a]"
          }`}>
            {subiendo ? "Procesando..." : "Subir PDF"}
            <input
              type="file"
              accept=".pdf"
              onChange={handleSubirArchivo}
              disabled={subiendo}
              className="hidden"
            />
          </label>
        </div>

        {errorSubida && (
          <div className="mt-2 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold rounded-xl p-2.5">
            {errorSubida}
          </div>
        )}

        {estadoExtracto === "procesando" && (
          <div className="mt-2 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold rounded-xl p-2.5">
            Tu declaración se está analizando. No cierres esta pestaña.
          </div>
        )}

        {estadoExtracto === "completado" && verificacion && (
          <div className={`mt-2 text-[11px] font-bold rounded-xl p-2.5 border ${
            verificacion === "completo"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : verificacion === "incompleto"
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-slate-50 border-slate-200 text-slate-500"
          }`}>
            {verificacion === "completo" && `✓ Declaración verificada: ${registrosDetectados} métricas extraídas de ${ejerciciosDetectados} ejercicio(s) fiscal(es).`}
            {verificacion === "incompleto" && `⚠️ Atención: solo se extrajeron ${registrosDetectados} métricas de las ${(ejerciciosDetectados ?? 0) * 15} esperadas para ${ejerciciosDetectados} ejercicio(s). Revisa la declaración o inténtalo de nuevo.`}
            {verificacion === "no_verificable" && "No se detectó ningún ejercicio fiscal en el documento."}
          </div>
        )}
      </div>

      <FiscalidadClientDashboard datosExcel={registros} />
    </div>
  );
}