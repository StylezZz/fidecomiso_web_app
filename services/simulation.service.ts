import { HttpResponse } from "@/interfaces/HttpResponse";
import http from "@/utils/http";
import { AveriaI, TipoAveria } from "@/interfaces/simulation/averia.interface";

class SimulationService {
  private static base: string = "/api/simulacion";
  private static widthGrid: number = 70;
  private static heightGrid: number = 50;
  private static averiasPendientes: AveriaI[] = [];
  private static contadorAverias: number = 1;

  public static async loadGrid(): Promise<HttpResponse> {
    try {
      const res = await http.post(
        `${this.base}/inicializar?anchoGrafo=${this.widthGrid}&altoGrafo=${this.heightGrid}`,
        null
      );
      if (!res.success) throw new Error(res.error);
      return res;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  //ya no se usara
  public static async LoadData(): Promise<HttpResponse> {
    try {
      const res = await http.post(`${this.base}/cargar-datos`, null);
      if (!res.success) throw new Error(res.error);
      return res;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public static async LoadDataFile(filePedido: File): Promise<HttpResponse> {
    const formData = new FormData();
    formData.append("file", filePedido);
    try {
      const res = await http.post(`${this.base}/procesar-archivo-pedidos`, formData);
      if (!res.success) throw new Error(res.error);
      return res;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public static async getTruckRoutes(useIaco: boolean = false): Promise<HttpResponse> {
    try {
      const res = await http.get(`/api/simulacion/camiones-con-rutas?useIACO=${useIaco}`);
      if (!res.success) throw new Error(res.error);
      return res;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
  public static async initSimulation(
    timerSimulacion: number,
    minutosPorIteracion: number,
    dia: number,
    mes: number,
    anio: number,
    minutoInicial: number,
    horaInicial: number
  ): Promise<HttpResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("horaInicial", horaInicial.toString());
    queryParams.append("minutoInicial", minutoInicial.toString());
    queryParams.append("anio", anio.toString());
    queryParams.append("mes", mes.toString());
    queryParams.append("dia", dia.toString());
    queryParams.append("minutosPorIteracion", minutosPorIteracion.toString());
    queryParams.append("timerSimulacion", timerSimulacion.toString());

    const queryString = queryParams.toString();
    try {
      const res = await http.post(`/simulacion/inicializar-simulacion?${queryString}`, null);
      if (!res.success) throw new Error("Error al inicializar la simulacion");
      return res;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public static async simulacionPedidoSemanal(
    anio: number,
    mes: number,
    dia: number,
    hora: number,
    minuto: number
  ): Promise<HttpResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("anio", anio.toString());
    queryParams.append("mes", mes.toString());
    queryParams.append("dia", dia.toString());
    queryParams.append("hora", hora.toString());
    queryParams.append("minuto", minuto.toString());
    const queryString = queryParams.toString();
    try {
      const res = await http.get(`/simulacion/pedidos/semanal?${queryString}`);
      if (!res.success) throw new Error("Error al obtener los pedidos semnalaes de la simulacion");
      return res;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public static async simulacionBloqueosSemanal(
    anio: number,
    mes: number,
    dia: number,
    hora: number,
    minuto: number
  ): Promise<HttpResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("anio", anio.toString());
    queryParams.append("mes", mes.toString());
    queryParams.append("dia", dia.toString());
    queryParams.append("hora", hora.toString());
    queryParams.append("minuto", minuto.toString());
    const queryString = queryParams.toString();
    try {
      const res = await http.get(`/simulacion/bloqueos/semanal?${queryString}`);
      if (!res.success) throw new Error("Error al obtener los bloqueos semanales de la simulacion");
      return res;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
  public static async inicializarTipoSimulacion(tipoSimulacion: number): Promise<HttpResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("tipoSimulacion", tipoSimulacion.toString());
    const queryString = queryParams.toString();
    try {
      const res = await http.post(`/genetico/inicializar?${queryString}`, null);
      if (!res.success) throw new Error("Error al iniciar el tipo de simulacion");
      return res;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public static async obtenerRutasVehiculosSemanal(
    anio: number,
    mes: number,
    timeSimulacion: number,
    minutosPorIteracion: number,
    averias?: AveriaI[]
  ): Promise<HttpResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("anio", anio.toString());
    queryParams.append("mes", mes.toString());
    queryParams.append("timer", timeSimulacion.toString());
    queryParams.append("minutosPorIteracion", minutosPorIteracion.toString());
    const queryString = queryParams.toString();
    try {
      // Si no se proporcionan averías específicas, usar las pendientes
      const averiasAEnviar =
        averias || (this.averiasPendientes.length > 0 ? this.averiasPendientes : null);
      console.log("averias a enviar: ", averiasAEnviar);
      const res = await http.post(`/genetico/semanal?${queryString}`, averiasAEnviar);

      // Si se usaron las averías pendientes y la llamada fue exitosa, limpiarlas
      if (!averias && this.averiasPendientes.length > 0 && res.success) {
        this.limpiarAverias();
      }

      if (!res.success) throw new Error("Error en obtener las rutas");
      return res;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public static async obtenerRutasVehiculosDiario(
    anio: number,
    mes: number,
    timeSimulacion: number,
    minutosPorIteracion: number,
    fechaFin?: string,
    averias?: AveriaI[]
  ): Promise<HttpResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("anio", anio.toString());
    queryParams.append("mes", mes.toString());
    queryParams.append("timer", timeSimulacion.toString());
    queryParams.append("minutosPorIteracion", minutosPorIteracion.toString());

    // Añadir fechaFin si está presente
    if (fechaFin) {
      queryParams.append("fechaFin", fechaFin);
    }

    const queryString = queryParams.toString();

    try {
      // Si no se proporcionan averías específicas, usar las pendientes
      const averiasAEnviar =
        averias || (this.averiasPendientes.length > 0 ? this.averiasPendientes : null);
      console.log("averias a enviar (día a día): ", averiasAEnviar);

      const res = await http.post(`/genetico/dia?${queryString}`, averiasAEnviar);

      // Si se usaron las averías pendientes y la llamada fue exitosa, limpiarlas
      if (!averias && this.averiasPendientes.length > 0 && res.success) {
        this.limpiarAverias();
      }

      if (!res.success) throw new Error("Error al obtener las rutas para simulación día a día");
      return res;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public static async resetSimulation(): Promise<HttpResponse> {
    try {
      const res = await http.post(`/genetico/reiniciar`, null);
      if (!res.success) throw new Error("Error al resetear la simulación");
      // Limpiar las averías pendientes al resetear la simulación
      this.limpiarAverias();
      return res;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  /**
   * Agrega una avería a la lista de averías pendientes
   * @param averia La avería a agregar
   */
  public static agregarAveria(averia: AveriaI): void {
    this.averiasPendientes.push(averia);
  }

  /**
   * Obtiene la lista actual de averías pendientes
   * @returns Lista de averías pendientes
   */
  public static obtenerAverias(): AveriaI[] {
    return [...this.averiasPendientes];
  }

  /**
   * Limpia la lista de averías pendientes
   */
  public static limpiarAverias(): void {
    this.averiasPendientes = [];
    // No reiniciamos el contador para mantener IDs únicos durante toda la sesión
  }

  /**
   * Registra una avería para un camión y la añade a la lista de averías pendientes
   * @param camionId ID del camión (ejemplo: TA01)
   * @param tipoAveria Tipo de avería (1: LEVE, 2: MODERADO, 3: GRAVE)
   * @returns Respuesta HTTP con el resultado de la operación
   */
  public static async registrarAveria(camionId: string, tipoAveria: number): Promise<HttpResponse> {
    // Convertir el tipo de avería numérico al enum TipoAveria
    let tipoAveriaEnum;
    switch (tipoAveria) {
      case 1:
        tipoAveriaEnum = TipoAveria.LEVE;
        break;
      case 2:
        tipoAveriaEnum = TipoAveria.MODERADO;
        break;
      case 3:
        tipoAveriaEnum = TipoAveria.GRAVE;
        break;
      case 4:
        tipoAveriaEnum = TipoAveria.MANTENIMIENTO;
        break;
      default:
        throw new Error("Tipo de avería no válido");
    }

    // Calcular el turno actual basado en la hora del sistema
    const now = new Date();
    const hora = now.getHours();
    let turnoAveria = 1; // Por defecto, turno 1

    if (hora >= 0 && hora < 8) {
      turnoAveria = 1;
    } else if (hora >= 8 && hora < 16) {
      turnoAveria = 2;
    } else if (hora >= 16 && hora < 24) {
      turnoAveria = 3;
    }

    // Crear la avería y añadirla a la lista de pendientes
    const averia: AveriaI = {
      id: this.contadorAverias++, // Usar contador secuencial para el ID
      turnoAveria,
      codigoCamion: camionId,
      tipoAveria: tipoAveriaEnum,
      descripcion: `Avería ${tipoAveriaEnum} en camión ${camionId}`,
    };

    this.agregarAveria(averia);

    // Devolver una respuesta exitosa que cumpla con la interfaz HttpResponse
    return {
      success: true,
      status: 200,
      message: "Avería registrada correctamente",
      data: { mensaje: "Avería registrada correctamente" },
      error: undefined,
    };
  }
}
export default SimulationService;
