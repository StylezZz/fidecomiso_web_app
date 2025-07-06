import React, { useRef, useCallback, useEffect, useMemo, useState, JSX } from "react";
import { Trunk, TypeTruck } from "@/interfaces/map/Truck.interface";
import { useMapContext } from "@/contexts/MapContext";
import useCalRoute from "@/hooks/useCalRoute";
import { LineRoute } from "../MapRoute/mapRoute";
import TruckBody from "./TruckBody";
import {defineColorTruck} from "@/utils/trucksUtils";
import { VehiculoI } from "@/interfaces/newinterfaces/vehiculos.interface";
import Konva from "konva";
import useLengendSummary from "@/hooks/use-legend-summary";
import { Dispatch, SetStateAction } from "react";
import { ToolTipCamion } from "./TruckBody";
import { TooltipType } from "@/components/map/tooltip/MapTooltip";

interface TruckProps {
  scale: number;
  dataVehiculo: VehiculoI;
  setCamionSeleccionado: Dispatch<SetStateAction<VehiculoI | null>>;
  setToolTipCamionPos: Dispatch<SetStateAction<{x:number,y:number}>>;
  onTooltip?: (type: TooltipType, data: VehiculoI, position: { x: number; y: number }) => void;
  isSelected?: boolean;
}

export const Truck = React.memo<TruckProps>(({  scale,dataVehiculo, setCamionSeleccionado, setToolTipCamionPos, onTooltip, isSelected = false}) => {
  //const { route, tipoCamion, hasBreakdown, placa } = truck;
  const vehiculo=dataVehiculo;
  const codigo = vehiculo.codigo;
  const id = vehiculo.id;
  const {addActiveTrunck,removeActiveTrunck} = useLengendSummary(); 
  //para obtener el tipo de camion
  const typeTruck = useMemo(()=>{
    const stringTipo : string = codigo.slice(0,2);
    return stringTipo as TypeTruck;
  },[codigo])
  
  const { mapData,simulationTime ,setUbicacionVehiculo,manageTime} = useMapContext();
  const {timerSimulacion}= simulationTime
  const {intervalMs,initTimer}= manageTime
  const { cellSizeXValue, cellSizeYValue, mapHeight } = mapData;
  const { calculatePos,calculateRotation } = useCalRoute();
  const [xPos,setXPos] = useState<number>(0);
  const [yPos,setYPos] = useState<number>(0);
  const [angularRotation,setAngularRotation] = useState<number>(0);  
  const [hasBreakdown,setHasBreakDown] = useState<boolean>(false);
  const onRouteRef = useRef<boolean>(false);
  const route = vehiculo.route
  const [currentNode,setCurrNode] = useState<number>(0);
  const animationRef = useRef<Konva.Animation | null>(null);
  // Estado para controlar la visibilidad del camión
  const [visible, setVisible] = useState<boolean>(false);
  const primerRender = useRef<boolean>(true);

  const [animating, setAnimating] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [endPos, setEndPos] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [progress, setProgress] = useState<number>(0);
  const [currentSegmentStartTime, setCurrentSegmentStartTime] = useState<number>(0);
  const [currentSegmentDuration, setCurrentSegmentDuration] = useState<number>(0);


  //posicionar la primera ves
  useEffect(()=>{
    if(route.length < 2 || !route)return;
    const {x,y} = calculatePos(cellSizeXValue,cellSizeYValue,route[0].x,route[0].y,mapHeight);
    const angle = calculateRotation(route[0],route[1])
    //setXPos(x);
    //setYPos(y);
    setAngularRotation(angle);
    //setAngularRotation(0); // Inicialmente no hay rotación
    //setUbicacionVehiculo(id,route[0].x,route[0].y);
  },[route])

  const [averiado, setAveriado] = useState<boolean>(false);
  
  useEffect(()=>{
    if(primerRender.current){
      primerRender.current = false;
      return;
    }
    visible ? addActiveTrunck(typeTruck) : removeActiveTrunck(typeTruck);
  },[visible])
  

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  useEffect(()=>{
    const cantidadGLP = vehiculo.carga;
    const route = vehiculo.route;
    const cargaAsignada = vehiculo.cargaAsignada;
    const carga = vehiculo.carga;
    const porcentajeCargaAsignada = cargaAsignada/carga;
    const averiado = vehiculo.enAveria;
    setAveriado(averiado);
    
    if(route !== null && route.length > 2){
      // Bandera para saber si el camión está actualmente en un punto de la ruta
      let camionEnRuta = false;
      
      for(let j=0;j < route.length;j++){
        const currentPoint = route[j];
        // Verificamos si el camión está en este punto de la ruta en este momento
        const currentTimeRange = timerSimulacion >= currentPoint.startTime && timerSimulacion <= currentPoint.arriveTime;
        
        if(currentTimeRange){
          // El camión está en algún punto de la ruta
          camionEnRuta = true;
          
          // Si es un depósito/almacén, ocultamos el camión
          if(currentPoint.depot){
            setVisible(false);
            console.log("Camión ", codigo, "está en almacén, ocultando");
          } else {
            if(typeTruck == TypeTruck.TD)console.log("Se está entrando siento TD", route);
            setVisible(true);
            setUbicacionVehiculo(id,currentPoint.x,currentPoint.y);
            const {x,y}= calculatePos(cellSizeXValue,cellSizeYValue,currentPoint.x,currentPoint.y,mapHeight);
            setXPos(x);
            setYPos(y);
            setCurrNode(j);
            //console.log("Camión ",codigo,"se encuentra en ",currentPoint.x, currentPoint.y);
          }
          break; // Ya encontramos el punto actual, no necesitamos seguir buscando
        }
      }
      
      // Si el camión no está en ningún punto de la ruta en este momento
      if(!camionEnRuta){
        // Verificamos si ha completado su ruta
        const ultimoPunto = route[route.length - 1];
        if(timerSimulacion > ultimoPunto.arriveTime){
          setVisible(false); // Ocultamos el camión si ha completado su ruta
          console.log("Camión ", codigo, "ha completado su ruta, ocultando");
        }
      }
    }
  }
  ,[timerSimulacion])

  const truckColor = defineColorTruck(typeTruck);

  return (
    <>
        {visible && (
          <>
            <LineRoute 
              route={route}
              color={truckColor}
              posX={xPos}
              posY={yPos}
              currentNodeIndex={currentNode}
            />
            <TruckBody
              xPos={xPos}
              yPos={yPos}
              angularRotation={angularRotation}
              tipoCamion={typeTruck}
              hasBreakdown={averiado}
              scale={scale}
              camionId={codigo}
              vehiculoData={vehiculo}
              setCamionSeleccionado={setCamionSeleccionado}
              setToolTipCamionPos={setToolTipCamionPos}
              onTooltip={onTooltip}
              isSelected={isSelected}
            />
          </>
        )}
    </>
  );
});