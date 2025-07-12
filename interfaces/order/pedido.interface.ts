import { Nodo } from "@/interfaces/map/node.interface";
export enum EstadoPedido {
  ENTREGADO = "Entregado",
  PENDIENTE = "Pendiente",
  ENRUTA = "En ruta",
}
export interface Pedido {
  ubicacion: Nodo;
  fechaEntregaLimite?: string;
  idPedido?: number;
  volumenGLP: number;
  fechaRegistro: string;
  estado: EstadoPedido;
  plazoHoras?: number;
  clientCode?: string;
}

export interface PedidosArchivo {
  fecha: string;
  total: number;
  pedidos: Pedido[];
}
