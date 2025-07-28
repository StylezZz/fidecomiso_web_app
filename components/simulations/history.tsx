"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  AlertTriangle,
  BarChart,
  Calendar,
  Lightbulb,
  Settings,
  Shield,
  Target,
  Timer,
  TrendingUp,
  Zap
} from "lucide-react"

export function SimulationHistory() {
  return (
    <div className="w-full max-w-none space-y-6">
      {/* Header mejorado */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
            <Lightbulb className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Consideraciones del Sistema
            </h2>
            <p className="text-gray-600 text-lg">
              Tipos de simulación disponibles en el sistema de distribución GLP
            </p>
          </div>
        </div>
      </div>

      {/* Tabs mejorados */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <Tabs defaultValue="types" className="w-full">
            <div className="border-b bg-gray-50/50">
              <TabsList className="grid w-full grid-cols-3 h-16 bg-transparent">
                <TabsTrigger 
                  value="types" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-none border-b-2 data-[state=active]:border-blue-500"
                >
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Tipos de Simulación</div>
                      <div className="text-xs text-gray-500">Modalidades disponibles</div>
                    </div>
                  </div>
                </TabsTrigger>

                <TabsTrigger 
                  value="features" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-none border-b-2 data-[state=active]:border-blue-500"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Características</div>
                      <div className="text-xs text-gray-500">Funcionalidades clave</div>
                    </div>
                  </div>
                </TabsTrigger>

                <TabsTrigger 
                  value="benefits" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-none border-b-2 data-[state=active]:border-blue-500"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Beneficios</div>
                      <div className="text-xs text-gray-500">Ventajas del sistema</div>
                    </div>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="types" className="p-6">
              <div className="space-y-6">
                {/* Operaciones Día a Día */}
                <Card className="border-2 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl text-blue-900">Operaciones Día a Día</CardTitle>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">Tiempo Real</Badge>
                        </div>
                        <CardDescription className="text-blue-700 mt-1">
                          Simulación operativa para gestión diaria de distribución
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex items-start gap-4 p-4 bg-white border border-blue-100 rounded-lg hover:bg-blue-50/50 transition-colors">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Ingreso de pedidos en tiempo real</h4>
                          <p className="text-sm text-gray-600">Los pedidos se ingresan por teclado simultáneamente por todos los operadores</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-white border border-blue-100 rounded-lg hover:bg-blue-50/50 transition-colors">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Carga de archivos de pedidos</h4>
                          <p className="text-sm text-gray-600">Se pueden subir archivos con formato histórico para pedidos futuros</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-white border border-blue-100 rounded-lg hover:bg-blue-50/50 transition-colors">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Registro manual de incidentes</h4>
                          <p className="text-sm text-gray-600">Selección por pantalla de unidades vehiculares para registrar averías</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Simulación 7 Días */}
                <Card className="border-2 border-green-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                        <Timer className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl text-green-900">Simulación de 7 Días (168 horas)</CardTitle>
                          <Badge className="bg-green-100 text-green-800 border-green-200">Proyección</Badge>
                        </div>
                        <CardDescription className="text-green-700 mt-1">
                          Simulación semanal para planificación estratégica de distribución
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex items-start gap-4 p-4 bg-white border border-green-100 rounded-lg hover:bg-green-50/50 transition-colors">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Configuración de fecha y hora de inicio</h4>
                          <p className="text-sm text-gray-600">Se debe ingresar la fecha y hora de inicio antes del mapa</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-white border border-green-100 rounded-lg hover:bg-green-50/50 transition-colors">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Consumo de data proyectada</h4>
                          <p className="text-sm text-gray-600">Utiliza datos históricos y proyectados para las 168 horas siguientes</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-white border border-green-100 rounded-lg hover:bg-green-50/50 transition-colors">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Averías aleatorias</h4>
                          <p className="text-sm text-gray-600">Se podrá insertar averías en el mapa durante la simulación</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Simulación Colapso */}
                <Card className="border-2 border-red-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-4 bg-gradient-to-r from-red-50 to-pink-50">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl text-red-900">Simulación de Colapso</CardTitle>
                          <Badge className="bg-red-100 text-red-800 border-red-200">Límites</Badge>
                        </div>
                        <CardDescription className="text-red-700 mt-1">
                          Simulación crítica para evaluar límites del sistema de distribución
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex items-start gap-4 p-4 bg-white border border-red-100 rounded-lg hover:bg-red-50/50 transition-colors">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Sin averías</h4>
                          <p className="text-sm text-gray-600">En este escenario no aplican las averías de vehículos</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-white border border-red-100 rounded-lg hover:bg-red-50/50 transition-colors">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Máxima demanda</h4>
                          <p className="text-sm text-gray-600">Evalúa el comportamiento del sistema bajo condiciones extremas</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-white border border-red-100 rounded-lg hover:bg-red-50/50 transition-colors">
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
            </TabsContent>

            <TabsContent value="features" className="p-6">
              <div className="grid gap-6">
                <Card className="border-2 border-purple-200">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Zap className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-purple-900">Características Principales</CardTitle>
                        <CardDescription className="text-purple-700">
                          Funcionalidades avanzadas del sistema de simulación
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Activity className="h-5 w-5 text-blue-500" />
                          Gestión en Tiempo Real
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Monitoreo continuo de flota vehicular</li>
                          <li>• Actualización automática de rutas</li>
                          <li>• Control de incidentes en tiempo real</li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <BarChart className="h-5 w-5 text-green-500" />
                          Análisis Avanzado
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Reportes detallados de eficiencia</li>
                          <li>• Métricas de rendimiento</li>
                          <li>• Optimización automática de rutas</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="benefits" className="p-6">
              <div className="grid gap-6">
                <Card className="border-2 border-emerald-200">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-emerald-900">Beneficios del Sistema</CardTitle>
                        <CardDescription className="text-emerald-700">
                          Ventajas competitivas de la plataforma de simulación
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Shield className="h-5 w-5 text-emerald-500" />
                          Eficiencia Operativa
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Reducción de costos operativos</li>
                          <li>• Optimización de recursos</li>
                          <li>• Mejora en tiempos de entrega</li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Target className="h-5 w-5 text-blue-500" />
                          Toma de Decisiones
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Datos precisos para decisiones</li>
                          <li>• Escenarios de contingencia</li>
                          <li>• Planificación estratégica</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
