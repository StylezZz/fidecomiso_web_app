import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useMapContext } from "@/contexts/ContextMap";
import { useSimulationContext } from "@/contexts/ContextSimulation";
import { DialogDescription } from "@radix-ui/react-dialog";
import {
  Calendar,
  CheckCircle,
  Clock,
  Package,
  RefreshCw,
  AlertTriangle,
  XCircle,
  MapPin,
  User,
} from "lucide-react";
import { formatearFecha } from "@/utils/fetchTransform";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useReports } from "@/hooks/use-reports";
import { useEffect, useState } from "react";

interface FinishModalProps {
  isOpen: boolean;
}

export const FinishModal = ({ isOpen }: FinishModalProps) => {
  const { simulacionSeleccionada } = useSimulationContext();
  const { tipo, dia, anio, mes, ihora, iminuto } = simulacionSeleccionada;
  const { manageTime, realTime, simulationTime, setFinish, tipoFinalizacion, pedidosVencidos, cantidadEntregados, pedidosI } =
    useMapContext();
  const { day, hour: simuHour, minute: simMinute } = simulationTime.time;
  const { hour, minute, second } = realTime.realTime;
  // const { data } = useReports(); // Comentado temporalmente

  const dateInit = new Date(anio, mes - 1, dia, ihora, iminuto);
  const dateFin = new Date(dateInit);
  dateFin.setDate(dateFin.getDate() + (day - dia));
  dateFin.setHours(simuHour);
  dateFin.setMinutes(simMinute);

  const formattedDate = formatearFecha(dateInit);
  const formateDateFin = formatearFecha(dateFin);

  // ✅ DATOS CALCULADOS DEL CONTEXTO DEL MAPA
  const pedidosEntregados = cantidadEntregados || 0;
  const totalPedidos = pedidosI?.length || 0;
  const isLoadingPedidos = false; // Ya no hay loading porque usamos datos del contexto

  // 🎯 DETECTAR SI ES COLAPSO
  // cambios del modal
  const esColapso = tipoFinalizacion === "colapso";

  // 🎯 CONTENIDO DINÁMICO SEGÚN TIPO
  const tituloModal = esColapso ? "¡Colapso Detectado!" : "¡Simulación Completada!";
  const descripcionModal = esColapso
    ? "La simulación se detuvo debido a pedidos no atendidos"
    : `La simulación ${tipo} ha finalizado exitosamente`;

  const iconoModal = esColapso ? (
    <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />
  ) : (
    <CheckCircle className="w-8 h-8 text-green-600 animate-ping" />
  );

  const colorFondo = esColapso ? "bg-red-100" : "bg-green-100";

  // ✅ REPRODUCIR SONIDO DE ALERTA PARA COLAPSO
  useEffect(() => {
    if (!isOpen || tipoFinalizacion !== "colapso") return;
    
    try {
      const audio = new Audio("/warningSound.mp3");
      audio.play().catch(error => {
        console.warn("No se pudo reproducir el sonido de alerta:", error);
      });
    } catch (error) {
      console.warn("Error al crear el audio:", error);
    }
  }, [isOpen, tipoFinalizacion]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <div className="relative">
            <div
              className={`w-20 h-20 mx-auto ${colorFondo} rounded-full flex items-center justify-center shadow-lg border-4 ${
                esColapso ? "border-red-300" : "border-green-300"
              }`}
            >
              {iconoModal}
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className={`w-32 h-32 ${colorFondo} rounded-full opacity-10 blur-sm`}></div>
            </div>
          </div>
          <DialogTitle className="text-3xl font-bold text-gray-900 text-center mt-4 tracking-tight">
            {tituloModal}
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600 text-center max-w-md mx-auto leading-relaxed">
            {descripcionModal}
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-2 bg-blue-200 rounded-full">
                <Calendar className="w-6 h-6 text-blue-700" />
              </div>
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Fecha de Inicio
              </span>
              <Badge className="bg-blue-600 text-white font-bold px-4 py-2 text-sm shadow-sm">
                {formattedDate}
              </Badge>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-2 bg-blue-200 rounded-full">
                <Calendar className="w-6 h-6 text-blue-700" />
              </div>
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Fecha de Finalización
              </span>
              <Badge className="bg-blue-600 text-white font-bold px-4 py-2 text-sm shadow-sm">
                {formateDateFin}
              </Badge>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-2 bg-purple-200 rounded-full">
                <Clock className="w-6 h-6 text-purple-700" />
              </div>
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Tiempo Transcurrido
              </span>
              <Badge className="bg-purple-600 text-white font-bold px-4 py-2 text-sm shadow-sm">
                {hour}h {minute}m {second}s
              </Badge>
              <div className="text-xs text-gray-600">
                Tiempo real de simulación
              </div>
            </div>
          </div>
        </div>

        {/* ✅ SECCIÓN DE PEDIDOS VENCIDOS PARA COLAPSO */}
        {esColapso && pedidosVencidos && pedidosVencidos.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-3">
              <div className="p-2 bg-red-200 rounded-full">
                <XCircle className="w-6 h-6 text-red-700" />
              </div>
              Pedidos que causaron el colapso
              <Badge className="bg-red-600 text-white font-bold ml-2">
                {pedidosVencidos.length}
              </Badge>
            </h3>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {pedidosVencidos.map((pedido, index) => (
                <div key={pedido.id} className="bg-white p-4 border-l-4 border-red-400 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-red-700 bg-red-100 px-2 py-1 rounded">
                      Pedido #{index + 1}
                    </span>
                    <span className="text-xs text-gray-500">ID: {pedido.id}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-700">Cliente:</span>
                      <span className="text-gray-900">{pedido.cliente?.id || pedido.idCliente}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-700">Volumen:</span>
                      <span className="text-gray-900 font-medium">{pedido.cantidadGLP} m³</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-700">Aparición:</span>
                      <span className="text-gray-900">
                        {pedido.dia}/{pedido.mesPedido} {pedido.hora}:
                        {String(pedido.minuto).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-700">Ventana:</span>
                      <span className="text-gray-900 font-medium">{pedido.horasLimite}h</span>
                    </div>
                    <div className="flex items-center gap-2 md:col-span-2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-700">Ubicación:</span>
                      <span className="text-gray-900 font-mono">
                        ({pedido.posX}, {pedido.posY})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="pt-6 border-t border-gray-200">
          <div className="flex w-full gap-4 justify-center">
            <Link href="/simulaciones">
              <Button 
                variant="outline" 
                onClick={() => setFinish(false)}
                className="px-8 py-3 text-base font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Volver a Simulaciones
              </Button>
            </Link>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
