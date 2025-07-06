"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { selectAvailableTrucks } from "@/store/trucks/trucks-selectors"
import { selectOrderById } from "@/store/orders/orders-selectors"
import { updateOrder } from "@/store/orders/orders-slice"
import { assignTruckToOrder } from "@/store/trucks/trucks-slice"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Truck, AlertTriangle, Info } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface AssignTruckDialogProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignTruckDialog({ orderId, open, onOpenChange }: AssignTruckDialogProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)

  const order = useAppSelector((state) => selectOrderById(state, orderId))
  const availableTrucks = useAppSelector(selectAvailableTrucks)

  // Filtrar camiones con capacidad suficiente para el pedido
  const suitableTrucks = availableTrucks.filter((truck) => truck.capacity >= (order?.volume || 0))

  // Resetear el camión seleccionado cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      setSelectedTruckId(null)
      setIsAssigning(false)
    }
  }, [open])

  const handleAssignTruck = async () => {
    if (!selectedTruckId || !order) return

    setIsAssigning(true)
    try {
      // Encontrar el camión seleccionado para obtener sus detalles
      const selectedTruck = availableTrucks.find((truck) => truck.id === selectedTruckId)
      if (!selectedTruck) {
        throw new Error("Camión no encontrado")
      }

      // Calcular tiempo estimado y distancia (simulados)
      const estimatedTime = Math.floor(Math.random() * 60) + 30 // Entre 30 y 90 minutos
      const distance = Math.floor(Math.random() * 20) + 5 // Entre 5 y 25 km

      // Preparar los datos para actualizar el pedido
      const updateData = {
        status: "assigned",
        assignedTruck: selectedTruckId,
        estimatedTime,
        distance,
        truckDetails: {
          capacity: selectedTruck.capacity,
          driver: selectedTruck.driver,
          phone: selectedTruck.phone,
          plate: selectedTruck.plate,
        },
        timeline: [
          ...(order.timeline || []),
          {
            status: "assigned",
            timestamp: new Date().toISOString(),
            notes: `Asignado a camión #${selectedTruckId}`,
          },
        ],
      }

      // Actualizar el pedido
      await dispatch(
        updateOrder({
          id: orderId,
          orderData: updateData,
        }),
      ).unwrap()

      // Actualizar el estado del camión
      await dispatch(
        assignTruckToOrder({
          truckId: selectedTruckId,
          orderId,
        }),
      ).unwrap()

      toast({
        title: "Camión asignado",
        description: `El pedido ha sido asignado al camión #${selectedTruckId}`,
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo asignar el camión al pedido",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Camión</DialogTitle>
          <DialogDescription>Seleccione un camión disponible para asignar al pedido #{order.id}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {suitableTrucks.length === 0 ? (
            <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">No hay camiones disponibles</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      No hay camiones con capacidad suficiente para este pedido ({order.volume} m³). Espere a que haya
                      camiones disponibles o considere dividir el pedido.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Volumen del pedido: {order.volume} m³</span>
                  <span className="text-sm text-muted-foreground">Cliente: {order.customer}</span>
                </div>
              </div>

              <RadioGroup value={selectedTruckId || ""} onValueChange={setSelectedTruckId}>
                <div className="space-y-3">
                  {suitableTrucks.map((truck) => {
                    // Calcular porcentaje de capacidad que ocuparía el pedido
                    const capacityPercentage = (order.volume / truck.capacity) * 100

                    return (
                      <div
                        key={truck.id}
                        className={`flex flex-col p-4 rounded-lg border ${
                          selectedTruckId === truck.id ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-start">
                          <RadioGroupItem value={truck.id} id={truck.id} className="mt-1" />
                          <div className="ml-3 flex-1">
                            <Label htmlFor={truck.id} className="font-medium">
                              Camión #{truck.id} - {truck.plate}
                            </Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Conductor:</span> {truck.driver}
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Teléfono:</span> {truck.phone}
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Capacidad:</span> {truck.capacity} m³
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Tipo:</span> {truck.truckType}
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Uso de capacidad</span>
                                <span>{capacityPercentage.toFixed(1)}%</span>
                              </div>
                              <Progress value={capacityPercentage} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </RadioGroup>

              {selectedTruckId && (
                <div className="mt-4 rounded-md bg-blue-50 p-3 border border-blue-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="ml-2 text-sm text-blue-700">
                      Al asignar este camión, el pedido pasará a estado "Asignado" y estará listo para ser despachado.
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAssignTruck} disabled={!selectedTruckId || isAssigning || suitableTrucks.length === 0}>
            {isAssigning ? (
              "Asignando..."
            ) : (
              <>
                <Truck className="mr-2 h-4 w-4" />
                Asignar Camión
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
