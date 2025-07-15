import { HttpResponse } from "@/interfaces/HttpResponse";
import http from "@/utils/http";

class BlockService {
  public static baseBloqueo: string = "/bloqueos";

  public static async postReadBlocksFile(file: File): Promise<HttpResponse> {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await http.post(`${this.baseBloqueo}/cargar-archivo`, formData);
      if (!res.success) throw new Error(res.error);
      return res;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public static async getNombreBloqueosCargados(): Promise<HttpResponse> {
    try {
      const res = await http.get(`${this.baseBloqueo}/meses`);
      if (!res.success) throw new Error(res.error);
      return res;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
}

export default BlockService;
