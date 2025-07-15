import { useEffect } from "react";
import { useMapContext } from "@/contexts/ContextMap";
import useLengendSummary from "@/hooks/use-legend-summary";
import { Pedido } from "@/interfaces/order/pedido.interface";

interface UseTruckRouteManagerProps {
  truckPlate: string;
  pedidoNewShow: Pedido | undefined;
  onRouteRef: React.MutableRefObject<boolean>;
  setCurrNode: (node: number) => void;
  setPedidosInComming: (pedidos: Pedido[]) => void;
}

export const useTruckRouteManager = ({
  truckPlate,
  pedidoNewShow,
  onRouteRef,
  setCurrNode,
  setPedidosInComming,
}: UseTruckRouteManagerProps) => {
  const { vehiculesRoutes } = useMapContext();
  const { addActiveTrunck } = useLengendSummary();

  useEffect(() => {
    if (!pedidoNewShow || onRouteRef.current) return;

    const indexCamion = vehiculesRoutes.findIndex((camion) => camion.placa === truckPlate);
    if (indexCamion === -1) return;

    const camion = vehiculesRoutes[indexCamion];
    const rutasAsignadas = camion.rutasAsignadas;
    if (!rutasAsignadas) return;

    addActiveTrunck(camion.tipoCamion);

    const indexRoute = rutasAsignadas.findIndex((ruta) =>
      ruta.pedidosAsignados.some((p) => p.idPedido === pedidoNewShow.idPedido)
    );

    if (indexRoute === -1) return;

    const rutaAsignada = rutasAsignadas[indexRoute];
    setPedidosInComming(rutaAsignada.pedidosAsignados);

    setCurrNode(0);
    onRouteRef.current = true;
  }, [pedidoNewShow]);
};

export default useTruckRouteManager;
