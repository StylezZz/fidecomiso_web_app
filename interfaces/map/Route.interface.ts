import {Pedido} from "@/interfaces/order/pedido.interface"
import {Node} from "@/interfaces/map/node.interface"


export interface RouteTruck{
    horaFin: any,
    distanciaTotalKm: number,
    fecha: string,
    nodosVisitados : Node[] 
    tiempoEstimadoHoras: any,
    pedidosAsignados: Pedido[]
    id: string,
    cantidadNodos:number,
    consumoEstimadoGlP:any
    horaInicio:any
}
