"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Navigation from "./Navigation";
import Footer from "./Footer";
import CookieBanner from "./CookieBanner";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      {pathname !== "/" && <Header />}

      <main className="min-h-screen pb-24">
        {children}
        {pathname !== "/" && <Footer />}
      </main>

      <Navigation />
      <CookieBanner />
    </>
  );
}