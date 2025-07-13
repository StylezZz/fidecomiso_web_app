import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Plus,
  AlertTriangle,
  Settings,
  Clock,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  Focus,
} from "lucide-react";

interface ElegantHeaderProps {
  day: number;
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

        {/* CENTER: Primary Information (Most Important) */}
        <div className="flex items-center gap-6">
          {/* Simulation Time */}
          <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-1 border border-blue-200 shadow-sm">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div className="text-center">
              <div className="text-xs text-blue-600 font-medium mb-0.5">Simulación</div>
              <div className="text-md font-bold text-gray-900 leading-tight">
                {day}d {String(hour).padStart(2, "0")}h {String(minute).padStart(2, "0")}m
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-300"></div>

          {/* Real Time */}
          <div className="flex items-center gap-3 bg-emerald-50 rounded-xl px-4 py-1 border border-emerald-200 shadow-sm">
            <Clock className="h-5 w-5 text-emerald-600" />
            <div className="text-center">
              <div className="text-xs text-emerald-600 font-medium mb-0.5">Tiempo Real</div>
              <div className="text-md font-bold text-gray-900 leading-tight">
                {String(realHour).padStart(2, "0")}:{String(realMinute).padStart(2, "0")}:
                {String(realSecond).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Primary Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowPedidoModal(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white border-0 group transition-all duration-200 px-4"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
            Nuevo Pedido
          </Button>

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
