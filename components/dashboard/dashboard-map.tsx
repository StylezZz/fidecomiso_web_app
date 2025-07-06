"use client"

import { useState } from "react"
import Image from "next/image"
import { Maximize2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardMap() {
  const [showFullscreen, setShowFullscreen] = useState(false)

  return (
    <div className="flex flex-col h-[400px] w-full">
      <div className="relative overflow-hidden flex items-center justify-center h-[320px]">
        {/* Botón para ampliar */}
        <Button 
          variant="secondary" 
          size="sm" 
          className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
          onClick={() => setShowFullscreen(true)}
        >
          <Maximize2 className="h-4 w-4 mr-1" />
          <span className="text-xs">Ampliar</span>
        </Button>
        
        <Image
          src="/SimulacionCompletax2.gif"
          alt="Mapa de distribución"
          width={700}
          height={320}
          className="mx-auto h-auto w-auto object-contain"
          priority
        />
      </div>
      
      <div className="text-sm text-muted-foreground p-4 bg-slate-50 rounded-b-md border-t">
        <p className="font-medium text-primary mb-1">
          <a 
            href="https://drive.google.com/file/d/1y66Da1UBrap4tcH3feIkFQYBreGVpCUs/view" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-all duration-200"
          >
            Vista previa de la simulación
          </a>
        </p>
        <p>
          En un estudio comparativo entre el Algoritmo de Optimización de Colonia de Hormigas (ACO) y el Algoritmo Genético (GA), este último demostró mayor eficiencia y cobertura. Con una demanda de 200 solicitudes semanales, el ACO asignó el 96% (192 pedidos), mientras que el GA logró el 100% con menor tiempo de procesamiento. Los resultados respaldan la adopción del GA como núcleo del sistema de optimización de rutas. 
        </p>         
      </div>

      {/* Modal de pantalla completa */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 z-10 bg-white/20 hover:bg-white/40 text-white"
              onClick={() => setShowFullscreen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            <Image
              src="/SimulacionCompletax2.gif"
              alt="Mapa de distribución"
              width={1200}
              height={800}
              className="mx-auto h-auto w-auto object-contain"
              priority
            />
          </div>
        </div>
      )}
    </div>
  )
}