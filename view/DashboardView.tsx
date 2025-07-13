"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/use-redux";
import { MainLayout } from "@/components/layout/MainLayout";
import { fetchDashboardData } from "@/store/dashboard/dashboard-slice";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardOrders } from "@/components/dashboard/dashboard-orders";
import { DashboardTrucks } from "@/components/dashboard/dashboard-trucks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Package, Truck, Clock, Activity } from "lucide-react";

export function DashboardView() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50">
        {/* Header Section - Minimalista */}
        <div className="border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
                  Centro de Control
                </h1>
                <p className="text-slate-600 mt-1">Supervisión operativa en tiempo real</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-700">Sistema Activo</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">Última actualización</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {new Date().toLocaleTimeString("es-PE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-12 gap-6">
            {/* Columna Izquierda - Métricas Principales */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Quick Stats - Compactas */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Pedidos Hoy</p>
                        <p className="text-2xl font-bold mt-1">147</p>
                      </div>
                      <Package className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-sm font-medium">Flota Activa</p>
                        <p className="text-2xl font-bold mt-1">18/20</p>
                      </div>
                      <Truck className="h-8 w-8 text-emerald-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Estadísticas Detalladas */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-slate-600" />
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      Métricas Principales
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <DashboardStats />
                </CardContent>
              </Card>
            </div>

            {/* Columna Derecha - Datos Operativos */}
            <div className="col-span-12 lg:col-span-8">
              <Card className="border-0 shadow-sm h-full">
                <CardHeader className="border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold text-slate-900">
                          Operaciones en Curso
                        </CardTitle>
                        <CardDescription className="text-slate-600">
                          Gestión de pedidos y flota vehicular
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <Tabs defaultValue="orders" className="h-full">
                    <div className="border-b border-slate-100 px-6 pt-4">
                      <TabsList className="bg-slate-100 p-1 h-auto rounded-lg">
                        <TabsTrigger
                          value="orders"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 rounded-md font-medium text-sm"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Historial de Pedidos
                        </TabsTrigger>
                        <TabsTrigger
                          value="trucks"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 rounded-md font-medium text-sm"
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Estado de Camiones
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="p-6">
                      <TabsContent value="orders" className="m-0">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">
                              Pedidos Recientes
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Clock className="h-4 w-4" />
                              <span>Actualizado hace 2 min</span>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                            <DashboardOrders />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="trucks" className="m-0">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">
                              Estado de la Flota
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Activity className="h-4 w-4" />
                              <span>Monitoreo en vivo</span>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                            <DashboardTrucks />
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
