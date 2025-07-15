"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardFunctions() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🔧</span>
          <span>Funciones Principales</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-gray-700">Monitoreo de flota en tiempo real</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-gray-700">Optimización automática de rutas</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-gray-700">Gestión de pedidos y entregas</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-gray-700">Control de averías y mantenimiento</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-gray-700">Simulaciones de escenarios</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-gray-700">Reportes y análisis de rendimiento</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
