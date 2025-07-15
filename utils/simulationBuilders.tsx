import { Line, Text } from "react-konva";
import { JSX } from "react";
import { PedidoI } from "@/interfaces/simulation/pedido.interface";
import PedidoCanvas from "@/components/map/warehouse/order-package";
import { useMapContext } from "@/contexts/ContextMap";
export function generateGridLines(
  mapWidth: number,
  mapHeight: number,
  cellSizeX: number,
  cellSizeY: number
) {
  const lines: JSX.Element[] = [];
  let i = 0;

  for (let x = 0; x <= mapWidth; x += cellSizeX) {
    lines.push(
      <Line key={`x-${x}`} points={[x, 0, x, mapHeight]} strokeWidth={1} stroke="#95BDCA" />
    );
    /*    i++;
    if (i % 5 === 0) {
      lines.push(<Text key={`Num-x-${i}`} text={i.toString()} y={mapHeight - 10} x={x - 5} />);
    }*/
  }

  for (let y = 0; y <= mapHeight; y += cellSizeY) {
    lines.push(
      <Line key={`y-${y}`} points={[0, y, mapWidth, y]} strokeWidth={1} stroke="#95BDCA" />
    );
  }

  return lines;
}

export function generatePedidos(
  pedidos: PedidoI[],
  timerSimulacion: number,
  pedidosEntregados: number[]
) {
  const pedidosRender: JSX.Element[] = [];
  const { setPedidosI } = useMapContext();
  for (let i = 0; i < pedidos.length; i++) {
    const { id, anio, dia, hora, minuto, posX, posY } = pedidos[i];
    const inicioPedido = dia * 24 * 60 + hora * 60 + minuto;
    if (inicioPedido <= timerSimulacion && !pedidosEntregados.includes(id)) {
      pedidosRender.push(<PedidoCanvas posX={posX} posY={posY} key={id} />); //lo que dibujará
    }
    if (pedidosEntregados.includes(id)) {
      setPedidosI((prev) => prev.filter((pedido) => pedido.id !== id));
    }
    if (inicioPedido > timerSimulacion) break;
  }
  return pedidosRender;
}
