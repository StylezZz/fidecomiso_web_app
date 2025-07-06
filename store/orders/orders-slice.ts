import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { ordersService } from "@/services/orders-service"
import PedidosService from "@/services/pedidos.service"
import type { Order, OrderCreateDto } from "@/types/order"
import { adaptPedidosToOrders } from "@/utils/pedido-adapter"

interface OrdersState {
  orders: Order[]
  loading: boolean
  error: string | null
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
}

export const fetchOrders = createAsyncThunk("orders/fetchOrders", async (_, { rejectWithValue }) => {
  try {
    // Obtener la fecha actual para filtrar por mes y año actuales
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() devuelve 0-11
    
    console.log(`Obteniendo pedidos para ${currentMonth}/${currentYear}`);
    
    // Llamar al servicio de pedidos con los filtros de mes y año
    const response = await PedidosService.getOrders(undefined, currentYear, currentMonth);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al obtener pedidos');
    }
    
    // Obtener los pedidos de la respuesta
    const pedidos = response.data.pedidos || [];
    console.log(`API devolvió ${pedidos.length} pedidos en total`);
    
    // Convertir los pedidos al formato Order utilizando el adaptador
    const orders = adaptPedidosToOrders(pedidos);
    console.log('Pedidos adaptados:', orders);
    
    return orders;
  } catch (error: any) {
    console.error('Error en fetchOrders:', error);
    return rejectWithValue(error.message || "Error fetching orders");
  }
})

export const fetchOrderById = createAsyncThunk("orders/fetchOrderById", async (id: string, { rejectWithValue }) => {
  try {
    return await ordersService.getOrderById(id)
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Error fetching order")
  }
})

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData: OrderCreateDto, { rejectWithValue }) => {
    try {
      return await ordersService.createOrder(orderData)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error creating order")
    }
  },
)

export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async ({ id, orderData }: { id: string; orderData: Partial<Order> }, { rejectWithValue }) => {
    try {
      return await ordersService.updateOrder(id, orderData)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Error updating order")
    }
  },
)

export const cancelOrder = createAsyncThunk("orders/cancelOrder", async (id: string, { rejectWithValue }) => {
  try {
    await ordersService.cancelOrder(id)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Error canceling order")
  }
})

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload)
    },
    removeOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter((order) => order.id !== action.payload)
    },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: "pending" | "assigned" | "in_transit" | "delivered" | "cancelled" }>) => {
      const { id, status } = action.payload
      const orderIndex = state.orders.findIndex((order) => order.id === id)
      if (orderIndex !== -1) {
        state.orders[orderIndex].status = status
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        const orderIndex = state.orders.findIndex((order) => order.id === action.payload.id)
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload
        } else {
          state.orders.push(action.payload)
        }
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.push(action.payload)
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        const orderIndex = state.orders.findIndex((order) => order.id === action.payload.id)
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload
        }
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter((order) => order.id !== action.payload)
      })
  },
})

export const { setOrders, addOrder, removeOrder, updateOrderStatus } = ordersSlice.actions

export default ordersSlice.reducer
