
import { HttpResponse } from "@/interfaces/HttpResponse";
import http from "@/utils/http";
class TruckService{
    private static base: string = "/camion";

    public static async getAllTrucks() : Promise<HttpResponse>{
        try{
            const res = await http.get(`${this.base}`);
            if(!res.success)throw new Error(res.error);
            return res;
        }
        catch(error){
            throw new Error((error as Error).message);
        }
    }
    
}