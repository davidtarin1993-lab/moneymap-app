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

  const id = body.id;


  if (!id) {

    return NextResponse.json(

      { error: "Falta el id del cliente." },

      { status: 400 }

    );

  }


  const { error: profileError } = await supabaseAdmin

    .from("profiles")

    .delete()

    .eq("id", id);


  if (profileError) {

    return NextResponse.json(

      { error: profileError.message },

      { status: 500 }

    );

  }


  const { error: authError } =

    await supabaseAdmin.auth.admin.deleteUser(id);


  if (authError) {

    return NextResponse.json(

      { error: authError.message },

      { status: 500 }

    );

  }


  return NextResponse.json({

    ok: true,

  });

}