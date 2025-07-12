"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { SimulationWizard } from "@/components/simulations/simulation-wizard"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { resetSimulationState } from "@/store/simulation/simulation-slice"
import { Plus } from "lucide-react"
import { ActiveSimulations } from "./active-simulations"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function SimulationsView() {
  const [showWizard, setShowWizard] = useState(false);
  const dispatch = useAppDispatch();
  const currentSimulation = useAppSelector((state) => state.simulation.currentSimulation);

  const handleNewSimulation = () => {
    dispatch(resetSimulationState());
    setShowWizard(true);
  }

  return (
    <MainLayout>
      <div className="space-y-6 w-full">
        {/* Header simplificado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lista de Simulaciones</h1>
          </div>
          <Button 
            onClick={handleNewSimulation} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" /> 
            Nueva Simulación
          </Button>
        </div>

        {/* Contenido principal */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <ActiveSimulations onNewSimulation={handleNewSimulation} />
          </CardContent>
        </Card>

        {/* Wizard inline en lugar de modal */}
        {showWizard && (
          <div className="mt-8">
            <SimulationWizard onClose={() => setShowWizard(false)} />
          </div>
        )}
      </div>
    </MainLayout>
  )
}
