import { ClienteI } from "./cliente.interface"

export interface PedidoI{
  id: number
  dia: number
  hora: number
  minuto: number
  posX: number
  posY: number
  idCliente: string
  cantidadGLP: number
  horasLimite: number
  entregado: boolean
  cantidadGLPAsignada: number
  asignado: boolean
  horaDeInicio: number
  anio: number
  mesPedido: number
  tiempoLlegada: number
  idCamion: string
  entregadoCompleto: boolean
  fechaDeRegistro: string
  fechaEntrega: string
  isbloqueo: boolean
  priodidad: number
  fecDia: string
  tiempoRegistroStr: string
  cliente: ClienteI
  horaInicio: number
}