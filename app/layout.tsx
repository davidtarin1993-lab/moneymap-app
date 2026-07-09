import "./globals.css";
import Navigation from "../components/Navigation";
import Image from "next/image";
import Link from "next/link";
import AppShell from "../components/AppShell";


export default function RootLayout({

  children,

}: {
  children: React.ReactNode;
}) {

  return (

    <html lang="es">

      <body className="bg-[#0F172A] antialiased">
         

        <header className="bg-white border-b border-slate-200">

 

          <div className="mx-auto max-w-7xl px-8 py-0">

 

            <div className="flex items-center justify-between">

 

              <Link

                href="/"

                className="flex items-center gap-3"

              >




              </Link>

 

              <Navigation />

            </div>

 

          </div>

        </header>

 

        <main className="main-h-screen pb-0 ">
            <AppShell>
              {children}
            </AppShell>
        </main>

 

      </body>

    </html>

  );

}