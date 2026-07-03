"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { noticias } from "../noticiasData"; // <-- CONEXIÓN AUTOMÁTICA DESDE LA CARPETA PADRE

export default function DetalleNoticiaPage() {
  const params = useParams();
  
  // Busca automáticamente la noticia correcta vinculando el ID de la URL
  const noticia = noticias.find((item) => item.id === Number(params.id));

  if (!noticia) {
    return (
      <div className="text-center py-20">
        <p>La noticia no existe.</p>
        <Link href="/formacion/noticias" className="text-blue-600 underline">Volver</Link>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-white text-gray-900 px-4 py-10 antialiased">
      <article className="max-w-3xl mx-auto space-y-6">
        <nav>
          <Link href="/formacion/noticias" className="text-xs font-semibold text-gray-400 hover:text-gray-900">
            ← Volver a Noticias
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-xs md:text-sm">
          <span className="text-gray-500">{noticia.fecha}</span>
          <span className="text-gray-200">•</span>
          <span className="text-[#1FA187] uppercase font-bold">{noticia.categoria}</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-black tracking-tight">{noticia.titulo}</h1>
        <div className="border-t border-gray-100 pt-6 text-gray-600 leading-relaxed">
          <p>{noticia.contenido}</p>
        </div>
      </article>
    </main>
  );
}
