"use client"

import type React from "react"

import { useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAppSelector, useAppDispatch } from "@/hooks/use-redux"
import { selectTruckById } from "@/store/trucks/trucks-selectors"
import { updateTruck } from "@/store/trucks/trucks-slice"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Edit, Save, X, AlertTriangle } from "lucide-react"
import { differenceInDays } from "date-fns"
import { TRUCK_TYPES } from "@/types/truck"

type TruckDetailsProps = {
  truckId: string
}

export function TruckDetails({ truckId }: TruckDetailsProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const truck = useAppSelector((state) => selectTruckById(state, truckId))
  const [isEditing, setIsEditing] = useState(false)
  const [editedDriver, setEditedDriver] = useState("")
  const [editedPhone, setEditedPhone] = useState("")
  const [editedComments, setEditedComments] = useState("")

  if (!truck) {
    return <div>Camión no encontrado</div>
  }

  // Modificar la función getStatusBadge para usar los mismos colores distintivos
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge variant="success">Disponible</Badge>
      case "in_transit":
        return <Badge variant="default">En ruta</Badge>
      case "loading":
        return <Badge variant="secondary">Cargando</Badge>
      case "maintenance":
        return <Badge variant="destructive">Mantenimiento</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTruckTypeName = (typeId: string) => {
    const type = TRUCK_TYPES.find((t) => t.id === typeId)
    return type ? type.name : typeId
  }

  // Calcular días hasta el próximo mantenimiento
  const daysUntilMaintenance = differenceInDays(new Date(truck.nextMaintenance), new Date())
  const isMaintenanceOverdue = daysUntilMaintenance < 0
  const isMaintenanceSoon = daysUntilMaintenance >= 0 && daysUntilMaintenance <= 7

  // Calcular porcentaje de carga
  const loadPercentage = (truck.currentLoad / truck.capacity) * 100

  // Custom icon for truck
  const truckIcon = new L.Icon({
    iconUrl: "/truck-icon.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditedDriver(truck.driver)
    setEditedPhone(truck.phone)
    setEditedComments(truck.comments || "")
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    try {
      await dispatch(
        updateTruck({
          id: truck.id,
          truckData: {
            driver: editedDriver,
            phone: editedPhone,
            comments: editedComments,
          },
        }),
      ).unwrap()

      toast({
        title: "Camión actualizado",
        description: "Los datos del camión han sido actualizados correctamente",
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el camión",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Información del Camión #{truck.id}</CardTitle>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={handleStartEdit}>
              <Edit className="h-4 w-4 mr-1" /> Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="driver">Conductor</Label>
                <Input
                  id="driver"
                  value={editedDriver}
                  onChange={(e) => setEditedDriver(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="comments">Comentarios</Label>
                <Textarea
                  id="comments"
                  value={editedComments}
                  onChange={(e) => setEditedComments(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          ) : (
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Placa</dt>
                <dd className="text-sm font-semibold">{truck.plate}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Tipo</dt>
                <dd className="text-sm font-semibold">{getTruckTypeName(truck.truckType)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Conductor</dt>
                <dd className="text-sm font-semibold">{truck.driver}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Teléfono</dt>
                <dd className="text-sm font-semibold">{truck.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Capacidad</dt>
                <dd className="text-sm font-semibold">{truck.capacity} m³</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Carga Actual</dt>
                <dd className="text-sm font-semibold">{truck.currentLoad} m³</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Estado</dt>
                <dd className="text-sm">{getStatusBadge(truck.status)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Consumo de Combustible</dt>
                <dd className="text-sm font-semibold">{truck.fuelConsumption} L/100km</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Último Mantenimiento</dt>
                <dd className="text-sm font-semibold">{formatDate(truck.lastMaintenance)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Próximo Mantenimiento</dt>
                <dd className="text-sm font-semibold flex items-center">
                  {formatDate(truck.nextMaintenance)}
                  {isMaintenanceOverdue && (
                    <AlertTriangle className="ml-2 h-4 w-4 text-red-500" title="Mantenimiento vencido" />
                  )}
                  {isMaintenanceSoon && !isMaintenanceOverdue && (
                    <AlertTriangle className="ml-2 h-4 w-4 text-amber-500" title="Mantenimiento próximo" />
                  )}
                </dd>
              </div>
              {truck.comments && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Comentarios</dt>
                  <dd className="text-sm whitespace-pre-line">{truck.comments}</dd>
                </div>
              )}
            </dl>
          )}
        </CardContent>
        {isEditing && (
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Button>
            <Button size="sm" onClick={handleSaveEdit}>
              <Save className="h-4 w-4 mr-1" /> Guardar
            </Button>
          </CardFooter>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nivel de Carga</CardTitle>
            <CardDescription>Capacidad utilizada del camión</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{truck.currentLoad} m³</span>
                <span>{truck.capacity} m³</span>
              </div>
              <Progress value={loadPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">{loadPercentage.toFixed(1)}% de la capacidad total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ubicación</CardTitle>
            <CardDescription>Posición actual del camión</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px]">
              <MapContainer center={truck.position} zoom={14} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={truck.position} icon={truckIcon}>
                  <Popup>
                    <div>
                      <h3 className="font-bold">Camión #{truck.id}</h3>
                      <p>Conductor: {truck.driver}</p>
                      <p>Estado: {truck.status}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Pedidos Asignados</TabsTrigger>
          <TabsTrigger value="maintenance">Historial de Mantenimiento</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Asignados</CardTitle>
              <CardDescription>Pedidos que este camión está entregando actualmente</CardDescription>
            </CardHeader>
            <CardContent>
              {truck.currentOrders && truck.currentOrders.length > 0 ? (
                <ul className="space-y-2">
                  {truck.currentOrders.map((orderId) => (
                    <li key={orderId} className="rounded-md border p-2">
                      <div className="font-medium">Pedido #{orderId}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No hay pedidos asignados actualmente</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Mantenimiento</CardTitle>
              <CardDescription>Registro de mantenimientos realizados</CardDescription>
            </CardHeader>
            <CardContent>
              {truck.maintenanceHistory && truck.maintenanceHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Costo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {truck.maintenanceHistory.map((maintenance, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(maintenance.date)}</TableCell>
                        <TableCell>
                          {maintenance.type === "preventive" ? (
                            <Badge variant="outline">Preventivo</Badge>
                          ) : (
                            <Badge variant="destructive">Correctivo</Badge>
                          )}
                        </TableCell>
                        <TableCell>{maintenance.description}</TableCell>
                        <TableCell>{maintenance.cost ? `$${maintenance.cost.toFixed(2)}` : "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No hay registros de mantenimiento</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas del Camión</CardTitle>
              <CardDescription>Métricas de rendimiento y uso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Kilómetros Totales</h3>
                  <p className="mt-1 text-2xl font-semibold">{truck.totalKilometers || 0} km</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Consumo Promedio</h3>
                  <p className="mt-1 text-2xl font-semibold">{truck.fuelConsumption} L/100km</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Categoría Operativa</h3>
                  <p className="mt-1 text-2xl font-semibold">{truck.operationalCategory || "No asignada"}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Mantenimientos Totales</h3>
                  <p className="mt-1 text-2xl font-semibold">{truck.maintenanceHistory?.length || 0}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Eficiencia</h3>
                  <p className="mt-1 text-2xl font-semibold">85%</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Pedidos Entregados</h3>
                  <p className="mt-1 text-2xl font-semibold">124</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Componente Label para usar en el formulario de edición
function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
      {children}
    </label>
  )
}
