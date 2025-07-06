import { delay } from "@/lib/utils"
import type { MapData } from "@/types/map"
import { mapData } from "./mock-data"

// Función para generar movimientos aleatorios de camiones siguiendo las rutas
function moveAlongRoute(truck: any, routes: any[]) {
  // Encontrar la ruta asociada a este camión
  const route = routes.find((r) => r.truckId === truck.id)

  if (!route || route.path.length < 2 || truck.status !== "in_transit") {
    return truck.position
  }

  // Encontrar el índice actual en la ruta
  let currentIndex = 0
  let minDistance = Number.POSITIVE_INFINITY

  for (let i = 0; i < route.path.length; i++) {
    const point = route.path[i]
    const distance = Math.sqrt(Math.pow(truck.position[0] - point[0], 2) + Math.pow(truck.position[1] - point[1], 2))

    if (distance < minDistance) {
      minDistance = distance
      currentIndex = i
    }
  }

  // Si estamos cerca del destino final, mantener la posición
  if (currentIndex === route.path.length - 1) {
    return truck.position
  }

  // Avanzar hacia el siguiente punto en la ruta
  const nextPoint = route.path[currentIndex + 1]
  const dx = nextPoint[0] - truck.position[0]
  const dy = nextPoint[1] - truck.position[1]
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Si estamos muy cerca del siguiente punto, avanzar al siguiente
  if (distance < 0.1) {
    return nextPoint
  }

  // Avanzar un paso hacia el siguiente punto
  const step = 0.1 // Velocidad de movimiento
  const ratio = step / distance

  return [truck.position[0] + dx * ratio, truck.position[1] + dy * ratio]
}

export const mapService = {
  async getMapData() {
    // Simular delay de red
    await delay(1000)
    return mapData
  },

  startRealTimeUpdates(callback: (data: MapData) => void) {
    // Crear una copia profunda de los datos para no modificar los originales
    let currentMapData = JSON.parse(JSON.stringify(mapData)) as MapData

    // Actualizar posiciones cada 1 segundo
    const intervalId = setInterval(() => {
      // Crear una nueva copia para cada actualización
      const updatedMapData = JSON.parse(JSON.stringify(currentMapData)) as MapData

      // Actualizar posiciones de camiones en movimiento
      updatedMapData.trucks = updatedMapData.trucks.map((truck) => {
        if (truck.status === "in_transit") {
          return {
            ...truck,
            position: moveAlongRoute(truck, updatedMapData.routes),
          }
        }
        return truck
      })

      // Actualizar la referencia a los datos actuales
      currentMapData = updatedMapData

      // Llamar al callback con los datos actualizados
      callback(updatedMapData)
    }, 1000)

    // Devolver función para detener las actualizaciones
    return () => {
      clearInterval(intervalId)
    }
  },
}
