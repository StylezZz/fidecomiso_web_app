"use client";

import React, { useEffect, useRef, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, Settings, Clock, Calendar, Play, Pause, Focus, RefreshCw, Zap } from "lucide-react";
import { differenceInMinutes } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface TimerInfo {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
}

interface RealTimeInfo {
  hour: number;
  minute: number;
  second: number;
}

interface TimerControlsInfo {
  initTimer: boolean;
  displaySpeed: number;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  onSpeedChange: (speed: number) => void;
}

interface ActionsInfo {
  onRefreshPedidos: () => void;
  onNewPedido: () => void;
  onNewAveria: () => void;
  onNewMantenimiento: () => void;
}

interface ElegantHeaderProps {
  setOpenSide: React.Dispatch<React.SetStateAction<boolean>>;
  onFitToScreen?: () => void;
  timer: TimerInfo;
  realTime: RealTimeInfo;
  timerControls: TimerControlsInfo;
  actions: ActionsInfo;
  isDiaADia?: boolean;
}

export const ElegantHeader: React.FC<ElegantHeaderProps> = ({
  setOpenSide,
  onFitToScreen,
  timer,
  realTime,
  timerControls,
  actions,
  isDiaADia = false,
}) => {
  const { day, month, year, hour, minute } = timer;
  const { hour: realHour, minute: realMinute, second: realSecond } = realTime;
  const { initTimer, displaySpeed, onStart, onStop, onRestart, onSpeedChange } = timerControls;
  const { onRefreshPedidos, onNewPedido, onNewAveria, onNewMantenimiento } = actions;

  const startDateTimeRef = useRef<Date | null>(null);
  if (!startDateTimeRef.current) {
    startDateTimeRef.current = new Date(year, month - 1, day, hour, minute);
  }

  const currentDateTime = new Date(year, month - 1, day, hour, minute);
  const totalMinutes = differenceInMinutes(currentDateTime, startDateTimeRef.current);

  const elapsedDays = Math.floor(totalMinutes / 1440);
  const remainAfterDays = totalMinutes % 1440;
  const elapsedHours = Math.floor(remainAfterDays / 60);
  const elapsedMinutes = remainAfterDays % 60;

  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatDisplayDate = (day: number, month: number, year: number) => {
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];
    return `${day} ${monthNames[month - 1]} ${year}`;
  };

  return (
    <header className="relative h-16 bg-white border-b border-gray-200 shadow-sm">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_gray_1px,_transparent_0)] bg-[size:20px_20px]"></div>
      </div>

      <div className="relative flex h-full items-center justify-between px-6 py-2">
        {/* LEFT: Título y controles de navegación */}
        <div className="flex items-center gap-4">
          {/* Indicador Día a Día */}
          {isDiaADia && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Zap className="h-3 w-3 mr-1" />
                Día a Día
              </Badge>
            </div>
          )}

          {/* Controles de Simulación */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
            <Button
              variant={initTimer ? "default" : "outline"}
              size="sm"
              onClick={onStart}
              className={`h-7 w-7 p-0 transition-all duration-200 ${
                initTimer
                  ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
              title="Iniciar simulación"
            >
              <Play className="h-3 w-3" />
            </Button>
            
            <Button
              variant={!initTimer ? "default" : "outline"}
              size="sm"
              onClick={onStop}
              className={`h-7 w-7 p-0 transition-all duration-200 ${
                !initTimer
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
              title="Pausar simulación"
            >
              <Pause className="h-3 w-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onRestart}
              className="h-7 w-7 p-0 border-gray-300 text-gray-600 hover:bg-gray-100"
              title="Reiniciar simulación"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>

            {/* Controles de Velocidad */}
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-300">
              {[0.5, 1, 2, 4].map((speed) => (
                <Button
                  key={speed}
                  variant={displaySpeed === speed ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSpeedChange(speed)}
                  className={`h-6 px-1.5 text-xs transition-all duration-200 ${
                    displaySpeed === speed
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {speed}x
                </Button>
              ))}

              {onFitToScreen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFitToScreen}
                  className="h-6 w-6 p-0 border-gray-300 text-gray-600 hover:bg-gray-100 ml-1"
                  title="Ajustar mapa a pantalla"
                >
                  <Focus className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* CENTER: Información Principal */}
        <div className="flex items-center gap-5">
          {/* Simulación */}
          <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-1 border border-blue-200 shadow-sm">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div className="text-center leading-none">
              <div className="text-xs text-blue-600 font-medium mb-0.5">Simulación</div>
              <div className="text-xs font-bold text-gray-900">
                {formatDisplayDate(day, month, year)}
              </div>
              <div className="text-xs text-gray-600">
                {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="h-8 w-px bg-gray-300"></div>

          {/* Tiempo Real */}
          <div className="flex items-center gap-3 bg-emerald-50 rounded-xl px-4 py-1 border border-emerald-200 shadow-sm">
            <Clock className="h-5 w-5 text-emerald-600" />
            <div className="text-center leading-none">
              <div className="text-xs text-emerald-600 font-medium mb-0.5">Tiempo Real</div>
              <div className="text-xs font-bold text-gray-900">
                {String(realHour).padStart(2, "0")}:{String(realMinute).padStart(2, "0")}:
                {String(realSecond).padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="h-8 w-px bg-gray-300" />

          {/* Tiempo Transcurrido */}
          <div className="flex items-center gap-3 bg-yellow-50 rounded-xl px-4 py-1 border border-yellow-200 shadow-sm">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div className="text-center">
              <div className="text-xs text-yellow-600 font-medium mb-0.5">Tiempo Transcurrido</div>
              <div className="text-xs font-bold text-gray-900 leading-tight">
                {elapsedDays}d {elapsedHours}h {elapsedMinutes}m
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Acciones Principales */}
        <div className="flex items-center gap-2">
          {/* Botón de refrescar pedidos */}
          <Button
            onClick={onRefreshPedidos}
            size="sm"
            variant="outline"
            className="border-gray-300 text-gray-600 hover:bg-gray-100 group transition-all duration-200"
            title="Actualizar pedidos"
          >
            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
          </Button>

          {/* Nuevo Pedido */}
          <Button
            onClick={onNewPedido}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white border-0 group transition-all duration-200 px-4"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
            Nuevo Pedido
          </Button>

          {/* Mantenimiento */}
          <Button
            onClick={onNewMantenimiento}
            size="sm"
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 group transition-all duration-200 px-4"
          >
            <Settings className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
            Mantenimiento
          </Button>

          {/* Avería */}
          <Button
            onClick={onNewAveria}
            size="sm"
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 group transition-all duration-200 px-4"
          >
            <AlertTriangle className="h-4 w-4 mr-2 group-hover:animate-pulse" />
            Avería
          </Button>
        </div>
      </div>

      {/* Línea de acento inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-300/50 to-transparent"></div>
    </header>
  );
};
