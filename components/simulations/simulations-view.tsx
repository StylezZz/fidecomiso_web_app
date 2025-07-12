"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { SimulationWizard } from "@/components/simulations/simulation-wizard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
//import { SimulationStatus } from "@/components/simulations/simulation-status"
import { SimulationHistory } from "@/components/simulations/simulation-history"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { resetSimulationState } from "@/store/simulation/simulation-slice"
import { Activity, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { ActiveSimulations } from "./active-simulations"

export function SimulationsView() {
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const dispatch = useAppDispatch();
  const currentSimulation = useAppSelector((state) => state.simulation.currentSimulation);
  const router = useRouter();

  
  useEffect(() => {
    const alreadyRedirected = sessionStorage.getItem("redirected") === "true";
    if (currentSimulation?.progress === 100 && !alreadyRedirected) {
      sessionStorage.setItem("redirected", "true");
      router.push("/mapa");
    }
  }, [currentSimulation?.progress])

  const handleNewSimulation = () => {
    sessionStorage.removeItem("redirected");
    dispatch(resetSimulationState());
    setShowWizard(true);
    //setShowNewSimulation(true)
  }

  return (
      <MainLayout>
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Centro de Simulaciones</h1>
              <p className="text-gray-600">Configura y ejecuta simulaciones logísticas para optimizar rutas de distribución de GLP</p>
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">
                <Activity className="mr-2 h-4 w-4" /> Simulaciones Registradas
              </TabsTrigger>

              <TabsTrigger value="history">
                <FileText className="mr-2 h-4 w-4" /> Consideraciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="w-full">
              <ActiveSimulations onNewSimulation={handleNewSimulation} />
            </TabsContent>

            <TabsContent value="history" className="w-full">
              <SimulationHistory />
            </TabsContent>
          </Tabs>


          {showWizard && (
            <>
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowWizard(false)} />
              <SimulationWizard onClose={() => setShowWizard(false)} />
            </>
          )}


        </div>
      </MainLayout>
  )
}
