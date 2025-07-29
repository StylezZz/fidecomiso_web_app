"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMapContext } from "@/contexts/ContextMap";
import { CamionI } from "@/interfaces/simulation/camion.interface";
import SimulationService from "@/services/simulation.service";
import { AveriaRowImproved } from "@/components/map/averias/averia-row";
import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Package,
  Search,
  Shield,
  Siren,
  Truck,
  Warehouse,
  Zap,
  Activity,
  MapPin,
  AlertCircle,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlmacenBackend, AlmacenEstado } from "@/interfaces/almacen.interface";
import { useSimulationContext } from "@/contexts/ContextSimulation";
import { SimulationType } from "@/interfaces/simulation.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CamionStatus {
  id: number;
  isEnRuta: boolean;
  orderIndex: number;
}

const formatearCapacidad = (almacen: AlmacenBackend) => {
  if (almacen.nombre === "Central") {
    return "Ilimitada";
  }
  return `${almacen.capacidadDisponible}/${almacen.capacidad} m³`;
};

const calcularEstadoCapacidad = (almacen: AlmacenBackend): AlmacenEstado => {
  if (almacen.nombre === "Central") {
    return {
      porcentajeUso: 0,
      nivelCapacidad: "ilimitado",
      colorSemaforo: "bg-blue-500 border-blue-600",
      iconoEstado: "♾️",
    };
  }

  const porcentajeUso =
    ((almacen.capacidad - almacen.capacidadDisponible) / almacen.capacidad) * 100;

  if (porcentajeUso < 30) {
    return {
      porcentajeUso,
      nivelCapacidad: "bajo",
      colorSemaforo: "bg-green-500 border-green-600",
      iconoEstado: "🟢",
    };
  } else if (porcentajeUso < 70) {
    return {
      porcentajeUso,
      nivelCapacidad: "medio",
      colorSemaforo: "bg-yellow-500 border-yellow-600",
      iconoEstado: "🟡",
    };
  } else {
    return {
      porcentajeUso,
      nivelCapacidad: "alto",
      colorSemaforo: "bg-red-500 border-red-600",
      iconoEstado: "🔴",
    };
  }
};

const PAGE_SIZE = 8;

export const DiaADiaPanel = () => {
  const {
    camionesRuta: dataCamiones = [],
    pedidosI,
    bloqueosI,
    simulationTime,
    almacenesBackend,
    loadingAlmacenes,
    averiasGeneradas,
  } = useMapContext();

  const { simulacionSeleccionada } = useSimulationContext();
  const simulacionId = simulacionSeleccionada?.id;
  const simulacionIniciada = !!simulacionId;

  // Estados para búsquedas
  const [isSearchingPedidos, setIsSearchingPedidos] = useState(false);
  const [searchTermPedidos, setSearchTermPedidos] = useState("");
  const searchPedidosInputRef = useRef<HTMLInputElement>(null);

  const [isSearchingCamiones, setIsSearchingCamiones] = useState(false);
  const [searchTermCamiones, setSearchTermCamiones] = useState("");
  const searchCamionesInputRef = useRef<HTMLInputElement>(null);

  // Estados para paginación
  const [pedidosPage, setPedidosPage] = useState(0);
  const [camionesPage, setCamionesPage] = useState(0);

  // Tab activo
  const [activeTab, setActiveTab] = useState<'pedidos' | 'camiones' | 'almacen' | 'alertas'>('pedidos');

  // Filtrar solo almacén Central para día a día
  const almacenCentral = useMemo(() => {
    return almacenesBackend.filter(almacen => 
      almacen.nombre?.toLowerCase() === "central"
    );
  }, [almacenesBackend]);

  // Filtrar pedidos del día actual
  const pedidosDiaActual = useMemo(() => {
    const diaActual = simulationTime?.time?.day || 1;
    return pedidosI?.filter(pedido => pedido.dia === diaActual) || [];
  }, [pedidosI, simulationTime]);

  // Filtrar pedidos pendientes con búsqueda
  const filteredPedidos = useMemo(() => {
    let pedidos = pedidosDiaActual.filter(pedido => !pedido.entregado);
    
    if (searchTermPedidos.trim()) {
      pedidos = pedidos.filter(pedido =>
        pedido.idCliente.toLowerCase().includes(searchTermPedidos.toLowerCase()) ||
        `${pedido.posX},${pedido.posY}`.includes(searchTermPedidos)
      );
    }
    
    return pedidos;
  }, [pedidosDiaActual, searchTermPedidos]);

  // Filtrar camiones con búsqueda
  const filteredCamiones = useMemo(() => {
    let camiones = dataCamiones || [];
    
    if (searchTermCamiones.trim()) {
      camiones = camiones.filter(camion =>
        camion.codigo?.toLowerCase().includes(searchTermCamiones.toLowerCase()) ||
        camion.id.toString().includes(searchTermCamiones)
      );
    }
    
    return camiones;
  }, [dataCamiones, searchTermCamiones]);

  // Handlers de búsqueda
  const handlePedidosSearch = useCallback((value: string) => {
    setSearchTermPedidos(value);
    setPedidosPage(0);
  }, []);

  const handleCamionesSearch = useCallback((value: string) => {
    setSearchTermCamiones(value);
    setCamionesPage(0);
  }, []);

  // Paginación
  const visiblePedidos = useMemo(
    () => filteredPedidos.slice(pedidosPage * PAGE_SIZE, (pedidosPage + 1) * PAGE_SIZE),
    [filteredPedidos, pedidosPage]
  );

  const visibleCamiones = useMemo(
    () => filteredCamiones.slice(camionesPage * PAGE_SIZE, (camionesPage + 1) * PAGE_SIZE),
    [filteredCamiones, camionesPage]
  );

  // Navegación de páginas
  const nextPedidosPage = useCallback(() => {
    if ((pedidosPage + 1) * PAGE_SIZE < filteredPedidos.length) {
      setPedidosPage(pedidosPage + 1);
    }
  }, [pedidosPage, filteredPedidos.length]);

  const prevPedidosPage = useCallback(() => {
    if (pedidosPage > 0) {
      setPedidosPage(pedidosPage - 1);
    }
  }, [pedidosPage]);

  const nextCamionesPage = useCallback(() => {
    if ((camionesPage + 1) * PAGE_SIZE < filteredCamiones.length) {
      setCamionesPage(camionesPage + 1);
    }
  }, [camionesPage, filteredCamiones.length]);

  const prevCamionesPage = useCallback(() => {
    if (camionesPage > 0) {
      setCamionesPage(camionesPage - 1);
    }
  }, [camionesPage]);

  // Bloqueos activos
  const bloqueosActivos = useMemo(() => {
    const tiempoActual = simulationTime?.timerSimulacion || 0;
    return bloqueosI?.filter(bloqueo => {
      const tiempoInicio = bloqueo.diaInicio * 24 * 60 + bloqueo.horaInicio * 60 + bloqueo.minutoInicio;
      const tiempoFin = bloqueo.diaFin * 24 * 60 + bloqueo.horaFin * 60 + bloqueo.minutoFin;
      return tiempoActual >= tiempoInicio && tiempoActual <= tiempoFin;
    }) || [];
  }, [bloqueosI, simulationTime]);

  // Estadísticas rápidas
  const stats = useMemo(() => {
    const totalPedidos = pedidosDiaActual.length;
    const pedidosEntregados = pedidosDiaActual.filter(p => p.entregado).length;
    const pedidosPendientes = totalPedidos - pedidosEntregados;
    const camionesEnRuta = filteredCamiones.filter(c => c.route && c.route.length > 0).length;

    return {
      totalPedidos,
      pedidosEntregados,
      pedidosPendientes,
      camionesEnRuta,
      totalCamiones: filteredCamiones.length,
      bloqueosActivos: bloqueosActivos.length,
    };
  }, [pedidosDiaActual, filteredCamiones, bloqueosActivos]);

  // Effects para manejo de búsqueda
  useEffect(() => {
    if (isSearchingPedidos && searchPedidosInputRef.current) {
      searchPedidosInputRef.current.focus();
    }
  }, [isSearchingPedidos]);

  useEffect(() => {
    if (isSearchingCamiones && searchCamionesInputRef.current) {
      searchCamionesInputRef.current.focus();
    }
  }, [isSearchingCamiones]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pedidos':
        return (
          <div className="space-y-3">
            {/* Búsqueda de pedidos */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchPedidosInputRef}
                  type="text"
                  placeholder="Buscar por cliente o posición..."
                  value={searchTermPedidos}
                  onChange={(e) => handlePedidosSearch(e.target.value)}
                  className="pl-10 h-8 text-sm"
                />
              </div>
              <Badge variant="secondary" className="text-xs">
                {filteredPedidos.length}
              </Badge>
            </div>

            {/* Lista de pedidos */}
            <div className="space-y-2">
              {visiblePedidos.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchTermPedidos ? "No se encontraron pedidos" : "No hay pedidos pendientes"}
                  </p>
                </div>
              ) : (
                visiblePedidos.map((pedido) => (
                  <div key={pedido.id} className="bg-white rounded-lg border p-3 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">{pedido.idCliente}</span>
                        <Badge 
                          variant={pedido.horasLimite <= 6 ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {pedido.horasLimite <= 6 ? "Urgente" : "Normal"}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {pedido.dia}d {pedido.hora}:{pedido.minuto.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        ({pedido.posX}, {pedido.posY})
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {pedido.cantidadGLP}m³
                      </div>
                    </div>
                    {pedido.asignado && (
                      <div className="mt-2 text-xs text-green-600">
                        ✓ Asignado a {pedido.idCamion}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Paginación pedidos */}
            {filteredPedidos.length > PAGE_SIZE && (
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPedidosPage}
                  disabled={pedidosPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-gray-500">
                  {pedidosPage + 1} / {Math.ceil(filteredPedidos.length / PAGE_SIZE)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPedidosPage}
                  disabled={(pedidosPage + 1) * PAGE_SIZE >= filteredPedidos.length}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );

      case 'camiones':
        return (
          <div className="space-y-3">
            {/* Búsqueda de camiones */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchCamionesInputRef}
                  type="text"
                  placeholder="Buscar por código..."
                  value={searchTermCamiones}
                  onChange={(e) => handleCamionesSearch(e.target.value)}
                  className="pl-10 h-8 text-sm"
                />
              </div>
              <Badge variant="secondary" className="text-xs">
                {filteredCamiones.length}
              </Badge>
            </div>

            {/* Lista de camiones */}
            <div className="space-y-2">
              {visibleCamiones.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay camiones disponibles</p>
                </div>
              ) : (
                visibleCamiones.map((camion) => (
                  <div key={camion.id} className="bg-white rounded-lg border p-3 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-sm">{camion.codigo}</span>
                        <Badge 
                          variant={camion.route && camion.route.length > 0 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {camion.route && camion.route.length > 0 ? "En ruta" : "Disponible"}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        ({camion.ubicacionActual?.x || 0}, {camion.ubicacionActual?.y || 0})
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {camion.cargaAsignada || 0}m³
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Paginación camiones */}
            {filteredCamiones.length > PAGE_SIZE && (
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevCamionesPage}
                  disabled={camionesPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-gray-500">
                  {camionesPage + 1} / {Math.ceil(filteredCamiones.length / PAGE_SIZE)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextCamionesPage}
                  disabled={(camionesPage + 1) * PAGE_SIZE >= filteredCamiones.length}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );

      case 'almacen':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              Almacén Central
            </h4>
            {almacenCentral.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Warehouse className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Cargando información del almacén...</p>
              </div>
            ) : (
              almacenCentral.map((almacen) => {
                const estado = calcularEstadoCapacidad(almacen);
                return (
                  <div key={almacen.id} className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Warehouse className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{almacen.nombre}</span>
                      </div>
                      <span className="text-2xl">{estado.iconoEstado}</span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Posición:</span>
                        <span>({almacen.posX}, {almacen.posY})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capacidad:</span>
                        <span>{formatearCapacidad(almacen)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estado:</span>
                        <Badge className={`text-xs ${estado.colorSemaforo}`}>
                          {estado.nivelCapacidad}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );

      case 'alertas':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Alertas del Sistema
            </h4>
            
            {/* Bloqueos activos */}
            {bloqueosActivos.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-red-600">Bloqueos Activos</h5>
                {bloqueosActivos.map((bloqueo) => (
                  <div key={bloqueo.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">Bloqueo #{bloqueo.id}</span>
                    </div>
                    <p className="text-xs text-red-700">
                      Pos: ({bloqueo.posXInicio}-{bloqueo.posXFin}, {bloqueo.posYInicio}-{bloqueo.posYFin})
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Averías */}
            {averiasGeneradas && averiasGeneradas.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-orange-600">Averías Reportadas</h5>
                {averiasGeneradas.slice(0, 3).map((averia) => (
                  <div key={averia.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Siren className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Camión {averia.idCamion}</span>
                    </div>
                    <p className="text-xs text-orange-700">
                      Tipo: {averia.tipoAveria === 1 ? "Mecánica" : "Otro"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {bloqueosActivos.length === 0 && (!averiasGeneradas || averiasGeneradas.length === 0) && (
              <div className="text-center py-6 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay alertas activas</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header del panel */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-600" />
            Panel Día a Día
          </h3>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Tiempo Real
          </Badge>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-blue-50 p-2 rounded border">
            <div className="text-blue-600 font-medium">{stats.pedidosPendientes}</div>
            <div className="text-blue-500">Pendientes</div>
          </div>
          <div className="bg-green-50 p-2 rounded border">
            <div className="text-green-600 font-medium">{stats.camionesEnRuta}</div>
            <div className="text-green-500">En Ruta</div>
          </div>
          <div className="bg-red-50 p-2 rounded border">
            <div className="text-red-600 font-medium">{stats.bloqueosActivos}</div>
            <div className="text-red-500">Bloqueos</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex space-x-1">
          {[
            { id: 'pedidos', label: 'Pedidos', icon: Package, count: stats.pedidosPendientes },
            { id: 'camiones', label: 'Camiones', icon: Truck, count: stats.totalCamiones },
            { id: 'almacen', label: 'Central', icon: Warehouse, count: almacenCentral.length },
            { id: 'alertas', label: 'Alertas', icon: AlertCircle, count: stats.bloqueosActivos + (averiasGeneradas?.length || 0) },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="h-3 w-3" />
                {tab.label}
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  {tab.count}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderTabContent()}
      </div>
    </div>
  );
};
