"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { updateTruck } from "@/store/trucks/trucks-slice"
import { selectTruckById } from "@/store/trucks/trucks-selectors"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import { addMonths } from "date-fns"

const formSchema = z.object({
  type: z.enum(["preventive", "corrective"]),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  cost: z.coerce.number().min(0, { message: "El costo no puede ser negativo" }).optional(),
})

type FormValues = z.infer<typeof formSchema>

type MaintenanceFormProps = {
  truckId: string
  onClose: () => void
}

export function MaintenanceForm({ truckId, onClose }: MaintenanceFormProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const truck = useAppSelector((state) => selectTruckById(state, truckId))

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "preventive",
      description: "",
      cost: 0,
    },
  })

  if (!truck) {
    return null
  }

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      // Calcular la fecha del próximo mantenimiento (2 meses después)
      const nextMaintenance = addMonths(new Date(), 2)

      // Crear el registro de mantenimiento
      const maintenanceRecord = {
        date: new Date().toISOString(),
        type: data.type,
        description: data.description,
        cost: data.cost,
      }

      // Actualizar el camión
      await dispatch(
        updateTruck({
          id: truckId,
          truckData: {
            status: "maintenance",
            lastMaintenance: new Date().toISOString(),
            nextMaintenance: nextMaintenance.toISOString(),
            maintenanceHistory: [...(truck.maintenanceHistory || []), maintenanceRecord],
          },
        }),
      ).unwrap()

      toast({
        title: "Mantenimiento programado",
        description: "El camión ha sido enviado a mantenimiento",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo programar el mantenimiento",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="fixed inset-0 z-50 flex flex-col max-w-md mx-auto my-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Programar Mantenimiento</CardTitle>
            <CardDescription>
              Camión #{truckId} - {truck.plate}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form id="maintenance-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Mantenimiento</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="preventive" />
                        </FormControl>
                        <FormLabel className="font-normal">Preventivo</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="corrective" />
                        </FormControl>
                        <FormLabel className="font-normal">Correctivo</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describa el mantenimiento a realizar" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo Estimado (opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormDescription>Costo estimado del mantenimiento</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" form="maintenance-form" disabled={isSubmitting}>
          {isSubmitting ? "Programando..." : "Programar Mantenimiento"}
        </Button>
      </CardFooter>
    </Card>
  )
}
