import axios from "axios";
import {
  IncidentesResponse,
  CumplimientoEntregasResponse,
  PedidosDivididosResponse,
  PedidosCompletosResponse,
} from "@/interfaces/reports/reports.interface";

class ReportsService {
  // ✅ OBTENER INCIDENTES
  async getIncidentes(): Promise<IncidentesResponse> {
    try {
      const response = await axios.get<IncidentesResponse>(
        `${BASE_URL}/api/genetico/reportes/incidentes`,
        {
          headers: {
            accept: "*/*",
          },
        }
      );
      return response.data;
    } catch (error) {
      // ✅ MANEJO ESPECIAL PARA ERROR 400 Y 500 (NO HAY SIMULACIÓN)
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 400 || error.response?.status === 500)
      ) {
        throw new Error("Aún no se ha iniciado una simulación");
      }
      // ✅ SOLO MOSTRAR ERROR EN CONSOLA SI ES UN ERROR REAL
      console.error("Error al obtener incidentes:", error);
      throw new Error("Error al cargar los datos de incidentes");
    }
  }

  // ✅ OBTENER CUMPLIMIENTO DE ENTREGAS
  async getCumplimientoEntregas(): Promise<CumplimientoEntregasResponse> {
    try {
      const response = await axios.get<CumplimientoEntregasResponse>(
        `${BASE_URL}/api/genetico/reportes/cumplimiento-entregas`,
        {
          headers: {
            accept: "*/*",
          },
        }
      );
      return response.data;
    } catch (error) {
      // ✅ MANEJO ESPECIAL PARA ERROR 400 Y 500 (NO HAY SIMULACIÓN)
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 400 || error.response?.status === 500)
      ) {
        throw new Error("Aún no se ha iniciado una simulación");
      }
      // ✅ SOLO MOSTRAR ERROR EN CONSOLA SI ES UN ERROR REAL
      console.error("Error al obtener cumplimiento de entregas:", error);
      throw new Error("Error al cargar los datos de cumplimiento");
    }
  }

  // ✅ OBTENER PEDIDOS DIVIDIDOS
  async getPedidosDivididos(): Promise<PedidosDivididosResponse> {
    try {
      const response = await axios.get<PedidosDivididosResponse>(
        `${BASE_URL}/api/genetico/reportes/pedidoDividido`,
        {
          headers: {
            accept: "*/*",
          },
        }
      );
      return response.data;
    } catch (error) {
      // ✅ MANEJO ESPECIAL PARA ERROR 400 Y 500 (NO HAY SIMULACIÓN)
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 400 || error.response?.status === 500)
      ) {
        throw new Error("Aún no se ha iniciado una simulación");
      }
      // ✅ SOLO MOSTRAR ERROR EN CONSOLA SI ES UN ERROR REAL
      console.error("Error al obtener pedidos divididos:", error);
      throw new Error("Error al cargar los pedidos divididos");
    }
  }

  // ✅ NUEVO: OBTENER PEDIDOS COMPLETOS
  async getPedidosCompletos(): Promise<PedidosCompletosResponse> {
    try {
      const response = await axios.get<PedidosCompletosResponse>(
        `${BASE_URL}/api/genetico/pedidos`,
        {
          headers: {
            accept: "*/*",
          },
        }
      );
      return response.data;
    } catch (error) {
      // ✅ MANEJO ESPECIAL PARA ERROR 400 Y 500 (NO HAY SIMULACIÓN)
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 400 || error.response?.status === 500)
      ) {
        throw new Error("Aún no se ha iniciado una simulación");
      }
      // ✅ SOLO MOSTRAR ERROR EN CONSOLA SI ES UN ERROR REAL
      console.error("Error al obtener pedidos completos:", error);
      throw new Error("Error al cargar los pedidos completos");
    }
  }

  // ✅ OBTENER TODOS LOS REPORTES EN PARALELO (ACTUALIZADO)
  async getAllReports() {
    try {
      const [incidentes, cumplimientoEntregas, pedidosDivididos, pedidosCompletos] =
        await Promise.all([
          this.getIncidentes(),
          this.getCumplimientoEntregas(),
          this.getPedidosDivididos(),
          this.getPedidosCompletos(),
        ]);

      return {
        incidentes,
        cumplimientoEntregas,
        pedidosDivididos,
        pedidosCompletos,
      };
    } catch (error) {
      console.error("Error al obtener todos los reportes:", error);
      throw error;
    }
  }
}

export default new ReportsService();
