"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { getPlanningResult, resetPlanningState } from "@/store/planner/planner-slice"
import { formatDateTime } from "@/lib/utils"
import { BarChart, Download, RefreshCw } from "lucide-react"

type PlanningResultsProps = {
  planningId: string
}

export function PlanningResults({ planningId }: PlanningResultsProps) {
  const dispatch = useAppDispatch()
  const planningResult = useAppSelector((state) => state.planner.planningResult)

  useEffect(() => {
    if (!planningResult) {
      dispatch(getPlanningResult(planningId))
    }
  }, [dispatch, planningId, planningResult])

  if (!planningResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando Resultados</CardTitle>
          <CardDescription>Obteniendo los resultados de la planificación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleReset = () => {
    dispatch(resetPlanningState())
  }

  const handleExport = () => {
    // Convertir los resultados a JSON
    const dataStr = JSON.stringify(planningResult, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    // Crear un enlace de descarga
    const exportFileDefaultName = `planning-${planningId}.json`
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <CardTitle>Resultados de Planificación</CardTitle>
              <CardDescription>
                Planificación completada el {formatDateTime(planningResult.endTime || "")}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Exportar
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" /> Nueva Planificación
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Distancia Total</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-2xl font-bold">{planningResult.metrics.totalDistance.toFixed(1)} km</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Tiempo Total</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-2xl font-bold">{planningResult.metrics.totalTime} min</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Consumo de Combustible</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-2xl font-bold">{planningResult.metrics.totalFuelConsumption.toFixed(1)} L</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Tiempo Promedio</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-2xl font-bold">{planningResult.metrics.averageDeliveryTime} min</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Pedidos por Camión</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-2xl font-bold">{planningResult.metrics.ordersPerTruck}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="routes">
        <TabsList>
          <TabsTrigger value="routes">Rutas Asignadas</TabsTrigger>
          <TabsTrigger value="metrics">
            <BarChart className="mr-2 h-4 w-4" /> Métricas Detalladas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="routes">
          <Card>
            <CardHeader>
              <CardTitle>Rutas Asignadas</CardTitle>
              <CardDescription>Detalle de las rutas generadas para cada camión</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {planningResult.routes.map((route) => (
                  <div key={route.truckId} className="rounded-lg border p-4">
                    <h3 className="mb-2 text-lg font-semibold">Camión #{route.truckId}</h3>
                    <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Distancia Total</p>
                        <p className="font-medium">{route.totalDistance.toFixed(1)} km</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tiempo Total</p>
                        <p className="font-medium">{route.totalTime} min</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Consumo de Combustible</p>
                        <p className="font-medium">{route.fuelConsumption.toFixed(1)} L</p>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Orden</TableHead>
                          <TableHead>Pedido</TableHead>
                          <TableHead>Llegada Estimada</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {route.orders.map((order) => (
                          <TableRow key={order.orderId}>
                            <TableCell>
                              <Badge variant="outline">{order.position}</Badge>
                            </TableCell>
                            <TableCell>#{order.orderId}</TableCell>
                            <TableCell>{formatDateTime(order.estimatedArrival)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Métricas Detalladas</CardTitle>
              <CardDescription>Análisis detallado de la planificación</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Métrica</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Algoritmo</TableCell>
                    <TableCell>{planningResult.algorithm}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tiempo de Inicio</TableCell>
                    <TableCell>{formatDateTime(planningResult.startTime)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tiempo de Finalización</TableCell>
                    <TableCell>{formatDateTime(planningResult.endTime || "")}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Distancia Total</TableCell>
                    <TableCell>{planningResult.metrics.totalDistance.toFixed(1)} km</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tiempo Total</TableCell>
                    <TableCell>{planningResult.metrics.totalTime} min</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Consumo de Combustible</TableCell>
                    <TableCell>{planningResult.metrics.totalFuelConsumption.toFixed(1)} L</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tiempo Promedio de Entrega</TableCell>
                    <TableCell>{planningResult.metrics.averageDeliveryTime} min</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Pedidos por Camión</TableCell>
                    <TableCell>{planningResult.metrics.ordersPerTruck}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
