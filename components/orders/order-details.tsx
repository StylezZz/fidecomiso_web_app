"use client"
import { useState } from "react"
import type React from "react"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAppSelector, useAppDispatch } from "@/hooks/use-redux"
import { selectOrderById } from "@/store/orders/orders-selectors"
import { updateOrder } from "@/store/orders/orders-slice"
import { formatDateTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { CUSTOMER_TYPES } from "@/types/order"
import { Edit, Save, X, Mail, Printer, Download, ExternalLink } from "lucide-react"

type OrderDetailsProps = {
  orderId: string
}

export function OrderDetails({ orderId }: OrderDetailsProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const order = useAppSelector((state) => selectOrderById(state, orderId))
  const [isEditing, setIsEditing] = useState(false)
  const [editedAddress, setEditedAddress] = useState("")
  const [editedLocation, setEditedLocation] = useState({ lat: 0, lng: 0 })
  const [editedComments, setEditedComments] = useState("")

  if (!order) {
    return <div>Pedido no encontrado</div>
  }

  // Modificar la función getStatusBadge para usar los mismos colores distintivos
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">Pendiente</Badge>
      case "assigned":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">Asignado</Badge>
      case "in_transit":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200">En ruta</Badge>
      case "delivered":
        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">Entregado</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // También modificar la función getPriorityBadge para usar colores más distintivos
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200">Baja</Badge>
      case "medium":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">Media</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200">Alta</Badge>
      case "urgent":
        return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">Urgente</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getCustomerTypeName = (typeId: string) => {
    const type = CUSTOMER_TYPES.find((t) => t.id === typeId)
    return type ? type.name : typeId
  }

  
  const handleStartEdit = () => {
    setIsEditing(true)
    setEditedAddress(order.address || "")
    setEditedLocation({
      lat: order.location.lat,
      lng: order.location.lng,
    })
    setEditedComments(order.comments || "")
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    try {
      await dispatch(
        updateOrder({
          id: order.id,
          orderData: {
            address: editedAddress,
            location: editedLocation,
            comments: editedComments,
          },
        }),
      ).unwrap()

      toast({
        title: "Pedido actualizado",
        description: "Los datos del pedido han sido actualizados correctamente",
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el pedido",
        variant: "destructive",
      })
    }
  }

  const handleSendNotification = () => {
    // En un sistema real, aquí se enviaría la notificación
    toast({
      title: "Notificación enviada",
      description: "Se ha enviado una notificación al cliente",
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    toast({
      title: "Exportando PDF",
      description: "El PDF se está generando y se descargará automáticamente",
    })
  }

  // ✅ NUEVA FUNCIÓN: Generar fecha de entrega aleatoria
  const generateRandomDeliveryTime = (createdAt: string, deadline: string) => {
    const startTime = new Date(createdAt).getTime();
    const endTime = new Date(deadline).getTime();
    
    // Generar tiempo aleatorio entre las dos fechas
    const randomTime = startTime + Math.random() * (endTime - startTime);
    
    return new Date(randomTime).toISOString();
  };

  // ✅ GENERAR fecha estimada aleatoria una sola vez
  const [randomDeliveryTime] = useState(() => 
    generateRandomDeliveryTime(order.createdAt, order.deadline)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pedido {order.id}</h2>
          <p className="text-muted-foreground">
            Código de seguimiento: <span className="font-mono">{order.trackingCode}</span>
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleSendNotification}>
            <Mail className="mr-2 h-4 w-4" />
            Notificar
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Información del Pedido</CardTitle>
              <CardDescription>Detalles básicos del pedido</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Cliente</dt>
                  <dd className="text-sm font-semibold">{order.customer}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Tipo de Cliente</dt>
                  <dd className="text-sm font-semibold">{getCustomerTypeName(order.customerType)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Volumen</dt>
                  <dd className="text-sm font-semibold">{order.volume} m³</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Fecha de Pedido</dt>
                  <dd className="text-sm font-semibold">{formatDateTime(order.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Fecha Límite</dt>
                  <dd className="text-sm font-semibold">{formatDateTime(order.deadline)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Entrega Estimada</dt>
                  <dd className="text-sm font-semibold">{formatDateTime(randomDeliveryTime)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Estado</dt>
                  <dd className="text-sm">{getStatusBadge(order.status)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Prioridad</dt>
                  <dd className="text-sm">{getPriorityBadge(order.priority)}</dd>
                </div>
                {order.contactEmail && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                    <dd className="text-sm font-semibold">{order.contactEmail}</dd>
                  </div>
                )}
                {order.contactPhone && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Teléfono</dt>
                    <dd className="text-sm font-semibold">{order.contactPhone}</dd>
                  </div>
                )}
                {order.assignedTruck && (
                  <>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Camión Asignado</dt>
                      <dd className="text-sm font-semibold">{order.assignedTruck}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Tiempo Estimado</dt>
                      <dd className="text-sm font-semibold">{order.estimatedTime} min</dd>
                    </div>
                  </>
                )}
                {order.tags && order.tags.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Etiquetas</dt>
                    <dd className="text-sm">
                      <div className="flex flex-wrap gap-1 mt-1">
                        {order.tags.map((tag) => (
                          <Badge key={tag.name} className={`${tag.color}`}>
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-normal">Dirección y Ubicación</CardTitle>
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
                    <Label htmlFor="address">Dirección</Label>
                    <Textarea
                      id="address"
                      value={editedAddress}
                      onChange={(e) => setEditedAddress(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lat">Latitud (Y)</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="0.1"
                        value={editedLocation.lat}
                        onChange={(e) =>
                          setEditedLocation({ ...editedLocation, lat: Number.parseFloat(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng">Longitud (X)</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="0.1"
                        value={editedLocation.lng}
                        onChange={(e) =>
                          setEditedLocation({ ...editedLocation, lng: Number.parseFloat(e.target.value) })
                        }
                      />
                    </div>
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
                <dl className="grid grid-cols-1 gap-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Dirección</dt>
                    <dd className="text-sm">{order.address}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Coordenadas</dt>
                    <dd className="text-sm">
                      ({order.location.lat}, {order.location.lng})
                      <Button variant="link" size="sm" className="h-auto p-0 ml-2">
                        <ExternalLink className="h-3 w-3 mr-1" /> Ver en mapa
                      </Button>
                    </dd>
                  </div>
                  {order.comments && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Comentarios</dt>
                      <dd className="text-sm whitespace-pre-line">{order.comments}</dd>
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
        </div>
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
              <CardDescription>Ubicación del cliente</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[300px] relative bg-gray-50 border">
                {/* Mapa Cartesiano 70x50 */}
                <svg 
                  width="100%" 
                  height="100%" 
                  viewBox="0 0 70 50" 
                  className="border"
                  style={{ background: 'linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)' }}
                >
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
                      <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#cbd5e1" strokeWidth="0.2"/>
                    </pattern>
                  </defs>
                  <rect width="70" height="50" fill="url(#grid)" />
                  
                  {/* Ejes principales */}
                  <line x1="0" y1="50" x2="70" y2="50" stroke="#64748b" strokeWidth="0.5" />
                  <line x1="0" y1="0" x2="0" y2="50" stroke="#64748b" strokeWidth="0.5" />
                  
                  {/* Números en los ejes */}
                  {/* Eje X */}
                  {[0, 10, 20, 30, 40, 50, 60, 70].map(x => (
                    <g key={`x-${x}`}>
                      <line x1={x} y1="50" x2={x} y2="49" stroke="#374151" strokeWidth="0.3" />
                      <text x={x} y="52" textAnchor="middle" fontSize="1.2" fill="#374151">{x}</text>
                    </g>
                  ))}
                  
                  {/* Eje Y */}
                  {[0, 10, 20, 30, 40, 50].map(y => (
                    <g key={`y-${y}`}>
                      <line x1="0" y1={50-y} x2="1" y2={50-y} stroke="#374151" strokeWidth="0.3" />
                      <text x="-1.5" y={50-y+0.4} textAnchor="middle" fontSize="1.2" fill="#374151">{y}</text>
                    </g>
                  ))}
                  
                  {/* Almacén Central (X=12, Y=8) - Azul oscuro */}
                  <circle 
                    cx="12" 
                    cy="42" 
                    r="2.5" 
                    fill="#1e40af" 
                    stroke="#ffffff" 
                    strokeWidth="0.5"
                  />
                  <g transform="translate(12, 42)">
                    <rect x="2.5" y="-1" width="12" height="2" fill="rgba(30,64,175,0.9)" rx="0.3" />
                    <text x="8.5" y="0.3" textAnchor="middle" fontSize="0.7" fill="white">
                      Almacén Central
                    </text>
                  </g>
                  
                  {/* Almacén Intermedio Norte (X=42, Y=42) - Azul medio */}
                  <circle 
                    cx="42" 
                    cy="8" 
                    r="2" 
                    fill="#3b82f6" 
                    stroke="#ffffff" 
                    strokeWidth="0.5"
                  />
                  <g transform="translate(42, 8)">
                    <rect x="2" y="-1" width="10" height="2" fill="rgba(59,130,246,0.9)" rx="0.3" />
                    <text x="7" y="0.3" textAnchor="middle" fontSize="0.7" fill="white">
                      Almacén Norte
                    </text>
                  </g>
                  
                  {/* Almacén Intermedio Este (X=63, Y=3) - Azul medio */}
                  <circle 
                    cx="63" 
                    cy="47" 
                    r="2" 
                    fill="#3b82f6" 
                    stroke="#ffffff" 
                    strokeWidth="0.5"
                  />
                  <g transform="translate(63, 47)">
                    <rect x="-12" y="-1" width="10" height="2" fill="rgba(59,130,246,0.9)" rx="0.3" />
                    <text x="-7" y="0.3" textAnchor="middle" fontSize="0.7" fill="white">
                      Almacén Este
                    </text>
                  </g>
                  
                  {/* Punto del pedido - Verde */}
                  <circle 
                    cx={Math.max(0, Math.min(70, order.location.lng))} 
                    cy={Math.max(0, Math.min(50, 50 - order.location.lat))} 
                    r="1.5" 
                    fill="#22c55e" 
                    stroke="#ffffff" 
                    strokeWidth="0.5"
                  />
                  
                  {/* Etiqueta del punto del pedido */}
                  <g transform={`translate(${Math.max(0, Math.min(70, order.location.lng))}, ${Math.max(0, Math.min(50, 50 - order.location.lat))})`}>
                    <rect x="2" y="-1" width="8" height="2" fill="rgba(34,197,94,0.9)" rx="0.3" />
                    <text x="6" y="0.3" textAnchor="middle" fontSize="0.8" fill="white">
                      Pedido {order.id}
                    </text>
                  </g>
                </svg>
              </div>
              
              {/* Información movida abajo del mapa */}
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  {/* Coordenadas */}
                  <div className="text-sm">
                    <div className="font-medium text-gray-700 mb-1">Coordenadas:</div>
                    <div className="text-gray-600">X: {order.location.lng}, Y: {order.location.lat}</div>
                  </div>
                  
                  {/* Leyenda */}
                  <div className="text-sm">
                    <div className="font-medium text-gray-700 mb-1">Leyenda:</div>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Ubicación del pedido</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-800 rounded-full"></div>
                        <span className="text-gray-600">Almacén Central</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">Almacenes Intermedios</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {order.status !== "pending" && (
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Línea de Tiempo</TabsTrigger>
            {order.assignedTruck && <TabsTrigger value="truck">Información del Camión</TabsTrigger>}
          </TabsList>
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Línea de Tiempo</CardTitle>
                <CardDescription>Historial del pedido</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.timeline?.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        {index !== (order.timeline?.length || 0) - 1 && (
                          <div className="absolute top-6 left-1/2 h-full w-0.5 -translate-x-1/2 bg-border" />
                        )}
                      </div>
                      <div className="space-y-1 pb-8">
                        <p className="text-sm font-medium leading-none">{event.status}</p>
                        <p className="text-sm text-muted-foreground">{formatDateTime(event.timestamp)}</p>
                        {event.notes && <p className="text-sm">{event.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {order.assignedTruck && (
            <TabsContent value="truck">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Camión</CardTitle>
                  <CardDescription>Detalles del camión asignado a este pedido</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">ID del Camión</dt>
                      <dd className="text-sm font-semibold">{order.assignedTruck}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Placa</dt>
                      <dd className="text-sm font-semibold">{order.truckDetails?.plate || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Capacidad</dt>
                      <dd className="text-sm font-semibold">{order.truckDetails?.capacity} m³</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Conductor</dt>
                      <dd className="text-sm font-semibold">{order.truckDetails?.driver}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Teléfono</dt>
                      <dd className="text-sm font-semibold">{order.truckDetails?.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Tiempo Estimado</dt>
                      <dd className="text-sm font-semibold">{order.estimatedTime} min</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Distancia</dt>
                      <dd className="text-sm font-semibold">{order.distance} km</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}
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
