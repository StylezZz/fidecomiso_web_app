import { delay } from "@/lib/utils"
import type { PlanningRequest, PlanningResult } from "@/types/planning"
import { algorithmsData } from "./mock-data"

// Simulación de planificaciones
const plannings: Record<string, PlanningResult> = {}
let nextPlanningId = 1

export const plannerService = {
  async startPlanning(planningData: PlanningRequest) {
    // Simular delay de red
    await delay(1200)

    const planningId = `planning${nextPlanningId++}`

    // Crear planificación inicial
    const planning: PlanningResult = {
      id: planningId,
      status: "pending",
      progress: 0,
      startTime: new Date().toISOString(),
      algorithm: planningData.algorithm,
      routes: [],
      metrics: {
        totalDistance: 0,
        totalTime: 0,
        totalFuelConsumption: 0,
        averageDeliveryTime: 0,
        ordersPerTruck: 0,
      },
    }

    plannings[planningId] = planning

    // Simular progreso de planificación
    this.simulatePlanningProgress(planningId)

    return { planningId }
  },

  async getPlanningStatus(planningId: string) {
    // Simular delay de red
    await delay(500)

    const planning = plannings[planningId]
    if (!planning) {
      throw new Error("Planning not found")
    }

    return {
      id: planning.id,
      status: planning.status,
      progress: planning.progress,
    }
  },

  async getPlanningResult(planningId: string) {
    // Simular delay de red
    await delay(800)

    const planning = plannings[planningId]
    if (!planning) {
      throw new Error("Planning not found")
    }

    if (planning.status !== "completed") {
      throw new Error("Planning not completed yet")
    }

    return planning
  },

  async cancelPlanning(planningId: string) {
    // Simular delay de red
    await delay(700)

    const planning = plannings[planningId]
    if (!planning) {
      throw new Error("Planning not found")
    }

    planning.status = "failed"
    planning.endTime = new Date().toISOString()

    return { success: true }
  },

  async getAvailableAlgorithms() {
    // Simular delay de red
    await delay(600)

    return algorithmsData
  },

  // Método para simular el progreso de la planificación
  simulatePlanningProgress(planningId: string) {
    const planning = plannings[planningId]
    if (!planning) return

    planning.status = "running"

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10

      if (progress >= 100) {
        progress = 100
        clearInterval(interval)

        // Completar la planificación con datos simulados
        planning.status = "completed"
        planning.progress = 100
        planning.endTime = new Date().toISOString()

        // Generar rutas simuladas
        planning.routes = [
          {
            truckId: "truck1",
            orders: [
              {
                orderId: "order1",
                position: 1,
                estimatedArrival: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              },
              {
                orderId: "order2",
                position: 2,
                estimatedArrival: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
              },
            ],
            totalDistance: 25.7,
            totalTime: 85,
            fuelConsumption: 12.3,
          },
          {
            truckId: "truck2",
            orders: [
              {
                orderId: "order3",
                position: 1,
                estimatedArrival: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
              },
            ],
            totalDistance: 18.2,
            totalTime: 45,
            fuelConsumption: 8.7,
          },
        ]

        // Generar métricas simuladas
        planning.metrics = {
          totalDistance: 43.9,
          totalTime: 130,
          totalFuelConsumption: 21.0,
          averageDeliveryTime: 65,
          ordersPerTruck: 1.5,
        }
      } else {
        planning.progress = Math.floor(progress)
      }
    }, 1000)
  },
}
