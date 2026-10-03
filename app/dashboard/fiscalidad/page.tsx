"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FiscalidadClientDashboard from "./fiscal-client";
import registrosBackup from "./registros_fiscales_backup.json";
import { Upload, CheckCircle2, X, FileText, Scale } from "lucide-react";

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
  const [mostrarModalSubida, setMostrarModalSubida] = useState(false);

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
      setMostrarModalSubida(true);
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

      <header className="max-w-4xl mx-auto px-3 pt-4 pb-3 border-b border-slate-100 flex items-center gap-3">
        <div className="bg-[#0B3A6E] p-2.5 rounded-2xl shrink-0">
          <Scale size={20} className="text-[#1FA187]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-black text-[#0B3A6E] tracking-tight">Fiscalidad</h1>
          <p className="text-slate-500 text-xs font-medium leading-relaxed mt-0.5">
            Auditoría fiscal automatizada con las métricas oficiales de tu declaración.
          </p>
        </div>
      </header>

      {mostrarToastExito && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2.5 max-w-[90vw]">
          <CheckCircle2 size={18} className="shrink-0" />
          <p className="text-xs font-bold">Declaración(es) subida(s) correctamente. Ya puedes ver tu dashboard fiscal actualizado.</p>
          <button onClick={() => setMostrarToastExito(false)} className="shrink-0 opacity-80 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {mostrarModalSubida && !subidaRealizadaEnSesion && (
        <div className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative">
            <button
              onClick={() => setMostrarModalSubida(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="bg-[#0B3A6E]/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
              <FileText size={26} className="text-[#0B3A6E]" />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-1.5">Sube tu declaración de la renta</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Analizamos tu declaración con IA y te mostramos tu dashboard fiscal completo en segundos. Puedes subir hasta {MAX_ARCHIVOS} ejercicios a la vez.
            </p>

            <label className={`block text-center text-xs font-black uppercase tracking-wider px-4 py-3.5 rounded-2xl cursor-pointer transition-all mb-2.5 ${
              subiendo ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-[#0B3A6E] text-white hover:bg-[#11498a]"
            }`}>
              {subiendo ? "Procesando..." : "Subir PDF"}
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={(e) => {
                  setMostrarModalSubida(false);
                  handleSubirArchivos(e);
                }}
                disabled={subiendo}
                className="hidden"
              />
            </label>

            <button
              onClick={() => setMostrarModalSubida(false)}
              className="w-full text-center text-[11px] font-bold text-slate-400 hover:text-slate-600 py-1.5"
            >
              Ahora no, gracias
            </button>
          </div>
        </div>
      )}

      <FiscalidadClientDashboard
        datosExcel={registros}
        subidaRealizadaEnSesion={subidaRealizadaEnSesion}
        estadoExtracto={estadoExtracto}
        subiendo={subiendo}
        progresoTexto={progresoTexto}
        errorSubida={errorSubida}
        archivoNombre={archivoNombre}
        verificacion={verificacion}
        ejerciciosDetectados={ejerciciosDetectados}
        registrosDetectados={registrosDetectados}
        maxArchivos={MAX_ARCHIVOS}
        handleSubirArchivos={handleSubirArchivos}
      />
    </div>
  );
}