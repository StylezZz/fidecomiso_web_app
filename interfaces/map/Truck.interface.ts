import { RouteTruck } from "./Route.interface";
import { Node } from "./node.interface";
export const enum TypeTruck{
    TA = "TA",
    TB = "TB",
    TC = "TC",
    TD = "TD",
}

interface TrunkBase {
    id : number,
    estado?: string,
    nombreConductor?:string,
    cargaActual?: number,
    velocidadPromedio: number,
    combustible?:number,
    placa: string,
    capacidadGLP:number,
    hasBreakdown?: boolean,
    tipoCamion: TypeTruck,
    ubicacion?: Node,
    pesoGLP?: number,
    pesoBruto?:number,
    pesoTotal?:number,
}
//interface de Trunk 
export interface Trunk extends TrunkBase{
    route?:RouteTruck
}
//este interface es para estructurar el JSON de fetch
export interface TrunkFetch extends TrunkBase{
    rutasAsignadas?: RouteTruck[]
}



