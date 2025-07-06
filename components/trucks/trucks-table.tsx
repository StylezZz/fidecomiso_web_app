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
import { MoreHorizontal, Eye, PenToolIcon as Tool, CheckCircle, Trash, AlertTriangle, Calendar, MapPin, Phone } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { differenceInDays } from "date-fns"

// Interfaz para los datos adaptados de la API
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
  // Nuevos campos
  tara: number
  pesoCarga: number
  distanciaMaxima: number
  distanciaRecorrida: number
  velocidad: number
  peso: number
}

type TrucksTableProps = {
  trucks: UiTruck[]
}

export function TrucksTable({ trucks }: TrucksTableProps) {
  const { toast } = useToast()
  const [selectedTruck, setSelectedTruck] = useState<UiTruck | null>(null)
  const [truckToDelete, setTruckToDelete] = useState<string | null>(null)

  // Función para obtener el color del tipo de camión
  const getTruckTypeColor = (type: string) => {
    switch (type) {
      case "TA":
        return "bg-yellow-400 text-yellow-900" // Amarillo con texto oscuro
      case "TB":
        return "bg-blue-400 text-blue-900"     // Azul con texto oscuro
      case "TC":
        return "bg-orange-500 text-orange-100" // Naranja con texto claro
      case "TD":
        return "bg-gray-500 text-gray-100"     // Gris con texto claro
      default:
        return "bg-gray-200 text-gray-800"     // Por defecto
    }
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Disponible</Badge>
      case "in_transit":
        return <Badge className="bg-blue-100 text-blue-800">En Tránsito</Badge>
      case "loading":
        return <Badge className="bg-yellow-100 text-yellow-800">Cargando</Badge>
      case "maintenance":
        return <Badge className="bg-red-100 text-red-800">Mantenimiento</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMaintenanceStatus = (truck: UiTruck) => {
    const nextMaintenance = new Date(truck.nextMaintenance)
    const today = new Date()
    const daysUntilMaintenance = differenceInDays(nextMaintenance, today)

    if (daysUntilMaintenance < 0) {
      return <Badge className="bg-red-100 text-red-800">Vencido</Badge>
    } else if (daysUntilMaintenance <= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800">Próximo</Badge>
    } else {
      return <Badge variant="outline">Al día</Badge>
    }
  }

  const handleViewDetails = (truck: UiTruck) => {
    setSelectedTruck(truck)
  }

  const handleDeleteTruck = async () => {
    if (!truckToDelete) return

    try {
      // Aquí puedes agregar la lógica para eliminar el camión de la API
      toast({
        title: "Camión eliminado",
        description: "El camión ha sido eliminado exitosamente",
      })
      setTruckToDelete(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el camión",
        variant: "destructive",
      })
    }
  }

  const getUtilizationPercentage = (currentLoad: number, capacity: number) => {
    return ((currentLoad / capacity) * 100).toFixed(1)
  }
  // Verifica qué datos están llegando
console.log('Truck data:', selectedTruck);
  return (
    <>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>Conductor</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead className="text-center">Capacidad</TableHead>
            <TableHead className="text-center">Peso de Carga</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-center">Mantenimiento</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trucks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="text-gray-500">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p>No hay camiones que mostrar</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            trucks.map((truck) => {
              return (
                <TableRow key={truck.id}>
                  <TableCell className="font-semibold">
                  <Badge className={getTruckTypeColor(truck.type)}>
                    {truck.plate}
                  </Badge>
                </TableCell>
                  <TableCell>{truck.driver}</TableCell>              
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {truck.phone}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{truck.capacity} m3</TableCell>
                  <TableCell className="text-center">{truck.pesoCarga} Ton</TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(truck.status)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getMaintenanceStatus(truck)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(truck)}>
                          <Eye className="mr-2 h-4 w-4" /> Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Tool className="mr-2 h-4 w-4" /> Programar mantenimiento
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MapPin className="mr-2 h-4 w-4" /> Ver ubicación
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setTruckToDelete(truck.id)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" /> Eliminar camión
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" /> Ver historial
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {/* Modal de detalles del camión */}
      <Dialog open={!!selectedTruck} onOpenChange={(open) => !open && setSelectedTruck(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Detalles del Camión {selectedTruck?.plate}
            </DialogTitle>
            <DialogDescription>Información completa del camión seleccionado</DialogDescription>
          </DialogHeader>
          
          {selectedTruck && (
            <div className="grid gap-6 py-4">
              {/* Información básica en dos columnas comentario commit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Información General</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-medium">#{selectedTruck.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Placa:</span>
                        <span className="font-medium">{selectedTruck.plate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo:</span>
                        <Badge variant="outline">{selectedTruck.type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacidad de GLP:</span>
                        <span className="font-medium">{selectedTruck.capacity} m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estado:</span>
                        {getStatusBadge(selectedTruck.status)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Conductor</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nombre:</span>
                        <span className="font-medium">{selectedTruck.driver}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Teléfono:</span>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span className="font-medium">{selectedTruck.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Especificaciones Técnicas</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tara (Peso vacío):</span>
                      <span className="font-medium">{selectedTruck.tara} Ton</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Peso de Carga:</span>
                      <span className="font-medium">{selectedTruck.pesoCarga} Ton</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Peso Total:</span>
                      <span className="font-medium">{selectedTruck.peso} Ton</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distancia Máxima:</span>
                      <span className="font-medium">{selectedTruck.distanciaMaxima.toFixed(2)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Velocidad:</span>
                      <span className="font-medium">{selectedTruck.velocidad} km/h</span>
                    </div>
                  </div>
                </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Mantenimiento
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Último:</span>
                        <span className="font-medium">{selectedTruck.lastMaintenance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Próximo:</span>
                        <span className="font-medium">{selectedTruck.nextMaintenance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estado:</span>
                        {getMaintenanceStatus(selectedTruck)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de progreso de carga */}
              <div>
              <h3 className="font-semibold mb-3">Nivel de Carga</h3>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="h-4 rounded-full flex items-center justify-center text-xs font-medium text-white bg-green-500"
                  style={{ width: `${parseFloat(getUtilizationPercentage(selectedTruck.currentLoad, selectedTruck.capacity))}%` }}
                >
                  {getUtilizationPercentage(selectedTruck.currentLoad, selectedTruck.capacity)}%
                </div>
              </div>
            </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedTruck(null)}>
                  Cerrar
                </Button>
                <Button>
                  Editar Camión
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!truckToDelete} onOpenChange={(open) => !open && setTruckToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar este camión?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El camión será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTruck} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}