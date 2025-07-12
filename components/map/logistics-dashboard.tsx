"use client"

import { useState, useRef, useEffect } from "react"
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileText,
  Home,
  LayoutDashboard,
  Minus,
  Pause,
  Play,
  RotateCcw,
  Search,
  Truck,
  TruckIcon,
  Warehouse,
  X,
  Plus,
  Menu,
} from "lucide-react"
import { SidebarTrigger } from "../ui/sidebar"
import { cn } from "@/lib/utils"
// Usamos CSS para la cuadrícula en lugar de Konva para evitar problemas con el módulo 'canvas'

export function LogisticsDashboard() {
  // Estados para la interfaz de usuario
  const [showAlerts, setShowAlerts] = useState(false)
  const [alertCount, setAlertCount] = useState(1)
  const [selectedTab, setSelectedTab] = useState("vehiculos")
  const [showRouteSheet, setShowRouteSheet] = useState(false)
  const [showBreakdownModal, setShowBreakdownModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [breakdownType, setBreakdownType] = useState(1)
  const [vehicleBreakdowns, setVehicleBreakdowns] = useState<Record<string, any>>({})
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [tableCollapsed, setTableCollapsed] = useState(false)
  const [showLegend, setShowLegend] = useState(false)
  const alertsRef = useRef<HTMLDivElement>(null)

  // Estado para el movimiento del mapa
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mapRef = useRef(null)

  // Estado para el zoom
  const [zoomLevel, setZoomLevel] = useState(1)
  const minZoom = 0.5
  const maxZoom = 2

  // Estado para la posición de los camiones en las rutas
  const [truckPositions, setTruckPositions] = useState({
    truck1: { progress: 0, route: 1, currentRotation: 90 },
    truck2: { progress: 0, route: 2, currentRotation: 90 },
    truck3: { progress: 0, route: 3, currentRotation: 90 },
  })

  // Estado para la ruta sobre la que está el cursor
  const [hoveredRoute, setHoveredRoute] = useState<number | null>(null)
  
  // Estado para el bloqueo sobre el que está el cursor
  const [hoveredBlockade, setHoveredBlockade] = useState<number | string | null>(null)

  // Estado para la búsqueda
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Array<{id: string; name: string; x: number; y: number; type: string}>>([])

  // Definición de rutas modificadas para evitar los bloqueos
  const routes = {
    1: {
      path: "M 250,450 L 350,450 L 350,360 L 400,360",
      points: [
        { x: 250, y: 450 },
        { x: 350, y: 450 },
        { x: 350, y: 360 },
        { x: 400, y: 360 },
      ],
      color: "green",
      info: {
        name: "RUTA 1",
        time: "0.3 h",
        distance: "13.0 km",
      },
    },
    2: {
      // Ruta modificada para evitar el bloqueo en (500,400)-(550,400)-(550,350)
      path: "M 450,500 L 450,450 L 450,420 L 480,420 L 480,350 L 520,350 L 520,300",
      points: [
        { x: 450, y: 500 },
        { x: 450, y: 450 },
        { x: 450, y: 420 },
        { x: 480, y: 420 },
        { x: 480, y: 350 },
        { x: 520, y: 350 },
        { x: 520, y: 300 },
      ],
      color: "purple",
      info: {
        name: "RUTA 2",
        time: "0.5 h",
        distance: "20.0 km",
      },
    },
    3: {
      // Ruta modificada para evitar el bloqueo en (300,200)-(400,200)-(400,150)
      path: "M 150,200 L 150,100 L 250,100 L 250,50 L 400,50",
      points: [
        { x: 150, y: 200 },
        { x: 150, y: 100 },
        { x: 250, y: 100 },
        { x: 250, y: 50 },
        { x: 400, y: 50 },
      ],
      color: "blue",
      info: {
        name: "RUTA 3",
        time: "0.5 h",
        distance: "20.0 km",
      },
    },
  }

  // Añadir un nuevo estado para los bloqueos después de la definición de rutas
  const [blockades, setBlockades] = useState([
    {
      id: 1,
      name: "Bloqueo por obras municipales",
      points: [
        { x: 300, y: 200 },
        { x: 400, y: 200 },
        { x: 400, y: 150 },
      ],
      startDate: "2025-04-01",
      endDate: "2025-04-15",
      type: "open", // polígono abierto
      info: {
        reason: "Obras de pavimentación",
        authority: "Municipalidad de Lima",
        file: "202504.bloqueadas",
      },
    },
    {
      id: 2,
      name: "Bloqueo por evento público",
      points: [
        { x: 500, y: 400 },
        { x: 550, y: 400 },
        { x: 550, y: 350 },
      ],
      startDate: "2025-04-05",
      endDate: "2025-04-07",
      type: "open", // polígono abierto
      info: {
        reason: "Festival cultural",
        authority: "Municipalidad de Lima",
        file: "202504.bloqueadas",
      },
    },
  ])

  // El estado para el bloqueo sobre el que está el cursor ya está definido arriba

  // Puntos de interés para búsqueda
  const pointsOfInterest = [
    { id: "plant", name: "Planta Principal", x: 250, y: 450, type: "plant" },
    { id: "supply1", name: "Punto de Abastecimiento 1", x: 450, y: 500, type: "supply" },
    { id: "supply2", name: "Punto de Abastecimiento 2", x: 150, y: 200, type: "supply" },
    { id: "order1", name: "Pedido: Empresa ABC", x: 400, y: 360, type: "order" },
    { id: "order2", name: "Pedido: Restaurante XYZ", x: 520, y: 300, type: "order" },
    { id: "order3", name: "Pedido: Hotel Miraflores", x: 400, y: 50, type: "order" },
    { id: "truck1", name: "Camión 1", x: 300, y: 400, type: "truck" },
    { id: "truck2", name: "Camión 2", x: 550, y: 450, type: "truck" },
    { id: "truck3", name: "Camión 3", x: 200, y: 150, type: "truck" },
  ]

  // Cerrar alertas al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        alertsRef.current &&
        !alertsRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('button[data-alerts-trigger="true"]')
      ) {
        setShowAlerts(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Funciones para mover el mapa
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Solo botón izquierdo
      setIsDragging(true)
      setDragStart({
        x: e.clientX - mapPosition.x,
        y: e.clientY - mapPosition.y,
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      setMapPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  // Funciones para el zoom
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, maxZoom))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, minZoom))
  }

  // Función para buscar
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase()
    const results = pointsOfInterest.filter((poi) => poi.name.toLowerCase().includes(query))
    setSearchResults(results)
  }

  // Función para ir a un punto de interés
  const goToPoint = (point: {x: number; y: number}) => {
    // Calcular la posición central de la pantalla
    const mapContainer = mapRef.current
    if (!mapContainer) return

    // Calcular la nueva posición para centrar el punto
    const containerWidth = mapContainer.clientWidth || 800
    const containerHeight = mapContainer.clientHeight || 600
    const newX = containerWidth / 2 - point.x * zoomLevel
    const newY = containerHeight / 2 - point.y * zoomLevel

    setMapPosition({ x: newX, y: newY })
    setSearchResults([])
    setShowSearch(false)
    setSearchQuery("")
  }

  // Añadir y eliminar event listeners
  useEffect(() => {
    const mapElement = mapRef.current

    const handleMouseMoveEvent = (e: MouseEvent) => handleMouseMove(e)
    const handleMouseUpEvent = () => handleMouseUp()
    const handleMouseLeaveEvent = () => handleMouseLeave()

    if (mapElement) {
      mapElement.addEventListener("mousemove", handleMouseMoveEvent)
      mapElement.addEventListener("mouseup", handleMouseUpEvent)
      mapElement.addEventListener("mouseleave", handleMouseLeaveEvent)
    }

    return () => {
      if (mapElement) {
        mapElement.removeEventListener("mousemove", handleMouseMoveEvent)
        mapElement.removeEventListener("mouseup", handleMouseUpEvent)
        mapElement.removeEventListener("mouseleave", handleMouseLeaveEvent)
      }
    }
  }, [isDragging, dragStart])

  // Función para calcular la posición del camión en la ruta
  const getTruckPosition = (routeId: number, progress: number): { x: number; y: number; segment: number } => {
    const route = routes[routeId as keyof typeof routes]
    const points = route.points

    // Si solo hay un punto, devolver ese punto con segment = 0
    if (points.length === 1) return { ...points[0], segment: 0 }

    // Calcular en qué segmento de la ruta está el camión
    const totalSegments = points.length - 1
    const segmentLength = 1 / totalSegments
    const currentSegment = Math.min(Math.floor(progress / segmentLength), totalSegments - 1)
    const segmentProgress = (progress - currentSegment * segmentLength) / segmentLength

    // Calcular la posición interpolada entre los puntos del segmento
    const start = points[currentSegment]
    const end = points[currentSegment + 1]

    return {
      x: start.x + (end.x - start.x) * segmentProgress,
      y: start.y + (end.y - start.y) * segmentProgress,
      segment: currentSegment,
    }
  }

  // Función para calcular la rotación objetivo del camión según la dirección de la ruta
  const getTargetRotation = (routeId: number, segment: number): number => {
    const route = routes[routeId as keyof typeof routes]
    const points = route.points

    // Si solo hay un punto o estamos en el último segmento, mantener la rotación actual
    if (points.length <= 1 || segment >= points.length - 1) return 90

    // Calcular el ángulo entre los puntos del segmento
    const start = points[segment]
    const end = points[segment + 1]

    // Calcular el ángulo en radianes y convertir a grados
    // Añadir 90 grados para corregir la orientación
    const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI) + 90

    return angle
  }

  // Función para normalizar ángulos (asegurar que estén entre -180 y 180)
  const normalizeAngle = (angle: number) => {
    let normalized = angle
    while (normalized > 180) normalized -= 360
    while (normalized < -180) normalized += 360
    return normalized
  }

  // Función para calcular la rotación más corta entre dos ángulos
  const getShortestRotation = (current: number, target: number): number => {
    const normalizedCurrent = normalizeAngle(current)
    const normalizedTarget = normalizeAngle(target)

    let diff = normalizedTarget - normalizedCurrent

    // Asegurar que tomamos el camino más corto
    if (diff > 180) diff -= 360
    if (diff < -180) diff += 360

    return diff
  }

  // Efecto para animar los camiones en las rutas con rotación suave
  useEffect(() => {
    const interval = setInterval(() => {
      setTruckPositions((prev) => {
        const newPositions = { ...prev }

        // Actualizar cada camión
        Object.keys(newPositions).forEach((truckId) => {
          const truck = newPositions[truckId]
          const routeId = truck.route

          // Calcular nueva posición y segmento
          const newProgress =
            (truck.progress + (truckId === "truck1" ? 0.005 : truckId === "truck2" ? 0.003 : 0.004)) % 1
          const position = getTruckPosition(routeId, newProgress)
          const segment = position.segment

          // Calcular rotación objetivo basada en el segmento actual
          const targetRotation = getTargetRotation(routeId, segment)

          // Calcular la diferencia de rotación más corta
          const rotationDiff = getShortestRotation(truck.currentRotation, targetRotation)

          // Aplicar una parte de la rotación (giro gradual)
          // Ajustar el factor 0.1 para controlar la velocidad de giro
          const newRotation = truck.currentRotation + rotationDiff * 0.1

          // Actualizar el camión
          newPositions[truckId] = {
            ...truck,
            progress: newProgress,
            currentRotation: newRotation,
          }
        })

        return newPositions
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  // Función para manejar el hover sobre una ruta
  const handleRouteHover = (routeId: number) => {
    setHoveredRoute(routeId)
  }

  // Función para manejar cuando el mouse sale de una ruta
  const handleRouteLeave = () => {
    setHoveredRoute(null)
  }

  // Añadir funciones para manejar el hover sobre un bloqueo después de handleRouteLeave
  const handleBlockadeHover = (blockadeId: string) => {
    setHoveredBlockade(blockadeId)
  }

  const handleBlockadeLeave = () => {
    setHoveredBlockade(null)
  }

  // Reemplazar la función renderTruck con esta nueva implementación de vista cenital
  const renderTruck = (color: string, vehicleId: string) => {
    const hasBreakdown = vehicleId && vehicleBreakdowns[vehicleId]
    const truckColor = hasBreakdown ? "#ef4444" : color

    return (
      <>
        {/* Cuerpo principal del camión (vista cenital) */}
        <rect x="-15" y="-25" width="30" height="50" rx="3" fill={truckColor} stroke="white" strokeWidth="2" />

        {/* Cabina (parte frontal del camión) */}
        <rect x="-15" y="-25" width="30" height="15" rx="3" fill="#333" stroke="white" strokeWidth="1" />

        {/* Flecha direccional para indicar el frente */}
        <polygon points="0,-20 -8,-10 8,-10" fill="white" />

        {/* Detalles del techo */}
        <rect
          x="-10"
          y="-5"
          width="20"
          height="25"
          rx="1"
          fill={truckColor === "#ef4444" ? "#cc3333" : darkenColor(truckColor)}
        />

        {/* Ruedas (vistas desde arriba) */}
        <rect x="-17" y="-15" width="4" height="8" rx="1" fill="black" stroke="white" strokeWidth="0.5" />
        <rect x="13" y="-15" width="4" height="8" rx="1" fill="black" stroke="white" strokeWidth="0.5" />
        <rect x="-17" y="10" width="4" height="8" rx="1" fill="black" stroke="white" strokeWidth="0.5" />
        <rect x="13" y="10" width="4" height="8" rx="1" fill="black" stroke="white" strokeWidth="0.5" />

        {/* Indicador de avería si corresponde */}
        {hasBreakdown && (
          <>
            <circle cx="0" cy="-35" r="8" fill="#ef4444" stroke="white" strokeWidth="1" />
            <text x="0" y="-32" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
              !
            </text>
          </>
        )}
      </>
    )
  }

  // Función auxiliar para oscurecer un color (para detalles del techo)
  const darkenColor = (color) => {
    // Convertir colores nombrados a sus equivalentes hexadecimales
    const colorMap = {
      green: "#22c55e",
      purple: "#a855f7",
      blue: "#3b82f6",
      orange: "#f97316",
    }

    const hexColor = colorMap[color] || color

    // Oscurecer el color un 20%
    return hexColor
      .replace(/^#/, "")
      .match(/.{2}/g)
      .map((x) => {
        const num = Number.parseInt(x, 16)
        const darkened = Math.max(0, num - 40)
        return darkened.toString(16).padStart(2, "0")
      })
      .join("")
  }

  // Añadir una función para registrar una avería
  const registerBreakdown = (vehicleId, type) => {
    const now = new Date()
    const currentTurn = now.getHours() < 8 ? 1 : now.getHours() < 16 ? 2 : 3

    const availableDate = new Date(now)
    let availableTurn = currentTurn

    // Calcular disponibilidad según el tipo de incidente
    if (type === 1) {
      // Inmovilizado 2 horas, luego sigue su ruta
      // No cambia el día ni el turno para simplificar
    } else if (type === 2) {
      // Inoperativo por un turno completo
      if (currentTurn === 1) {
        availableTurn = 3
      } else if (currentTurn === 2) {
        availableDate.setDate(availableDate.getDate() + 1)
        availableTurn = 1
      } else {
        availableDate.setDate(availableDate.getDate() + 1)
        availableTurn = 2
      }
    } else if (type === 3) {
      // Inoperativo por 3 días
      availableDate.setDate(availableDate.getDate() + 3)
      availableTurn = 1
    }

    const breakdown = {
      vehicleId,
      type,
      registeredAt: now,
      currentTurn,
      availableDate,
      availableTurn,
      status: "active",
    }

    setVehicleBreakdowns((prev) => ({
      ...prev,
      [vehicleId]: breakdown,
    }))

    // Cerrar el modal
    setShowBreakdownModal(false)
    setSelectedVehicle(null)
  }

  // Añadir una función para abrir el modal de averías
  const openBreakdownModal = (vehicle) => {
    setSelectedVehicle(vehicle)
    setBreakdownType(1)
    setShowBreakdownModal(true)
  }

  const vehicles = [
    {
      id: "truck1",
      code: "truck1",
      position: "(12, 10)",
      capacity: "25 m³",
      fuel: "85%",
      deliveryPoint: "No asignado",
      color: "green",
      status: "Disponible",
      hasRoute: true,
    },
    {
      id: "truck2",
      code: "truck2",
      position: "(33, 26)",
      capacity: "15 m³",
      fuel: "72%",
      deliveryPoint: "(45, 30)",
      color: "purple",
      status: "En ruta",
      hasRoute: true,
    },
    {
      id: "truck3",
      code: "truck3",
      position: "(42, 40)",
      capacity: "10 m³",
      fuel: "95%",
      deliveryPoint: "No asignado",
      color: "orange",
      status: "Mantenimiento",
      hasRoute: false,
    },
    {
      id: "truck4",
      code: "truck4",
      position: "(53, 14)",
      capacity: "20 m³",
      fuel: "63%",
      deliveryPoint: "(60, 5)",
      color: "purple",
      status: "En ruta",
      hasRoute: true,
    },
    {
      id: "truck5",
      code: "truck5",
      position: "(63, 5)",
      capacity: "5 m³",
      fuel: "78%",
      deliveryPoint: "No asignado",
      color: "green",
      status: "Disponible",
      hasRoute: true,
    },
  ]

  const orders = [
    {
      id: "order1",
      client: "Empresa ABC",
      volume: "15 m³",
      status: "Pendiente",
      position: "(15, 20)",
    },
    {
      id: "order2",
      client: "Restaurante XYZ",
      volume: "8 m³",
      status: "Pendiente",
      position: "(30, 35)",
    },
    {
      id: "order3",
      client: "Hotel Miraflores",
      volume: "12 m³",
      status: "En curso",
      position: "(30, 45)",
    },
    {
      id: "order4",
      client: "Clínica San Pablo",
      volume: "10 m³",
      status: "Completado",
      position: "(40, 25)",
    },
    {
      id: "order5",
      client: "Supermercado Metro",
      volume: "18 m³",
      status: "En curso",
      position: "(5, 60)",
    },
    {
      id: "order6",
      client: "Residencial Los Pinos",
      volume: "5 m³",
      status: "Pendiente",
      position: "(35, 30)",
    },
    {
      id: "order7",
      client: "Municipalidad de Lima",
      volume: "20 m³",
      status: "Pendiente",
      position: "(25, 15)",
    },
  ]

  const routeSheets = [
    {
      truck: "truck1",
      status: "Disponible",
      distance: "13.0 km",
      time: "0.3 horas",
      fuel: "1.3 L",
      deliveryPoints: [],
    },
    {
      truck: "truck2",
      status: "En ruta",
      distance: "20.0 km",
      time: "0.5 horas",
      fuel: "2.0 L",
      deliveryPoints: [
        {
          order: "1",
          client: "Residencial Los Pinos",
          volume: "5 m³",
          position: "(35, 30)",
          status: "Pendiente",
        },
      ],
    },
    {
      truck: "truck4",
      status: "En ruta",
      distance: "20.0 km",
      time: "0.5 horas",
      fuel: "2.0 L",
      deliveryPoints: [
        {
          order: "3",
          client: "Hotel Miraflores",
          volume: "12 m³",
          position: "(30, 45)",
          status: "En curso",
        },
      ],
    },
  ]

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Secondary Navigation */}
        <div className="border-b flex items-center justify-between p-2 bg-white">
          <div className="flex gap-2 relative">
            <SidebarTrigger />
            <button
              className="flex items-center gap-1 px-3 py-1.5 rounded border text-sm relative"
              onClick={() => setShowAlerts(!showAlerts)}
              data-alerts-trigger="true"
            >
              <AlertCircle size={16} />
              Alertas
              {alertCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                  {alertCount}
                </div>
              )}
            </button>

            {/* Alertas flotantes */}
            {showAlerts && (
              <div
                ref={alertsRef}
                className="absolute top-full left-0 mt-1 z-50 w-96 bg-white border rounded-md shadow-lg"
              >
                <div className="bg-amber-50 border-amber-200 border-b p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-amber-500" size={20} />
                    <span className="text-amber-800">1 alerta activa requiere atención</span>
                  </div>
                  <button onClick={() => setShowAlerts(false)} className="text-amber-800">
                    <X size={16} />
                  </button>
                </div>

                <div className="bg-red-100 p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-red-500" size={20} />
                    <div>
                      <div className="font-semibold text-red-800">¡COLAPSO DETECTADO!</div>
                      <div className="text-sm text-red-700">
                        Sistema en colapso: no es posible abastecer todos los pedidos
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAlertCount((prev) => Math.max(0, prev - 1))
                    }}
                    className="text-red-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded border text-sm">
              <span>13/03/2023</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded border text-sm">
              <span>13d 01h 11m</span>
            </div>
            <button className="p-1.5 rounded border text-sm">
              <Play size={16} />
            </button>
            <button className="p-1.5 rounded border text-sm">
              <Pause size={16} />
            </button>
            <button className="p-1.5 rounded border text-sm">
              <RotateCcw size={16} />
            </button>
            <div className="flex border rounded">
              <button className="p-1.5 border-r text-sm">×0.5</button>
              <button className="p-1.5 border-r text-sm">×1</button>
              <button className="p-1.5 text-sm">×2</button>
            </div>
          </div>

          <div className="flex">
            <button
              onClick={() => setShowRouteSheet(true)}
              className="flex items-center justify-center gap-1 px-4 py-2 border text-gray-700"
            >
              <FileText size={16} />
              HOJA DE RUTA
            </button>
          </div>
        </div>
        {/* Map Area - Ajustado para mejor visualización */}
        <div
          className="flex-1 relative overflow-hidden border rounded-lg shadow-md bg-white"
          ref={mapRef}
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {/* Panel de búsqueda */}
          {showSearch && (
            <div className="absolute top-4 left-16 z-30 bg-white p-3 rounded-md shadow-md w-64">
              <div className="flex items-center gap-2 mb-2">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en el mapa..."
                  className="flex-1 text-sm border-none outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <button onClick={() => setShowSearch(false)} className="text-gray-400">
                  <X size={16} />
                </button>
              </div>
              <button onClick={handleSearch} className="w-full py-1 bg-blue-600 text-white text-sm rounded">
                Buscar
              </button>

              {searchResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => goToPoint(result)}
                    >
                      {result.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="absolute inset-0">
            {/* Cuadrícula con CSS */}
            <div
              className="absolute inset-0 grid bg-white"
              style={{
                // Cada celda representa 1 unidad en el mapa
                backgroundSize: `${40 * zoomLevel}px ${40 * zoomLevel}px`,
                backgroundImage:
                  "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
                backgroundPosition: `${mapPosition.x}px ${mapPosition.y}px`,
                transition: isDragging ? "none" : "background-position 0.1s ease",
              }}
            >              
              {/* Líneas principales (cada 5 unidades) */}
              <div 
                className="absolute inset-0" 
                style={{
                  backgroundSize: `${40 * 5 * zoomLevel}px ${40 * 5 * zoomLevel}px`,
                  backgroundImage:
                    "linear-gradient(to right, #cbd5e1 1.5px, transparent 1.5px), linear-gradient(to bottom, #cbd5e1 1.5px, transparent 1.5px)",
                  backgroundPosition: `${mapPosition.x}px ${mapPosition.y}px`,
                  transition: isDragging ? "none" : "background-position 0.1s ease",
                }}
              />
              
              {/* Borde del mapa - 70km x 50km */}
              <div 
                className="absolute inset-0 pointer-events-none" 
                style={{
                  border: '3px solid #2563eb', // Borde azul más visible
                  transform: `translate(${mapPosition.x}px, ${mapPosition.y}px)`,
                  width: `${70 * 40 * zoomLevel}px`,
                  height: `${50 * 40 * zoomLevel}px`,
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                  zIndex: 5
                }}
              />
              
              {/* Ejes X e Y */}
              <div 
                className="absolute inset-0 pointer-events-none" 
                style={{
                  borderLeft: '2px solid #000',
                  borderBottom: '2px solid #000',
                  transform: `translate(${mapPosition.x}px, ${mapPosition.y}px)`,
                  width: `${70 * 40 * zoomLevel}px`,
                  height: `${50 * 40 * zoomLevel}px`,
                }}
              />
              
              {/* Contenedor para las etiquetas de coordenadas X */}
              <div className="absolute bottom-0 left-0 w-full h-6 overflow-hidden z-10">
                {/* Generamos etiquetas dinámicas para el eje X */}
                <div className="absolute inset-0" style={{ transform: `translateX(${mapPosition.x}px)` }}>
                  {Array.from({ length: 71 }, (_, i) => {
                    // Determinar si mostrar esta etiqueta basado en el zoom
                    const shouldShow = i % 5 === 0 || (zoomLevel > 0.7 && i % 1 === 0);
                    if (!shouldShow) return null;
                    
                    return (
                      <div 
                        key={`x-${i}`}
                        className="absolute bottom-1 transform -translate-x-1/2"
                        style={{
                          left: `${i * 40 * zoomLevel}px`,
                          color: i % 5 === 0 ? '#4b5563' : '#94a3b8',
                          fontWeight: i % 5 === 0 ? 'bold' : 'normal',
                          fontSize: i % 5 === 0 ? '0.8rem' : '0.7rem',
                        }}
                      >
                        {i}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Contenedor para las etiquetas de coordenadas Y */}
              <div className="absolute top-0 left-0 w-6 h-full overflow-hidden z-10">
                {/* Generamos etiquetas dinámicas para el eje Y */}
                <div 
                  className="absolute inset-0" 
                  style={{ 
                    transform: `translate(0, ${mapPosition.y}px) scale(1, ${zoomLevel})`,
                    transformOrigin: "0 0"
                  }}
                >
                  {Array.from({ length: 51 }, (_, i) => {
                    // Determinar si mostrar esta etiqueta basado en el zoom
                    const shouldShow = i % 5 === 0 || (zoomLevel > 0.7 && i % 1 === 0);
                    if (!shouldShow) return null;
                    
                    return (
                      <div 
                        key={`y-${i}`}
                        className="absolute left-1 transform -translate-y-1/2"
                        style={{
                          bottom: `${i * 40}px`, // Quitamos el zoomLevel porque ya lo aplicamos en el contenedor
                          color: i % 5 === 0 ? '#4b5563' : '#94a3b8',
                          fontWeight: i % 5 === 0 ? 'bold' : 'normal',
                          fontSize: i % 5 === 0 ? '0.8rem' : '0.7rem',
                        }}
                      >
                        {i}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Contenedor para los elementos del mapa */}
            <div 
              className="absolute inset-0"
              style={{
                transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${zoomLevel})`,
                transformOrigin: "0 0",
              }}
            >
              {/* Almacenes - Coordenadas según las reglas del proyecto */}
              {/* Almacén Central (12, 8) */}
              <div 
                className="absolute z-30"
                style={{
                  bottom: `${8 * 40}px`,  //Validar esto!!
                  left: `${12 * 40}px`,
                  width: '1px',
                  height: '1px',
                }}
              >
                <div 
                  className="absolute w-10 h-10 rounded-lg bg-blue-800 border-2 border-white shadow-lg flex items-center justify-center"
                  style={{
                    transform: 'translate(-50%, 50%)',
                  }}
                >
                  <Warehouse className="text-white" size={18} />
                </div>
              </div>
              
              {/* Almacén Intermedio Norte (42, 42) */}
              <div 
                className="absolute z-30"
                style={{
                  bottom: `${42 * 40}px`,
                  left: `${42 * 40}px`,
                  width: '1px',
                  height: '1px',
                }}
              >
                <div 
                  className="absolute w-8 h-8 rounded-md bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center"
                  style={{
                    transform: 'translate(-50%, 50%)',
                  }}
                >
                  <Warehouse className="text-white" size={16} />
                </div>
              </div>
              
              {/* Almacén Intermedio Este (63, 3) */}
              <div 
                className="absolute z-30"
                style={{
                  bottom: `${3 * 40}px`,
                  left: `${63 * 40}px`,
                  width: '1px',
                  height: '1px',
                }}
              >
                <div 
                  className="absolute w-8 h-8 rounded-md bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center"
                  style={{
                    transform: 'translate(-50%, 50%)',
                  }}
                >
                  <Warehouse className="text-white" size={16} />
                </div>
              </div>

              {/* Rutas de camiones */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
                {/* Ruta 1: Planta principal a punto de entrega */}
                <g
                  onMouseEnter={() => handleRouteHover(1)}
                  onMouseLeave={handleRouteLeave}
                  style={{ cursor: "pointer" }}
                >
                  <path
                    d={routes[1].path}
                    stroke="green"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="5,5"
                    strokeOpacity="0.8"
                  />
                  {routes[1].points.map((point, index) => (
                    <circle key={`route1-point-${index}`} cx={point.x} cy={point.y} r="3" fill="green" />
                  ))}
                </g>

                {/* Ruta 2: Abastecimiento 1 a punto de entrega */}
                <g
                  onMouseEnter={() => handleRouteHover(2)}
                  onMouseLeave={handleRouteLeave}
                  style={{ cursor: "pointer" }}
                >
                  <path
                    d={routes[2].path}
                    stroke="purple"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="5,5"
                    strokeOpacity="0.8"
                  />
                  {routes[2].points.map((point, index) => (
                    <circle key={`route2-point-${index}`} cx={point.x} cy={point.y} r="3" fill="purple" />
                  ))}
                </g>

                {/* Ruta 3: Abastecimiento 2 a punto de entrega */}
                <g
                  onMouseEnter={() => handleRouteHover(3)}
                  onMouseLeave={handleRouteLeave}
                  style={{ cursor: "pointer" }}
                >
                  <path
                    d={routes[3].path}
                    stroke="blue"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="5,5"
                    strokeOpacity="0.8"
                  />
                  {routes[3].points.map((point, index) => (
                    <circle key={`route3-point-${index}`} cx={point.x} cy={point.y} r="3" fill="blue" />
                  ))}
                </g>

                {/* Camiones en movimiento - Ahora con giro suave */}
                {/* Camión en ruta 1 */}
                {truckPositions.truck1 && (
                  <g
                    transform={`translate(${getTruckPosition(1, truckPositions.truck1.progress).x}, ${
                      getTruckPosition(1, truckPositions.truck1.progress).y
                    }) rotate(${truckPositions.truck1.currentRotation})`}
                  >
                    {renderTruck("green", "truck1")}
                  </g>
                )}

                {/* Camión en ruta 2 */}
                {truckPositions.truck2 && (
                  <g
                    transform={`translate(${getTruckPosition(2, truckPositions.truck2.progress).x}, ${
                      getTruckPosition(2, truckPositions.truck2.progress).y
                    }) rotate(${truckPositions.truck2.currentRotation})`}
                  >
                    {renderTruck("purple", "truck2")}
                  </g>
                )}

                {/* Camión en ruta 3 */}
                {truckPositions.truck3 && (
                  <g
                    transform={`translate(${getTruckPosition(3, truckPositions.truck3.progress).x}, ${
                      getTruckPosition(3, truckPositions.truck3.progress).y
                    }) rotate(${truckPositions.truck3.currentRotation})`}
                  >
                    {renderTruck("blue", "truck3")}
                  </g>
                )}

                {/* Bloqueos */}
                {blockades.map((blockade) => (
                  <g
                    key={`blockade-${blockade.id}`}
                    onMouseEnter={() => handleBlockadeHover(blockade.id.toString())}
                    onMouseLeave={handleBlockadeLeave}
                    style={{ cursor: "pointer" }}
                  >
                    <path
                      d={`M${blockade.points.map((p) => `${p.x},${p.y}`).join(" L")}`}
                      stroke="red"
                      strokeWidth="6"
                      fill="none"
                      strokeOpacity="0.7"
                      strokeDasharray="10,5"
                    />
                    {blockade.points.map((point, index) => (
                      <circle
                        key={`blockade-${blockade.id}-point-${index}`}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill="red"
                      />
                    ))}
                  </g>
                ))}
              </svg>

              {/* Información de ruta al pasar el mouse */}
              {hoveredRoute && (
                <div
                  className="absolute z-40 text-white text-xs p-2 rounded-sm shadow-md"
                  style={{
                    top: hoveredRoute ? routes[hoveredRoute as keyof typeof routes].points[1].y - 40 : 0,
                    left: hoveredRoute ? routes[hoveredRoute as keyof typeof routes].points[1].x + 20 : 0,
                    backgroundColor: hoveredRoute === 1 ? "#22c55e" : hoveredRoute === 2 ? "#a855f7" : "#3b82f6",
                  }}
                >
                  <div className="font-semibold">{hoveredRoute && routes[hoveredRoute as keyof typeof routes].info.name}</div>
                  <div className="text-[10px]">Tiempo: {hoveredRoute && routes[hoveredRoute as keyof typeof routes].info.time}</div>
                  <div className="text-[10px]">Distancia: {hoveredRoute && routes[hoveredRoute as keyof typeof routes].info.distance}</div>
                </div>
              )}

              {/* Información de bloqueo al pasar el mouse */}
              {hoveredBlockade && (
                <div
                  className="absolute z-40 text-white text-xs p-2 rounded-sm shadow-md"
                  style={{
                    top: blockades.find((b) => b.id === hoveredBlockade).points[0].y - 40,
                    left: blockades.find((b) => b.id === hoveredBlockade).points[0].x + 20,
                    backgroundColor: "#ef4444",
                  }}
                >
                  <div className="font-semibold">{blockades.find((b) => b.id === hoveredBlockade).name}</div>
                  <div className="text-[10px]">
                    Razón: {blockades.find((b) => b.id === hoveredBlockade).info.reason}
                  </div>
                  <div className="text-[10px]">
                    Periodo: {blockades.find((b) => b.id === hoveredBlockade).startDate} al{" "}
                    {blockades.find((b) => b.id === hoveredBlockade).endDate}
                  </div>
                  <div className="text-[10px]">
                    Archivo: {blockades.find((b) => b.id === hoveredBlockade).info.file}
                  </div>
                </div>
              )}

              {/* Puntos de entrega (pedidos) */}
              <div className="absolute top-[360px] left-[400px] z-20">
                <div className="w-4 h-4 rounded-full bg-sky-400 border-2 border-white"></div>
              </div>

              <div className="absolute top-[300px] left-[520px] z-20">
                <div className="w-4 h-4 rounded-full bg-sky-400 border-2 border-white"></div>
              </div>

              <div className="absolute top-[50px] left-[400px] z-20">
                <div className="w-4 h-4 rounded-full bg-sky-400 border-2 border-white"></div>
              </div>

              {/* Otros pedidos sin asignar */}
              <div className="absolute top-[400px] left-[400px] z-20">
                <div className="w-4 h-4 rounded-full bg-sky-400 border-2 border-white"></div>
              </div>
              <div className="absolute top-[80px] left-[260px] z-20">
                <div className="w-4 h-4 rounded-full bg-sky-400 border-2 border-white"></div>
              </div>
            </div>

            {/* Map controls */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30">
              <button
                className="w-10 h-10 bg-white rounded-md shadow-lg flex items-center justify-center hover:bg-gray-100"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search size={20} />
              </button>
              <button
                className="w-10 h-10 bg-white rounded-md shadow-lg flex items-center justify-center hover:bg-gray-100"
                onClick={() => handleZoomIn()}
              >
                <Plus size={20} />
              </button>
              <button
                className="w-10 h-10 bg-white rounded-md shadow-lg flex items-center justify-center hover:bg-gray-100"
                onClick={() => handleZoomOut()}
              >
                <Minus size={20} />
              </button>
            </div>

            {/* Nivel de zoom actual */}
            <div className="absolute bottom-16 left-4 bg-white px-3 py-2 rounded-md shadow-md text-sm font-medium z-30">
              Zoom: {Math.round(zoomLevel * 100)}%
            </div>

            {/* Instrucciones para mover el mapa */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-full text-sm font-medium z-30 shadow-lg">
              Haz clic y arrastra para mover el mapa
            </div>
          </div>
        </div>
        {showLegend && (
          <div className="absolute top-20 right-4 z-30 bg-white rounded-md shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full border border-gray-300"></div>
                <span className="text-xs ml-1 font-medium">Leyenda</span>
              </div>
              <button
                onClick={() => setShowLegend(false)}
                className="text-gray-500 hover:text-gray-700"
                title="Cerrar leyenda"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Disponible</span>
              <span className="text-xs ml-auto">2/5</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-xs">En ruta</span>
              <span className="text-xs ml-auto">2/5</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs">Mantenimiento</span>
              <span className="text-xs ml-auto">1/5</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-sky-400"></div>
              <span className="text-xs">Pedidos</span>
              <span className="text-xs ml-auto">7/10</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-blue-700"></div>
              <span className="text-xs">Planta principal</span>
              <span className="text-xs ml-auto">1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-600"></div>
              <span className="text-xs">Puntos de abastecimiento</span>
              <span className="text-xs ml-auto">2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-700"></div>
              <span className="text-xs">Bloqueos</span>
              <span className="text-xs ml-auto">2</span>
            </div>
          </div>
        )}
        {/* Vehicle/Orders Table - Now at the bottom with collapse/expand functionality */}
        <div className={`border-t transition-all duration-300 ${tableCollapsed ? "h-12" : ""}`}>
          {/* Header with collapse/expand button */}
          <div className="p-0 flex justify-between items-center bg-gray-50">
            <div className="flex">
              <button
                className={`flex items-center justify-center gap-1 px-4 py-2 ${
                  selectedTab === "vehiculos" ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
                onClick={() => setSelectedTab("vehiculos")}
              >
                <Truck size={16} />
                VEHÍCULOS
              </button>
              <button
                className={`flex items-center justify-center gap-1 px-4 py-2 ${
                  selectedTab === "pedidos" ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
                onClick={() => setSelectedTab("pedidos")}
              >
                PEDIDOS
              </button>
              <button
                className="flex items-center justify-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200"
                onClick={() => setShowLegend(!showLegend)}
                title={showLegend ? "Ocultar leyenda" : "Mostrar leyenda"}
              >
                LEYENDA
              </button>
            </div>

            <div className="flex items-center gap-2 pr-2">
              {!tableCollapsed && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>1–10 de 20</span>
                  <button className="p-1 border rounded">
                    <ChevronLeft size={16} />
                  </button>
                  <button className="p-1 border rounded">
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              <button
                className="p-2 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors"
                onClick={() => setTableCollapsed(!tableCollapsed)}
                title={tableCollapsed ? "Expandir tabla" : "Contraer tabla"}
              >
                {tableCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>

          {/* Table content - only shown when not collapsed */}
          {!tableCollapsed && (
            <>
              <div className="p-2 border-t">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder={selectedTab === "vehiculos" ? "Buscar vehículos" : "Buscar pedidos"}
                    className="pl-8 pr-4 py-1.5 border rounded-md text-sm w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto max-h-[300px]">
                {selectedTab === "vehiculos" ? (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left text-sm">
                        <th className="py-2 px-4 font-medium">Cod. Vehículo</th>
                        <th className="py-2 px-4 font-medium">Posición</th>
                        <th className="py-2 px-4 font-medium">Capacidad</th>
                        <th className="py-2 px-4 font-medium">Combustible</th>
                        <th className="py-2 px-4 font-medium">Punto de entrega</th>
                        <th className="py-2 px-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="border-t">
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  vehicle.color === "green"
                                    ? "bg-green-500"
                                    : vehicle.color === "purple"
                                      ? "bg-purple-500"
                                      : "bg-orange-500"
                                }`}
                              ></div>
                              <span>{vehicle.code}</span>
                            </div>
                          </td>
                          <td className="py-2 px-4">{vehicle.position}</td>
                          <td className="py-2 px-4">{vehicle.capacity}</td>
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    Number.parseInt(vehicle.fuel) > 80
                                      ? "bg-green-500"
                                      : Number.parseInt(vehicle.fuel) > 60
                                        ? "bg-green-500"
                                        : Number.parseInt(vehicle.fuel) > 40
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                  }`}
                                  style={{ width: vehicle.fuel }}
                                ></div>
                              </div>
                              <span>{vehicle.fuel}</span>
                            </div>
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex items-center justify-between">
                              <span>{vehicle.deliveryPoint}</span>
                              {vehicle.deliveryPoint !== "No asignado" && (
                                <div className="flex items-center gap-1">
                                  <div className="w-16 h-2 bg-blue-100 rounded-full overflow-hidden">
                                    <div className="h-full w-1/2 bg-blue-500 rounded-full"></div>
                                  </div>
                                  <span className="text-xs text-blue-500">{vehicle.deliveryPoint}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-4">
                            {vehicleBreakdowns[vehicle.id] && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                                Avería Tipo {vehicleBreakdowns[vehicle.id].type}
                              </span>
                            )}
                            {!vehicleBreakdowns[vehicle.id] && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                Sin averías
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left text-sm">
                        <th className="py-2 px-4 font-medium">Pedido</th>
                        <th className="py-2 px-4 font-medium">Cliente</th>
                        <th className="py-2 px-4 font-medium">Volumen</th>
                        <th className="py-2 px-4 font-medium">Estado</th>
                        <th className="py-2 px-4 font-medium">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-t hover:bg-gray-50 text-sm">
                          <td className="py-2 px-4">{order.id}</td>
                          <td className="py-2 px-4">{order.client}</td>
                          <td className="py-2 px-4">{order.volume} m³</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${order.status === "En curso" ? "bg-blue-100 text-blue-800" : order.status === "Pendiente" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-2 px-4">{order.position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
