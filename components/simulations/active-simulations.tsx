"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { PlayCircle, Calendar, AlertOctagon, ExternalLink, Play, Trash, FileText, CheckCircle, Pause, MoreVertical, Trash2, Zap, Clock, AlertTriangle, MapPin, Truck, Settings, Eye } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { getSimulationStatus, getSimulationResult, cancelSimulation } from "@/store/simulation/simulation-slice"
import { useSimulationContext } from "@/contexts/simulationContext"
import { Progress } from "../ui/progress"
import { SimulationInterface } from "@/interfaces/simulation.interface"
import { formatearNombreArchivoPedido, formatearNombreBloqueos } from "@/utils/fetchTransform"
import { Spinner } from "../ui/spinner"
import { useMapContext } from "@/contexts/MapContext"
import SimulationService from "@/services/simulation.service"
import { toast } from "sonner"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "../ui/toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import useLegendSummary from "@/hooks/use-legend-summary"

type ActiveSimulationsProps = {
  onNewSimulation?: () => void
}

const EmptySimulationContent = ({ onNewSimulation }: ActiveSimulationsProps) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-16">
      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full">
        <Zap className="h-12 w-12 text-blue-500" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">No hay simulaciones registradas</h3>
        <p className="text-gray-600 max-w-md">
          Comienza creando tu primera simulación para optimizar las rutas de distribución de GLP
        </p>
      </div>
      <Button 
        onClick={onNewSimulation}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        size="lg"
      >
        <PlayCircle className="mr-2 h-5 w-5" /> 
        Crear Primera Simulación
      </Button>
    </div>
  )
}

export function ActiveSimulations({ onNewSimulation }: ActiveSimulationsProps) {
  const dispatch = useAppDispatch()
  const currentSimulation = useAppSelector((state) => state.simulation.currentSimulation)
  const { simulaciones, getAllSimulacion, loadingSimulaciones } = useSimulationContext();
  const [toastSimulacion, setToastSimulacion] = useState<boolean>(false);
  
  useEffect(() => {
    getAllSimulacion();
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentSimulation?.id) {
        dispatch(getSimulationStatus(currentSimulation.id))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [dispatch, currentSimulation?.id])

  return (
    <div className="space-y-6">
      {loadingSimulaciones ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Spinner />
            <span className="text-gray-600">Cargando simulaciones...</span>
          </div>
        </div>
      ) : simulaciones.length === 0 ? (
        <EmptySimulationContent onNewSimulation={onNewSimulation} />
      ) : (
        <div className="grid gap-6">
          {simulaciones.map(simulacion => (
            <SimulationCard 
              key={simulacion.key}
              simulacion={simulacion} 
            />
          ))}
        </div>
      )}
    </div>
  )
}

const SimulationCard = ({ simulacion }: { simulacion: SimulationInterface }) => {
  const { anio, mes, dia, ihora, iminuto, active } = simulacion
  const [state, setState] = useState<"nolisto" | "listo" | "cargando">(active ? "listo" : "nolisto");
  const { setPedidosI, setBloqueosI, resetMap } = useMapContext();
  const { toast } = useToast()
  const { seleccionarSimulacion, verificarSimulacionSeleccionada, deleteSimulacion } = useSimulationContext();
  const router = useRouter()
  const { reset } = useLegendSummary();

  const handleViewMap = (simulationId: string = "") => {
    router.push("/mapa")
  }

  const handleReset = async () => {
    try {
      await SimulationService.resetSimulation();
      resetMap();
      reset();
      toast({
        description: "Simulación reseteada correctamente.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Error al resetear la simulación.",
      });
    }
  }

  // Función para obtener configuración visual de tipos de simulación
  const getSimulationTypeConfig = () => {
    switch (simulacion.tipo) {
      case "Dia a Dia":
        return {
          icon: Clock,
          color: "bg-blue-100 text-blue-800 border-blue-200",
          bgColor: "bg-blue-50",
          borderColor: "border-l-blue-500",
          name: "Día a Día",
          description: "Simulación operativa diaria",
          gradient: "from-blue-500 to-blue-600"
        }
      case "Semanal":
        return {
          icon: Calendar,
          color: "bg-green-100 text-green-800 border-green-200",
          bgColor: "bg-green-50",
          borderColor: "border-l-green-500",
          name: "Semanal",
          description: "Simulación de planificación semanal",
          gradient: "from-green-500 to-green-600"
        }
      case "Colapso":
        return {
          icon: AlertTriangle,
          color: "bg-red-100 text-red-800 border-red-200",
          bgColor: "bg-red-50",
          borderColor: "border-l-red-500",
          name: "Colapso",
          description: "Simulación crítica de colapso",
          gradient: "from-red-500 to-red-600"
        }
      default:
        return {
          icon: FileText,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          bgColor: "bg-gray-50",
          borderColor: "border-l-gray-500",
          name: simulacion.tipo || "Desconocido",
          description: "Tipo de simulación",
          gradient: "from-gray-500 to-gray-600"
        }
    }
  }

  const procesarNuevaSimulacion = async () => {
    if (verificarSimulacionSeleccionada()) {
      toast({
        variant: "destructive",
        description: "No puedes iniciar la simulación, hasta parar la activada",
        action: <ToastAction altText="Se canceló esta simulación">Se canceló esta simulación</ToastAction>
      })
      return;
    }
    try {
      setState('cargando');
      await SimulationService.initSimulation((dia * 1440) + (ihora * 60) + iminuto, 10, dia, mes, anio, iminuto, ihora);
      const resPedido = await SimulationService.simulacionPedidoSemanal(anio, mes, dia, ihora, iminuto);
      const resBloqueo = await SimulationService.simulacionBloqueosSemanal(anio, mes, dia, ihora, iminuto);
      setPedidosI(resPedido.data);
      setBloqueosI(resBloqueo.data);
      seleccionarSimulacion(simulacion);
      new Promise(resolve => setTimeout(resolve, 3000));
      setState('listo');
    } catch (error) {
      setState('nolisto');
    }
  }

  const getStatusConfig = () => {
    switch (state) {
      case "listo":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-100",
          text: "Listo para ejecutar",
          badge: "success"
        }
      case "cargando":
        return {
          icon: Spinner,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          text: "Inicializando...",
          badge: "secondary"
        }
      case "nolisto":
        return {
          icon: AlertTriangle,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
          text: "Pendiente de configuración",
          badge: "outline"
        }
    }
  }

  const config = getSimulationTypeConfig();
  const statusConfig = getStatusConfig();

  const archivoPedidoMes = () => {
    return formatearNombreArchivoPedido(anio.toString());
  }

  const archivoBloqueoMes = () => {
    return formatearNombreBloqueos(anio.toString());
  }

  return (
    <Card className={`border-l-4 ${config.borderColor} hover:shadow-lg transition-all duration-200 group`}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Información principal */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient}`}>
                <config.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900">{config.name}</h3>
                  <Badge variant={statusConfig.badge as any} className="text-xs">
                    {statusConfig.text}
                  </Badge>
                </div>
                <p className="text-gray-600">{config.description}</p>
                
                {/* Detalles de la simulación */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {dia}/{mes}/{anio}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {ihora.toString().padStart(2, '0')}:{iminuto.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {archivoPedidoMes()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {archivoBloqueoMes()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={procesarNuevaSimulacion}
              disabled={state === "cargando"}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              size="sm"
            >
              {state === "cargando" ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {state === "cargando" ? "Iniciando..." : "Iniciar"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewMap()}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver en Mapa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReset}>
                  <Settings className="mr-2 h-4 w-4" />
                  Resetear
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => deleteSimulacion(simulacion)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}