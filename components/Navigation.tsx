import Link from "next/link";

export default function Navigation() {

  return (

    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

      <Link

        href="/dashboard"

        className="rounded-2xl bg-[#061725] p-4 text-center"

      >

        📊 Mi MoneyMap

      </Link>

 

      <Link

        href="/informes"

        className="rounded-2xl bg-[#061725] p-4 text-center"

      >

        📄 Informes

      </Link>

 

      <Link

        href="/chat"

        className="rounded-2xl bg-[#061725] p-4 text-center"

      >

        💬 Chat

      </Link>

 

      <Link

        href="/formacion"

        className="rounded-2xl bg-[#061725] p-4 text-center"

      >

        📚 Formación

      </Link>

    </div>

  );

}

 

 