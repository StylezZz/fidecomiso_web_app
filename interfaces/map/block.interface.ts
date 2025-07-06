import { Node } from "./node.interface";
export interface Block{
   nodosBloqueados: Node[],
   fechaInicio?:string,
   fechaFin?:string,
   //mejorarlo despues
   diaRIni:number,
   diaRFin:number, 
   horaRIni:number, 
   horaRFin:number, 
   minRIni:number, 
   minRFin:number, 
}