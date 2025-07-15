"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { startSimulation } from "@/store/simulation/simulation-slice"
import { useToast } from "@/hooks/use-toast"
import { X, AlertTriangle } from "lucide-react"

const formSchema = z.object({
  type: z.string(),
  maxDays: z.number().min(1).max(30),
  orderGenerationRate: z.number().min(1).max(50),
  truckBreakdownProbability: z.number().min(0).max(100),
  minOrderSize: z.number().min(1).max(25),
  maxOrderSize: z.number().min(1).max(25),
  minDeadlineHours: z.number().min(4).max(48),
  maxDeadlineHours: z.number().min(4).max(48),
})

type FormValues = z.infer<typeof formSchema>

type SimulationFormProps = {
  onClose: () => void
}

export function SimulationForm({ onClose }: SimulationFormProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const simulationTypes = useAppSelector((state) => state.simulation.simulationTypes)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      maxDays: 7,
      orderGenerationRate: 15,
      truckBreakdownProbability: 5,
      minOrderSize: 5,
      maxOrderSize: 20,
      minDeadlineHours: 4,
      maxDeadlineHours: 24,
    },
  })

  const simulationType = form.watch("type")
  const minOrderSize = form.watch("minOrderSize")
  const minDeadlineHours = form.watch("minDeadlineHours")

  async function onSubmit(data: FormValues) {
    // Validar que maxOrderSize sea mayor o igual que minOrderSize
    if (data.maxOrderSize < data.minOrderSize) {
      form.setError("maxOrderSize", {
        type: "manual",
        message: "El tamaño máximo debe ser mayor o igual al tamaño mínimo",
      })
      return
    }

    // Validar que maxDeadlineHours sea mayor o igual que minDeadlineHours
    if (data.maxDeadlineHours < data.minDeadlineHours) {
      form.setError("maxDeadlineHours", {
        type: "manual",
        message: "El plazo máximo debe ser mayor o igual al plazo mínimo",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Preparar los datos para la API
      const simulationData = {
        type: data.type,
        algorithm: "default_algorithm", // Usar un algoritmo predeterminado en lugar del seleccionado
        options: {
          maxDays: data.maxDays,
          orderGenerationRate: data.orderGenerationRate,
          truckBreakdownProbability: data.truckBreakdownProbability / 100, // Convertir a probabilidad (0-1)
          orderSizeRange: [data.minOrderSize, data.maxOrderSize],
          deadlineHoursRange: [data.minDeadlineHours, data.maxDeadlineHours],
        },
      }

      await dispatch(startSimulation(simulationData)).unwrap()
      toast({
        title: "Simulación iniciada",
        description: "La simulación ha comenzado",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al iniciar la simulación",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" style={{ margin: 0, padding: 0 }}>
      <div className="max-w-4xl w-full mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Nueva Simulación</CardTitle>
                <CardDescription>Configure los parámetros para la simulación</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Simulación</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un tipo de simulación" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {simulationTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Tipo de simulación a ejecutar</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {simulationType !== "until_collapse" && (
                    <FormField
                      control={form.control}
                      name="maxDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Días a Simular: {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={30}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormDescription>Número de días a simular</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="orderGenerationRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tasa de Generación de Pedidos: {field.value} por día</FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={50}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormDescription>Número promedio de pedidos generados por día</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="truckBreakdownProbability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Probabilidad de Averías: {field.value}%</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormDescription>Probabilidad de avería de camiones por día</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minOrderSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamaño Mín. Pedido (m³)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={25}
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxOrderSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamaño Máx. Pedido (m³)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={minOrderSize}
                              max={25}
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minDeadlineHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plazo Mín. (horas)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={4}
                              max={48}
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxDeadlineHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plazo Máx. (horas)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={minDeadlineHours}
                              max={48}
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800">Política de Cero Incumplimientos</h4>
                        <p className="text-xs text-amber-700">
                          Todos los pedidos deben realizarse con un mínimo de 4 horas de antelación. Si un pedido no
                          puede ser atendido, se considerará un "colapso" de la operación.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Iniciando..." : "Iniciar Simulación"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
