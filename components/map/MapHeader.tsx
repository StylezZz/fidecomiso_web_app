import { Play, Pause, CircleAlert, RotateCcw, FileText, LogOut, Plus, AlertTriangle, Move3D, Focus } from "lucide-react";
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
            <header className="flex h-14 justify-between items-center gap-4 border-b bg-background px-6 py-2 w-full">
                <div className="flex items-center gap-4">
                    <Link href="/simulaciones">
                        <Button variant="outline">
                            <LogOut /> Salir de Simulación
                        </Button>
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline"
                        onClick={onFitToScreen}
                        title="Ajustar mapa a pantalla"
                        className="flex items-center gap-1"
                    >
                        <Focus className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                        <span className="font-bold">Simulación: </span>
                        {day}d {hour}h {minute}m
                    </Button>
                    <Button variant="outline">
                        <span className="font-bold">Real: </span>
                        {realHour}h {realMinute}m {realSecond}s
                    </Button>
                    <Button variant={`${initTimer ? "default" : "outline"}`} onClick={starTimerHeader}>
                        <Play />
                    </Button>
                    <Button variant={`${!initTimer ? "default" : "outline"}`} onClick={stopTimerHeader}>
                        <Pause />
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => doPlusSpeed(0.5)}
                        disabled={displaySpeed <= 0.5}
                        className="flex items-center gap-1"
                    >
                        ⏪ x0.5
                    </Button>
                    <Button 
                        variant="default" 
                        onClick={() => doPlusSpeed(1)}
                        className="flex items-center gap-1 min-w-[60px]"
                    >
                        x{displaySpeed}
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => doPlusSpeed(2)}
                        disabled={displaySpeed >= 2}
                        className="flex items-center gap-1"
                    >
                        ⏩ x2
                    </Button>
                </div>
                
                {/* ✅ BOTONES MOVIDOS DESDE MapCanvas (reemplazando HOJA DE RUTA) */}
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => setShowPedidoModal(true)}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Nuevo Pedido
                    </Button>
                    <Button 
                        onClick={() => setShowAveriaModal(true)} 
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                    >
                        <AlertTriangle className="h-4 w-4" />
                        Registrar Avería
                    </Button>
                </div>
            </header>

            {/* ✅ MODALES MOVIDOS DESDE MapCanvas oli*/}
            <PedidoModal 
                isOpen={showPedidoModal}
                onClose={() => setShowPedidoModal(false)}
                onSubmit={handleRegistrarPedido}
            />
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
        </>
    )
}