"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { startPlanning } from "@/store/planner/planner-slice"
import { selectPendingOrders } from "@/store/orders/orders-selectors"
import { selectAvailableTrucks } from "@/store/trucks/trucks-selectors"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

const formSchema = z.object({
  algorithm: z.string(),
  optimizationCriteria: z.enum(["fuel", "time", "balanced"]),
  maxIterations: z.number().min(10).max(1000),
  timeLimit: z.number().min(5).max(300),
  includeAllOrders: z.boolean(),
  includeAllTrucks: z.boolean(),
  selectedOrders: z.array(z.string()).optional(),
  selectedTrucks: z.array(z.string()).optional(),
})

type FormValues = z.infer<typeof formSchema>

type PlanningFormProps = {
  onClose: () => void
}

export function PlanningForm({ onClose }: PlanningFormProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const algorithms = useAppSelector((state) => state.planner.algorithms)
  const pendingOrders = useAppSelector(selectPendingOrders)
  const availableTrucks = useAppSelector(selectAvailableTrucks)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      algorithm: "",
      optimizationCriteria: "balanced",
      maxIterations: 100,
      timeLimit: 30,
      includeAllOrders: true,
      includeAllTrucks: true,
      selectedOrders: [],
      selectedTrucks: [],
    },
  })

  const includeAllOrders = form.watch("includeAllOrders")
  const includeAllTrucks = form.watch("includeAllTrucks")

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      // Preparar los datos para la API
      const planningData = {
        algorithm: data.algorithm,
        options: {
          maxIterations: data.maxIterations,
          timeLimit: data.timeLimit,
          optimizationCriteria: data.optimizationCriteria,
        },
        includeOrders: data.includeAllOrders ? undefined : data.selectedOrders,
        includeTrucks: data.includeAllTrucks ? undefined : data.selectedTrucks,
      }

      await dispatch(startPlanning(planningData)).unwrap()
      toast({
        title: "Planificación iniciada",
        description: "La planificación de rutas ha comenzado",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al iniciar la planificación",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Nueva Planificación</CardTitle>
            <CardDescription>Configure los parámetros para la planificación de rutas</CardDescription>
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
                name="algorithm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Algoritmo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un algoritmo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {algorithms.map((algorithm) => (
                          <SelectItem key={algorithm.id} value={algorithm.id}>
                            {algorithm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Algoritmo a utilizar para la optimización</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="optimizationCriteria"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Criterio de Optimización</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="fuel" />
                          </FormControl>
                          <FormLabel className="font-normal">Consumo de combustible</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="time" />
                          </FormControl>
                          <FormLabel className="font-normal">Tiempo de entrega</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="balanced" />
                          </FormControl>
                          <FormLabel className="font-normal">Equilibrado</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxIterations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Iteraciones Máximas: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={10}
                        max={1000}
                        step={10}
                        defaultValue={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>Número máximo de iteraciones del algoritmo</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Límite de Tiempo: {field.value} segundos</FormLabel>
                    <FormControl>
                      <Slider
                        min={5}
                        max={300}
                        step={5}
                        defaultValue={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>Tiempo máximo de ejecución en segundos</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includeAllOrders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Incluir todos los pedidos pendientes</FormLabel>
                      <FormDescription>Si está desactivado, podrá seleccionar pedidos específicos</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includeAllTrucks"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Incluir todos los camiones disponibles</FormLabel>
                      <FormDescription>Si está desactivado, podrá seleccionar camiones específicos</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {!includeAllOrders && pendingOrders.length > 0 && (
              <FormField
                control={form.control}
                name="selectedOrders"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Seleccionar Pedidos</FormLabel>
                      <FormDescription>Seleccione los pedidos que desea incluir en la planificación</FormDescription>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {pendingOrders.map((order) => (
                        <FormField
                          key={order.id}
                          control={form.control}
                          name="selectedOrders"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={order.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(order.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), order.id])
                                        : field.onChange(field.value?.filter((value) => value !== order.id))
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-normal">
                                    Pedido #{order.id} - {order.customer}
                                  </FormLabel>
                                  <FormDescription className="text-xs">{order.volume} m³</FormDescription>
                                </div>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!includeAllTrucks && availableTrucks.length > 0 && (
              <FormField
                control={form.control}
                name="selectedTrucks"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Seleccionar Camiones</FormLabel>
                      <FormDescription>Seleccione los camiones que desea incluir en la planificación</FormDescription>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {availableTrucks.map((truck) => (
                        <FormField
                          key={truck.id}
                          control={form.control}
                          name="selectedTrucks"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={truck.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(truck.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), truck.id])
                                        : field.onChange(field.value?.filter((value) => value !== truck.id))
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-normal">
                                    Camión #{truck.id} - {truck.driver}
                                  </FormLabel>
                                  <FormDescription className="text-xs">Capacidad: {truck.capacity} m³</FormDescription>
                                </div>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Iniciando..." : "Iniciar Planificación"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
