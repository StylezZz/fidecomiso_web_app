import { Play, Pause, CircleAlert, RotateCcw, FileText, LogOut, Plus, AlertTriangle, Move3D, Focus, ZoomIn, ZoomOut, RotateCcw as ResetIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useMapContext } from "@/contexts/MapContext";
import { useEffect, useState } from "react";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { PedidoModal } from "@/components/map/PedidoModal";
import { AveriaModal } from "@/components/map/AveriaModal";
import SimulationService from "@/services/simulation.service";
import PedidosService from "@/services/pedidos.service";
import { toast } from "sonner";
import { PedidoFormData } from "@/interfaces/pedido.dto";
import { mapPedidoFormToDTO } from "@/utils/pedido-mapper";
import { PedidoI } from "@/interfaces/newinterfaces/pedido.interface";
import { SimulationType } from "@/interfaces/simulation.interface";

interface MapHeaderProp{
    setOpenSide: React.Dispatch<React.SetStateAction<boolean>>;
    onFitToScreen?: () => void;
}

export const MapHeader = ({ setOpenSide, onFitToScreen }: MapHeaderProp) => {
    const { manageTime, realTime, simulationTime, pedidosI, setPedidosI } = useMapContext();
    const { day, hour, minute } = simulationTime.time;
    const { initTimer, speedTime, displaySpeed, speedReal, startTimer, doPlusSpeed, restartTimer, simulationDate, stopTimer } = manageTime;
    const { hour: realHour, minute: realMinute, second: realSecond } = realTime.realTime;
    const { toast: toastHook } = useToast();
    
    // ✅ ESTADOS PARA LOS MODALES (movidos desde MapCanvas)
    const [showAveriaModal, setShowAveriaModal] = useState(false);
    const [showPedidoModal, setShowPedidoModal] = useState(false);

    const starTimerHeader = (): void => {
        startTimer();
        toastHook({
            title: "Notificación Timer",
            description: "Simulación iniciada",
        })
    }
    
    const stopTimerHeader = (): void => {
        stopTimer();
        toastHook({
            title: "Notificación Timer",
            description: "Simulación Detenida",
        })
    }
    
    const restartTimerHeader = (): void => {
        restartTimer(() => {
            realTime.restartRealTime();
            simulationTime.restartSimulationTime();
        });
        toastHook({
            title: "Notificación Timer",
            description: "Simulación Reiniciada",
        })
    }

    // ✅ HANDLER PARA REGISTRAR PEDIDO (en memoria y en base de datos)
    const handleRegistrarPedido = async (pedidoData: PedidoFormData) => {
        try {
            // Convertir los datos del formulario al formato esperado por el backend
            const pedidoDTO = mapPedidoFormToDTO(pedidoData);
            
            // Enviar el pedido al backend
            const response = await PedidosService.postPedido(pedidoDTO);
            
            if (response.success) {
                console.log("Pedido registrado:", response.data);
                toast.success("Pedido registrado correctamente");
                
                // Añadir el pedido al contexto para que se muestre en la tabla y en el mapa
                const nuevoPedido = response.data;
                
                // Convertir al formato PedidoI para el contexto
                const pedidoParaContexto: PedidoI = {
                    id: nuevoPedido.id || 0,
                    dia: nuevoPedido.dia,
                    hora: nuevoPedido.hora,
                    minuto: nuevoPedido.minuto,
                    posX: nuevoPedido.posX,
                    posY: nuevoPedido.posY,
                    idCliente: nuevoPedido.idCliente,
                    cantidadGLP: nuevoPedido.cantidadGLP,
                    horasLimite: nuevoPedido.horasLimite,
                    entregado: false,
                    cantidadGLPAsignada: nuevoPedido.cantidadGLP, // Inicialmente asignamos toda la cantidad
                    asignado: false,
                    horaDeInicio: nuevoPedido.horaDeInicio || 0,
                    anio: nuevoPedido.anio,
                    mesPedido: nuevoPedido.mesPedido,
                    tiempoLlegada: 0, // Valor por defecto
                    idCamion: "", // Sin camión asignado inicialmente
                    entregadoCompleto: false,
                    fechaDeRegistro: nuevoPedido.fechaDeRegistro || new Date().toISOString(),
                    fechaEntrega: "", // Sin fecha de entrega inicialmente
                    isbloqueo: false,
                    priodidad: 0, // Prioridad estándar
                    fecDia: nuevoPedido.fecDia || "",
                    tiempoRegistroStr: `${nuevoPedido.dia}d${nuevoPedido.hora}h${nuevoPedido.minuto}m`,
                    cliente: {
                        id: nuevoPedido.idCliente,
                        nombre: "", // Datos del cliente no disponibles en este punto
                        correo: "",
                        telefono: 0,
                        tipo: ""
                    },
                    horaInicio: nuevoPedido.horaInicio || 0
                };
                
                // Actualizar el contexto con el nuevo pedido
                setPedidosI(pedidosActuales => [...pedidosActuales, pedidoParaContexto]);
            } else {
                throw new Error(response.message || "Error al registrar pedido");
            }
        } catch (error) {
            console.error("Error al registrar pedido:", error);
            toast.error(`Error al registrar pedido: ${(error as Error).message}`);
        }
    };

    return (
        <>
            {/* Header simplificado - solo información básica */}
            <header className="flex h-12 justify-between items-center gap-4 border-b bg-background px-6 py-2 w-full">
                <div className="flex items-center gap-4">
                    <Link href="/simulaciones">
                        <Button variant="outline" size="sm">
                            <LogOut className="h-4 w-4 mr-1" /> Salir
                        </Button>
                    </Link>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">
                        Simulación: {day}d {hour}h {minute}m
                    </span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-600">
                        Real: {realHour}h {realMinute}m {realSecond}s
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => setShowPedidoModal(true)}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Pedido
                    </Button>
                    <Button 
                        onClick={() => setShowAveriaModal(true)} 
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Avería
                    </Button>
                </div>
            </header>

            {/* Controles en la parte inferior */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-4">
                    <div className="flex items-center gap-3">
                        {/* Controles de simulación */}
                        <div className="flex items-center gap-2">
                            <Button 
                                variant={initTimer ? "default" : "outline"} 
                                size="sm"
                                onClick={starTimerHeader}
                                className="h-9 w-9 p-0"
                            >
                                <Play className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant={!initTimer ? "default" : "outline"} 
                                size="sm"
                                onClick={stopTimerHeader}
                                className="h-9 w-9 p-0"
                            >
                                <Pause className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={restartTimerHeader}
                                className="h-9 w-9 p-0"
                            >
                                <ResetIcon className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="w-px h-6 bg-gray-300"></div>

                        {/* Controles de velocidad */}
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => doPlusSpeed(0.5)}
                                disabled={displaySpeed <= 0.5}
                                className="h-9 px-3 text-xs"
                            >
                                x0.5
                            </Button>
                            <Button 
                                variant="default" 
                                size="sm"
                                className="h-9 px-3 text-xs min-w-[50px]"
                            >
                                x{displaySpeed}
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => doPlusSpeed(2)}
                                disabled={displaySpeed >= 2}
                                className="h-9 px-3 text-xs"
                            >
                                x2
                            </Button>
                        </div>

                        <div className="w-px h-6 bg-gray-300"></div>

                        {/* Controles de mapa */}
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline"
                                size="sm"
                                onClick={onFitToScreen}
                                title="Ajustar mapa a pantalla"
                                className="h-9 w-9 p-0"
                            >
                                <Focus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modales */}
            {showPedidoModal && (
                <PedidoModal 
                    isOpen={showPedidoModal} 
                    onClose={() => setShowPedidoModal(false)}
                    onSubmit={handleRegistrarPedido}
                />
            )}
            
            {showAveriaModal && (
                <AveriaModal 
                    isOpen={showAveriaModal} 
                    onClose={() => setShowAveriaModal(false)}
                    onSubmit={async (camionId, tipoAveria) => {
                        try {
                            await SimulationService.registrarAveria(camionId, tipoAveria);
                            toast.success(`Avería registrada correctamente para el camión ${camionId}`);
                        } catch (error) {
                            toast.error(`Error al registrar avería: ${(error as Error).message}`);
                        }
                    }}
                />
            )}
        </>
    );
};