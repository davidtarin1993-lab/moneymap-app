"use client";

 

import Link from "next/link";

import { usePathname } from "next/navigation";

 

import {

  House,

  ChartColumn,

  MapPinned,

  MessageCircle,

  FileText,

  GraduationCap,

  User,

} from "lucide-react";

 

const items = [

  {

    label: "Inicio",

    path: "/",

    icon: House,

  },

  {

    label: "MoneyMap",

    path: "/dashboard",

    icon: ChartColumn,

  },

  {

    label: "Ruta",

    path: "/ruta",

    icon: MapPinned,

  },

  {

    label: "Chat",

    path: "/chat",

    icon: MessageCircle,

  },

  {

    label: "Informes",

    path: "/informes",

    icon: FileText,

  },

  {

    label: "Formación",

    path: "/formacion",

    icon: GraduationCap,

  },

  {

    label: "Perfil",

    path: "/perfil",

    icon: User,

  },

];

 

export default function Navigation() {

  const pathname = usePathname();

 

  return (

    <nav className="flex flex-wrap justify-center gap-2">

      {items.map((item) => {

        const Icon = item.icon;

 

        const active = pathname === item.path;

 

        return (

          <Link

            key={item.path}

            href={item.path}

            className={`

              flex flex-col items-center justify-center

              w-[90px]

              h-[75px]

              rounded-2xl

              transition-all

              duration-200

              ${

                active

                  ? "bg-[#0B3A6E] text-white shadow-lg"

                  : "bg-white text-slate-500 hover:bg-[#1FA187]/10 hover:text-[#0B3A6E]"

              }

            `}

          >

            <Icon size={24} strokeWidth={2.2} />

 

            <span className="mt-2 text-[11px] font-semibold">

              {item.label}

            </span>

          </Link>

        );

      })}

    </nav>

  );

}