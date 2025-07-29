"use client";

import Almacen, {
  AlmacenInfo,
  ToolTipAlmacen,
} from "@/components/map/warehouse/warehouse-component";
import { Camion } from "@/components/map/truck/controller";
import { useMapContext } from "@/contexts/ContextMap";
import Konva from "konva";
import {
  forwardRef,
  JSX,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import confetti from "canvas-confetti";
import { DiaADiaPanel } from "./panel";
import { Layer, Stage } from "react-konva";
import { FinishModal } from "@/components/map/modals/simulation-completion";
import { ToolTipCamion } from "@/components/map/truck/display";
import { useMapTooltip } from "@/hooks/use-tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useLengendSummary from "@/hooks/use-legend-summary";
import PedidoCanvas, { ToolTipPedido } from "@/components/map/warehouse/order-package";
import { generateGridLines } from "@/utils/simulationBuilders";
import { MapTooltip } from "@/components/map/tooltip/tooltip-component";
import { Bloqueo, ToolTipBlockRoute } from "@/components/map/MapRoute/blockage";
import { BloqueoI } from "@/interfaces/simulation/bloqueo.interface";
import { PedidoI } from "@/interfaces/simulation/pedido.interface";
import { CamionI } from "@/interfaces/simulation/camion.interface";
import { useSimulationContext } from "@/contexts/ContextSimulation";
import { FleetIndicator } from "@/components/map/fleet-indicator";
import { SimulationType } from "@/interfaces/simulation.interface";

interface DiaADiaCanvasProps {
  open: boolean;
}

interface DiaADiaCanvasRef {
  fitToScreen: () => void;
}

const DiaADiaCanvas = forwardRef<DiaADiaCanvasRef, DiaADiaCanvasProps>(({ open }, ref) => {
  const containerCanvas = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [bloqueosShow, setBloqueosShow] = useState<BloqueoI[]>([]);
  const { pushPedidosPendientes } = useLengendSummary();
  const [bloqueoSeleccionado, setBloqueoSeleccionado] = useState<BloqueoI | null>(null);
  const [tooltipBlockPos, setToolTipBlockPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const { tooltip, showTooltip, hideTooltip, getTooltipProps } = useMapTooltip();
  const [isPanelExpanded, setIsPanelExpanded] = useState<boolean>(true);

  const {
    mapData,
    setDimensions,
    simulationTime,
    pedidosI,
    bloqueosI,
    setPedidosI,
    camionesRuta: dataVehiculos,
    finish,
    tipoFinalizacion,
    camionSeleccionadoId,
    pedidoSeleccionadoId,
    bloqueoSeleccionadoId,
    almacenesBackend,
  } = useMapContext();

  const { timerSimulacion } = simulationTime;
  const { simulacionSeleccionada } = useSimulationContext();
  const tipoSimulacion = SimulationType.DIA_DIA; // Forzar día a día
  const { ihora, iminuto, dia, anio, mes } = simulacionSeleccionada;

  const { cellSizeXValue, cellSizeYValue, mapHeight, mapWidth, loading } = mapData;
  const [pedidosMostrar, setPedidosMostrar] = useState<JSX.Element[]>([]);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState<AlmacenInfo | null>(null);
  const [tooltipAlmacenPos, setToolTipAlmacenPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoI | null>(null);
  const [tooltipPedidoPos, setToolTipPedidoPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [camionSeleccionado, setCamionSeleccionado] = useState<CamionI | null>(null);
  const [tooltipCamionPos, setToolTipCamionPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const MIN_SCALE = 0.8;
  const MAX_SCALE = 4;
  const ZOOM_SPEED = 0.15;

  // Función para alternar el panel
  const togglePanel = () => {
    setIsPanelExpanded(!isPanelExpanded);
  };

  // Filtrar solo el almacén Central para día a día
  const almacenesFiltrados = useMemo(() => {
    return almacenesBackend.filter(almacen => 
      almacen.nombre?.toLowerCase() === "central"
    );
  }, [almacenesBackend]);

  // Filtrar bloqueos activos
  const bloqueosActivos = useMemo(() => {
    return bloqueosI.filter(bloqueo => {
      const tiempoInicio = bloqueo.diaInicio * 24 * 60 + bloqueo.horaInicio * 60 + bloqueo.minutoInicio;
      const tiempoFin = bloqueo.diaFin * 24 * 60 + bloqueo.horaFin * 60 + bloqueo.minutoFin;
      return timerSimulacion >= tiempoInicio && timerSimulacion <= tiempoFin;
    });
  }, [bloqueosI, timerSimulacion]);

  // Filtrar pedidos del día actual
  const pedidosDiaActual = useMemo(() => {
    return pedidosI.filter(pedido => pedido.dia === dia);
  }, [pedidosI, dia]);

  // Función para ajustar a pantalla
  const fitToScreen = useCallback(() => {
    if (!stageRef.current || !containerCanvas.current) return;

    const containerWidth = containerCanvas.current.offsetWidth;
    const containerHeight = containerCanvas.current.offsetHeight;
    
    const scaleX = containerWidth / mapWidth;
    const scaleY = containerHeight / mapHeight;
    const optimalScale = Math.min(scaleX, scaleY, MAX_SCALE);

    const newScale = Math.max(optimalScale, MIN_SCALE);
    
    setScale(newScale);
    setPosition({
      x: (containerWidth - mapWidth * newScale) / 2,
      y: (containerHeight - mapHeight * newScale) / 2,
    });
    
    stageRef.current.scale({ x: newScale, y: newScale });
    stageRef.current.position({
      x: (containerWidth - mapWidth * newScale) / 2,
      y: (containerHeight - mapHeight * newScale) / 2,
    });
  }, [mapWidth, mapHeight]);

  useImperativeHandle(ref, () => ({
    fitToScreen,
  }));

  // Configurar dimensiones del mapa
  useEffect(() => {
    if (containerCanvas.current) {
      const { offsetWidth, offsetHeight } = containerCanvas.current;
      setDimensions(offsetWidth, offsetHeight);
      
      if (mapWidth && mapHeight) {
        fitToScreen();
      }
    }
  }, [setDimensions, mapWidth, mapHeight, fitToScreen]);

  // Manejo de zoom con rueda del mouse
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    if (!stageRef.current) return;

    const oldScale = scale;
    const pointer = stageRef.current.getPointerPosition();
    
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.min(Math.max(oldScale + direction * ZOOM_SPEED, MIN_SCALE), MAX_SCALE);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosition(newPos);
    
    stageRef.current.scale({ x: newScale, y: newScale });
    stageRef.current.position(newPos);
  }, [scale, position]);

  // Mostrar confetti al finalizar
  useEffect(() => {
    if (finish) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [finish]);

  // Generar líneas de cuadrícula
  const gridLines = useMemo(() => {
    if (!mapWidth || !mapHeight || !cellSizeXValue || !cellSizeYValue) return [];
    return generateGridLines(mapWidth, mapHeight, cellSizeXValue, cellSizeYValue);
  }, [mapWidth, mapHeight, cellSizeXValue, cellSizeYValue]);

  // Generar componentes de pedidos
  const pedidosComponents = useMemo(() => {
    return pedidosDiaActual.map((pedido) => (
      <PedidoCanvas
        key={`pedido-${pedido.id}`}
        pedido={pedido}
        cellSizeX={cellSizeXValue}
        cellSizeY={cellSizeYValue}
        onMouseEnter={(pedidoData, pos) => {
          setPedidoSeleccionado(pedidoData);
          setToolTipPedidoPos(pos);
        }}
        onMouseLeave={() => {
          setPedidoSeleccionado(null);
        }}
        isSelected={pedidoSeleccionadoId === pedido.id}
      />
    ));
  }, [pedidosDiaActual, cellSizeXValue, cellSizeYValue, pedidoSeleccionadoId]);

  // Generar componentes de camiones
  const camionesComponents = useMemo(() => {
    return dataVehiculos?.map((camion) => (
      <Camion
        key={`camion-${camion.id}`}
        data={camion}
        cellSizeX={cellSizeXValue}
        cellSizeY={cellSizeYValue}
        onMouseEnter={(camionData, pos) => {
          setCamionSeleccionado(camionData);
          setToolTipCamionPos(pos);
        }}
        onMouseLeave={() => {
          setCamionSeleccionado(null);
        }}
        isSelected={camionSeleccionadoId === camion.id}
      />
    )) || [];
  }, [dataVehiculos, cellSizeXValue, cellSizeYValue, camionSeleccionadoId]);

  // Generar componentes de almacenes (solo Central)
  const almacenesComponents = useMemo(() => {
    return almacenesFiltrados.map((almacen) => (
      <Almacen
        key={`almacen-${almacen.id}`}
        almacen={almacen}
        cellSizeX={cellSizeXValue}
        cellSizeY={cellSizeYValue}
        onMouseEnter={(almacenData, pos) => {
          setAlmacenSeleccionado(almacenData);
          setToolTipAlmacenPos(pos);
        }}
        onMouseLeave={() => {
          setAlmacenSeleccionado(null);
        }}
      />
    ));
  }, [almacenesFiltrados, cellSizeXValue, cellSizeYValue]);

  // Generar componentes de bloqueos
  const bloqueosComponents = useMemo(() => {
    return bloqueosActivos.map((bloqueo) => (
      <Bloqueo
        key={`bloqueo-${bloqueo.id}`}
        bloqueo={bloqueo}
        cellSizeX={cellSizeXValue}
        cellSizeY={cellSizeYValue}
        onMouseEnter={(bloqueoData, pos) => {
          setBloqueoSeleccionado(bloqueoData);
          setToolTipBlockPos(pos);
        }}
        onMouseLeave={() => {
          setBloqueoSeleccionado(null);
        }}
        isSelected={bloqueoSeleccionadoId === bloqueo.id}
      />
    ));
  }, [bloqueosActivos, cellSizeXValue, cellSizeYValue, bloqueoSeleccionadoId]);

  if (loading || !mapWidth || !mapHeight) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-100">
        <div className="text-center space-y-2 text-slate-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg font-semibold">Cargando operación día a día...</p>
          <p className="text-sm">Preparando mapa y datos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex relative">
      {/* Contenedor del mapa */}
      <div
        ref={containerCanvas}
        className={`flex-1 bg-slate-100 transition-all duration-300 ${
          open ? "mr-96" : "mr-0"
        }`}
        style={{ height: "calc(100vh - 64px)" }}
      >
        <Stage
          ref={stageRef}
          width={containerCanvas.current?.offsetWidth || 0}
          height={containerCanvas.current?.offsetHeight || 0}
          onWheel={handleWheel}
          draggable
          onDragEnd={(e) => {
            setPosition(e.target.position());
          }}
        >
          <Layer>
            {/* Cuadrícula */}
            {gridLines}
            
            {/* Almacenes (solo Central) */}
            {almacenesComponents}
            
            {/* Pedidos */}
            {pedidosComponents}
            
            {/* Bloqueos activos */}
            {bloqueosComponents}
            
            {/* Camiones */}
            {camionesComponents}
          </Layer>
        </Stage>

        {/* Indicador de flota */}
        <FleetIndicator />

        {/* Tooltip de almacén */}
        {almacenSeleccionado && (
          <ToolTipAlmacen almacen={almacenSeleccionado} position={tooltipAlmacenPos} />
        )}

        {/* Tooltip de pedido */}
        {pedidoSeleccionado && (
          <ToolTipPedido pedido={pedidoSeleccionado} position={tooltipPedidoPos} />
        )}

        {/* Tooltip de camión */}
        {camionSeleccionado && (
          <ToolTipCamion camion={camionSeleccionado} position={tooltipCamionPos} />
        )}

        {/* Tooltip de bloqueo */}
        {bloqueoSeleccionado && (
          <ToolTipBlockRoute bloqueo={bloqueoSeleccionado} position={tooltipBlockPos} />
        )}

        {/* Modal de finalización */}
        {finish && (
          <FinishModal 
            isOpen={finish} 
            tipoFinalizacion={tipoFinalizacion}
            isDiaADia={true}
          />
        )}
      </div>

      {/* Panel lateral */}
      <div
        className={`
          fixed right-0 top-16 bottom-0 bg-white border-l border-slate-200 shadow-lg
          transition-all duration-300 z-40
          ${open ? "w-96 translate-x-0" : "w-96 translate-x-full"}
        `}
      >
        <DiaADiaPanel />
      </div>

      {/* Botón para mostrar/ocultar panel */}
      <button
        onClick={togglePanel}
        className={`
          fixed right-2 top-20 z-50 bg-white border border-slate-200 rounded-lg p-2
          shadow-lg hover:shadow-xl transition-all duration-300
          ${open ? "translate-x-0" : "-translate-x-2"}
        `}
        title={open ? "Ocultar panel" : "Mostrar panel"}
      >
        {open ? (
          <ChevronRight className="h-4 w-4 text-slate-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        )}
      </button>
    </div>
  );
});

DiaADiaCanvas.displayName = "DiaADiaCanvas";

export default DiaADiaCanvas;
