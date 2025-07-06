// ✅ INTERFACE PARA INCIDENTES
export interface IncidentesResponse {
  incidentes: any[];
  averiasLeves: number;
  averiasModeradas: number;
  averiasGraves: number;
  totalIncidentes: number;
  impactoOperativo: "NINGUNO" | "BAJO" | "MEDIO" | "ALTO";
  timestamp: string;
}

// ✅ INTERFACE PARA CUMPLIMIENTO DE ENTREGAS
export interface CumplimientoEntregasResponse {
  totalPedidos: number;
  pedidosRetrasados: number;
  porcentajeCumplimiento: number;
  pedidosPendientes: number;
  pedidosEntregados: number;
  tiempoPromedioEntrega: number;
  timestamp: string;
}

// ✅ INTERFACE PARA PEDIDOS DIVIDIDOS
export interface PedidoDividido {
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
  fecDia: string;
  tiempoRegistroStr: any;
  cliente: any;
  horaInicio: number;
}

export type PedidosDivididosResponse = PedidoDividido[];

// ✅ NUEVA INTERFACE PARA CLIENTE
export interface Cliente {
  id: string;
  nombre: string;
  correo: string;
  telefono: number;
  tipo: string;
}

// ✅ NUEVA INTERFACE PARA PEDIDOS COMPLETOS
export interface PedidoCompleto {
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
  cliente: Cliente;
  horaInicio: number;
}

export type PedidosCompletosResponse = PedidoCompleto[];

// ✅ INTERFACE COMBINADA PARA EL ESTADO (ACTUALIZADA)
export interface ReportsData {
  incidentes: IncidentesResponse | null;
  cumplimientoEntregas: CumplimientoEntregasResponse | null;
  pedidosDivididos: PedidosDivididosResponse | null;
  pedidosCompletos: PedidosCompletosResponse | null;
  loading: {
    incidentes: boolean;
    cumplimientoEntregas: boolean;
    pedidosDivididos: boolean;
    pedidosCompletos: boolean;
  };
  error: {
    incidentes: string | null;
    cumplimientoEntregas: string | null;
    pedidosDivididos: string | null;
    pedidosCompletos: string | null;
  };
} 