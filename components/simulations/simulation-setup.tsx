"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  X,
  AlertTriangle,
  Upload,
  FileText,
  CheckCircle,
  Calendar,
  CalendarDays,
  Settings,
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
  readFileBloqueos,
  readFilePedidos,
} from "@/utils/readFiles";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Label } from "../ui/label";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import BlockService from "@/services/block.service";
import PedidosService from "@/services/pedidos.service";
import { useSimulationContext } from "@/contexts/SimulationContext";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SimulationInterface, SimulationType } from "@/interfaces/simulation.interface";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const formSchema = z.object({
  type: z.string(),
  algorithm: z.string(),
  maxDays: z.number().min(1).max(30),
  orderGenerationRate: z.number().min(1).max(50),
  truckBreakdownProbability: z.number().min(0).max(100),
  minOrderSize: z.number().min(1).max(25),
  maxOrderSize: z.number().min(1).max(25),
  minDeadlineHours: z.number().min(4).max(48),
  maxDeadlineHours: z.number().min(4).max(48),
  excludedTrucks: z.array(z.string()).optional(),
  useDataFile: z.boolean().default(false),
  showRealTimeMap: z.boolean().default(true),
  generateDetailedReports: z.boolean().default(true),
});

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const months = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

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
        //subimos el contenido
        setLoadingBloqueoPedidos(false);
      }
      setCreandoSimulacion(true);
      let responsePedidos;
      let lengthPedidos = -1;
      const dias: number[] = getDiasSimulacion(simulationType!, Number(fecha.dia));
      //await new Promise((resolve) => setTimeout(resolve, 3000));
      if (dias.length >= 0) {
        responsePedidos = await PedidosService.getOrders(
          dias,
          Number(fecha.anio),
          Number(fecha.mes)
        );
        lengthPedidos = responsePedidos.data.pedidos.length;
      }

      console.log("se crea simulacion y el pedido", namePedido);
      const newSimulation: SimulationInterface = {
        tipo: simulationType!,
        fechaInicial: fecha.anio + "/" + fecha.mes + "/" + fecha.dia,
        hora: hora.hora + ":" + hora.minuto,
        mesPedido: obtenerMesArchPedido(namePedido) ?? 0,
        anioPedido: obtenerAnioArchPedido(namePedido) ?? 0,
        mesBloqueo: obtenerMesDesdeNombre(nameBloqueo) ?? 0,
        anioBloqueo: obtenerAnioDesdeNombre(nameBloqueo) ?? 0,
        anio: Number(fecha.anio) ?? 0,
        mes: Number(fecha.mes) ?? 0,
        dia: Number(fecha.dia) ?? 0,
        ihora: Number(hora.hora) ?? 0,
        iminuto: Number(hora.minuto) ?? 0,
        active: false,
        pedidosNum: lengthPedidos, // en caso sea -1,  se coloca No definido
      };
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
      const pedidos = readFilePedidos(contentPedido);
      const bloqueos = readFileBloqueos(contentBloqueo);
      //await getVehiculesRoutesFlow(pedidos, filePedidos, bloqueos, fileBloqueo);

      //Extraer datos desde el nombre del archivo de pedidos
      const nombreArchivoPedido = filePedidos.name;
      const regexFecha = /ventas(\d{4})(\d{2})/;
      const match = nombreArchivoPedido.match(regexFecha);
      if (!match) {
        throw new Error(
          "El nombre del archivo de pedidos no contiene una fecha válida en formato ventasYYYYMM.txt"
        );
      }

      const anioPedido = parseInt(match[1]);
      const mesPedido = parseInt(match[2]);

      setNamePedido(filePedidos.name);
      setNameBloqueo(fileBloqueo.name);
      const anioBloqueo = anioPedido;
      const mesBloqueo = mesPedido;

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

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <Target className="h-5 w-5" />;
      case 2:
        return <Settings className="h-5 w-5" />;
      case 3:
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
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
                      Establece cuándo se ejecutará la simulación
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
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
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
                  </div>

                  {/* Selector de Hora */}
                  <div className="space-y-3">
                    <Label className="font-semibold text-sm text-gray-700">Hora de Inicio</Label>
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full"
                    />
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
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Origen de Datos - Mejorado */}
            <Card className="border-2 border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Database className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-purple-900">Datos de Simulación</CardTitle>
                    <CardDescription className="text-purple-700">
                      Selecciona cómo proporcionar los datos para la simulación
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Opciones de origen de datos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      hasPreviousData === "hasnt"
                        ? "ring-2 ring-purple-500 bg-purple-50/50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setHasPreviousData("hasnt")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            hasPreviousData === "hasnt" ? "bg-purple-500" : "bg-purple-100"
                          }`}
                        >
                          <Upload
                            className={`h-5 w-5 ${
                              hasPreviousData === "hasnt" ? "text-white" : "text-purple-600"
                            }`}
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Subir archivos nuevos</h4>
                          <p className="text-sm text-gray-600">
                            Cargar archivos TXT con datos de pedidos y bloqueos
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      hasPreviousData === "has"
                        ? "ring-2 ring-purple-500 bg-purple-50/50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setHasPreviousData("has")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            hasPreviousData === "has" ? "bg-purple-500" : "bg-purple-100"
                          }`}
                        >
                          <FileText
                            className={`h-5 w-5 ${
                              hasPreviousData === "has" ? "text-white" : "text-purple-600"
                            }`}
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Usar archivos existentes</h4>
                          <p className="text-sm text-gray-600">
                            Seleccionar archivos previamente cargados
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contenido específico según la opción seleccionada */}
                {hasPreviousData === "hasnt" && (
                  <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Archivos Requeridos
                      </h3>
                      <p className="text-sm text-gray-600">
                        Sube los archivos necesarios para la simulación
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Archivo de Pedidos */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Archivo de Pedidos</h4>
                            <p className="text-xs text-gray-600">Formato: ventasYYYYMM.txt</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Input
                            id="file-pedidos"
                            type="file"
                            accept=".txt"
                            className="hidden"
                            onChange={handleFileUploadPedidos}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("file-pedidos")?.click()}
                            className="w-full bg-white hover:bg-gray-50"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Seleccionar archivo
                          </Button>
                        </div>

                        {uploadedFilePedido && (
                          <div className="flex items-center justify-between rounded-lg border bg-white p-3">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">{uploadedFilePedido.name}</span>
                              <span className="text-xs text-gray-500">
                                ({Math.round(uploadedFilePedido.size / 1024)} KB)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setUploadedFilePedido(null)}
                              className="h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Archivo de Bloqueos */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <MapPin className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Archivo de Bloqueos</h4>
                            <p className="text-xs text-gray-600">Formato: bloqueosYYYYMM.txt</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Input
                            id="file-bloqueos"
                            type="file"
                            accept=".txt"
                            className="hidden"
                            onChange={handleFileUploadBloqueos}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("file-bloqueos")?.click()}
                            className="w-full bg-white hover:bg-gray-50"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Seleccionar archivo
                          </Button>
                        </div>

                        {uploadedFileBloqueo && (
                          <div className="flex items-center justify-between rounded-lg border bg-white p-3">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">
                                {uploadedFileBloqueo.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({Math.round(uploadedFileBloqueo.size / 1024)} KB)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setUploadedFileBloqueo(null)}
                              className="h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Selección de archivos existentes */}
                {hasPreviousData === "has" && (
                  <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Archivos Disponibles
                      </h3>
                      <p className="text-sm text-gray-600">
                        Selecciona los archivos que deseas usar
                      </p>
                    </div>

                    {loadingArch ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        <span className="ml-2 text-gray-600">Cargando archivos...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="font-semibold text-sm text-gray-700">
                            Archivo de Pedidos
                          </Label>
                          <Select value={namePedido} onValueChange={setNamePedido}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar archivo de pedidos" />
                            </SelectTrigger>
                            <SelectContent>
                              {pedidosArch.map((archivo) => (
                                <SelectItem key={archivo} value={archivo}>
                                  {archivo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label className="font-semibold text-sm text-gray-700">
                            Archivo de Bloqueos
                          </Label>
                          <Select value={nameBloqueo} onValueChange={setNameBloqueo}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar archivo de bloqueos" />
                            </SelectTrigger>
                            <SelectContent>
                              {bloqueosArch.map((archivo) => (
                                <SelectItem key={archivo} value={archivo}>
                                  {archivo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
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
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Database className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Origen de Datos</p>
                          <p className="font-semibold text-gray-900">
                            {hasPreviousData === "has" ? "Archivos existentes" : "Nuevos archivos"}
                          </p>
                        </div>
                      </div>

                      {hasPreviousData === "hasnt" && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <FileText className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Archivos Cargados</p>
                            <p className="font-semibold text-gray-900">
                              {uploadedFilePedido ? "✓ Pedidos" : "✗ Pedidos"},{" "}
                              {uploadedFileBloqueo ? "✓ Bloqueos" : "✗ Bloqueos"}
                            </p>
                          </div>
                        </div>
                      )}
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
