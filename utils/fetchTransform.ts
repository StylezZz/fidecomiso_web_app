import { CamionConRutas, TipoCamion } from "@/interfaces/map/Truck.interface";
import { Pedido, EstadoPedido } from "@/interfaces/order/pedido.interface";
import { Nodo } from "@/interfaces/map/node.interface";
import { Ruta } from "@/interfaces/map/Route.interface";

function parseNode(raw: any): Nodo {
  return {
    id: raw.id,
    x: Number(raw.x),
    y: Number(raw.y),
    estaBloqueado: raw.isBloq ?? false,
  };
}

function parsePedido(raw: any): Pedido {
  return {
    ubicacion: parseNode(raw.ubicacion),
    fechaEntregaLimite: raw.fechaEntregaLimite,
    idPedido: Number(raw.idPedido),
    volumenGLP: Number(raw.volumenGLP),
    fechaRegistro: raw.fechaRegistro,
    estado: (Object.values(EstadoPedido) as string[]).includes(raw.estado)
      ? raw.estado
      : EstadoPedido.PENDIENTE,
    plazoHoras: raw.plazoHoras,
    clientCode: raw.clientCode,
  };
}

function parseRouteTruck(raw: any): Ruta {
  return {
    id: raw.id,
    horaFin: raw.horaFin,
    distanciaTotalKm: Number(raw.distanciaTotalKm),
    fecha: raw.fecha,
    nodosVisitados: Array.isArray(raw.nodosVisitados) ? raw.nodosVisitados.map(parseNode) : [],
    tiempoEstimadoHoras: raw.tiempoEstimadoHoras,
    pedidosAsignados: Array.isArray(raw.pedidosAsignados)
      ? raw.pedidosAsignados.map(parsePedido)
      : [],
    cantidadNodos: Number(raw.cantidadNodos),
    horaInicio: raw.horaInicio,
    consumoEstimadoGlP: raw.consumoEstimadoGlP,
  };
}

export function parseTrunkFetch(raw: any): CamionConRutas {
  return {
    id: Number(raw.id),
    estado: raw.estado,
    cargaActual: raw.cargaActual,
    velocidadPromedio: Number(raw.velocidadPromedio),
    placa: raw.placa,
    capacidadGLP: Number(raw.capacidadGLP),
    hasBreakdown: raw.hasBreakdown,
    tipoCamion: raw.tipoCamion as TipoCamion,
    rutasAsignadas: Array.isArray(raw.rutasAsignadas)
      ? raw.rutasAsignadas.map(parseRouteTruck)
      : [],
  };
}

export function parseTrucksFetchArray(data: any[]): CamionConRutas[] {
  return data.map(parseTrunkFetch);
}

export function formatearNombreArchivoPedido(nombreArchivo: string): string {
  const match = nombreArchivo.match(/ventas(\d{4})(\d{2})\.txt/i);
  if (!match) return nombreArchivo;

  const [_, anio, mes] = match;
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  const indiceMes = parseInt(mes, 10) - 1;

  if (indiceMes < 0 || indiceMes > 11) return nombreArchivo;

  return `Pedidos de ${meses[indiceMes]} de ${anio}`;
}

export function formatearNombreBloqueos(nombreArchivo: string): string {
  const match = nombreArchivo.match(/(\d{4})(\d{2})\.bloqueos\.txt/i);
  if (!match) return nombreArchivo;

  const [_, anio, mes] = match;

  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  const indiceMes = parseInt(mes, 10) - 1;

  if (indiceMes < 0 || indiceMes > 11) return nombreArchivo;

  return `Bloqueos de ${meses[indiceMes]} de ${anio}`;
}

export function formatearFecha(dateInit: Date): string {
  return `${dateInit.getFullYear()}/${String(dateInit.getMonth() + 1).padStart(2, "0")}/${String(
    dateInit.getDate()
  ).padStart(2, "0")} - ${String(dateInit.getHours()).padStart(2, "0")}:${String(
    dateInit.getMinutes()
  ).padStart(2, "0")}`;
}
