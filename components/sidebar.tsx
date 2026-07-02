import Link from "next/link";

 export default function Sidebar() {

  return (

    <nav className="flex flex-wrap gap-4">

      <Link

        href="/dashboard"

        className="rounded-xl bg-[#061725] px-4 py-3 hover:bg-[#1FA187] hover:text-black"

      >

        📊 Dashboard

      </Link>

 

      <Link

        href="/chat"

        className="rounded-xl bg-[#061725] px-4 py-3 hover:bg-[#1FA187] hover:text-black"

      >

        💬 Chat

      </Link>

 

      <Link

        href="/informes"

        className="rounded-xl bg-[#061725] px-4 py-3 hover:bg-[#1FA187] hover:text-black"

      >

        📄 Informes

      </Link>

 

      <Link

        href="/formacion"

        className="rounded-xl bg-[#061725] px-4 py-3 hover:bg-[#1FA187] hover:text-black"

      >

        📚 Formación

      </Link>

 

      <Link

        href="/perfil"

        className="rounded-xl bg-[#061725] px-4 py-3 hover:bg-[#1FA187] hover:text-black"

      >

        ⚙️ Perfil

      </Link>

    </nav>

  );

}