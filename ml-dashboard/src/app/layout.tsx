import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ML Opportunities Dashboard",
  description:
    "Descubrí oportunidades de negocio en Mercado Libre analizando tendencias y best sellers en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased bg-[#0f1117] text-gray-100 font-sans">
        {children}
      </body>
    </html>
  );
}
