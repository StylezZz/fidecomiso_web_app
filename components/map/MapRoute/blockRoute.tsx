import { Circle, Group, Line, Rect, Text } from "react-konva";
import { useMapContext } from "@/contexts/MapContext";
import useCalRoute from "@/hooks/useCalRoute";
import { BloqueoI } from "@/interfaces/simulation/bloqueo.interface";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { NodoBloqueadoI } from "@/interfaces/simulation/node.interfaces";
import { KonvaEventObject } from "konva/lib/Node";
import { formatearFecha } from "@/utils/fetchTransform";
import { TooltipType } from "@/components/map/tooltip/MapTooltip";

interface Props {
  block: BloqueoI;
  setBloqueoSeleccionado: Dispatch<SetStateAction<BloqueoI | null>>;
  setToolTipBlockPos: Dispatch<SetStateAction<{ x: number; y: number }>>;
  onTooltip?: (type: TooltipType, data: BloqueoI, position: { x: number; y: number }) => void;
}

export const Bloqueo = ({
  block,
  setBloqueoSeleccionado,
  setToolTipBlockPos,
  onTooltip,
}: Props) => {
  const { mapData } = useMapContext();
  const { cellSizeXValue, cellSizeYValue, mapHeight } = mapData;
  const { calculatePos } = useCalRoute();
  // Convertir las coordenadas de los tramos a posiciones en el canvas
  const points = useMemo(() => {
    return block.tramo.map((nodo: NodoBloqueadoI) => {
      return {
        startPos: calculatePos(cellSizeXValue, cellSizeYValue, nodo.x_ini, nodo.y_ini, mapHeight),
        endPos: calculatePos(cellSizeXValue, cellSizeYValue, nodo.x_fin, nodo.y_fin, mapHeight),
      };
    });
  }, [block.tramo, cellSizeXValue, cellSizeYValue, mapHeight]);

  const handleBlockRoute = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const pointerPosition = stage?.getPointerPosition();
    const position = { x: pointerPosition?.x || 12, y: pointerPosition?.y || 13 };

    console.log("Bloqueo", block);
    e.cancelBubble = true;

    if (onTooltip) {
      onTooltip(TooltipType.BLOQUEO, block, position);
    } else {
      setToolTipBlockPos(position);
      setBloqueoSeleccionado(block);
    }
  };

  return (
    <>
      {points.map((point, index) => {
        const deltaX = point.endPos.x - point.startPos.x;
        const deltaY = point.endPos.y - point.startPos.y;
        const lineLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        // Ajustar hitStrokeWidth basado en la longitud de la línea
        const hitWidth = Math.max(15, Math.min(30, lineLength * 0.1));

        return (
          <Line
            key={`point${block.id}-segment-${index}`}
            points={[point.startPos.x, point.startPos.y, point.endPos.x, point.endPos.y]}
            stroke="#dc2626"
            strokeWidth={8}
            listening={true}
            hitStrokeWidth={hitWidth}
            lineCap="round"
            shadowColor="#000000"
            shadowBlur={10}
            shadowOpacity={0.3}
            shadowOffsetX={0}
            shadowOffsetY={2}
            dash={[10, 5]}
            onClick={handleBlockRoute}
            onTap={handleBlockRoute}
            onMouseEnter={(e) => {
              (e.target as any).stroke("#ef4444");
              (e.target as any).strokeWidth(10);
              e.target.getLayer()?.batchDraw();
            }}
            onMouseLeave={(e) => {
              (e.target as any).stroke("#dc2626");
              (e.target as any).strokeWidth(8);
              e.target.getLayer()?.batchDraw();
            }}
          />
        );
      })}
    </>
  );
};

interface ToolTipBlockRouteI {
  block: BloqueoI;
  posX: number;
  posY: number;
}
export const ToolTipBlockRoute = ({ block, posX, posY }: ToolTipBlockRouteI) => {
  const toolTipWidth = 200;
  const toolTipHeight = 150;
  const headerHeight = toolTipHeight / 4;
  const dateFinBlock: Date = new Date(block.fechaFin);
  const timeMinsBlock =
    dateFinBlock.getDate() * 1440 + dateFinBlock.getHours() * 60 + dateFinBlock.getMinutes();
  const { mapData, manageTime, simulationTime } = useMapContext();
  const { initTimer } = manageTime;
  const { time, timerSimulacion } = simulationTime;
  const { cellSizeXValue, cellSizeYValue, mapHeight } = mapData;
  const { calculatePos } = useCalRoute();
  const [tiempoFaltante, setTiempoRestante] = useState<number>(0);
  let distance = 0;

  useEffect(() => {
    if (!initTimer) return;
    setTiempoRestante(timeMinsBlock - timerSimulacion);
  }, [initTimer, timerSimulacion]);

  for (let tramo of block.tramo) {
    let { x_fin, x_ini, y_fin, y_ini } = tramo;
    if (x_fin === x_ini) distance += Math.abs(y_fin - y_ini);
    if (y_fin === y_ini) distance += Math.abs(x_fin - x_ini);
  }

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
      <Circle fill="red" width={10} height={10} offsetY={-19} offsetX={-11} />
      <Text
        text={`CÓDIGO: Bloqueo-${block.id}`}
        fontStyle="bold"
        align="center"
        fontSize={14}
        padding={13}
        offsetX={-10}
        fill="#1f2937"
      />
      <Text
        text={`Distancia : ${distance} Km`}
        fontStyle="bold"
        offsetX={-9}
        offsetY={-50}
        fontSize={13}
        fill="#6b7280"
      />
      <Text
        fontStyle="bold"
        fill="#6b7280"
        offsetX={-9}
        offsetY={-70}
        fontSize={13}
        text={`Inicio: ${formatearFecha(new Date(block.fechaInicio))}`}
      />
      <Text
        fontStyle="bold"
        fill="#6b7280"
        offsetX={-9}
        offsetY={-90}
        text={`Fin: ${formatearFecha(new Date(block.fechaFin))}`}
      />
      <Text
        fontStyle="bold"
        fill="#6b7280"
        offsetX={-9}
        offsetY={-110}
        text={`Tiempo Restante : ${tiempoFaltante} mins`}
      />
    </Group>
  );
};
