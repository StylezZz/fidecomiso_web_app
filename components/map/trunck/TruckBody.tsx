import { TypeTruck } from "@/interfaces/map/Truck.interface";
import { defineColorTruck } from "@/utils/trucksUtils"
import { Group, Circle, Text, Line, Rect } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { VehiculoI } from "@/interfaces/newinterfaces/vehiculos.interface";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { TooltipType } from "@/components/map/tooltip/MapTooltip";
import React from "react";

interface TruckBodyProps {
  xPos: number;
  yPos: number;
  angularRotation: number;
  tipoCamion: TypeTruck;
  hasBreakdown: boolean | undefined;
  scale: number;
  camionId?: string;
  vehiculoData: VehiculoI;
  setCamionSeleccionado: Dispatch<SetStateAction<VehiculoI | null>>;
  setToolTipCamionPos: Dispatch<SetStateAction<{x:number,y:number}>>;
  onTooltip?: (type: TooltipType, data: VehiculoI, position: { x: number; y: number }) => void;
  isSelected?: boolean;
}

const TruckBody = React.memo(({
  xPos,
  yPos,
  angularRotation,
  tipoCamion,
  hasBreakdown,
  scale,
  camionId,
  vehiculoData,
  setCamionSeleccionado,
  setToolTipCamionPos,
  onTooltip,
  isSelected = false
}: TruckBodyProps) => {
  const handleCamionClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const pointerPosition = stage?.getPointerPosition();
    const position = {x: pointerPosition?.x || 12, y: pointerPosition?.y || 13};
    
    if (onTooltip) {
      onTooltip(TooltipType.CAMION, vehiculoData, position);
    } else {
      setToolTipCamionPos(position);
      setCamionSeleccionado(vehiculoData);
    }
    
    e.cancelBubble = true;
  }, [vehiculoData, onTooltip, setToolTipCamionPos, setCamionSeleccionado]);

  const truckColor = useMemo(() => defineColorTruck(tipoCamion), [tipoCamion]);

  return (
    <Group 
      x={xPos} 
      y={yPos} 
      rotation={angularRotation} 
      scale={{ x: scale, y: scale }}
      onClick={handleCamionClick}
      onTap={handleCamionClick}
      onMouseEnter={(e) => {
        e.target.getStage()!.container().style.cursor = 'pointer';
      }}
      onMouseLeave={(e) => {
        e.target.getStage()!.container().style.cursor = 'default';
      }}
    >
      {/* Sombra */}
      <Circle
        x={0}
        y={4}
        radius={12}
        fill="#000000"
        opacity={0.2}
        listening={false}
      />
      
      {/* Círculo principal del camión */}
      <Circle 
        radius={12} 
        fill={truckColor} 
        stroke="#ffffff" 
        strokeWidth={3}
        shadowColor="#000000"
        shadowBlur={12}
        shadowOpacity={0.4}
        shadowOffsetX={0}
        shadowOffsetY={3}
        listening={true}
        hitStrokeWidth={20}
      />
      
      {/* Indicador de dirección (flecha pequeña) */}
      <Line
        points={[0, -8, 0, 8]}
        stroke="#ffffff"
        strokeWidth={3}
        lineCap="round"
        listening={false}
      />
      <Line
        points={[-4, 4, 0, 8, 4, 4]}
        stroke="#ffffff"
        strokeWidth={3}
        lineCap="round"
        listening={false}
      />
      
      {/* Indicador de avería */}
      {hasBreakdown && (
        <Circle
          x={0}
          y={-20}
          radius={6}
          fill="#ef4444"
          stroke="#ffffff"
          strokeWidth={2}
          listening={false}
        >
          <Text
            text="!"
            fill="white"
            fontSize={8}
            fontStyle="bold"
            align="center"
            x={-3}
            y={-4}
          />
        </Circle>
      )}
      
      {/* Círculo de selección */}
      {isSelected && (
        <Circle
          x={0}
          y={0}
          radius={20}
          stroke="#3b82f6"
          strokeWidth={3}
          dash={[5, 5]}
          listening={false}
        />
      )}
    </Group>
  );
});

// Componente del Tooltip (mantener el existente)
interface ToolTipCamionProps {
  camion: VehiculoI;
  posX: number;
  posY: number;
}

export const ToolTipCamion = ({camion, posX, posY}: ToolTipCamionProps) => {
  const toolTipWidth = 220;
  const toolTipHeight = 130;
  const headerHeight = toolTipHeight/4;
  
  // Obtener ubicación actual
  const ubicacionActual = camion.ubicacionActual || { x: 0, y: 0 };
  
  // Calcular el color del camión según su tipo
  const tipoCamion = camion.codigo.slice(0, 2) as TypeTruck;
  const colorCamion = defineColorTruck(tipoCamion);

  return(
    <Group x={posX} y={posY}>
      <Rect
        width={toolTipWidth}
        height={toolTipHeight}
        fill="#fff"
        stroke="#e5e7eb"
        strokeWidth={2}
        cornerRadius={8}
        shadowColor="black"
        shadowBlur={10}
        shadowOpacity={0.1}
        shadowOffsetX={0}
        shadowOffsetY={4}
      />
      <Rect width={toolTipWidth} height={headerHeight} fill="#f8fafc" />
      <Circle 
        fill={colorCamion}
        radius={5}
        x={12}
        y={headerHeight/2}
      />
      <Text
        text={`CÓDIGO: ${camion.codigo}`}
        fontStyle="bold"
        fontSize={14}
        fill="#1f2937"
        x={25}
        y={12}
        width={toolTipWidth - 30}
      />
      <Text 
        text={`Posición: ${ubicacionActual.x}, ${ubicacionActual.y}`} 
        fontStyle="bold"
        x={12}
        y={45}
        fontSize={13}
        fill="#6b7280"
      />
      <Text
        fontStyle="bold"
        fill="#6b7280"
        x={12}
        y={65}
        fontSize={13}
        text={`Carga: ${camion.carga} m³`}
      />
      <Text
        fontStyle="bold"
        fill="#6b7280"
        x={12}
        y={85}
        fontSize={13}
        text={`Estado: ${camion.enAveria ? 'Averiado' : 'Operativo'}`}
      />
      <Text
        fontStyle="bold"
        fill="#6b7280"
        x={12}
        y={105}
        fontSize={13}
        text={`Tipo: ${tipoCamion}`}
      />
    </Group>
  );
};

TruckBody.displayName = 'TruckBody';
export default TruckBody;