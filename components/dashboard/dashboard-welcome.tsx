"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, MapPin, Truck } from "lucide-react"

export function DashboardWelcome() {
  const currentTime = new Date().toLocaleString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <Card className="w-full bg-gradient-to-r from-slate-800 to-slate-700 text-white border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                ¡Bienvenido, Operario Logístico! 👋
              </CardTitle>
              <p className="text-blue-100 mt-1 flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2" />
                {currentTime}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
