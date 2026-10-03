"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import MoneyMapClientDashboard from "./dashboard-client";
import movimientosJsonBackup from "./movimientos.json";
import { Upload, CheckCircle2, X, Wallet } from "lucide-react";

const MAX_ARCHIVOS = 4;

const generarLoteId = () => crypto.randomUUID();

export default function IngresosGastosPage() {
  const router = useRouter();

  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [estadoExtracto, setEstadoExtracto] = useState<"procesando" | "completado" | "error" | "sin_datos">("sin_datos");
  const [subiendo, setSubiendo] = useState(false);
  const [progresoTexto, setProgresoTexto] = useState<string | null>(null);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);
  const [archivoNombre, setArchivoNombre] = useState<string | null>(null);

  const [verificacion, setVerificacion] = useState<string | null>(null);
  const [conteoOrigen, setConteoOrigen] = useState<number | null>(null);
  const [conteoClasificado, setConteoClasificado] = useState<number | null>(null);

  const [subidaRealizadaEnSesion, setSubidaRealizadaEnSesion] = useState(false);
  const [mostrarToastExito, setMostrarToastExito] = useState(false);
  const [mostrarModalSubida, setMostrarModalSubida] = useState(false);

  const cargarUltimoExtracto = async (uid: string) => {
    const { data: ultimaFila } = await supabase
      .from("extractos_bancarios")
      .select("lote_id, estado, archivo_nombre, created_at")
      .eq("cliente_id", uid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!ultimaFila) {
      setMovimientos(movimientosJsonBackup as any[]);
      setEstadoExtracto("sin_datos");
      setMostrarModalSubida(true);
      return;
    }

    if (ultimaFila.estado === "procesando") {
      setEstadoExtracto("procesando");
      setArchivoNombre(ultimaFila.archivo_nombre);
      return;
    }

    // Si esta fila no tiene lote_id (archivos antiguos previos a esta funcionalidad),
    // la tratamos como un lote de un único archivo.
    if (!ultimaFila.lote_id) {
      const { data: filaCompleta } = await supabase
        .from("extractos_bancarios")
        .select("archivo_nombre, estado, movimientos_grafico, verificacion, movimientos_detectados_origen, movimientos_clasificados")
        .eq("cliente_id", uid)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (filaCompleta?.estado === "completado" && filaCompleta.movimientos_grafico) {
        setMovimientos(filaCompleta.movimientos_grafico);
        setEstadoExtracto("completado");
        setArchivoNombre(filaCompleta.archivo_nombre);
        setVerificacion(filaCompleta.verificacion);
        setConteoOrigen(filaCompleta.movimientos_detectados_origen);
        setConteoClasificado(filaCompleta.movimientos_clasificados);
      } else if (filaCompleta?.estado === "error") {
        setEstadoExtracto("error");
        setMovimientos(movimientosJsonBackup as any[]);
      } else {
        setMovimientos(movimientosJsonBackup as any[]);
        setEstadoExtracto("sin_datos");
        setMostrarModalSubida(true);
      }
      return;
    }

    const { data: filasDelLote } = await supabase
      .from("extractos_bancarios")
      .select("archivo_nombre, estado, movimientos_grafico, verificacion, movimientos_detectados_origen, movimientos_clasificados")
      .eq("cliente_id", uid)
      .eq("lote_id", ultimaFila.lote_id)
      .order("created_at", { ascending: true });

    const filasCompletadas = (filasDelLote ?? []).filter((f) => f.estado === "completado");

    if (filasCompletadas.length === 0) {
      setEstadoExtracto("error");
      setMovimientos(movimientosJsonBackup as any[]);
      return;
    }

    const movimientosCombinados = filasCompletadas.flatMap((f) => f.movimientos_grafico ?? []);
    const origenTotal = filasCompletadas.reduce((sum, f) => sum + (f.movimientos_detectados_origen ?? 0), 0);
    const clasificadoTotal = filasCompletadas.reduce((sum, f) => sum + (f.movimientos_clasificados ?? 0), 0);
    const todosCompletos = filasCompletadas.every((f) => f.verificacion === "completo");
    const algunoNoVerificable = filasCompletadas.some((f) => f.verificacion === "no_verificable");

    setMovimientos(movimientosCombinados);
    setEstadoExtracto("completado");
    setArchivoNombre(filasCompletadas.length === 1 ? filasCompletadas[0].archivo_nombre : `${filasCompletadas.length} archivos`);
    setVerificacion(algunoNoVerificable ? "no_verificable" : todosCompletos ? "completo" : "incompleto");
    setConteoOrigen(origenTotal);
    setConteoClasificado(clasificadoTotal);
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

    const response = await fetch("/api/dashboard/extractos/procesar", {
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
      if (extension !== "xlsx" && extension !== "xls" && extension !== "pdf") {
        setErrorSubida(`"${archivo.name}" no es un archivo válido. Solo se admiten .xlsx, .xls o .pdf.`);
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

      const movimientosCombinados: any[] = [];
      let origenTotal = 0;
      let clasificadoTotal = 0;
      let todosCompletos = true;
      let algunoNoVerificable = false;

      for (let i = 0; i < archivos.length; i++) {
        setProgresoTexto(archivos.length > 1 ? `Procesando archivo ${i + 1} de ${archivos.length}...` : "Analizando tu extracto con IA...");

        const resultado = await procesarUnArchivo(archivos[i], token, loteId);

        movimientosCombinados.push(...(resultado.movimientos ?? []));
        origenTotal += resultado.movimientosDetectadosOrigen ?? 0;
        clasificadoTotal += resultado.movimientosClasificados ?? 0;

        if (resultado.verificacion !== "completo") todosCompletos = false;
        if (resultado.verificacion === "no_verificable") algunoNoVerificable = true;
      }

      setMovimientos(movimientosCombinados);
      setEstadoExtracto("completado");
      setArchivoNombre(archivos.length === 1 ? archivos[0].name : `${archivos.length} archivos`);
      setVerificacion(algunoNoVerificable ? "no_verificable" : todosCompletos ? "completo" : "incompleto");
      setConteoOrigen(origenTotal);
      setConteoClasificado(clasificadoTotal);

      setMostrarToastExito(true);
      setSubidaRealizadaEnSesion(true);
    } catch (err: any) {
      console.error("Error al subir extractos:", err);
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
          <Wallet size={20} className="text-[#1FA187]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-black text-[#0B3A6E] tracking-tight">Movimientos Bancarios</h1>
          <p className="text-slate-500 text-xs font-medium leading-relaxed mt-0.5">
            Auditoría automatizada de tus ingresos y gastos, al momento.
          </p>
        </div>
      </header>

      {mostrarModalSubida && !subidaRealizadaEnSesion && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[110]">
          <div className="bg-white w-full max-w-sm rounded-3xl border border-slate-200 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setMostrarModalSubida(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all z-10"
            >
              <X size={16} />
            </button>

            <div className="p-7 text-center">
              <div className="bg-[#0B3A6E]/10 p-4 rounded-2xl inline-flex mb-4">
                <Upload size={28} className="text-[#0B3A6E]" />
              </div>
              <h2 className="text-base font-black text-[#0B3A6E] mb-1.5">Sube tu extracto bancario</h2>
              <p className="text-xs text-slate-500 font-medium mb-5 leading-relaxed">
                Nuestra IA clasifica automáticamente tus movimientos y te muestra tu dashboard en segundos.
              </p>

              <label className={`block border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all ${
                subiendo ? "border-slate-200 bg-slate-50 cursor-not-allowed" : "border-[#0B3A6E]/30 hover:border-[#0B3A6E] hover:bg-[#0B3A6E]/5"
              }`}>
                {subiendo ? (
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Procesando...</p>
                ) : (
                  <>
                    <p className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-1">Subir Excel/PDF</p>
                    <p className="text-[10px] text-slate-400 font-medium">Hasta {MAX_ARCHIVOS} archivos a la vez</p>
                  </>
                )}
                <input
                  type="file"
                  accept=".xlsx,.xls,.pdf"
                  multiple
                  onChange={handleSubirArchivos}
                  disabled={subiendo}
                  className="hidden"
                />
              </label>

              {errorSubida && (
                <div className="mt-3 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold rounded-xl p-2.5">
                  {errorSubida}
                </div>
              )}

              <button
                onClick={() => setMostrarModalSubida(false)}
                className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-4"
              >
                Ahora no, gracias
              </button>
            </div>
          </div>
        </div>
      )}
      {mostrarToastExito && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2.5 max-w-[90vw]">
          <CheckCircle2 size={18} className="shrink-0" />
          <p className="text-xs font-bold">Extracto(s) subido(s) correctamente. Ya puedes ver tu dashboard actualizado.</p>
          <button onClick={() => setMostrarToastExito(false)} className="shrink-0 opacity-80 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      <MoneyMapClientDashboard
        datosExcel={movimientos}
        subidaRealizadaEnSesion={subidaRealizadaEnSesion}
        estadoExtracto={estadoExtracto}
        subiendo={subiendo}
        progresoTexto={progresoTexto}
        errorSubida={errorSubida}
        archivoNombre={archivoNombre}
        verificacion={verificacion}
        conteoOrigen={conteoOrigen}
        conteoClasificado={conteoClasificado}
        maxArchivos={MAX_ARCHIVOS}
        handleSubirArchivos={handleSubirArchivos}
      />
    </div>
  );
}