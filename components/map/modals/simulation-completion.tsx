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
  const { manageTime, realTime, simulationTime, setFinish, tipoFinalizacion, pedidosVencidos } =
    useMapContext();
  const { day, hour: simuHour, minute: simMinute } = simulationTime.time;
  const { hour, minute, second } = realTime.realTime;
  // const { data } = useReports(); BORRADO
  const data = null; // Simulación de datos para evitar errores en el ejemplo

  const dateInit = new Date(anio, mes - 1, dia, ihora, iminuto);
  const dateFin = new Date(dateInit);
  dateFin.setDate(dateFin.getDate() + (day - dia));
  dateFin.setHours(simuHour);
  dateFin.setMinutes(simMinute);

  const formattedDate = formatearFecha(dateInit);
  const formateDateFin = formatearFecha(dateFin);

  // 🎯 OBTENER DATOS REALES (no calculados)
  const pedidosEntregados = data.cumplimientoEntregas?.pedidosEntregados || 0;
  const totalPedidos = data.cumplimientoEntregas?.totalPedidos || 0;
  const isLoadingPedidos = data.loading.cumplimientoEntregas;

  // 🎯 DETECTAR SI ES COLAPSO
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

  useEffect(() => {
    if (!isOpen || tipoFinalizacion !== "colapso") return;
    const audio = new Audio("/warningSound.mp3");
    audio.play();
  }, [isOpen]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div
            className={`w-16 h-16 mx-auto ${colorFondo} rounded-full flex items-center justify-center`}
          >
            {iconoModal}
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
            {tituloModal}
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-center">
            {descripcionModal}
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex flex-col items-center space-y-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Fecha Inicio de Simulación{" "}
              </span>
              <Badge className="bg-blue-100 text-blue-800 font-semibold hover:">
                {formattedDate}
              </Badge>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex flex-col items-center space-y-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Fecha Fin de Simulación
              </span>
              <Badge className="bg-blue-100 text-blue-800 font-semibold">{formateDateFin}</Badge>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex flex-col items-center space-y-2">
              <Package className="w-6 h-6 text-green-600" />
              <span className="text-xs font-medium text-gray-600 uppercase">
                Pedidos Entregados
              </span>
              {isLoadingPedidos ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-green-600" />
                  <span className="text-sm text-green-600">Obteniendo...</span>
                </div>
              ) : (
                <div className="text-center">
                  <Badge className="bg-green-100 text-green-800 font-semibold text-lg">
                    {pedidosEntregados}/{totalPedidos}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex flex-col items-center space-y-2">
              <Clock className="w-6 h-6 text-purple-600" />
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Tiempo Real Transcurrido
              </span>
              <Badge className="bg-purple-100 text-purple-800 font-semibold">
                {hour}h {minute}min {second}s
              </Badge>
            </div>
          </div>
        </div>

        {/* ✅ NUEVA SECCIÓN: Mostrar pedidos vencidos si es colapso */}
        {esColapso && pedidosVencidos.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Pedidos que causaron el colapso ({pedidosVencidos.length})
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {pedidosVencidos.map((pedido) => (
                <div key={pedido.id} className="bg-white p-3 border border-red-300 rounded-md">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Cliente:</span>
                      <span>{pedido.cliente?.id || pedido.idCliente}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Volumen:</span>
                      <span>{pedido.cantidadGLP} m³</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Aparición:</span>
                      <span>
                        {pedido.dia}/{pedido.mesPedido} {pedido.hora}:
                        {String(pedido.minuto).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Ventana:</span>
                      <span>{pedido.horasLimite}h</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Ubicación:</span>
                      <span>
                        ({pedido.posX}, {pedido.posY})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <div className="flex w-full gap-2 justify-around">
            <Link href="/simulaciones" className="w-[100p]">
              <Button variant="secondary" onClick={() => setFinish(false)}>
                Salir de simulación
              </Button>
            </Link>
            <Link href="/reportes">
              <Button onClick={() => setFinish(false)}>Ver Reportes</Button>
            </Link>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
