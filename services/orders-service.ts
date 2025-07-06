/**
 * Servicio de Pedidos
 * 
 * Este servicio maneja todas las operaciones relacionadas con los pedidos,
 * incluyendo la carga desde el backend, filtrado, creación, actualización y cancelación.
 * Implementa los requisitos del proyecto relacionados con pedidos, como la ventana mínima
 * de entrega de 4 horas desde el registro del pedido.
 */

// Utilidades y helpers
import { delay } from "@/lib/utils"

// Tipos y modelos
import type { Order, OrderCreateDto, OrderUpdateDto } from "@/types/order"

// Servicios externos
import api from "./api-service"

// Datos de ejemplo para fallback
import { ordersData } from "./mock-data"

// Constantes de configuración
//const BASE_URL = "http://200.16.7.188/api"
const API_PREFIX = "/api/v1"
const MIN_DELIVERY_HOURS = 4 // Ventana mínima de entrega (requisito del proyecto)
const MAX_ORDERS_TO_DISPLAY = 10 // Límite de pedidos a mostrar por página

// Clonar los datos para no modificar los originales
const orders = [...ordersData]

// Contador para IDs autoincrementales
let nextId = orders.length > 0 ? Math.max(...orders.map((order) => Number.parseInt(order.id))) + 1 : 1

// Función para generar un código de seguimiento único
function generateTrackingCode(): string {
  return `TRK-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`
}

/**
 * Determina la prioridad de un pedido basado en su fecha límite
 * Implementa la regla de negocio para asignar prioridades
 * @param deadline - Fecha límite del pedido
 * @returns Prioridad del pedido (urgent, high, medium, low)
 */
function getPriorityFromDeadline(deadline: Date): "urgent" | "high" | "medium" | "low" {
  const now = new Date()
  const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  if (hoursUntilDeadline <= 6) {
    return "urgent"
  } else if (hoursUntilDeadline <= 12) {
    return "high"
  } else if (hoursUntilDeadline <= 24) {
    return "medium"
  } else {
    return "low"
  }
}

// Interfaz para eventos de timeline
interface TimelineEvent {
  status: string
  timestamp: string
  truckId?: string
  notes?: string
}

// Interfaz para los pedidos del backend
interface PedidoBackend {
  id?: string
  clienteId: string
  fechaRegistro: string
  fechaEntregaLimite: string
  plazoHoras: number
  volumenM3: number
  ubicacionX: number
  ubicacionY: number
  estado?: string
  timeline?: TimelineEvent[]
}

/**
 * Convierte un pedido del backend al formato del frontend
 * Implementa la regla de negocio de ventana mínima de entrega de 4 horas
 * @param pedido - Pedido del backend
 * @returns Pedido en formato del frontend
 */
function mapPedidoToOrder(pedido: PedidoBackend): Order {
  const createdAt = new Date(pedido.fechaRegistro).toISOString()
  
  // Validar que el plazo de entrega sea al menos 4 horas desde el registro (regla del proyecto)
  const minDeliveryHours = MIN_DELIVERY_HOURS
  let plazoHoras = pedido.plazoHoras
  
  if (plazoHoras < minDeliveryHours) {
    console.warn(`Pedido ${pedido.clienteId} tiene un plazo menor a ${minDeliveryHours} horas. Ajustando a ${minDeliveryHours} horas.`)
    plazoHoras = minDeliveryHours
  }
  
  // Calcular fecha límite ajustada si es necesario
  const fechaRegistro = new Date(pedido.fechaRegistro)
  const fechaLimite = new Date(fechaRegistro.getTime() + plazoHoras * 60 * 60 * 1000)
  const deadline = fechaLimite.toISOString()
  
  // Calcular tiempo estimado (70% del plazo)
  const estimatedHours = Math.max(minDeliveryHours, Math.round(plazoHoras * 0.7))
  const estimatedDeliveryTime = new Date(fechaRegistro.getTime() + estimatedHours * 60 * 60 * 1000).toISOString()
  
  // Crear el timeline por defecto
  const defaultTimeline = [
    {
      status: "created",
      timestamp: createdAt
    }
  ];
  
  // Crear el objeto Order con los datos del pedido
  // Mapear el estado del backend al tipo de estado del frontend
  const mapStatus = (backendStatus: string | undefined): "pending" | "assigned" | "in_transit" | "delivered" | "cancelled" => {
    switch (backendStatus) {
      case "en_progreso":
        return "in_transit";
      case "asignado":
        return "assigned";
      case "entregado":
        return "delivered";
      case "cancelado":
        return "cancelled";
      default:
        return "pending";
    }
  };

  const order: Order = {
    id: `c-${pedido.clienteId}`,
    customer: `Cliente ${pedido.clienteId}`,
    customerType: "business",
    volume: pedido.volumenM3,
    location: {
      lat: pedido.ubicacionY,
      lng: pedido.ubicacionX,
    },
    address: `Ubicación: (${pedido.ubicacionX}, ${pedido.ubicacionY})`,
    createdAt,
    deadline,
    estimatedDeliveryTime,
    status: mapStatus(pedido.estado),
    priority: getPriorityFromDeadline(new Date(deadline)),
    trackingCode: generateTrackingCode(),
    comments: "",
    contactEmail: "",
    contactPhone: "",
    notificationsSent: {
      confirmation: true,
      dispatch: false,
      delivery: false,
    },
    // Asegurar que timeline siempre sea un array válido
    timeline: Array.isArray(pedido.timeline) && pedido.timeline.length > 0 
      ? pedido.timeline 
      : defaultTimeline
  }
  
  return order
}

export const ordersService = {
  /**
   * Obtiene todos los pedidos
   * @returns Lista de todos los pedidos
   */
  async getOrders(): Promise<Order[]> {
    await delay(1000)
    return orders
  },
  
  /**
   * Obtiene los pedidos pendientes
   * @returns Lista de pedidos pendientes
   */
  async getPendingOrders(): Promise<Order[]> {
    await delay(800)
    return orders.filter((order) => order.status === "pending")
  },
  
  /**
   * Obtiene los pedidos en progreso
   * @returns Lista de pedidos en progreso
   */
  async getInProgressOrders(): Promise<Order[]> {
    await delay(800)
    return orders.filter((order) => order.status === "in-progress")
  },
  
  /**
   * Obtiene los pedidos completados
   * @returns Lista de pedidos completados
   */
  async getCompletedOrders(): Promise<Order[]> {
    await delay(800)
    return orders.filter((order) => order.status === "completed")
  },
  
  /**
   * Carga pedidos desde el backend
   * @returns Lista de pedidos cargados desde el backend
   */
  async loadOrdersFromBackend(): Promise<Order[]> {
    try {
      const response = await api.get(`${BASE_URL}${API_PREFIX}/pedido/cargar`)
      
      if (response?.data?.totalPedidos === 0) {
        console.log("No se encontraron pedidos en el backend")
        return []
      }
      
      // Si hay pedidos, cargar por fecha (usando fecha específica)
      const fecha = '202502' // Fecha específica indicada por el usuario
      const pedidosResponse = await api.get(`${BASE_URL}${API_PREFIX}/pedido/filtrar/${fecha}`)
      
      if (pedidosResponse?.data?.pedidos) {
        // Convertir los pedidos del backend al formato del frontend
        const allOrders = pedidosResponse.data.pedidos.map(mapPedidoToOrder)
        
        // Limitar a MAX_ORDERS_TO_DISPLAY pedidos como solicitó el usuario
        const mappedOrders = allOrders.slice(0, MAX_ORDERS_TO_DISPLAY)
        
        // Registrar métricas de los pedidos cargados
        console.log(`Pedidos totales: ${allOrders.length}, mostrando: ${mappedOrders.length}`)
        console.log(`Ventana mínima de entrega: ${MIN_DELIVERY_HOURS} horas (requisito del proyecto)`)
        
        // Calcular métricas para cumplir con los requisitos del proyecto
        const urgentOrders = mappedOrders.filter((order: Order) => order.priority === 'urgent').length
        const highPriorityOrders = mappedOrders.filter((order: Order) => order.priority === 'high').length
        
        console.log(`Pedidos urgentes: ${urgentOrders}`)
        console.log(`Pedidos alta prioridad: ${highPriorityOrders}`)
        
        return mappedOrders
      }
      
      return []
    } catch (error) {
      console.error("Error cargando pedidos del backend:", error)
      // En caso de error, intentar usar datos locales como fallback
      await delay(800)
      return orders.slice(0, MAX_ORDERS_TO_DISPLAY)
    }
  },
  
  /**
   * Carga pedidos por fecha específica
   * @param fecha - Fecha en formato YYYY-MM
   * @returns Lista de pedidos para la fecha especificada
   */
  async getOrdersByDate(fecha: string): Promise<Order[]> {
    try {
      // Formato esperado por el backend: YYYYMM
      const formattedDate = fecha.replace('-', '')
      const response = await api.get(`${BASE_URL}${API_PREFIX}/pedido/filtrar/${formattedDate}`)
      
      if (response?.data?.pedidos) {
        // Convertir todos los pedidos
        const allOrders = response.data.pedidos.map(mapPedidoToOrder)
        // Limitar a MAX_ORDERS_TO_DISPLAY pedidos
        return allOrders.slice(0, MAX_ORDERS_TO_DISPLAY)
      }
      
      return []
    } catch (error) {
      console.error(`Error cargando pedidos para la fecha ${fecha}:`, error)
      // En caso de error, filtrar los datos locales por fecha similar
      const localFilteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        const orderMonth = orderDate.getMonth() + 1
        const orderYear = orderDate.getFullYear()
        const requestedDate = fecha.split('-')
        return orderYear === parseInt(requestedDate[0]) && 
               orderMonth === parseInt(requestedDate[1])
      })
      return localFilteredOrders.slice(0, MAX_ORDERS_TO_DISPLAY)
    }
  },

  async getOrderById(id: string) {
    // Simular delay de red
    await delay(500)

    const order = orders.find((order) => order.id === id)
    if (!order) {
      throw new Error("Order not found")
    }

    return order
  },

  async getOrdersByCustomer(customer: string) {
    // Simular delay de red
    await delay(800)

    return orders.filter((order) => order.customer.toLowerCase().includes(customer.toLowerCase()))
  },

  async getOrderByTrackingCode(trackingCode: string): Promise<Order> {
    // Simular delay de red
    await delay(500)

    const order = orders.find((order) => order.trackingCode === trackingCode)
    if (!order) {
      throw new Error("Order not found")
    }

    return order
  },

  /**
   * Obtiene un pedido por su ID
   * @param id - ID del pedido a buscar
   * @returns El pedido encontrado
   * @throws Error si el pedido no existe
   */
  async getOrderById(id: string): Promise<Order> {
    // Simular delay de red
    await delay(700)
    
    const order = orders.find((order) => order.id === id)
    if (!order) {
      throw new Error("Pedido no encontrado")
    }
    
    return order
  },

  /**
   * Crea un nuevo pedido
   * @param orderData - Datos del nuevo pedido
   * @returns El pedido creado
   */
  async createOrder(orderData: OrderCreateDto): Promise<Order> {
    // Simular delay de red
    await delay(1500)

    const trackingCode = generateTrackingCode()
    const createdAt = new Date()
    const deadline = new Date(orderData.deadline)
    
    // Validar que cumpla con la ventana mínima de entrega (4 horas)
    const hoursUntilDeadline = (deadline.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    if (hoursUntilDeadline < MIN_DELIVERY_HOURS) {
      console.warn(`Pedido con plazo menor a ${MIN_DELIVERY_HOURS} horas. Ajustando automáticamente.`)
      deadline.setTime(createdAt.getTime() + MIN_DELIVERY_HOURS * 60 * 60 * 1000)
    }
    
    const estimatedHours = Math.max(MIN_DELIVERY_HOURS, Math.round(hoursUntilDeadline * 0.7))
    const estimatedDeliveryTime = new Date(createdAt.getTime() + estimatedHours * 60 * 60 * 1000).toISOString()

    // Crear el nuevo pedido con los valores correctos y validados
    const newOrder: Order = {
      id: `${nextId++}`,
      customer: orderData.customer,
      customerType: orderData.customerType,
      volume: orderData.volume,
      location: orderData.location,
      address: orderData.address,
      createdAt: createdAt.toISOString(),
      deadline: deadline.toISOString(), // Usar la fecha límite validada
      estimatedDeliveryTime: estimatedDeliveryTime,
      status: "pending" as const, // Usar 'as const' para asegurar el tipo correcto
      priority: orderData.priority,
      trackingCode: trackingCode,
      comments: orderData.comments || "",
      contactEmail: orderData.contactEmail || "",
      contactPhone: orderData.contactPhone || "",
      timeline: [
        {
          status: "created",
          timestamp: createdAt.toISOString(),
        },
      ],
      notificationsSent: {
        confirmation: true,
        dispatch: false,
        delivery: false,
      },
    }

    orders.push(newOrder)
    return newOrder
  },

  /**
   * Actualiza un pedido existente
   * @param id - ID del pedido a actualizar
   * @param orderData - Datos actualizados del pedido
   * @returns El pedido actualizado
   * @throws Error si el pedido no existe
   */
  async updateOrder(id: string, orderData: OrderUpdateDto): Promise<Order> {
    // Simular delay de red
    await delay(1000)

    const orderIndex = orders.findIndex((order) => order.id === id)
    if (orderIndex === -1) {
      throw new Error("Pedido no encontrado")
    }

    // Validar la fecha límite si se proporciona
    if (orderData.deadline) {
      const createdAt = new Date(orders[orderIndex].createdAt)
      const newDeadline = new Date(orderData.deadline)
      const hoursUntilDeadline = (newDeadline.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
      
      if (hoursUntilDeadline < MIN_DELIVERY_HOURS) {
        console.warn(`Actualización con plazo menor a ${MIN_DELIVERY_HOURS} horas. Ajustando automáticamente.`)
        newDeadline.setTime(createdAt.getTime() + MIN_DELIVERY_HOURS * 60 * 60 * 1000)
        orderData.deadline = newDeadline.toISOString()
      }
    }

    // Actualizar el pedido
    orders[orderIndex] = {
      ...orders[orderIndex],
      ...orderData,
      // Añadir evento a la línea de tiempo
      timeline: [
        ...(orders[orderIndex].timeline || []),
        {
          status: "updated",
          timestamp: new Date().toISOString(),
          notes: "Pedido actualizado"
        }
      ]
    }

    return orders[orderIndex]
  },

  /**
   * Cancela un pedido existente
   * @param id - ID del pedido a cancelar
   * @returns Objeto con estado de éxito
   * @throws Error si el pedido no existe o no puede ser cancelado
   */
  async cancelOrder(id: string): Promise<{ success: boolean }> {
    // Simular delay de red
    await delay(700)

    const orderIndex = orders.findIndex((order) => order.id === id)
    if (orderIndex === -1) {
      throw new Error("Pedido no encontrado")
    }

    // Verificar si el pedido puede ser cancelado
    if (orders[orderIndex].status !== "pending") {
      throw new Error("Solo se pueden cancelar pedidos pendientes")
    }

    // Actualizar el estado del pedido a cancelado
    orders[orderIndex].status = "cancelled" as const

    // Añadir evento a la línea de tiempo
    if (!orders[orderIndex].timeline) {
      orders[orderIndex].timeline = []
    }

    orders[orderIndex].timeline.push({
      status: "cancelled",
      timestamp: new Date().toISOString(),
      notes: "Pedido cancelado por el operador",
    })

    return { success: true }
  },

  /**
   * Envía una notificación para un pedido
   * @param id - ID del pedido
   * @param type - Tipo de notificación (confirmación, despacho, entrega)
   * @returns Objeto con estado de éxito
   * @throws Error si el pedido no existe
   */
  async sendNotification(id: string, type: "confirmation" | "dispatch" | "delivery"): Promise<{ success: boolean }> {
    // Simular delay de red
    await delay(500)

    const orderIndex = orders.findIndex((order) => order.id === id)
    if (orderIndex === -1) {
      throw new Error("Pedido no encontrado")
    }

    // Actualizar el estado de notificaciones
    if (!orders[orderIndex].notificationsSent) {
      orders[orderIndex].notificationsSent = {
        confirmation: false,
        dispatch: false,
        delivery: false,
      }
    }

    orders[orderIndex].notificationsSent[type] = true

    // En un sistema real, aquí se enviaría la notificación por correo o SMS
    console.log(`Enviando notificación de ${type} para el pedido ${id}`)

    // Añadir evento a la línea de tiempo
    if (!orders[orderIndex].timeline) {
      orders[orderIndex].timeline = []
    }

    orders[orderIndex].timeline.push({
      status: "notification_sent",
      timestamp: new Date().toISOString(),
      notes: `Notificación de ${type} enviada`
    })

    return { success: true }
  },
}