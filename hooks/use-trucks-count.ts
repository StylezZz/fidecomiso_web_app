import { useMapContext } from "@/contexts/MapContext";

export const useTrucksCount = () => {
  const { camionesRuta: dataVehiculos } = useMapContext();

  const getTrucksInPosition = (x: number, y: number): number => {
    let count = 0;

    dataVehiculos.forEach((vehiculo) => {
      // Usar la ubicación actual del vehículo
      const ubicacionActual = vehiculo.ubicacionActual;

      if (ubicacionActual && ubicacionActual.x === x && ubicacionActual.y === y) {
        count++;
      }
    });

    return count;
  };

  return { getTrucksInPosition };
};
