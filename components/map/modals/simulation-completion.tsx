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
  Zap,
  Activity,
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
  const {
    manageTime,
    realTime,
    simulationTime,
    setFinish,
    tipoFinalizacion,
    pedidosVencidos,
    cantidadEntregados,
    pedidosI,
  } = useMapContext();
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
  const tituloModal = esColapso ? "Colapso Logístico" : "¡Simulación Completada!";
  const descripcionModal = esColapso
    ? "Se encontró un pedido que no pudo entregarse a tiempo"
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
      audio.play().catch((error) => {
        console.warn("No se pudo reproducir el sonido de alerta:", error);
      });
    } catch (error) {
      console.warn("Error al crear el audio:", error);
    }
  }, [isOpen, tipoFinalizacion]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-white border-0 shadow-2xl p-0">
        {/* Header Section con diseño dramático */}
        <div
          className={`relative px-8 py-12 ${
            esColapso
              ? "bg-gradient-to-r from-red-600 via-red-700 to-red-800"
              : "bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800"
          } text-white`}
        >
          {/* Efectos de fondo */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div
              className={`absolute top-4 left-4 w-16 h-16 ${
                esColapso ? "bg-red-400" : "bg-emerald-400"
              } rounded-full opacity-20 animate-pulse`}
            ></div>
            <div
              className={`absolute top-8 right-8 w-12 h-12 ${
                esColapso ? "bg-red-300" : "bg-emerald-300"
              } rounded-full opacity-15 animate-bounce`}
            ></div>
            <div
              className={`absolute bottom-6 left-1/3 w-8 h-8 ${
                esColapso ? "bg-red-200" : "bg-emerald-200"
              } rounded-full opacity-25`}
            ></div>
          </div>

          <div className="relative z-10 text-center">
            {/* <div
              className={`inline-flex p-6 rounded-full mb-6 ${
                esColapso
                  ? "bg-red-500/30 border-4 border-red-300/50"
                  : "bg-emerald-500/30 border-4 border-emerald-300/50"
              } backdrop-blur-sm`}
            >
              {esColapso ? (
                <AlertTriangle className="w-16 h-16 text-white animate-pulse" />
              ) : (
                <CheckCircle className="w-16 h-16 text-white animate-pulse" />
              )}
            </div> */}

            <DialogTitle className="text-4xl font-black mb-4 tracking-tight">
              {tituloModal}
            </DialogTitle>

            <DialogDescription className="text-xl text-white/90 font-medium max-w-2xl mx-auto leading-relaxed">
              {descripcionModal}
            </DialogDescription>

            {esColapso && (
              <div className="mt-6 inline-flex items-center gap-2 bg-red-500/20 border border-red-300/30 rounded-full px-6 py-3 backdrop-blur-sm">
                <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="text-white font-semibold">Sistema Sobrecargado</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Fecha Inicio */}
            <div className="group">
              <div className="bg-slate-50 hover:bg-slate-100 transition-all duration-300 rounded-2xl p-6 border-2 border-slate-200 hover:border-slate-300 hover:shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Inicio
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{formattedDate}</div>
                <div className="text-sm text-slate-600">Fecha de arranque</div>
              </div>
            </div>

            {/* Fecha Fin */}
            <div className="group">
              <div className="bg-slate-50 hover:bg-slate-100 transition-all duration-300 rounded-2xl p-6 border-2 border-slate-200 hover:border-slate-300 hover:shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Fin
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{formateDateFin}</div>
                <div className="text-sm text-slate-600">Fecha de término</div>
              </div>
            </div>

            {/* Tiempo Transcurrido */}
            <div className="group">
              <div className="bg-slate-50 hover:bg-slate-100 transition-all duration-300 rounded-2xl p-6 border-2 border-slate-200 hover:border-slate-300 hover:shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Duración
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-1">
                  {hour}:{minute}:{second}
                </div>
                <div className="text-sm text-slate-600">Tiempo real transcurrido</div>
              </div>
            </div>
          </div>

          {/* ✅ SECCIÓN DE PEDIDOS VENCIDOS PARA COLAPSO */}
          {esColapso && pedidosVencidos && pedidosVencidos.length > 0 && (
            <div className="mb-8">
              {/* Header de la sección */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-t-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/30 rounded-xl backdrop-blur-sm">
                      <XCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Pedido No Atendido</h3>
                      <p className="text-red-100 text-sm">Causante del colapso del sistema</p>
                    </div>
                  </div>
                  {/* <div className="text-right">
                    <div className="bg-red-500 rounded-full px-4 py-2 font-bold text-lg">
                      {pedidosVencidos.length}
                    </div>
                    <div className="text-red-100 text-xs mt-1">Total</div>
                  </div> */}
                </div>
              </div>

              {/* Lista de pedidos */}
              <div className="bg-white border-2 border-red-200 rounded-b-2xl p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {pedidosVencidos.map((pedido, index) => (
                    <div key={pedido.id} className="group">
                      <div className="bg-red-50 hover:bg-red-100 transition-all duration-200 rounded-xl p-5 border-l-4 border-red-400 hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-bold text-red-800">
                                Pedido para Cliente {pedido.cliente?.id || pedido.idCliente}
                              </div>
                              <div className="text-xs text-red-600">Fecha entrega no lograda</div>
                            </div>
                          </div>
                          <div className="p-2 bg-red-200 rounded-lg">
                            <Activity className="w-5 h-5 text-red-700" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-red-700">
                              {/* <User className="w-4 h-4" /> */}
                              <span className="font-semibold">Cliente</span>
                            </div>
                            <div className="text-slate-800 font-medium">
                              {pedido.cliente?.id || pedido.idCliente}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-red-700">
                              {/* <Package className="w-4 h-4" /> */}
                              <span className="font-semibold">Volumen</span>
                            </div>
                            <div className="text-slate-800 font-medium">
                              {pedido.cantidadGLP} m³
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-red-700">
                              {/* <Calendar className="w-4 h-4" /> */}
                              <span className="font-semibold">Registro</span>
                            </div>
                            <div className="text-slate-800 font-medium">
                              {pedido.dia}/{pedido.mesPedido} {pedido.hora}:
                              {String(pedido.minuto).padStart(2, "0")}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-red-700">
                              {/* <Clock className="w-4 h-4" /> */}
                              <span className="font-semibold">Horas Límite</span>
                            </div>
                            <div className="text-slate-800 font-medium">{pedido.horasLimite}h</div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-red-200">
                          <div className="flex items-center gap-2 text-red-700">
                            <MapPin className="w-4 h-4" />
                            <span className="font-semibold text-sm">Posición:</span>
                            <span className="text-slate-800 font-mono text-sm">
                              ({pedido.posX}, {pedido.posY})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {/* <div className="px-8 py-6 bg-slate-50 border-t border-slate-200">
          <div className="flex justify-center">
            <Link href="/simulaciones">
              <Button
                variant="outline"
                onClick={() => setFinish(false)}
                className="px-8 py-3 text-lg font-semibold bg-white hover:bg-slate-100 border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md"
              >
                <Calendar className="w-5 h-5 mr-3" />
                Volver a Simulaciones
              </Button>
            </Link>
          </div>
        </div> */}
      </DialogContent>
    </Dialog>
  );
};
