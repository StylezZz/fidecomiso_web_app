"use client";
import { SimulationInterface, SimulationType } from "@/interfaces/simulation.interface";
import BlockService from "@/services/blockages.service";
import PedidosService from "@/services/orders.service";
import { createContext, useContext, useEffect, useState } from "react";
interface SimulationContextType {
  simulaciones: SimulationInterface[];
  getAllSimulacion: () => void;
  saveSimulacion: (simulacionNueva: SimulationInterface) => void;
  deleteSimulacion: (simulacionDelete: SimulationInterface) => void;
  obtenerArchivosPedidos: () => Promise<any>;
  obtenerArchivosBloqueos: () => Promise<any>;
  loadingSimulaciones: boolean;
  seleccionarSimulacion: (simulacion: SimulationInterface) => void;
  verificarSimulacionSeleccionada: () => boolean;
  simulacionSeleccionada: SimulationInterface;
}
const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider = ({ children }: { children: React.ReactNode }) => {
  const [simulaciones, setSimulaciones] = useState<SimulationInterface[]>([]);
  const [loadingSimulaciones, setLoadingSimulaciones] = useState<boolean>(false);

  const [simulacionSeleccionada, setSimulacionSeleccionada] = useState<SimulationInterface>({
    key: "",
    active: false,
    anio: -1,
    anioBloqueo: -1,
    anioPedido: -1,
    dia: -1,
    hora: "",
    fechaInicial: "",
    ihora: -1,
    iminuto: -1,
    mes: -1,
    mesBloqueo: -1,
    mesPedido: -1,
    fechaFinal: "",
    tipo: undefined,
  });

  //funciones para el manejo de la nueva simulación
  const seleccionarSimulacion = (simulacion: SimulationInterface) => {
    setSimulacionSeleccionada(simulacion);
  };
  const verificarSimulacionSeleccionada = (): boolean => {
    return simulacionSeleccionada.active;
  };

  //función para obtener los nombres de los pedidos y bloqueos existentes
  const obtenerArchivosPedidos = async () => {
    const resPedidos = await PedidosService.getNombrePedidosCargados();
    console.log(resPedidos);
    return resPedidos.data.nombresPedidos;
  };
  const obtenerArchivosBloqueos = async () => {
    const resBloqueso = await BlockService.getNombreBloqueosCargados();
    console.log(resBloqueso);
    return resBloqueso.data.nombresBloqueos;
  };

  const getAllSimulacion = async () => {
    setLoadingSimulaciones(true);
    const simulacionLocal: SimulationInterface[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("simulacion-")) continue;
      const value: string | null = localStorage.getItem(key);
      if (!value) continue;
      const parsedSimulacion: SimulationInterface = JSON.parse(value);
      simulacionLocal.push(parsedSimulacion);
    }
    setSimulaciones(simulacionLocal);
    setLoadingSimulaciones(false);
  };

  const saveSimulacion = (simulacionNueva: SimulationInterface) => {
    const key = "simulacion-" + simulaciones.length.toString();
    simulacionNueva.key = key; //guardo con key
    const simulacionString = JSON.stringify(simulacionNueva);
    localStorage.setItem(key, simulacionString);
    setSimulaciones((prev) => [...prev, simulacionNueva]);
  };
  const deleteSimulacion = (simulacionDelete: SimulationInterface) => {
    let key = simulacionDelete.key;
    localStorage.removeItem(key!);
    setSimulaciones((prev) => prev.filter((simu) => simu.key != key));
  };

  return (
    <SimulationContext.Provider
      value={{
        simulaciones,
        getAllSimulacion,
        saveSimulacion,
        obtenerArchivosBloqueos,
        obtenerArchivosPedidos,
        loadingSimulaciones,
        seleccionarSimulacion,
        verificarSimulacionSeleccionada,
        simulacionSeleccionada,
        deleteSimulacion,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulationContext = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useMapContext debe estar dentro de un simulationProvider");
  }
  return context;
};
