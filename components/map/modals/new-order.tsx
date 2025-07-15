"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PedidoFormData } from "@/interfaces/pedido.dto";
import { User, Package, Clock, Calendar, MapPin, Plus, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pedidoData: PedidoFormData) => Promise<void>;
}

export function PedidoModal({ isOpen, onClose, onSubmit }: PedidoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<PedidoFormData>({
    codigo: "",
    volumen: 0,
    posicionX: 0,
    posicionY: 0,
    tiempoEspera: 4,
    usarHoraActual: true,
    año: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    dia: new Date().getDate(),
    hora: new Date().getHours(),
    minuto: new Date().getMinutes(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        codigo: "",
        volumen: 0,
        posicionX: 0,
        posicionY: 0,
        tiempoEspera: 4,
        usarHoraActual: true,
        año: new Date().getFullYear(),
        mes: new Date().getMonth() + 1,
        dia: new Date().getDate(),
        hora: new Date().getHours(),
        minuto: new Date().getMinutes(),
      });
      setSelectedDate(new Date());
    } catch (error) {
      console.error("Reigstro de pedido fallido:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTimeChange = (type: "hora" | "minuto", value: string) => {
    const numValue = Number(value);
    if (type === "hora" && numValue >= 0 && numValue <= 23) {
      setFormData((prev) => ({ ...prev, hora: numValue }));
    } else if (type === "minuto" && numValue >= 0 && numValue <= 59) {
      setFormData((prev) => ({ ...prev, minuto: numValue }));
    }
  };

  const generateClientCode = () => {
    const randomNum = Math.floor(Math.random() * 999) + 1;
    const code = `C-${randomNum.toString().padStart(3, "0")}`;
    setFormData((prev) => ({ ...prev, codigo: code }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">Nuevo Pedido</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Cliente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-md">
                  <User className="h-4 w-4" />
                </div>
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo" className="text-sm font-medium">
                    Código del Cliente
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => handleInputChange("codigo", e.target.value)}
                      placeholder="C-001"
                      className="flex-1"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateClientCode}
                      className="whitespace-nowrap"
                    >
                      Generar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Formato: C-XXX (ej: C-001, C-123)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-500" />
                    Coordenadas de Entrega (X, Y)
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        value={formData.posicionX}
                        onChange={(e) => handleInputChange("posicionX", Number(e.target.value))}
                        placeholder="X (0-70)"
                        type="number"
                        min="0"
                        max="70"
                        className="text-sm"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        value={formData.posicionY}
                        onChange={(e) => handleInputChange("posicionY", Number(e.target.value))}
                        placeholder="Y (0-50)"
                        type="number"
                        min="0"
                        max="50"
                        className="text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del Pedido */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-md">
                  <Package className="h-4 w-4" />
                </div>
                Detalles del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volumen" className="text-sm font-medium">
                    Volumen de GLP (m³)
                  </Label>
                  <Input
                    id="volumen"
                    value={formData.volumen}
                    onChange={(e) => handleInputChange("volumen", Number(e.target.value))}
                    placeholder="0.0"
                    type="number"
                    step="0.1"
                    min="0"
                    className="text-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="tiempoEspera"
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3 text-gray-500" />
                    Tiempo de Espera (horas)
                  </Label>
                  <Input
                    id="tiempoEspera"
                    value={formData.tiempoEspera}
                    onChange={(e) => handleInputChange("tiempoEspera", Number(e.target.value))}
                    placeholder="4"
                    type="number"
                    step="0.5"
                    min="4"
                    className="text-sm"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programación */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-md">
                  <Calendar className="h-4 w-4" />
                </div>
                Programación de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!formData.usarHoraActual && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Selector de Fecha */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Fecha de Registro</Label>
                    <Input
                      type="date"
                      value={`${formData.año}-${formData.mes
                        .toString()
                        .padStart(2, "0")}-${formData.dia.toString().padStart(2, "0")}`}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        if (!isNaN(date.getTime())) {
                          setSelectedDate(date);
                          setFormData((prev) => ({
                            ...prev,
                            año: date.getFullYear(),
                            mes: date.getMonth() + 1,
                            dia: date.getDate(),
                          }));
                        }
                      }}
                      className="text-sm"
                    />
                  </div>

                  {/* Selector de Hora */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Hora de Registro</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Select
                          value={formData.hora.toString()}
                          onValueChange={(value) => handleTimeChange("hora", value)}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Hora" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i.toString().padStart(2, "0")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Select
                          value={formData.minuto.toString()}
                          onValueChange={(value) => handleTimeChange("minuto", value)}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 60 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i.toString().padStart(2, "0")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="px-6">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="px-6">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>Crear Pedido</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
