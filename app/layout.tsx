import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Private Estates Mexico",
  description: "Luxury editorial real estate platform for destinations, brokers and premium properties in Mexico"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
