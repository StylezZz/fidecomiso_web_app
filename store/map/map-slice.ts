import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { mapService } from "@/services/map-service"
import type { MapData } from "@/types/map"

interface MapState {
  mapData: MapData
  loading: boolean
  error: string | null
  realTimeUpdatesActive: boolean
}

const initialState: MapState = {
  mapData: {
    plant: {
      id: 'plant1',
      position: [12, 8] as [number, number],
      name: 'Planta Principal',
      capacity: null,
      currentLevel: null
    },
    tanks: [],
    trucks: [],
    orders: [],
    routes: [],
    grid: {
      width: 70,
      height: 50
    }
  },
  loading: false,
  error: null,
  realTimeUpdatesActive: false,
}

export const fetchMapData = createAsyncThunk("map/fetchMapData", async (_, { rejectWithValue }) => {
  try {
    return await mapService.getMapData()
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Error fetching map data")
  }
})

// This is a special thunk that doesn't return a promise
// It sets up an SSE connection and dispatches actions when data is received
export const startRealTimeUpdates = createAsyncThunk("map/startRealTimeUpdates", async (_, { dispatch }) => {
  const cleanup = mapService.startRealTimeUpdates((data) => {
    dispatch(updateMapData(data))
  })

  // Return the cleanup function
  return cleanup
})

export const stopRealTimeUpdates = createAsyncThunk("map/stopRealTimeUpdates", async (_, { getState }) => {
  const state = getState() as { map: MapState }
  if (state.map.realTimeUpdatesActive) {
    // The cleanup function is stored in the state
    // We need to call it to close the SSE connection
    return null
  }
})

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    updateMapData: (state, action: PayloadAction<MapData>) => {
      state.mapData = action.payload
    },
    updateTruckPosition: (state, action: PayloadAction<{ id: string; position: [number, number] }>) => {
      const { id, position } = action.payload
      const truckIndex = state.mapData.trucks.findIndex((truck) => truck.id === id)
      if (truckIndex !== -1) {
        state.mapData.trucks[truckIndex].position = position
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMapData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMapData.fulfilled, (state, action) => {
        state.loading = false
        state.mapData = action.payload
      })
      .addCase(fetchMapData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(startRealTimeUpdates.fulfilled, (state) => {
        state.realTimeUpdatesActive = true
      })
      .addCase(stopRealTimeUpdates.fulfilled, (state) => {
        state.realTimeUpdatesActive = false
      })
  },
})

export const { updateMapData, updateTruckPosition } = mapSlice.actions

export default mapSlice.reducer
