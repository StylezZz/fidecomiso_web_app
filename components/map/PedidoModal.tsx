"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { PedidoFormData } from "@/interfaces/pedido.dto"
import { User, Package, Clock, Calendar, MapPin } from "lucide-react"

interface PedidoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (pedidoData: PedidoFormData) => Promise<void>
}

export function PedidoModal({ isOpen, onClose, onSubmit }: PedidoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<PedidoFormData>({
    codigo: "",
    volumen: 0,
    posicionX: 0,
    posicionY: 0,
    tiempoEspera: 0,
    usarHoraActual: false,
    año: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    dia: new Date().getDate(),
    hora: new Date().getHours(),
    minuto: new Date().getMinutes()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onSubmit(formData)
      onClose()
      // Resetear formulario
      setFormData({
        codigo: "",
        volumen: 0,
        posicionX: 0,
        posicionY: 0,
        tiempoEspera: 0,
        usarHoraActual: false,
        año: new Date().getFullYear(),
        mes: new Date().getMonth() + 1,
        dia: new Date().getDate(),
        hora: new Date().getHours(),
        minuto: new Date().getMinutes()
      })
    } catch (error) {
      console.error("Error al registrar pedido:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof PedidoFormData, value: string | number | boolean) => {
    // Validar límites del mapa para posiciones
    if (field === "posicionX") {
      const numValue = Number(value);
      if (numValue < 0) value = 0;
      if (numValue > 70) value = 70;
    } else if (field === "posicionY") {
      const numValue = Number(value);
      if (numValue < 0) value = 0;
      if (numValue > 50) value = 50;
    } else if (field === "tiempoEspera") {
      const numValue = Number(value);
      if (numValue < 4) value = 4;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ingresar Nuevo Pedido</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Información del Cliente */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                Información del Cliente
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange("codigo", e.target.value)}
                  placeholder="Código del cliente"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-500" />
                  Dirección de entrega
                </Label>
                
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={formData.posicionX}
                    onChange={(e) => handleInputChange("posicionX", Number(e.target.value))}
                    placeholder="X (0-70)"
                    type="number"
                    min="0"
                    max="70"
                    required
                  />
                  <Input
                    value={formData.posicionY}
                    onChange={(e) => handleInputChange("posicionY", Number(e.target.value))}
                    placeholder="Y (0-50)"
                    type="number"
                    min="0"
                    max="50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Información del Pedido */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-green-500" />
                Información del Pedido
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="volumen">Volumen (m3)</Label>
                <Input
                  id="volumen"
                  value={formData.volumen}
                  onChange={(e) => handleInputChange("volumen", Number(e.target.value))}
                  placeholder="Volumen del pedido"
                  type="number"
                  step="0.1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiempoEspera" className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-500" />
                  Tiempo de Espera (h)
                </Label>
                <Input
                  id="tiempoEspera"
                  value={formData.tiempoEspera}
                  onChange={(e) => handleInputChange("tiempoEspera", Number(e.target.value))}
                  placeholder="Tiempo de espera en horas"
                  type="number"
                  step="0.1"
                  required
                />
              </div>
            </div>

            {/* Hora de registro del sistema */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                Hora de registro del sistema
              </h3>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="usarHoraActual"
                  checked={formData.usarHoraActual}
                  onCheckedChange={(checked) => handleInputChange("usarHoraActual", !!checked)}
                />
                <Label htmlFor="usarHoraActual" className="text-sm">Usar hora actual</Label>
              </div>

              {!formData.usarHoraActual && (
                <div className="space-y-3">
                  {/* Fecha */}
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-500" />
                      Fecha
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        value={formData.año}
                        onChange={(e) => handleInputChange("año", Number(e.target.value))}
                        placeholder="Año"
                        type="number"
                        className="text-sm"
                      />
                      <Input
                        value={formData.mes}
                        onChange={(e) => handleInputChange("mes", Number(e.target.value))}
                        placeholder="Mes"
                        type="number"
                        min="1"
                        max="12"
                        className="text-sm"
                      />
                      <Input
                        value={formData.dia}
                        onChange={(e) => handleInputChange("dia", Number(e.target.value))}
                        placeholder="Día"
                        type="number"
                        min="1"
                        max="31"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Hora */}
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-500" />
                      Hora
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={formData.hora}
                        onChange={(e) => handleInputChange("hora", Number(e.target.value))}
                        placeholder="Hora"
                        type="number"
                        min="0"
                        max="23"
                        className="text-sm"
                      />
                      <Input
                        value={formData.minuto}
                        onChange={(e) => handleInputChange("minuto", Number(e.target.value))}
                        placeholder="Minuto"
                        type="number"
                        min="0"
                        max="59"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}