"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle2,
  Circle,
  Target,
  TrendingUp,
  Sparkles,
  ChevronDown,
  CalendarClock,
  Plus,
  X,
  FileCheck2,
  FileX2,
  Scale,
  Lock,
} from "lucide-react";
import { useRegistrarVisita } from "@/lib/useRegistrarVisita";

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

const OPCIONES_OBJETIVO = [
  { valor: "ahorro", label: "Ahorro general" },
  { valor: "fondo_emergencia", label: "Fondo de emergencia" },
  { valor: "vivienda", label: "Compra de vivienda" },
  { valor: "inversion", label: "Inversión / hacer crecer mi dinero" },
  { valor: "jubilacion", label: "Jubilación / largo plazo" },
  { valor: "reducir_deuda", label: "Reducir deudas" },
  { valor: "otro", label: "Otro" },
];

const OPCIONES_HORIZONTE = [
  { valor: "6", label: "6 meses" },
  { valor: "12", label: "1 año" },
  { valor: "24", label: "2 años" },
  { valor: "36", label: "3 años" },
  { valor: "60", label: "5 años" },
  { valor: "120", label: "10 años o más" },
];

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
}

export default function RutaPage() {
  const router = useRouter();
  useRegistrarVisita("ruta");

  const [cargando, setCargando] = useState(true);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [rutaAbierta, setRutaAbierta] = useState<string | null>(null);
  const [puedeSolicitar, setPuedeSolicitar] = useState(true);
  const [proximaFechaDisponible, setProximaFechaDisponible] = useState<string | null>(null);
  const [documentacion, setDocumentacion] = useState({ movimientos: false, fiscal: false });

  const [mostrarModal, setMostrarModal] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const [tipoObjetivo, setTipoObjetivo] = useState("ahorro");
  const [objetivoDescripcion, setObjetivoDescripcion] = useState("");
  const [saldoActual, setSaldoActual] = useState("");
  const [importeObjetivo, setImporteObjetivo] = useState("");
  const [horizonteMeses, setHorizonteMeses] = useState("12");
  const [ingresosMensualesAprox, setIngresosMensualesAprox] = useState("");
  const [notasAdicionales, setNotasAdicionales] = useState("");

  const cargarEstado = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) { router.push("/login"); return; }

    const response = await fetch("/api/dashboard/rutas/estado", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (!response.ok) return;

    setRutas(data.rutas ?? []);
    setRutaAbierta(data.rutas?.[0]?.id ?? null);
    setPuedeSolicitar(data.puedeSolicitar);
    setProximaFechaDisponible(data.proximaFechaDisponible);
    setDocumentacion(data.documentacion ?? { movimientos: false, fiscal: false });
  };

  useEffect(() => {
    async function iniciar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      await cargarEstado();
      setCargando(false);
    }
    iniciar();
  }, [router]);

  const limpiarFormulario = () => {
    setTipoObjetivo("ahorro");
    setObjetivoDescripcion("");
    setSaldoActual("");
    setImporteObjetivo("");
    setHorizonteMeses("12");
    setIngresosMensualesAprox("");
    setNotasAdicionales("");
  };

  const handleEnviarSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objetivoDescripcion.trim()) return;

    setEnviando(true);
    setErrorEnvio(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { router.push("/login"); return; }

      const response = await fetch("/api/dashboard/rutas/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tipoObjetivo,
          objetivoDescripcion,
          saldoActual,
          importeObjetivo,
          horizonteMeses,
          ingresosMensualesAprox,
          notasAdicionales,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorEnvio(data.error || "No se pudo enviar la solicitud.");
        return;
      }

      setEnviado(true);
      limpiarFormulario();
      await cargarEstado();
    } catch (err) {
      setErrorEnvio("Error de red al enviar la solicitud.");
    } finally {
      setEnviando(false);
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setEnviado(false);
    setErrorEnvio(null);
  };

  if (cargando) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm font-bold text-slate-500">Cargando tu ruta...</p>
      </div>
    );
  }

  const botonSolicitar = (
    <button
      onClick={() => (puedeSolicitar ? setMostrarModal(true) : null)}
      disabled={!puedeSolicitar}
      className={`w-full flex items-center justify-center gap-2 rounded-2xl p-4 text-xs font-black uppercase tracking-wider transition-all ${
        puedeSolicitar
          ? "bg-[#0B3A6E] hover:bg-[#11498a] text-white"
          : "bg-slate-100 text-slate-400 cursor-not-allowed"
      }`}
    >
      {puedeSolicitar ? <Plus size={16} /> : <Lock size={14} />}
      {puedeSolicitar
        ? "Solicitar nueva ruta"
        : `Disponible a partir del ${proximaFechaDisponible ? formatearFecha(proximaFechaDisponible) : "—"}`}
    </button>
  );

  return (
    <main className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 md:py-10 pb-24 antialiased">
      <div className="max-w-md mx-auto w-full">
      <header className="border-b border-slate-100 pb-5 mb-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl md:text-4xl" role="img" aria-label="Ruta">🧭</span>
          <h1 className="text-2xl md:text-3xl font-black text-[#0B3A6E] tracking-tight">Tu Ruta</h1>
        </div>
        <p className="mt-2 text-xs md:text-sm text-slate-500 font-medium leading-normal">
          {rutas.length > 0
            ? `Tienes ${rutas.length} informe(s) de ruta trazados junto a tu asesor.`
            : "Trazamos tu plan financiero de manera personalizada."}
        </p>
      </header>

      {rutas.length > 0 ? (
        <div className="space-y-3">
          {botonSolicitar}
          <p className="text-[10px] text-slate-400 font-medium text-center -mt-1.5">
            Solo puedes solicitar una ruta nueva al mes.
          </p>

          {rutas.map((ruta) => {
            const abierta = rutaAbierta === ruta.id;
            const objetivo = ruta.importe_objetivo ?? 0;
            const actual = ruta.importe_actual ?? 0;
            const progreso = objetivo > 0 ? Math.round((actual / objetivo) * 100) : 0;

            return (
              <div key={ruta.id} className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setRutaAbierta(abierta ? null : ruta.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <div className="bg-[#0B3A6E]/10 p-2 rounded-xl shrink-0">
                    <Target size={16} className="text-[#0B3A6E]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-black text-slate-900 truncate">{ruta.titulo}</h2>
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-0.5">
                      <CalendarClock size={11} />
                      {formatearFecha(ruta.created_at)}
                    </span>
                  </div>

                  {objetivo > 0 && (
                    <span className="text-[#1FA187] font-black text-xs shrink-0">{progreso}%</span>
                  )}

                  <ChevronDown
                    size={16}
                    className={`text-slate-400 shrink-0 transition-transform ${abierta ? "rotate-180" : ""}`}
                  />
                </button>

                {abierta && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-200 pt-3">
                    {ruta.descripcion && (
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        {ruta.descripcion}
                      </p>
                    )}

                    {objetivo > 0 && (
                      <div className="bg-white border border-slate-200 rounded-xl p-3.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-black text-[#0B3A6E]">
                            {actual.toLocaleString("es-ES")}€
                          </span>
                          <span className="text-[11px] text-slate-400 font-bold">
                            de {objetivo.toLocaleString("es-ES")}€
                          </span>
                        </div>

                        <div className="mt-2.5 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1FA187] rounded-full transition-all"
                            style={{ width: `${Math.min(progreso, 100)}%` }}
                          />
                        </div>

                        {objetivo > actual && (
                          <p className="mt-1.5 text-[10px] text-slate-400 font-medium">
                            Te quedan {(objetivo - actual).toLocaleString("es-ES")}€ para completar este objetivo.
                          </p>
                        )}
                      </div>
                    )}

                    {ruta.proxima_accion && (
                      <div className="bg-[#0B3A6E]/5 border border-[#0B3A6E]/10 rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={13} className="text-[#0B3A6E]" />
                          <h3 className="text-[10px] font-black text-[#0B3A6E] uppercase tracking-wider">
                            Próxima acción
                          </h3>
                        </div>
                        <p className="mt-1.5 text-[12px] text-slate-700 leading-relaxed font-medium">
                          {ruta.proxima_accion}
                        </p>
                      </div>
                    )}

                    {ruta.hitos && ruta.hitos.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <TrendingUp size={13} className="text-slate-700" />
                          <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                            Hitos
                          </h3>
                        </div>

                        <div className="space-y-2">
                          {ruta.hitos.map((hito, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              {hito.hecho ? (
                                <CheckCircle2 size={14} className="text-[#1FA187] shrink-0" />
                              ) : (
                                <Circle size={14} className="text-slate-300 shrink-0" />
                              )}
                              <span className={`text-[11px] font-medium ${hito.hecho ? "text-slate-700" : "text-slate-400"}`}>
                                {hito.texto}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Aún no tienes ninguna ruta trazada. Cuéntanos tu objetivo y tu asesor preparará un plan personalizado para ti.
          </p>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Documentación disponible</p>
            <div className="flex items-center gap-2">
              {documentacion.movimientos ? (
                <FileCheck2 size={14} className="text-[#1FA187] shrink-0" />
              ) : (
                <FileX2 size={14} className="text-slate-300 shrink-0" />
              )}
              <span className={`text-[11px] font-medium ${documentacion.movimientos ? "text-slate-700" : "text-slate-400"}`}>
                Movimientos bancarios {documentacion.movimientos ? "subidos" : "sin subir"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {documentacion.fiscal ? (
                <FileCheck2 size={14} className="text-[#1FA187] shrink-0" />
              ) : (
                <FileX2 size={14} className="text-slate-300 shrink-0" />
              )}
              <span className={`text-[11px] font-medium ${documentacion.fiscal ? "text-slate-700" : "text-slate-400"}`}>
                Declaración de la renta {documentacion.fiscal ? "subida" : "sin subir"}
              </span>
            </div>
            {(!documentacion.movimientos || !documentacion.fiscal) && (
              <p className="text-[10px] text-slate-400 font-medium pt-1">
                No es obligatorio, pero subir esta información ayuda a tu asesor a preparar una ruta más precisa.
              </p>
            )}
          </div>

          {botonSolicitar}
          <p className="text-[10px] text-slate-400 font-medium text-center">
            Solo puedes solicitar una ruta al mes.
          </p>
        </div>
      )}

      {/* MODAL: FORMULARIO DE SOLICITUD */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={cerrarModal}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all z-10"
            >
              <X size={16} />
            </button>

            <div className="p-6">
              {enviado ? (
                <div className="text-center space-y-2 py-8">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 size={20} />
                  </div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">¡Solicitud enviada!</h4>
                  <p className="text-[11px] text-slate-500 font-medium px-4">
                    Tu asesor ha recibido tu solicitud y preparará tu ruta personalizada. Te avisaremos en cuanto esté lista.
                  </p>
                  <button
                    onClick={cerrarModal}
                    className="mt-2 text-[10px] font-black uppercase tracking-wider text-[#0B3A6E] underline"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Target size={16} className="text-[#0B3A6E]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0B3A6E]">
                      Cuéntanos tu objetivo
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mb-4">
                    Con esta información, tu asesor trazará una ruta a tu medida.
                  </p>

                  <form onSubmit={handleEnviarSolicitud} className="space-y-3">
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Tipo de objetivo *</label>
                      <select
                        value={tipoObjetivo}
                        onChange={(e) => setTipoObjetivo(e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
                      >
                        {OPCIONES_OBJETIVO.map((o) => (
                          <option key={o.valor} value={o.valor}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">
                        ¿Qué quieres conseguir? *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={objetivoDescripcion}
                        onChange={(e) => setObjetivoDescripcion(e.target.value)}
                        placeholder="Ej: Quiero ahorrar para la entrada de un piso en los próximos 3 años..."
                        className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Saldo actual (€)</label>
                        <input
                          type="number"
                          value={saldoActual}
                          onChange={(e) => setSaldoActual(e.target.value)}
                          placeholder="3000"
                          className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Importe objetivo (€)</label>
                        <input
                          type="number"
                          value={importeObjetivo}
                          onChange={(e) => setImporteObjetivo(e.target.value)}
                          placeholder="15000"
                          className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Horizonte temporal</label>
                        <select
                          value={horizonteMeses}
                          onChange={(e) => setHorizonteMeses(e.target.value)}
                          className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
                        >
                          {OPCIONES_HORIZONTE.map((o) => (
                            <option key={o.valor} value={o.valor}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Ingresos mens. aprox. (€)</label>
                        <input
                          type="number"
                          value={ingresosMensualesAprox}
                          onChange={(e) => setIngresosMensualesAprox(e.target.value)}
                          placeholder="1800"
                          className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Notas adicionales</label>
                      <textarea
                        rows={2}
                        value={notasAdicionales}
                        onChange={(e) => setNotasAdicionales(e.target.value)}
                        placeholder="Cualquier detalle que creas relevante para tu asesor..."
                        className="w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#0B3A6E] font-medium resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={enviando || !objetivoDescripcion.trim()}
                      className="w-full bg-[#1FA187] hover:bg-[#198771] disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
                    >
                      {enviando ? "Enviando..." : "Enviar solicitud"}
                    </button>

                    {errorEnvio && (
                      <p className="text-red-500 text-[10px] font-bold text-center">{errorEnvio}</p>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
)}
      </div>
    </main>
  );
}