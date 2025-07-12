import { Pedido } from "@/interfaces/order/pedido.interface";
import { Nodo } from "@/interfaces/map/node.interface";

export interface Ruta {
  horaFin: any;
  distanciaTotalKm: number;
  fecha: string;
  nodosVisitados: Nodo[];
  tiempoEstimadoHoras: any;
  pedidosAsignados: Pedido[];
  id: string;
  cantidadNodos: number;
  consumoEstimadoGlP: any;
  horaInicio: any;
}
