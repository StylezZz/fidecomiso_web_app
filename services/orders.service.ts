import { HttpResponse } from "@/interfaces/HttpResponse";
import http from "@/utils/http";
import { PedidoDTO } from "@/interfaces/pedido.dto";

// Interfaces basadas en la estructura de datos proporcionada
export interface Root {
  mensaje: string;
  pedidos: Pedido[];
}

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

class PedidosService {
  public static basePedido: string = "/pedido";

  public static async getOrders(
    days?: number[],
    year?: number,
    month?: number
  ): Promise<HttpResponse> {
    const queryParams = new URLSearchParams();

    if (days && days.length > 0) days.forEach((day) => queryParams.append("dias", day.toString()));
    if (year !== undefined) queryParams.append("anio", year.toString());
    if (month !== undefined) queryParams.append("mesPedido", month.toString());

    const queryString = queryParams.toString();
    // Usar solo /pedidos ya que BASE_URL ya incluye /api
    const url = `/pedidos${queryString ? `?${queryString}` : ""}`;

    try {
      console.log("Llamando a API con URL:", url);
      const response = await http.get(url);
      console.log("Respuesta del servidor:", response);
      return response;
    } catch (error) {
      console.error("Error en getOrders:", error);
      return {
        success: false,
        status: 500,
        message: "Error al obtener pedidos",
        data: null,
        error: (error as Error).message,
      };
    }
  }

  public static async postReadOrdersFile(file: File): Promise<HttpResponse> {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await http.post(`/pedidos/cargar-archivo`, formData);
      if (!res.success) throw new Error(res.error);
      return res;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public static async getNombrePedidosCargados(): Promise<HttpResponse> {
    try {
      const res = await http.get("/pedidos/meses");
      if (!res.success) throw new Error(res.error);
      return res;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  /**
   * Registra un nuevo pedido en el sistema
   * @param pedido Datos del pedido a registrar
   * @returns Respuesta HTTP con el pedido registrado
   */
  public static async postPedido(pedido: PedidoDTO): Promise<HttpResponse> {
    try {
      const res = await http.post("/pedidos", pedido);
      return {
        success: true,
        status: 200,
        message: "Pedido registrado correctamente",
        data: res.data || res,
      };
    } catch (error) {
      console.error("Error al registrar pedido:", error);
      return {
        success: false,
        status: 500,
        message: "Error al registrar pedido",
        data: null,
        error: (error as Error).message,
      };
    }
  }
}

export default PedidosService;
