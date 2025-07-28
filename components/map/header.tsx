import { ElegantHeader } from "@/components/map/header/upgrade-header";
import { PedidoModal } from "@/components/map/modals/new-order";
import { AveriaModal } from "@/components/map/modals/truck-breakdown";
import { MantenimientoModal } from "@/components/map/modals/truck-maintenance";
import { useMapContext } from "@/contexts/ContextMap";
import { useToast } from "@/hooks/use-toast";
import { PedidoFormData } from "@/interfaces/pedido.dto";
import { PedidoI } from "@/interfaces/simulation/pedido.interface";
import PedidosService from "@/services/orders.service";
import SimulationService from "@/services/simulation.service";
import { useSimulationContext } from "@/contexts/ContextSimulation";
import { mapPedidoFormToDTO } from "@/utils/pedido-mapper";
import { useState } from "react";
import { toast } from "sonner";

interface MapHeaderProp {
  setOpenSide: React.Dispatch<React.SetStateAction<boolean>>;
  onFitToScreen?: () => void;
}

export const MapHeader = ({ setOpenSide, onFitToScreen }: MapHeaderProp) => {
  const { manageTime, realTime, simulationTime, pedidosI, setPedidosI } = useMapContext();
  const { simulacionSeleccionada } = useSimulationContext();
  const { day, hour, minute } = simulationTime.time;
  const { anio, mes } = simulacionSeleccionada;

  const adjustDateForDisplay = (day: number, mes: number, anio: number) => {
    const getDaysInMonth = (year: number, month: number) => {
      return new Date(year, month, 0).getDate();
    };

    let adjustedDay = day;
    let adjustedMonth = mes;
    let adjustedYear = anio;

    // Mientras el día sea mayor al último día del mes
    while (adjustedDay > getDaysInMonth(adjustedYear, adjustedMonth)) {
      adjustedDay -= getDaysInMonth(adjustedYear, adjustedMonth);
      adjustedMonth++;

      if (adjustedMonth > 12) {
        adjustedMonth = 1;
        adjustedYear++;
      }
    }

    return { day: adjustedDay, month: adjustedMonth, year: adjustedYear };
  };
  const displayDate = adjustDateForDisplay(day, mes, anio);

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

  // ✅ FUNCIÓN PARA REFRESCAR PEDIDOS DESDE EL BACKEND
  const refreshPedidosFromBackend = async () => {
    try {
      // Obtener días según el tipo de simulación
      const getDiasSimulacion = (day: number): number[] => {
        // Esta lógica puede variar según el tipo de simulación
        return [day]; // Por ahora solo el día actual, puedes expandir según necesites
      };

      const dias = getDiasSimulacion(day);
      const response = await PedidosService.getOrders(dias, anio, mes);

      if (response.success && response.data?.pedidos) {
        // Convertir los pedidos del backend al formato del contexto
        const pedidosActualizados: PedidoI[] = response.data.pedidos.map((pedido: any) => ({
          id: pedido.id || 0,
          dia: pedido.dia,
          hora: pedido.hora,
          minuto: pedido.minuto,
          posX: pedido.posX,
          posY: pedido.posY,
          idCliente: pedido.idCliente,
          cantidadGLP: pedido.cantidadGLP,
          horasLimite: pedido.horasLimite,
          entregado: pedido.entregado || false,
          cantidadGLPAsignada: pedido.cantidadGLP,
          asignado: pedido.asignado || false,
          horaDeInicio: pedido.horaDeInicio || 0,
          anio: pedido.anio,
          mesPedido: pedido.mesPedido,
          tiempoLlegada: pedido.tiempoLlegada || 0,
          idCamion: pedido.idCamion || "",
          entregadoCompleto: pedido.entregadoCompleto || false,
          fechaDeRegistro: pedido.fechaDeRegistro || new Date().toISOString(),
          fechaEntrega: pedido.fechaEntrega || "",
          isbloqueo: pedido.isbloqueo || false,
          priodidad: pedido.priodidad || 0,
          fecDia: pedido.fecDia || "",
          tiempoRegistroStr: `${pedido.dia}d${pedido.hora}h${pedido.minuto}m`,
          cliente: {
            id: pedido.idCliente,
            nombre: "",
            correo: "",
            telefono: 0,
            tipo: "",
          },
          horaInicio: pedido.horaInicio || 0,
        }));

        setPedidosI(pedidosActualizados);
      }
    } catch (error) {
      console.error("Error al refrescar pedidos:", error);
      toast.error("Error al actualizar la lista de pedidos");
    }
  };

  // ✅ HANDLER PARA REGISTRAR PEDIDO MANUAL (en memoria y en base de datos)
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
          cantidadGLPAsignada: nuevoPedido.cantidadGLP,
          asignado: false,
          horaDeInicio: nuevoPedido.horaDeInicio || 0,
          anio: nuevoPedido.anio,
          mesPedido: nuevoPedido.mesPedido,
          tiempoLlegada: 0,
          idCamion: "",
          entregadoCompleto: false,
          fechaDeRegistro: nuevoPedido.fechaDeRegistro || new Date().toISOString(),
          fechaEntrega: "",
          isbloqueo: false,
          priodidad: 0,
          fecDia: nuevoPedido.fecDia || "",
          tiempoRegistroStr: `${nuevoPedido.dia}d${nuevoPedido.hora}h${nuevoPedido.minuto}m`,
          cliente: {
            id: nuevoPedido.idCliente,
            nombre: "",
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

  // ✅ HANDLER PARA CUANDO SE CIERRE EL MODAL
  const handleCloseModal = () => {
    setShowPedidoModal(false);
    // Refrescar pedidos cuando se cierre el modal por si se procesó un archivo
    refreshPedidosFromBackend();
  };

  return (
    <>
      <ElegantHeader
        // Datos reales del contexto
        day={displayDate.day}
        month={displayDate.month}
        year={displayDate.year}
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

      {/* Modal de Pedidos con funcionalidad expandida */}
      {showPedidoModal && (
        <PedidoModal
          isOpen={showPedidoModal}
          onClose={handleCloseModal} // Usa el nuevo handler que refresca los datos
          onSubmit={handleRegistrarPedido} // Para pedidos manuales
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
};
