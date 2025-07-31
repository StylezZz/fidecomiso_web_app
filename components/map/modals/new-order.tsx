"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PedidoFormData } from "@/interfaces/pedido.dto";
import {
  User,
  Package,
  Clock,
  Calendar,
  MapPin,
  Info,
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMapContext } from "@/contexts/ContextMap";
import { useSimulationContext } from "@/contexts/ContextSimulation";
import PedidosService from "@/services/orders.service";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface PedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pedidoData: PedidoFormData) => Promise<void>;
  fechaSimulacion?: Date;
}

export function PedidoModal({ isOpen, onClose, onSubmit, fechaSimulacion }: PedidoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "file">("manual");

  // Estados para upload de archivos
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [fileValidationStatus, setFileValidationStatus] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle");
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { simulationTime } = useMapContext();
  const { simulacionSeleccionada } = useSimulationContext();
  const { anio, mes } = simulacionSeleccionada;
  const { day, hour, minute } = simulationTime.time;

  const fechaSimulacionFromContext = new Date(anio, mes - 1, day, hour, minute);
  const [selectedDate, setSelectedDate] = useState<Date>(fechaSimulacionFromContext);

  const [formData, setFormData] = useState<PedidoFormData>({
    codigo: "",
    volumen: 0,
    posicionX: 0,
    posicionY: 0,
    tiempoEspera: 4,
    año: anio,
    mes: mes,
    dia: day,
    hora: hour,
    minuto: minute,
  });

  // Función para leer archivos como texto
  const readFileText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Validar archivo de pedidos
  const validateOrdersFile = async (file: File, content: string) => {
    setFileValidationStatus("validating");
    setValidationProgress(0);
    setValidationErrors([]);

    const totalSteps = 5;
    for (let i = 1; i <= totalSteps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setValidationProgress((i / totalSteps) * 100);
    }

    try {
      // Validar nombre del archivo
      if (
        !file.name.toLowerCase().includes("ventas") &&
        !file.name.toLowerCase().includes("pedidos")
      ) {
        throw new Error("El archivo debe contener 'ventas' o 'pedidos' en el nombre");
      }

      if (!file.name.endsWith(".txt")) {
        throw new Error("El archivo debe tener extensión .txt");
      }

      // Validar que el contenido no esté vacío
      if (!content.trim()) {
        throw new Error("El archivo está vacío");
      }

      // Validar formato básico del contenido (puedes personalizar esto según tu formato)
      const lines = content.split("\n").filter((line) => line.trim() !== "");
      if (lines.length === 0) {
        throw new Error("El archivo no contiene datos válidos");
      }

      // Extraer datos desde el nombre del archivo de pedidos
      const nombreArchivo = file.name;
      const regexFecha = /(ventas|pedidos)(\d{4})(\d{2})/i;
      const match = nombreArchivo.match(regexFecha);

      if (!match) {
        console.warn(
          "El nombre del archivo no contiene una fecha en formato esperado, pero se continuará con la validación"
        );
      }

      setFileValidationStatus("valid");
      return true;
    } catch (error) {
      setValidationErrors([
        error instanceof Error ? error.message : "Error desconocido en la validación",
      ]);
      setFileValidationStatus("invalid");
      return false;
    }
  };

  // Manejar subida de archivo de pedidos
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validaciones básicas
    if (!file.name.endsWith(".txt")) {
      toast.error("Debes subir un archivo en formato .txt");
      return;
    }

    setUploadedFile(file);

    try {
      const content = await readFileText(file);
      await validateOrdersFile(file, content);
    } catch (error) {
      toast.error(`Error al leer el archivo: ${(error as Error).message}`);
      setUploadedFile(null);
    }
  };

  // Enviar archivo al servidor
  const handleSubmitFile = async () => {
    if (!uploadedFile) {
      toast.error("Por favor selecciona un archivo");
      return;
    }

    if (fileValidationStatus !== "valid") {
      toast.error("El archivo no es válido");
      return;
    }

    setIsUploadingFile(true);

    try {
      const response = await PedidosService.postReadOrdersFile(uploadedFile);

      if (response) {
        toast.success("Archivo de pedidos procesado correctamente");
        onClose();
        resetForm();
      } else {
        throw new Error("Error al procesar el archivo");
      }
    } catch (error) {
      console.error("Error al subir archivo:", error);
      toast.error(`Error al procesar el archivo: ${(error as Error).message}`);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Registro de pedido fallido:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: "",
      volumen: 0,
      posicionX: 0,
      posicionY: 0,
      tiempoEspera: 4,
      año: anio,
      mes: mes,
      dia: day,
      hora: hour,
      minuto: minute,
    });
    setSelectedDate(new Date(anio, mes - 1, day, hour, minute));
    setUploadedFile(null);
    setFileValidationStatus("idle");
    setValidationProgress(0);
    setValidationErrors([]);
    //setActiveTab("manual");
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [fechaSimulacion, isOpen, anio, mes, day, hour, minute]);

  const handleInputChange = (field: keyof PedidoFormData, value: string | number | boolean) => {
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
          <DialogTitle className="text-xl font-semibold">Gestión de Pedidos</DialogTitle>
        </DialogHeader>

        {/* Tabs para seleccionar entre manual y archivo */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "manual"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Pedido Manual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "file"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Subir Archivo
          </button>
        </div>

        {/* Contenido del Tab Manual */}
        {activeTab === "manual" && (
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
                      placeholder="6"
                      type="number"
                      step="1"
                      min="1"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        )}

        {/* Contenido del Tab Archivo */}
        {activeTab === "file" && (
          <div className="space-y-6">
            <Card className="border-2 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Upload className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-blue-900">
                      Subir Archivo de Pedidos
                    </CardTitle>
                    <p className="text-sm text-blue-700">
                      Sube un archivo .txt con múltiples pedidos para procesamiento masivo
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Archivo de Pedidos</h3>
                    <p className="text-sm text-gray-600">
                      Formato recomendado: ventasYYYYMM.txt o pedidosYYYYMM.txt
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      id="file-orders"
                      type="file"
                      accept=".txt"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("file-orders")?.click()}
                      className="w-full bg-white hover:bg-gray-50 h-12"
                      disabled={isUploadingFile}
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Seleccionar archivo de pedidos
                    </Button>
                  </div>

                  {uploadedFile && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border bg-white p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div>
                            <span className="text-sm font-medium">{uploadedFile.name}</span>
                            <p className="text-xs text-gray-500">
                              {Math.round(uploadedFile.size / 1024)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setUploadedFile(null);
                            setFileValidationStatus("idle");
                            setValidationProgress(0);
                            setValidationErrors([]);
                          }}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Estado de validación */}
                      {fileValidationStatus === "validating" && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Validando archivo...
                          </div>
                          <Progress value={validationProgress} className="h-2" />
                        </div>
                      )}

                      {fileValidationStatus === "valid" && (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                          <CheckCircle className="h-4 w-4" />
                          Archivo válido y listo para procesar
                        </div>
                      )}

                      {fileValidationStatus === "invalid" && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                            <AlertTriangle className="h-4 w-4" />
                            Errores en el archivo:
                          </div>
                          <ul className="text-sm text-red-600 bg-red-50 p-3 rounded-lg ml-4">
                            {validationErrors.map((error, index) => (
                              <li key={index} className="list-disc list-inside">
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Botones de acción para archivo */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="px-6">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitFile}
                disabled={!uploadedFile || fileValidationStatus !== "valid" || isUploadingFile}
                className="px-6"
              >
                {isUploadingFile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando archivo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Procesar Archivo
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
