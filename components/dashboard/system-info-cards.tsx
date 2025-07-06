'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Truck, MapPin } from "lucide-react"

export function SystemInfoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sistema de Distribución GLP</h3>
              <p className="text-sm text-gray-500">Gestión inteligente de rutas y entregas</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cobertura Urbana</h3>
              <p className="text-sm text-gray-500">Red de 70km × 50km optimizada</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
