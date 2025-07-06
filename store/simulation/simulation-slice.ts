import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { simulationService } from "@/services/simulation-service"
import type { SimulationRequest, SimulationResult } from "@/types/simulation"

// Definir el estado inicial
interface SimulationState {
  simulationTypes: { id: string; name: string; description: string }[]
  currentSimulation: {
    type: string;
    id: string | null
    status: "pending" | "running" | "completed" | "failed" | null
    progress: number
  }
  simulationResult: SimulationResult | null
  loading: boolean
  error: string | null
}

const initialState: SimulationState = {
  simulationTypes: [],
  currentSimulation: {
    id: null,
    status: null,
    progress: 0,
  },
  simulationResult: null,
  loading: false,
  error: null,
}

// Crear thunks
export const fetchSimulationTypes = createAsyncThunk(
  "simulation/fetchSimulationTypes",
  async (_, { rejectWithValue }) => {
    try {
      return await simulationService.getSimulationTypes()
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al obtener tipos de simulación")
    }
  },
)

export const startSimulation = createAsyncThunk(
  "simulation/startSimulation",
  async (simulationData: SimulationRequest, { rejectWithValue }) => {
    try {
      return await simulationService.startSimulation(simulationData)
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al iniciar simulación")
    }
  },
)

export const getSimulationStatus = createAsyncThunk(
  "simulation/getSimulationStatus",
  async (simulationId: string, { rejectWithValue }) => {
    try {
      return await simulationService.getSimulationStatus(simulationId)
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al obtener estado de simulación")
    }
  },
)

export const getSimulationResult = createAsyncThunk(
  "simulation/getSimulationResult",
  async (simulationId: string, { rejectWithValue }) => {
    try {
      return await simulationService.getSimulationResult(simulationId)
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al obtener resultado de simulación")
    }
  },
)

export const cancelSimulation = createAsyncThunk(
  "simulation/cancelSimulation",
  async (simulationId: string, { rejectWithValue }) => {
    try {
      await simulationService.cancelSimulation(simulationId)
      return simulationId
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al cancelar simulación")
    }
  },
)

// Crear slice
const simulationSlice = createSlice({
  name: "simulation",
  initialState,
  reducers: {
    resetSimulationState: (state) => {
      state.currentSimulation = {
        id: null,
        status: null,
        progress: 0,
      }
      state.simulationResult = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch simulation types
      .addCase(fetchSimulationTypes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSimulationTypes.fulfilled, (state, action) => {
        state.loading = false
        state.simulationTypes = action.payload
      })
      .addCase(fetchSimulationTypes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Start simulation
      .addCase(startSimulation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(startSimulation.fulfilled, (state, action) => {
        state.loading = false
        state.currentSimulation = {
          id: action.payload.simulationId,
          status: "running",
          progress: 0,
        }
      })
      .addCase(startSimulation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Get simulation status
      .addCase(getSimulationStatus.fulfilled, (state, action) => {
        state.currentSimulation = {
          id: action.payload.id,
          status: action.payload.status,
          progress: action.payload.progress,
        }
      })
      // Get simulation result
      .addCase(getSimulationResult.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSimulationResult.fulfilled, (state, action) => {
        state.loading = false
        state.simulationResult = action.payload
      })
      .addCase(getSimulationResult.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Cancel simulation
      .addCase(cancelSimulation.fulfilled, (state) => {
        state.currentSimulation.status = "failed"
      })
  },
})

export const { resetSimulationState } = simulationSlice.actions

export default simulationSlice.reducer
