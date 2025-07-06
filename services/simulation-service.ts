import { delay } from "@/lib/utils"
import type { SimulationRequest as SimulationRequestType, SimulationResult } from "@/types/simulation"
import { simulationTypesData } from "./mock-data"

// Simulación de simulaciones
const simulations: Record<string, SimulationResult> = {}
let nextSimulationId = 1

export const simulationService = {
  async startSimulation(simulationData: SimulationRequestType) {
    // Simular delay de red
    await delay(1200)

    const simulationId = `simulation${nextSimulationId++}`

    // Crear simulación inicial
    const simulation: SimulationResult = {
      id: simulationId,
      status: "pending",
      progress: 0,
      startTime: new Date().toISOString(),
      type: simulationData.type,
      algorithm: simulationData.algorithm,
      days: [],
      summary: {
        totalDays: 0,
        totalOrders: 0,
        totalDelivered: 0,
        totalDelayed: 0,
        averageDeliveryTime: 0,
        totalFuelConsumption: 0,
        totalBreakdowns: 0,
      },
    }

    simulations[simulationId] = simulation

    // Simular progreso de simulación
    this.simulateSimulationProgress(simulationId, simulationData.type)

    return { simulationId }
  },

  async getSimulationStatus(simulationId: string) {
    // Simular delay de red
    await delay(500)

    const simulation = simulations[simulationId]
    if (!simulation) {
      throw new Error("Simulation not found")
    }

    return {
      id: simulation.id,
      status: simulation.status,
      progress: simulation.progress,
    }
  },

  async getSimulationResult(simulationId: string) {
    // Simular delay de red
    await delay(800)

    const simulation = simulations[simulationId]
    if (!simulation) {
      throw new Error("Simulation not found")
    }

    if (simulation.status !== "completed") {
      throw new Error("Simulation not completed yet")
    }

    return simulation
  },

  async cancelSimulation(simulationId: string) {
    // Simular delay de red
    await delay(700)

    const simulation = simulations[simulationId]
    if (!simulation) {
      throw new Error("Simulation not found")
    }

    simulation.status = "failed"
    simulation.endTime = new Date().toISOString()

    return { success: true }
  },

  async getSimulationTypes() {
    // Simular delay de red
    await delay(600)

    return simulationTypesData
  },

  // Método para simular el progreso de la simulación
  simulateSimulationProgress(simulationId: string, type: string) {
    const simulation = simulations[simulationId]
    if (!simulation) return

    simulation.status = "running"

    let progress = 0
    let days = 0
    const maxDays = type === "daily" ? 1 : type === "weekly" ? 7 : 15

    const interval = setInterval(() => {
      progress += Math.random() * 10

      if (progress >= 100) {
        progress = 100
        clearInterval(interval)

        // Completar la simulación con datos simulados
        simulation.status = "completed"
        simulation.progress = 100
        simulation.endTime = new Date().toISOString()

        // Generar resumen simulado
        simulation.summary = {
          totalDays: days,
          totalOrders: days * 15,
          totalDelivered: days * 14,
          totalDelayed: days,
          averageDeliveryTime: 1.2,
          totalFuelConsumption: days * 120,
          totalBreakdowns: Math.floor(days / 3),
        }

        if (type === "until_collapse") {
          simulation.summary.collapseReason = "Capacidad de tanques insuficiente para la demanda"
        }
      } else {
        // Actualizar progreso
        simulation.progress = Math.floor(progress)

        // Añadir día simulado
        days = Math.floor((progress / 100) * maxDays)

        if (days > simulation.days.length) {
          for (let i = simulation.days.length; i < days; i++) {
            simulation.days.push({
              day: i + 1,
              metrics: {
                ordersReceived: 15 + Math.floor(Math.random() * 5),
                ordersDelivered: 14 + Math.floor(Math.random() * 3),
                ordersDelayed: Math.floor(Math.random() * 2),
                averageDeliveryTime: 1.0 + Math.random() * 0.5,
                fuelConsumption: 110 + Math.floor(Math.random() * 20),
                truckBreakdowns: Math.random() > 0.7 ? 1 : 0,
                tankLevels: [
                  {
                    tankId: "tank1",
                    level: 80 + Math.floor(Math.random() * 40),
                  },
                  {
                    tankId: "tank2",
                    level: 70 + Math.floor(Math.random() * 50),
                  },
                ],
              },
            })
          }
        }
      }
    }, 1000)
  },
}
