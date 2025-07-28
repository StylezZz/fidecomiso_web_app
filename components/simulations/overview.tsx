"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SimulationResultsOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Resultados de Simulaciones</h2>
        <p className="text-sm text-muted-foreground">Análisis y comparación de simulaciones completadas</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="M3 3v18h18"></path>
              <path d="m19 9-5 5-4-4-3 3"></path>
            </svg>
            Resumen General
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"></path>
              <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"></path>
              <path d="M4 12H2"></path>
              <path d="M10 12H8"></path>
              <path d="M16 12h-2"></path>
              <path d="M22 12h-2"></path>
            </svg>
            Comparativa
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="m7 16 4-4 4 4"></path>
              <path d="m7 8 4 4 4-4"></path>
            </svg>
            Detalles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">496</span>
                    <span className="text-xs text-muted-foreground">En 5 simulaciones</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Consumo Total</p>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">3816.0 L</span>
                    <span className="text-xs text-muted-foreground">Promedio: 763.2 L por simulación</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Eficiencia Promedio</p>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">92.9%</span>
                    <span className="text-xs text-muted-foreground">Mejor: 96.7% (Simulación Diaria - Martes)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">1.4 h</span>
                    <span className="text-xs text-muted-foreground">Mejor: 1.1 h (Simulación Diaria - Martes)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compare">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Contenido de comparativa de simulaciones</p>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Contenido de detalles de simulaciones</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
