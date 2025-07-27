//import React, { useRef } from "react";
import React, { useEffect, useRef, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, Settings, Clock, Calendar, Play, Pause, Focus } from "lucide-react";
import { differenceInMinutes } from "date-fns";
import { useSimulationContext } from "@/contexts/ContextSimulation";
import { SimulationType } from "@/interfaces/simulation.interface";


interface ElegantHeaderProps {
  
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  realHour: number;
  realMinute: number;
  realSecond: number;
  setShowPedidoModal: (show: boolean) => void;
  setShowAveriaModal: (show: boolean) => void;
  setShowMantenimientoModal: (show: boolean) => void;

  // Controles de simulación
  initTimer: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;

  // Controles de velocidad
  displaySpeed: number;
  onSpeedChange: (speed: number) => void;

  // Control de mapa
  onFitToScreen?: () => void;
}

export const ElegantHeader: React.FC<ElegantHeaderProps> = ({
  day,
  month,
  year,
  hour,
  minute,
  realHour,
  realMinute,
  realSecond,
  setShowPedidoModal,
  setShowAveriaModal,
  setShowMantenimientoModal,
  initTimer,
  onPlay,
  onPause,
  onReset,
  displaySpeed,
  onSpeedChange,
  onFitToScreen,
}) => {
  const { simulacionSeleccionada } = useSimulationContext();
  const simulationType = simulacionSeleccionada?.tipo;   // "Semanal" | "Dia a Dia" | "Colapso"

  const startDateTimeRef = useRef<Date | null>(null);
  if (!startDateTimeRef.current) {
    // capturamos la fecha completa (día + hora + minuto) en el primer render
    startDateTimeRef.current = new Date(year, month - 1, day, hour, minute);
  }


  useEffect(() => {
    // Cada vez que pulsas “Reset” tu componente padre suele poner initTimer = false
    // y vuelve a poner la fecha/hora de inicio. Detectamos eso:
    if (!initTimer) {
      startDateTimeRef.current = new Date(year, month - 1, day, hour, minute);
    }
  }, [initTimer, day, month, year, hour, minute]);

  const currentDateTime = new Date(year, month - 1, day, hour, minute);
  const totalMinutes = differenceInMinutes(currentDateTime, startDateTimeRef.current);

  const elapsedDays = Math.floor(totalMinutes / 1440); // 60 * 24
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
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    return `${day} ${monthNames[month - 1]} ${year}`;
  };

  return (
    <header className="relative h-16 bg-white border-b border-gray-200 shadow-sm">
      {/* Subtle pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_gray_1px,_transparent_0)] bg-[size:20px_20px]"></div>
      </div>

      <div className="relative flex h-full items-center justify-between px-6 py-2">
        {/* LEFT: Navigation & Secondary Controls */}
        <div className="flex items-center gap-4">
          {/* Simulation Controls */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
            <Button
              variant={initTimer ? "default" : "outline"}
              size="sm"
              onClick={onPlay}
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
              onClick={onPause}
              className={`h-7 w-7 p-0 transition-all duration-200 ${
                !initTimer
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
              title="Pausar simulación"
            >
              <Pause className="h-3 w-3" />
            </Button>

            {/* Speed & Map Controls */}
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-300">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSpeedChange(0.5)}
                disabled={displaySpeed <= 0.5}
                className="h-6 px-1.5 text-xs border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                0.5x
              </Button>
              <div className="bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 rounded border border-gray-300 min-w-[32px] text-center font-medium">
                {displaySpeed}x
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSpeedChange(2)}
                disabled={displaySpeed >= 2}
                className="h-6 px-1.5 text-xs border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                2x
              </Button>

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

        {/* CENTER: Primary Information */}
        <div className="flex items-center gap-5">
          {/* Simulación (azul) */}
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


          {/* Separator */}
          <div className="h-8 w-px bg-gray-300"></div>

          {/* Tiempo Real (verde) */}
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
        
        {/* Tiempo Simulación */}
          <div className="flex items-center gap-3 bg-yellow-50 rounded-xl px-4 py-1 border border-yellow-200 shadow-sm">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div className="text-center">
              <div className="text-xs text-yellow-600 font-medium mb-0.5">Tiempo Simulación</div>
              <div className="text-xs font-bold text-gray-900 leading-tight">
                {elapsedDays}d {elapsedHours}h {elapsedMinutes}m
              </div>
            </div>
          </div>
        
        {/* Separador */}
          <div className="h-8 w-px bg-gray-300" />
        
        {/* Fecha Actual */}
          <div className="flex items-center gap-3 bg-violet-50 rounded-xl px-4 py-1 border border-violet-200 shadow-sm">
            <Calendar className="h-5 w-5 text-violet-600" />
            <div className="text-center">
              <div className="text-[10px] text-violet-600 font-medium mb-0.5">
                Fecha Actual
              </div>
              <div className="text-[10px] font-bold text-gray-900 leading-tight">
                {formatDisplayDate(
                  now.getDate(),
                  now.getMonth() + 1,
                  now.getFullYear()
                )}
              </div>
              <div className="text-[10px] text-gray-600 leading-tight">
                {String(now.getHours()).padStart(2, "0")}:
                {String(now.getMinutes()).padStart(2, "0")}
              </div>
            </div>
          </div>
          
        </div>
        {/* RIGHT: Primary Actions */}
        <div className="flex items-center gap-2">
          {simulationType !== SimulationType.SEMANAL && (
            <Button
              onClick={() => setShowPedidoModal(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 group transition-all duration-200 px-4"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
              Nuevo Pedido
            </Button>
          )}

          <Button
            onClick={() => setShowMantenimientoModal(true)}
            size="sm"
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 group transition-all duration-200 px-4"
          >
            <Settings className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
            Mantenimiento
          </Button>

          <Button
            onClick={() => setShowAveriaModal(true)}
            size="sm"
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 group transition-all duration-200 px-4 relative overflow-hidden"
          >
            <AlertTriangle className="h-4 w-4 mr-2 group-hover:animate-pulse" />
            Avería
          </Button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
    </header>
  );
};
