export interface SimulationRequest {
  type: "daily" | "weekly" | "until_collapse"
  algorithm: string
  options?: {
    maxDays?: number
    orderGenerationRate?: number
    truckBreakdownProbability?: number
  }
}

export interface SimulationResult {
  id: string
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  startTime: string
  endTime?: string
  type: string
  algorithm: string
  days: {
    day: number
    metrics: {
      ordersReceived: number
      ordersDelivered: number
      ordersDelayed: number
      averageDeliveryTime: number
      fuelConsumption: number
      truckBreakdowns: number
      tankLevels: {
        tankId: string
        level: number
      }[]
    }
  }[]
  summary: {
    totalDays: number
    totalOrders: number
    totalDelivered: number
    totalDelayed: number
    averageDeliveryTime: number
    totalFuelConsumption: number
    totalBreakdowns: number
    collapseReason?: string
  }
}
