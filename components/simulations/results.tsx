"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { getSimulationResult, resetSimulationState } from "@/store/simulation/simulation-slice"
import { formatDateTime } from "@/lib/utils"
import {
  Download,
  RefreshCw,
  AlertTriangle,
  Map,
  Truck,
  Package,
  Clock,
  Fuel,
  PercentIcon,
  Calendar,
  FileText,
  PieChart,
  TrendingUp,
  MapPin,
  BarChart2,
} from "lucide-react"
import { useRouter } from "next/navigation"

type SimulationResultsProps = {
  simulationId: string
}

export function SimulationResults({ simulationId }: SimulationResultsProps) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const simulationResult = useAppSelector((state) => state.simulation.simulationResult)
  const [activeTab, setActiveTab] = useState("summary")

  // Datos adicionales para los reportes
  const [districtData] = useState([
    { district: "San Isidro", orders: 23, volume: 184, efficiency: 96.5 },
    { district: "Miraflores", orders: 18, volume: 144, efficiency: 94.2 },
    { district: "Surco", orders: 15, volume: 120, efficiency: 92.8 },
    { district: "La Molina", orders: 12, volume: 96, efficiency: 91.5 },
    { district: "San Borja", orders: 10, volume: 80, efficiency: 93.7 },
  ])

  const [truckEfficiencyData] = useState([
    { id: "truck1", plate: "ABC-123", deliveries: 28, consumption: 10.2, distance: 215, efficiency: 97.2 },
    { id: "truck2", plate: "DEF-456", deliveries: 22, consumption: 11.5, distance: 187, efficiency: 94.8 },
    { id: "truck4", plate: "JKL-012", deliveries: 19, consumption: 9.8, distance: 165, efficiency: 95.3 },
    { id: "truck5", plate: "MNO-345", deliveries: 15, consumption: 8.5, distance: 142, efficiency: 93.1 },
  ])

  const [routeTimeData] = useState([
    { id: "route1", truck: "truck1", time: 45, distance: 18.5, orders: 3 },
    { id: "route2", truck: "truck2", time: 62, distance: 24.2, orders: 4 },
    { id: "route3", truck: "truck4", time: 38, distance: 15.8, orders: 2 },
    { id: "route4", truck: "truck1", time: 55, distance: 21.3, orders: 3 },
    { id: "route5", truck: "truck5", time: 41, distance: 16.7, orders: 2 },
  ])

  const [frequentZonesData] = useState([
    { zone: "Zona Norte", frequency: 28, avgTime: 42, avgConsumption: 9.8 },
    { zone: "Zona Este", frequency: 35, avgTime: 38, avgConsumption: 8.5 },
    { zone: "Zona Sur", frequency: 22, avgTime: 45, avgConsumption: 10.2 },
    { zone: "Zona Oeste", frequency: 18, avgTime: 40, avgConsumption: 9.3 },
    { zone: "Zona Central", frequency: 42, avgTime: 35, avgConsumption: 7.8 },
  ])

  const [rescheduledOrdersData] = useState([
    { id: "order123", customer: "Empresa ABC", reason: "Horario de recepción", newDate: "2024-01-16T14:30:00Z" },
    { id: "order145", customer: "Hotel Miraflores", reason: "Solicitud del cliente", newDate: "2024-01-17T10:00:00Z" },
    { id: "order167", customer: "Restaurante XYZ", reason: "Falta de personal", newDate: "2024-01-16T16:00:00Z" },
    { id: "order189", customer: "Clínica San Pablo", reason: "Cambio de prioridad", newDate: "2024-01-15T09:30:00Z" },
  ])

  useEffect(() => {
    if (!simulationResult) {
      dispatch(getSimulationResult(simulationId))
    }
  }, [dispatch, simulationId, simulationResult])

  if (!simulationResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando Resultados</CardTitle>
          <CardDescription>Obteniendo los resultados de la simulación</CardDescription>
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
    dispatch(resetSimulationState())
  }

  const handleExport = () => {
    // Convertir los resultados a JSON
    const dataStr = JSON.stringify(simulationResult, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    // Crear un enlace de descarga
    const exportFileDefaultName = `simulation-${simulationId}.json`
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleViewMap = () => {
    router.push("/mapa")
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <CardTitle>Resultados de Simulación</CardTitle>
              <CardDescription>
                Simulación completada el {formatDateTime(simulationResult.endTime || "")}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Exportar
              </Button>
              <Button variant="outline" onClick={handleViewMap}>
                <Map className="mr-2 h-4 w-4" /> Ver en mapa
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" /> Nueva Simulación
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Total de Días</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                  <p className="text-2xl font-bold">{simulationResult.summary.totalDays}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Pedidos Entregados</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex items-center">
                  <Package className="mr-2 h-5 w-5 text-muted-foreground" />
                  <p className="text-2xl font-bold">
                    {simulationResult.summary.totalDelivered}/{simulationResult.summary.totalOrders}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Eficiencia</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex items-center">
                  <PercentIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                  <p className="text-2xl font-bold">
                    {((simulationResult.summary.totalDelivered / simulationResult.summary.totalOrders) * 100).toFixed(
                      1,
                    )}
                    %
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Uso de Flota</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex items-center">
                  <Truck className="mr-2 h-5 w-5 text-muted-foreground" />
                  <p className="text-2xl font-bold">85.7%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {simulationResult.type === "until_collapse" && simulationResult.summary.collapseReason && (
            <Card className="mt-4 border-destructive">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                  <CardTitle className="text-base text-destructive">Razón del Colapso</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>{simulationResult.summary.collapseReason}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="summary">
            <FileText className="mr-2 h-4 w-4" /> Resumen
          </TabsTrigger>
          <TabsTrigger value="daily">
            <Calendar className="mr-2 h-4 w-4" /> Diario
          </TabsTrigger>
          <TabsTrigger value="districts">
            <MapPin className="mr-2 h-4 w-4" /> Distritos
          </TabsTrigger>
          <TabsTrigger value="fuel">
            <Fuel className="mr-2 h-4 w-4" /> Combustible
          </TabsTrigger>
          <TabsTrigger value="trucks">
            <Truck className="mr-2 h-4 w-4" /> Camiones
          </TabsTrigger>
          <TabsTrigger value="routes">
            <Clock className="mr-2 h-4 w-4" /> Rutas
          </TabsTrigger>
          <TabsTrigger value="zones">
            <PieChart className="mr-2 h-4 w-4" /> Zonas
          </TabsTrigger>
          <TabsTrigger value="rescheduled">
            <TrendingUp className="mr-2 h-4 w-4" /> Reprogramados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Simulación</CardTitle>
              <CardDescription>Métricas globales de la simulación</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Métrica</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Tipo de Simulación</TableCell>
                    <TableCell>{simulationResult.type}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Algoritmo</TableCell>
                    <TableCell>{simulationResult.algorithm}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tiempo de Inicio</TableCell>
                    <TableCell>{formatDateTime(simulationResult.startTime)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tiempo de Finalización</TableCell>
                    <TableCell>{formatDateTime(simulationResult.endTime || "")}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total de Días</TableCell>
                    <TableCell>{simulationResult.summary.totalDays}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total de Pedidos</TableCell>
                    <TableCell>{simulationResult.summary.totalOrders}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Pedidos Entregados</TableCell>
                    <TableCell>{simulationResult.summary.totalDelivered}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Pedidos Retrasados</TableCell>
                    <TableCell>{simulationResult.summary.totalDelayed}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tiempo Promedio de Entrega</TableCell>
                    <TableCell>{simulationResult.summary.averageDeliveryTime.toFixed(1)} h</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Consumo Total de Combustible</TableCell>
                    <TableCell>{simulationResult.summary.totalFuelConsumption.toFixed(1)} L</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total de Averías</TableCell>
                    <TableCell>{simulationResult.summary.totalBreakdowns}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Uso de Flota</TableCell>
                    <TableCell>85.7%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Eficiencia General</TableCell>
                    <TableCell>
                      {((simulationResult.summary.totalDelivered / simulationResult.summary.totalOrders) * 100).toFixed(
                        1,
                      )}
                      %
                    </TableCell>
                  </TableRow>
                  {simulationResult.type === "until_collapse" && simulationResult.summary.collapseReason && (
                    <TableRow>
                      <TableCell>Razón del Colapso</TableCell>
                      <TableCell>{simulationResult.summary.collapseReason}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Resultados Diarios</CardTitle>
              <CardDescription>Métricas detalladas por día de simulación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Día</TableHead>
                      <TableHead>Pedidos Recibidos</TableHead>
                      <TableHead>Pedidos Entregados</TableHead>
                      <TableHead>Pedidos Retrasados</TableHead>
                      <TableHead>Tiempo Promedio</TableHead>
                      <TableHead>Consumo de Combustible</TableHead>
                      <TableHead>Averías</TableHead>
                      <TableHead>Eficiencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {simulationResult.days.map((day) => (
                      <TableRow key={day.day}>
                        <TableCell className="font-medium">{day.day}</TableCell>
                        <TableCell>{day.metrics.ordersReceived}</TableCell>
                        <TableCell>{day.metrics.ordersDelivered}</TableCell>
                        <TableCell>{day.metrics.ordersDelayed}</TableCell>
                        <TableCell>{day.metrics.averageDeliveryTime.toFixed(1)} h</TableCell>
                        <TableCell>{day.metrics.fuelConsumption.toFixed(1)} L</TableCell>
                        <TableCell>{day.metrics.truckBreakdowns}</TableCell>
                        <TableCell>
                          {((day.metrics.ordersDelivered / day.metrics.ordersReceived) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="districts">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos por Distrito</CardTitle>
              <CardDescription>Distribución de pedidos atendidos por distrito o sector</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-md border">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Distrito</TableHead>
                        <TableHead>Pedidos</TableHead>
                        <TableHead>Volumen (m³)</TableHead>
                        <TableHead>Eficiencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {districtData.map((district) => (
                        <TableRow key={district.district}>
                          <TableCell className="font-medium">{district.district}</TableCell>
                          <TableCell>{district.orders}</TableCell>
                          <TableCell>{district.volume}</TableCell>
                          <TableCell>{district.efficiency}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex h-80 items-center justify-center rounded-md border">
                  <div className="text-center text-muted-foreground">
                    <BarChart2 className="mx-auto h-16 w-16 text-muted-foreground/50" />
                    <p className="mt-2">Gráfico de distribución por distrito</p>
                    <p className="text-sm">(En una implementación real, se mostraría un gráfico de barras)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel">
          <Card>
            <CardHeader>
              <CardTitle>Consumo de Combustible</CardTitle>
              <CardDescription>Reporte detallado del consumo de combustible por semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Consumo Semanal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Semana</TableHead>
                          <TableHead>Consumo (L)</TableHead>
                          <TableHead>Km Recorridos</TableHead>
                          <TableHead>Eficiencia (L/100km)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Semana 1</TableCell>
                          <TableCell>845.2</TableCell>
                          <TableCell>7,850</TableCell>
                          <TableCell>10.8</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Semana 2</TableCell>
                          <TableCell>782.5</TableCell>
                          <TableCell>7,320</TableCell>
                          <TableCell>10.7</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Total</TableCell>
                          <TableCell className="font-medium">1,627.7</TableCell>
                          <TableCell className="font-medium">15,170</TableCell>
                          <TableCell className="font-medium">10.7</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Métricas de Consumo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-md border p-4">
                          <div className="text-sm text-muted-foreground">Consumo Total</div>
                          <div className="mt-1 flex items-center">
                            <Fuel className="mr-2 h-5 w-5 text-amber-500" />
                            <div className="text-2xl font-bold">
                              {simulationResult.summary.totalFuelConsumption.toFixed(1)} L
                            </div>
                          </div>
                        </div>
                        <div className="rounded-md border p-4">
                          <div className="text-sm text-muted-foreground">Consumo Promedio</div>
                          <div className="mt-1 flex items-center">
                            <Fuel className="mr-2 h-5 w-5 text-green-500" />
                            <div className="text-2xl font-bold">10.7 L/100km</div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-md border p-4">
                        <div className="text-sm text-muted-foreground">Distribución de Consumo por Tipo de Camión</div>
                        <div className="mt-4 flex h-32 items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <PieChart className="mx-auto h-10 w-10 text-muted-foreground/50" />
                            <p className="mt-2 text-sm">
                              (En una implementación real, se mostraría un gráfico circular)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trucks">
          <Card>
            <CardHeader>
              <CardTitle>Camiones Más Eficientes</CardTitle>
              <CardDescription>Rendimiento de camiones según consumo y pedidos entregados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Placa</TableHead>
                      <TableHead>Entregas</TableHead>
                      <TableHead>Consumo (L/100km)</TableHead>
                      <TableHead>Distancia (km)</TableHead>
                      <TableHead>Eficiencia (%)</TableHead>
                      <TableHead>Rendimiento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {truckEfficiencyData.map((truck) => (
                      <TableRow key={truck.id}>
                        <TableCell className="font-medium">{truck.id}</TableCell>
                        <TableCell>{truck.plate}</TableCell>
                        <TableCell>{truck.deliveries}</TableCell>
                        <TableCell>{truck.consumption}</TableCell>
                        <TableCell>{truck.distance}</TableCell>
                        <TableCell>{truck.efficiency}%</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              truck.efficiency > 95 ? "success" : truck.efficiency > 90 ? "default" : "secondary"
                            }
                          >
                            {truck.efficiency > 95 ? "Excelente" : truck.efficiency > 90 ? "Bueno" : "Regular"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Camión Más Eficiente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Truck className="mr-2 h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">Truck1 (ABC-123)</div>
                        <div className="text-sm text-muted-foreground">97.2% eficiencia</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Mayor Número de Entregas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Package className="mr-2 h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Truck1 (ABC-123)</div>
                        <div className="text-sm text-muted-foreground">28 entregas</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Menor Consumo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Fuel className="mr-2 h-5 w-5 text-amber-500" />
                      <div>
                        <div className="font-medium">Truck5 (MNO-345)</div>
                        <div className="text-sm text-muted-foreground">8.5 L/100km</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes">
          <Card>
            <CardHeader>
              <CardTitle>Rutas Más Largas</CardTitle>
              <CardDescription>Identificación de rutas que tomaron más tiempo en completarse</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Ruta</TableHead>
                      <TableHead>Camión</TableHead>
                      <TableHead>Tiempo (min)</TableHead>
                      <TableHead>Distancia (km)</TableHead>
                      <TableHead>Pedidos</TableHead>
                      <TableHead>Tiempo/Pedido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routeTimeData
                      .sort((a, b) => b.time - a.time)
                      .map((route) => (
                        <TableRow key={route.id}>
                          <TableCell className="font-medium">{route.id}</TableCell>
                          <TableCell>{route.truck}</TableCell>
                          <TableCell>{route.time}</TableCell>
                          <TableCell>{route.distance}</TableCell>
                          <TableCell>{route.orders}</TableCell>
                          <TableCell>{(route.time / route.orders).toFixed(1)} min</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex h-80 items-center justify-center rounded-md border">
                <div className="text-center text-muted-foreground">
                  <Map className="mx-auto h-16 w-16 text-muted-foreground/50" />
                  <p className="mt-2">Visualización de rutas en el mapa</p>
                  <p className="text-sm">(En una implementación real, se mostraría un mapa con las rutas)</p>
                  <Button variant="outline" className="mt-4" onClick={handleViewMap}>
                    <Map className="mr-2 h-4 w-4" /> Ver en mapa completo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <CardTitle>Zonas Frecuentes</CardTitle>
              <CardDescription>Identificación de caminos o zonas que se repiten con más frecuencia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-md border">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Zona</TableHead>
                        <TableHead>Frecuencia</TableHead>
                        <TableHead>Tiempo Promedio</TableHead>
                        <TableHead>Consumo Promedio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {frequentZonesData
                        .sort((a, b) => b.frequency - a.frequency)
                        .map((zone) => (
                          <TableRow key={zone.zone}>
                            <TableCell className="font-medium">{zone.zone}</TableCell>
                            <TableCell>{zone.frequency}</TableCell>
                            <TableCell>{zone.avgTime} min</TableCell>
                            <TableCell>{zone.avgConsumption} L/100km</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex h-80 items-center justify-center rounded-md border">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="mx-auto h-16 w-16 text-muted-foreground/50" />
                    <p className="mt-2">Mapa de calor de zonas frecuentes</p>
                    <p className="text-sm">(En una implementación real, se mostraría un mapa de calor)</p>
                  </div>
                </div>
              </div>

              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Análisis de Zonas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Zona más frecuente:</span> Zona Central (42 visitas)
                    </p>
                    <p>
                      <span className="font-medium">Zona más eficiente:</span> Zona Central (7.8 L/100km)
                    </p>
                    <p>
                      <span className="font-medium">Zona más rápida:</span> Zona Central (35 min promedio)
                    </p>
                    <p>
                      <span className="font-medium">Recomendación:</span> Optimizar rutas en Zona Sur para reducir
                      tiempo promedio
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rescheduled">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Reprogramados</CardTitle>
              <CardDescription>Pedidos que fueron reprogramados a solicitud del cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Nueva Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rescheduledOrdersData.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.reason}</TableCell>
                        <TableCell>{formatDateTime(order.newDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Estadísticas de Reprogramación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-md border p-4">
                      <div className="text-sm text-muted-foreground">Total Reprogramados</div>
                      <div className="mt-1 text-2xl font-bold">{rescheduledOrdersData.length}</div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="text-sm text-muted-foreground">Motivo Principal</div>
                      <div className="mt-1 text-lg font-medium">Solicitud del cliente</div>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="text-sm text-muted-foreground">Impacto en Eficiencia</div>
                      <div className="mt-1 text-lg font-medium text-amber-500">-2.3%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
