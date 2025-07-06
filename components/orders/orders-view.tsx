"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { MainLayout } from "@/components/layout/main-layout"
import { OrdersTable } from "@/components/orders/orders-table"
import { OrderForm } from "@/components/orders/order-form"
import { AlertTriangle, Search, Filter, Download, Calendar, User, Package, MoreHorizontal, Plus, FileText, Truck, MapPin, Clock, CheckCircle, XCircle, Zap, X, ArrowDown } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { fetchOrders } from "@/store/orders/orders-slice"
import { selectOrders } from "@/store/orders/orders-selectors"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function OrdersView() {
  const [showExportModal, setShowExportModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [customerFilter, setCustomerFilter] = useState<string>("")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [trackingCode, setTrackingCode] = useState<string>("")
  
  // Estados para la paginación - agregando las de prioridad
  const [currentPageAll, setCurrentPageAll] = useState<number>(1)
  const [currentPagePending, setCurrentPagePending] = useState<number>(1)
  const [currentPageDelivered, setCurrentPageDelivered] = useState<number>(1)
  const [currentPageUrgent, setCurrentPageUrgent] = useState<number>(1)
  const [currentPageHigh, setCurrentPageHigh] = useState<number>(1)
  const [currentPageMedium, setCurrentPageMedium] = useState<number>(1)
  const [currentPageLow, setCurrentPageLow] = useState<number>(1)
  const [itemsPerPage] = useState<number>(10)

  const dispatch = useAppDispatch()
  const allOrders = useAppSelector(selectOrders)

  useEffect(() => {
    dispatch(fetchOrders())
  }, [dispatch])

  // Función para filtrar pedidos y aplicar paginación
  const filterOrders = (orders: any[]) => {
    // Primero filtramos los pedidos según los criterios
    const filteredOrders = orders.filter((order) => {
      // Filtrar por término de búsqueda
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.address && order.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.trackingCode && order.trackingCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        // Añadir búsqueda en etiquetas
        (order.tags && order.tags.some((tag: any) => tag.name.toLowerCase().includes(searchTerm.toLowerCase())))

      // Filtrar por código de seguimiento
      const matchesTracking = !trackingCode || (order.trackingCode && order.trackingCode.includes(trackingCode))

      // Filtrar por cliente
      const matchesCustomer = !customerFilter || order.customer.toLowerCase().includes(customerFilter.toLowerCase())

      // Formatear fecha para mostrar en el filtro
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0] // formato yyyy-MM-dd
      }

      // Filtrar por fecha
      const matchesDate = !dateFilter || formatDate(new Date(order.createdAt)).includes(dateFilter)

      // Filtrar por estado activo
      const matchesStatus = activeFilters.length === 0 || activeFilters.includes(order.status)

      return matchesSearch && matchesTracking && matchesCustomer && matchesDate && matchesStatus
    })
    
    return filteredOrders;
  }
  
  // Función actualizada para paginar por filtro incluyendo prioridades
  const getPaginatedOrdersByFilter = (orders: any[], filter: string, currentPage: number) => {
    let filteredOrders = filterOrders(orders);
    
    // Aplicar filtro específico de la pestaña
    if (filter === 'pending') {
      filteredOrders = filteredOrders.filter(order => order.status === 'pending');
    } else if (filter === 'delivered') {
      filteredOrders = filteredOrders.filter(order => order.status === 'delivered');
    } else if (filter === 'urgent') {
      filteredOrders = filteredOrders.filter(order => order.priority === 'urgent');
    } else if (filter === 'high') {
      filteredOrders = filteredOrders.filter(order => order.priority === 'high');
    } else if (filter === 'medium') {
      filteredOrders = filteredOrders.filter(order => order.priority === 'medium');
    } else if (filter === 'low') {
      filteredOrders = filteredOrders.filter(order => order.priority === 'low');
    }
    // 'all' no necesita filtro adicional
    
    // Calcular índices para la paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    return {
      paginatedOrders: filteredOrders.slice(indexOfFirstItem, indexOfLastItem),
      totalPages: Math.ceil(filteredOrders.length / itemsPerPage),
      totalItems: filteredOrders.length
    };
  }

  // Componente de paginación reutilizable
  const PaginationComponent = ({ currentPage, setCurrentPage, totalPages, totalItems, currentItems }: {
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
    totalItems: number;
    currentItems: number;
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
            let pageNumber;
            
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
              if (i === 4) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
              if (i === 0) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            } else {
              if (i === 0) return (
                <PaginationItem key={i}>
                  <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
                </PaginationItem>
              );
              if (i === 1) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
              if (i === 3) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
              if (i === 4) return (
                <PaginationItem key={i}>
                  <PaginationLink onClick={() => setCurrentPage(totalPages)}>{totalPages}</PaginationLink>
                </PaginationItem>
              );
              pageNumber = currentPage + i - 2;
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
            );
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
        Mostrando {Math.min(itemsPerPage, currentItems)} de {totalItems} pedidos
      </div>
    </div>
  );

  const handleExport = (exportFormat: string) => {
    const filteredOrders = filterOrders(allOrders)

    if (exportFormat === "csv") {
      const headers = [
        "ID",
        "Cliente", 
        "Tipo",
        "Volumen",
        "Dirección",
        "Fecha Creación",
        "Fecha Límite",
        "Estado",
        "Prioridad",
        "Código Seguimiento",
      ]

      const csvContent = [
        headers.join(","),
        ...filteredOrders.map((order) =>
          [
            order.id,
            `"${order.customer}"`,
            order.customerType,
            order.volume,
            `"${order.address}"`,
            format(new Date(order.createdAt), "dd/MM/yyyy HH:mm"),
            format(new Date(order.deadline), "dd/MM/yyyy HH:mm"),
            order.status,
            order.priority,
            order.trackingCode,
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `pedidos_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (exportFormat === "excel") {
      alert("Exportación a Excel: Esta funcionalidad se implementaría con una biblioteca como ExcelJS")
    } else if (exportFormat === "pdf") {
      alert("Exportación a PDF: Esta funcionalidad se implementaría con una biblioteca como jsPDF")
    }

    setShowExportModal(false)
  }

  return (
    <MainLayout>
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
            <p className="text-lg text-gray-600">Administra y monitorea todos los pedidos de distribución de GLP</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Cards de Estadísticas Mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgente</p>
                  <p className="text-2xl font-bold text-red-600">
                    {filterOrders(allOrders).filter(order => order.priority === 'urgent').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">(&lt;24 horas)</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alta Prioridad</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {filterOrders(allOrders).filter(order => order.priority === 'high').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">(1-3 días)</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Media Prioridad</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {filterOrders(allOrders).filter(order => order.priority === 'medium').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">(3-7 días)</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Baja Prioridad</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {filterOrders(allOrders).filter(order => order.priority === 'low').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">(&gt;7 días)</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <ArrowDown className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Entregados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filterOrders(allOrders).filter(order => order.status === 'delivered').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">(Finalizados)</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-4 w-full">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID, cliente, dirección o código de seguimiento"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex space-x-2">
                <div className="relative">
                  <Input
                    placeholder="Código de seguimiento"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                  />
                  {trackingCode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setTrackingCode("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
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
                      checked={activeFilters.includes("pending")}
                      onCheckedChange={(checked) => {
                        setActiveFilters(
                          checked ? [...activeFilters, "pending"] : activeFilters.filter((item) => item !== "pending"),
                        )
                      }}
                    >
                      Pendientes
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={activeFilters.includes("assigned")}
                      onCheckedChange={(checked) => {
                        setActiveFilters(
                          checked
                            ? [...activeFilters, "assigned"]
                            : activeFilters.filter((item) => item !== "assigned"),
                        )
                      }}
                    >
                      Asignados
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={activeFilters.includes("in_transit")}
                      onCheckedChange={(checked) => {
                        setActiveFilters(
                          checked
                            ? [...activeFilters, "in_transit"]
                            : activeFilters.filter((item) => item !== "in_transit"),
                        )
                      }}
                    >
                      En Ruta
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={activeFilters.includes("delivered")}
                      onCheckedChange={(checked) => {
                        setActiveFilters(
                          checked
                            ? [...activeFilters, "delivered"]
                            : activeFilters.filter((item) => item !== "delivered"),
                        )
                      }}
                    >
                      Entregados
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" onClick={() => setShowExportModal(true)}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>

            {(activeFilters.length > 0 || customerFilter || dateFilter) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                    {filter === "pending" && "Pendientes"}
                    {filter === "assigned" && "Asignados"}
                    {filter === "in_transit" && "En Ruta"}
                    {filter === "delivered" && "Entregados"}
                    {filter === "cancelled" && "Cancelados"}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => setActiveFilters(activeFilters.filter((item) => item !== filter))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}

                {customerFilter && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Cliente: {customerFilter}
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => setCustomerFilter("")}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {dateFilter && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Fecha: {dateFilter}
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => setDateFilter("")}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {(activeFilters.length > 0 || customerFilter || dateFilter) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setActiveFilters([])
                      setCustomerFilter("")
                      setDateFilter("")
                    }}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-3 lg:grid-cols-7 h-16">
            {/* Pestañas principales */}
            <TabsTrigger value="all" className="h-full flex items-center justify-center">
              Todos
            </TabsTrigger>
            <TabsTrigger value="pending" className="h-full flex items-center justify-center">
              Pendientes
            </TabsTrigger>
            <TabsTrigger value="delivered" className="h-full flex items-center justify-center">
              Entregados
            </TabsTrigger>
            
            {/* Pestañas de Prioridad con iconos y colores */}
            <TabsTrigger value="urgent" className="text-red-600 h-full flex flex-col items-center justify-center py-1">
              <div className="flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                <span className="text-sm">Urgente</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="high" className="text-blue-600 h-full flex flex-col items-center justify-center py-1">
              <div className="flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                <span className="text-sm">Alta</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="medium" className="text-yellow-600 h-full flex flex-col items-center justify-center py-1">
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                <span className="text-sm">Media</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="low" className="text-gray-600 h-full flex flex-col items-center justify-center py-1">
              <div className="flex items-center">
                <ArrowDown className="w-3 h-3 mr-1" />
                <span className="text-sm">Baja</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Todos los Pedidos</CardTitle>
                <CardDescription>Lista completa de pedidos en el sistema</CardDescription>
              </CardHeader>
              <CardContent className="w-full overflow-x-auto">
                <OrdersTable
                  filter="all"
                  searchTerm={searchTerm}
                  trackingCode={trackingCode}
                  customerFilter={customerFilter}
                  dateFilter={dateFilter}
                  statusFilters={activeFilters}
                  onSetCustomerFilter={setCustomerFilter}
                  paginatedOrders={getPaginatedOrdersByFilter(allOrders, 'all', currentPageAll).paginatedOrders}
                />
                
                <PaginationComponent
                  currentPage={currentPageAll}
                  setCurrentPage={setCurrentPageAll}
                  totalPages={getPaginatedOrdersByFilter(allOrders, 'all', currentPageAll).totalPages}
                  totalItems={getPaginatedOrdersByFilter(allOrders, 'all', currentPageAll).totalItems}
                  currentItems={getPaginatedOrdersByFilter(allOrders, 'all', currentPageAll).paginatedOrders.length}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pending" className="w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Pedidos Pendientes</CardTitle>
                <CardDescription>Pedidos que aún no han sido procesados</CardDescription>
              </CardHeader>
              <CardContent className="w-full overflow-x-auto">
                <OrdersTable
                  filter="pending"
                  searchTerm={searchTerm}
                  trackingCode={trackingCode}
                  customerFilter={customerFilter}
                  dateFilter={dateFilter}
                  statusFilters={activeFilters}
                  onSetCustomerFilter={setCustomerFilter}
                  paginatedOrders={getPaginatedOrdersByFilter(allOrders, 'pending', currentPagePending).paginatedOrders}
                />
                
                <PaginationComponent
                  currentPage={currentPagePending}
                  setCurrentPage={setCurrentPagePending}
                  totalPages={getPaginatedOrdersByFilter(allOrders, 'pending', currentPagePending).totalPages}
                  totalItems={getPaginatedOrdersByFilter(allOrders, 'pending', currentPagePending).totalItems}
                  currentItems={getPaginatedOrdersByFilter(allOrders, 'pending', currentPagePending).paginatedOrders.length}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="delivered" className="w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Pedidos Entregados</CardTitle>
                <CardDescription>Pedidos que ya han sido entregados</CardDescription>
              </CardHeader>
              <CardContent className="w-full overflow-x-auto">
                <OrdersTable
                  filter="delivered"
                  searchTerm={searchTerm}
                  trackingCode={trackingCode}
                  customerFilter={customerFilter}
                  dateFilter={dateFilter}
                  statusFilters={activeFilters}
                  onSetCustomerFilter={setCustomerFilter}
                  paginatedOrders={getPaginatedOrdersByFilter(allOrders, 'delivered', currentPageDelivered).paginatedOrders}
                />
                
                <PaginationComponent
                  currentPage={currentPageDelivered}
                  setCurrentPage={setCurrentPageDelivered}
                  totalPages={getPaginatedOrdersByFilter(allOrders, 'delivered', currentPageDelivered).totalPages}
                  totalItems={getPaginatedOrdersByFilter(allOrders, 'delivered', currentPageDelivered).totalItems}
                  currentItems={getPaginatedOrdersByFilter(allOrders, 'delivered', currentPageDelivered).paginatedOrders.length}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Pestañas de prioridad actualizadas */}
          <TabsContent value="urgent" className="w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Pedidos Urgentes
                </CardTitle>
                <CardDescription>Pedidos que requieren atención inmediata</CardDescription>
              </CardHeader>
              <CardContent className="w-full overflow-x-auto">
                <OrdersTable
                  filter="all"
                  searchTerm={searchTerm}
                  trackingCode={trackingCode}
                  customerFilter={customerFilter}
                  dateFilter={dateFilter}
                  statusFilters={activeFilters}
                  onSetCustomerFilter={setCustomerFilter}
                  paginatedOrders={getPaginatedOrdersByFilter(allOrders, 'urgent', currentPageUrgent).paginatedOrders}
                />
                
                <PaginationComponent
                  currentPage={currentPageUrgent}
                  setCurrentPage={setCurrentPageUrgent}
                  totalPages={getPaginatedOrdersByFilter(allOrders, 'urgent', currentPageUrgent).totalPages}
                  totalItems={getPaginatedOrdersByFilter(allOrders, 'urgent', currentPageUrgent).totalItems}
                  currentItems={getPaginatedOrdersByFilter(allOrders, 'urgent', currentPageUrgent).paginatedOrders.length}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="high" className="w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Zap className="w-5 h-5" />
                  Pedidos Alta Prioridad
                </CardTitle>
                <CardDescription>Pedidos con prioridad alta</CardDescription>
              </CardHeader>
              <CardContent className="w-full overflow-x-auto">
                <OrdersTable
                  filter="all"
                  searchTerm={searchTerm}
                  trackingCode={trackingCode}
                  customerFilter={customerFilter}
                  dateFilter={dateFilter}
                  statusFilters={activeFilters}
                  onSetCustomerFilter={setCustomerFilter}
                  paginatedOrders={getPaginatedOrdersByFilter(allOrders, 'high', currentPageHigh).paginatedOrders}
                />
                
                <PaginationComponent
                  currentPage={currentPageHigh}
                  setCurrentPage={setCurrentPageHigh}
                  totalPages={getPaginatedOrdersByFilter(allOrders, 'high', currentPageHigh).totalPages}
                  totalItems={getPaginatedOrdersByFilter(allOrders, 'high', currentPageHigh).totalItems}
                  currentItems={getPaginatedOrdersByFilter(allOrders, 'high', currentPageHigh).paginatedOrders.length}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="medium" className="w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <Clock className="w-5 h-5" />
                  Pedidos Prioridad Media
                </CardTitle>
                <CardDescription>Pedidos con prioridad media</CardDescription>
              </CardHeader>
              <CardContent className="w-full overflow-x-auto">
                <OrdersTable
                  filter="all"
                  searchTerm={searchTerm}
                  trackingCode={trackingCode}
                  customerFilter={customerFilter}
                  dateFilter={dateFilter}
                  statusFilters={activeFilters}
                  onSetCustomerFilter={setCustomerFilter}
                  paginatedOrders={getPaginatedOrdersByFilter(allOrders, 'medium', currentPageMedium).paginatedOrders}
                />
                
                <PaginationComponent
                  currentPage={currentPageMedium}
                  setCurrentPage={setCurrentPageMedium}
                  totalPages={getPaginatedOrdersByFilter(allOrders, 'medium', currentPageMedium).totalPages}
                  totalItems={getPaginatedOrdersByFilter(allOrders, 'medium', currentPageMedium).totalItems}
                  currentItems={getPaginatedOrdersByFilter(allOrders, 'medium', currentPageMedium).paginatedOrders.length}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="low" className="w-full">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-600">
                  <ArrowDown className="w-5 h-5" />
                  Pedidos Baja Prioridad
                </CardTitle>
                <CardDescription>Pedidos con prioridad baja</CardDescription>
              </CardHeader>
              <CardContent className="w-full overflow-x-auto">
                <OrdersTable
                  filter="all"
                  searchTerm={searchTerm}
                  trackingCode={trackingCode}
                  customerFilter={customerFilter}
                  dateFilter={dateFilter}
                  statusFilters={activeFilters}
                  onSetCustomerFilter={setCustomerFilter}
                  paginatedOrders={getPaginatedOrdersByFilter(allOrders, 'low', currentPageLow).paginatedOrders}
                />
                
                <PaginationComponent
                  currentPage={currentPageLow}
                  setCurrentPage={setCurrentPageLow}
                  totalPages={getPaginatedOrdersByFilter(allOrders, 'low', currentPageLow).totalPages}
                  totalItems={getPaginatedOrdersByFilter(allOrders, 'low', currentPageLow).totalItems}
                  currentItems={getPaginatedOrdersByFilter(allOrders, 'low', currentPageLow).paginatedOrders.length}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showExportModal && (
          <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Exportar Pedidos</DialogTitle>
                <DialogDescription>Seleccione el formato de exportación para los pedidos filtrados.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Formato de exportación</Label>
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                      onClick={() => handleExport("csv")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      CSV (.csv)
                      <span className="ml-auto text-xs text-muted-foreground">Recomendado</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                      onClick={() => handleExport("excel")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Excel (.xlsx)
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                      onClick={() => handleExport("pdf")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      PDF (.pdf)
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Opciones</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-headers"
                      className="h-4 w-4 rounded border-gray-300"
                      defaultChecked
                    />
                    <Label htmlFor="include-headers" className="text-sm font-normal">
                      Incluir encabezados
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="apply-filters"
                      className="h-4 w-4 rounded border-gray-300"
                      defaultChecked
                    />
                    <Label htmlFor="apply-filters" className="text-sm font-normal">
                      Aplicar filtros actuales
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowExportModal(false)}>
                  Cancelar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  )
}
