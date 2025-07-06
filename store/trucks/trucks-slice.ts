import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { trucksService } from "@/services/trucks-service"
import type { Truck, TruckCreateDto } from "@/types/truck"

// Definir el estado inicial
interface TrucksState {
  trucks: Truck[]
  loading: boolean
  error: string | null
}

const initialState: TrucksState = {
  trucks: [],
  loading: false,
  error: null,
}

// Crear thunks
export const fetchTrucks = createAsyncThunk("trucks/fetchTrucks", async (_, { rejectWithValue }) => {
  try {
    return await trucksService.getTrucks()
  } catch (error: any) {
    return rejectWithValue(error.message || "Error al obtener camiones")
  }
})

export const fetchTruckById = createAsyncThunk("trucks/fetchTruckById", async (id: string, { rejectWithValue }) => {
  try {
    return await trucksService.getTruckById(id)
  } catch (error: any) {
    return rejectWithValue(error.message || "Error al obtener camión")
  }
})

export const createTruck = createAsyncThunk(
  "trucks/createTruck",
  async (truckData: TruckCreateDto, { rejectWithValue }) => {
    try {
      return await trucksService.createTruck(truckData)
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al crear camión")
    }
  },
)

export const updateTruck = createAsyncThunk(
  "trucks/updateTruck",
  async ({ id, truckData }: { id: string; truckData: Partial<Truck> }, { rejectWithValue }) => {
    try {
      return await trucksService.updateTruck(id, truckData)
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al actualizar camión")
    }
  },
)

export const deleteTruck = createAsyncThunk("trucks/deleteTruck", async (id: string, { rejectWithValue }) => {
  try {
    await trucksService.deleteTruck(id)
    return id
  } catch (error: any) {
    return rejectWithValue(error.message || "Error al eliminar camión")
  }
})

// Añadir la acción assignTruckToOrder si no existe
export const assignTruckToOrder = createAsyncThunk(
  "trucks/assignTruckToOrder",
  async ({ truckId, orderId }: { truckId: string; orderId: string }, { rejectWithValue, dispatch }) => {
    try {
      // Actualizar el estado del camión a "loading" (cargando)
      await dispatch(
        updateTruck({
          id: truckId,
          truckData: {
            status: "loading",
            currentOrders: [orderId],
          },
        }),
      ).unwrap()

      return { truckId, orderId }
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al asignar camión al pedido")
    }
  },
)

// Crear slice
const trucksSlice = createSlice({
  name: "trucks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch trucks
      .addCase(fetchTrucks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTrucks.fulfilled, (state, action) => {
        state.loading = false
        state.trucks = action.payload
      })
      .addCase(fetchTrucks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch truck by id
      .addCase(fetchTruckById.fulfilled, (state, action) => {
        const index = state.trucks.findIndex((truck) => truck.id === action.payload.id)
        if (index !== -1) {
          state.trucks[index] = action.payload
        } else {
          state.trucks.push(action.payload)
        }
      })
      // Create truck
      .addCase(createTruck.fulfilled, (state, action) => {
        state.trucks.push(action.payload)
      })
      // Update truck
      .addCase(updateTruck.fulfilled, (state, action) => {
        const index = state.trucks.findIndex((truck) => truck.id === action.payload.id)
        if (index !== -1) {
          state.trucks[index] = action.payload
        }
      })
      // Delete truck
      .addCase(deleteTruck.fulfilled, (state, action) => {
        state.trucks = state.trucks.filter((truck) => truck.id !== action.payload)
      })
      // Asegurarse de que el extraReducer para assignTruckToOrder esté presente
      // Añadir el caso en el extraReducers para manejar la acción
      .addCase(assignTruckToOrder.fulfilled, (state, action) => {
        const { truckId } = action.payload
        const truckIndex = state.trucks.findIndex((truck) => truck.id === truckId)
        if (truckIndex !== -1) {
          state.trucks[truckIndex].status = "loading"
        }
      })
  },
})

export default trucksSlice.reducer
