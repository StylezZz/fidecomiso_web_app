export interface CamionI {
  id: number;
  codigo: string;
  tara: number;
  carga: number;
  pesoCarga: number;
  peso: number;
  combustible: number;
  distanciaMaxima: number;
  distanciaRecorrida: number;
  velocidad: number;
  route: Ruta[];
  capacidadCompleta: boolean;
  cargaAsignada: number;
  tiempoViaje: number;
  ubicacionActual: Posicion;
  tipoAveria: number;
  enAveria: boolean;
  tiempoInicioAveria: any;
  tiempoFinAveria: any;
  glpDisponible: number;
  detenido: boolean;
  tiempoDetenido: number;
  cargaAnterior: number;
  pedidosAsignados: PedidosAsignado[];
}

export interface Ruta {
  id: number;
  x: number;
  y: number;
  tiempoInicio: number;
  tiempoFin: number;
  camion: any;
  pedido?: PedidoRuta;
  anio: number;
  mes: number;
  xprevio: number;
  yprevio: number;
  nodoPrevio: any;
  costoTotal: number;
  esPedido: boolean;
  esRuta: boolean;
  esAlmacen: boolean;
}
//wea que mandamos nulo nomas
export interface PedidoRuta {
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
  idCamion: string;
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

export interface Posicion {
  id: number;
  x: number;
  y: number;
  tiempoInicio: number;
  tiempoFin: number;
  camion: any;
  pedido: any;
  anio: number;
  mes: number;
  xprevio: number;
  yprevio: number;
  nodoPrevio: any;
  costoTotal: number;
  esPedido: boolean;
  esRuta: boolean;
  esAlmacen: boolean;
}

export interface PedidosAsignado {
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
  idCamion: string;
  entregadoCompleto: boolean;
  fechaDeRegistro: string;
  fechaEntrega: string;
  isbloqueo: boolean;
  priodidad: number;
  fecDia: string;
  tiempoRegistroStr: any;
  cliente: any;
}
