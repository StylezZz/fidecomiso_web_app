"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAppDispatch } from "@/hooks/use-redux"
import { createTruck } from "@/store/trucks/trucks-slice"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import { TRUCK_TYPES } from "@/types/truck"

const formSchema = z.object({
  plate: z.string().min(6, { message: "La placa debe tener al menos 6 caracteres" }),
  driver: z.string().min(3, { message: "El nombre del conductor debe tener al menos 3 caracteres" }),
  phone: z.string().min(6, { message: "El teléfono debe tener al menos 6 caracteres" }),
  capacity: z.coerce
    .number()
    .min(1, { message: "La capacidad debe ser mayor a 0" })
    .max(100, { message: "La capacidad máxima es 100 m³" }),
  truckType: z.string().min(1, { message: "Debe seleccionar un tipo de camión" }),
  comments: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

type TruckFormProps = {
  onClose: () => void
}

export function TruckForm({ onClose }: TruckFormProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plate: "",
      driver: "",
      phone: "",
      capacity: 0,
      truckType: "",
      comments: "",
    },
  })

  const selectedTruckType = form.watch("truckType")

  // Actualizar la capacidad automáticamente cuando se selecciona un tipo de camión
  const handleTruckTypeChange = (value: string) => {
    form.setValue("truckType", value)

    const selectedType = TRUCK_TYPES.find((type) => type.id === value)
    if (selectedType) {
      form.setValue("capacity", selectedType.maxCapacity)
    }
  }

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      await dispatch(createTruck(data)).unwrap()
      toast({
        title: "Camión creado",
        description: "El camión ha sido creado exitosamente",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al crear el camión",
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
            <CardTitle>Nuevo Camión</CardTitle>
            <CardDescription>
              Complete los datos para crear un nuevo camión. Los campos marcados con{" "}
              <span className="text-red-500">*</span> son obligatorios.
            </CardDescription>
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
                name="plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex">
                      Placa <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="ABC-123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="truckType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex">
                      Tipo de Camión <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <Select onValueChange={handleTruckTypeChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRUCK_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="driver"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conductor</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del conductor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de teléfono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex">
                      Capacidad (m³) <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="100" {...field} disabled={!!selectedTruckType} />
                    </FormControl>
                    <FormDescription>
                      {selectedTruckType
                        ? "Capacidad determinada por el tipo de camión seleccionado"
                        : "Capacidad máxima en metros cúbicos"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Comentarios</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Información adicional sobre el camión"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear Camión"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
