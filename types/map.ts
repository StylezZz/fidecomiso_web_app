export interface MapData {
  plant: {
    id: string
    position: [number, number] // [x, y] en coordenadas cartesianas
    name: string
    capacity: number | null // null para capacidad ilimitada
    currentLevel: number | null
  }
  tanks: {
    id: string
    position: [number, number] // [x, y] en coordenadas cartesianas
    name: string
    capacity: number
    currentLevel: number
    lastRefill: string
  }[]
  trucks: {
    id: string
    position: [number, number] // [x, y] en coordenadas cartesianas
    capacity: number
    currentLoad: number
    status: string
    type: string // Tipo de camión (TA, TB, TC, TD)
    currentRoute?: string
    destination?: [number, number]
  }[]
  orders: {
    id: string
    customer: string
    volume: number
    position: [number, number] // [x, y] en coordenadas cartesianas
    deadline: string
    status: string
  }[]
  routes: {
    id: string
    truckId: string
    path: [number, number][] // Array de puntos [x, y]
    color?: string
    completed: boolean
  }[]
  grid: {
    width: number // Ancho de la retícula en km
    height: number // Alto de la retícula en km
  }
}
