"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  UserPlus,
  Users,
  Trash2,
  ShieldCheck,
  Search,
  LogOut,
  Ban,
  RotateCcw,
  BellRing,
  MessageCircle,
  FileSpreadsheet,
  MapPinned,
  Scale,
  BarChart3,
  GraduationCap,
} from "lucide-react";

interface PerfilCliente {
  id: string;
  nombre: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  fecha_renovacion: string | null;
  suspendido: boolean;
  ultimaInteraccionMovimientos: string | null;
  ultimaInteraccionFiscal: string | null;
  tieneRuta: boolean;
  nivel: number;

}

function formatearFecha(fecha: string | null): string {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function estaCaducada(fechaRenovacion: string | null): boolean {
  if (!fechaRenovacion) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const renovacion = new Date(fechaRenovacion);
  return renovacion < hoy;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [autorizado, setAutorizado] = useState<boolean>(false);
  const [validando, setValidando] = useState<boolean>(true);

  const [clientes, setClientes] = useState<PerfilCliente[]>([]);
  const [nombre, setNombre] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [fechaRenovacionNueva, setFechaRenovacionNueva] = useState<string>("");
  const [rolNuevo, setRolNuevo] = useState<"user" | "admin">("user");

  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "caducados">("todos");
  const [cargando, setCargando] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<{
    tipo: "exito" | "error";
    texto: string;
  } | null>(null);

  const [guardandoRenovacion, setGuardandoRenovacion] = useState<Record<string, boolean>>({});
  const [procesandoAccion, setProcesandoAccion] = useState<Record<string, boolean>>({});

  const obtenerToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  };

  const validarAdmin = async () => {
    setValidando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      router.push("/login");
      return;
    }

    if (profile.role !== "admin") {
      router.push("/bienvenida");
      return;
    }

    setAutorizado(true);
    setValidando(false);
  };

  const cargarClientes = async () => {
    const token = await obtenerToken();

    if (!token) {
      router.push("/login");
      return;
    }

    const response = await fetch("/api/admin/list-clients", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      setMensaje({
        tipo: "error",
        texto: data.error || "No se han podido cargar los clientes.",
      });
      return;
    }

    setClientes(data.clientes ?? []);
  };

  useEffect(() => {
    async function iniciarPanel() {
      await validarAdmin();
    }

    iniciarPanel();
  }, []);

  useEffect(() => {
    if (autorizado) {
      cargarClientes();
    }
  }, [autorizado]);

  const handleAltaCliente = async (e: React.FormEvent) => {
    e.preventDefault();

    setMensaje(null);
    setCargando(true);

    try {
      const token = await obtenerToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/admin/create-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          email,
          fechaRenovacion: fechaRenovacionNueva || null,
          role: rolNuevo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al dar de alta el cliente.");
      }

      setMensaje({
        tipo: data.avisoEmail ? "error" : "exito",
        texto: data.avisoEmail
          ? `Cliente ${nombre} registrado, pero: ${data.avisoEmail}`
          : `Cliente ${nombre} registrado con éxito. Se le ha enviado el email de acceso.`,
      });

      setNombre("");
      setEmail("");
      setFechaRenovacionNueva("");
      setRolNuevo("user");
      await cargarClientes();

    } catch (err: any) {
      setMensaje({
        tipo: "error",
        texto: err.message || "Error al dar de alta.",
      });
    } finally {
      setCargando(false);
    }
  };

  const handleBajaCliente = async (id: string, clienteNombre: string) => {
    const confirmar = confirm(
      `¿Estás seguro de que deseas dar de baja a ${clienteNombre}?`
    );

    if (!confirmar) return;

    setMensaje(null);
    setCargando(true);

    try {
      const token = await obtenerToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/admin/delete-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar cliente.");
      }

      setMensaje({
        tipo: "exito",
        texto: "Cliente eliminado correctamente.",
      });

      await cargarClientes();
    } catch (err: any) {
      setMensaje({
        tipo: "error",
        texto: err.message || "Error al eliminar cliente.",
      });
    } finally {
      setCargando(false);
    }
  };

  const handleActualizarRenovacion = async (id: string, nuevaFecha: string) => {
    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, fecha_renovacion: nuevaFecha || null } : c))
    );

    setGuardandoRenovacion((prev) => ({ ...prev, [id]: true }));

    try {
      const token = await obtenerToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/admin/update-renewal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, fechaRenovacion: nuevaFecha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo guardar la fecha de renovación.");
      }
    } catch (err: any) {
      setMensaje({
        tipo: "error",
        texto: err.message || "Error al guardar la fecha de renovación.",
      });
      await cargarClientes();
    } finally {
      setGuardandoRenovacion((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleToggleSuspension = async (id: string, suspenderActualmente: boolean) => {
    setProcesandoAccion((prev) => ({ ...prev, [id]: true }));
    setMensaje(null);

    try {
      const token = await obtenerToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/admin/toggle-suspension", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, suspender: !suspenderActualmente }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo actualizar el estado del cliente.");
      }

      setMensaje({
        tipo: "exito",
        texto: suspenderActualmente
          ? "Cliente reactivado correctamente."
          : "Cliente suspendido correctamente.",
      });

      await cargarClientes();
    } catch (err: any) {
      setMensaje({
        tipo: "error",
        texto: err.message || "Error al actualizar el estado del cliente.",
      });
    } finally {
      setProcesandoAccion((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleEnviarRecordatorio = async (id: string) => {
    setProcesandoAccion((prev) => ({ ...prev, [id]: true }));
    setMensaje(null);

    try {
      const token = await obtenerToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/admin/send-payment-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo enviar el recordatorio.");
      }

      setMensaje({
        tipo: "exito",
        texto: "Recordatorio de pago enviado.",
      });
    } catch (err: any) {
      setMensaje({
        tipo: "error",
        texto: err.message || "Error al enviar el recordatorio.",
      });
    } finally {
      setProcesandoAccion((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const clientesFiltrados = clientes.filter((c) => {
    const nombreCliente = c.nombre?.toLowerCase() ?? "";
    const emailCliente = c.email?.toLowerCase() ?? "";
    const texto = busqueda.toLowerCase();

    const coincideTexto = nombreCliente.includes(texto) || emailCliente.includes(texto);
    const coincideEstado =
      filtroEstado === "todos" || (filtroEstado === "caducados" && estaCaducada(c.fecha_renovacion));

    return coincideTexto && coincideEstado;
  });

  const totalCaducados = clientes.filter((c) => estaCaducada(c.fecha_renovacion)).length;

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
      <header className="mb-5 border-b border-slate-100 pb-3 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[#0B3A6E] tracking-tight uppercase flex items-center gap-2">
            <ShieldCheck size={20} />
            Consola Administrador
          </h1>

          <p className="text-slate-500 text-xs mt-0.5">
            Gestión de altas, bajas corporativas y asignación de informes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/rutas"
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-xl border border-slate-200 text-[#0B3A6E] hover:bg-slate-50"
          >
            <MapPinned size={13} />
            Rutas
          </Link>
          <Link
            href="/admin/chat"
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-xl border border-slate-200 text-[#0B3A6E] hover:bg-slate-50"
          >
            <MessageCircle size={13} />
            Chat Clientes
          </Link>
          <Link
            href="/admin/extractos"
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-xl border border-slate-200 text-[#0B3A6E] hover:bg-slate-50"
          >
            <FileSpreadsheet size={13} />
            Extractos
          </Link>
          <Link
            href="/admin/extractos-fiscales"
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-xl border border-slate-200 text-[#0B3A6E] hover:bg-slate-50"
          >
            <Scale size={13} />
            Fiscalidad
          </Link>
          <Link
          href="/admin/formacion"
          className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-xl border border-slate-200 text-[#0B3A6E] hover:bg-slate-50"
        >
          <GraduationCap size={13} />
          Formación
        </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-xl border border-slate-200 text-[#0B3A6E] hover:bg-slate-50"
          >
            <BarChart3 size={13} />
            Analítica
          </Link>
        <Link href="/admin/leads" className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-xl border border-slate-200 text-[#0B3A6E] hover:bg-slate-50">
          <Users size={13} /> Leads
        </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <LogOut size={13} />
            Salir
          </button>
        </div>
      </header>
      {mensaje && (
        <div
          className={`mb-4 rounded-xl p-3 text-xs font-bold ${
            mensaje.tipo === "exito"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-rose-50 border border-rose-200 text-rose-700"
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:col-span-1">
          <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <UserPlus size={14} />
            Registrar Nuevo Cliente
          </h2>

          <form onSubmit={handleAltaCliente} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[8.5px] text-slate-500 font-bold uppercase tracking-wider pl-1">
                Nombre Completo
              </label>

              <input
                type="text"
                required
                placeholder="Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0B3A6E]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[8.5px] text-slate-500 font-bold uppercase tracking-wider pl-1">
                Correo de Acceso
              </label>

              <input
                type="email"
                required
                placeholder="cliente@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0B3A6E]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[8.5px] text-slate-500 font-bold uppercase tracking-wider pl-1">
                Próxima Renovación
              </label>

              <input
                type="date"
                value={fechaRenovacionNueva}
                onChange={(e) => setFechaRenovacionNueva(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0B3A6E]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[8.5px] text-slate-500 font-bold uppercase tracking-wider pl-1">
                Rol
              </label>

              <select
                value={rolNuevo}
                onChange={(e) => setRolNuevo(e.target.value as "user" | "admin")}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0B3A6E]"
              >
                <option value="user">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={cargando}
              className={`w-full text-xs font-black uppercase tracking-wider py-2 rounded-xl shadow-sm transition-all ${
                cargando
                  ? "bg-slate-200 text-slate-400 border border-slate-300"
                  : "bg-[#0B3A6E] text-white hover:bg-[#11498a]"
              }`}
            >
              {cargando ? "Procesando..." : "Dar de Alta"}
            </button>
          </form>
        </section>

        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:col-span-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-2">
            <h2 className="text-xs font-black text-[#0B3A6E] uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} />
              Cartera de Clientes Activos ({clientes.length})
            </h2>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Filtro de estado */}
              <div className="inline-flex bg-white border border-slate-200 rounded-lg p-0.5 gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setFiltroEstado("todos")}
                  className={`text-[9.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md transition-all ${
                    filtroEstado === "todos" ? "bg-[#0B3A6E] text-white" : "text-slate-500"
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroEstado("caducados")}
                  className={`text-[9.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    filtroEstado === "caducados" ? "bg-rose-600 text-white" : "text-slate-500"
                  }`}
                >
                  Caducados
                  {totalCaducados > 0 && (
                    <span
                      className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                        filtroEstado === "caducados" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-600"
                      }`}
                    >
                      {totalCaducados}
                    </span>
                  )}
                </button>
              </div>

              <div className="relative w-full sm:w-48">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-7 pr-2 py-1 text-[11px] font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <table className="w-full text-xs border-collapse min-w-[720px]">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider text-left">
                  <th className="py-2 px-2">Cliente</th>
                  <th className="py-2 px-2">Alta</th>
                  <th className="py-2 px-2">Última conexión</th>
                  <th className="py-2 px-2">Últ. Movimientos</th>
                  <th className="py-2 px-2">Últ. Fiscalidad</th>
                  <th className="py-2 px-2">Ruta</th>
                  <th className="py-2 px-2">Nivel</th>
                  <th className="py-2 px-2">Renovación</th>
                  <th className="py-2 px-2">Estado</th>
                  <th className="py-2 px-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-[11px] text-slate-400 italic text-center py-6">
                      No hay clientes registrados o que coincidan.
                    </td>
                  </tr>
                ) : (
                  clientesFiltrados.map((cli) => {
                    const caducada = estaCaducada(cli.fecha_renovacion);
                    const procesando = procesandoAccion[cli.id];

                    return (
                      <tr
                        key={`client-row-${cli.id}`}
                        className="border-t border-slate-100 bg-white hover:bg-slate-50/60 transition-all"
                      >
                        <td className="py-2.5 px-2">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span
                              className={`font-black truncate leading-tight ${
                                caducada ? "text-red-600" : "text-slate-800"
                              }`}
                            >
                              {cli.nombre}
                            </span>
                            <span className="text-slate-400 font-medium text-[10px] truncate">
                              {cli.email}
                            </span>
                          </div>
                        </td>

                        <td className="py-2.5 px-2 text-[11px] font-bold text-slate-600 whitespace-nowrap">
                          {formatearFecha(cli.created_at)}
                        </td>

                        <td className="py-2.5 px-2 text-[11px] font-bold text-slate-600 whitespace-nowrap">
                          {formatearFecha(cli.last_sign_in_at)}
                        </td>
                        <td className="py-2.5 px-2 text-[11px] font-bold text-slate-600 whitespace-nowrap">
                          {formatearFecha(cli.last_sign_in_at)}
                        </td>

                        <td className="py-2.5 px-2 text-[11px] font-bold text-slate-600 whitespace-nowrap">
                          {formatearFecha(cli.ultimaInteraccionMovimientos)}
                        </td>

                        <td className="py-2.5 px-2 text-[11px] font-bold text-slate-600 whitespace-nowrap">
                          {formatearFecha(cli.ultimaInteraccionFiscal)}
                        </td>

                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                              cli.tieneRuta
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {cli.tieneRuta ? "Sí" : "No"}
                          </span>
                        </td>
                         <td className="py-2.5 px-2 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-black text-[#0B3A6E] bg-[#0B3A6E]/10 rounded-full">
                            {cli.nivel}
                          </span>
                        </td>                       
                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <input
                            type="date"
                            value={cli.fecha_renovacion ?? ""}
                            onChange={(e) => handleActualizarRenovacion(cli.id, e.target.value)}
                            className={`bg-slate-50 border rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none ${
                              caducada
                                ? "border-red-300 text-red-600 focus:border-red-500"
                                : "border-slate-200 text-slate-800 focus:border-[#0B3A6E]"
                            }`}
                          />
                          {guardandoRenovacion[cli.id] && (
                            <div className="text-[9px] text-slate-400 font-medium mt-0.5">Guardando...</div>
                          )}
                        </td>

                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                              cli.suspendido
                                ? "bg-slate-200 text-slate-600"
                                : caducada
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {cli.suspendido ? "Suspendido" : caducada ? "Caducado" : "Activo"}
                          </span>
                        </td>

                        <td className="py-2.5 px-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleSuspension(cli.id, cli.suspendido)}
                              disabled={procesando}
                              title={cli.suspendido ? "Reactivar cuenta" : "Suspender cuenta"}
                              className={`p-1.5 rounded-lg border transition-all disabled:opacity-50 ${
                                cli.suspendido
                                  ? "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100"
                                  : "text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100"
                              }`}
                            >
                              {cli.suspendido ? <RotateCcw size={13} /> : <Ban size={13} />}
                            </button>

                            <button
                              onClick={() => handleEnviarRecordatorio(cli.id)}
                              disabled={procesando}
                              title="Enviar recordatorio de pago"
                              className="p-1.5 text-[#0B3A6E] bg-[#0B3A6E]/5 border border-[#0B3A6E]/10 rounded-lg hover:bg-[#0B3A6E]/10 transition-all disabled:opacity-50"
                            >
                              <BellRing size={13} />
                            </button>

                            <button
                              onClick={() => handleBajaCliente(cli.id, cli.nombre)}
                              disabled={procesando}
                              title="Dar de baja"
                              className="p-1.5 text-rose-600 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 transition-all disabled:opacity-50"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
