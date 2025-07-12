import { TipoCamion } from "@/interfaces/map/Truck.interface";
export const defineColorTruck = (typeParam: TipoCamion | undefined): string => {
  switch (typeParam) {
    case TipoCamion.TA:
      return "#1e3a8a"; // Azul oscuro
    case TipoCamion.TB:
      return "#7c2d12"; // Marrón oscuro
    case TipoCamion.TC:
      return "#374151"; // Gris oscuro
    case TipoCamion.TD:
      return "#1f2937"; // Gris muy oscuro
    default:
      return "#000000";
  }
};
