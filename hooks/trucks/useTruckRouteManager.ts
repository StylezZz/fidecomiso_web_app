import { useEffect } from "react";
import { Pedido } from "@/interfaces/order/pedido.interface";
import { useMapContext } from "@/contexts/MapContext";
import useLengendSummary from "@/hooks/use-legend-summary";

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
  setPedidosInComming
}: UseTruckRouteManagerProps) => {

  const { vehiculesRoutes, setTrucks } = useMapContext();
  const { addActiveTrunck } = useLengendSummary();

  useEffect(() => {
    if (!pedidoNewShow || onRouteRef.current) return;

    const indexCamion = vehiculesRoutes.findIndex(camion => camion.placa === truckPlate);
    if (indexCamion === -1) return;

    const camion = vehiculesRoutes[indexCamion];
    const rutasAsignadas = camion.rutasAsignadas;
    if (!rutasAsignadas) return;

    addActiveTrunck(camion.tipoCamion);

    const indexRoute = rutasAsignadas.findIndex(ruta => 
      ruta.pedidosAsignados.some(p => p.idPedido === pedidoNewShow.idPedido)
    );
    
    if (indexRoute === -1) return;

    const rutaAsignada = rutasAsignadas[indexRoute];
    setPedidosInComming(rutaAsignada.pedidosAsignados);

    setTrucks(prev => prev.map(t => 
      t.placa === truckPlate ? { ...t, route: rutaAsignada } : t
    ));
    
    setCurrNode(0);
    onRouteRef.current = true;
  }, [pedidoNewShow]);
};


export default useTruckRouteManager;

