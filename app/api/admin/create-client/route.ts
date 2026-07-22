import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { getVerifiedAdmin } from "@/lib/serverAuth";


export async function POST(request: NextRequest) {

  const { user, error } = await getVerifiedAdmin(request);


  if (error || !user) {

    return NextResponse.json(

      { error },

      { status: 401 }

    );

  }


  const body = await request.json();


  const nombre = body.nombre?.trim();

  const email = body.email?.trim();

  const password = body.password?.trim();


  if (!nombre || !email || !password) {

    return NextResponse.json(

      { error: "Nombre, email y contraseña son obligatorios." },

      { status: 400 }

    );

  }


  if (password.length < 6) {

    return NextResponse.json(

      { error: "La contraseña debe tener al menos 6 caracteres." },

      { status: 400 }

    );

  }


  const { data: createdUser, error: createUserError } =

    await supabaseAdmin.auth.admin.createUser({

      email,

      password,

      email_confirm: true,

      user_metadata: {

        nombre,

        role: "user",

      },

    });


  if (createUserError || !createdUser.user) {

    return NextResponse.json(

      { error: createUserError?.message || "No se ha podido crear el usuario." },

      { status: 500 }

    );

  }


  const { error: profileError } = await supabaseAdmin

    .from("profiles")

    .insert({

      id: createdUser.user.id,

      email,

      nombre,

      role: "user",

    });


  if (profileError) {

    await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id);


    return NextResponse.json(

      { error: profileError.message },

      { status: 500 }

    );

  }


  return NextResponse.json({

    ok: true,

    cliente: {

      id: createdUser.user.id,

      email,

      nombre,

      role: "user",

    },

  });

}