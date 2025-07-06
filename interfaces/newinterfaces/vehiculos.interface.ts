
export interface VehiculoI {
  id: number
  codigo: string
  tara: number
  carga: number
  pesoCarga: number
  peso: number
  combustible: number
  distanciaMaxima: number
  distanciaRecorrida: number
  velocidad: number
  route: Route[] //aqui se guardan mis rutas del vehiculos
  capacidadCompleta: boolean
  cargaAsignada: number
  tiempoViaje: number
  ubicacionActual: UbicacionActual
  tipoAveria: number
  enAveria: boolean
  tiempoInicioAveria: any
  tiempoFinAveria: any
  glpDisponible: number
  detenido: boolean
  tiempoDetenido: number
  cargaAnterior: number
  pedidosAsignados: PedidosAsignado[] 
}

export interface Route {
  id: number
  x: number
  y: number
  startTime: number
  arriveTime: number
  vehiculo: any
  pedidoRuta?: PedidoRuta
  anio: number
  mes: number
  nodoAnteriorX: number
  nodoAnteriorY: number
  antecesor: any
  costoTotal: number
  pedido: boolean
  route: boolean
  depot: boolean
}
//wea que mandamos nulo nomas
export interface PedidoRuta {
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
  tiempoRegistroStr: any
  cliente: any
  horaInicio: number
}
//wea que solo sirve para saber la ubicacion
export interface UbicacionActual {
  id: number
  x: number
  y: number
  startTime: number
  arriveTime: number
  vehiculo: any
  pedidoRuta: any
  anio: number
  mes: number
  nodoAnteriorX: number
  nodoAnteriorY: number
  antecesor: any
  costoTotal: number
  pedido: boolean
  route: boolean
  depot: boolean
}

export interface PedidosAsignado {
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
  tiempoRegistroStr: any
  cliente: any
  horaInicio: number
}
