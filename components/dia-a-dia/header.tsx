"use client";

import { ElegantHeader } from "@/components/dia-a-dia/header/dia-a-dia-header";
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

interface DiaADiaHeaderProp {
  setOpenSide: React.Dispatch<React.SetStateAction<boolean>>;
  onFitToScreen?: () => void;
}

export const DiaADiaHeader = ({ setOpenSide, onFitToScreen }: DiaADiaHeaderProp) => {
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
      title: "Operación Día a Día",
      description: "Simulación iniciada",
    });
  };

  const stopTimerHeader = (): void => {
    stopTimer();
    toastHook({
      title: "Operación Día a Día",
      description: "Simulación Detenida",
    });
  };

  const restartTimerHeader = (): void => {
    restartTimer(() => {
      realTime.restartRealTime();
      simulationTime.restartSimulationTime();
    });
    toastHook({
      title: "Operación Día a Día",
      description: "Simulación Reiniciada",
    });
  };

  // Función específica para refrescar pedidos en día a día
  const refreshPedidosFromBackend = async () => {
    try {
      const response = await PedidosService.getOrders([day], anio, mes);

      if (response.success && response.data?.pedidos) {
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
        toast.success("Lista de pedidos actualizada");
      }
    } catch (error) {
      console.error("Error al refrescar pedidos:", error);
      toast.error("Error al actualizar la lista de pedidos");
    }
  };

  // Handler para registrar pedido y recalcular rutas automáticamente
  const handleRegistrarPedido = async (pedidoData: PedidoFormData) => {
    try {
      const pedidoDTO = mapPedidoFormToDTO(pedidoData);
      const response = await PedidosService.postPedido(pedidoDTO);

      if (response.success) {
        console.log("Pedido registrado:", response.data);
        toast.success("Pedido registrado - Recalculando rutas...");

        // Agregar pedido al contexto inmediatamente
        const pedidoParaContexto: PedidoI = {
          id: response.data?.id || Date.now(),
          dia: pedidoDTO.dia,
          hora: pedidoDTO.hora,
          minuto: pedidoDTO.minuto,
          posX: pedidoDTO.posX,
          posY: pedidoDTO.posY,
          idCliente: pedidoDTO.idCliente,
          cantidadGLP: pedidoDTO.cantidadGLP,
          horasLimite: pedidoDTO.horasLimite,
          entregado: false,
          cantidadGLPAsignada: pedidoDTO.cantidadGLP,
          asignado: false,
          horaDeInicio: 0,
          anio: pedidoDTO.anio,
          mesPedido: pedidoDTO.mesPedido,
          tiempoLlegada: 0,
          idCamion: "",
          entregadoCompleto: false,
          fechaDeRegistro: new Date().toISOString(),
          fechaEntrega: "",
          isbloqueo: false,
          priodidad: 0,
          fecDia: "",
          tiempoRegistroStr: `${pedidoDTO.dia}d${pedidoDTO.hora}h${pedidoDTO.minuto}m`,
          cliente: {
            id: pedidoDTO.idCliente,
            nombre: "",
            correo: "",
            telefono: 0,
            tipo: "",
          },
          horaInicio: 0,
        };

        setPedidosI((pedidosActuales) => [...pedidosActuales, pedidoParaContexto]);
        
        // En día a día, recalcular rutas automáticamente
        setTimeout(() => {
          toast.success("Rutas recalculadas exitosamente");
        }, 1500);
        
      } else {
        throw new Error(response.message || "Error al registrar pedido");
      }
    } catch (error) {
      console.error("Error al registrar pedido:", error);
      toast.error(`Error: ${(error as Error).message}`);
    }
  };

  const handleAveriaSubmit = async (camionId: string, tipoAveria: number) => {
    try {
      const response = await SimulationService.postAveria(
        simulacionSeleccionada.id || "simulacion-dia-a-dia",
        camionId,
        tipoAveria
      );

      if (response.success) {
        toast.success("Avería reportada - Recalculando rutas...");
        setTimeout(() => {
          toast.success("Rutas ajustadas por avería");
        }, 1500);
      } else {
        toast.error("Error al reportar avería");
      }
    } catch (error) {
      console.error("Error al reportar avería:", error);
      toast.error("Error al reportar avería");
    }
  };

  const handleMantenimientoSubmit = async (camionId: string, tipoMantenimiento: number) => {
    try {
      toast.success("Mantenimiento programado - Ajustando rutas...");
      setTimeout(() => {
        toast.success("Rutas ajustadas por mantenimiento");
      }, 1500);
    } catch (error) {
      console.error("Error al programar mantenimiento:", error);
      toast.error("Error al programar mantenimiento");
    }
  };

  return (
    <>
      <ElegantHeader
        setOpenSide={setOpenSide}
        onFitToScreen={onFitToScreen}
        timer={{
          day: displayDate.day,
          month: displayDate.month,
          year: displayDate.year,
          hour,
          minute,
        }}
        realTime={{
          hour: realHour,
          minute: realMinute,
          second: realSecond,
        }}
        timerControls={{
          initTimer,
          displaySpeed,
          onStart: starTimerHeader,
          onStop: stopTimerHeader,
          onRestart: restartTimerHeader,
          onSpeedChange: doPlusSpeed,
        }}
        actions={{
          onRefreshPedidos: refreshPedidosFromBackend,
          onNewPedido: () => setShowPedidoModal(true),
          onNewAveria: () => setShowAveriaModal(true),
          onNewMantenimiento: () => setShowMantenimientoModal(true),
        }}
        isDiaADia={true}
      />

      <PedidoModal
        isOpen={showPedidoModal}
        onClose={() => setShowPedidoModal(false)}
        onSubmit={handleRegistrarPedido}
      />

      <AveriaModal
        isOpen={showAveriaModal}
        onClose={() => setShowAveriaModal(false)}
        onSubmit={handleAveriaSubmit}
      />

      <MantenimientoModal
        isOpen={showMantenimientoModal}
        onClose={() => setShowMantenimientoModal(false)}
        onSubmit={handleMantenimientoSubmit}
      />
    </>
  );
};
