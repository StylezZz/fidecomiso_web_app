import { TypeTruck } from "@/interfaces/map/Truck.interface";
export const defineColorTruck = (typeParam: TypeTruck | undefined) : string =>{
    switch (typeParam){
      case TypeTruck.TA:
        return "#FCFF33";
      case TypeTruck.TB:
        return "#33F9FF";
      case TypeTruck.TC:
        return "#FFAD3E";
      case TypeTruck.TD:
        return "#C4C3C2";
      default:
        return "#000";
    }
}
  
/*
made by Dalpb
*/