"use client";

import type React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  X,
  AlertTriangle,
  Upload,
  FileText,
  CheckCircle,
  Calendar,
  CalendarDays,
  Database,
  Zap,
  Clock,
  Target,
  ChevronRight,
  ChevronLeft,
  Play,
  Loader2,
  MapPin,
} from "lucide-react";
import {
  obtenerAnioArchPedido,
  obtenerAnioDesdeNombre,
  obtenerMesArchPedido,
  obtenerMesDesdeNombre,
} from "@/utils/readFiles";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Label } from "../ui/label";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import BlockService from "@/services/blockages.service";
import PedidosService from "@/services/orders.service";
import { useSimulationContext } from "@/contexts/ContextSimulation";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SimulationInterface, SimulationType } from "@/interfaces/simulation.interface";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type SimulationSetupProps = {
  onClose: () => void;
};

export function SimulationSetup({ onClose }: SimulationSetupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFilePedido, setUploadedFilePedido] = useState<File | null>(null);
  const [uploadedFileBloqueo, setUploadedFileBloqueo] = useState<File | null>(null);

  const [fileValidationStatus, setFileValidationStatus] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle");
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  //useState para el seguimiento de iniciar simulacion
  const { obtenerArchivosBloqueos, obtenerArchivosPedidos, saveSimulacion } =
    useSimulationContext();
  const [simulationType, setSimulationType] = useState<SimulationType>();
  const [hasPreviousData, setHasPreviousData] = useState<"has" | "hasnt">();
  const [pedidosArch, setPedidosArch] = useState<string[]>([]);
  const [bloqueosArch, setBloqueosArch] = useState<string[]>([]);
  const [loadingArch, setLoadingArc] = useState<boolean>(false);
  const [namePedido, setNamePedido] = useState<string>("");
  const [nameBloqueo, setNameBloqueo] = useState<string>("");

  // Nuevos estados para fecha y hora usando Date
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("00:00");

  // Estados legacy para mantener compatibilidad con la lógica existente
  const [fecha, setFecha] = useState<{ anio: string; mes: string; dia: string }>({
    anio: "",
    dia: "",
    mes: "",
  });
  const [hora, setHora] = useState<{ hora: string; minuto: string }>({ hora: "", minuto: "" });

  const [loadingBloqueoPedidos, setLoadingBloqueoPedidos] = useState<boolean>(false);
  const [creandoSimulacion, setCreandoSimulacion] = useState<boolean>(false);
  const [errorSimulacion, setErrorSimulacion] = useState<boolean>(false);
  const [errorMsg, setErroMsg] = useState<string>("");

  // Función para establecer fecha y hora actual
  const setCurrentDateTime = () => {
    const now = new Date();
    setSelectedDate(now);

    // Formatear hora actual a HH:MM
    const currentHours = now.getHours().toString().padStart(2, "0");
    const currentMinutes = now.getMinutes().toString().padStart(2, "0");
    setSelectedTime(`${currentHours}:${currentMinutes}`);
  };

  // Efecto para establecer fecha y hora automáticamente cuando se selecciona DIA_DIA
  useEffect(() => {
    if (simulationType === SimulationType.DIA_DIA) {
      setCurrentDateTime();
    }
  }, [simulationType]);

  // Efecto para sincronizar la fecha seleccionada con los estados legacy
  useEffect(() => {
    if (selectedDate) {
      const year = selectedDate.getFullYear().toString();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
      const day = selectedDate.getDate().toString().padStart(2, "0");

      setFecha({
        anio: year,
        mes: month,
        dia: day,
      });
    }
  }, [selectedDate]);

  // Efecto para sincronizar la hora seleccionada con los estados legacy
  useEffect(() => {
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(":");
      setHora({
        hora: hours,
        minuto: minutes,
      });
    }
  }, [selectedTime]);

  const obtuvoArch = useRef<boolean>(false);
  useEffect(() => {
    console.log(pedidosArch, bloqueosArch, hasPreviousData);
    if (hasPreviousData === "has" && !obtuvoArch.current) {
      const cargarArchivos = async () => {
        console.log("Entre archivos");
        setLoadingArc(true);
        const pedidosNombres = await obtenerArchivosPedidos();
        const bloqueosNombres = await obtenerArchivosBloqueos();
        setPedidosArch(pedidosNombres);
        setBloqueosArch(bloqueosNombres);
        console.log(bloqueosNombres);
        setLoadingArc(false);
        obtuvoArch.current = true;
      };
      cargarArchivos();
    }
    console.log("entra");
  }, [hasPreviousData]);

  const readFileText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFileUploadPedidos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.toLowerCase().includes("ventas") || !file.name.endsWith(".txt")) {
      alert("Debes subir un archivo de pedidos en formato .txt que contenga 'ventas' en el nombre");
      return;
    }
    setUploadedFilePedido(file);
    const content = await readFileText(file);
    if (uploadedFileBloqueo) {
      const bloqueoContent = await readFileText(uploadedFileBloqueo);
      validateFile(content, file, bloqueoContent, uploadedFileBloqueo);
    }
  };

  const handleFileUploadBloqueos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.toLowerCase().includes("bloqueos") || !file.name.endsWith(".txt")) {
      alert(
        "Debes subir un archivo de bloqueos en formato .txt que contenga 'bloqueos' en el nombre"
      );
      return;
    }
    setUploadedFileBloqueo(file);
    const content = await readFileText(file);
    if (uploadedFilePedido) {
      const pedidoContent = await readFileText(uploadedFilePedido);
      validateFile(pedidoContent, uploadedFilePedido, content, file);
    }
  };

  const getDiasSimulacion = (tipo: SimulationType, dayInit: number): number[] => {
    switch (tipo) {
      case SimulationType.COLAPSO:
        return [];
      case SimulationType.SEMANAL:
        return [
          dayInit,
          dayInit + 1,
          dayInit + 2,
          dayInit + 3,
          dayInit + 4,
          dayInit + 5,
          dayInit + 6,
        ];
      case SimulationType.DIA_DIA:
        return [dayInit];
    }
  };

  const generarSimulacion = async () => {
    nextStep();
    setIsSubmitting(true);
    setErrorSimulacion(false);
    try {
      if (hasPreviousData == "hasnt") {
        setLoadingBloqueoPedidos(true);
        if (!uploadedFileBloqueo) {
          throw new Error("Existieron problemas con los archivos bloqueos, vuelva a intentarlo");
        }
        if (!uploadedFilePedido) {
          throw new Error("Existieron problemas con los archivos pedidos, vuelva a intentarlo");
        }
        console.log(uploadedFileBloqueo);
        console.log(uploadedFilePedido);
        await PedidosService.postReadOrdersFile(uploadedFilePedido!);
        await BlockService.postReadBlocksFile(uploadedFileBloqueo!);
        setLoadingBloqueoPedidos(false);
      }
      setCreandoSimulacion(true);
      let responsePedidos;
      let lengthPedidos = -1;
      const dias: number[] = getDiasSimulacion(simulationType!, Number(fecha.dia));
      if (dias.length >= 0) {
        responsePedidos = await PedidosService.getOrders(
          dias,
          Number(fecha.anio),
          Number(fecha.mes)
        );
        lengthPedidos = responsePedidos.data.pedidos.length;
      }

      const newSimulation: SimulationInterface = {
        tipo: simulationType!,
        fechaInicial: fecha.anio + "/" + fecha.mes + "/" + fecha.dia,
        hora: hora.hora + ":" + hora.minuto,
        // mesPedido: obtenerMesArchPedido(namePedido) ?? 0,
        // anioPedido: obtenerAnioArchPedido(namePedido) ?? 0,
        // mesBloqueo: obtenerMesDesdeNombre(nameBloqueo) ?? 0,
        // anioBloqueo: obtenerAnioDesdeNombre(nameBloqueo) ?? 0,
        mesPedido: 0,
        anioPedido: 0,
        mesBloqueo: 0,
        anioBloqueo: 0,
        anio: Number(fecha.anio) ?? 0,
        mes: Number(fecha.mes) ?? 0,
        dia: Number(fecha.dia) ?? 0,
        ihora: Number(hora.hora) ?? 0,
        iminuto: Number(hora.minuto) ?? 0,
        active: false,
        pedidosNum: lengthPedidos, // si es -1 se pone No definido
      };
      console.log(JSON.stringify(newSimulation, null, 2));

      saveSimulacion(newSimulation);
      setCreandoSimulacion(false);
    } catch (error) {
      setErrorSimulacion(true);
      setErroMsg((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateFile = async (
    contentPedido?: string,
    filePedidos?: File,
    contentBloqueo?: string,
    fileBloqueo?: File
  ) => {
    if (!contentPedido || !filePedidos || !contentBloqueo || !fileBloqueo) return;

    setFileValidationStatus("validating");
    setValidationProgress(0);
    setValidationErrors([]);

    const totalSteps = 5;
    for (let i = 1; i <= totalSteps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setValidationProgress((i / totalSteps) * 100);
    }

    try {
      //Extraer datos desde el nombre del archivo de pedidos
      const nombreArchivoPedido = filePedidos.name;
      const regexFecha = /ventas(\d{4})(\d{2})/;
      const match = nombreArchivoPedido.match(regexFecha);
      if (!match) {
        throw new Error(
          "El nombre del archivo de pedidos no contiene una fecha válida en formato ventasYYYYMM.txt"
        );
      }
      setNamePedido(filePedidos.name);
      setNameBloqueo(fileBloqueo.name);

      console.log("se obtiene", fileBloqueo.name, filePedidos.name);
      setFileValidationStatus("valid");
    } catch (error) {
      setValidationErrors(["Error en el archivo de pedidos o bloqueos"]);
      setFileValidationStatus("invalid");
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return "Tipo de Simulación";
      case 2:
        return "Configuración";
      case 3:
        return "Confirmación";
      default:
        return "Paso";
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Selecciona el tipo de simulación
              </h3>
              <p className="text-gray-600">
                Elige la modalidad que mejor se adapte a tus necesidades
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  simulationType === SimulationType.DIA_DIA
                    ? "ring-2 ring-blue-500 bg-blue-50/50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSimulationType(SimulationType.DIA_DIA)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className={`p-3 rounded-xl ${
                        simulationType === SimulationType.DIA_DIA ? "bg-blue-500" : "bg-blue-100"
                      }`}
                    >
                      <Clock
                        className={`h-6 w-6 ${
                          simulationType === SimulationType.DIA_DIA ? "text-white" : "text-blue-600"
                        }`}
                      />
                    </div>
                  </div>
                  <CardTitle className="text-lg text-center">Operación Día a Día</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Realiza operaciones en tiempo real representando el funcionamiento diario del
                    sistema.
                  </p>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">Tiempo Real</Badge>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  simulationType === SimulationType.SEMANAL
                    ? "ring-2 ring-green-500 bg-green-50/50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSimulationType(SimulationType.SEMANAL)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className={`p-3 rounded-xl ${
                        simulationType === SimulationType.SEMANAL ? "bg-green-500" : "bg-green-100"
                      }`}
                    >
                      <CalendarDays
                        className={`h-6 w-6 ${
                          simulationType === SimulationType.SEMANAL
                            ? "text-white"
                            : "text-green-600"
                        }`}
                      />
                    </div>
                  </div>
                  <CardTitle className="text-lg text-center">Simulación Semanal</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Simula operaciones durante una semana completa (168 horas).
                  </p>
                  <Badge className="bg-green-50 text-green-700 border-green-200">Proyección</Badge>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  simulationType === SimulationType.COLAPSO
                    ? "ring-2 ring-red-500 bg-red-50/50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSimulationType(SimulationType.COLAPSO)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className={`p-3 rounded-xl ${
                        simulationType === SimulationType.COLAPSO ? "bg-red-500" : "bg-red-100"
                      }`}
                    >
                      <AlertTriangle
                        className={`h-6 w-6 ${
                          simulationType === SimulationType.COLAPSO ? "text-white" : "text-red-600"
                        }`}
                      />
                    </div>
                  </div>
                  <CardTitle className="text-lg text-center">Simulación Colapso</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Simula operaciones hasta llegar al colapso del sistema.
                  </p>
                  <Badge className="bg-red-50 text-red-700 border-red-200">Límites</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* Fecha y Hora */}
            <Card className="border-2 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-blue-900">Fecha y Hora de Inicio</CardTitle>
                    <CardDescription className="text-blue-700">
                      {simulationType === SimulationType.DIA_DIA
                        ? "Fecha y hora establecidas automáticamente para tiempo real"
                        : "Establece cuándo se ejecutará la simulación"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Selector de Fecha */}
                  <div className="space-y-3">
                    <Label className="font-semibold text-sm text-gray-700">Fecha de Inicio</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={simulationType === SimulationType.DIA_DIA}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground",
                            simulationType === SimulationType.DIA_DIA &&
                              "bg-blue-50 border-blue-200"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? (
                            format(selectedDate, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    {simulationType === SimulationType.DIA_DIA && (
                      <p className="text-xs text-blue-600">
                        ⚡ Fecha actual establecida automáticamente
                      </p>
                    )}
                  </div>

                  {/* Selector de Hora */}
                  <div className="space-y-3">
                    <Label className="font-semibold text-sm text-gray-700">Hora de Inicio</Label>
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      disabled={simulationType === SimulationType.DIA_DIA}
                      className={cn(
                        "w-full",
                        simulationType === SimulationType.DIA_DIA && "bg-blue-50 border-blue-200"
                      )}
                    />
                    {simulationType === SimulationType.DIA_DIA && (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-blue-600">
                          ⚡ Hora actual establecida automáticamente
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={setCurrentDateTime}
                          className="text-xs text-blue-600 hover:text-blue-800 p-1 h-auto"
                        >
                          Actualizar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información adicional */}
                {selectedDate && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Clock className="h-4 w-4" />
                      <span>
                        La simulación comenzará el{" "}
                        {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })} a las{" "}
                        {selectedTime}
                        {simulationType === SimulationType.DIA_DIA && " (tiempo real)"}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Confirmar Configuración</h3>
              <p className="text-gray-600">Revisa los detalles antes de crear la simulación</p>
            </div>

            <div className="grid gap-6">
              {/* Resumen de configuración */}
              <Card className="border-2 border-green-100">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="text-lg text-green-900">Resumen de la Simulación</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Tipo de Simulación</p>
                          <p className="font-semibold text-gray-900">{simulationType}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Fecha de Inicio</p>
                          <p className="font-semibold text-gray-900">
                            {selectedDate
                              ? format(selectedDate, "dd/MM/yyyy", { locale: es })
                              : "No seleccionada"}{" "}
                            {selectedTime}
                            {simulationType === SimulationType.DIA_DIA && (
                              <span className="text-blue-600 text-sm ml-1">(tiempo real)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estados de carga */}
              {loadingBloqueoPedidos && <LoadingPedidosBloqueos />}
              {creandoSimulacion && <LoadingSimulacion />}
              {errorSimulacion && <SimulationError msg={errorMsg} />}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="border-2 border-blue-200 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Nueva Simulación</h2>
            <p className="text-sm text-gray-600">Configura tu simulación de distribución GLP</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Paso {currentStep} de 3</span>
          <span className="text-sm text-gray-500">{getStepTitle(currentStep)}</span>
        </div>
        <Progress value={(currentStep / 3) * 100} className="h-2" />
      </div>

      {/* Content */}
      <div className="p-6">{renderStepContent()}</div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t bg-gray-50">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-3">
          {currentStep === 3 ? (
            <Button
              onClick={generarSimulacion}
              disabled={isSubmitting}
              className="bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando Simulación...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Crear Simulación
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!simulationType || (currentStep === 2 && !selectedDate)}
              className="bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700"
            >
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

const LoadingPedidosBloqueos = () => {
  return (
    <Card className="border-2 border-blue-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-gray-600">Procesando archivos de pedidos y bloqueos...</span>
        </div>
      </CardContent>
    </Card>
  );
};

const LoadingSimulacion = () => {
  return (
    <Card className="border-2 border-green-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-green-500" />
          <span className="text-gray-600">Creando simulación...</span>
        </div>
      </CardContent>
    </Card>
  );
};

const SimulationError = ({ msg }: { msg: string }) => {
  return (
    <Card className="border-2 border-red-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-center space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <span className="text-red-600">{msg}</span>
        </div>
      </CardContent>
    </Card>
  );
};
