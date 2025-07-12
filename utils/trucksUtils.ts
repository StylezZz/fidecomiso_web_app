import { TypeTruck } from "@/interfaces/map/Truck.interface";
export const defineColorTruck = (typeParam: TypeTruck | undefined) : string =>{
    switch (typeParam){
      case TypeTruck.TA:
        return "#1e3a8a"; // Azul oscuro
      case TypeTruck.TB:
        return "#7c2d12"; // Marrón oscuro
      case TypeTruck.TC:
        return "#374151"; // Gris oscuro
      case TypeTruck.TD:
        return "#1f2937"; // Gris muy oscuro
      default:
        return "#000000";
    }
}
  
