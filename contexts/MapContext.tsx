"use client";
import { Pedido } from "@/interfaces/order/pedido.interface";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import { Block } from "@/interfaces/map/block.interface";
import SimulationService from "@/services/simulation.service";
import { SimulationType } from "@/interfaces/simulation.interface";
import { useSimulationContext } from "@/contexts/SimulationContext";
import { PedidoI } from "@/interfaces/newinterfaces/pedido.interface";
import useRealTime, { RealTimeReturn } from "@/hooks/time/use-real-time";
import { BloqueoI } from "@/interfaces/newinterfaces/bloqueo.interface";
import { VehiculoI } from "@/interfaces/newinterfaces/vehiculos.interface";
import { manageTimeReturn, useManageTime } from "@/hooks/time/use-manage-time";
import { CamionConRuta, CamionConRutas, TipoCamion } from "@/interfaces/map/Truck.interface";
import useSimulationTime, { SimulationTimeReturn } from "@/hooks/time/use-simulation-time";

interface legendSummary {
  activosTA?: number;
  activosTB?: number;
  activosTC?: number;
  activosTD?: number;
  numPedidos?: number;
}

interface MapData {
  mapHeight: number;
  mapWidth: number;
  cellSizeXValue: number;
  cellSizeYValue: number;
  maxXAxios: number;
  maxYAxios: number;
  loading: boolean;
}

interface MapContextType {
  mapData: MapData;
  setDimensions: (width: number, height: number) => void;
  getVehiculesRoutesFlow: (
    pedidos: Pedido[],
    filePedidos: File,
    bloqueados: Block[],
    fileBloqueos: File
  ) => Promise<void>;
  vehiculesRoutes: CamionConRutas[]; // Reemplaza any[] por la interfaz específica si la tienes
  loadingVehiculesRoutes: boolean;
  errorVehiculesRoutes: boolean;
  pedidos: Pedido[];
  setPedidos: Dispatch<SetStateAction<Pedido[]>>;
  bloqueos: Block[];
  legendSummary: legendSummary;
  setLegendSummary: React.Dispatch<React.SetStateAction<legendSummary>>;
  manageTime: manageTimeReturn;
  simulationTime: SimulationTimeReturn;
  realTime: RealTimeReturn;
  pedidosI: PedidoI[];
  setPedidosI: Dispatch<SetStateAction<PedidoI[]>>;
  bloqueosI: BloqueoI[];
  setBloqueosI: Dispatch<SetStateAction<BloqueoI[]>>;
  dataVehiculos: VehiculoI[];
  setDataVehiculos: Dispatch<SetStateAction<VehiculoI[]>>;
  setUbicacionVehiculo: (index: number, x: number, y: number) => void;
  resetMap: () => void;
  finish: boolean;
  setFinish: Dispatch<SetStateAction<boolean>>;
  cantidadEntregados: number;
  setCantidadEntregados: Dispatch<SetStateAction<number>>;
  simulacionIniciada: boolean;
  tipoFinalizacion: "normal" | "colapso";
  setTipoFinalizacion: Dispatch<SetStateAction<"normal" | "colapso">>;
  pedidosVencidos: PedidoI[];
  setPedidosVencidos: Dispatch<SetStateAction<PedidoI[]>>;
  camionSeleccionadoId: number | null;
  setCamionSeleccionadoId: Dispatch<SetStateAction<number | null>>;
  pedidoSeleccionadoId: number | null;
  setPedidoSeleccionadoId: Dispatch<SetStateAction<number | null>>;
}

const MapContext = createContext<MapContextType | null>(null);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [mapHeight, setMapHeight] = useState<number>(0);
  const [mapWidth, setMapWidth] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const cellSizeX = useRef<number>(0);
  const cellSizeY = useRef<number>(0);
  const maxXAxios: number = 70;
  const maxYAxios: number = 51;

  //controla los pedidos y bloqueos leidos
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [bloqueos, setBloqueos] = useState<Block[]>([]);
  const [pedidosI, setPedidosI] = useState<PedidoI[]>([]);
  const [bloqueosI, setBloqueosI] = useState<BloqueoI[]>([]);
  const [dataVehiculos, setDataVehiculos] = useState<VehiculoI[]>([]);
  const [simulacionIniciada, setSimulacionIniciada] = useState<boolean>(false);
  const [cantidadEntregados, setCantidadEntregados] = useState<number>(0);
  const [loadingVehiculesRoutes, setLoadingVehiculesRoutes] = useState<boolean>(false);
  const [errorVehiculesRoutes, setErrorVehiculesRoutes] = useState<boolean>(false);
  const [vehiculesRoutes, setVehiculesRoutes] = useState<CamionConRutas[]>([]);

  const loadingRutas = useRef<boolean>(false);

  const { simulacionSeleccionada } = useSimulationContext();
  const { ihora, iminuto, dia, tipo, anio, mes } = simulacionSeleccionada;

  const manageTime: manageTimeReturn = useManageTime({
    tipo,
    setSimulacionIniciada,
    simulacionIniciada,
  }); //establece parametros de speed, intervalms,minutosporiteracion, inicio del simulacion
  const {
    initTimer,
    speedTime,
    displaySpeed,
    speedReal,
    intervalMs,
    minutosPorIteracion,
    stopTimer,
  } = manageTime;

  const simulationTime: SimulationTimeReturn = useSimulationTime({
    initTimer,
    intervalMs,
    speedTime,
    dia: dia ?? 1,
    ihora: ihora ?? 0,
    iminuto: iminuto ?? 0,
    simulacionIniciada,
    tipoSimulacion: tipo!,
    stopTimer,
    minutosPorIteracion,
  });
  const realTime: RealTimeReturn = useRealTime({ initTimer, simulacionIniciada }); //maneja el timer del tiempo real
  const { timerSimulacion, finish, setFinish } = simulationTime;
  const [legendSummary, setLegendSummary] = useState<legendSummary>({
    activosTA: 0,
    activosTB: 0,
    activosTC: 0,
    activosTD: 0,
    numPedidos: 0,
  });

  const [tipoFinalizacion, setTipoFinalizacion] = useState<"normal" | "colapso">("normal");
  const [pedidosVencidos, setPedidosVencidos] = useState<PedidoI[]>([]);
  const [camionSeleccionadoId, setCamionSeleccionadoId] = useState<number | null>(null);
  const [pedidoSeleccionadoId, setPedidoSeleccionadoId] = useState<number | null>(null);

  function setUbicacionVehiculo(index: number, x: number, y: number) {
    setDataVehiculos((dataVehiculos) => {
      return dataVehiculos.map((vehiculo) =>
        vehiculo.id === index
          ? { ...vehiculo, ubicacionActual: { ...vehiculo.ubicacionActual, x, y } }
          : vehiculo
      );
    });
  }

  const llamarRutas = async () => {
    loadingRutas.current = true; //se está cargando, para no interrupir

    try {
      let resRutas;
      if (tipo == SimulationType.SEMANAL || tipo == SimulationType.COLAPSO) {
        resRutas = await SimulationService.obtenerRutasVehiculosSemanal(
          anio,
          mes,
          timerSimulacion,
          minutosPorIteracion
        );
      } else if (tipo == SimulationType.DIA_DIA) {
        resRutas = await SimulationService.obtenerRutasVehiculosDiario(
          anio,
          mes,
          timerSimulacion,
          minutosPorIteracion
        );
      }

      if (resRutas) {
        setDataVehiculos(resRutas.data);

        // 🎯 NUEVA LÓGICA: Solo para COLAPSO
        if (tipo == SimulationType.COLAPSO) {
          const pedidosVencidos: PedidoI[] = detectarColapso();
          if (pedidosVencidos.length > 0) {
            console.log("¡COLAPSO DETECTADO!", pedidosVencidos);
            setTipoFinalizacion("colapso");
            stopTimer();
            setFinish(true);
          }
        }
      }
    } catch (error) {
      console.error("Error al obtener rutas:", error);
    } finally {
      loadingRutas.current = false;
    }
  };

  useEffect(() => {
    if (
      simulacionIniciada &&
      timerSimulacion % minutosPorIteracion === 0 &&
      !loadingRutas.current
    ) {
      llamarRutas();
    }
  }, [simulacionIniciada, timerSimulacion]);

  //por ahora sin parametros, sin envio de archivos
  const getVehiculesRoutesFlow = async (
    pedidos: Pedido[],
    filePedidos: File,
    bloqueados: Block[],
    fileBloqueos: File
  ) => {
    /* try{
          setLoadingVehiculesRoutes(true);
          await SimulationService.loadGrid();
          const resPedidos  = await SimulationService.LoadDataFile(filePedidos);

          //añado a los pedidos sus identificadores , no deberia estar aca pero gg
          const idPedidos = resPedidos.data.idsPedidos;
          const pedidosConId = pedidos.map((pedido,i) => ({
            ...pedido,
            idPedido: idPedidos[i]
          }))

          await SimulationService.goSimulationAGA()
          const res = await SimulationService.getTruckRoutes(false);
          const truckFetch: CamionConRutas[] = parseTrucksFetchArray(res.data.camiones);
          console.log(truckFetch)
          console.log(pedidosConId);

          //pedidos y bloqueos que se reflejen 
          setPedidos(pedidosConId);
          setBloqueos(bloqueados);
          setVehiculesRoutes(truckFetch);
      }
      catch(error){
          alert("Errores"+ (error as Error).message);
          setErrorAverias(true);
      }
      finally{
          setLoadingVehiculesRoutes(false);
      }*/
  };

  const setDimensions = (width: number, height: number) => {
    cellSizeY.current = height / maxYAxios;
    cellSizeX.current = width / maxXAxios;
    const mapWidthCal = maxXAxios * cellSizeX.current;
    const mapHeightCal = maxYAxios * cellSizeY.current;
    setMapHeight(mapHeightCal);
    setMapWidth(mapWidthCal);
    setLoading(false);
  };

  const mapData: MapData = {
    mapHeight,
    mapWidth,
    cellSizeXValue: cellSizeX.current,
    cellSizeYValue: cellSizeY.current,
    maxXAxios,
    maxYAxios,
    loading,
  };

  //para hacer resetSimulacion
  const resetMap = () => {
    setPedidosI([]);
    setBloqueosI([]);
    setTrucks([]);
    setDataVehiculos([]);
    //simulacion iniciada
    setSimulacionIniciada(false);
    //timers
    realTime.restartRealTime();
    simulationTime.restartSimulationTime();
    // algo más que limpiar?
  };

  // 🎯 NUEVA FUNCIÓN: Detectar colapso
  const detectarColapso = () => {
    const pedidosEntregados = obtenerPedidosEntregados();
    const pedidosVencidosArray: PedidoI[] = [];

    pedidosI.forEach((pedido) => {
      const tiempoAparicion = pedido.dia * 24 * 60 + pedido.hora * 60 + pedido.minuto;
      const tiempoLimite = tiempoAparicion + pedido.horasLimite * 60;

      const yaAparecio = tiempoAparicion <= timerSimulacion;
      const seVencio = timerSimulacion > tiempoLimite;
      const noFueEntregado = !pedidosEntregados.includes(pedido.id);

      if (yaAparecio && seVencio && noFueEntregado) {
        pedidosVencidosArray.push(pedido);
      }
    });

    // ✅ GUARDAR los pedidos vencidos en el estado
    setPedidosVencidos(pedidosVencidosArray);
    return pedidosVencidosArray;
  };

  // 🎯 COPIAR de MapCanvas.tsx
  const obtenerPedidosEntregados = () => {
    let pedidos: number[] = [];
    dataVehiculos?.forEach((vehiculo) => {
      if (vehiculo.route) {
        vehiculo.route.forEach((punto) => {
          if (
            punto.pedido &&
            punto.pedido?.entregadoCompleto &&
            punto.tiempoInicio <= timerSimulacion
          ) {
            pedidos.push(punto.pedido.id);
          }
        });
      }
    });
    return pedidos;
  };

  return (
    <MapContext.Provider
      value={{
        finish,
        setFinish,
        mapData,
        setDimensions,
        getVehiculesRoutesFlow,
        vehiculesRoutes,
        loadingVehiculesRoutes,
        errorVehiculesRoutes,
        pedidos,
        setPedidos,
        bloqueos,
        legendSummary,
        setLegendSummary,
        manageTime,
        realTime,
        simulationTime,
        pedidosI,
        bloqueosI,
        setBloqueosI,
        setPedidosI,
        dataVehiculos,
        setDataVehiculos,
        setUbicacionVehiculo,
        resetMap,
        cantidadEntregados,
        setCantidadEntregados,
        simulacionIniciada,
        tipoFinalizacion,
        setTipoFinalizacion,
        pedidosVencidos,
        setPedidosVencidos,
        camionSeleccionadoId,
        setCamionSeleccionadoId,
        pedidoSeleccionadoId,
        setPedidoSeleccionadoId,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapContext debe estar dentro de un MapProvider");
  }
  return context;
};
