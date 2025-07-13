"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks/use-redux";
import { Card, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { resetSimulationState } from "@/store/simulation/simulation-slice";
import { SimulationSetup } from "@/components/simulations/simulation-setup";
import { ActiveSimulations } from "@/components/simulations/active-simulations";

export function SimulationsView() {
  const dispatch = useAppDispatch();
  const [configuracion, setConfiguracion] = useState(false);

  const handleNewSimulation = () => {
    dispatch(resetSimulationState());
    setConfiguracion(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6 w-full">
        {/* Cabecera */}
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

        {/* Configuración de simulaciones */}
        {configuracion && (
          <div className="mt-8">
            <SimulationSetup onClose={() => setConfiguracion(false)} />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
