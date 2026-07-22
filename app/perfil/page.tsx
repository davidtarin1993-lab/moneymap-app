"use client";


import { useEffect } from "react";

import { supabase } from "@/lib/supabase";


export default function PerfilPage() {


  useEffect(() => {


    async function cargar() {


      const {

        data: { user }

      } = await supabase.auth.getUser();


      console.log(user);


    }


    cargar();


  }, []);


  return (

    <div>

      Perfil

    </div>

  );

}