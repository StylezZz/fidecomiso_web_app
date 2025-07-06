import { configureStore } from "@reduxjs/toolkit"
import dashboardReducer from "./dashboard/dashboard-slice"
import ordersReducer from "./orders/orders-slice"
import trucksReducer from "./trucks/trucks-slice"
import mapReducer from "./map/map-slice"
import plannerReducer from "./planner/planner-slice"
import simulationReducer from "./simulation/simulation-slice"

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    orders: ordersReducer,
    trucks: trucksReducer,
    map: mapReducer,
    planner: plannerReducer,
    simulation: simulationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
