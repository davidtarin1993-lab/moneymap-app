
import Link from "next/link";
import Image from "next/image";

export default function Header() {

  return (

    <header className="px-0 py-0">

              <Link

                href="/"

                className="flex items-center gap-3"

              >

                <Image

                  src="/Multimedia/portada.png"

                  alt="MoneyMap"

                  width={300}

                  height={300}

                  priority

                />



              </Link>

    </header>

  );

}

 