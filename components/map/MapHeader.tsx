import {
  Play,
  Pause,
  LogOut,
  Plus,
  AlertTriangle,
  Focus,
  RotateCcw as ResetIcon,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useMapContext } from "@/contexts/MapContext";
import PedidosService from "@/services/pedidos.service";
import { PedidoFormData } from "@/interfaces/pedido.dto";
import { mapPedidoFormToDTO } from "@/utils/pedido-mapper";
import { PedidoModal } from "@/components/map/PedidoModal";
import { AveriaModal } from "@/components/map/AveriaModal";
import SimulationService from "@/services/simulation.service";
import { PedidoI } from "@/interfaces/newinterfaces/pedido.interface";
import { ElegantHeader } from "@/components/map/header/elegant-header";
import { MantenimientoModal } from "@/components/map/MantenimientoModal";

interface MapHeaderProp {
  setOpenSide: React.Dispatch<React.SetStateAction<boolean>>;
  onFitToScreen?: () => void;
}

export const MapHeader = ({ setOpenSide, onFitToScreen }: MapHeaderProp) => {
  const { manageTime, realTime, simulationTime, pedidosI, setPedidosI } = useMapContext();
  const { day, hour, minute } = simulationTime.time;
  const { initTimer, displaySpeed, startTimer, doPlusSpeed, restartTimer, stopTimer } = manageTime;
  const { hour: realHour, minute: realMinute, second: realSecond } = realTime.realTime;
  const { toast: toastHook } = useToast();

  const [showAveriaModal, setShowAveriaModal] = useState(false);
  const [showPedidoModal, setShowPedidoModal] = useState(false);
  const [showMantenimientoModal, setShowMantenimientoModal] = useState(false);

  const starTimerHeader = (): void => {
    startTimer();
    toastHook({
      title: "Notificación Timer",
      description: "Simulación iniciada",
    });
  };

  const stopTimerHeader = (): void => {
    stopTimer();
    toastHook({
      title: "Notificación Timer",
      description: "Simulación Detenida",
    });
  };

  const restartTimerHeader = (): void => {
    restartTimer(() => {
      realTime.restartRealTime();
      simulationTime.restartSimulationTime();
    });
    toastHook({
      title: "Notificación Timer",
      description: "Simulación Reiniciada",
    });
  };

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
            tipo: "",
          },
          horaInicio: nuevoPedido.horaInicio || 0,
        };

        // Actualizar el contexto con el nuevo pedido
        setPedidosI((pedidosActuales) => [...pedidosActuales, pedidoParaContexto]);
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
      <ElegantHeader
        // Datos reales del contexto (elimina los hardcodeados)
        day={day}
        hour={hour}
        minute={minute}
        realHour={realHour}
        realMinute={realMinute}
        realSecond={realSecond}
        // Modales
        setShowPedidoModal={setShowPedidoModal}
        setShowAveriaModal={setShowAveriaModal}
        setShowMantenimientoModal={setShowMantenimientoModal}
        // Controles de simulación
        initTimer={initTimer}
        onPlay={starTimerHeader}
        onPause={stopTimerHeader}
        onReset={restartTimerHeader}
        // Controles de velocidad
        displaySpeed={displaySpeed}
        onSpeedChange={doPlusSpeed}
        // Control de mapa
        onFitToScreen={onFitToScreen}
      />

      {/* Solo mantén los modales - elimina toda la sección flotante del bottom */}
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

      {showMantenimientoModal && (
        <MantenimientoModal
          isOpen={showMantenimientoModal}
          onClose={() => setShowMantenimientoModal(false)}
          onSubmit={async (camionId, tipoMantenimiento) => {
            try {
              await SimulationService.registrarAveria(camionId, 4);
              toast.success(`Mantenimiento programado correctamente para el camión ${camionId}`);
            } catch (error) {
              toast.error(`Error al programar mantenimiento: ${(error as Error).message}`);
            }
          }}
        />
      )}
    </>
  );
}
