"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { pildoras } from "../pildorasData"; // <-- CONEXIÓN AUTOMÁTICA DESDE LA CARPETA PADRE

export default function DetallePildoraPage() {
  const params = useParams();
  
  // Localiza de forma dinámica la píldora pulsada mediante el ID de la ruta
  const pildora = pildoras.find((item) => item.id === Number(params.id));

  if (!pildora) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">La lección solicitada no existe.</p>
        <Link href="/formacion/pildoras" className="text-blue-600 underline text-sm">Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-white text-gray-900 px-4 py-6 md:py-10 antialiased">
      <article className="max-w-3xl mx-auto w-full space-y-6">
        
        <nav>
          <Link href="/formacion/pildoras" className="text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors">
            ← Volver a Píldoras
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-xs md:text-sm font-medium">
          <span className="text-gray-400 flex items-center gap-1">⏱️ Tiempo de lectura: {pildora.duracion}</span>
          <span className="text-gray-200">•</span>
          <span className="text-[#1FA187] uppercase tracking-wider font-bold">{pildora.categoria}</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">{pildora.titulo}</h1>
        
        <div className="border-t border-gray-100 pt-6 text-gray-600 text-sm md:text-base leading-relaxed space-y-4">
          <p>{pildora.contenido}</p>
        </div>

      </article>
    </main>
  );
}
