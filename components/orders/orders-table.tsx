"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAppSelector, useAppDispatch } from "@/hooks/use-redux"
import { selectOrders } from "@/store/orders/orders-selectors"
import { cancelOrder } from "@/store/orders/orders-slice"
import { formatDateTime } from "@/lib/utils"
import { OrderDetails } from "@/components/orders/order-details"
import { MoreHorizontal, Eye, X, Clock, Tag, Mail, ExternalLink, Truck, Package, CheckCircle, AlertTriangle, Zap } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { CUSTOMER_TYPES } from "@/types/order"
// Importar el nuevo componente de diálogo para asignar camiones
import { AssignTruckDialog } from "@/components/orders/assign-truck-dialog"
// Importar el nuevo componente TagOrderDialog
import { TagOrderDialog } from "@/components/orders/tag-order-dialog"

type OrdersTableProps = {
  filter: "all" | "pending" | "assigned" | "in_transit" | "delivered" | "cancelled"
  searchTerm?: string
  trackingCode?: string
  customerFilter?: string
  dateFilter?: string
  statusFilters?: string[]
  onSetCustomerFilter?: (customer: string) => void
  // Prop opcional para recibir pedidos paginados directamente
  paginatedOrders?: any[]
}

export function OrdersTable({
  filter,
  searchTerm = "",
  trackingCode = "",
  customerFilter = "",
  dateFilter = "",
  statusFilters = [],
  onSetCustomerFilter,
  paginatedOrders,
}: OrdersTableProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const allOrders = useAppSelector(selectOrders)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null)
  const [showSendNotification, setShowSendNotification] = useState<string | null>(null)
  // Añadir un nuevo estado para controlar la visibilidad del diálogo de asignación de camiones
  const [orderToAssignTruck, setOrderToAssignTruck] = useState<string | null>(null)
  // Añadir un nuevo estado para controlar la visibilidad del diálogo de etiquetas
  const [orderToTag, setOrderToTag] = useState<string | null>(null)

  // Usar pedidos paginados si se proporcionan, de lo contrario filtrar los pedidos según los criterios
  const filteredOrders = paginatedOrders || allOrders.filter((order) => {
    // Filtrar por pestaña seleccionada
    const matchesTab = filter === "all" || order.status === filter

    // Filtrar por término de búsqueda
    const matchesSearch =
      searchTerm === "" ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.address && order.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.trackingCode && order.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtrar por código de seguimiento
    const matchesTracking = trackingCode === "" || (order.trackingCode && order.trackingCode.includes(trackingCode))

    // Filtrar por cliente
    const matchesCustomer = customerFilter === "" || order.customer.toLowerCase().includes(customerFilter.toLowerCase())

    // Filtrar por fecha
    const matchesDate = dateFilter === "" || (order.createdAt && order.createdAt.includes(dateFilter))

    // Filtrar por estados seleccionados
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(order.status)

    return matchesTab && matchesSearch && matchesTracking && matchesCustomer && matchesDate && matchesStatus
  })

  // Función mejorada para badges de estado con iconos y colores semánticos - versión adaptable
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 flex items-center gap-1 px-2 py-0.5 whitespace-nowrap">
            <Clock className="h-3 w-3" />
            Pendiente
          </Badge>
        )
      case "assigned":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 flex items-center gap-1 px-2 py-0.5 whitespace-nowrap">
            <Package className="h-3 w-3" />
            Asignado
          </Badge>
        )
      case "in_transit":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 flex items-center gap-1 px-2 py-0.5 whitespace-nowrap">
            <Truck className="h-3 w-3" />
            En ruta
          </Badge>
        )
      case "delivered":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 flex items-center gap-1 px-2 py-0.5 whitespace-nowrap">
            <CheckCircle className="h-3 w-3" />
            Entregado
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 flex items-center gap-1 px-2 py-0.5 whitespace-nowrap">
            <X className="h-3 w-3" />
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline" className="whitespace-nowrap px-2 py-0.5">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 flex items-center gap-1.5 px-2.5 py-1">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            Baja
          </Badge>
        )
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 flex items-center gap-1.5 px-2.5 py-1">
            <Clock className="h-3 w-3" />
            Media
          </Badge>
        )
      case "high":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 flex items-center gap-1.5 px-2.5 py-1">
            <Zap className="h-3 w-3" />
            Alta
          </Badge>
        )
      case "urgent":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 flex items-center gap-1.5 px-2.5 py-1">
            <AlertTriangle className="h-3 w-3" />
            Urgente
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getCustomerTypeName = (typeId: string) => {
    const type = CUSTOMER_TYPES.find((t) => t.id === typeId)
    return type ? type.name : typeId
  }

  const handleCancelOrder = async () => {
    if (!orderToCancel) return

    try {
      await dispatch(cancelOrder(orderToCancel)).unwrap()
      toast({
        title: "Pedido cancelado",
        description: "El pedido ha sido cancelado exitosamente",
      })
      setOrderToCancel(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar el pedido",
        variant: "destructive",
      })
    }
  }

  const handleSendNotification = () => {
    if (!showSendNotification) return

    // En un sistema real, aquí se enviaría la notificación
    toast({
      title: "Notificación enviada",
      description: "Se ha enviado una notificación al cliente",
    })

    setShowSendNotification(null)
  }

  const handleFilterByCustomer = (customer: string) => {
    if (onSetCustomerFilter) {
      onSetCustomerFilter(customer)
    }
  }

  return (
    <>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Volumen</TableHead>
            <TableHead>Fecha Pedido</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Código de seguimiento</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No hay pedidos que mostrar
              </TableCell>
            </TableRow>
          ) : (
            filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal text-left"
                    onClick={() => handleFilterByCustomer(order.customer)}
                  >
                    {order.customer}
                  </Button>
                </TableCell>
                <TableCell>{order.volume} m³</TableCell>
                <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                <TableCell>{formatDateTime(order.deadline)}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{order.trackingCode}</span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedOrder(order.id)}>
                        <Eye className="mr-2 h-4 w-4" /> Ver detalles
                      </DropdownMenuItem>

                      

                      {order.status === "pending" && (
                        <DropdownMenuItem onClick={() => setOrderToCancel(order.id)}>
                          <X className="mr-2 h-4 w-4" /> Cancelar pedido
                        </DropdownMenuItem>
                      )}

                      {(order.status === "pending" || order.status === "assigned") && (
                        <DropdownMenuItem onClick={() => setShowSendNotification(order.id)}>
                          <Mail className="mr-2 h-4 w-4" /> Enviar notificación
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem>
                        <Clock className="mr-2 h-4 w-4" /> Ver historial
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => setOrderToTag(order.id)}>
                        <Tag className="mr-2 h-4 w-4" /> Etiquetar
                      </DropdownMenuItem>

                      
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-6xl h-[90vh] overflow-hidden p-0">
          <div className="h-full overflow-y-auto">
            <div className="p-6 border-b bg-background sticky top-0 z-10">
              <DialogHeader>
                <DialogTitle>Detalles del Pedido</DialogTitle>
                <DialogDescription>Información completa del pedido seleccionado</DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6">
              {selectedOrder && <OrderDetails orderId={selectedOrder} />}
            </div>
          </div>
        </DialogContent>
      </Dialog>


      <AlertDialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de cancelar este pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El pedido será cancelado y no podrá ser procesado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelOrder}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!showSendNotification} onOpenChange={(open) => !open && setShowSendNotification(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar notificación al cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Se enviará una notificación por correo electrónico al cliente informando sobre el estado de su pedido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendNotification}>Enviar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AssignTruckDialog
        orderId={orderToAssignTruck || ""}
        open={!!orderToAssignTruck}
        onOpenChange={(open) => !open && setOrderToAssignTruck(null)}
      />
      <TagOrderDialog
        orderId={orderToTag || ""}
        open={!!orderToTag}
        onOpenChange={(open) => !open && setOrderToTag(null)}
      />
    </>
  )
}
