import { Ruta } from "./Route.interface";
import { Nodo } from "./node.interface";

export const enum TipoCamion {
  TA = "TA",
  TB = "TB",
  TC = "TC",
  TD = "TD",
}

interface CamionI {
  id: number;
  estado?: string;
  nombreConductor?: string;
  cargaActual?: number;
  velocidadPromedio: number;
  combustible?: number;
  placa: string;
  capacidadGLP: number;
  hasBreakdown?: boolean;
  tipoCamion: TipoCamion;
  ubicacion?: Nodo;
  pesoGLP?: number;
  pesoBruto?: number;
  pesoTotal?: number;
}
export interface CamionConRuta extends CamionI {
  route?: Ruta;
}
export interface CamionConRutas extends CamionI {
  rutasAsignadas?: Ruta[];
}
