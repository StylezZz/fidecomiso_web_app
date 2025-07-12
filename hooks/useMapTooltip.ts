import { useState, useCallback } from "react";
import { VehiculoI } from "@/interfaces/newinterfaces/vehiculos.interface";
import { PedidoI } from "@/interfaces/newinterfaces/pedido.interface";
import { BloqueoI } from "@/interfaces/newinterfaces/bloqueo.interface";
import { AlmacenInfo } from "@/components/map/almacen/Almacen";
import { TooltipType } from "@/components/map/tooltip/MapTooltip";

type TooltipData = VehiculoI | PedidoI | BloqueoI | AlmacenInfo | null;

interface TooltipState {
  isVisible: boolean;
  type: TooltipType | null;
  data: TooltipData;
  position: { x: number; y: number };
}

export const useMapTooltip = () => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    isVisible: false,
    type: null,
    data: null,
    position: { x: 0, y: 0 },
  });

  const showTooltip = useCallback(
    (type: TooltipType, data: TooltipData, position: { x: number; y: number }) => {
      setTooltip({
        isVisible: true,
        type,
        data,
        position,
      });
    },
    []
  );

  const hideTooltip = useCallback(() => {
    setTooltip((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const getTooltipProps = useCallback(() => {
    if (!tooltip.isVisible || !tooltip.data || !tooltip.type) {
      return null;
    }

    switch (tooltip.type) {
      case TooltipType.PEDIDO:
        const pedido = tooltip.data as PedidoI;
        return {
          type: tooltip.type,
          title: `CÓDIGO: ${pedido.idCliente}`,
          fields: [
            { label: "Pos", value: `${pedido.posX}, ${pedido.posY}` },
            { label: "Vol", value: `${pedido.cantidadGLP} L` },
            {
              label: "Hora",
              value: `${pedido.hora.toString().padStart(2, "0")}:${pedido.minuto
                .toString()
                .padStart(2, "0")}`,
            },
          ],
          posX: tooltip.position.x,
          posY: tooltip.position.y,
          iconColor: "#f4c167",
        };

      case TooltipType.CAMION:
        const camion = tooltip.data as VehiculoI;
        const ubicacion = camion.ubicacionActual || { x: 0, y: 0 };
        return {
          type: tooltip.type,
          title: `CAMIÓN: ${camion.codigo}`,
          fields: [
            { label: "Carga", value: `${camion.carga} / ${camion.glpDisponible} L` },
            { label: "Ubicación", value: `${ubicacion.x}, ${ubicacion.y}` },
            { label: "Estado", value: camion.enAveria ? "En Avería" : "Operativo" },
          ],
          posX: tooltip.position.x,
          posY: tooltip.position.y,
          iconColor: "#3b82f6",
        };

      case TooltipType.ALMACEN:
        const almacen = tooltip.data as AlmacenInfo;
        return {
          type: tooltip.type,
          title: almacen.nombre,
          fields: [
            { label: "Capacidad", value: almacen.capacidad },
            { label: "Pos", value: `${almacen.posX}, ${almacen.posY}` },
            { label: "Camiones", value: `${almacen.camionesActuales}` },
          ],
          posX: tooltip.position.x,
          posY: tooltip.position.y,
          iconColor: almacen.typeHouse === "warehouse" ? "#3b82f6" : "#1e40af",
        };

      case TooltipType.BLOQUEO:
        const bloqueo = tooltip.data as BloqueoI;
        let distance = 0;
        for (let tramo of bloqueo.tramo) {
          let { x_fin, x_ini, y_fin, y_ini } = tramo;
          if (x_fin === x_ini) distance += Math.abs(y_fin - y_ini);
          if (y_fin === y_ini) distance += Math.abs(x_fin - x_ini);
        }
        return {
          type: tooltip.type,
          title: `CÓDIGO: Bloqueo-${bloqueo.id}`,
          fields: [
            { label: "Distancia", value: `${distance} Km` },
            { label: "Inicio", value: new Date(bloqueo.fechaInicio).toLocaleString() },
            { label: "Fin", value: new Date(bloqueo.fechaFin).toLocaleString() },
          ],
          posX: tooltip.position.x,
          posY: tooltip.position.y,
          iconColor: "red",
        };

      default:
        return null;
    }
  }, [tooltip]);

  return {
    tooltip,
    showTooltip,
    hideTooltip,
    getTooltipProps,
  };
};
