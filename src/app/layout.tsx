import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import AppProviders from "@/components/AppProviders";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YAIRINK — Estudio de Tatuaje Fine Line",
  description:
    "Estudio de tatuaje de Yair. Fine line, blackwork y minimalismo con precisión editorial en Madrid.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
