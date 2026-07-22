"use client";


import React, { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

import {

  UserPlus,

  Users,

  Trash2,

  ShieldCheck,

  Search,

  LogOut,

} from "lucide-react";


interface PerfilCliente {

  id: string;

  nombre: string;

  email: string;

  created_at: string;

}


export default function AdminDashboardPage() {

  const router = useRouter();


  const [autorizado, setAutorizado] = useState<boolean>(false);

  const [validando, setValidando] = useState<boolean>(true);


  const [clientes, setClientes] = useState<PerfilCliente[]>([]);

  const [nombre, setNombre] = useState<string>("");

  const [email, setEmail] = useState<string>("");

  const [password, setPassword] = useState<string>("");


  const [busqueda, setBusqueda] = useState<string>("");

  const [cargando, setCargando] = useState<boolean>(false);

  const [mensaje, setMensaje] = useState<{

    tipo: "exito" | "error";

    texto: string;

  } | null>(null);


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

          password,

        }),

      });


      const data = await response.json();


      if (!response.ok) {

        throw new Error(data.error || "Error al dar de alta el cliente.");

      }


      setMensaje({

        tipo: "exito",

        texto: `Cliente ${nombre} registrado con éxito.`,

      });


      setNombre("");

      setEmail("");

      setPassword("");


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


  const handleBajaCliente = async (

    id: string,

    clienteNombre: string

  ) => {

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


  const handleLogout = async () => {

    await supabase.auth.signOut();

    router.push("/login");

  };


  const clientesFiltrados = clientes.filter((c) => {

    const nombreCliente = c.nombre?.toLowerCase() ?? "";

    const emailCliente = c.email?.toLowerCase() ?? "";

    const texto = busqueda.toLowerCase();


    return (

      nombreCliente.includes(texto) ||

      emailCliente.includes(texto)

    );

  });


  if (validando) {

    return (

      <div className="w-full min-h-screen bg-white flex items-center justify-center">

        <p className="text-sm font-bold text-slate-500">

          Validando acceso...

        </p>

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


        <button

          onClick={handleLogout}

          className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"

        >

          <LogOut size={13} />

          Salir

        </button>

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

                Contraseña Temporal

              </label>


              <input

                type="password"

                required

                placeholder="Mínimo 6 caracteres"

                value={password}

                onChange={(e) => setPassword(e.target.value)}

                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#0B3A6E]"

              />

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


          <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-0.5">

            {clientesFiltrados.length === 0 ? (

              <p className="text-[11px] text-slate-400 italic text-center py-4">

                No hay clientes registrados o que coincidan.

              </p>

            ) : (

              clientesFiltrados.map((cli) => (

                <div

                  key={`client-row-${cli.id}`}

                  className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-xs"

                >

                  <div className="flex flex-col gap-0.5 min-w-0 max-w-[70%]">

                    <span className="font-black text-slate-800 truncate leading-tight">

                      {cli.nombre}

                    </span>


                    <span className="text-slate-400 font-medium text-[10px] truncate">

                      {cli.email}

                    </span>

                  </div>


                  <div className="flex items-center gap-1.5 shrink-0">

                    <button

                      onClick={() =>

                        handleBajaCliente(cli.id, cli.nombre)

                      }

                      className="p-1.5 text-rose-600 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 transition-all"

                      title="Dar de baja"

                    >

                      <Trash2 size={13} />

                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>

      </div>

    </div>

  );

}