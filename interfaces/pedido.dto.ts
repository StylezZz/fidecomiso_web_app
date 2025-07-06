export interface PedidoDTO {
  id?: number;
  dia: number;
  hora: number;
  minuto: number;
  posX: number;
  posY: number;
  idCliente: string;
  cantidadGLP: number;
  horasLimite: number;
  entregado?: boolean;
  cantidadGLPAsignada?: number;
  asignado?: boolean;
  horaDeInicio?: number;
  anio: number;
  mesPedido: number;
  tiempoLlegada?: number;
  idCamion?: string;
  entregadoCompleto?: boolean;
  fechaDeRegistro?: string;
  fechaEntrega?: string;
  isbloqueo?: boolean;
  priodidad?: number;
  fecDia?: string;
  tiempoRegistroStr?: string;
  cliente?: {
    id?: string;
    nombre?: string;
    correo?: string;
    telefono?: number;
    tipo?: string;
  };
  horaInicio?: number;
}

// Interfaz para mapear los datos del formulario al DTO
export interface PedidoFormData {
  codigo: string;
  volumen: number;
  posicionX: number;
  posicionY: number;
  tiempoEspera: number;
  usarHoraActual: boolean;
  año: number;
  mes: number;
  dia: number;
  hora: number;
  minuto: number;
}
