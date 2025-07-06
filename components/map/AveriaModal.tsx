"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
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

  const handleSubmit = () => {
    // Validación básica
    if (!camionId.trim()) {
      setError("Debe ingresar un ID de camión")
      return
    }

    // Convertir el tipo de avería a número
    const tipoAveriaNum = parseInt(tipoAveria)
    
    // Llamar a la función onSubmit con los datos
    onSubmit(camionId, tipoAveriaNum)
    
    // Mostrar notificación de éxito
    toast.success(`Avería tipo ${tipoAveria} registrada para el camión ${camionId}`, {
      description: "El sistema replanificará las rutas automáticamente"
    })
    
    // Limpiar el formulario y cerrar el modal
    setCamionId("")
    setTipoAveria("1")
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Avería de Camión</DialogTitle>
          <DialogDescription>
            Ingrese el ID del camión y seleccione el tipo de avería para registrar un incidente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {error && (
            <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded-md">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="camion-id" className="text-right">
              ID Camión
            </Label>
            <Input
              id="camion-id"
              placeholder="Ej: TA01"
              className="col-span-3"
              value={camionId}
              onChange={(e) => setCamionId(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tipo-averia" className="text-right">
              Tipo de Avería
            </Label>
            <Select value={tipoAveria} onValueChange={setTipoAveria}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccione tipo de avería" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Leve (TI1) - Llanta baja, inmoviliza 2h</SelectItem>
                <SelectItem value="2">Moderado (TI2) - Motor ahogado, 2h + taller un turno</SelectItem>
                <SelectItem value="3">Grave (TI3) - Choque, 4h + taller un día</SelectItem>
                <SelectItem value="4">Mantenimiento (TI4) - Mantenimiento preventivo, 24h</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Registrar Avería
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
