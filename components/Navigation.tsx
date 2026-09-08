"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House, ChartColumn, MapPinned, GraduationCap, LifeBuoy, User, LayoutGrid,
} from "lucide-react";

const items = [
  { label: "Inicio", path: "/bienvenida", icon: House },
  { label: "Mapa", path: "/dashboard", icon: ChartColumn },
  { label: "Ruta", path: "/ruta", icon: MapPinned },
  { label: "Academia", path: "/formacion", icon: GraduationCap },
  { label: "Soporte", path: "/chat", icon: LifeBuoy },
  { label: "Apps", path: "/aplicaciones", icon: LayoutGrid },
  { label: "Perfil", path: "/perfil", icon: User },
];

export default function Navigation() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/login" || pathname.startsWith("/admin") || pathname.startsWith("/test")) return null;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-between items-center bg-white/90 backdrop-blur-md border-t border-slate-200 p-1.5 pb-4 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] w-full">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.path || (item.path === "/dashboard" && pathname.startsWith("/dashboard"));

        return (
          <Link key={item.path} href={item.path} className="flex flex-1 flex-col items-center justify-center py-1">
            <div className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-1.5 transition-all ${active ? "bg-[#0B3A6E]/10" : ""}`}>
              <Icon size={active ? 23 : 21} className={active ? "text-[#0B3A6E] stroke-[2.25]" : "text-slate-400 stroke-[1.75]"} />
              <span className={`text-[9.5px] tracking-tight truncate ${active ? "text-[#0B3A6E] font-medium" : "text-slate-400 font-medium"}`}>
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}