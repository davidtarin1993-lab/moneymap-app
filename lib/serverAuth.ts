import { NextRequest } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";


export async function getVerifiedAdmin(request: NextRequest) {

  const authHeader = request.headers.get("authorization");


  if (!authHeader) {

    return {

      user: null,

      error: "No autorizado. Falta cabecera Authorization.",

    };

  }


  const token = authHeader.replace("Bearer ", "");


  if (!token) {

    return {

      user: null,

      error: "No autorizado. Token no válido.",

    };

  }


  const {

    data: { user },

    error: userError,

  } = await supabaseAdmin.auth.getUser(token);


  if (userError || !user) {

    return {

      user: null,

      error: "No autorizado. Usuario no válido.",

    };

  }


  const { data: profile, error: profileError } = await supabaseAdmin

    .from("profiles")

    .select("role")

    .eq("id", user.id)

    .single();


  if (profileError || !profile) {

    return {

      user: null,

      error: "No se ha encontrado el perfil del usuario.",

    };

  }


  if (profile.role !== "admin") {

    return {

      user: null,

      error: "Acceso denegado. El usuario no es administrador.",

    };

  }


  return {

    user,

    error: null,

  };

}