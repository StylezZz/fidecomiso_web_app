import { useMapContext } from "@/contexts/ContextMap";
import { useMemo } from "react";

interface FleetStats {
  totalTrucks: number;
  totalCapacity: number;
  totalCurrentLoad: number;
  overallPercentage: number;
  availableTrucks: number;
  inTransitTrucks: number;
  maintenanceTrucks: number;
  averageLoadPercentage: number;
  trucksInWarehouse: number;
  emptyTrucks: number;
}

export const useFleetStats = (): FleetStats => {
  const { camionesRuta } = useMapContext();

  return useMemo(() => {
    if (!camionesRuta?.length) {
      return {
        totalTrucks: 0,
        totalCapacity: 0,
        totalCurrentLoad: 0,
        overallPercentage: 0,
        availableTrucks: 0,
        inTransitTrucks: 0,
        maintenanceTrucks: 0,
        averageLoadPercentage: 0,
        trucksInWarehouse: 0,
        emptyTrucks: 0,
      };
    }

    // ✅ Función para obtener capacidad por tipo (igual que en panel y tooltip)
    const getCapacidadMaxima = (codigo: string) => {
      const tipo = codigo.substring(0, 2);
      switch (tipo) {
        case "TA": return 25; // 25m³
        case "TB": return 15; // 15m³
        case "TC": return 10; // 10m³
        case "TD": return 5;  // 5m³
        default: return 10;
      }
    };

    // Posiciones de almacenes para detectar si están en almacén
    const almacenPositions = [
      { x: 12, y: 8 },  // Almacén Central
      { x: 42, y: 42 }, // Almacén Norte
      { x: 63, y: 3 }   // Almacén Este
    ];

    let totalCapacity = 0;
    let totalCurrentLoad = 0;
    let availableTrucks = 0;
    let inTransitTrucks = 0;
    let maintenanceTrucks = 0;
    let trucksInWarehouse = 0;
    let emptyTrucks = 0;

    camionesRuta.forEach((truck) => {
      const capacity = getCapacidadMaxima(truck.codigo);
      const currentLoad = truck.cargaAsignada || 0;

      totalCapacity += capacity;
      totalCurrentLoad += currentLoad;

      // Verificar si está en almacén
      const isInWarehouse = almacenPositions.some(
        (pos) => pos.x === truck.ubicacionActual.x && pos.y === truck.ubicacionActual.y
      );

      // Verificar si está vacío
      if (currentLoad === 0) {
        emptyTrucks++;
      }

      // Contar estados
      if (truck.enAveria) {
        maintenanceTrucks++;
      } else if (truck.route && truck.route.length > 0 && !isInWarehouse) {
        inTransitTrucks++;
      } else if (isInWarehouse) {
        trucksInWarehouse++;
      } else {
        availableTrucks++;
      }
    });

    const overallPercentage = totalCapacity > 0 ? (totalCurrentLoad / totalCapacity) * 100 : 0;
    const averageLoadPercentage = camionesRuta.length > 0 ? overallPercentage : 0;

    return {
      totalTrucks: camionesRuta.length,
      totalCapacity,
      totalCurrentLoad,
      overallPercentage,
      availableTrucks,
      inTransitTrucks,
      maintenanceTrucks,
      averageLoadPercentage,
      trucksInWarehouse,
      emptyTrucks,
    };
  }, [camionesRuta]);
};
