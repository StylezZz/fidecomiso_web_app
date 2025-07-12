import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AlmacenProvider } from "@/contexts/AlmacenProvider";
import "@/app/globals.css";
import { MapProvider } from "@/contexts/MapContext";
import { SimulationProvider } from "@/contexts/SimulationContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>PLG - Sistema de Logística</title>
        <meta name="description" content="Sistema de logística para distribución de GLP" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <SimulationProvider>
            <MapProvider>
              <AlmacenProvider>
                {children}
                <Toaster />
              </AlmacenProvider>
            </MapProvider>
          </SimulationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export const metadata = {
  generator: "v0.dev",
};
