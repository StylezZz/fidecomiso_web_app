"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { LogisticsDashboard } from "@/components/map/logistics-dashboard"

export function MapView() {
  return (
    <MainLayout>
      <div className="w-full h-full flex flex-col">
        <LogisticsDashboard />
      </div>
    </MainLayout>
  )
}
