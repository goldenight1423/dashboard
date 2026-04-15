import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard — Discursos CEO/IA",
  description: "Análisis cualitativo de discursos de CEOs sobre inteligencia artificial",
};

export const viewport: Viewport = {
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full" style={{ colorScheme: "dark" }}>
      <head>
        <meta name="theme-color" content="#030712" />
      </head>
      <body className={`${inter.className} h-full bg-gray-950 text-gray-100 antialiased`}>
        {/* Skip link for keyboard/screen reader navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Ir al contenido principal
        </a>
        <div className="flex h-full">
          <Sidebar />
          <main id="main-content" className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
