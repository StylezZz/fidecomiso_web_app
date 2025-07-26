import { TooltipType } from "@/components/map/tooltip/tooltip-component";
import { useMapContext } from "@/contexts/ContextMap";
import { useTrucksCount } from "@/hooks/use-trucks-count";
import useCalRoute from "@/hooks/use-callroute";
import { KonvaEventObject } from "konva/lib/Node";
import { Dispatch, SetStateAction } from "react";
import { Circle, Group, Path, Rect, Star, Text } from "react-konva";

interface StoreHouseProps {
  posX: number;
  posY: number;
  typeHouse: "warehouse" | "home";
  scale?: number;
  setAlmacenSeleccionado: Dispatch<SetStateAction<AlmacenInfo | null>>;
  setToolTipAlmacenPos: Dispatch<SetStateAction<{ x: number; y: number }>>;
  onTooltip?: (type: TooltipType, data: AlmacenInfo, position: { x: number; y: number }) => void;
}

export interface AlmacenInfo {
  posX: number;
  posY: number;
  typeHouse: "warehouse" | "home";
  nombre: string;
  capacidad: string;
  descripcion: string;
  camionesActuales: number;
}

const Almacen = ({
  posX,
  posY,
  typeHouse,
  scale = 1,
  setAlmacenSeleccionado,
  setToolTipAlmacenPos,
  onTooltip,
}: StoreHouseProps) => {
  const { mapData, almacenSeleccionadoId, setAlmacenSeleccionadoId } = useMapContext();
  const { cellSizeXValue, cellSizeYValue, mapHeight } = mapData;
  const { calculatePos } = useCalRoute();
  const { x, y } = calculatePos(cellSizeXValue, cellSizeYValue, posX, posY, mapHeight);
  const { getTrucksInPosition } = useTrucksCount();

  // Determinar si este almacén está seleccionado
  const almacenId = `${posX}-${posY}`;
  const isSelected = almacenSeleccionadoId === almacenId;

  const getAlmacenInfo = (): AlmacenInfo => {
    const cantidadCamiones = getTrucksInPosition(posX, posY);

    if (typeHouse === "home") {
      return {
        posX,
        posY,
        typeHouse,
        nombre: "Almacén Central",
        capacidad: "Ilimitada",
        descripcion: "Centro de distribución principal",
        camionesActuales: cantidadCamiones,
      };
    } else {
      // Para almacenes intermedios
      if (posX === 42 && posY === 42) {
        return {
          posX,
          posY,
          typeHouse,
          nombre: "Almacén Norte",
          capacidad: "Limitada",
          descripcion: "Almacén intermedio Norte",
          camionesActuales: cantidadCamiones,
        };
      } else if (posX === 63 && posY === 3) {
        return {
          posX,
          posY,
          typeHouse,
          nombre: "Almacén Este",
          capacidad: "Limitada",
          descripcion: "Almacén intermedio Este",
          camionesActuales: cantidadCamiones,
        };
      } else {
        return {
          posX,
          posY,
          typeHouse,
          nombre: "Almacén Intermedio",
          capacidad: "Limitada",
          descripcion: "Almacén intermedio",
          camionesActuales: cantidadCamiones,
        };
      }
    }
  };

  const handleAlmacenClick = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const pointerPosition = stage?.getPointerPosition();
    const position = { x: pointerPosition?.x || 12, y: pointerPosition?.y || 13 };

    const almacenInfo = getAlmacenInfo();

    // Actualizar la selección en el contexto
    setAlmacenSeleccionadoId(isSelected ? null : almacenId);

    if (onTooltip) {
      onTooltip(TooltipType.ALMACEN, almacenInfo, position);
    } else {
      setToolTipAlmacenPos(position);
      setAlmacenSeleccionado(almacenInfo);
    }

    e.cancelBubble = true;
  };

  return (
    <Group
      x={x}
      y={y}
      scale={{ x: 0.7 * scale, y: 0.7 * scale }}
      onClick={handleAlmacenClick}
      onTap={handleAlmacenClick}
      onMouseEnter={(e) => {
        e.target.getStage()!.container().style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        e.target.getStage()!.container().style.cursor = "default";
      }}
    >
      {/* Anillo de selección */}
      {isSelected && (
        <Circle
          x={0}
          y={0}
          radius={25}
          stroke="#3b82f6"
          strokeWidth={3}
          dash={[5, 5]}
          opacity={0.8}
        />
      )}
      
      {/* Componente del almacén */}
      {typeHouse === "home" ? (
        <CentralWarehouseIcon isSelected={isSelected} />
      ) : (
        <IntermediateWarehouseIcon isSelected={isSelected} />
      )}
      
      {/* Indicador de selección adicional */}
      {isSelected && (
        <Circle
          x={15}
          y={-5}
          radius={4}
          fill="#3b82f6"
          stroke="#ffffff"
          strokeWidth={1}
        />
      )}
    </Group>
  );
};

// Almacén Central - Diseño más prominente con estrella y hexágono
const CentralWarehouseIcon = ({ isSelected = false }: { isSelected?: boolean }) => {
  return (
    <Group scale={{ x: 1, y: 1 }} x={-15} y={-15}>
      {/* Fondo hexagonal */}
      <Path
        data="M15 0 L25 8.66 L25 21.66 L15 30.32 L5 21.66 L5 8.66 Z"
        fill={isSelected ? "#2563eb" : "#1e40af"}
        stroke={isSelected ? "#60a5fa" : "#ffffff"}
        strokeWidth={isSelected ? 3 : 2}
        shadowColor="black"
        shadowBlur={isSelected ? 12 : 8}
        shadowOpacity={isSelected ? 0.5 : 0.3}
        shadowOffsetX={2}
        shadowOffsetY={2}
      />

      {/* Estrella central */}
      <Star
        x={15}
        y={15}
        numPoints={5}
        innerRadius={3}
        outerRadius={isSelected ? 10 : 8}
        fill={isSelected ? "#fbbf24" : "#ffffff"}
        stroke={isSelected ? "#ffffff" : "#1e40af"}
        strokeWidth={1}
      />

      {/* Icono de almacén central */}
      <Path
        data="M10 8 L20 8 L20 22 L10 22 Z"
        fill="transparent"
        stroke="#ffffff"
        strokeWidth={1.5}
      />

      {/* Puerta */}
      <Rect x={13} y={18} width={4} height={4} fill="#ffffff" stroke="#1e40af" strokeWidth={0.5} />

      {/* Ventanas */}
      <Rect x={11} y={10} width={2} height={2} fill="#ffffff" stroke="#1e40af" strokeWidth={0.5} />
      <Rect x={17} y={10} width={2} height={2} fill="#ffffff" stroke="#1e40af" strokeWidth={0.5} />
    </Group>
  );
};

// Almacén Intermedio - Diseño más simple con cuadrado y techo
const IntermediateWarehouseIcon = ({ isSelected = false }: { isSelected?: boolean }) => {
  return (
    <Group scale={{ x: 1, y: 1 }} x={-12} y={-12}>
      {/* Fondo cuadrado con bordes redondeados */}
      <Rect
        x={4}
        y={8}
        width={16}
        height={16}
        fill={isSelected ? "#2563eb" : "#3b82f6"}
        stroke={isSelected ? "#60a5fa" : "#ffffff"}
        strokeWidth={isSelected ? 3 : 2}
        cornerRadius={3}
        shadowColor="black"
        shadowBlur={isSelected ? 10 : 6}
        shadowOpacity={isSelected ? 0.4 : 0.2}
        shadowOffsetX={1}
        shadowOffsetY={1}
      />

      {/* Techo triangular */}
      <Path 
        data="M4 8 L12 2 L20 8 Z" 
        fill={isSelected ? "#1d4ed8" : "#1e40af"} 
        stroke={isSelected ? "#60a5fa" : "#ffffff"} 
        strokeWidth={1.5} 
      />

      {/* Puerta */}
      <Rect 
        x={9} 
        y={16} 
        width={6} 
        height={8} 
        fill={isSelected ? "#fbbf24" : "#ffffff"} 
        stroke="#3b82f6" 
        strokeWidth={0.5} 
      />

      {/* Ventanas laterales */}
      <Rect 
        x={6} 
        y={10} 
        width={2} 
        height={2} 
        fill={isSelected ? "#fbbf24" : "#ffffff"} 
        stroke="#3b82f6" 
        strokeWidth={0.5} 
      />
      <Rect 
        x={16} 
        y={10} 
        width={2} 
        height={2} 
        fill={isSelected ? "#fbbf24" : "#ffffff"} 
        stroke="#3b82f6" 
        strokeWidth={0.5} 
      />

      {/* Indicador de almacén intermedio (punto pequeño) */}
      <Circle 
        x={12} 
        y={6} 
        radius={isSelected ? 2 : 1.5} 
        fill={isSelected ? "#fbbf24" : "#ffffff"} 
        stroke="#1e40af" 
        strokeWidth={0.5} 
      />
    </Group>
  );
};

// Componente del Tooltip
interface ToolTipAlmacenProps {
  almacen: AlmacenInfo;
  posX: number;
  posY: number;
}

export const ToolTipAlmacen = ({ almacen, posX, posY }: ToolTipAlmacenProps) => {
  const toolTipWidth = 220;
  const toolTipHeight = 140;
  const headerHeight = toolTipHeight / 4;

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
      <Circle
        fill={almacen.typeHouse === "warehouse" ? "#3b82f6" : "#1e40af"}
        width={10}
        height={10}
        offsetY={-19}
        offsetX={-11}
      />
      <Text
        text={almacen.nombre}
        fontStyle="bold"
        align="center"
        fontSize={14}
        padding={13}
        offsetX={-10}
        fill="#1f2937"
      />
      <Text
        text={`Capacidad: ${almacen.capacidad}`}
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
        text={`Pos: ${almacen.posX}, ${almacen.posY}`}
      />
      <Text
        fontStyle="bold"
        fill="#6b7280"
        offsetX={-9}
        offsetY={-80}
        fontSize={12}
        text={`Camiones: ${almacen.camionesActuales}`}
      />
    </Group>
  );
};

export default Almacen;
