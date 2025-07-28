import { TipoCamion } from "@/interfaces/map/Truck.interface";
import { defineColorTruck } from "@/utils/trucksUtils";
import { Group, Circle, Text, Line, Rect, Ellipse } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { CamionI } from "@/interfaces/simulation/camion.interface";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { TooltipType } from "@/components/map/tooltip/tooltip-component";
import React from "react";

interface TruckBodyProps {
  xPos: number;
  yPos: number;
  angularRotation: number;
  tipoCamion: TipoCamion;
  hasBreakdown: boolean | undefined;
  scale: number;
  camionId?: string;
  vehiculoData: CamionI;
  setCamionSeleccionado: Dispatch<SetStateAction<CamionI | null>>;
  setToolTipCamionPos: Dispatch<SetStateAction<{ x: number; y: number }>>;
  onTooltip?: (type: TooltipType, data: CamionI, position: { x: number; y: number }) => void;
  isSelected?: boolean;
}

const TruckBody = React.memo(
  ({
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
    isSelected = false,
  }: TruckBodyProps) => {
    const handleCamionClick = useCallback(
      (e: KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        const pointerPosition = stage?.getPointerPosition();
        const position = { x: pointerPosition?.x || 12, y: pointerPosition?.y || 13 };

        if (onTooltip) {
          onTooltip(TooltipType.CAMION, vehiculoData, position);
        } else {
          setToolTipCamionPos(position);
          setCamionSeleccionado(vehiculoData);
        }

        e.cancelBubble = true;
      },
      [vehiculoData, onTooltip, setToolTipCamionPos, setCamionSeleccionado]
    );

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
          e.target.getStage()!.container().style.cursor = "pointer";
        }}
        onMouseLeave={(e) => {
          e.target.getStage()!.container().style.cursor = "default";
        }}
      >
        {/* NOTA: El camión está orientado con el frente hacia la IZQUIERDA */}
        {/* Esto significa que cuando angularRotation = 0, apunta hacia la izquierda */}

        {/* Compartimento de carga (atrás) */}
        <Rect
          x={-4}
          y={-6}
          width={14}
          height={8}
          cornerRadius={1}
          fill={truckColor}
          stroke="#333"
          strokeWidth={0.5}
          shadowColor="#000000"
          shadowBlur={8}
          shadowOpacity={0.3}
          shadowOffsetX={1}
          shadowOffsetY={1}
          listening={true}
          hitStrokeWidth={15}
        />

        {/* Cabina del conductor (adelante) */}
        <Rect
          x={-10}
          y={-3}
          width={7}
          height={6}
          cornerRadius={1}
          fill={truckColor}
          stroke="#333"
          strokeWidth={0.5}
          listening={true}
        />

        {/* Parabrisas */}
        <Rect
          x={-9.5}
          y={-2.5}
          width={3}
          height={3}
          cornerRadius={0.3}
          fill="#87CEEB"
          stroke="#333"
          strokeWidth={0.3}
          opacity={0.8}
          listening={false}
        />

        {/* Ventana lateral de la cabina */}
        <Rect
          x={-6}
          y={-2}
          width={2.5}
          height={2.5}
          cornerRadius={0.3}
          fill="#87CEEB"
          stroke="#333"
          strokeWidth={0.3}
          opacity={0.8}
          listening={false}
        />

        {/* Parrilla frontal */}
        <Rect
          x={-11.5}
          y={-1.5}
          width={1.5}
          height={3}
          cornerRadius={0.2}
          fill="#333"
          stroke="#222"
          strokeWidth={0.2}
          listening={false}
        />

        {/* Rueda delantera */}
        <Circle
          x={-7}
          y={2.5}
          radius={2}
          fill="#333"
          stroke="#000"
          strokeWidth={0.5}
          listening={false}
        />
        <Circle x={-7} y={2.5} radius={1.2} fill="#666" listening={false} />
        <Circle x={-7} y={2.5} radius={0.6} fill="#999" opacity={0.6} listening={false} />

        {/* Rueda trasera */}
        <Circle
          x={4}
          y={2.5}
          radius={2}
          fill="#333"
          stroke="#000"
          strokeWidth={0.5}
          listening={false}
        />
        <Circle x={4} y={2.5} radius={1.2} fill="#666" listening={false} />
        <Circle x={4} y={2.5} radius={0.6} fill="#999" opacity={0.6} listening={false} />

        {/* Faro delantero */}
        <Circle
          x={-10.5}
          y={-1}
          radius={0.8}
          fill="#FFFFE0"
          stroke="#FFA500"
          strokeWidth={0.3}
          opacity={0.9}
          listening={false}
        />

        {/* Línea de separación entre cabina y carga */}
        <Line
          points={[-4, -6, -4, 2]}
          stroke="#333"
          strokeWidth={0.5}
          opacity={0.7}
          listening={false}
        />

        {/* Detalles de la carrocería */}
        <Rect
          x={-2}
          y={-5}
          width={8}
          height={1}
          cornerRadius={0.2}
          fill="#333"
          opacity={0.3}
          listening={false}
        />

        {/* Manija de la puerta */}
        <Circle x={-4.5} y={-1} radius={0.3} fill="#333" listening={false} />

        {/* Indicador de avería */}
        {hasBreakdown && (
          <Group>
            <Circle
              x={0}
              y={-12}
              radius={4}
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth={1.5}
              listening={false}
              shadowColor="#000000"
              shadowBlur={4}
              shadowOpacity={0.3}
            />
            <Text
              text="!"
              fill="white"
              fontSize={6}
              fontStyle="bold"
              align="center"
              x={-1.5}
              y={-14}
              listening={false}
            />
          </Group>
        )}

        {/* Círculo de selección */}
        {isSelected && (
          <Circle
            x={0}
            y={0}
            radius={15}
            stroke="#3b82f6"
            strokeWidth={2}
            dash={[4, 4]}
            listening={false}
            opacity={0.8}
          />
        )}
      </Group>
    );
  }
);

// Componente del Tooltip (mantener el existente)
interface ToolTipCamionProps {
  camion: CamionI;
  posX: number;
  posY: number;
}

export const ToolTipCamion = ({ camion, posX, posY }: ToolTipCamionProps) => {
  const toolTipWidth = 220;
  const toolTipHeight = 130;
  const headerHeight = toolTipHeight / 4;

  // Obtener ubicación actual
  const ubicacionActual = camion.ubicacionActual || { x: 0, y: 0 };

  // Calcular el color del camión según su tipo
  const tipoCamion = camion.codigo.slice(0, 2) as TipoCamion;
  const colorCamion = defineColorTruck(tipoCamion);

  return (
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
      <Circle fill={colorCamion} radius={5} x={12} y={headerHeight / 2} />
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
        text={`Estado: ${camion.enAveria ? "Averiado" : "Operativo"}`}
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

TruckBody.displayName = "TruckBody";
export default TruckBody;
