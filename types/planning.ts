export interface PlanningRequest {
  algorithm: string
  options?: {
    maxIterations?: number
    timeLimit?: number
    optimizationCriteria?: "fuel" | "time" | "balanced"
  }
  includeOrders?: string[]
  includeTrucks?: string[]
}

export interface PlanningResult {
  id: string
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  startTime: string
  endTime?: string
  algorithm: string
  routes: {
    truckId: string
    orders: {
      orderId: string
      position: number
      estimatedArrival: string
    }[]
    totalDistance: number
    totalTime: number
    fuelConsumption: number
  }[]
  metrics: {
    totalDistance: number
    totalTime: number
    totalFuelConsumption: number
    averageDeliveryTime: number
    ordersPerTruck: number
  }
}
