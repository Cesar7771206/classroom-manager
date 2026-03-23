import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Classroom Manager",
  description: "Gestiona las aulas y puntos de participación de forma eficiente",
  icons: {
    icon: '/favicon.png',
  },
};

import { NavigationProvider } from "@/components/NavigationProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${jetbrainsMono.variable}`}>
      <body style={{ fontFamily: 'var(--font-mono), monospace' }}>
        <NavigationProvider>
          {children}
        </NavigationProvider>
      </body>
    </html>
  );
}

