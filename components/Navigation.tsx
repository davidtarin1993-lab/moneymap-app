"use client";

 

import Link from "next/link";

import { usePathname } from "next/navigation";

 

import {

  House,

  ChartColumn,

  MapPinned,

  MessageCircle,

  User,

} from "lucide-react";

 

const items = [

  {

    label: "Inicio",

    path: "/",

    icon: House,

  },

  {

    label: "Mapa",

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

    label: "Perfil",

    path: "/perfil",

    icon: User,

  },

];

 

export default function Navigation() {

  const pathname = usePathname();

 

  return (

    <nav

      className="

        fixed

        bottom-4

        left-1/2

        -translate-x-1/2

        z-50

        flex

        gap-2

        bg-[#0F172A]

        border

        border-white/10

        rounded-3xl

        p-2

        shadow-2xl

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

              flex-col

              items-center

              justify-center

              rounded-2xl

              px-4

              py-3

              transition-all

              ${

                active

                  ? "bg-[#0B3A6E] text-white"

                  : "text-slate-400"

              }

            `}

          >

            <Icon size={22} />

 

            <span className="text-[10px] mt-1">

              {item.label}

            </span>

          </Link>

        );

      })}

    </nav>

  );

}

  