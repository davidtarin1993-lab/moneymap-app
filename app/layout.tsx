import "./globals.css";
import Navigation from "../components/Navigation";
import Image from "next/image";
import Link from "next/link";
// Después:
import "./globals.css";
import AppShell from "../components/AppShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-[#0F172A] antialiased">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}