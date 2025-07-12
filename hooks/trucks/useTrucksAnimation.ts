import { useState, useEffect, useRef } from "react";
import Konva from "konva";
import { Node } from "@/interfaces/map/node.interface";
import { RouteTruck } from "@/interfaces/map/Route.interface";
import useCalRoute from "@/hooks/useCalRoute";
import { useMapContext } from "@/contexts/MapContext";
import { on } from "events";

interface UseTruckAnimationProps {
  route: RouteTruck | undefined;
  truckPlate: string;
  onOrderDelivery?: (newX: number, newY: number) => void;
}

const useTruckAnimation = ({ route, truckPlate,onOrderDelivery }: UseTruckAnimationProps) => {
    const { mapData, manageTime, setTrucks } = useMapContext();
    const { initTimer, speedTime } = manageTime;
    const { cellSizeXValue, cellSizeYValue, mapHeight } = mapData;
    const { calculatePos, calculateRotation, calculatePosInverso } = useCalRoute();

    const [currNode, setCurrNode] = useState<number>(0);
    const [xPos, setXPos] = useState<number>(0);
    const [yPos, setYPos] = useState<number>(0);
    const [angularRotation, setAngularRotation] = useState<number>(0);
    
    const onRoute = useRef<boolean>(false);
    const animationRef = useRef<Konva.Animation | null>(null);
    const rotationTargetRef = useRef<number>(0);

    // Posicionamiento inicial del camión
    useEffect(() => {
        if (!route?.nodosVisitados?.length) return;

        const nodes = route.nodosVisitados;
        const { x, y } = calculatePos(cellSizeXValue, cellSizeYValue, nodes[0].x, nodes[0].y, mapHeight);
        const angle = calculateRotation(nodes[0], nodes[1]);
        
        setXPos(x);
        setYPos(y);
        setAngularRotation(angle);
        rotationTargetRef.current = angle;

        // Actualizar posición del camión en el contexto
        const { x: newX, y: newY } = calculatePosInverso(cellSizeXValue, cellSizeYValue, x, y, mapHeight);
        const nodePos: Node = { x: newX, y: newY, isBloq: true };
        
        setTrucks(prev => prev.map(t => 
        t.placa === truckPlate ? { ...t, ubicacion: nodePos } : t
        ));
    }, [route]);

    // Animación entre nodos
    useEffect(() => {
        if (!route?.nodosVisitados?.length || currNode >= route.nodosVisitados.length - 1 || !initTimer) {
        onRoute.current = false;
        return;
        }

        onRoute.current = true;
        
        if (animationRef.current) {
        animationRef.current.stop();
        }

        const nodes = route.nodosVisitados;
        const startPos = calculatePos(cellSizeXValue, cellSizeYValue, nodes[currNode].x, nodes[currNode].y, mapHeight);
        const endPos = calculatePos(cellSizeXValue, cellSizeYValue, nodes[currNode + 1].x, nodes[currNode + 1].y, mapHeight);
        
        const frameTime = (60 / 50) * speedTime;
        const targetAngle = calculateRotation(nodes[currNode], nodes[currNode + 1]);
        const startRotation = angularRotation;
        const rotationDiff = ((targetAngle - startRotation + 180) % 360) - 180;
        const rotationDuration = (speedTime / 500) * 250;

        let rotationStartTime: number | null = null;

        animationRef.current = new Konva.Animation((frame) => {
        if (!frame) return;

        // Rotación
        if (!rotationStartTime) {
            rotationStartTime = frame.time;
        }

        const rotationProgress = Math.min(1, (frame.time - rotationStartTime) / rotationDuration);
        const currentRotation = startRotation + rotationDiff * rotationProgress;
        setAngularRotation(currentRotation);

        // Posición
        const positionProgress = Math.min(1, frame.time / frameTime);
        const newX = startPos.x + (endPos.x - startPos.x) * positionProgress;
        const newY = startPos.y + (endPos.y - startPos.y) * positionProgress;
        
        setXPos(newX);
        setYPos(newY);

        // Actualizar posición en el contexto
        const { x, y } = calculatePosInverso(cellSizeXValue, cellSizeYValue, newX, newY, mapHeight);
        const nodePos: Node = { x, y, isBloq: true };
        
        setTrucks(prev => prev.map(t => 
            t.placa === truckPlate ? { ...t, ubicacion: nodePos } : t
        ));

        if(onOrderDelivery)onOrderDelivery(newX, newY);

        if (positionProgress >= 1) 
            setCurrNode(currNode + 1);
        });

        animationRef.current.start();

        return () => {
        if (animationRef.current) 
            animationRef.current.stop();
        };
    }, [initTimer,speedTime,currNode,route]);

    return {
        currNode,
        setCurrNode,
        xPos,
        yPos,
        angularRotation,
        onRoute
    };
}

export default useTruckAnimation;