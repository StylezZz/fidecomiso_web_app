import { Stage, Layer, Line, Rect, Group, Text, Circle } from "react-konva";
import useCalRoute from "@/hooks/useCalRoute";
import { useMemo, Dispatch, SetStateAction } from "react";
import { useMapContext } from "@/contexts/MapContext";
import { KonvaEventObject } from "konva/lib/Node";
import { PedidoI } from "@/interfaces/newinterfaces/pedido.interface";
import { TooltipType } from "@/components/map/tooltip/MapTooltip";

interface PedidoCanvasProps{
    posX: number;
    posY: number;
    isWating?: boolean;
    pedidoId: number;
    setPedidoSeleccionado: Dispatch<SetStateAction<PedidoI | null>>;
    setToolTipPedidoPos: Dispatch<SetStateAction<{x:number,y:number}>>;
    onTooltip?: (type: TooltipType, data: PedidoI, position: { x: number; y: number }) => void;
    isSelected?: boolean;
}

const PedidoCanvas = ({
    posX,
    posY,
    isWating = true,
    pedidoId,
    setPedidoSeleccionado,
    setToolTipPedidoPos,
    onTooltip,
    isSelected = false
}: PedidoCanvasProps) => {
    const { mapData, pedidosI } = useMapContext();
    const { cellSizeXValue,cellSizeYValue,mapHeight } = mapData;    
    const {calculatePos} = useCalRoute();
    const { x, y } = useMemo(() => {
        return calculatePos(cellSizeXValue, cellSizeYValue, posX, posY, mapHeight);
    }, [cellSizeXValue, cellSizeYValue, posX, posY, mapHeight]);

    const handlePedidoClick = (e: KonvaEventObject<MouseEvent>) => {
        // Buscar el pedido completo por ID
        const pedidoCompleto = pedidosI.find(p => p.id === pedidoId);
        if (!pedidoCompleto) return;
        
        const stage = e.target.getStage();
        const pointerPosition = stage?.getPointerPosition();
        const position = {x: pointerPosition?.x || 12, y: pointerPosition?.y || 13};
        
        if (onTooltip) {
            onTooltip(TooltipType.PEDIDO, pedidoCompleto, position);
        } else {
            setToolTipPedidoPos(position);
            setPedidoSeleccionado(pedidoCompleto);
        }
        
        e.cancelBubble = true;
    };

    return(
        isWating &&
        (<Group 
            x={x-7} 
            y={y-10} 
            scale={{x:0.17,y:0.17}}
            onClick={handlePedidoClick}
            onTap={handlePedidoClick}
            onMouseEnter={(e) => {
                e.target.getStage()!.container().style.cursor = 'pointer';
            }}
            onMouseLeave={(e) => {
                e.target.getStage()!.container().style.cursor = 'default';
            }}
        >
        <Line
            points={[
              0, 40,   // izquierda inferior
              48, 0,   // pico superior
              96, 40,  // derecha inferior
              48, 80,  // centro
            ]}
            closed
            fill="#f4c167"
            stroke="#a05a2c"
            strokeWidth={2}
            listening={true}
            hitStrokeWidth={20}
          />

          {/* Lado frontal */}
          <Line
            points={[
              0, 40,
              0, 100,
              48, 140,
              48, 80,
            ]}
            closed
            fill="#d98c30"
            stroke="#a05a2c"
            strokeWidth={2}
          />

          {/* Lado derecho */}
          <Line
            points={[
              96, 40,
              96, 100,
              48, 140,
              48, 80,
            ]}
            closed
            fill="#b87333"
            stroke="#a05a2c"
            strokeWidth={2}
          />

          {/* Cinta superior */}
          <Line
            points={[
              36, 10,
              60, 10,
              60, 70,
              36, 78,
            ]}
            closed
            fill="#a05a2c"
          />

          {/* Cinta frontal */}
          <Line
            points={[
              36, 78,
              36, 138,
              60, 130,
              60, 70,
            ]}
            closed
            fill="#804000"
          />

          {/* Círculo de selección detrás */}
          {isSelected && (
            <Circle
              x={48} // centro del paquete
              y={60} // centro vertical del paquete
              radius={60} // ajusta el radio para que envuelva el paquete
              stroke="#3b82f6"
              strokeWidth={8}
              dash={[10, 10]}
              listening={false}
            />
          )}
        </Group>)
    )
}

// Componente del Tooltip
interface ToolTipPedidoProps {
    pedido: PedidoI;
    posX: number;
    posY: number;
}

export const ToolTipPedido = ({pedido, posX, posY}: ToolTipPedidoProps) => {
    const toolTipWidth = 200;
    const toolTipHeight = 130;
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
                fill="#f4c167"
                width={10} 
                height={10} 
                offsetY={-19} 
                offsetX={-11}
            />
            <Text
                text={`CÓDIGO: ${pedido.idCliente}`}
                fontStyle="bold"
                align="center"
                fontSize={14}
                padding={13}
                offsetX={-10}
                fill="#1f2937"
            />
            <Text 
                text={`Pos: ${pedido.posX}, ${pedido.posY}`} 
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
                text={`Vol: ${pedido.cantidadGLP} L`}
            />
            <Text
                fontStyle="bold"
                fill="#6b7280"
                offsetX={-9}
                offsetY={-80}
                fontSize={12}
                text={`Hora: ${pedido.hora.toString().padStart(2, '0')}:${pedido.minuto.toString().padStart(2, '0')}`}
            />
        </Group>
    )
}

export default PedidoCanvas