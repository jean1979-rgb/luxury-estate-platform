import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUXE Estates",
  description: "Luxury editorial real estate platform"
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
