import { TypeTruck } from "@/interfaces/map/Truck.interface";
import { defineColorTruck } from "@/utils/trucksUtils"
import { Group, Rect, RegularPolygon, Circle, Text, Line } from "react-konva";
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
      scale={{ x: .5 * 1, y: .5 * 1 }}
      onClick={handleCamionClick}
      onTap={handleCamionClick}
      onMouseEnter={(e) => {
        e.target.getStage()!.container().style.cursor = 'pointer';
      }}
      onMouseLeave={(e) => {
        e.target.getStage()!.container().style.cursor = 'default';
      }}
    >
      <Rect 
        x={-15} 
        y={-25} 
        width={30} 
        height={50} 
        cornerRadius={3} 
        fill={truckColor} 
        stroke="white" 
        strokeWidth={2}
        listening={true}
        hitStrokeWidth={15}
      />
      <Rect 
        x={-15} 
        y={-25} 
        width={30} 
        height={15} 
        cornerRadius={3} 
        fill="#333" 
        stroke="white" 
        strokeWidth={1} 
      />
      <RegularPolygon 
        x={0} 
        y={-14.5} 
        sides={3} 
        radius={8} 
        fill="white" 
        rotation={239} 
      />
      <Rect 
        x={-10} 
        y={-5} 
        width={20} 
        height={25} 
        cornerRadius={1} 
        fill="#333" 
      />
      {[[-17, -15], [13, -15], [-17, 10], [13, 10]].map(([x, y], idx) => (
        <Rect 
          key={idx} 
          x={x} 
          y={y} 
          width={4} 
          height={8} 
          cornerRadius={1} 
          fill="black" 
          stroke="white" 
          strokeWidth={0.5} 
        />
      ))}
      {/* ✅ AVERÍA SIMPLE - SOLO X ENCIMA */}
      {hasBreakdown && (
        <Group>
          {/* X SIMPLE - Línea diagonal 1 */}
          <Line 
            points={[-12, -20, 12, 20]} 
            stroke="#dc2626" 
            strokeWidth={4} 
            lineCap="round"
          />
          
          {/* X SIMPLE - Línea diagonal 2 */}
          <Line 
            points={[12, -20, -12, 20]} 
            stroke="#dc2626" 
            strokeWidth={4} 
            lineCap="round"
          />
        </Group>
      )}
      
      {/* ❌ COMENTAR O ELIMINAR ESTA SECCIÓN */}
      {/* Mostrar el ID del camión */}
      {/* {camionId && (
        <Text 
          x={-20} 
          y={-50} 
          text={camionId} 
          fill="black" 
          fontSize={30} 
          fontStyle="bold" 
          stroke="white" 
          strokeWidth={1} 
          width={80} 
          align="center" 
        />
      )} */}
      
      {/* Círculo de selección */}
      {isSelected && (
        <Circle
          x={0}
          y={0}
          radius={35}
          stroke="#3b82f6"
          strokeWidth={3}
          dash={[5, 5]}
        />
      )}
    </Group>
  );
});

// Componente del Tooltip
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
      <Rect 
        fill={colorCamion}
        width={10} 
        height={10} 
        offsetY={-19} 
        offsetX={-11}
      />
      <Text
        text={`CAMIÓN: ${camion.codigo}`}
        fontStyle="bold"
        align="center"
        fontSize={14}
        padding={13}
        offsetX={-10}
        fill="#1f2937"
      />
      <Text 
        text={`Carga: ${camion.carga} / ${camion.glpDisponible} L`} 
        fontStyle="bold"
        offsetX={-9}
        offsetY={-40}
        fontSize={12}
        fill="#6b7280"
      />
      <Text
        fontStyle="bold"
        fill="#6b7280"
        offsetX={-9}
        offsetY={-60}
        fontSize={12}
        text={`Ubicación: ${ubicacionActual.x}, ${ubicacionActual.y}`}
      />
      <Text
        fontStyle="bold"
        fill="#6b7280"
        offsetX={-9}
        offsetY={-80}
        fontSize={12}
        text={`Estado: ${camion.enAveria ? 'En Avería' : 'Operativo'}`}
      />
    </Group>
  )
}

// Comparación personalizada para evitar re-renders innecesarios
export default React.memo(TruckBody, (prevProps, nextProps) => {
  return (
    prevProps.xPos === nextProps.xPos &&
    prevProps.yPos === nextProps.yPos &&
    prevProps.angularRotation === nextProps.angularRotation &&
    prevProps.hasBreakdown === nextProps.hasBreakdown &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.scale === nextProps.scale
  );
});
// Made by Dalpb