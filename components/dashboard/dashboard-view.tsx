"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/layout/main-layout"
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { SystemInfoCards } from "@/components/dashboard/system-info-cards"
import { DashboardFunctions } from "@/components/dashboard/dashboard-functions"
import { DashboardOrders } from "@/components/dashboard/dashboard-orders"
import { DashboardTrucks } from "@/components/dashboard/dashboard-trucks"
import { useAppDispatch } from "@/hooks/use-redux"
import { fetchDashboardData } from "@/store/dashboard/dashboard-slice"

export function DashboardView() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchDashboardData())
  }, [dispatch])

  return (
    <MainLayout>
      <div className="space-y-6 w-full">
        {/* Mensaje de bienvenida - ancho completo */}
        <DashboardWelcome />
        
        {/* Estadísticas principales */}
        <DashboardStats />
        
        {/* Información del sistema */}
        <SystemInfoCards />
        
        {/* Funciones principales */}
        <DashboardFunctions />
        
        {/* Sección de datos operativos */}
        <Tabs defaultValue="orders" className="w-full">
          <Card className="w-full">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle>Información Operativa</CardTitle>
                  <CardDescription>Gestión de pedidos y estado de la flota</CardDescription>
                </div>
                <TabsList className="grid w-auto grid-cols-2">
                  <TabsTrigger value="orders">Pedidos Históricos</TabsTrigger>
                  <TabsTrigger value="trucks">Camiones Operativos</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent>
              <TabsContent value="orders" className="mt-0">
                <DashboardOrders />
              </TabsContent>
              <TabsContent value="trucks" className="mt-0">
                <DashboardTrucks />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </MainLayout>
  )
}
