"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  House,
  ChartColumn,
  MapPinned,
  GraduationCap, 
  CalendarCheck, // Icono premium para agendar la cita contigo
  MessageCircle,
  User,
} from "lucide-react";

// Array secuencial con Cita en el centro (Posición 4) usando el azul corporativo
const items = [
  { label: "Inicio", path: "/bienvenida", icon: House, isFlotante: false },
  { label: "Mapa", path: "/dashboard", icon: ChartColumn, isFlotante: false },
  { label: "Ruta", path: "/ruta", icon: MapPinned, isFlotante: false },
  { label: "Cita", path: "/cita", icon: CalendarCheck, isFlotante: true }, // BOTÓN CENTRAL DESTACADO
  { label: "Academia", path: "/formacion", icon: GraduationCap, isFlotante: false },
  { label: "Chat", path: "/chat", icon: MessageCircle, isFlotante: false },
  { label: "Perfil", path: "/perfil", icon: User, isFlotante: false },
];

export default function Navigation() {
  const pathname = usePathname();

    // 🛠️ OCULTAR EN LANDING, LOGIN Y CUALQUIER RUTA DE ADMINISTRADOR
  if (pathname === "/" || pathname === "/login" || pathname.startsWith("/admin")) {
    return null;
  }
  
  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        flex
        justify-between
        items-end         {/* Alinea los elementos en la base para que el central sobresalga mejor */}
        bg-white/90       {/* Fondo blanco premium de MoneyMap con un 10% de transparencia */}
        backdrop-blur-md  {/* Efecto cristal difuminado premium sobre el contenido de fondo */}
        border-t
        border-slate-200  {/* Borde suave claro acorde al fondo blanco */}
        p-1.5
        pb-4              {/* Espaciado protector de base para gestos táctiles */}
        shadow-[0_-8px_30px_rgb(0,0,0,0.06)] {/* Sombra superior sutil */}
        w-full
        overflow-visible  {/* Permite que el círculo sobresalga por arriba sin recortarse */}
      "
    > 
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.path;

        // CONDICIONAL: Si es el elemento central (Cita), renderiza el diseño circular con azul MoneyMap
        if (item.isFlotante) {
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-1 flex-col items-center justify-center relative overflow-visible"
            >
              {/* El círculo que sobresale teñido ahora de azul MoneyMap */}
              <div 
                className={`
                  absolute
                  -top-8          {/* Empuja el círculo hacia arriba para que sobresalga */}
                  w-13
                  h-14
                  rounded-full
                  bg-[#0B3A6E]    {/* 🛠️ MODIFICADO: Cambiado al azul corporativo estricto */}
                  text-white
                  flex
                  items-center
                  justify-center
                  shadow-[0_6px_16px_rgba(11,58,110,0.25)] {/* Sombra adaptada al tono oscuro */}
                  border-4
                  border-white    {/* Corona blanca que recorta el borde de la barra limpiamente */}
                  transition-all
                  duration-200
                  hover:scale-105
                  hover:bg-[#11498a]
                  active:scale-95
                `}
              >
                <Icon size={19} className="stroke-[2.5]" />
              </div>
              
              {/* Etiqueta de texto acoplada debajo de la barra */}
              <span className="text-[9px] font-black text-[#0B3A6E] uppercase tracking-tight mt-6 pt-0.5">
                {item.label}
              </span>
            </Link>
          );
        }

        // RENDERIZADO CONVENCIONAL: Para el resto de iconos de la barra adaptados al fondo blanco
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`
              flex
              flex-1
              flex-col
              items-center
              justify-center
              rounded-xl
              py-2
              transition-all
              ${
                active
                  ? "bg-slate-100 text-[#0B3A6E] font-bold" // Resalte corporativo sobre fondo blanco
                  : "text-slate-400 hover:text-slate-600"
              }
            `}
          >
            <Icon size={19} className={active ? "stroke-[2.5]" : "stroke-"} />

            <span className="text-[9px] mt-1 font-semibold tracking-tight truncate">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
