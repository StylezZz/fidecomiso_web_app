"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { PlayCircle, Calendar, AlertOctagon, ExternalLink, Play, Trash, FileText, CheckCircle, Pause, MoreVertical, Trash2, Zap, Clock, AlertTriangle } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { getSimulationStatus, getSimulationResult, cancelSimulation } from "@/store/simulation/simulation-slice"
import { useSimulationContext } from "@/contexts/simulationContext"
import { Progress } from "../ui/progress"
import { SimulationInterface } from "@/interfaces/simulation.interface"
import { stat } from "fs"
import { formatearNombreArchivoPedido, formatearNombreBloqueos } from "@/utils/fetchTransform"
import { Spinner } from "../ui/spinner"
import { useMapContext } from "@/contexts/MapContext"
import SimulationService from "@/services/simulation.service"
import { toast } from "sonner"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "../ui/toast"
import { DropdownMenu } from "@radix-ui/react-dropdown-menu"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import useLegendSummary from "@/hooks/use-legend-summary"
type ActiveSimulationsProps = {
  onNewSimulation?: () => void
}

const EmptySimulationContent =({onNewSimulation}: ActiveSimulationsProps)=>{
  return(
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <p className="text-center text-muted-foreground">
      No existen Simulaciones registradas. Haga clic en "Nueva Simulación" para comenzar.
      </p>
      <Button onClick={onNewSimulation}>
        <PlayCircle className="mr-2 h-4 w-4" /> Nueva Simulación
      </Button>
    </div>
  )
}



export function ActiveSimulations({ onNewSimulation }: ActiveSimulationsProps) {
  const dispatch = useAppDispatch()
  const currentSimulation = useAppSelector((state) => state.simulation.currentSimulation)
  const {simulaciones,getAllSimulacion,loadingSimulaciones} = useSimulationContext();
  const [toastSimulacion,setToastSimulacion] = useState<boolean>(false);
  useEffect(()=>{
    getAllSimulacion();
  },[])


  useEffect(() => {
  const interval = setInterval(() => {
    if (currentSimulation?.id) {
      dispatch(getSimulationStatus(currentSimulation.id))
    }
  }, 1000)

  return () => clearInterval(interval)
}, [dispatch, currentSimulation?.id])


  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="w-full">
          <div className="flex justify-between w-100">
          <div className="flex flex-col gap-2">
          <CardTitle>Simulaciones Registradas</CardTitle>
          <CardDescription>Simulaciones Guardadas con pedidos y bloqueos | Solo se debe iniciar una simulación</CardDescription>
          </div>
          <Button onClick={onNewSimulation} className="w-[200px]">
            <PlayCircle className="mr-2 h-4 w-4" /> Nueva Simulación
          </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {
            loadingSimulaciones && <Spinner/>
          }
          {
             (!loadingSimulaciones&&simulaciones.length === 0) ? <EmptySimulationContent onNewSimulation={onNewSimulation}/>:
              simulaciones.map(simulacion => (
                <SimulationCard 
                key={simulacion.key}
                simulacion={simulacion} />
            )
              )   
          }
        </CardContent>
      </Card>
    </div>
  )
}

const SimulationCard = ({simulacion}:{simulacion: SimulationInterface})=>{
  const {anio,mes,dia,ihora,iminuto,active}=simulacion
  const [state,setState] = useState<"nolisto"|"listo" | "cargando">(active ? "listo" : "nolisto");
  const {setPedidosI,setBloqueosI, resetMap} = useMapContext();
  const {toast} =useToast()
  const {seleccionarSimulacion,verificarSimulacionSeleccionada,deleteSimulacion}= useSimulationContext();
  const router = useRouter()
  const {reset}= useLegendSummary();

  const handleViewMap = (simulationId: string= "") => {
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
      // qué debe eliminar?
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
          description: "Simulación operativa diaria"
        }
      case "Semanal":
        return {
          icon: Calendar,
          color: "bg-green-100 text-green-800 border-green-200",
          bgColor: "bg-green-50",
          borderColor: "border-l-green-500",
          name: "Semanal",
          description: "Simulación de planificación semanal"
        }
      case "Colapso":
        return {
          icon: AlertTriangle,
          color: "bg-red-100 text-red-800 border-red-200",
          bgColor: "bg-red-50",
          borderColor: "border-l-red-500",
          name: "Colapso",
          description: "Simulación crítica de colapso"
        }
      default:
        return {
          icon: FileText,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          bgColor: "bg-gray-50",
          borderColor: "border-l-gray-500",
          name: simulacion.tipo || "Desconocido",
          description: "Tipo de simulación"
        }
    }
  }

  const procesarNuevaSimulacion = async()=>{
    //colocar condicional que no iniciar si hay otro simulacion activa
    if(verificarSimulacionSeleccionada()){
      toast({
        variant:"destructive",
        description:"No puedes iniciar la simulación, hasta parar la activada",
        action:<ToastAction altText="Se canceló esta simulación">Se canceló esta simulación</ToastAction>
      })
      return;
    }
    try{
      setState('cargando');
      await SimulationService.initSimulation((dia*1440)+(ihora*60)+iminuto,10,dia,mes,anio,iminuto,ihora);
      const resPedido = await SimulationService.simulacionPedidoSemanal(anio,mes,dia,ihora,iminuto);
      const resBloqueo = await SimulationService.simulacionBloqueosSemanal(anio,mes,dia,ihora,iminuto);
      setPedidosI(resPedido.data);
      setBloqueosI(resBloqueo.data);
      //colocar inicializar simulacion
      seleccionarSimulacion(simulacion);
      new Promise(resolve => setTimeout(resolve,3000)); //para asegurar el usestate de seleccionar simulacion
      setState('listo');
    }
    catch(error){
      setState('nolisto');
    }
  }

    const getStatusConfig = () => {
      switch (state) {
        case "listo":
          return {
            badge: { text: "Completada", variant: "secondary" as const, color: "bg-green-100 text-green-800 border-green-200" },
            title: "Simulación Completada",
            description: "La simulación ha terminado exitosamente. Puedes ver los resultados en el mapa.",
            color: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 flex items-center gap-1 px-2 py-0.5 whitespace-nowrap",
            icon: CheckCircle,
            text: "Completada"
          };
        case "cargando":
          return {
            badge: { text: "En Proceso", variant: "outline" as const, color: "bg-blue-100 text-blue-800 border-blue-200" },
            title: "Simulación en Proceso",
            description: "La simulación está ejecutándose. Por favor espera a que termine.",
            color: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 flex items-center gap-1 px-2 py-0.5 whitespace-nowrap",
            icon: Clock,
            text: "En Proceso"
          };
        default:
          return {
            badge: { text: "Pendiente", variant: "outline" as const, color: "bg-gray-100 text-gray-800 border-gray-200" },
            title: "Simulación Pendiente",
            description: "La simulación está lista para ejecutarse.",
            color: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 flex items-center gap-1 px-2 py-0.5 whitespace-nowrap",
            icon: Clock,
            text: "Pendiente"
          };
      }
    };

    const statusConfig = getStatusConfig();
    const typeConfig = getSimulationTypeConfig();
    const archivoPedidoMes = ()=>{
      if(simulacion.mesPedido.toString().length == 1)return "0"+simulacion.mesPedido.toString();
      else return simulacion.mesPedido.toString();
    }
    const archivoBloqueoMes =()=>{
      if(simulacion.mesBloqueo.toString().length ==1) return "0"+simulacion.mesBloqueo.toString();
      else return simulacion.mesBloqueo.toString();
    }

    return (
      <Card
        className={`border-l-4 ${
          state === "nolisto"
            ? typeConfig.borderColor
              : state === "cargando"
                ? "border-l-green-500"
                : "border-l-green-600"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">Simulación</h3>
              <Badge className={typeConfig.color}>
                <typeConfig.icon className="h-3 w-3 mr-1" />
                {typeConfig.name}
              </Badge>
              {state !== "nolisto" && (
                <Badge className={statusConfig.color}>
                  <statusConfig.icon className="h-3 w-3 mr-1" />
                  {statusConfig.text}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {(state === "listo") && (
                <Button variant="outline" size="sm" onClick={()=>{handleViewMap("")}}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver en Mapa
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={()=>{
                      deleteSimulacion(simulacion);
                    }}  
                  >
                    <Trash2 className="w-4 h-4 mr-2"/>
                    Eliminar 
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4"/>
            {typeConfig.description} • Creada el {simulacion.fechaInicial} {simulacion.hora}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Section */}
          <div className={`${typeConfig.bgColor} rounded-lg p-4 space-y-3`}>
            <div className="flex items-center space-x-2">
              {state === "cargando" && <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />}
              {state === "listo" && <CheckCircle className="w-4 h-4 text-green-600" />}
              {state === "nolisto" && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
              <span className="font-medium">{statusConfig.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">{statusConfig.description}</p>

            {state === "cargando" && (
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                    style={{animation: "bounce 0.5s infinite", animationDelay: "0ms",}}
                  ></div>
                  <div
                    className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                    style={{animation: "bounce 0.5s infinite", animationDelay: "150ms",}}
                  ></div>
                  <div
                    className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                    style={{animation: "bounce 0.5s infinite" ,animationDelay: "300ms", }}
                  ></div>
                </div>
                <span className="text-muted-foreground">Procesando simulación...</span>
              </div>
            )}
          </div>

          {/* Simulation Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Tipo:</span>
              <p className="font-medium">{simulacion.tipo}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Pedidos:</span>
              <p className="font-medium">{simulacion.pedidosNum !== -1 ? `${simulacion.pedidosNum} Pedidos Totales`: `No definido`}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Estado:</span>
              <p className="font-medium">{statusConfig.badge.text}</p>
            </div>
          </div>

          {/* Files Used */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Archivos utilizados:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2 bg-muted/50 rounded p-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>Pedidos: {simulacion.anioPedido?  formatearNombreArchivoPedido("ventas"+simulacion.anioPedido.toString()+archivoPedidoMes()+".txt") : "No definido"}</span>
              </div>
              <div className="flex items-center space-x-2 bg-muted/50 rounded p-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>Bloqueos: {simulacion.anioBloqueo?  formatearNombreBloqueos(simulacion.anioBloqueo.toString()+archivoBloqueoMes()+".bloqueos.txt") : "No definido"}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button disabled={state=="listo"} onClick={()=>procesarNuevaSimulacion()}>
                <Play className="h-4 w-4 mr-2"/> Iniciar Simulación
              </Button>
              <Button disabled={state=="listo"} onClick={handleReset}>
                <Trash className="h-4 w-4 mr-2"/> Reset
              </Button>
              {
                state=="cargando" &&
                <Button className="space-x-2 bg-red-600 hover:bg-red-400" >
                  <Pause className="h-4 w-4" />
                </Button>
              }
            </div>
          </div>
        </CardContent>
      </Card>
    )
}