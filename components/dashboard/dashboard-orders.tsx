"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAppSelector } from "@/hooks/use-redux"
import { selectPendingOrders } from "@/store/orders/orders-selectors"
import { formatDateTime } from "@/lib/utils"
import { ordersService } from "@/services/orders-service"
import { Order } from "@/types/order"
import { CalendarIcon, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PedidosService from "@/services/pedidos.service"

// Interfaz para los pedidos de la API
interface ApiPedido {
  pedidoId: number
  clienteId: number
  dia: number
  hora: number
  minuto: number
  posX: number
  posY: number
  volumenGLP: number
  fechaRegistro: string
  fechaEntregaLimite: string
  plazoHoras: number
}

// Interfaz para la respuesta de la API
interface ApiResponse {
  fecha: string
  total: number
  pedidos: ApiPedido[]
}

// Cantidad de pedidos por página
const ITEMS_PER_PAGE = 5;

// Meses disponibles para selección
const AVAILABLE_MONTHS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

// Años disponibles para selección
const AVAILABLE_YEARS = ["2024", "2025", "2026"];

export function DashboardOrders() {
  // Estado para los pedidos adaptados
  const [allOrders, setAllOrders] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estado para mes y año seleccionados
  // Iniciara en enero
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState("01");
  const [selectedYear, setSelectedYear] = useState(format(currentDate, 'yyyy'));
  
  // Usar los pedidos pendientes del Redux store como fallback
  const pendingOrdersFromStore = useAppSelector(selectPendingOrders)
  
  // Calcular pedidos de la página actual
  const paginatedOrders = allOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );
  
  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  // Función para cargar los pedidos directamente desde el objeto de respuesta
  const loadPedidosDirectly = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Convertir a números para la API
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);
      
      console.log('Cargando pedidos para fecha:', `${year}-${month}`);
      
      const response = await PedidosService.getOrders(undefined, year, month);
      
      console.log('Respuesta completa:', response);
      
      // Verificar la estructura de la respuesta según el controlador backend
      if (response && response.success && response.data) {
        // El controlador devuelve { mensaje: string, pedidos: array }
        const responseData = response.data;
        // Verificar si la respuesta tiene la estructura esperada
        const pedidos = responseData.pedidos || (Array.isArray(responseData) ? responseData : []);
        console.log(`API devolvió ${pedidos.length} pedidos en total`);
        
        if (Array.isArray(pedidos) && pedidos.length > 0) {
          // Filtrar pedidos por mes y año usando fechaDeRegistro si es necesario
          const filteredPedidos = pedidos.filter(pedido => {
            if (!pedido.fechaDeRegistro) return true; // Si no hay fecha, lo incluimos
            
            try {
              const fechaRegistro = new Date(pedido.fechaDeRegistro);
              const pedidoMes = fechaRegistro.getMonth() + 1; // getMonth() devuelve 0-11
              const pedidoAnio = fechaRegistro.getFullYear();
              
              // Convertir selectedMonth y selectedYear a números para comparar
              const selectedMonthNum = parseInt(selectedMonth);
              const selectedYearNum = parseInt(selectedYear);
              
              console.log(`Comparando fecha: ${pedidoMes}/${pedidoAnio} con selección: ${selectedMonthNum}/${selectedYearNum}`);
              
              // Filtrar por mes y año
              return pedidoMes === selectedMonthNum && pedidoAnio === selectedYearNum;
            } catch (err) {
              console.error('Error al parsear fecha:', pedido.fechaDeRegistro, err);
              return true; // En caso de error, incluimos el pedido
            }
          });
          
          console.log(`Después de filtrar por fecha: ${filteredPedidos.length} de ${pedidos.length} pedidos`);
          
          // Actualizar el total de items para la paginación
          setTotalItems(filteredPedidos.length);
          
          const mappedOrders = filteredPedidos.map(pedido => ({
            id: pedido.idCliente || `pedido-${pedido.id}`,
            volume: pedido.cantidadGLP,
            posX: pedido.posX,
            posY: pedido.posY,
            location: {
              lng: pedido.posX,
              lat: pedido.posY
            },
            // Usar fechaEntrega como deadline
            deadline: pedido.fechaEntrega,
            // Añadir fechaDeRegistro para referencia
            fechaRegistro: pedido.fechaDeRegistro
          }));
          
          console.log('Pedidos mapeados:', mappedOrders);
          
          // Guardar todos los pedidos
          setAllOrders(mappedOrders);
          // Resetear a la primera página cuando cambiamos los datos
          setCurrentPage(1);
        } else {
          setAllOrders([]);
          setTotalItems(0);
        }
      } else {
        throw new Error('Formato de respuesta no válido');
      }
    } catch (err) {
      console.error('Error cargando pedidos directamente:', err);
      setError('Error al cargar los pedidos. Por favor, intente nuevamente.');
      // Usar los pedidos del store como fallback
      setAllOrders(pendingOrdersFromStore);
      setTotalItems(pendingOrdersFromStore.length);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para ir a la página siguiente
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  // Función para ir a la página anterior
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  useEffect(() => {
    loadPedidosDirectly();
  }, [selectedYear, selectedMonth]);
  
  // Función para refrescar los datos
  const handleRefresh = () => {
    loadPedidosDirectly();
  };
  
  // Obtener el nombre del mes seleccionado
  const getSelectedMonthName = () => {
    const month = AVAILABLE_MONTHS.find(m => m.value === selectedMonth);
    return month ? month.label : '';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Pedidos</h2>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {`${getSelectedMonthName()} ${selectedYear}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Mes</h4>
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccionar mes" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MONTHS.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Año</h4>
                  <Select
                    value={selectedYear}
                    onValueChange={setSelectedYear}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccionar año" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_YEARS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Actualizar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Información de carga */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-md mb-4">
          Cargando pedidos...
        </div>
      )}
      
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="text-center">Volumen Solicitado</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Fecha Límite</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No hay pedidos disponibles para {getSelectedMonthName()} {selectedYear}.
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {order.id || '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-center">
                    {order.volume !== undefined ? `${order.volume} m³` : "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {order.posX !== undefined && order.posY !== undefined ? 
                      `(${order.posX}, ${order.posY})` : 
                      (order.location?.lng !== undefined && order.location?.lat !== undefined ?
                        `(${order.location.lng}, ${order.location.lat})` : "-")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {order.deadline ? formatDateTime(order.deadline) : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Controles de paginación */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems} pedidos
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevPage} 
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <div className="text-sm font-medium">
              Página {currentPage} de {totalPages}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextPage} 
              disabled={currentPage === totalPages || loading}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}