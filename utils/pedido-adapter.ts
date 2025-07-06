import { Order } from "@/types/order";

// Interfaz que representa la estructura de pedido que viene del backend
export interface Pedido {
  id: number;
  dia: number;
  hora: number;
  minuto: number;
  posX: number;
  posY: number;
  idCliente: string;
  cantidadGLP: number;
  horasLimite: number;
  entregado: boolean;
  cantidadGLPAsignada: number;
  asignado: boolean;
  horaDeInicio: number;
  anio: number;
  mesPedido: number;
  tiempoLlegada: number;
  idCamion: any;
  entregadoCompleto: boolean;
  fechaDeRegistro: string;
  fechaEntrega: string;
  isbloqueo: boolean;
  priodidad: number;
  fecDia: any;
  tiempoRegistroStr: string;
  cliente: any;
  horaInicio: number;
}

export interface PedidoResponse {
  mensaje: string;
  pedidos: Pedido[];
}

/**
 * Convierte un objeto Pedido del backend a la estructura Order utilizada en el frontend
 * @param pedido Objeto Pedido recibido del backend
 * @returns Objeto Order adaptado para el frontend
 */
export function adaptPedidoToOrder(pedido: Pedido): Order {
  // Determinar el estado del pedido
  const status: "pending" | "assigned" | "in_transit" | "delivered" | "cancelled" = 
    pedido.entregado ? "delivered" :
    (pedido.asignado && pedido.idCamion) ? "in_transit" :
    pedido.asignado ? "assigned" :
    "pending";

  // Determinar la prioridad basada en horasLimite o priodidad
  const priority: "low" | "medium" | "high" | "urgent" = 
    (pedido.priodidad === 3 || pedido.horasLimite < 6) ? "urgent" :
    (pedido.priodidad === 2 || pedido.horasLimite < 12) ? "high" :
    (pedido.priodidad === 1 || pedido.horasLimite < 24) ? "medium" :
    "low";

  // Crear un código de seguimiento basado en el id y el cliente
  const trackingCode = `PLG-${pedido.anio}${pedido.mesPedido.toString().padStart(2, '0')}${pedido.id.toString().padStart(4, '0')}`;

  // Convertir a la estructura Order
  return {
    id: pedido.id.toString(),
    customer: pedido.idCliente || `Cliente-${pedido.id}`,
    customerType: "residential", // Valor por defecto
    volume: pedido.cantidadGLP,
    location: {
      lat: pedido.posY,
      lng: pedido.posX
    },
    address: `(${pedido.posX}, ${pedido.posY})`,
    createdAt: pedido.fechaDeRegistro || new Date().toISOString(),
    deadline: pedido.fechaEntrega || "",
    estimatedDeliveryTime: pedido.fechaEntrega || "",
    status: status,
    priority: priority,
    assignedTruck: pedido.idCamion ? pedido.idCamion.toString() : undefined,
    trackingCode: trackingCode,
    // Campos opcionales
    estimatedTime: pedido.tiempoLlegada || undefined,
    comments: `Pedido registrado el día ${pedido.dia} a las ${pedido.hora}:${pedido.minuto.toString().padStart(2, '0')}`,
    // Campos que no tienen equivalente directo
    contactEmail: undefined,
    contactPhone: undefined,
    distance: undefined,
    truckDetails: undefined,
    timeline: pedido.entregado ? [
      {
        status: "delivered",
        timestamp: pedido.fechaEntrega || new Date().toISOString(),
        notes: "Entrega completada"
      }
    ] : undefined,
    notificationsSent: {
      confirmation: true,
      dispatch: pedido.asignado,
      delivery: pedido.entregado
    },
    tags: []
  };
}

/**
 * Convierte un array de Pedidos a un array de Orders
 * @param pedidos Array de Pedidos del backend
 * @returns Array de Orders adaptados para el frontend
 */
export function adaptPedidosToOrders(pedidos: Pedido[]): Order[] {
  return pedidos.map(adaptPedidoToOrder);
}
