export interface Order {
  id: string
  customer: string
  customerType: string
  volume: number
  location: {
    lat: number
    lng: number
  }
  address: string
  createdAt: string
  deadline: string
  estimatedDeliveryTime: string
  status: "pending" | "assigned" | "in_transit" | "delivered" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  assignedTruck?: string
  estimatedTime?: number
  distance?: number
  trackingCode: string
  comments?: string
  contactEmail?: string
  contactPhone?: string
  truckDetails?: {
    capacity: number
    driver: string
    phone: string
    plate: string
  }
  timeline?: {
    status: string
    timestamp: string
    notes?: string
  }[]
  notificationsSent?: {
    confirmation: boolean
    dispatch: boolean
    delivery: boolean
  }
  tags?: Array<{ name: string; color: string }>
}

export interface OrderCreateDto {
  customer: string
  customerType: string
  volume: number
  location: {
    lat: number
    lng: number
  }
  address: string
  deadline: string
  priority: "low" | "medium" | "high" | "urgent"
  comments?: string
  contactEmail?: string
  contactPhone?: string
}

export interface OrderUpdateDto {
  location?: {
    lat: number
    lng: number
  }
  address?: string
  deadline?: string
  priority?: "low" | "medium" | "high" | "urgent"
  comments?: string
}

export const CUSTOMER_TYPES = [
  { id: "residential", name: "Residencial" },
  { id: "commercial", name: "Comercial" },
  { id: "industrial", name: "Industrial" },
  { id: "government", name: "Gubernamental" },
  { id: "other", name: "Otro" },
]

export const MIN_ORDER_VOLUME = 1 // m³
export const MAX_ORDER_VOLUME = 25 // m³
export const MIN_DELIVERY_HOURS = 4 // horas
