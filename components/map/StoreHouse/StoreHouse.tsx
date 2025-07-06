import { 
    Circle,
    Text,
    Image,
    Rect,
    Group,
    Line,
    Path
} from "react-konva";
import useCalRoute from "@/hooks/useCalRoute";
import { useMapContext } from "@/contexts/MapContext";
import { KonvaEventObject } from "konva/lib/Node";
import { Dispatch, SetStateAction } from "react";
import { TooltipType } from "@/components/map/tooltip/MapTooltip";
import { useTrucksCount } from "@/hooks/use-trucks-count";

interface StoreHouseProps {
    posX: number;
    posY: number;
    typeHouse: "warehouse" | "home";
    scale?: number;
    setAlmacenSeleccionado: Dispatch<SetStateAction<AlmacenInfo | null>>;
    setToolTipAlmacenPos: Dispatch<SetStateAction<{x:number,y:number}>>;
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

const StoreHouse = ({
    posX,
    posY,
    typeHouse,
    scale = 1, 
    setAlmacenSeleccionado, 
    setToolTipAlmacenPos,
    onTooltip
}: StoreHouseProps) => {
    const { mapData } = useMapContext();
    const { cellSizeXValue,cellSizeYValue,mapHeight } = mapData;    
    const {calculatePos} = useCalRoute();
    const {x,y} = calculatePos(cellSizeXValue,cellSizeYValue,posX,posY,mapHeight);
    const { getTrucksInPosition } = useTrucksCount();

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
                camionesActuales: cantidadCamiones
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
                    camionesActuales: cantidadCamiones
                };
            } else if (posX === 63 && posY === 3) {
                return {
                    posX,
                    posY,
                    typeHouse,
                    nombre: "Almacén Este",
                    capacidad: "Limitada", 
                    descripcion: "Almacén intermedio Este",
                    camionesActuales: cantidadCamiones
                };
            } else {
                return {
                    posX,
                    posY,
                    typeHouse,
                    nombre: "Almacén Intermedio",
                    capacidad: "Limitada",
                    descripcion: "Almacén intermedio",
                    camionesActuales: cantidadCamiones
                };
            }
        }
    };

    const handleAlmacenClick = (e: KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        const pointerPosition = stage?.getPointerPosition();
        const position = {x: pointerPosition?.x || 12, y: pointerPosition?.y || 13};
        
        const almacenInfo = getAlmacenInfo();
        
        if (onTooltip) {
            onTooltip(TooltipType.ALMACEN, almacenInfo, position);
        } else {
            setToolTipAlmacenPos(position);
            setAlmacenSeleccionado(almacenInfo);
        }
        
        e.cancelBubble = true;
    };

    return(
        <Group 
            x={x} 
            y={y} 
            scale={{x:0.5*scale,y:0.5*scale}}
            onClick={handleAlmacenClick}
            onTap={handleAlmacenClick}
            onMouseEnter={(e) => {
                e.target.getStage()!.container().style.cursor = 'pointer';
            }}
            onMouseLeave={(e) => {
                e.target.getStage()!.container().style.cursor = 'default';
            }}
        >
            <Circle  
                radius={20} 
                fill={ typeHouse === "warehouse" ? "#D97706" : "#1D4ED8"}
                listening={true}
                hitStrokeWidth={25}
            />
            {typeHouse === "home" ? <HouseIcon/> : <WarehouseIcon/>} 
        </Group>
    )
}

//Construimos esto, porque este Konva no acepta Icons zzzzzzzzzzzzzzzzzzz!!!
const HouseIcon = () => {
    return (
      <Group scale={{ x: 1, y: 1 }} x={-12} y={-12}>
        <Path
          data="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
          fill="transparent"
          stroke="white"
          strokeWidth={2}
        />
        
        <Line
          points={[15, 21, 15, 13, 9, 13, 9, 21]}
          fill="none"
          stroke="white"
          strokeWidth={2}
        />
        
        <Line
          points={[3, 10, 10, 4, 14, 4, 21, 10]}
          fill="none"
          stroke="white"
          strokeWidth={2}
        />
      </Group>
    );
  };

  const WarehouseIcon = () => {

    return (
      <Group scale={{ x: 1, y: 1 }} x={-12} y={-12}>
        <Rect
          x={6}
          y={10}
          width={12}
          height={12}
          fill="transparent"
          stroke="white"
          strokeWidth={2}
        />
        
        <Path
          data="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"
          fill="transparent"
          stroke="white"
          strokeWidth={2}
        />
        
        <Line
          points={[6, 18, 18, 18]}  
          stroke="white"
          strokeWidth={2}
        />
        <Line
          points={[6, 14, 18, 14]}  
          stroke="white"
          strokeWidth={2}
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

export const ToolTipAlmacen = ({almacen, posX, posY}: ToolTipAlmacenProps) => {
    const toolTipWidth = 220;
    const toolTipHeight = 140;
    const headerHeight = toolTipHeight/4;

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
                fill={almacen.typeHouse === "warehouse" ? "#D97706" : "#1D4ED8"}
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
    )
}

export default StoreHouse;