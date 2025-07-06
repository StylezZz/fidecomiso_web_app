import { createSelector } from "@reduxjs/toolkit"
import type { RootState } from "@/store"

// Selector básico para obtener el estado del dashboard
export const selectDashboardState = (state: RootState) => state.dashboard

// Selector para obtener las estadísticas del dashboard
export const selectDashboardStats = createSelector([selectDashboardState], (dashboard) => dashboard.stats)

// Selector para obtener el estado de carga
export const selectDashboardLoading = createSelector([selectDashboardState], (dashboard) => dashboard.loading)

// Selector para obtener errores
export const selectDashboardError = createSelector([selectDashboardState], (dashboard) => dashboard.error)
