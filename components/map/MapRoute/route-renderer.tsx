import { Ruta } from "@/interfaces/simulation/camion.interface";
import { Nodo } from "@/interfaces/map/node.interface";
import { JSX, useEffect, useState } from "react";
import { Line } from "react-konva";
import useCalRoute from "@/hooks/use-callroute";
import { useMapContext } from "@/contexts/ContextMap";
interface MapRouteProps {
  route: Ruta[];
  color: string;
  posX: number;
  posY: number;
  currentNodeIndex?: number;
}
export const LineRoute = ({ route, color, posX, posY, currentNodeIndex }: MapRouteProps) => {
  const [elements, setElements] = useState<JSX.Element[]>([]);
  const { mapData } = useMapContext();
  const { cellSizeXValue, cellSizeYValue, mapHeight } = mapData;

  const { calculatePos } = useCalRoute();

  useEffect(() => {
    const temp: JSX.Element[] = [];
    const fromIndex = currentNodeIndex ?? 0;

    for (let i = fromIndex; i < route.length - 1; i++) {
      const { x: x1, y: y1 } = calculatePos(
        cellSizeXValue,
        cellSizeYValue,
        route[i].x,
        route[i].y,
        mapHeight
      );
      const { x: x2, y: y2 } = calculatePos(
        cellSizeXValue,
        cellSizeYValue,
        route[i + 1].x,
        route[i + 1].y,
        mapHeight
      );
      temp.push(
        <Line
          key={`line-${route[i].id.toString()}-${i}`}
          points={[x1, y1, x2, y2]}
          strokeWidth={2.5}
          stroke={color}
        />
      );
    }
    setElements(temp);
  }, [route, currentNodeIndex]);

  return <>{elements}</>;
};
