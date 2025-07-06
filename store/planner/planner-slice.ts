import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { plannerService } from "@/services/planner-service"
import type { PlanningRequest, PlanningResult } from "@/types/planning"

// Definir el estado inicial
interface PlannerState {
  algorithms: { id: string; name: string; description: string }[]
  currentPlanning: {
    id: string | null
    status: "pending" | "running" | "completed" | "failed" | null
    progress: number
  }
  planningResult: PlanningResult | null
  loading: boolean
  error: string | null
}

const initialState: PlannerState = {
  algorithms: [],
  currentPlanning: {
    id: null,
    status: null,
    progress: 0,
  },
  planningResult: null,
  loading: false,
  error: null,
}

// Crear thunks
export const fetchAlgorithms = createAsyncThunk("planner/fetchAlgorithms", async (_, { rejectWithValue }) => {
  try {
    return await plannerService.getAvailableAlgorithms()
  } catch (error: any) {
    return rejectWithValue(error.message || "Error al obtener algoritmos")
  }
})

export const startPlanning = createAsyncThunk(
  "planner/startPlanning",
  async (planningData: PlanningRequest, { rejectWithValue }) => {
    try {
      return await plannerService.startPlanning(planningData)
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al iniciar planificación")
    }
  },
)

export const getPlanningStatus = createAsyncThunk(
  "planner/getPlanningStatus",
  async (planningId: string, { rejectWithValue }) => {
    try {
      return await plannerService.getPlanningStatus(planningId)
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al obtener estado de planificación")
    }
  },
)

export const getPlanningResult = createAsyncThunk(
  "planner/getPlanningResult",
  async (planningId: string, { rejectWithValue }) => {
    try {
      return await plannerService.getPlanningResult(planningId)
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al obtener resultado de planificación")
    }
  },
)

export const cancelPlanning = createAsyncThunk(
  "planner/cancelPlanning",
  async (planningId: string, { rejectWithValue }) => {
    try {
      await plannerService.cancelPlanning(planningId)
      return planningId
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al cancelar planificación")
    }
  },
)

// Crear slice
const plannerSlice = createSlice({
  name: "planner",
  initialState,
  reducers: {
    resetPlanningState: (state) => {
      state.currentPlanning = {
        id: null,
        status: null,
        progress: 0,
      }
      state.planningResult = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch algorithms
      .addCase(fetchAlgorithms.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAlgorithms.fulfilled, (state, action) => {
        state.loading = false
        state.algorithms = action.payload
      })
      .addCase(fetchAlgorithms.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Start planning
      .addCase(startPlanning.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(startPlanning.fulfilled, (state, action) => {
        state.loading = false
        state.currentPlanning = {
          id: action.payload.planningId,
          status: "running",
          progress: 0,
        }
      })
      .addCase(startPlanning.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Get planning status
      .addCase(getPlanningStatus.fulfilled, (state, action) => {
        state.currentPlanning = {
          id: action.payload.id,
          status: action.payload.status,
          progress: action.payload.progress,
        }
      })
      // Get planning result
      .addCase(getPlanningResult.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPlanningResult.fulfilled, (state, action) => {
        state.loading = false
        state.planningResult = action.payload
      })
      .addCase(getPlanningResult.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Cancel planning
      .addCase(cancelPlanning.fulfilled, (state) => {
        state.currentPlanning.status = "failed"
      })
  },
})

export const { resetPlanningState } = plannerSlice.actions

export default plannerSlice.reducer
