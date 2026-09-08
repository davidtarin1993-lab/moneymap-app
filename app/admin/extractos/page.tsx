"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  FileSpreadsheet,
  MessageCircleQuestion,
  Scale,
  Download,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface ClienteResumen {
  clienteId: string;
  nombre: string;
  email: string;
  ultimoExtracto: {
    archivo_nombre: string;
    estado: string;
    verificacion: string | null;
    movimientos_detectados_origen: number | null;
    movimientos_clasificados: number | null;
    created_at: string;
  } | null;
  preguntasMovimientosUsadas: number;
  preguntasFiscalUsadas: number;
}

interface ExtractoDetalle {
  id: string;
  archivo_nombre: string;
  archivo_tipo: string;
  estado: string;
  verificacion: string | null;
  movimientos_detectados_origen: number | null;
  movimientos_clasificados: number | null;
  clasificacion_completa: any[] | null;
  error_mensaje: string | null;
  created_at: string;
  procesado_at: string | null;
  urlDescarga: string | null;
}

interface MensajeIA {
  rol: "usuario" | "ia";
  contenido: string;
  created_at: string;
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BadgeVerificacion({ verificacion }: { verificacion: string | null }) {
  if (verificacion === "completo") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
        <CheckCircle2 size={10} /> Completo
      </span>
    );
  }

  if (verificacion === "incompleto") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
        <AlertTriangle size={10} /> Incompleto
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
      <HelpCircle size={10} /> No verificable
    </span>
  );
}

function ListaMensajesIA({ mensajes, vacio }: { mensajes: MensajeIA[]; vacio: string }) {
  if (mensajes.length === 0) {
    return <p className="text-[11px] text-slate-400 italic">{vacio}</p>;
  }

  return (
    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
      {mensajes.map((m, idx) => (
        <div
          key={idx}
          className={`rounded-xl p-2.5 text-[11px] leading-relaxed border ${
            m.rol === "ia"
              ? "bg-white border-slate-200 text-slate-700"
              : "bg-[#0B3A6E]/5 border-[#0B3A6E]/10 text-slate-700 ml-6"
          }`}
        >
          <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5">
            {m.rol === "ia" ? "Asistente" : "Cliente"} · {formatearFecha(m.created_at)}
          </p>
          {m.contenido}
        </div>
      ))}
    </div>
  );
}

export default function AdminExtractosPage() {
  const router = useRouter();
  const [validando, setValidando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  const [clientes, setClientes] = useState<ClienteResumen[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteResumen | null>(null);
  const [extractos, setExtractos] = useState<ExtractoDetalle[]>([]);
  const [mensajesIAMovimientos, setMensajesIAMovimientos] = useState<MensajeIA[]>([]);
  const [mensajesIAFiscal, setMensajesIAFiscal] = useState<MensajeIA[]>([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [extractoAbierto, setExtractoAbierto] = useState<string | null>(null);

  const obtenerToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  useEffect(() => {
    async function validarAdmin() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/bienvenida");
        return;
      }

      setAutorizado(true);
      setValidando(false);
    }

    validarAdmin();
  }, [router]);

  useEffect(() => {
    async function cargarClientes() {
      const token = await obtenerToken();
      if (!token) return;

      const response = await fetch("/api/admin/extractos/list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setClientes(data.clientes ?? []);
    }

    if (autorizado) {
      cargarClientes();
    }
  }, [autorizado]);

  const abrirCliente = async (cliente: ClienteResumen) => {
    setClienteSeleccionado(cliente);
    setCargandoDetalle(true);
    setExtractoAbierto(null);

    const token = await obtenerToken();
    if (!token) return;

    const response = await fetch(`/api/admin/extractos/detalle?clienteId=${cliente.clienteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    setExtractos(data.extractos ?? []);
    setMensajesIAMovimientos(data.mensajesIAMovimientos ?? []);
    setMensajesIAFiscal(data.mensajesIAFiscal ?? []);
    setCargandoDetalle(false);
  };

  if (validando) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm font-bold text-slate-500">Validando acceso...</p>
      </div>
    );
  }

  if (!autorizado) {
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-white text-slate-800 px-4 py-6 font-sans pb-32 antialiased">
      <header className="mb-5 border-b border-slate-100 pb-3">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-[#0B3A6E] mb-2"
        >
          <ArrowLeft size={12} /> Volver al panel
        </Link>
        <h1 className="text-xl font-black text-[#0B3A6E] tracking-tight uppercase flex items-center gap-2">
          <FileSpreadsheet size={20} />
          Extractos de Clientes
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Revisa los extractos subidos por cada cliente y sus consultas a los asistentes IA.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-3 md:col-span-1 max-h-[75vh] overflow-y-auto">
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-2 px-1">
            Clientes ({clientes.length})
          </h2>

          {clientes.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic px-1 py-4 text-center">
              No hay clientes registrados.
            </p>
          ) : (
            <div className="space-y-1.5">
              {clientes.map((c) => (
                <button
                  key={c.clienteId}
                  onClick={() => abrirCliente(c)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                    clienteSeleccionado?.clienteId === c.clienteId
                      ? "bg-[#0B3A6E] border-[#0B3A6E] text-white"
                      : "bg-white border-slate-200 text-slate-700 hover:border-[#0B3A6E]/40"
                  }`}
                >
                  <p className="text-xs font-black truncate">{c.nombre}</p>

                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-0.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                        clienteSeleccionado?.clienteId === c.clienteId
                          ? "bg-white/20 text-white"
                          : "bg-[#0B3A6E]/10 text-[#0B3A6E]"
                      }`}
                    >
                      <MessageCircleQuestion size={9} />
                      {c.preguntasMovimientosUsadas}/3
                    </span>

                    <span
                      className={`inline-flex items-center gap-0.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                        clienteSeleccionado?.clienteId === c.clienteId
                          ? "bg-white/20 text-white"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <Scale size={9} />
                      {c.preguntasFiscalUsadas}/3
                    </span>
                  </div>

                  <p
                    className={`text-[10px] truncate mt-1 ${
                      clienteSeleccionado?.clienteId === c.clienteId ? "text-white/70" : "text-slate-400"
                    }`}
                  >
                    {c.ultimoExtracto ? `Último: ${c.ultimoExtracto.archivo_nombre}` : "Sin extractos subidos"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:col-span-2 max-h-[75vh] overflow-y-auto">
          {!clienteSeleccionado ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold py-20">
              Selecciona un cliente para ver sus extractos.
            </div>
          ) : cargandoDetalle ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold py-20">
              Cargando...
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="border-b border-slate-200 pb-2">
                <p className="text-xs font-black text-[#0B3A6E]">{clienteSeleccionado.nombre}</p>
                <p className="text-[10px] text-slate-400">{clienteSeleccionado.email}</p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                  Historial de extractos bancarios
                </p>

                {extractos.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">
                    Este cliente aún no ha subido ningún extracto.
                  </p>
                ) : (
                  extractos.map((ext) => (
                    <div key={ext.id} className="bg-white border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-800 truncate">{ext.archivo_nombre}</p>
                          <p className="text-[10px] text-slate-400">{formatearFecha(ext.created_at)}</p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <BadgeVerificacion verificacion={ext.verificacion} />

                          {ext.urlDescarga ? (
                            <a
                              href={ext.urlDescarga}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-[#0B3A6E] bg-[#0B3A6E]/5 border border-[#0B3A6E]/10 rounded-lg hover:bg-[#0B3A6E]/10"
                              title="Descargar archivo original"
                            >
                              <Download size={13} />
                            </a>
                          ) : null}
                        </div>
                      </div>

                      {ext.estado === "error" ? (
                        <p className="text-[10px] text-rose-600 font-bold mt-1.5">
                          Error: {ext.error_mensaje}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 mt-1.5">
                          {ext.movimientos_clasificados ?? 0} movimientos clasificados
                          {ext.movimientos_detectados_origen != null
                            ? ` de ${ext.movimientos_detectados_origen} detectados`
                            : ""}
                        </p>
                      )}

                      {ext.clasificacion_completa && ext.clasificacion_completa.length > 0 ? (
                        <button
                          onClick={() =>
                            setExtractoAbierto(extractoAbierto === ext.id ? null : ext.id)
                          }
                          className="text-[10px] font-black text-[#0B3A6E] uppercase mt-2 underline"
                        >
                          {extractoAbierto === ext.id ? "Ocultar movimientos" : "Ver movimientos clasificados"}
                        </button>
                      ) : null}

                      {extractoAbierto === ext.id && ext.clasificacion_completa ? (
                        <div className="mt-2 max-h-64 overflow-y-auto border border-slate-100 rounded-lg">
                          <table className="w-full text-[10px]">
                            <thead className="sticky top-0 bg-slate-50">
                              <tr className="text-left text-slate-400 uppercase font-bold">
                                <th className="p-1.5">Fecha</th>
                                <th className="p-1.5">Descripción</th>
                                <th className="p-1.5">Categoría</th>
                                <th className="p-1.5 text-right">Importe</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ext.clasificacion_completa.map((mov: any, idx: number) => (
                                <tr key={idx} className="border-t border-slate-100">
                                  <td className="p-1.5 whitespace-nowrap">{mov.fecha}</td>
                                  <td className="p-1.5 max-w-[160px] truncate">{mov.descripcion_original}</td>
                                  <td className="p-1.5 whitespace-nowrap">{mov.categoria_principal}</td>
                                  <td
                                    className={`p-1.5 text-right font-bold whitespace-nowrap ${
                                      mov.importe < 0 ? "text-rose-600" : "text-emerald-600"
                                    }`}
                                  >
                                    {mov.importe?.toLocaleString("es-ES", { maximumFractionDigits: 0 })}€
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight flex items-center gap-1.5">
                  <MessageCircleQuestion size={11} />
                  Asistente de Movimientos ({clienteSeleccionado.preguntasMovimientosUsadas}/3 hoy)
                </p>
                <ListaMensajesIA
                  mensajes={mensajesIAMovimientos}
                  vacio="Este cliente aún no ha usado el asistente de movimientos."
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight flex items-center gap-1.5">
                  <Scale size={11} />
                  Especialista Fiscal ({clienteSeleccionado.preguntasFiscalUsadas}/3 hoy)
                </p>
                <ListaMensajesIA
                  mensajes={mensajesIAFiscal}
                  vacio="Este cliente aún no ha usado el especialista fiscal."
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}