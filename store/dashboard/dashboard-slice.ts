import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { dashboardStatsData } from "@/services/mock-data"

// Definir el estado inicial
interface DashboardState {
  stats: {
    pendingOrders: number
    availableTrucks: number
    totalTrucks: number
    fuelConsumption: number
    averageDeliveryTime: number
  }
  loading: boolean
  error: string | null
}

const initialState: DashboardState = {
  stats: {
    pendingOrders: 0,
    availableTrucks: 0,
    totalTrucks: 0,
    fuelConsumption: 0,
    averageDeliveryTime: 0,
  },
  loading: false,
  error: null,
}

// Crear thunk para obtener datos del dashboard
export const fetchDashboardData = createAsyncThunk("dashboard/fetchData", async (_, { rejectWithValue }) => {
  try {
    // Simular una llamada a la API
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return dashboardStatsData
  } catch (error: any) {
    return rejectWithValue(error.message || "Error al obtener datos del dashboard")
  }
})

// Crear slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default dashboardSlice.reducer
