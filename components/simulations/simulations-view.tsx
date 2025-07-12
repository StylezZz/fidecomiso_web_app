"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks/use-redux";
import { Card, CardContent } from "@/components/ui/card";
import { ActiveSimulations } from "./active-simulations";
import { MainLayout } from "@/components/layout/main-layout";
import { resetSimulationState } from "@/store/simulation/simulation-slice";
import { SimulationSetup } from "@/components/simulations/simulation-setup";

export function SimulationsView() {
  const [showWizard, setShowWizard] = useState(false);
  const dispatch = useAppDispatch();

  const handleNewSimulation = () => {
    dispatch(resetSimulationState());
    setShowWizard(true);
  };

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
            className="bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl transition-all duration-200"
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
            <SimulationSetup onClose={() => setShowWizard(false)} />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
