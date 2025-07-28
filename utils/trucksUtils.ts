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

// ✨ Función para obtener la capacidad máxima según el tipo de camión
export const getTruckCapacityByType = (tipoCamion: string): number => {
  switch (tipoCamion) {
    case "TA": return 25;
    case "TB": return 15;
    case "TC": return 10;
    case "TD": return 5;
    default: return 25; // Fallback para TA
  }
};

// ✨ Función para extraer el tipo de camión del código
export const getTruckTypeFromCode = (codigo: string): string => {
  return codigo?.slice(0, 2) || "TA";
};
