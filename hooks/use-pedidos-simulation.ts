import { useMapContext } from "@/contexts/MapContext"
import { Pedido,EstadoPedido } from "@/interfaces/order/pedido.interface";
import { useCallback } from "react";
const usePedidosSimulation =()=>{
    const {setPedidos,pedidos} = useMapContext();

    const searchPedidoById = (idPedidod:number) => pedidos.find(pedido => pedido.idPedido == idPedidod);
    const removePedidoById = (idPedido: number) => pedidos.filter(pedido => pedido.idPedido != idPedido);
    const replacePedidoById = (idPedido:number,pedidoActualizado: Pedido) => pedidos.map(pedido => pedido.idPedido === idPedido ? pedidoActualizado : pedido);

    const modifyPedidoEstado = useCallback((idPedido:number,estado: EstadoPedido ) =>{
        const pedido: Pedido|undefined = searchPedidoById(idPedido);
        if(!pedido)return;
        pedido.estado = estado;
        const nuevosPedidos = replacePedidoById(idPedido,pedido);
        setPedidos(nuevosPedidos);
    },[pedidos,setPedidos])

    return{
        modifyPedidoEstado
    }
}