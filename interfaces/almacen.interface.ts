export interface AlmacenBackend {
  id: number;
  nombre: string;
  capacidad: number;
  ubicacion: {
    id: number;
    x: number;
    y: number;
    almacen: any;
  };
  capacidadDisponible: number;
  capacidadFicticia: number;
}

export interface AlmacenEstado {
  porcentajeUso: number;
  nivelCapacidad: "bajo" | "medio" | "alto" | "ilimitado";
  colorSemaforo: string;
  iconoEstado: string;
}
