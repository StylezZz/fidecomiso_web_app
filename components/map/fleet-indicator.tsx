import React, { useState } from "react";
import { useFleetStats } from "@/hooks/use-fleet-stats";
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";

interface FleetIndicatorProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  compact?: boolean;
  showDetails?: boolean;
  hideable?: boolean; // Nueva prop para permitir ocultar
}

export const FleetIndicator: React.FC<FleetIndicatorProps> = ({
  position = "top-right",
  compact = false,
  showDetails = true,
  hideable = true
}) => {
  const stats = useFleetStats();
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case "top-left": return "top-4 left-4";
      case "top-right": return "top-4 right-4";
      case "bottom-left": return "bottom-4 left-4";
      case "bottom-right": return "bottom-4 right-4";
      default: return "top-4 right-4";
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return "text-red-600 bg-red-50 border-red-200";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (percentage >= 40) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return "bg-red-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 80) return "Casi llena";
    if (percentage >= 60) return "Carga alta";
    if (percentage >= 40) return "Carga media";
    if (percentage > 0) return "Carga baja";
    return "Flota vacía";
  };

  // Si está oculto, mostrar solo el botón flotante
  if (!isVisible && hideable) {
    return (
      <div className={`absolute ${getPositionClasses()} z-10`}>
        <button
          onClick={() => setIsVisible(true)}
          className="bg-white rounded-full shadow-lg border-2 border-gray-200 p-2 hover:bg-gray-50 transition-all duration-200 group"
          title="Mostrar indicador de flota"
        >
          <div className="flex items-center gap-1">
            <Eye size={16} className="text-gray-600 group-hover:text-gray-800" />
            <div 
              className={`w-2 h-2 rounded-full ${getStatusColor(stats.overallPercentage)} animate-pulse`}
            />
          </div>
        </button>
      </div>
    );
  }

  // Versión compacta - Solo porcentaje principal
  if (compact) {
    return (
      <div className={`absolute ${getPositionClasses()} z-10`}>
        <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 px-4 py-3 relative">
          {/* Botón de ocultar para versión compacta */}
          {hideable && (
            <button
              onClick={() => setIsVisible(false)}
              className="absolute -top-2 -right-2 bg-gray-100 rounded-full p-1 hover:bg-gray-200 transition-colors"
              title="Ocultar indicador"
            >
              <EyeOff size={12} className="text-gray-600" />
            </button>
          )}
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div 
                className={`w-3 h-3 rounded-full ${getStatusColor(stats.overallPercentage)} animate-pulse`}
                title={getStatusText(stats.overallPercentage)}
              />
              <span className="text-sm font-bold text-gray-800">
                🚛 {stats.totalTrucks}
              </span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getPercentageColor(stats.overallPercentage)}`}>
              {stats.overallPercentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Versión completa
  return (
    <div className={`absolute ${getPositionClasses()} z-10`}>
      <div className="bg-white rounded-xl shadow-xl border-2 border-gray-200 p-5 min-w-[320px] backdrop-blur-sm bg-white/95 relative">
        
        {/* Controles del header */}
        <div className="absolute top-3 right-3 flex gap-1">
          {/* Botón minimizar/expandir */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="bg-gray-100 rounded-full p-1 hover:bg-gray-200 transition-colors"
            title={isMinimized ? "Expandir" : "Minimizar"}
          >
            {isMinimized ? (
              <ChevronDown size={14} className="text-gray-600" />
            ) : (
              <ChevronUp size={14} className="text-gray-600" />
            )}
          </button>
          
          {/* Botón ocultar */}
          {hideable && (
            <button
              onClick={() => setIsVisible(false)}
              className="bg-gray-100 rounded-full p-1 hover:bg-gray-200 transition-colors"
              title="Ocultar indicador"
            >
              <EyeOff size={14} className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pr-16">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            🚛 Estado de Flota
            <div 
              className={`w-3 h-3 rounded-full ${getStatusColor(stats.overallPercentage)} animate-pulse`}
              title={getStatusText(stats.overallPercentage)}
            />
          </h3>
          <div className={`px-4 py-2 rounded-full text-xl font-bold border-2 shadow-sm ${getPercentageColor(stats.overallPercentage)}`}>
            {stats.overallPercentage.toFixed(1)}%
          </div>
        </div>

        {/* Contenido colapsable */}
        {!isMinimized && (
          <>
            {/* Estado general */}
            <div className="mb-4 text-center">
              <div className={`text-sm font-medium ${getPercentageColor(stats.overallPercentage).split(' ')[0]}`}>
                {getStatusText(stats.overallPercentage)}
              </div>
            </div>

            {/* Barra de progreso global */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span className="font-medium">Capacidad Total</span>
                <span className="font-mono font-bold">
                  {stats.totalCurrentLoad.toFixed(1)} / {stats.totalCapacity} m³
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 border shadow-inner">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${getStatusColor(stats.overallPercentage)} shadow-sm`}
                  style={{ width: `${Math.min(stats.overallPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Estadísticas detalladas */}
            {showDetails && (
              <div className="space-y-3">
                {/* Primera fila - Estados operativos */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200 hover:bg-green-100 transition-colors">
                    <div className="text-lg font-bold text-green-700">{stats.inTransitTrucks}</div>
                    <div className="text-xs text-green-600 font-medium">En Ruta</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 hover:bg-blue-100 transition-colors">
                    <div className="text-lg font-bold text-blue-700">{stats.trucksInWarehouse}</div>
                    <div className="text-xs text-blue-600 font-medium">En Almacén</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200 hover:bg-red-100 transition-colors">
                    <div className="text-lg font-bold text-red-700">{stats.maintenanceTrucks}</div>
                    <div className="text-xs text-red-600 font-medium">Averiados</div>
                  </div>
                </div>

                {/* Segunda fila - Estados de carga */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="text-lg font-bold text-gray-700">{stats.emptyTrucks}</div>
                    <div className="text-xs text-gray-600 font-medium">Vacíos</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 hover:bg-purple-100 transition-colors">
                    <div className="text-lg font-bold text-purple-700">{stats.totalTrucks - stats.emptyTrucks}</div>
                    <div className="text-xs text-purple-600 font-medium">Con Carga</div>
                  </div>
                </div>

                {/* Resumen total */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
                  <div className="text-sm text-slate-600 font-medium">Total de Camiones</div>
                  <div className="text-2xl font-bold text-slate-800">{stats.totalTrucks}</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
