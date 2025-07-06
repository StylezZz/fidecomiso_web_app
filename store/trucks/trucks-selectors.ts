import { createSelector } from "@reduxjs/toolkit"
import type { RootState } from "@/store"

// Selector básico para obtener el estado de camiones
export const selectTrucksState = (state: RootState) => state.trucks

// Selector para obtener todos los camiones
export const selectAllTrucks = createSelector([selectTrucksState], (trucks) => trucks.trucks)

// Selector para obtener camiones activos
export const selectActiveTrucks = createSelector([selectAllTrucks], (trucks) =>
  trucks.filter((truck) => truck.status === "available" || truck.status === "in_transit"),
)

// Selector para obtener camiones disponibles
export const selectAvailableTrucks = createSelector([selectAllTrucks], (trucks) =>
  trucks.filter((truck) => truck.status === "available"),
)

// Selector para obtener camiones en mantenimiento
export const selectMaintenanceTrucks = createSelector([selectAllTrucks], (trucks) =>
  trucks.filter((truck) => truck.status === "maintenance"),
)

// Selector para obtener un camión por ID
export const selectTruckById = (state: RootState, truckId: string) =>
  state.trucks.trucks.find((truck) => truck.id === truckId)

// Selector para obtener el estado de carga
export const selectTrucksLoading = createSelector([selectTrucksState], (trucks) => trucks.loading)

// Selector para obtener errores
export const selectTrucksError = createSelector([selectTrucksState], (trucks) => trucks.error)
