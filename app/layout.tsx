import "./globals.css";
import Navigation from "../components/Navigation";
import Image from "next/image";
import Link from "next/link";

export default function RootLayout({

  children,

}: {
  children: React.ReactNode;
}) {

  return (

    <html lang="es">

      <body className="bg-slate-50">

 

        <header className="bg-white border-b border-slate-200">

 

          <div className="mx-auto max-w-7xl px-6 py-3">

 

            <div className="flex items-center justify-between">

 

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

 

              <Navigation />

            </div>

 

          </div>

        </header>

 

        <main className="mx-auto max-w-7xl p-6">

          {children}

        </main>

 

      </body>

    </html>

  );

}