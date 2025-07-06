export interface Truck {
  id: string
  plate: string
  capacity: number
  currentLoad: number
  status: "available" | "in_transit" | "loading" | "maintenance"
  position: [number, number]
  driver: string
  phone: string
  truckType: "small" | "medium" | "large" | "special"
  lastMaintenance: string
  nextMaintenance: string
  fuelConsumption: number
  totalKilometers: number
  maintenanceHistory: {
    date: string
    type: "preventive" | "corrective"
    description: string
    cost?: number
  }[]
  operationalCategory?: "low" | "medium" | "high"
  currentOrders?: string[]
  comments?: string
}

export interface TruckCreateDto {
  plate: string
  capacity: number
  driver: string
  phone: string
  truckType: "small" | "medium" | "large" | "special"
}

export interface TruckUpdateDto {
  plate?: string
  capacity?: number
  driver?: string
  phone?: string
  truckType?: "small" | "medium" | "large" | "special"
  status?: "available" | "in_transit" | "loading" | "maintenance"
  comments?: string
}

export interface MaintenanceDto {
  type: "preventive" | "corrective"
  description: string
  cost?: number
}

export const TRUCK_TYPES = [
  { id: "small", name: "Pequeño (hasta 10 m³)", maxCapacity: 10 },
  { id: "medium", name: "Mediano (hasta 15 m³)", maxCapacity: 15 },
  { id: "large", name: "Grande (hasta 25 m³)", maxCapacity: 25 },
  { id: "special", name: "Especial (más de 25 m³)", maxCapacity: 40 },
]
