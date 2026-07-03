"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  House,
  ChartColumn,
  MapPinned,
  GraduationCap, 
  BookOpen,
  MessageCircle,
  User,
} from "lucide-react";

const items = [
  { label: "Inicio", path: "/", icon: House },
  { label: "Mapa", path: "/dashboard", icon: ChartColumn },
  { label: "Ruta", path: "/ruta", icon: MapPinned },
  { label: "Informes", path: "/informes", icon: BookOpen },
  { label: "Academia", path: "/formacion", icon: GraduationCap },
  { label: "Chat", path: "/chat", icon: MessageCircle },
  { label: "Perfil", path: "/perfil", icon: User },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav
      className="
        fixed
        bottom-3
        left-1/2
        -translate-x-1/2
        z-50
        flex
        justify-between    {/* Distribuye el espacio entre los elementos */}
        bg-[#0F172A]
        border
        border-white/10
        rounded-3xl
        p-1.5
        shadow-2xl
        w-[95vw]          {/* Forzamos a que use todo el ancho horizontal del viewport */}
        max-w-md          {/* Opcional: Evita que se estire demasiado en pantallas de PC */}
      "
    > 
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
            className={`
              flex
              flex-1             {/* Hace que cada botón ocupe el mismo ancho exacto */}
              flex-col
              items-center
              justify-center
              rounded-2xl
              py-2
              transition-all
              ${
                active
                  ? "bg-[#0B3A6E] text-white"
                  : "text-slate-400 hover:text-white"
              }
            `}
          >
            <Icon size={20} /> {/* Reducido a 20 para que quepa mejor al ser 7 iconos */}

            <span className="text-[10px] mt-1 font-medium tracking-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}