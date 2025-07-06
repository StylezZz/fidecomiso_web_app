import { createSelector } from "@reduxjs/toolkit"
import type { RootState } from "@/store"

export const selectMapData = (state: RootState) => state.map.mapData
export const selectMapLoading = (state: RootState) => state.map.loading
export const selectMapError = (state: RootState) => state.map.error
export const selectRealTimeUpdatesActive = (state: RootState) => state.map.realTimeUpdatesActive

export const selectTrucks = createSelector([selectMapData], (mapData) => mapData.trucks)

export const selectOrders = createSelector([selectMapData], (mapData) => mapData.orders)

export const selectTanks = createSelector([selectMapData], (mapData) => mapData.tanks)

export const selectPlant = createSelector([selectMapData], (mapData) => mapData.plant)

export const selectRoutes = createSelector([selectMapData], (mapData) => mapData.routes)
