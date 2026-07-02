
import "./globals.css";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
 

export default function RootLayout({

  children,

}: {

  children: React.ReactNode;

}) {

  return (

    <html lang="es">

      <body className="bg-[#020B14] text-white">

        <Sidebar />

          <header className="border-b border-white/10">

            <div className="mx-auto flex max-w-7xl items-center justify-between p-6">

  

              <Link href="/">

                <h1 className="text-3xl font-black cursor-pointer">

                  Money

                  <span className="text-[#1FA187]">

                    Map

                  </span>

                </h1>

              </Link>

  

              <nav className="flex gap-6 text-sm">

                <Link href="/dashboard">

                  Dashboard

                </Link>

  

                <Link href="/chat">

                  Chat

                </Link>

  

                <Link href="/informes">

                  Informes

                </Link>

  

                <Link href="/formacion">

                  Formación

                </Link>

              </nav>

            </div>

          </header>

  

          {children}

      </body>

    </html>

  );

}