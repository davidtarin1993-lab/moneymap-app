"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export function useRegistrarVisita(seccion: "movimientos" | "fiscalidad" | "ruta" | "pildoras" | "noticias" | "cartera") {
  const yaRegistrado = useRef(false);

  useEffect(() => {
    if (yaRegistrado.current) return;
    yaRegistrado.current = true;

    async function registrar() {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      fetch("/api/analytics/registrar-pagina", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ seccion }),
        keepalive: true,
      }).catch((err) => console.error("Error al registrar visita:", err));
    }

    registrar();
  }, [seccion]);
}