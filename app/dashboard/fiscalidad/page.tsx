"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FiscalidadClientDashboard from "./fiscal-client";
import registrosBackup from "./registros_fiscales_backup.json";
import { Upload, CheckCircle2, X } from "lucide-react";

const MAX_ARCHIVOS = 4;

const generarLoteId = () => crypto.randomUUID();

export default function FiscalidadPage() {
  const router = useRouter();

  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [registros, setRegistros] = useState<any[]>([]);
  const [estadoExtracto, setEstadoExtracto] = useState<"procesando" | "completado" | "error" | "sin_datos">("sin_datos");
  const [subiendo, setSubiendo] = useState(false);
  const [progresoTexto, setProgresoTexto] = useState<string | null>(null);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);
  const [archivoNombre, setArchivoNombre] = useState<string | null>(null);
  const [verificacion, setVerificacion] = useState<string | null>(null);
  const [ejerciciosDetectados, setEjerciciosDetectados] = useState<number | null>(null);
  const [registrosDetectados, setRegistrosDetectados] = useState<number | null>(null);

  const [subidaRealizadaEnSesion, setSubidaRealizadaEnSesion] = useState(false);
  const [mostrarToastExito, setMostrarToastExito] = useState(false);

  const cargarUltimoExtracto = async (uid: string) => {
    const { data: ultimaFila } = await supabase
      .from("extractos_fiscales")
      .select("lote_id, estado, archivo_nombre, created_at")
      .eq("cliente_id", uid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!ultimaFila) {
      setRegistros(registrosBackup as any[]);
      setEstadoExtracto("sin_datos");
      return;
    }

    if (ultimaFila.estado === "procesando") {
      setEstadoExtracto("procesando");
      setArchivoNombre(ultimaFila.archivo_nombre);
      return;
    }

    // Filas antiguas sin lote_id (subidas previas a esta funcionalidad): tratamos como lote de 1 archivo.
    if (!ultimaFila.lote_id) {
      const { data: filaCompleta } = await supabase
        .from("extractos_fiscales")
        .select("archivo_nombre, estado, registros_grafico, verificacion, ejercicios_detectados, registros_detectados")
        .eq("cliente_id", uid)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (filaCompleta?.estado === "completado" && filaCompleta.registros_grafico) {
        setRegistros(filaCompleta.registros_grafico);
        setEstadoExtracto("completado");
        setArchivoNombre(filaCompleta.archivo_nombre);
        setVerificacion(filaCompleta.verificacion);
        setEjerciciosDetectados(filaCompleta.ejercicios_detectados);
        setRegistrosDetectados(filaCompleta.registros_detectados);
      } else if (filaCompleta?.estado === "error") {
        setEstadoExtracto("error");
        setRegistros(registrosBackup as any[]);
      } else {
        setRegistros(registrosBackup as any[]);
        setEstadoExtracto("sin_datos");
      }
      return;
    }

    const { data: filasDelLote } = await supabase
      .from("extractos_fiscales")
      .select("archivo_nombre, estado, registros_grafico, verificacion, ejercicios_detectados, registros_detectados")
      .eq("cliente_id", uid)
      .eq("lote_id", ultimaFila.lote_id)
      .order("created_at", { ascending: true });

    const filasCompletadas = (filasDelLote ?? []).filter((f) => f.estado === "completado");

    if (filasCompletadas.length === 0) {
      setEstadoExtracto("error");
      setRegistros(registrosBackup as any[]);
      return;
    }

    const registrosCombinados = filasCompletadas.flatMap((f) => f.registros_grafico ?? []);
    const ejerciciosTotal = filasCompletadas.reduce((sum, f) => sum + (f.ejercicios_detectados ?? 0), 0);
    const registrosTotal = filasCompletadas.reduce((sum, f) => sum + (f.registros_detectados ?? 0), 0);
    const todosCompletos = filasCompletadas.every((f) => f.verificacion === "completo");
    const algunoNoVerificable = filasCompletadas.some((f) => f.verificacion === "no_verificable");

    setRegistros(registrosCombinados);
    setEstadoExtracto("completado");
    setArchivoNombre(filasCompletadas.length === 1 ? filasCompletadas[0].archivo_nombre : `${filasCompletadas.length} declaraciones`);
    setVerificacion(algunoNoVerificable ? "no_verificable" : todosCompletos ? "completo" : "incompleto");
    setEjerciciosDetectados(ejerciciosTotal);
    setRegistrosDetectados(registrosTotal);
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

  useEffect(() => {
    if (!mostrarToastExito) return;
    const temporizador = setTimeout(() => setMostrarToastExito(false), 4000);
    return () => clearTimeout(temporizador);
  }, [mostrarToastExito]);

  const procesarUnArchivo = async (archivo: File, token: string, loteId: string) => {
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("loteId", loteId);

    const response = await fetch("/api/dashboard/extractos-fiscales/procesar", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `No se pudo procesar ${archivo.name}.`);
    }
    return data;
  };

  const handleSubirArchivos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(e.target.files ?? []);
    if (archivos.length === 0 || !userId) return;

    if (archivos.length > MAX_ARCHIVOS) {
      setErrorSubida(`Puedes subir un máximo de ${MAX_ARCHIVOS} archivos a la vez. Has seleccionado ${archivos.length}.`);
      e.target.value = "";
      return;
    }

    for (const archivo of archivos) {
      const extension = archivo.name.split(".").pop()?.toLowerCase();
      if (extension !== "pdf") {
        setErrorSubida(`"${archivo.name}" no es válido. Solo se admiten declaraciones en PDF.`);
        e.target.value = "";
        return;
      }
    }

    setSubiendo(true);
    setErrorSubida(null);
    setEstadoExtracto("procesando");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { router.push("/login"); return; }

      const loteId = generarLoteId();

      const registrosCombinados: any[] = [];
      let ejerciciosTotal = 0;
      let registrosTotal = 0;
      let todosCompletos = true;
      let algunoNoVerificable = false;

      for (let i = 0; i < archivos.length; i++) {
        setProgresoTexto(archivos.length > 1 ? `Procesando declaración ${i + 1} de ${archivos.length}...` : "Analizando tu declaración con IA...");

        const resultado = await procesarUnArchivo(archivos[i], token, loteId);

        registrosCombinados.push(...(resultado.registros ?? []));
        ejerciciosTotal += resultado.ejerciciosDetectados ?? 0;
        registrosTotal += resultado.registrosDetectados ?? 0;

        if (resultado.verificacion !== "completo") todosCompletos = false;
        if (resultado.verificacion === "no_verificable") algunoNoVerificable = true;
      }

      setRegistros(registrosCombinados);
      setEstadoExtracto("completado");
      setArchivoNombre(archivos.length === 1 ? archivos[0].name : `${archivos.length} declaraciones`);
      setVerificacion(algunoNoVerificable ? "no_verificable" : todosCompletos ? "completo" : "incompleto");
      setEjerciciosDetectados(ejerciciosTotal);
      setRegistrosDetectados(registrosTotal);

      setMostrarToastExito(true);
      setSubidaRealizadaEnSesion(true);
    } catch (err: any) {
      console.error("Error al subir declaraciones:", err);
      setErrorSubida(err.message || "Error de red al subir los archivos.");
      setEstadoExtracto("error");
    } finally {
      setSubiendo(false);
      setProgresoTexto(null);
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

      {mostrarToastExito && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2.5 max-w-[90vw]">
          <CheckCircle2 size={18} className="shrink-0" />
          <p className="text-xs font-bold">Declaración(es) subida(s) correctamente. Ya puedes ver tu dashboard fiscal actualizado.</p>
          <button onClick={() => setMostrarToastExito(false)} className="shrink-0 opacity-80 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {!subidaRealizadaEnSesion && (
        <div className="max-w-4xl mx-auto px-3 pt-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center gap-2.5 justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="bg-[#0B3A6E]/10 p-2 rounded-xl shrink-0">
                <Upload size={16} className="text-[#0B3A6E]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Sube tu declaración de la renta</p>
                <p className="text-[10px] text-slate-500 truncate">
                  {estadoExtracto === "procesando" && (progresoTexto || "Analizando tu declaración con IA...")}
                  {estadoExtracto === "completado" && archivoNombre && `Última analizada: ${archivoNombre}`}
                  {estadoExtracto === "error" && "Hubo un error al procesar el último archivo."}
                  {estadoExtracto === "sin_datos" && `Aún no has subido ninguna declaración (viendo datos de ejemplo). Puedes subir hasta ${MAX_ARCHIVOS} a la vez.`}
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
                multiple
                onChange={handleSubirArchivos}
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
              {progresoTexto || "Tu declaración se está analizando."} No cierres esta pestaña.
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
              {verificacion === "completo" && `✓ Declaración(es) verificada(s): ${registrosDetectados} métricas extraídas de ${ejerciciosDetectados} ejercicio(s) fiscal(es) en total.`}
              {verificacion === "incompleto" && `⚠️ Atención: solo se extrajeron ${registrosDetectados} métricas de las esperadas para ${ejerciciosDetectados} ejercicio(s) en total. Revisa las declaraciones o inténtalo de nuevo.`}
              {verificacion === "no_verificable" && "No se detectó ningún ejercicio fiscal en al menos uno de los documentos."}
            </div>
          )}
        </div>
      )}

      <FiscalidadClientDashboard datosExcel={registros} />
    </div>
  );
}