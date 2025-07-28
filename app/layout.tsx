import "@/app/globals.css";
import type React from "react";
import { Toaster } from "@/components/ui/toaster";
import { MapProvider } from "@/contexts/ContextMap";
import { ThemeProvider } from "@/components/theme-provider";
import { AlmacenProvider } from "@/contexts/WarehouseProvider";
import { SimulationProvider } from "@/contexts/ContextSimulation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>GLP Logistics</title>
        <meta
          name="description"
          content="GLP Logistics - Sistema de Simulación de Entrega de GLP"
        />
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
