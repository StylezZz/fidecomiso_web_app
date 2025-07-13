"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { PlanningForm } from "@/components/planner/planning-form";
import { PlanningStatus } from "@/components/planner/planning-status";
import { PlanningResults } from "@/components/planner/planning-results";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchAlgorithms, resetPlanningState } from "@/store/planner/planner-slice";
import { Play } from "lucide-react";

export function PlannerView() {
  const [showForm, setShowForm] = useState(false);
  const dispatch = useAppDispatch();
  const currentPlanning = useAppSelector((state) => state.planner.currentPlanning);

  useEffect(() => {
    dispatch(fetchAlgorithms());
  }, [dispatch]);

  const handleNewPlanning = () => {
    dispatch(resetPlanningState());
    setShowForm(true);
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Planificador de Rutas</h1>
          <Button onClick={handleNewPlanning}>
            <Play className="mr-2 h-4 w-4" /> Nueva Planificación
          </Button>
        </div>

        {showForm && <PlanningForm onClose={() => setShowForm(false)} />}

        {currentPlanning.id && currentPlanning.status === "running" && (
          <PlanningStatus planningId={currentPlanning.id} />
        )}

        {currentPlanning.id && currentPlanning.status === "completed" && (
          <PlanningResults planningId={currentPlanning.id} />
        )}

        {!showForm && !currentPlanning.id && (
          <Card>
            <CardHeader>
              <CardTitle>Planificador de Rutas</CardTitle>
              <CardDescription>
                Optimice la asignación de pedidos a camiones y genere rutas eficientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <p className="text-center text-muted-foreground">
                  No hay planificaciones activas. Haga clic en "Nueva Planificación" para comenzar.
                </p>
                <Button onClick={handleNewPlanning}>
                  <Play className="mr-2 h-4 w-4" /> Nueva Planificación
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
