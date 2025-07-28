import { useMapContext } from "@/contexts/ContextMap";
import useLengendSummary from "../use-legend-summary";
import { useEffect, useRef, useState } from "react";
import { Pedido } from "@/interfaces/order/pedido.interface";

interface UseTruckOrdersProps {
  truckPlate: string;
}

const useTrucksOrders = ({ truckPlate }: UseTruckOrdersProps) => {
  const { vehiculesRoutes, pedidos, simulationTime } = useMapContext();
  const { time } = simulationTime;
  const { addPedidos } = useLengendSummary();

  const [misPedidos, setMisPedidos] = useState<Pedido[]>([]);
  const [misPedidosShow, setMisPedidosShow] = useState<Pedido[]>([]);
  const [pedidoNewShow, setPedidoNewShow] = useState<Pedido>();
  const [pedidosInComming, setPedidosInComming] = useState<Pedido[]>([]);
  
  const obtuvoSusPedidos = useRef<boolean>(false);
  const pedidosIndex = useRef<number>(0);

  // Obtener pedidos asignados al camión, PUEDE QUE ESTO DEBA CAMBIAR POR EL BAKEND
  useEffect(() => {
    if (vehiculesRoutes.length === 0 || pedidos.length === 0 || obtuvoSusPedidos.current) return;
    
    const camion = vehiculesRoutes.find(p => p.placa === truckPlate);
    if (!camion?.rutasAsignadas?.length) return;

    const indexPedidos: number[] = camion.rutasAsignadas.flatMap(route => 
      route.pedidosAsignados.map(pedido => pedido.idPedido!)
    );

    const pedidosAsignados = pedidos.filter(p => indexPedidos.includes(p.idPedido!));
    setMisPedidos(pedidosAsignados);
    
    console.log(pedidosAsignados, "Los pedidos de ", truckPlate);
    obtuvoSusPedidos.current = true;
  }, [pedidos, vehiculesRoutes]);

  
  // Controlar la muestra de pedidos en el tiempo
  useEffect(() => {
    const i = pedidosIndex.current;
    if (misPedidos.length <= 0 || i >= misPedidos.length) return;

    const pedidoFecha = new Date(misPedidos[i].fechaRegistro);
    const { day, hour, minute } = {
      day: pedidoFecha.getDate(),
      hour: pedidoFecha.getHours(),
      minute: pedidoFecha.getMinutes()
    };

    if (time.day === day && time.hour === hour && time.minute === minute) {
      const newPedido = misPedidos[i];
      setPedidoNewShow(newPedido);
      addPedidos();
      setMisPedidosShow(prev => [...prev, newPedido]);
      console.log("Nuevo pedido ", newPedido.fechaRegistro, "del camion ", truckPlate);
      pedidosIndex.current += 1;
    }
  }, [time]);

  return {
    misPedidos,
    misPedidosShow,
    setMisPedidosShow,
    pedidoNewShow,
    pedidosInComming,
    setPedidosInComming
  };
}

export default useTrucksOrders;