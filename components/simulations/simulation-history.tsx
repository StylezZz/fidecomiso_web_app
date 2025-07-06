"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertTriangle, 
  BarChart, 
  Truck, 
  Wrench, 
  Clock, 
  Calendar, 
  Timer, 
  MapPin, 
  CheckCircle,
  Fuel,
  Gauge,
  Lightbulb
} from "lucide-react"

export function SimulationHistory() {
  return (
    <div className="w-full max-w-none space-y-6">
      {/* 🎯 MARCO PRINCIPAL IGUAL QUE SIMULACIONES REGISTRADAS */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Consideraciones del Sistema</CardTitle>
              <CardDescription>Tipos de simulación disponibles en el sistema de distribución GLP</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* 🎯 SECCIÓN: TIPOS DE SIMULACIÓN */}
          <Card className="border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-blue-900">Tipos de Simulación</CardTitle>
                  <CardDescription className="text-blue-700">
                    Modalidades de simulación para diferentes escenarios operativos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                
                {/* 🎯 OPERACIONES DÍA A DÍA */}
                <Card className="border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4 bg-blue-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-blue-900">1. Operaciones Día a Día</CardTitle>
                        <Badge className="bg-blue-100 text-blue-800 mt-1">Tiempo Real</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex items-start gap-4 p-3 bg-white border border-blue-100 rounded-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Ingreso de pedidos en tiempo real</h4>
                          <p className="text-sm text-gray-600">Los pedidos se ingresan por teclado simultáneamente por todos los operadores</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-3 bg-white border border-blue-100 rounded-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Carga de archivos de pedidos</h4>
                          <p className="text-sm text-gray-600">Se pueden subir archivos con formato histórico para pedidos futuros</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-3 bg-white border border-blue-100 rounded-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Registro manual de incidentes</h4>
                          <p className="text-sm text-gray-600">Selección por pantalla de unidades vehiculares para registrar averías</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 🎯 SIMULACIÓN 7 DÍAS */}
                <Card className="border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4 bg-green-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Timer className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-green-900">2. Simulación de 7 Días (168 horas)</CardTitle>
                        <Badge className="bg-green-100 text-green-800 mt-1">Proyección</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex items-start gap-4 p-3 bg-white border border-green-100 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Configuración de fecha y hora de inicio</h4>
                          <p className="text-sm text-gray-600">Se debe ingresar la fecha y hora de inicio antes del mapa</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-3 bg-white border border-green-100 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Consumo de data proyectada</h4>
                          <p className="text-sm text-gray-600">Utiliza datos históricos y proyectados para las 168 horas siguientes</p>
                        </div>
                      </div>
                     
                      <div className="flex items-start gap-4 p-3 bg-white border border-green-100 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Averías aleatorias</h4>
                          <p className="text-sm text-gray-600">Se podra insertar averias en el mapa durante la simulación</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 🎯 SIMULACIÓN COLAPSO  sii gordo*/}
                <Card className="border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4 bg-red-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-full">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-red-900">3. Simulación de Colapso</CardTitle>
                        <Badge className="bg-red-100 text-red-800 mt-1">Límites</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex items-start gap-4 p-3 bg-white border border-red-100 rounded-lg">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Sin averías</h4>
                          <p className="text-sm text-gray-600">En este escenario no aplican las averías de vehículos</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-3 bg-white border border-red-100 rounded-lg">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Máxima demanda</h4>
                          <p className="text-sm text-gray-600">Evalúa el comportamiento del sistema bajo condiciones extremas</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-3 bg-white border border-red-100 rounded-lg">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Prueba de límites</h4>
                          <p className="text-sm text-gray-600">Determina la capacidad máxima del sistema de distribución</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
