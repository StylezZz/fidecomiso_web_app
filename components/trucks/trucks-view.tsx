"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { MainLayout } from "@/components/layout/main-layout"
import { TrucksTable } from "@/components/trucks/trucks-table"
import { Plus, Search, Download, Filter, AlertTriangle, Loader2, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from "date-fns"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Interfaces para la API
interface ApiResponse {
  mensaje: string
  camiones: ApiTruck[]
}

interface ApiTruck {
  id: number
  codigo: string
  tara: number
  carga: number
  pesoCarga: number
  peso: number
  combustible: number
  distanciaMaxima: number
  distanciaRecorrida: number
  velocidad: number
  route: any
  capacidadCompleta: boolean
  cargaAsignada: number
  tiempoViaje: number
  ubicacionActual: any
  tipoAveria: number
  enAveria: boolean
  tiempoInicioAveria: any
  tiempoFinAveria: any
  glpDisponible: number
  detenido: boolean
  tiempoDetenido: number
  cargaAnterior: number
  pedidosAsignados: any
}

// Interfaz para la UI
interface UiTruck {
  id: string
  plate: string
  driver: string
  phone: string
  capacity: number
  currentLoad: number
  status: string
  lastMaintenance: string
  nextMaintenance: string
  type: string
    // Nuevos campos técnicos
    tara: number
    pesoCarga: number
    distanciaMaxima: number
    distanciaRecorrida: number
    velocidad: number
    peso: number
}

export function TrucksView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [plateFilter, setPlateFilter] = useState<string>("")
  
  // ✅ ESTADOS PARA PAGINACIÓN
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage] = useState<number>(10)
  
  // Estados para la API
  const [trucks, setTrucks] = useState<UiTruck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para adaptar datos de la API a la UI
  const adaptApiTruckToUiTruck = (apiTruck: ApiTruck): UiTruck => {
    const truckType = apiTruck.codigo.substring(0, 2)
    
    let status = "available"
    if (apiTruck.enAveria) {
      status = "maintenance"
    } else if (apiTruck.tiempoViaje > 0) {
      status = "in_transit"
    } else if (apiTruck.carga < apiTruck.cargaAsignada) {
      status = "loading"
    }
  
    const today = new Date()
    const lastMaintenance = new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000))
    const nextMaintenance = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000))
    
    const driverName = `Conductor ${apiTruck.codigo.substring(3)}`
    const phone = `9${apiTruck.id.toString().padStart(8, '0')}`
  
    return {
      id: apiTruck.id.toString(),
      plate: apiTruck.codigo,
      driver: driverName,
      phone: phone,
      capacity: apiTruck.glpDisponible, // ✅ Usar glpDisponible como capacidad (25 kg)
      currentLoad: apiTruck.carga,      // ✅ Carga actual (25 kg)
      status: status,
      lastMaintenance: lastMaintenance.toISOString().split('T')[0],
      nextMaintenance: nextMaintenance.toISOString().split('T')[0],
      type: truckType,
      // Mapear nuevos campos
      tara: apiTruck.tara,
      pesoCarga: apiTruck.pesoCarga,
      distanciaMaxima: apiTruck.distanciaMaxima,
      distanciaRecorrida: apiTruck.distanciaRecorrida,
      velocidad: apiTruck.velocidad,
      peso: apiTruck.peso
      
    }
  }

  // Función para obtener datos de la API
  // const fetchTrucks = async () => {
  //   try {
  //     setLoading(true)
  //     setError(null)
      
  //     const response = await fetch("http://200.16.7.188/api/camiones", {
  //       method: 'GET',
  //       headers: {
  //         'accept': '*/*',
  //         'Content-Type': 'application/json',
  //       },
  //     })

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`)
  //     }

  //     const data: ApiResponse = await response.json()
  //     console.log('Datos de la API:', data) // Para debugging
      
  //     Adaptar los datos
  //     const adaptedTrucks = data.camiones.map(apiTruck => 
  //       adaptApiTruckToUiTruck(apiTruck)
  //     )
      
  //     setTrucks(adaptedTrucks)
  //   } catch (error) {
  //     console.error('Error al obtener camiones:', error)
  //     setError(error instanceof Error ? error.message : 'Error desconocido')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchTrucks()
  }, [])

  // Función para recargar datos
  const handleRefresh = () => {
    fetchTrucks()
  }

  // Filtrar camiones
  const filteredTrucks = trucks.filter((truck) => {
    const matchesSearch =
      truck.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.plate.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPlate = !plateFilter || truck.plate.toLowerCase().includes(plateFilter.toLowerCase())
    const matchesStatus = activeFilters.length === 0 || activeFilters.includes(truck.status)

    return matchesSearch && matchesPlate && matchesStatus
  })

  // Estadísticas
  const stats = {
    total: trucks.length,
    available: trucks.filter(t => t.status === 'available').length,
    in_transit: trucks.filter(t => t.status === 'in_transit').length,
    loading: trucks.filter(t => t.status === 'loading').length,
    maintenance: trucks.filter(t => t.status === 'maintenance').length,
  }

  // Función para exportar camiones
  const exportTrucks = () => {
    if (typeof window === "undefined") return
    
    const headers = [
      "ID", "Placa", "Conductor", "Teléfono", "Capacidad", 
      "Carga Actual", "Estado", "Tipo", "Último Mantenimiento", "Próximo Mantenimiento"
    ]

    const csvContent = [
      headers.join(","),
      ...filteredTrucks.map((truck) =>
        [
          truck.id,
          truck.plate,
          `"${truck.driver}"`,
          truck.phone,
          truck.capacity,
          truck.currentLoad,
          truck.status,
          truck.type,
          truck.lastMaintenance,
          truck.nextMaintenance,
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `camiones_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ✅ FUNCIÓN PARA PAGINAR CAMIONES POR FILTRO
  const getPaginatedTrucksByFilter = (trucks: UiTruck[], filter: string, currentPage: number) => {
    let filteredTrucks = trucks.filter((truck) => {
      const matchesSearch =
        truck.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.plate.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPlate = !plateFilter || truck.plate.toLowerCase().includes(plateFilter.toLowerCase())
      const matchesStatus = activeFilters.length === 0 || activeFilters.includes(truck.status)

      return matchesSearch && matchesPlate && matchesStatus
    })
    
    // Aplicar filtro específico de la pestaña
    if (filter === 'TA') {
      filteredTrucks = filteredTrucks.filter(truck => truck.type === 'TA')
    } else if (filter === 'TB') {
      filteredTrucks = filteredTrucks.filter(truck => truck.type === 'TB')
    } else if (filter === 'TC') {
      filteredTrucks = filteredTrucks.filter(truck => truck.type === 'TC')
    } else if (filter === 'TD') {
      filteredTrucks = filteredTrucks.filter(truck => truck.type === 'TD')
    }
    // 'all' no necesita filtro adicional
    
    // Calcular índices para la paginación
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    
    return {
      paginatedTrucks: filteredTrucks.slice(indexOfFirstItem, indexOfLastItem),
      totalPages: Math.ceil(filteredTrucks.length / itemsPerPage),
      totalItems: filteredTrucks.length
    }
  }

  // ✅ COMPONENTE DE PAGINACIÓN REUTILIZABLE
  const PaginationComponent = ({ currentPage, setCurrentPage, totalPages, totalItems, currentItems }: {
    currentPage: number
    setCurrentPage: (page: number) => void
    totalPages: number
    totalItems: number
    currentItems: number
  }) => (
    <div className="mt-4 flex flex-col items-center justify-center space-y-2">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            let pageNumber
            
            if (totalPages <= 5) {
              pageNumber = i + 1
            } else if (currentPage <= 3) {
              pageNumber = i + 1
              if (i === 4) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i
              if (i === 0) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            } else {
              if (i === 0) return (
                <PaginationItem key={i}>
                  <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
                </PaginationItem>
              )
              if (i === 1) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
              if (i === 3) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
              if (i === 4) return (
                <PaginationItem key={i}>
                  <PaginationLink onClick={() => setCurrentPage(totalPages)}>{totalPages}</PaginationLink>
                </PaginationItem>
              )
              pageNumber = currentPage + i - 2
            }
            
            return (
              <PaginationItem key={i}>
                <PaginationLink 
                  onClick={() => setCurrentPage(pageNumber)}
                  isActive={currentPage === pageNumber}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            )
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      
      <div className="text-center text-sm text-muted-foreground">
        Mostrando {Math.min(itemsPerPage, currentItems)} de {totalItems} camiones
      </div>
    </div>
  )

  // ✅ RESETEAR PÁGINA AL CAMBIAR FILTROS
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, plateFilter, activeFilters])

  // Mostrar loading
  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Gestión de Camiones</h1>
          </div>
          
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <h3 className="text-lg font-semibold mb-2">Cargando datos de camiones</h3>
            <p className="text-muted-foreground">Obteniendo información desde la API...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Mostrar error
  if (error) {
    return (
      <MainLayout>
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Gestión de Camiones</h1>
          </div>
          
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error al cargar los datos</AlertTitle>
            <AlertDescription className="mt-2">
              {error}
            </AlertDescription>
            <div className="mt-4">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          </Alert>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Camiones</h1>
            <p className="text-gray-600">Administra y monitorea la flota de camiones cisternas para distribución de GLP</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-center">Total</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Camiones totales</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-center">Disponibles</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-4">
              <div className="text-2xl font-bold text-green-600">{stats.available}</div>
              <p className="text-xs text-muted-foreground">Listos para usar</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-center">Mantenimiento</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-4">
              <div className="text-2xl font-bold text-red-600">{stats.maintenance}</div>
              <p className="text-xs text-muted-foreground">Fuera de servicio</p>
            </CardContent>
          </Card>
        </div>

        {/* ✅ CONCEPTOS BREVES CON ICONOS Y COLORES AJUSTADOS */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="mb-4 text-center">
              <h3 className="text-sm font-bold text-black drop-shadow-sm">
                Eventos durante la simulación
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              
              {/* MANTENIMIENTOS */}
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-black">Mantenimientos</h4>
                </div>
                <p className="text-xs text-black mb-1">• Preventivo: cada 2 meses</p>
                <p className="text-xs text-black mb-1">• El camión se queda en el almacén 1 día </p>
                <p className="text-xs text-black">• Si estaba en ruta, retorna al almacén</p>
              </div>

              {/* AVERÍAS - AHORA ÁMBAR */}
              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-black">Averías</h4>
                </div>
                <p className="text-xs text-black mb-1">• TI1: 2h (continúa ruta)</p>
                <p className="text-xs text-black mb-1">• TI2: 2h + 1 turno taller</p>
                <p className="text-xs text-black">• TI3: 4h + 1 día taller</p>
              </div>

              {/* BLOQUEOS - AHORA ROJO */}
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-black">Bloqueos</h4>
                </div>
                <p className="text-xs text-black mb-1">• Cierres de calles planificados</p>
                <p className="text-xs text-black mb-1">• Por nodos (x,y)</p>
                <p className="text-xs text-black">• Surgen y desaparecen en la simulación</p>
              </div>

              {/* REPLANIFICACIÓN */}
              <div className="bg-indigo-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-black">Replanificaciones</h4>
                </div>
                <p className="text-xs text-black mb-1">• Automática tras averías</p>
                <p className="text-xs text-black mb-1">• Considera disponibilidad</p>
                <p className="text-xs text-black">• Optimiza rutas y combustible</p>
              </div>

            </div>
          </CardContent>
        </Card>

        <Card className="mb-4 w-full">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID, conductor o placa"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex space-x-2">
                <div className="relative">
                  <Input
                    placeholder="Filtrar por placa"
                    value={plateFilter}
                    onChange={(e) => setPlateFilter(e.target.value)}
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtros
                      {activeFilters.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFilters.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuCheckboxItem
                      checked={activeFilters.includes("available")}
                      onCheckedChange={(checked) => {
                        setActiveFilters(
                          checked
                            ? [...activeFilters, "available"]
                            : activeFilters.filter((item) => item !== "available")
                        )
                      }}
                    >
                      Disponibles
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={activeFilters.includes("in_transit")}
                      onCheckedChange={(checked) => {
                        setActiveFilters(
                          checked
                            ? [...activeFilters, "in_transit"]
                            : activeFilters.filter((item) => item !== "in_transit")
                        )
                      }}
                    >
                      En Ruta
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={activeFilters.includes("loading")}
                      onCheckedChange={(checked) => {
                        setActiveFilters(
                          checked ? [...activeFilters, "loading"] : activeFilters.filter((item) => item !== "loading")
                        )
                      }}
                    >
                      Cargando
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={activeFilters.includes("maintenance")}
                      onCheckedChange={(checked) => {
                        setActiveFilters(
                          checked
                            ? [...activeFilters, "maintenance"]
                            : activeFilters.filter((item) => item !== "maintenance")
                        )
                      }}
                    >
                      En Mantenimiento
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" onClick={exportTrucks}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="all">Todos ({stats.total})</TabsTrigger>
            <TabsTrigger value="TA">Tipo TA ({trucks.filter(t => t.type === 'TA').length})</TabsTrigger>
            <TabsTrigger value="TB">Tipo TB ({trucks.filter(t => t.type === 'TB').length})</TabsTrigger>
            <TabsTrigger value="TC">Tipo TC ({trucks.filter(t => t.type === 'TC').length})</TabsTrigger>
            <TabsTrigger value="TD">Tipo TD ({trucks.filter(t => t.type === 'TD').length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="w-full">
            {(() => {
              const { paginatedTrucks, totalPages, totalItems } = getPaginatedTrucksByFilter(trucks, 'all', currentPage)
              return (
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Todos los Camiones</CardTitle>
                    <CardDescription>Lista completa de {totalItems} camiones</CardDescription>
                  </CardHeader>
                  <CardContent className="w-full overflow-x-auto">
                    <TrucksTable trucks={paginatedTrucks} />
                    <PaginationComponent
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      currentItems={paginatedTrucks.length}
                    />
                  </CardContent>
                </Card>
              )
            })()}
          </TabsContent>
          
          <TabsContent value="TA" className="w-full">
            {(() => {
              const { paginatedTrucks, totalPages, totalItems } = getPaginatedTrucksByFilter(trucks, 'TA', currentPage)
              return (
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Camiones de tipo TA</CardTitle>
                    <CardDescription>{totalItems} camiones de tipo TA</CardDescription>
                  </CardHeader>
                  <CardContent className="w-full overflow-x-auto">
                    <TrucksTable trucks={paginatedTrucks} />
                    <PaginationComponent
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      currentItems={paginatedTrucks.length}
                    />
                  </CardContent>
                </Card>
              )
            })()}
          </TabsContent>
          
          <TabsContent value="TB" className="w-full">
            {(() => {
              const { paginatedTrucks, totalPages, totalItems } = getPaginatedTrucksByFilter(trucks, 'TB', currentPage)
              return (
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Camiones de tipo TB</CardTitle>
                    <CardDescription>{totalItems} camiones de tipo TB</CardDescription>
                  </CardHeader>
                  <CardContent className="w-full overflow-x-auto">
                    <TrucksTable trucks={paginatedTrucks} />
                    <PaginationComponent
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      currentItems={paginatedTrucks.length}
                    />
                  </CardContent>
                </Card>
              )
            })()}
          </TabsContent>
          
          <TabsContent value="TC" className="w-full">
            {(() => {
              const { paginatedTrucks, totalPages, totalItems } = getPaginatedTrucksByFilter(trucks, 'TC', currentPage)
              return (
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Camiones de tipo TC</CardTitle>
                    <CardDescription>{totalItems} camiones de tipo TC</CardDescription>
                  </CardHeader>
                  <CardContent className="w-full overflow-x-auto">
                    <TrucksTable trucks={paginatedTrucks} />
                    <PaginationComponent
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      currentItems={paginatedTrucks.length}
                    />
                  </CardContent>
                </Card>
              )
            })()}
          </TabsContent>
          
          <TabsContent value="TD" className="w-full">
            {(() => {
              const { paginatedTrucks, totalPages, totalItems } = getPaginatedTrucksByFilter(trucks, 'TD', currentPage)
              return (
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Camiones de tipo TD</CardTitle>
                    <CardDescription>{totalItems} camiones de tipo TD</CardDescription>
                  </CardHeader>
                  <CardContent className="w-full overflow-x-auto">
                    <TrucksTable trucks={paginatedTrucks} />
                    <PaginationComponent
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      currentItems={paginatedTrucks.length}
                    />
                  </CardContent>
                </Card>
              )
            })()}
          </TabsContent>
        </Tabs>

        {/* ✅ ACTUALIZAR MENSAJE SIN RESULTADOS */}
        {(() => {
          const { totalItems } = getPaginatedTrucksByFilter(trucks, 'all', currentPage)
          return totalItems === 0 && !loading && !error && (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">No se encontraron camiones</h3>
                <p className="text-muted-foreground mb-4">
                  No hay camiones que coincidan con los filtros aplicados.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setPlateFilter("")
                    setActiveFilters([])
                    setCurrentPage(1)
                  }}
                >
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          )
        })()}
      </div>
    </MainLayout>
  )
}