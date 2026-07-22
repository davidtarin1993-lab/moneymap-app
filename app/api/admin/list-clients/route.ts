import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { getVerifiedAdmin } from "@/lib/serverAuth";


export async function GET(request: NextRequest) {

  const { user, error } = await getVerifiedAdmin(request);


  if (error || !user) {

    return NextResponse.json(

      { error },

      { status: 401 }

    );

  }


  const { data, error: clientesError } = await supabaseAdmin

    .from("profiles")

    .select("id, nombre, email, created_at")

    .eq("role", "user")

    .order("created_at", { ascending: false });


  if (clientesError) {

    return NextResponse.json(

      { error: clientesError.message },

      { status: 500 }

    );

  }


  return NextResponse.json({

    clientes: data ?? [],

  });

}