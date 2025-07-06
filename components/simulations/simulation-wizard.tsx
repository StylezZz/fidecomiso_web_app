"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux"
import { startSimulation } from "@/store/simulation/simulation-slice"
import { useToast } from "@/hooks/use-toast"
import { useMapContext } from "@/contexts/MapContext"
import {
  X,
  AlertTriangle,
  Upload,
  FileText,
  CheckCircle,
  Calendar,
  CalendarDays,
  AlertOctagon,
  Settings,
  Truck,
  Map,
  BarChart,
  FileUp,
  ArrowRight,
  Cog,
  Paperclip,
  Database,
} from "lucide-react"
import { obtenerAnioArchPedido, obtenerAnioDesdeNombre, obtenerMesArchPedido, obtenerMesDesdeNombre, readFileBloqueos, readFilePedidos } from "@/utils/readFiles"
import { Pedido } from "@/interfaces/order/pedido.interface"
import SimulationService from "@/services/simulation.service"
import { SimulationInterface, SimulationType } from "@/interfaces/simulation.interface"
import { RadioGroup } from "../ui/radio-group"
import { Dropdown } from "react-day-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Label } from "../ui/label"
import { useSimulationContext } from "@/contexts/simulationContext"
import {formatearNombreArchivoPedido, formatearNombreBloqueos } from "@/utils/fetchTransform"
import PedidosService from "@/services/pedidos.service"
import BlockService from "@/services/block.service"

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
})

type FormValues = z.infer<typeof formSchema>

type SimulationWizardProps = {
  onClose: () => void
}

export function SimulationWizard({ onClose }: SimulationWizardProps) {

  const { toast } = useToast()
  const {setPedidos,getVehiculesRoutesFlow} = useMapContext();
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFilePedido, setUploadedFilePedido] = useState<File | null>(null)
  const [uploadedFileBloqueo, setUploadedFileBloqueo] = useState<File | null>(null)

  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileValidationStatus, setFileValidationStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle")
  const [validationProgress, setValidationProgress] = useState(0)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null);


  //useState para el seguimiento de iniciar simulacion
  const {obtenerArchivosBloqueos,obtenerArchivosPedidos, saveSimulacion} = useSimulationContext();
  const [simulationType,setSimulationType] = useState<SimulationType>();
  const [hasPreviousData,setHasPreviousData] = useState<"has"|"hasnt">();
  const [pedidosArch,setPedidosArch] = useState<string[]>([]);
  const [bloqueosArch,setBloqueosArch] = useState<string[]>([]);
  const [loadingArch,setLoadingArc] = useState<boolean>(false);
  const [namePedido,setNamePedido] = useState<string>("");
  const [nameBloqueo,setNameBloqueo] = useState<string>("");
  const [fecha,setFecha] = useState<{anio:string,mes:string,dia:string}>({anio:"",dia:"",mes:""});
  const [hora,setHora] = useState<{hora:string,minuto:string}>({hora:"",minuto:""});
  const [loadingBloqueoPedidos,setLoadingBloqueoPedidos] = useState<boolean>(false);
  const [creandoSimulacion,setCreandoSimulacion] = useState<boolean>(false);
  const [errorSimulacion,setErrorSimulacion] = useState<boolean>(false);
  const [errorMsg,setErroMsg] = useState<string>("");
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
  ]



  const obtuvoArch = useRef<boolean>(false);
  useEffect(()=>{
    console.log(pedidosArch,bloqueosArch,hasPreviousData);
    if(hasPreviousData === "has" && !obtuvoArch.current){
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
  },[hasPreviousData])


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
    validateFile(content, file, uploadedFileBloqueo, await readFileText(uploadedFileBloqueo!));
  };

  const handleFileUploadBloqueos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.toLowerCase().includes("bloqueos") || !file.name.endsWith(".txt")) {
      alert("Debes subir un archivo de bloqueos en formato .txt que contenga 'bloqueos' en el nombre");
      return;
    }
    setUploadedFileBloqueo(file)
    const content = await readFileText(file);
    validateFile(uploadedFilePedido && await readFileText(uploadedFilePedido), uploadedFilePedido!, content, file);
  };
  
  const getDiasSimulacion = (tipo:SimulationType,dayInit:number): number[] =>{
    switch(tipo){
      case SimulationType.COLAPSO:
        return [];
      case SimulationType.SEMANAL:
        return [dayInit,dayInit+1,dayInit+2,dayInit+3,dayInit+4,dayInit+5,dayInit+6];
      case SimulationType.DIA_DIA:
        return [dayInit]
    }
  }


  const generarSimulacion = async () =>{
    //verificamos si debemos crear algo en bd
      nextStep();
      setIsSubmitting(true);
      setErrorSimulacion(false);
      try{
        if(hasPreviousData=="hasnt"){
          setLoadingBloqueoPedidos(true);
          if(!uploadedFileBloqueo){
            throw new Error("Existieron problemas con los archivos bloqueos, vuelva a intentarlo");
          }
          if(!uploadedFilePedido){
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
        const dias : number[] = getDiasSimulacion(simulationType!,Number(fecha.dia));
        //await new Promise((resolve) => setTimeout(resolve, 3000));
        if(dias.length >=0){
            responsePedidos = await PedidosService.getOrders(dias,Number(fecha.anio),Number(fecha.mes));
            lengthPedidos =responsePedidos.data.pedidos.length;
        } 
          

        console.log("se crea simulacion y el pedido",namePedido);
        const newSimulation : SimulationInterface ={
          tipo: simulationType!,
          fechaInicial: fecha.anio+"/"+fecha.mes+"/"+fecha.dia,
          hora:hora.hora+":"+hora.minuto,
          mesPedido:obtenerMesArchPedido(namePedido) ?? 0,
          anioPedido:obtenerAnioArchPedido(namePedido) ?? 0,
          mesBloqueo:obtenerMesDesdeNombre(nameBloqueo)?? 0,
          anioBloqueo:obtenerAnioDesdeNombre(nameBloqueo) ?? 0 ,
          anio: Number(fecha.anio) ?? 0,
          mes: Number(fecha.mes) ?? 0,
          dia: Number(fecha.dia) ?? 0,
          ihora: Number(hora.hora) ?? 0,
          iminuto: Number(hora.minuto) ?? 0,
          active:false,
          pedidosNum:lengthPedidos  // en caso sea -1,  se coloca No definido
        }
        saveSimulacion(newSimulation);
        setCreandoSimulacion(false);
        }
      catch(error){
        setErrorSimulacion(true);
        setErroMsg((error as Error).message)
      }
      finally{
        setIsSubmitting(false);
      }
  }


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
      await new Promise(resolve => setTimeout(resolve, 500));
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
        throw new Error("El nombre del archivo de pedidos no contiene una fecha válida en formato ventasYYYYMM.txt");
      }

      const anioPedido = parseInt(match[1]);
      const mesPedido = parseInt(match[2]);

      setNamePedido(filePedidos.name);
      setNameBloqueo(fileBloqueo.name);
      const anioBloqueo = anioPedido;
      const mesBloqueo = mesPedido;

      console.log("se obtiene",fileBloqueo.name,filePedidos.name);
      setFileValidationStatus("valid");
    } catch (error) {
      setValidationErrors(["Error en el archivo de pedidos o bloqueos"]);
      setFileValidationStatus("invalid");
    }
  };

  
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }


  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <Settings className="h-5 w-5" />
      case 2:
        return <FileUp className="h-5 w-5" />
      case 3:
        return <CheckCircle className="h-5 w-5"/>
      default:
        return <Calendar className="h-5 w-5" />
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return "Tipo de Simulación"
      case 2:
        return "Datos y Opciones"
      case 3:
        return "Confirmación"
      default:
        return "Paso"
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card
                className={`cursor-pointer transition-all ${simulationType === SimulationType.DIA_DIA ? "ring-2 ring-primary" : "hover:bg-accent"}`}
                onClick={() => setSimulationType(SimulationType.DIA_DIA)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Operación Día a Día
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Realiza operaciones en tiempo real representando el funcionamiento diario del sistema.
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${simulationType === SimulationType.SEMANAL ? "ring-2 ring-primary" : "hover:bg-accent"}`}
                onClick={() => setSimulationType(SimulationType.SEMANAL)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5" />
                    Simulación Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Simula operaciones durante una semana</p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${simulationType === SimulationType.COLAPSO ? "ring-2 ring-primary" : "hover:bg-accent"}`}
                onClick={() => setSimulationType(SimulationType.COLAPSO)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5" />
                    Simulación Colapso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Simula operaciones hasta llegar al colpaso</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )
  
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex gap-4 items-center bg-gray">
              <Calendar className="w-5 h-5" />
              <div>
                  <h3 className="text-lg font-semibold text-gray-900">Fecha de simulación</h3>
                  <p className="text-sm text-gray-600">Establece cuándo se ejecutará la simulación</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-[30%]">
              <Label className="font-bold text-sm">Año</Label>
              <Input type="number" value={fecha.anio} placeholder="2025" onChange={ e=> setFecha((p) =>({...p,anio: (e.target.value)})  ) } />
              </div>
              <div className="w-[30%]">
              <Label className="font-bold text-sm">Mes</Label>
              <Select 
              value={fecha.mes}
              onValueChange={value=> setFecha((p)=> ({...p,mes:value}))}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccionar mes" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                        {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
              <div className="w-[30%]">
              <Label className="font-bold text-sm">Día</Label>
              <Input type="number" value={fecha.dia} min={0} max={31} placeholder="01" onChange={ e=> setFecha((p) =>({...p,dia: (e.target.value)})  ) }/>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-[50%]">
                <Label className="font-bold text-sm">Hora</Label>
                <Input type="number" min={0} max={24} value={hora.hora} placeholder="00"onChange={ e=> setHora((p) =>({...p,hora: (e.target.value)})  ) } />
              </div>
              <div className="w-[50%]">
                <Label className="font-bold text-sm">Minuto</Label>
                <Input type="number" min={0} max={60} value={hora.minuto} placeholder="00" onChange={ e=> setHora((p) =>({...p,minuto: (e.target.value)})  ) }/>
              </div>
            </div>
            <hr />
            <div className="flex gap-4 items-center bg-gray">
              <FileText className="w-5 h-5" />
              <div>
                  <h3 className="text-lg font-semibold text-gray-900">Origen de datos</h3>
                  <p className="text-sm text-gray-600">Selecciona cómo proporcionar los datos para la simulación</p>
              </div>
            </div>
            <Card className={`cursor-pointer transition-all ${hasPreviousData == "hasnt" ? "ring-2 ring-primary" : "hover:bg-accent"}`}
                onClick={() => setHasPreviousData("hasnt")}>
              <CardContent className="pt-6 space-y-8">
                <div className="flex items-center space-x-2">
                  <Upload/>
                  <div>
                    <h4 className="font-medium">Subir nuevos archivos</h4>
                    <p className="text-sm text-muted-foreground">
                      Cargar archivos TXT con datos de pedidos y bloqueos
                    </p>
                  </div>
                </div>
                {
                  hasPreviousData === "hasnt" && (
                    <div className="flex flex-col items-center justify-center space-y-4 mt-6">
                      <div className="space-y-2 text-center">
                        <h3 className="text-lg font-medium">Archivo de Pedidos</h3>
                        <p className="text-sm text-muted-foreground">
                          Suba un archivo TXT con los datos de pedidos
                        </p>
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Input
                          id="file-pedidos"
                          type="file"
                          accept=".txt"
                          className="hidden"
                          onChange={handleFileUploadPedidos}
                        />
                        <Button type="button" variant="outline" onClick={() => document.getElementById("file-pedidos")?.click()}>
                          <Upload className="mr-2 h-4 w-4" /> Seleccionar archivo
                        </Button>
                      </div>

                      {uploadedFilePedido && (
                        <div className="w-full">
                          <div className="flex items-center justify-between rounded-md border p-2">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{uploadedFilePedido.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({Math.round(uploadedFilePedido.size / 1024)} KB)
                              </span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setUploadedFilePedido(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 text-center pt-6">
                        <h3 className="text-lg font-medium">Archivo de Bloqueos</h3>
                        <p className="text-sm text-muted-foreground">
                          Suba un archivo TXT con los datos de bloqueos
                        </p>
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Input
                          id="file-bloqueos"
                          type="file"
                          accept=".txt"
                          className="hidden"
                          onChange={handleFileUploadBloqueos}
                        />
                        <Button type="button" variant="outline" onClick={() => document.getElementById("file-bloqueos")?.click()}>
                          <Upload className="mr-2 h-4 w-4" /> Seleccionar archivo
                        </Button>
                      </div>

                      {uploadedFileBloqueo && (
                        <div className="w-full">
                          <div className="flex items-center justify-between rounded-md border p-2">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{uploadedFileBloqueo.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({Math.round(uploadedFileBloqueo.size / 1024)} KB)
                              </span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setUploadedFileBloqueo(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }

              </CardContent>
            </Card>
            <Card className={`cursor-pointer transition-all ${hasPreviousData == "has" ? "ring-2 ring-primary" : "hover:bg-accent"}`}
                onClick={() => {setHasPreviousData("has");console.log("Actualizo")}}>
              <CardContent className="pt-6 space-y-8">
                <div className="flex items-center space-x-2">
                  <Database/>
                  <div>
                    <h4 className="font-medium">Usar datos de pedidos y bloqueos existentes</h4>
                    <p className="text-sm text-muted-foreground">
                      Seleccione los archivos anteriormenete subidos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {
              hasPreviousData == "has" &&(
                <div className="space-y-4 mt-6">
                  <div className="space-y-2">
                  <Label>Archivos de pedidos</Label>
                  <Select
                  onValueChange={(value)=> {setNamePedido(value);console.log("se selecciona",value)}}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder= "Seleccione el archivo de pedidos" />
                    </SelectTrigger>
                    <SelectContent>
                      {
                          pedidosArch?.length >=0 &&
                          pedidosArch.map(pedName => (
                            <SelectItem key={pedName} value={pedName}>
                                {formatearNombreArchivoPedido(pedName)}
                            </SelectItem>
                          ))
                        }
                    </SelectContent>
                  </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Archivos de Bloqueos</Label>
                    <Select
                    onValueChange={value=> setNameBloqueo(value)}
                    >
                      <SelectTrigger>
                        <SelectValue  placeholder="Seleccione el archivo de bloqueos"/>
                      </SelectTrigger>
                      <SelectContent>
                        {bloqueosArch?.length>=0 &&
                          bloqueosArch.map(bloqName=>(
                            <SelectItem key={bloqName} value={bloqName}>
                              {formatearNombreBloqueos(bloqName)}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )
            }
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="rounded-md bg-blue-50 p-4 text-blue-700 space-y-2">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <h3 className="text-lg font-medium">Resumen de la Simulación</h3>
              </div>
              <hr/>
              <div className="mt-4 text-sm text-blue-800 space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold">Tipo:</span>
                  <span>
                    {simulationType}
                  </span>
                </div>
                <div className="flex justify-between flex-col">
                  <h1 className="font-bold">Archivos que utilizará</h1>
                  <div>Pedidos: {formatearNombreArchivoPedido(namePedido)}</div>
                  <div>Bloqueos: {formatearNombreBloqueos(nameBloqueo)}</div>
                </div>
              </div>
            </div>


            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-800">Política de Cero Incumplimientos</h4>
                    <p className="text-xs text-amber-700">
                      Todos los pedidos deben realizarse con un mínimo de 4 horas de antelación. Si un pedido no puede
                      ser atendido, se considerará un "colapso" de la operación.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" style={{ margin: 0, padding: 0 }}>
      <div className="max-w-4xl w-full mx-auto bg-background rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h2 className="text-xl font-semibold">Nueva Simulación</h2>
              <p className="text-sm text-muted-foreground">Configure los parámetros para la simulación</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 border-b">
            <div className="flex items-center">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      currentStep === step
                        ? "bg-primary text-primary-foreground"
                        : currentStep > step
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {getStepIcon(step)}
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      currentStep === step ? "font-medium text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {getStepTitle(step)}
                  </span>
                  {step < 3 && (
                    <div className="flex-1 mx-2">
                      <ArrowRight className="mx-auto h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
        
            <form id="simulation-form" className="space-y-6">
              {
                currentStep<=3 && !isSubmitting&& renderStepContent()
              }
              {
                currentStep==4 && loadingBloqueoPedidos&& !errorSimulacion && <LoadingPedidosBloqueos/>
              }
              {
                currentStep==4 && creandoSimulacion && !errorSimulacion &&<LoadingSimulacion/>
              }
              {
                currentStep ==4 && !isSubmitting && !errorSimulacion  && <SimulationReady/>
              }
              {currentStep==4 && errorSimulacion && <SimulationError msg={errorMsg} />}
            </form>
          </div>

          <div className="flex justify-between border-t p-4">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              Anterior
            </Button>
            <div>
              {currentStep <= 2 &&
                <Button onClick={nextStep}>Siguiente</Button>
              }

              {currentStep ==3 &&(
                <Button  onClick={()=>{generarSimulacion()}}>
                  Crear
                </Button>
              )}

              {currentStep == 4 && !isSubmitting && !errorSimulacion && (
                <Button onClick={onClose} className="bg-black text-white">
                  Aceptar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



const LoadingPedidosBloqueos =() =>{
  return(
  <div className="text-center space-y-4">
    <Upload className="w-12 h-12 mx-auto text-primary animate-pulse" />
    <h3 className="text-xl font-semibold">Registrando archivos...</h3>
    <p className="text-muted-foreground">Los nuevos archivos se están procesando y registrando en el sistema. Esto puede demorar</p>
    <div className="space-y-2 flex justify-center w-full gap-2">
    <div
      className="w-4 h-4 bg-black rounded-full animate-bounce"
      style={{ animationDelay: "0ms" }}
    ></div>
    <div
      className="w-4 h-4 bg-black rounded-full animate-bounce"
      style={{ animationDelay: "150ms" }}
    ></div>
    <div
      className="w-4 h-4 bg-black rounded-full animate-bounce"
      style={{ animationDelay: "300ms" }}></div>
    </div>
  </div>
  )
}
const LoadingSimulacion=()=>{
  return(

    <div className="text-center space-y-4">
    <Cog className="w-12 h-12 mx-auto text-primary animate-spin" />
    <h3 className="text-xl font-semibold">Generando Simulación</h3>
    <p className="text-muted-foreground">Los nuevos archivos se están procesando y registrando en el sistema</p>
    <div className="flex justify-center w-full gap-2">
    <div
      className="w-4 h-4 bg-black rounded-full animate-bounce"
      style={{ animationDelay: "0ms" }}
      ></div>
    <div
      className="w-4 h-4 bg-black rounded-full animate-bounce"
      style={{ animationDelay: "150ms" }}
      ></div>
    <div
      className="w-4 h-4 bg-black rounded-full animate-bounce"
      style={{ animationDelay: "300ms" }}></div>
    </div>
  </div>
  )
}

const SimulationReady = ()=>{
  return(
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600 animate-ping" />
      </div>
      <h3 className="text-xl font-semibold">¡Todo listo!</h3>
      <p className="text-muted-foreground">
        Los datos han sido cargados correctamente. La simulación está lista para iniciarse.
      </p>
    </div>
  )
}

const SimulationError =({msg}:{msg: string}) =>{
  return(
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-xl font-semibold text-red-600">Error al registrar archivos</h3>
      <p className="text-muted-foreground">Se ha producido un error durante el procesamiento de la simulacion.</p>
      <p className="text-muted-foreground">{msg}</p>

    </div>
  )
}