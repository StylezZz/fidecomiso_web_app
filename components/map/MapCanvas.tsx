"use client"
import Konva from "konva";
import { useRef,useEffect, useState, JSX, useMemo, useCallback, forwardRef, useImperativeHandle } from "react"
import { Layer, Line, Stage ,Text} from "react-konva";
import {Truck} from "@/components/map/trunck/Trunck"
import { LineRoute } from "@/components/map/MapRoute/mapRoute";
import { useMapContext } from "@/contexts/MapContext";
import StoreHouse, { AlmacenInfo, ToolTipAlmacen } from "@/components/map/StoreHouse/StoreHouse";
import PedidoCanvas, { ToolTipPedido } from "./StoreHouse/Pedido";

import { MapTable } from "./MapTable";
import { Trunk, TypeTruck } from "@/interfaces/map/Truck.interface";
import { Block } from "@/interfaces/map/block.interface";
import { BlockRoute, ToolTipBlockRoute } from "./MapRoute/blockRoute";
import { MapLegend } from "./MapLegend";
import { generateGridLines, generatePedidos } from "@/utils/simulationBuilders";
import { PedidoI } from "@/interfaces/newinterfaces/pedido.interface";
import { VehiculoI } from "@/interfaces/newinterfaces/vehiculos.interface";
import confetti from "canvas-confetti";
import { FinishModal } from "./modals/finishModal";
import useLengendSummary from "@/hooks/use-legend-summary";
import { BloqueoI } from "@/interfaces/newinterfaces/bloqueo.interface";
import { ToolTipCamion } from "./trunck/TruckBody";
import { useMapTooltip } from "@/hooks/useMapTooltip";
import { MapTooltip } from "@/components/map/tooltip/MapTooltip";

interface MapProps{
  open: boolean
}

interface MapCanvasRef {
  fitToScreen: () => void;
}

const MapCanvas = forwardRef<MapCanvasRef, MapProps>(({open}, ref) => {
  const containerCanvas = useRef<HTMLDivElement>(null);
  const [showLegend,setShowLegend] = useState<boolean>(false);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [scale,setScale] = useState(1);
  const [position,setPosition] = useState({x:0,y:0});
  const [lines,setLines] = useState<JSX.Element[]>([]);
  const [bloqueosShow,setBloqueosShow] = useState<BloqueoI[]>([]);
  const bloqIndex = useRef<number>(0);
  const {pushPedidosPendientes}= useLengendSummary();
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [bloqueoSeleccionado,setBloqueoSeleccionado] = useState<BloqueoI| null>(null);
  const [tooltipBlockPos,setToolTipBlockPos] = useState<{x:number,y:number}>({x:0,y:0});
  const { tooltip, showTooltip, hideTooltip, getTooltipProps } = useMapTooltip();
  const {
    mapData,
    setDimensions,
    pedidos,
    simulationTime,
    trucks,
    bloqueos,
    pedidosI,
    bloqueosI,
    setPedidosI,
    dataVehiculos,
    finish,
    setCantidadEntregados,
    tipoFinalizacion,
    camionSeleccionadoId,
    pedidoSeleccionadoId,
  } = useMapContext();
  const {time,timerSimulacion} = simulationTime;
  
  const {cellSizeXValue,cellSizeYValue,mapHeight,mapWidth,loading} = mapData;
  const [pedidosMostrar,setPedidosMostrar] = useState<JSX.Element[]>([]);
  const [bloqueosMostrar,setBloqueosMostrar] = useState<JSX.Element[]>([]);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState<AlmacenInfo | null>(null);
  const [tooltipAlmacenPos, setToolTipAlmacenPos] = useState<{x:number,y:number}>({x:0,y:0});
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoI | null>(null);
  const [tooltipPedidoPos, setToolTipPedidoPos] = useState<{x:number,y:number}>({x:0,y:0});
  const [camionSeleccionado, setCamionSeleccionado] = useState<VehiculoI | null>(null);
  const [tooltipCamionPos, setToolTipCamionPos] = useState<{x:number,y:number}>({x:0,y:0});

  const MIN_SCALE = 0.8;
  const MAX_SCALE = 4;
  const ZOOM_SPEED = 0.15;

 const obtenerPedidosEntregadosAPartirDeVehiculos = useCallback((vehiculos: VehiculoI[], timer: number) => {
    let pedidos : number[] = [];
    vehiculos?.forEach((vehiculo) => {
      if (vehiculo.route) {
        vehiculo.route.forEach(punto => {
          if (punto.pedido) {
            if (punto.pedidoRuta && punto.pedidoRuta.entregadoCompleto && punto.startTime <= timer) {
              pedidos.push(punto.pedidoRuta.id);
            }
          }
        });
      }
    });
    return pedidos;
  }, []);

  const pedidosEntregados = useMemo(() => obtenerPedidosEntregadosAPartirDeVehiculos(dataVehiculos, timerSimulacion), [dataVehiculos, obtenerPedidosEntregadosAPartirDeVehiculos, timerSimulacion]);

  const resizeDimensions = () =>{
      if(containerCanvas.current === null)return;
      let rect : DOMRect = containerCanvas.current.getBoundingClientRect();
      const {width,height} = rect;
      setDimensions(width-20,height-20);
  }

  useEffect(()=>{
    resizeDimensions();
    window.addEventListener("resize",resizeDimensions);
    return () => {
    window.removeEventListener("resize",resizeDimensions);
    }
  },[]);

  const gridLines = useMemo(()=>{
    if(mapHeight=== 0 || mapHeight === 0 || loading) return[]
    return generateGridLines(mapWidth,mapHeight,cellSizeXValue,cellSizeYValue);
  },[mapHeight,mapWidth,cellSizeXValue,cellSizeYValue])

  useEffect(()=>{
    const nuevoPedidosMostrar: JSX.Element[] =[];

    const bloqueosActivos = bloqueosI.filter((data)=>{
      const {diaInicio,diaFin,minutoFin,minutoInicio,horaFin,horaInicio} = data;
      const tiempoInicio  = diaInicio*24*60 + horaInicio*60 + minutoInicio;
      const tiempoFin = diaFin*24*60 + horaFin*60 + minutoFin;
      return timerSimulacion >= tiempoInicio && timerSimulacion <= tiempoFin
    })
    setBloqueosShow(bloqueosActivos);

    for(let i=0;i<pedidosI.length;i++){
      const {id,hora,minuto,posX,posY,dia} = pedidosI[i];
      const tiempoMuestraPedido = dia*24*60 + hora*60 + minuto;
      if(tiempoMuestraPedido <= timerSimulacion && !pedidosEntregados.includes(id)){
        nuevoPedidosMostrar.push(
          <PedidoCanvas 
            posX={posX} 
            posY={posY} 
            key={id}
            pedidoId={id}
            setPedidoSeleccionado={setPedidoSeleccionado}
            setToolTipPedidoPos={setToolTipPedidoPos}
            onTooltip={showTooltip}
            isSelected={pedidoSeleccionadoId === id}
          />
        )
      }
      if(pedidosEntregados.includes(id)){
        setPedidosI(prev => prev.filter(pedido => pedido.id !== id ));
      }
    }
    setPedidosMostrar(nuevoPedidosMostrar);
    pushPedidosPendientes(nuevoPedidosMostrar.length);
  },[timerSimulacion])

  useEffect(()=>{
    if(!finish || tipoFinalizacion === 'colapso') return;
    const end = Date.now() + 2 * 1000;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];
 
    const frame = () => {
      if (Date.now() > end) return;
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });
      requestAnimationFrame(frame);
    };
 
    frame();
  },[finish, tipoFinalizacion])

  const draggMoveControl = (e: Konva.KonvaEventObject<DragEvent>) => {  
    const stage = stageRef.current;
    if (!stage) return;

    const newPos = {
      x: e.target.x(),
      y: e.target.y()
    };

    const constrainedPos = constrainPosition(newPos, scale);
    
    setPosition(constrainedPos);
    stage.position(constrainedPos);
  };

  const zoomEvent = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    if (!pointer) return;

    const delta = e.evt.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, oldScale + delta));
    
    if (newScale === oldScale) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    const constrainedPos = constrainPosition(newPos, newScale);

    setScale(newScale);
    setPosition(constrainedPos);
    
    stage.scale({ x: newScale, y: newScale });
    stage.position(constrainedPos);
  };

  const constrainPosition = (pos: {x: number, y: number}, currentScale: number) => {
    const containerRect = containerCanvas.current?.getBoundingClientRect();
    if (!containerRect) return pos;

    const scaledMapWidth = mapWidth * currentScale;
    const scaledMapHeight = mapHeight * currentScale;
    
    const minX = Math.min(0, containerRect.width - scaledMapWidth);
    const maxX = Math.max(0, containerRect.width - scaledMapWidth);
    const minY = Math.min(0, containerRect.height - scaledMapHeight);
    const maxY = Math.max(0, containerRect.height - scaledMapHeight);

    let constrainedX = pos.x;
    let constrainedY = pos.y;

    if (scaledMapWidth < containerRect.width) {
      constrainedX = (containerRect.width - scaledMapWidth) / 2;
    } else {
      constrainedX = Math.max(minX, Math.min(0, pos.x));
    }

    if (scaledMapHeight < containerRect.height) {
      constrainedY = (containerRect.height - scaledMapHeight) / 2;
    } else {
      constrainedY = Math.max(minY, Math.min(0, pos.y));
    }

    return {
      x: constrainedX,
      y: constrainedY
    };
  };

  const fitToScreen = useCallback(() => {
    const stage = stageRef.current;
    const container = containerCanvas.current;
    if (!stage || !container) return;

    const containerRect = container.getBoundingClientRect();
    const padding = 40;
    
    const scaleX = (containerRect.width - padding) / mapWidth;
    const scaleY = (containerRect.height - padding) / mapHeight;
    
    const newScale = Math.max(MIN_SCALE, Math.min(scaleX, scaleY, MAX_SCALE));

    const newPos = {
      x: (containerRect.width - mapWidth * newScale) / 2,
      y: (containerRect.height - mapHeight * newScale) / 2
    };

    setScale(newScale);
    setPosition(newPos);
    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
  }, [mapWidth, mapHeight]);

  useImperativeHandle(ref, () => ({
    fitToScreen
  }));

  if(pedidosI.length <= 0 && bloqueosI.length <=0 ) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        ref={containerCanvas}
      >
        <div className="text-center space-y-2 text-muted-foreground">
          <p className="text-xl font-semibold">No se han cargado la información necesario</p>
          <p className="text-sm">Por favor, carga un archivo de pedidos o inicia una simulación.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1">
        <div className=" box-border flex-1 relative  "  ref={containerCanvas}>
          <Stage 
            ref={stageRef}
            width={mapWidth} 
            height={mapHeight} 
            onWheel={zoomEvent}
            onDragMove={draggMoveControl}
            draggable={true}
            style={{ cursor: 'default' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setBloqueoSeleccionado(null);
                setAlmacenSeleccionado(null);
                setPedidoSeleccionado(null);
                setCamionSeleccionado(null);
                hideTooltip();
              }
            }}
          >
            <Layer>
              {gridLines}
              {
                bloqueosShow.map(bloqueo =>
                <BlockRoute
                key={`broute-${bloqueo.id}`}
                block={bloqueo}
                setBloqueoSeleccionado={setBloqueoSeleccionado}
                setToolTipBlockPos={setToolTipBlockPos}
                onTooltip={showTooltip}
                />)
              }
              {pedidosMostrar}
              {
                dataVehiculos.map(datavehiculo => 
                  <Truck 
                    dataVehiculo={datavehiculo} 
                    scale={scale} 
                    key={datavehiculo.id}
                    setCamionSeleccionado={setCamionSeleccionado}
                    setToolTipCamionPos={setToolTipCamionPos}
                    onTooltip={showTooltip}
                    isSelected={camionSeleccionadoId === datavehiculo.id}
                  />
                )
              }
              <StoreHouse 
                posX={12} 
                posY={8} 
                typeHouse="home" 
                setAlmacenSeleccionado={setAlmacenSeleccionado}
                setToolTipAlmacenPos={setToolTipAlmacenPos}
                onTooltip={showTooltip}
              />
              <StoreHouse 
                posX={42} 
                posY={42} 
                typeHouse="warehouse" 
                setAlmacenSeleccionado={setAlmacenSeleccionado}
                setToolTipAlmacenPos={setToolTipAlmacenPos}
                onTooltip={showTooltip}
              />
              <StoreHouse 
                posX={63} 
                posY={3} 
                typeHouse="warehouse" 
                setAlmacenSeleccionado={setAlmacenSeleccionado}
                setToolTipAlmacenPos={setToolTipAlmacenPos}
                onTooltip={showTooltip}
              />
          {
            bloqueoSeleccionado!=null && bloqueosShow.some(b => b.id === bloqueoSeleccionado.id) &&(
                <ToolTipBlockRoute block={bloqueoSeleccionado} posX={tooltipBlockPos.x} posY={tooltipBlockPos.y} />
            )
          }
          {
            almacenSeleccionado && (
              <ToolTipAlmacen 
                almacen={almacenSeleccionado} 
                posX={tooltipAlmacenPos.x} 
                posY={tooltipAlmacenPos.y} 
              />
            )
          }
          {
            pedidoSeleccionado && (
              <ToolTipPedido 
                pedido={pedidoSeleccionado} 
                posX={tooltipPedidoPos.x} 
                posY={tooltipPedidoPos.y} 
              />
            )
          }
          {
            camionSeleccionado && (
              <ToolTipCamion 
                camion={camionSeleccionado} 
                posX={tooltipCamionPos.x} 
                posY={tooltipCamionPos.y} 
              />
            )
          }
          
          {getTooltipProps() && (
            <MapTooltip {...getTooltipProps()!} />
          )}
            </Layer>
          </Stage>
          
          {showLegend && <MapLegend setShowLegend={setShowLegend}/>}
        </div>
        
        <div className="w-80 h-full bg-background border-l border-border">
          <MapTable setShowLegend={setShowLegend} />
        </div>
      </div>

      {finish && <FinishModal isOpen={finish}/>}
    </>
  )
});

MapCanvas.displayName = 'MapCanvas';

export default MapCanvas;

/*
Made by Dalpb

*/