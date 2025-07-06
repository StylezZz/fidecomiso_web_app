import { Node } from "@/interfaces/map/node.interface"
import { Route } from "@/interfaces/newinterfaces/vehiculos.interface"

enum Direction {
    IZQUIERDA = "Izquierda",
    DERECHA = "Derecha",
    ARRIBA = "Arriba",
    ABAJO = "Abajo",
}

const useCalRoute = () => {

    const verifyDirection = (initNode : Node, endNode : Node) =>{
        if(initNode.x === endNode.x){
            if(initNode.y > endNode.y)return Direction.ABAJO
            else return Direction.ARRIBA
        }
        if(initNode.y === endNode.y){
            if(initNode.x > endNode.x)return Direction.IZQUIERDA
            else return Direction.DERECHA
        }
    }

    const calculateRotation = (currentNode: Route, nextNode: Route): number => {
        const dx = nextNode.x - currentNode.x;
        const dy = nextNode.y - currentNode.y;
        
        const angleRad = Math.atan2(-dy, dx);
        
        let angleDeg = angleRad * (180 / Math.PI);
        
        angleDeg += 90;
        //webada de normalizacion, qe olvide xd
        if (angleDeg < 0) angleDeg += 360;
        if (angleDeg >= 360) angleDeg -= 360;
        
        return angleDeg;
    };

    //como el origen está webeado, se debe hacer así para que posicionarlo en el mapa. TRANSFORMA COORDENADAS LOGICAS A COORDENADAS CANVAS
    const calculatePos = (cellSizeX : number, cellSizeY : number, posX:number,posY: number,heightMap:number) => {
        const x = Math.floor(posX*cellSizeX);
        const y = Math.floor(heightMap - posY*cellSizeY);
        return {x,y};
    }   
    //TRANSFORMA COORDENADAS CANVAS A LÓGICAS
    const calculatePosInverso = (cellSizeX : number, cellSizeY : number, posX:number,posY: number,heightMap:number) =>{
        const x = parseInt((posX / cellSizeX).toFixed(2));
        const y = parseInt(((heightMap - posY) / cellSizeY).toFixed(2));
        return { x, y };
    }

    const transformFormatTime = (dateFormat : string) : number =>{
        const regex = /(\d+)d(\d+)h(\d+)m/;
        const match = dateFormat.match(regex);
        if(match == null)return -1;

        const day = parseInt(match[1]);
        const hour = parseInt(match[2]);
        const minute = parseInt(match[3]);

        return Number((day*hour*minute).toPrecision(2));
    }

    return{
        verifyDirection,
        calculatePos,
        calculatePosInverso,
        calculateRotation,
        transformFormatTime
    }
}
export default useCalRoute;