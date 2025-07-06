import { createSelector } from "@reduxjs/toolkit"
import type { RootState } from "@/store"

export const selectOrders = (state: RootState) => state.orders.orders
export const selectOrdersLoading = (state: RootState) => state.orders.loading
export const selectOrdersError = (state: RootState) => state.orders.error

export const selectOrderById = createSelector([selectOrders, (_, orderId: string) => orderId], (orders, orderId) =>
  orders.find((order) => order.id === orderId),
)

export const selectPendingOrders = createSelector([selectOrders], (orders) =>
  orders.filter((order) => order.status === "pending"),
)

export const selectAssignedOrders = createSelector([selectOrders], (orders) =>
  orders.filter((order) => order.status === "assigned"),
)

export const selectInTransitOrders = createSelector([selectOrders], (orders) =>
  orders.filter((order) => order.status === "in_transit"),
)

export const selectDeliveredOrders = createSelector([selectOrders], (orders) =>
  orders.filter((order) => order.status === "delivered"),
)

export const selectOrdersByStatus = createSelector([selectOrders, (_, status: string) => status], (orders, status) =>
  orders.filter((order) => order.status === status),
)
