"use client"

import { DashboardOrders } from "@/components/dashboard/dashboard-orders"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardTrucks } from "@/components/dashboard/dashboard-trucks"
import { SystemInfoCards } from "@/components/dashboard/system-info-cards"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppDispatch } from "@/hooks/use-redux"
import { fetchDashboardData } from "@/store/dashboard/dashboard-slice"
import { useEffect } from "react"

export function DashboardView() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchDashboardData())
  }, [dispatch])

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header con animación */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Panel de Control Logístico
            </h1>
            <p className="text-slate-600 text-lg">Gestión inteligente de flotas y operaciones</p>
          </div>

          {/* Estadísticas principales con glassmorphism */}
          <div className="backdrop-blur-sm bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
            <DashboardStats />
          </div>
          
          {/* Información del sistema con diseño moderno */}
          <div className="backdrop-blur-sm bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
            <SystemInfoCards />
          </div>
          
          {/* Sección de datos operativos mejorada */}
          <div className="backdrop-blur-sm bg-white/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <Tabs defaultValue="orders" className="w-full">
              <Card className="w-full border-0 shadow-none bg-transparent">
                <CardHeader className="pb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          📊
                        </div>
                        Información Operativa
                      </CardTitle>
                      <CardDescription className="text-blue-100 mt-2">
                        Gestión de pedidos y estado de la flota en tiempo real
                      </CardDescription>
                    </div>
                    <TabsList className="bg-white/10 border-white/20 backdrop-blur-sm">
                      <TabsTrigger 
                        value="orders" 
                        className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-white hover:bg-white/20"
                      >
                        📦 Pedidos Históricos
                      </TabsTrigger>
                      <TabsTrigger 
                        value="trucks" 
                        className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-white hover:bg-white/20"
                      >
                        🚛 Camiones Operativos
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <TabsContent value="orders" className="mt-0 space-y-4">
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                      <DashboardOrders />
                    </div>
                  </TabsContent>
                  <TabsContent value="trucks" className="mt-0 space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <DashboardTrucks />
                    </div>
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
