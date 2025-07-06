import { NodoBloqueadoI } from "./node.interfaces"

export interface BloqueoI {
  id: number
  anio: number
  mes: number
  diaInicio: number
  horaInicio: number
  minutoInicio: number
  diaFin: number
  horaFin: number
  minutoFin: number
  fechaInicio: string
  fechaFin: string
  tramo: NodoBloqueadoI[]
}