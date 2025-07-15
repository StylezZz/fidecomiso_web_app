"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { getPlanningStatus, getPlanningResult, cancelPlanning } from "@/store/planner/planner-slice"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

type PlanningStatusProps = {
  planningId: string
}

export function PlanningStatus({ planningId }: PlanningStatusProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  const currentPlanning = useAppSelector((state) => state.planner.currentPlanning)

  useEffect(() => {
    // Iniciar el intervalo para actualizar el estado
    const id = setInterval(() => {
      dispatch(getPlanningStatus(planningId))
    }, 1000)

    setIntervalId(id)

    // Limpiar el intervalo cuando el componente se desmonte
    return () => {
      if (id) clearInterval(id)
    }
  }, [dispatch, planningId])

  useEffect(() => {
    // Si la planificación está completa, obtener los resultados y detener el intervalo
    if (currentPlanning.status === "completed") {
      dispatch(getPlanningResult(planningId))
      if (intervalId) {
        clearInterval(intervalId)
        setIntervalId(null)
      }
    }
  }, [currentPlanning.status, dispatch, intervalId, planningId])

  const handleCancel = async () => {
    try {
      await dispatch(cancelPlanning(planningId)).unwrap()
      toast({
        title: "Planificación cancelada",
        description: "La planificación ha sido cancelada",
      })

      // Detener el intervalo
      if (intervalId) {
        clearInterval(intervalId)
        setIntervalId(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar la planificación",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planificación en Progreso</CardTitle>
        <CardDescription>El algoritmo está generando rutas óptimas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Progreso</span>
            <span className="text-sm font-medium">{currentPlanning.progress}%</span>
          </div>
          <Progress value={currentPlanning.progress} className="h-2" />
        </div>
        <div className="flex justify-end">
          <Button variant="destructive" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" /> Cancelar Planificación
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
