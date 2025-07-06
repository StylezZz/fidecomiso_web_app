import { PedidoDTO, PedidoFormData } from "@/interfaces/pedido.dto";

/**
 * Mapea los datos del formulario de pedido al formato esperado por el backend
 * @param formData Datos del formulario
 * @returns Objeto DTO listo para enviar al backend
 */
export const mapPedidoFormToDTO = (formData: PedidoFormData): PedidoDTO => {
  // Usar fecha actual o la especificada en el formulario
  const now = new Date();
  
  return {
    id: 0, // El backend asignará un ID
    dia: formData.usarHoraActual ? now.getDate() : formData.dia,
    hora: formData.usarHoraActual ? now.getHours() : formData.hora,
    minuto: formData.usarHoraActual ? now.getMinutes() : formData.minuto,
    posX: formData.posicionX,
    posY: formData.posicionY,
    idCliente: formData.codigo,
    cantidadGLP: formData.volumen,
    horasLimite: formData.tiempoEspera,
    entregado: false,
    asignado: false,
    anio: formData.usarHoraActual ? now.getFullYear() : formData.año,
    mesPedido: formData.usarHoraActual ? now.getMonth() + 1 : formData.mes,
    entregadoCompleto: false
  };
};
