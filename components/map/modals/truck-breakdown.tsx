"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Wrench, Clock, Car } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface AveriaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (camionId: string, tipoAveria: number) => void
}

export function AveriaModal({ isOpen, onClose, onSubmit }: AveriaModalProps) {
  const [camionId, setCamionId] = useState("")
  const [tipoAveria, setTipoAveria] = useState<string>("1")
  const [error, setError] = useState<string | null>(null)

  // Lista de camiones disponibles (puedes obtener esto dinámicamente)
  const camionesDisponibles = [
    { id: "TA01", tipo: "Camión Tipo A", estado: "Disponible" },
    { id: "TA02", tipo: "Camión Tipo A", estado: "Disponible" },
    { id: "TB01", tipo: "Camión Tipo B", estado: "Disponible" },
    { id: "TB02", tipo: "Camión Tipo B", estado: "Disponible" },
    { id: "TB03", tipo: "Camión Tipo B", estado: "Disponible" },
    { id: "TB04", tipo: "Camión Tipo B", estado: "Disponible" },
    { id: "TC01", tipo: "Camión Tipo C", estado: "Disponible" },
    { id: "TC02", tipo: "Camión Tipo C", estado: "Disponible" },
    { id: "TC03", tipo: "Camión Tipo C", estado: "Disponible" },
    { id: "TC04", tipo: "Camión Tipo C", estado: "Disponible" },
    { id: "TD01", tipo: "Camión Tipo D", estado: "Disponible" },
    { id: "TD02", tipo: "Camión Tipo D", estado: "Disponible" },
    { id: "TD03", tipo: "Camión Tipo D", estado: "Disponible" },
    { id: "TD04", tipo: "Camión Tipo D", estado: "Disponible" },
    { id: "TD05", tipo: "Camión Tipo D", estado: "Disponible" },
    { id: "TD06", tipo: "Camión Tipo D", estado: "Disponible" },
    { id: "TD07", tipo: "Camión Tipo D", estado: "Disponible" },
    { id: "TD08", tipo: "Camión Tipo D", estado: "Disponible" },
    { id: "TD09", tipo: "Camión Tipo D", estado: "Disponible" },
    { id: "TD10", tipo: "Camión Tipo D", estado: "Disponible" },
  ]

  const tiposAveria = [
    { 
      id: "1", 
      nombre: "Leve (TI1)", 
      descripcion: "Llanta baja, inmoviliza 2h",
      tiempo: "2 horas",
      icon: "🔧"
    },
    { 
      id: "2", 
      nombre: "Moderado (TI2)", 
      descripcion: "Motor ahogado, 2h + taller un turno",
      tiempo: "2 horas + taller",
      icon: "⚙️"
    },
    { 
      id: "3", 
      nombre: "Grave (TI3)", 
      descripcion: "Choque, 4h + taller un día",
      tiempo: "4 horas + taller",
      icon: "🚨"
    }
  ]

  const handleSubmit = () => {
    // Validación básica
    if (!camionId.trim()) {
      setError("Debe seleccionar un camión")
      return
    }

    // Convertir el tipo de avería a número
    const tipoAveriaNum = parseInt(tipoAveria)
    
    // Llamar a la función onSubmit con los datos
    onSubmit(camionId, tipoAveriaNum)
    
    // Mostrar notificación de éxito
    const tipoSeleccionado = tiposAveria.find(t => t.id === tipoAveria)
    toast.success(`Avería ${tipoSeleccionado?.nombre} registrada para el camión ${camionId}`, {
      description: "El sistema replanificará las rutas automáticamente"
    })
    
    // Limpiar el formulario y cerrar el modal
    setCamionId("")
    setTipoAveria("1")
    setError(null)
    onClose()
  }

  const tipoSeleccionado = tiposAveria.find(t => t.id === tipoAveria)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            Registrar Avería de Camión
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Selección de Camión */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-md">
                  <Car className="h-4 w-4" />
                </div>
                Seleccionar Camión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Camión</Label>
                <Select value={camionId} onValueChange={setCamionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un camión" />
                  </SelectTrigger>
                  <SelectContent>
                    {camionesDisponibles.map((camion) => (
                      <SelectItem key={camion.id} value={camion.id}>
                        {camion.id} - {camion.tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tipo de Avería */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-md">
                  <Wrench className="h-4 w-4" />
                </div>
                Tipo de Avería
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo</Label>
                <Select value={tipoAveria} onValueChange={setTipoAveria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo de avería" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposAveria.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        <div className="flex items-center gap-2">
                          <span>{tipo.icon}</span>
                          <span>{tipo.nombre}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {tipoSeleccionado && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{tipoSeleccionado.icon}</span>
                      <span className="font-medium">{tipoSeleccionado.nombre}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{tipoSeleccionado.descripcion}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>Tiempo estimado: {tipoSeleccionado.tiempo}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="px-6">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            className="px-6 bg-red-600 hover:bg-red-700"
            disabled={!camionId}
          >
            Registrar Avería
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
