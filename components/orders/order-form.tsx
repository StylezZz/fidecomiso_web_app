"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { createOrder } from "@/store/orders/orders-slice"
import { selectAvailableTrucks } from "@/store/trucks/trucks-selectors"
import { useToast } from "@/hooks/use-toast"
import { X, AlertTriangle, Info, MapPin, Plus, Search } from "lucide-react"
import { MIN_ORDER_VOLUME, MAX_ORDER_VOLUME, MIN_DELIVERY_HOURS } from "@/types/order"
import { addHours, format } from "date-fns"
import { clientsService, type Client } from "@/services/clients-service"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Modificar el esquema de validación para incluir clientId y clientType
const formSchema = z.object({
  clientId: z.string().min(1, { message: "Debe seleccionar un cliente" }),
  clientType: z.string().min(1, { message: "Debe seleccionar un tipo de cliente" }),
  volume: z.coerce
    .number()
    .min(MIN_ORDER_VOLUME, { message: `El volumen debe ser mayor a ${MIN_ORDER_VOLUME} m³` })
    .max(MAX_ORDER_VOLUME, { message: `El volumen máximo es ${MAX_ORDER_VOLUME} m³` }),
  location: z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
  }),
  address: z.string().min(5, { message: "La dirección debe tener al menos 5 caracteres" }),
  deadline: z.string().refine(
    (val) => {
      const date = new Date(val)
      const now = new Date()
      // Deadline must be at least MIN_DELIVERY_HOURS hours in the future
      return date.getTime() > now.getTime() + MIN_DELIVERY_HOURS * 60 * 60 * 1000
    },
    { message: `La fecha límite debe ser al menos ${MIN_DELIVERY_HOURS} horas en el futuro` },
  ),
  comments: z.string().optional().or(z.literal("")),
  contactEmail: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

type OrderFormProps = {
  onClose: () => void
}

export function OrderForm({ onClose }: OrderFormProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string | null>(null)
  const [canFulfillOrder, setCanFulfillOrder] = useState(true)
  const [suggestedSplit, setSuggestedSplit] = useState<{ truck1: number; truck2: number } | null>(null)

  // Estados para el manejo de clientes
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showNewClientDialog, setShowNewClientDialog] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [openClientCombobox, setOpenClientCombobox] = useState(false)

  const mapData = useAppSelector((state) => state.map.mapData)
  const availableTrucks = useAppSelector(selectAvailableTrucks)
  const gridWidth = mapData.grid?.width || 70
  const gridHeight = mapData.grid?.height || 50

  // Cargar la lista de clientes al montar el componente
  useEffect(() => {
    const loadClients = async () => {
      setIsLoadingClients(true)
      try {
        const clientsList = await clientsService.getClients()
        setClients(clientsList)
        setFilteredClients(clientsList)
      } catch (error) {
        console.error("Error loading clients:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive",
        })
      } finally {
        setIsLoadingClients(false)
      }
    }

    loadClients()
  }, [toast])

  // Filtrar clientes cuando cambia la búsqueda
  useEffect(() => {
    const filterClients = async () => {
      if (!searchQuery) {
        setFilteredClients(clients)
        return
      }

      try {
        const results = await clientsService.searchClients(searchQuery)
        setFilteredClients(results)
      } catch (error) {
        console.error("Error searching clients:", error)
      }
    }

    filterClients()
  }, [searchQuery, clients])

  // Modificar los valores por defecto del formulario para incluir clientId y clientType
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      clientType: "",
      volume: 0,
      location: {
        lat: 35,
        lng: 25,
      },
      address: "",
      deadline: format(addHours(new Date(), MIN_DELIVERY_HOURS + 1), "yyyy-MM-dd'T'HH:mm"),
      comments: "",
      contactEmail: "",
      contactPhone: "",
    },
  })

  const volume = form.watch("volume")
  const deadline = form.watch("deadline")
  const clientId = form.watch("clientId")

  // Actualizar los datos del cliente seleccionado cuando cambia el clientId
  useEffect(() => {
    if (clientId) {
      const client = clients.find((c) => c.id === clientId)
      if (client) {
        setSelectedClient(client)
        form.setValue("clientType", client.type)
        form.setValue("address", client.address)
        form.setValue("contactEmail", client.email || "")
        form.setValue("contactPhone", client.phone || "")
      }
    }
  }, [clientId, clients, form])

  // Calcular tiempo estimado de entrega y verificar si se puede cumplir el pedido
  useEffect(() => {
    if (volume > 0 && deadline) {
      // Verificar si hay camiones disponibles con capacidad suficiente
      const suitableTrucks = availableTrucks.filter((truck) => truck.capacity >= volume)

      if (suitableTrucks.length === 0) {
        // No hay camiones con capacidad suficiente
        setCanFulfillOrder(false)

        // Verificar si se puede dividir el pedido entre dos camiones
        const largestTrucks = [...availableTrucks].sort((a, b) => b.capacity - a.capacity)

        if (largestTrucks.length >= 2 && largestTrucks[0].capacity + largestTrucks[1].capacity >= volume) {
          // Sugerir división óptima
          const truck1Capacity = largestTrucks[0].capacity
          const truck2Capacity = largestTrucks[1].capacity

          // Calcular la mejor distribución
          const truck1Volume = Math.min(truck1Capacity, Math.ceil(volume / 2))
          const truck2Volume = volume - truck1Volume

          setSuggestedSplit({ truck1: truck1Volume, truck2: truck2Volume })
        } else {
          setSuggestedSplit(null)
        }
      } else {
        setCanFulfillOrder(true)
        setSuggestedSplit(null)

        // Calcular tiempo estimado de entrega
        // Simulamos un cálculo basado en la distancia y disponibilidad
        const deadlineDate = new Date(deadline)
        const now = new Date()
        const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)

        // Estimamos que la entrega se realizará en el 70% del tiempo disponible
        const estimatedHours = Math.max(MIN_DELIVERY_HOURS, Math.round(hoursUntilDeadline * 0.7))
        const estimatedTime = addHours(now, estimatedHours)

        setEstimatedDeliveryTime(format(estimatedTime, "yyyy-MM-dd'T'HH:mm"))
      }
    }
  }, [volume, deadline, availableTrucks])

  async function onSubmit(data: FormValues) {
    if (!canFulfillOrder && !suggestedSplit) {
      toast({
        title: "No se puede procesar el pedido",
        description: "No hay camiones disponibles con capacidad suficiente para este volumen",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Verificar si las coordenadas están dentro de la retícula
      if (
        data.location.lat < 0 ||
        data.location.lat > gridHeight ||
        data.location.lng < 0 ||
        data.location.lng > gridWidth
      ) {
        toast({
          title: "Error de ubicación",
          description: `Las coordenadas deben estar dentro de la retícula (0-${gridWidth}, 0-${gridHeight})`,
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Obtener el nombre del cliente seleccionado
      const selectedClient = clients.find((client) => client.id === data.clientId)
      if (!selectedClient) {
        toast({
          title: "Error",
          description: "Cliente no encontrado",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Preparar los datos del pedido
      const orderData = {
        customer: selectedClient.name,
        customerType: data.clientType,
        volume: data.volume,
        location: data.location,
        address: data.address,
        deadline: data.deadline,
        priority: "medium", // Valor por defecto
        comments: data.comments,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
      }

      await dispatch(createOrder(orderData)).unwrap()

      // Enviar confirmación al cliente si proporcionó email
      if (data.contactEmail) {
        // En un sistema real, aquí se enviaría el email
        console.log(`Enviando confirmación a ${data.contactEmail}`)
      }

      toast({
        title: "Pedido creado",
        description: "El pedido ha sido creado exitosamente",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al crear el pedido",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Formulario para crear un nuevo cliente
  const NewClientForm = () => {
    const [newClientName, setNewClientName] = useState("")
    const [newClientType, setNewClientType] = useState("")
    const [newClientRuc, setNewClientRuc] = useState("")
    const [newClientDni, setNewClientDni] = useState("")
    const [newClientAddress, setNewClientAddress] = useState("")
    const [newClientEmail, setNewClientEmail] = useState("")
    const [newClientPhone, setNewClientPhone] = useState("")
    const [newClientContactPerson, setNewClientContactPerson] = useState("")
    const [isCreatingClient, setIsCreatingClient] = useState(false)

    const handleCreateClient = async () => {
      if (!newClientName || !newClientType || !newClientAddress) {
        toast({
          title: "Datos incompletos",
          description: "Por favor complete los campos obligatorios",
          variant: "destructive",
        })
        return
      }

      setIsCreatingClient(true)
      try {
        const newClient = await clientsService.createClient({
          name: newClientName,
          type: newClientType as any,
          ruc: newClientType === "juridico" || newClientType === "gubernamental" ? newClientRuc : undefined,
          dni: newClientType === "natural" ? newClientDni : undefined,
          address: newClientAddress,
          email: newClientEmail || undefined,
          phone: newClientPhone || undefined,
          contactPerson: newClientContactPerson || undefined,
        })

        // Actualizar la lista de clientes
        setClients((prevClients) => [...prevClients, newClient])

        // Seleccionar el nuevo cliente
        form.setValue("clientId", newClient.id)
        setSelectedClient(newClient)

        toast({
          title: "Cliente creado",
          description: "El cliente ha sido creado exitosamente",
        })

        setShowNewClientDialog(false)
      } catch (error) {
        toast({
          title: "Error",
          description: "Hubo un error al crear el cliente",
          variant: "destructive",
        })
      } finally {
        setIsCreatingClient(false)
      }
    }

    return (
      <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
            <DialogDescription>Complete los datos para registrar un nuevo cliente.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="new-client-name">
                  Nombre o Razón Social <span className="text-red-500 font-bold">*</span>
                </Label>
                <Input
                  id="new-client-name"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="new-client-type">
                  Tipo de Cliente <span className="text-red-500 font-bold">*</span>
                </Label>
                <Select value={newClientType} onValueChange={setNewClientType}>
                  <SelectTrigger id="new-client-type">
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">Persona Natural</SelectItem>
                    <SelectItem value="juridico">Persona Jurídica</SelectItem>
                    <SelectItem value="gubernamental">Entidad Gubernamental</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newClientType === "natural" && (
                <div>
                  <Label htmlFor="new-client-dni">DNI</Label>
                  <Input
                    id="new-client-dni"
                    value={newClientDni}
                    onChange={(e) => setNewClientDni(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              {(newClientType === "juridico" || newClientType === "gubernamental") && (
                <div>
                  <Label htmlFor="new-client-ruc">RUC</Label>
                  <Input
                    id="new-client-ruc"
                    value={newClientRuc}
                    onChange={(e) => setNewClientRuc(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="new-client-address">
                  Dirección <span className="text-red-500 font-bold">*</span>
                </Label>
                <Input
                  id="new-client-address"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="new-client-email">Email</Label>
                <Input
                  id="new-client-email"
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="new-client-phone">Teléfono</Label>
                <Input
                  id="new-client-phone"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="mt-1"
                />
              </div>

              {(newClientType === "juridico" || newClientType === "gubernamental") && (
                <div>
                  <Label htmlFor="new-client-contact">Persona de Contacto</Label>
                  <Input
                    id="new-client-contact"
                    value={newClientContactPerson}
                    onChange={(e) => setNewClientContactPerson(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewClientDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateClient} disabled={isCreatingClient}>
              {isCreatingClient ? "Creando..." : "Crear Cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Nuevo Pedido</CardTitle>
            <CardDescription>Complete los datos para crear un nuevo pedido</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm flex items-center">
            <span className="text-red-500 font-bold mr-1">*</span>
            <span>
              Los campos marcados con <span className="text-red-500 font-bold">*</span> son obligatorios
            </span>
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Información Básica</TabsTrigger>
                <TabsTrigger value="location">Ubicación</TabsTrigger>
                <TabsTrigger value="additional">Información Adicional</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Selector de cliente con autocompletado */}
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          Cliente <span className="text-red-500 font-bold">*</span>
                        </FormLabel>
                        <Popover open={openClientCombobox} onOpenChange={setOpenClientCombobox}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openClientCombobox}
                                className={cn(
                                  "justify-between w-full font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value
                                  ? clients.find((client) => client.id === field.value)?.name
                                  : "Seleccione un cliente"}
                                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Buscar cliente..."
                                className="h-9"
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  No se encontraron clientes.
                                  <Button
                                    variant="link"
                                    className="mt-2 w-full"
                                    onClick={() => {
                                      setOpenClientCombobox(false)
                                      setShowNewClientDialog(true)
                                    }}
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear nuevo cliente
                                  </Button>
                                </CommandEmpty>
                                <CommandGroup>
                                  {filteredClients.map((client) => (
                                    <CommandItem
                                      key={client.id}
                                      value={client.id}
                                      onSelect={() => {
                                        form.setValue("clientId", client.id)
                                        setOpenClientCombobox(false)
                                      }}
                                    >
                                      <div className="flex flex-col">
                                        <span>{client.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {client.type === "natural" ? "DNI: " + client.dni : "RUC: " + client.ruc}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                              <div className="p-2 border-t">
                                <Button
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => {
                                    setOpenClientCombobox(false)
                                    setShowNewClientDialog(true)
                                  }}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Crear nuevo cliente
                                </Button>
                              </div>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tipo de cliente */}
                  <FormField
                    control={form.control}
                    name="clientType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tipo de Cliente <span className="text-red-500 font-bold">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="natural">Persona Natural</SelectItem>
                            <SelectItem value="juridico">Persona Jurídica</SelectItem>
                            <SelectItem value="gubernamental">Entidad Gubernamental</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="volume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Volumen (m³) <span className="text-red-500 font-bold">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min={MIN_ORDER_VOLUME} max={MAX_ORDER_VOLUME} step="0.1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Mínimo: {MIN_ORDER_VOLUME} m³, Máximo: {MAX_ORDER_VOLUME} m³
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Fecha límite de entrega <span className="text-red-500 font-bold">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormDescription>Debe ser al menos {MIN_DELIVERY_HOURS} horas en el futuro</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {estimatedDeliveryTime && (
                  <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Tiempo estimado de entrega</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            Basado en la disponibilidad actual, estimamos que su pedido será entregado el{" "}
                            <span className="font-medium">
                              {format(new Date(estimatedDeliveryTime), "dd/MM/yyyy")} a las{" "}
                              {format(new Date(estimatedDeliveryTime), "HH:mm")}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!canFulfillOrder && (
                  <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Advertencia de capacidad</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>
                            No hay camiones disponibles con capacidad suficiente para este volumen.
                            {suggestedSplit ? (
                              <>
                                <br />
                                <br />
                                <span className="font-medium">Sugerencia de división:</span>
                                <br />
                                Camión 1: {suggestedSplit.truck1} m³
                                <br />
                                Camión 2: {suggestedSplit.truck2} m³
                              </>
                            ) : (
                              " Considere reducir el volumen o dividir el pedido."
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="location" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="location.lat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Coordenada Y (Latitud) <span className="text-red-500 font-bold">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max={gridHeight} step="0.1" {...field} />
                        </FormControl>
                        <FormDescription>Coordenada Y en la retícula (0-{gridHeight})</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location.lng"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Coordenada X (Longitud) <span className="text-red-500 font-bold">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max={gridWidth} step="0.1" {...field} />
                        </FormControl>
                        <FormDescription>Coordenada X en la retícula (0-{gridWidth})</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>
                          Dirección <span className="text-red-500 font-bold">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Dirección completa de entrega" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="rounded-md bg-gray-50 p-4 border border-gray-200">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">
                      Las coordenadas representan la ubicación en el mapa. Asegúrese de que coincidan con la dirección
                      proporcionada.
                    </span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="additional" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de contacto</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@ejemplo.com" {...field} />
                        </FormControl>
                        <FormDescription>Para enviar confirmaciones y actualizaciones</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono de contacto</FormLabel>
                        <FormControl>
                          <Input placeholder="+51 999 888 777" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Comentarios u observaciones</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ingrese cualquier información adicional relevante para la entrega"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-800">Política de Cero Incumplimientos</h4>
                    <p className="text-xs text-amber-700">
                      Todos los pedidos deben realizarse con un mínimo de {MIN_DELIVERY_HOURS} horas de antelación. Si
                      un pedido no puede ser atendido, se considerará un "colapso" de la operación.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={isSubmitting || (!canFulfillOrder && !suggestedSplit)}>
                {isSubmitting ? "Creando..." : "Crear Pedido"}
              </Button>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>

        {/* Modal para crear nuevo cliente */}
        <NewClientForm />
      </CardContent>
    </Card>
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
