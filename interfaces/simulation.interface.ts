export enum SimulationType{
    COLAPSO = "Colapso",
    SEMANAL = "Semanal",
    DIA_DIA = "Dia a Dia"
}

export interface SimulationInterface{
    key?:string,
    tipo?: SimulationType,
    fechaInicial: string,
    fechaFinal?: string,
    hora:string,
    mesPedido:number,  
    anioPedido:number,
    mesBloqueo:number,
    anioBloqueo:number,
    //para saber desde cuando inicia
    anio:number,
    mes:number,
    dia:number,
    ihora:number,
    iminuto:number
    active:boolean,
    pedidosNum?:number
}

