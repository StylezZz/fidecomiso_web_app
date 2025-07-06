import { delay } from "@/lib/utils"
import type { Truck, TruckCreateDto, TruckUpdateDto, MaintenanceDto } from "@/types/truck"
import { trucksData } from "./mock-data"
import { addMonths } from "date-fns"

// Clonar los datos para no modificar los originales
let trucks = [...trucksData]
let nextId = trucks.length + 1

export const trucksService = {
  async getTrucks() {
    // Simular delay de red
    await delay(800)
    return trucks
  },

  async getTruckById(id: string) {
    // Simular delay de red
    await delay(500)

    const truck = trucks.find((truck) => truck.id === id)
    if (!truck) {
      throw new Error("Truck not found")
    }

    return truck
  },

  async getTruckByPlate(plate: string) {
    // Simular delay de red
    await delay(500)

    const truck = trucks.find((truck) => truck.plate.toLowerCase() === plate.toLowerCase())
    if (!truck) {
      throw new Error("Truck not found")
    }

    return truck
  },

  async createTruck(truckData: TruckCreateDto) {
    // Simular delay de red
    await delay(1200)

    // Verificar si la placa ya existe
    const existingTruck = trucks.find((truck) => truck.plate.toLowerCase() === truckData.plate.toLowerCase())
    if (existingTruck) {
      throw new Error("Truck with this plate already exists")
    }

    const now = new Date()
    const nextMaintenance = addMonths(now, 2)

    const newTruck: Truck = {
      id: `truck${nextId++}`,
      plate: truckData.plate,
      capacity: truckData.capacity,
      currentLoad: 0,
      status: "available",
      position: [-12.046374, -77.042793], // Posición por defecto
      driver: truckData.driver,
      phone: truckData.phone,
      truckType: truckData.truckType,
      lastMaintenance: now.toISOString(),
      nextMaintenance: nextMaintenance.toISOString(),
      fuelConsumption: 10.0,
      totalKilometers: 0,
      maintenanceHistory: [
        {
          date: now.toISOString(),
          type: "preventive",
          description: "Mantenimiento inicial",
        },
      ],
      operationalCategory: "low",
      comments: truckData.comments,
    }

    trucks.push(newTruck)
    return newTruck
  },

  async updateTruck(id: string, truckData: TruckUpdateDto) {
    // Simular delay de red
    await delay(1000)

    const truckIndex = trucks.findIndex((truck) => truck.id === id)
    if (truckIndex === -1) {
      throw new Error("Truck not found")
    }

    // Si se está actualizando la placa, verificar que no exista otra con la misma placa
    if (truckData.plate) {
      const existingTruck = trucks.find(
        (truck) => truck.id !== id && truck.plate.toLowerCase() === truckData.plate.toLowerCase(),
      )
      if (existingTruck) {
        throw new Error("Truck with this plate already exists")
      }
    }

    // Actualizar el camión
    trucks[truckIndex] = {
      ...trucks[truckIndex],
      ...truckData,
    }

    return trucks[truckIndex]
  },

  async deleteTruck(id: string) {
    // Simular delay de red
    await delay(700)

    const truckIndex = trucks.findIndex((truck) => truck.id === id)
    if (truckIndex === -1) {
      throw new Error("Truck not found")
    }

    // Verificar si el camión puede ser eliminado
    if (trucks[truckIndex].status === "in_transit" || trucks[truckIndex].status === "loading") {
      throw new Error("Cannot delete a truck that is in transit or loading")
    }

    // Eliminar el camión
    trucks = trucks.filter((truck) => truck.id !== id)

    return { success: true }
  },

  async scheduleMaintenance(id: string, maintenanceData: MaintenanceDto) {
    // Simular delay de red
    await delay(900)

    const truckIndex = trucks.findIndex((truck) => truck.id === id)
    if (truckIndex === -1) {
      throw new Error("Truck not found")
    }

    const now = new Date()
    const nextMaintenance = addMonths(now, 2)

    // Crear el registro de mantenimiento
    const maintenanceRecord = {
      date: now.toISOString(),
      type: maintenanceData.type,
      description: maintenanceData.description,
      cost: maintenanceData.cost,
    }

    // Actualizar el historial de mantenimiento
    if (!trucks[truckIndex].maintenanceHistory) {
      trucks[truckIndex].maintenanceHistory = []
    }

    trucks[truckIndex].maintenanceHistory.push(maintenanceRecord)

    // Programar mantenimiento
    trucks[truckIndex] = {
      ...trucks[truckIndex],
      status: "maintenance",
      lastMaintenance: now.toISOString(),
      nextMaintenance: nextMaintenance.toISOString(),
    }

    return trucks[truckIndex]
  },

  async getMaintenanceHistory(id: string) {
    // Simular delay de red
    await delay(600)

    const truck = trucks.find((truck) => truck.id === id)
    if (!truck) {
      throw new Error("Truck not found")
    }

    return truck.maintenanceHistory || []
  },

  async getTruckStatistics(id: string) {
    // Simular delay de red
    await delay(800)

    const truck = trucks.find((truck) => truck.id === id)
    if (!truck) {
      throw new Error("Truck not found")
    }

    // En un sistema real, aquí se calcularían estadísticas basadas en datos históricos
    return {
      totalKilometers: truck.totalKilometers || Math.floor(Math.random() * 50000),
      totalDeliveries: Math.floor(Math.random() * 200),
      fuelEfficiency: truck.fuelConsumption,
      maintenanceCount: truck.maintenanceHistory?.length || 0,
      averageLoadPercentage: Math.floor(Math.random() * 80) + 20,
      operationalDays: Math.floor(Math.random() * 300) + 65,
    }
  },
}
