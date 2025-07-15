"use client"

import { useAppSelector } from "@/hooks/use-redux"
import { selectDashboardStats } from "@/store/dashboard/dashboard-selectors"
import { Calendar, Clock, Fuel, Truck } from "lucide-react"

export function DashboardStats() {
  const stats = useAppSelector(selectDashboardStats)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium mx-auto">Almacenes Disponibles</h3>
          <Calendar className="h-4 w-4 text-blue-500 shrink-0" />
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold text-center">3</div>
          <p className="text-xs text-muted-foreground text-center">1 Almacen Central y 2 Intermedios</p>
        </div>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium mx-auto">Flota total de camiones</h3>
          <Truck className="h-4 w-4 text-green-500 shrink-0" />
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold text-center">20</div>
          <p className="text-xs text-muted-foreground text-center">
            <span className="inline-flex items-center">
              <span className="inline-block w-2 h-2 bg-yellow-400 mx-1"></span>2 TA 
            </span>
            <span className="inline-flex items-center">
              <span className="inline-block w-2 h-2 bg-blue-400 mx-1"></span>4 TB 
            </span>
            <span className="inline-flex items-center">
              <span className="inline-block w-2 h-2 bg-orange-500 mx-1"></span>4 TC 
            </span>
            <span className="inline-flex items-center">
              <span className="inline-block w-2 h-2 bg-gray-500 mx-1"></span>10 TD
            </span>
          </p>
        </div>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium mx-auto">Capacidad total</h3>
          <Fuel className="h-4 w-4 text-amber-500 shrink-0" />
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold text-center">200</div>
          <p className="text-xs text-muted-foreground text-center">Metros Cúbicos (m3)</p>
        </div>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium mx-auto">Velocidad de los camiones</h3>
          <Clock className="h-4 w-4 text-purple-500 shrink-0" />
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold text-center">50</div>
          <p className="text-xs text-muted-foreground text-center">Kilometros por Hora (Km/h)</p>
        </div>
      </div>
    </div>
  )
}