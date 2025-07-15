"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wrench, Clock, Car, Settings, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MantenimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (camionId: string, tipoMantenimiento: number) => void;
}

export function MantenimientoModal({ isOpen, onClose, onSubmit }: MantenimientoModalProps) {
  const [camionId, setCamionId] = useState("");
  const [tipoMantenimiento, setTipoMantenimiento] = useState<string>("1");
  const [error, setError] = useState<string | null>(null);

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
  ];

  const tiposMantenimiento = [
    {
      id: "1",
      nombre: "Mantenimiento Básico (TM1)",
      descripcion: "Cambio de aceite, filtros y revisión general",
      tiempo: "4 horas",
      icon: "🔧",
      frecuencia: "Cada 5,000 km",
    },
    {
      id: "2",
      nombre: "Mantenimiento Intermedio (TM2)",
      descripcion: "Revisión de frenos, suspensión y sistema eléctrico",
      tiempo: "8 horas",
      icon: "⚙️",
      frecuencia: "Cada 15,000 km",
    },
    {
      id: "3",
      nombre: "Mantenimiento Mayor (TM3)",
      descripcion: "Revisión completa del motor, transmisión y sistemas",
      tiempo: "24 horas",
      icon: "🔨",
      frecuencia: "Cada 50,000 km",
    },
    {
      id: "4",
      nombre: "Mantenimiento Preventivo (TM4)",
      descripcion: "Mantenimiento programado preventivo completo",
      tiempo: "48 horas",
      icon: "🛠️",
      frecuencia: "Cada 100,000 km",
    },
  ];

  const handleSubmit = () => {
    // Validación básica
    if (!camionId.trim()) {
      setError("Debe seleccionar un camión");
      return;
    }

    // Convertir el tipo de mantenimiento a número
    const tipoMantenimientoNum = parseInt(tipoMantenimiento);

    // Llamar a la función onSubmit con los datos
    onSubmit(camionId, tipoMantenimientoNum);

    // Mostrar notificación de éxito
    const tipoSeleccionado = tiposMantenimiento.find((t) => t.id === tipoMantenimiento);
    toast.success(
      `Mantenimiento ${tipoSeleccionado?.nombre} programado para el camión ${camionId}`,
      {
        description: "El camión será retirado del servicio durante el mantenimiento",
      }
    );

    // Limpiar el formulario y cerrar el modal
    setCamionId("");
    setTipoMantenimiento("1");
    setError(null);
    onClose();
  };

  const tipoSeleccionado = tiposMantenimiento.find((t) => t.id === tipoMantenimiento);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="h-5 w-5 text-blue-600" />
            </div>
            Programar Mantenimiento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
              <Wrench className="h-4 w-4" />
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

          {/* Tipo de Mantenimiento */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-md">
                  <Wrench className="h-4 w-4" />
                </div>
                Tipo de Mantenimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo</Label>
                <Select value={tipoMantenimiento} onValueChange={setTipoMantenimiento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo de mantenimiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposMantenimiento.map((tipo) => (
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
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{tipoSeleccionado.icon}</span>
                      <span className="font-medium">{tipoSeleccionado.nombre}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{tipoSeleccionado.descripcion}</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Duración: {tipoSeleccionado.tiempo}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>Frecuencia: {tipoSeleccionado.frecuencia}</span>
                      </div>
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
            className="px-6 bg-blue-600 hover:bg-blue-700"
            disabled={!camionId}
          >
            Programar Mantenimiento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
