export enum TipoAveria {
    LEVE = "LEVE",    // Equivalente a TI1
    MODERADO = "MODERADO",  // Equivalente a TI2
    GRAVE = "GRAVE",   // Equivalente a TI3
    MANTENIMIENTO = "MANTENIMIENTO"  // NUEVO - Equivalente a TI4
}

export interface AveriaI{
    id:number,
    turnoAveria:number,
    codigoCamion:string,
    tipoAveria: TipoAveria,
    descripcion:string
}