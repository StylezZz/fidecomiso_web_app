import { SimulationType } from "@/interfaces/simulation.interface";
import SimulationService from "@/services/simulation.service";
import { set } from "date-fns";
import React, { SetStateAction, useEffect, useState } from "react";

export interface manageTimeReturn {
  simulationDate: Date | null;
  initTimer: boolean;
  speedTime: number;
  displaySpeed: number;
  speedReal: number;
  intervalMs: number;
  minutosPorIteracion: number;
  loadingInit: boolean;
  errorInit: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  restartTimer: (callback?: () => void) => void;
  doPlusSpeed: (plus: number) => void;
}
export interface manageTimeProps {
  tipo?: SimulationType;
  simulacionIniciada: boolean;
  setSimulacionIniciada: React.Dispatch<SetStateAction<boolean>>;
}

export const useManageTime = ({
  tipo,
  setSimulacionIniciada,
  simulacionIniciada,
}: manageTimeProps): manageTimeReturn => {
  const [simulationDate, setSimulationDate] = useState<Date | null>(null);
  const [initTimer, setInitTimer] = useState<boolean>(false); //maneja el inicio de la simlaucion si está en pausa o continua
  const [speedTime, setSpeedTime] = useState<number>(1);
  const [displaySpeed, setDisplaySpeed] = useState<number>(1);
  const [speedReal, setSpeedReal] = useState<number>(1);
  const [intervalMs, setIntervalMs] = useState<number>(1000);
  const [minutosPorIteracion, setMinutosPorIteracion] = useState<number>(1);
  const [loadingInit, setLoadingInit] = useState<boolean>(false); //para la primera llamada de inicialización
  const [errorInit, setErrorInit] = useState<boolean>(false);
  useEffect(() => {
    if (tipo === undefined) return;
    setIntervalMs(tipo == SimulationType.DIA_DIA ? 10 / speedTime : 10 / speedTime);
    setMinutosPorIteracion(tipo == SimulationType.DIA_DIA ? 18 : 18);
  }, [tipo]);

  useEffect(() => {
    if (tipo === undefined) return;
    setIntervalMs(tipo == SimulationType.DIA_DIA ? 10 / speedTime : 10 / speedTime);
    console.log("ACTUALIZO LA VELOCIDAD - Speed:", speedTime, "Display:", displaySpeed);
  }, [speedTime]);

  const startTimer = async () => {
    if (initTimer) return; // si está corriendo no deberia hacer nada

    if (simulacionIniciada && !initTimer) {
      //si ya se iniicio y está en pausa, se inica
      setInitTimer(true);
      return;
    }
    //si todavia no inicio nada
    setLoadingInit(true);
    setErrorInit(false);
    try {
      //aqui es dondde inicio el simulacion
      const response = await SimulationService.inicializarTipoSimulacion(
        tipo == SimulationType.DIA_DIA ? 1 : tipo == SimulationType.SEMANAL ? 2 : 3
      );
      setSimulacionIniciada(true);
      setInitTimer(true);
    } catch (error) {
      console.error("error", error);
      alert("Error al cargar el aalgoritmo");
      setLoadingInit(false);
      setErrorInit(true);
    } finally {
      setLoadingInit(false);
    }
  };
  const stopTimer = () => {
    if (!initTimer) return;
    setInitTimer(false);
  };
  const restartTimer = (callback?: () => void) => {
    setInitTimer(false);
    setSimulationDate(new Date());
    setSpeedTime(1); // Reset speed to default
    setDisplaySpeed(1); // Reset display speed to default
    callback?.(); //para el reseteo d timereal y simulation
  };
  const doPlusSpeed = (newSpeed: number) => {
    if (newSpeed === 1) {
      // Resetear a velocidad normal
      setSpeedTime(1);
      setDisplaySpeed(1);
    } else {
      // Cambiar velocidad multiplicativamente (x2 o x0.5)
      const newDisplaySpeed = displaySpeed * newSpeed;
      if (newDisplaySpeed <= 2 && newDisplaySpeed >= 0.5) {
        setSpeedTime(speedTime * newSpeed);
        setDisplaySpeed(newDisplaySpeed);
      }
    }
  };

  return {
    simulationDate,
    initTimer,
    speedTime,
    displaySpeed,
    speedReal,
    startTimer,
    stopTimer,
    restartTimer,
    doPlusSpeed,
    intervalMs,
    minutosPorIteracion,
    loadingInit,
    errorInit,
  };
};
