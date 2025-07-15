"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { getSimulationStatus, getSimulationResult, cancelSimulation } from "@/store/simulation/simulation-slice"
import { useToast } from "@/hooks/use-toast"
import { X, Play, Pause, Clock, Calendar, AlertOctagon, Package, Truck, Map, BarChart } from "lucide-react"
import { useRouter } from "next/navigation"

type SimulationStatusProps = {
  simulationId: string
}

export function SimulationStatus({ simulationId }: SimulationStatusProps) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [simulationTime, setSimulationTime] = useState("00:00:00")
  const [simulationDay, setSimulationDay] = useState(1)
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [activeTab, setActiveTab] = useState("progress")

  const currentSimulation = useAppSelector((state) => state.simulation.currentSimulation)
  const simulationTypes = useAppSelector((state) => state.simulation.simulationTypes)

  // Datos simulados para las métricas en tiempo real
  const [liveMetrics, setLiveMetrics] = useState({
    ordersReceived: 0,
    ordersDelivered: 0,
    ordersInProgress: 0,
    trucksActive: 0,
    trucksAvailable: 0,
    fuelConsumed: 0,
  })

  useEffect(() => {
    // Iniciar el intervalo para actualizar el estado
    if (!isPaused) {
      const id = setInterval(() => {
        dispatch(getSimulationStatus(simulationId))
      }, 1000 / simulationSpeed)

      setIntervalId(id)

      // Limpiar el intervalo cuando el componente se desmonte
      return () => {
        if (id) clearInterval(id)
      }
    } else {
      // Si está pausado, limpiar el intervalo
      if (intervalId) {
        clearInterval(intervalId)
        setIntervalId(null)
      }
    }
  }, [dispatch, simulationId, isPaused, simulationSpeed])

  // Efecto para actualizar el tiempo de simulación
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setSimulationTime((prev) => {
          const [hours, minutes, seconds] = prev.split(":").map(Number)
          let newSeconds = seconds + 1
          let newMinutes = minutes
          let newHours = hours

          if (newSeconds >= 60) {
            newSeconds = 0
            newMinutes += 1
          }

          if (newMinutes >= 60) {
            newMinutes = 0
            newHours += 1
          }

          return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}:${String(newSeconds).padStart(2, "0")}`
        })

        // Actualizar el día de simulación cada 30 segundos (simulado)
        if (Math.random() > 0.97) {
          setSimulationDay((prev) => prev + 1)
        }
      }, 1000 / simulationSpeed)

      return () => clearInterval(timer)
    }
  }, [isPaused, simulationSpeed])

  useEffect(() => {
    // Si la simulación está completa, obtener los resultados y detener el intervalo
    if (currentSimulation.status === "completed") {
      dispatch(getSimulationResult(simulationId))
      if (intervalId) {
        clearInterval(intervalId)
        setIntervalId(null)
      }
    }
  }, [currentSimulation.status, dispatch, intervalId, simulationId])

  const handleCancel = async () => {
    try {
      await dispatch(cancelSimulation(simulationId)).unwrap()
      toast({
        title: "Simulación cancelada",
        description: "La simulación ha sido cancelada",
      })

      // Detener el intervalo
      if (intervalId) {
        clearInterval(intervalId)
        setIntervalId(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar la simulación",
        variant: "destructive",
      })
    }
  }

  const handlePauseResume = () => {
    setIsPaused(!isPaused)
  }

  const handleSpeedChange = (speed: number) => {
    setSimulationSpeed(speed)
  }

  const handleViewMap = () => {
    router.push("/mapa")
  }

  const getSimulationTypeName = (typeId: string) => {
    const type = simulationTypes.find((t) => t.id === typeId)
    return type ? type.name : typeId
  }

  const getSimulationTypeIcon = (type: string | null) => {
    switch (type) {
      case "daily":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "weekly":
        return <Calendar className="h-5 w-5 text-green-500" />
      case "until_collapse":
        return <AlertOctagon className="h-5 w-5 text-red-500" />
      default:
        return <Calendar className="h-5 w-5" />
    }
  }

  // Actualizar métricas en tiempo real
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setLiveMetrics((prev) => ({
          ordersReceived: prev.ordersReceived + (Math.random() > 0.8 ? 1 : 0),
          ordersDelivered: prev.ordersDelivered + (Math.random() > 0.85 ? 1 : 0),
          ordersInProgress: Math.min(5, Math.max(0, prev.ordersInProgress + (Math.random() > 0.5 ? 1 : -1))),
          trucksActive: Math.min(
            4,
            Math.max(1, prev.trucksActive + (Math.random() > 0.9 ? (Math.random() > 0.5 ? 1 : -1) : 0)),
          ),
          trucksAvailable: Math.min(6, Math.max(1, 6 - prev.trucksActive)),
          fuelConsumed: prev.fuelConsumed + Math.random() * 0.5,
        }))
      }, 2000 / simulationSpeed)

      return () => clearInterval(timer)
    }
  }, [isPaused, simulationSpeed])

  return (
    <Card className="border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getSimulationTypeIcon(currentSimulation.type)}
            <div className="ml-2">
              <CardTitle>Simulación en Progreso</CardTitle>
              <CardDescription>
                {getSimulationTypeName(currentSimulation.type || "")} - Día {simulationDay}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isPaused ? "outline" : "default"}>{isPaused ? "Pausado" : "En ejecución"}</Badge>
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" /> {simulationTime}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress">
              <BarChart className="mr-2 h-4 w-4" /> Progreso
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <Package className="mr-2 h-4 w-4" /> Métricas
            </TabsTrigger>
            <TabsTrigger value="fleet">
              <Truck className="mr-2 h-4 w-4" /> Flota
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Progreso</span>
                <span className="text-sm font-medium">{currentSimulation.progress}%</span>
              </div>
              <Progress value={currentSimulation.progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Pedidos Recibidos</div>
                  <div className="mt-1 flex items-center">
                    <Package className="mr-1 h-4 w-4 text-muted-foreground" />
                    <div className="text-xl font-bold">{liveMetrics.ordersReceived}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Pedidos Entregados</div>
                  <div className="mt-1 flex items-center">
                    <Package className="mr-1 h-4 w-4 text-green-500" />
                    <div className="text-xl font-bold">{liveMetrics.ordersDelivered}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Camiones Activos</div>
                  <div className="mt-1 flex items-center">
                    <Truck className="mr-1 h-4 w-4 text-blue-500" />
                    <div className="text-xl font-bold">{liveMetrics.trucksActive}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Combustible</div>
                  <div className="mt-1 flex items-center">
                    <Truck className="mr-1 h-4 w-4 text-amber-500" />
                    <div className="text-xl font-bold">{liveMetrics.fuelConsumed.toFixed(1)} L</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="rounded-md border p-4">
              <h3 className="text-sm font-medium">Métricas en Tiempo Real</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pedidos Recibidos:</span>
                  <span className="text-sm font-medium">{liveMetrics.ordersReceived}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pedidos Entregados:</span>
                  <span className="text-sm font-medium">{liveMetrics.ordersDelivered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pedidos en Progreso:</span>
                  <span className="text-sm font-medium">{liveMetrics.ordersInProgress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Eficiencia:</span>
                  <span className="text-sm font-medium">
                    {liveMetrics.ordersReceived > 0
                      ? ((liveMetrics.ordersDelivered / liveMetrics.ordersReceived) * 100).toFixed(1)
                      : "100"}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Combustible Consumido:</span>
                  <span className="text-sm font-medium">{liveMetrics.fuelConsumed.toFixed(1)} L</span>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleViewMap}>
              <BarChart className="mr-2 h-4 w-4" /> Ver Gráficos Detallados
            </Button>
          </TabsContent>

          <TabsContent value="fleet" className="space-y-4">
            <div className="rounded-md border p-4">
              <h3 className="text-sm font-medium">Estado de la Flota</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Camiones Activos:</span>
                  <span className="text-sm font-medium">{liveMetrics.trucksActive}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Camiones Disponibles:</span>
                  <span className="text-sm font-medium">{liveMetrics.trucksAvailable}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Uso de Flota:</span>
                  <span className="text-sm font-medium">
                    {(
                      (liveMetrics.trucksActive / (liveMetrics.trucksActive + liveMetrics.trucksAvailable)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleViewMap}>
              <Map className="mr-2 h-4 w-4" /> Ver Mapa en Tiempo Real
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <div className="flex space-x-1">
            <Button variant="outline" size="sm" onClick={handlePauseResume}>
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button
              variant={simulationSpeed === 0.5 ? "default" : "outline"}
              size="sm"
              onClick={() => handleSpeedChange(0.5)}
            >
              x0.5
            </Button>
            <Button
              variant={simulationSpeed === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => handleSpeedChange(1)}
            >
              x1
            </Button>
            <Button
              variant={simulationSpeed === 2 ? "default" : "outline"}
              size="sm"
              onClick={() => handleSpeedChange(2)}
            >
              x2
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleViewMap}>
              <Map className="mr-2 h-4 w-4" /> Ver Mapa
            </Button>
            <Button variant="destructive" size="sm" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" /> Cancelar Simulación
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
