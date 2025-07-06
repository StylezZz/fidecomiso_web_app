import React, { Dispatch, SetStateAction, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { 
    Truck,
    Package,
    Eye,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    AlertTriangle,
    Zap,
    Clock,
    CheckCircle,
    Siren,
    ArrowDown,
    Search,
    PackageOpen,
    Boxes,
    Container
} from "lucide-react";   
import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader, 
    TableRow 
} from "@/components/ui/table"
import { Pedido } from '@/interfaces/order/pedido.interface';
import { useMapContext } from '@/contexts/MapContext';
import { badgePediddosHandler } from '@/utils/badgesState';
import { Trunk } from '@/interfaces/map/Truck.interface';
import { Progress } from '../ui/progress';
import { VehiculoI } from '@/interfaces/newinterfaces/vehiculos.interface';
// Importar los iconos SVG originales
import { HomeSVG, PedidoSVG, TruckSVG, WarehouseSVG } from "./trunck/TruckSVG";


interface Props{
    setShowLegend: Dispatch<SetStateAction<boolean>>,
}

interface PedidoRow{
  pedido:Pedido
}
interface TruckRow{
  truck: VehiculoI
}

const PAGE_SIZE = 8;

export const MapTable = ({setShowLegend} : Props) => {
  const [selectedTab, setSelectedTab] = useState("vehiculos");
  const {trucks, pedidos, dataVehiculos, pedidosI, legendSummary, camionSeleccionadoId, setCamionSeleccionadoId, pedidoSeleccionadoId, setPedidoSeleccionadoId} = useMapContext()
  
  const [pedidosPage, setPedidosPage] = useState<number>(0);
  const [vehiculosPage, setVehiculosPage] = useState<number>(0);
  
  // ✅ SOLUCIÓN: Ordenar vehículos de forma estable por código
  const sortedDataVehiculos = useMemo(() => 
    [...dataVehiculos].sort((a, b) => a.codigo.localeCompare(b.codigo)),
    [dataVehiculos]
  );
  
  // ✅ OPTIMIZACIÓN: Ordenar pedidos por fecha y hora (día, hora, minuto)
  const sortedPedidos = useMemo(() => 
    [...pedidosI].sort((a, b) => {
      // Ordenar primero por día
      if (a.dia !== b.dia) return a.dia - b.dia;
      // Si el día es igual, ordenar por hora
      if (a.hora !== b.hora) return a.hora - b.hora;
      // Si la hora es igual, ordenar por minuto
      return a.minuto - b.minuto;
    }),
    [pedidosI]
  );
  
  // Mantener los estados existentes y agregar los nuevos
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Primero, asegurémonos que estamos usando los datos correctos
  const sortedAndFilteredVehiculos = useMemo(() => {
    // Verificar que tenemos los datos
    if (!dataVehiculos?.length) return [];

    const sorted = [...dataVehiculos].sort((a, b) => 
      a.codigo.localeCompare(b.codigo)
    );
    
    // Mejorar la lógica de filtrado
    if (!searchTerm.trim()) return sorted;
    
    return sorted.filter(vehiculo => 
      vehiculo.codigo.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [dataVehiculos, searchTerm]);

  // Asegurarnos que visibleVehiculos use los datos filtrados
  const visibleVehiculosFiltered = useMemo(() => 
    sortedAndFilteredVehiculos.slice(
      vehiculosPage * PAGE_SIZE, 
      (vehiculosPage + 1) * PAGE_SIZE
    ),
    [sortedAndFilteredVehiculos, vehiculosPage]
  );

  // Mejorar el manejo de la búsqueda
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setVehiculosPage(0); // Reset página
    console.log('Buscando:', value); // Para debug
  }, []);

  // Focus automático al abrir la búsqueda
  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearching]);

  // Agregar los estados para la búsqueda de pedidos
  const [isSearchingPedidos, setIsSearchingPedidos] = useState(false);
  const [searchTermPedidos, setSearchTermPedidos] = useState("");
  const searchPedidosInputRef = useRef<HTMLInputElement>(null);

  // Manejador de búsqueda para pedidos
  const handlePedidosSearch = useCallback((value: string) => {
    setSearchTermPedidos(value);
    setPedidosPage(0);
  }, []);

  // Focus automático para el input de pedidos
  useEffect(() => {
    if (isSearchingPedidos && searchPedidosInputRef.current) {
      searchPedidosInputRef.current.focus();
    }
  }, [isSearchingPedidos]);

  // Ahora el useMemo tendrá acceso a searchTermPedidos
  const pedidosWithPriority = useMemo(() => {
    if (!pedidosI?.length) return [];
    
    // Primero aplicamos el ordenamiento existente
    const sorted = [...pedidosI].sort((a, b) => {
      if (a.dia !== b.dia) return a.dia - b.dia;
      if (a.hora !== b.hora) return a.hora - b.hora;
      return a.minuto - b.minuto;
    });

    // Luego aplicamos el filtro si hay término de búsqueda
    const filtered = searchTermPedidos.trim()
      ? sorted.filter(pedido => 
          pedido.idCliente.toString().toLowerCase().includes(searchTermPedidos.toLowerCase().trim()))
      : sorted;

    // Finalmente agregamos la prioridad
    return filtered.map(pedido => ({
      ...pedido,
      priority: getPriorityFromHours(pedido.horasLimite)
    }));
  }, [pedidosI, searchTermPedidos]);
  
  // ✅ Usar los pedidos con prioridad precalculada
  const visiblePedidos = useMemo(() => 
    pedidosWithPriority.slice(pedidosPage * PAGE_SIZE, (pedidosPage + 1) * PAGE_SIZE),
    [pedidosWithPriority, pedidosPage]
  );
  
  // ✅ USAR sortedDataVehiculos en lugar de dataVehiculos
  const visibleVehiculos = useMemo(() => 
    sortedDataVehiculos.slice(vehiculosPage * PAGE_SIZE, (vehiculosPage + 1) * PAGE_SIZE),
    [sortedDataVehiculos, vehiculosPage]
  );

  // ✅ OPTIMIZACIÓN: useCallback para funciones - evita recrear funciones en cada render
  const nextPedidosPage = useCallback(() => {
    if((pedidosPage + 1) * PAGE_SIZE < pedidosI.length)
       setPedidosPage(p => p + 1)
  }, [pedidosPage, pedidosI.length]);
  
  const prevPedidosPage = useCallback(() => {
    if(pedidosPage > 0) setPedidosPage(p => p - 1);
  }, [pedidosPage]);
  
  // ✅ OPTIMIZACIÓN: useCallback para funciones - evita recrear funciones en cada render
  const nextVehiculosPage = useCallback(() => {
    if((vehiculosPage + 1) * PAGE_SIZE < sortedDataVehiculos.length)
       setVehiculosPage(p => p + 1)
  }, [vehiculosPage, sortedDataVehiculos.length]);
  
  const prevVehiculosPage = useCallback(() => {
    if(vehiculosPage > 0) setVehiculosPage(p => p - 1);
  }, [vehiculosPage]);

  // Extraer datos de la leyenda
  const {activosTA, activosTB, activosTC, activosTD, numPedidos} = legendSummary

  return (
    <div className="h-full flex flex-col">
      {/* Header con tabs */}
      <div className="p-4 border-b bg-gray-50">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vehiculos" className="flex items-center gap-2 text-xs">
              <Truck size={14} />
              VEHÍCULOS
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="flex items-center gap-2 text-xs">
              <Package size={14} />
              PEDIDOS
            </TabsTrigger>
            <TabsTrigger value="leyenda" className="flex items-center gap-2 text-xs">
              <Eye size={14} />
              LEYENDA
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
          {/* Tab de Vehículos - CORREGIR */}
          <TabsContent value="vehiculos" className="flex-1 overflow-hidden">
            <div className="p-3 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-sm">Lista de Vehículos</h3>
                  <p className="text-xs text-gray-500">
                    {vehiculosPage * PAGE_SIZE + 1}–{Math.min((vehiculosPage + 1) * PAGE_SIZE, sortedDataVehiculos.length)} de {sortedDataVehiculos.length} vehículos
                  </p>
                  <p className="text-[10.5px] text-gray-500">
                    Cap Max Camiones m3:
                  </p>
                  {/* LEYENDA COMPACTA DE TIPOS DE CAMIONES */}
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>
                      <span className="text-gray-900">TA: 25</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                      <span className="text-gray-900">TB: 15</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
                      <span className="text-gray-900">TC: 10</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-500"></span>
                      <span className="text-gray-900">TD: 5</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <div className="relative flex items-center">
                    {isSearching ? (
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        onBlur={() => {
                          if (!searchTerm) {
                            setIsSearching(false);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            handleSearch('');
                            setIsSearching(false);
                          }
                        }}
                        className="absolute right-6 w-20 text-xs py-0.5 px-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="TA01..."
                      />
                    ) : (
                      <button
                        onClick={() => setIsSearching(true)}
                        className="p-0.5 border rounded hover:bg-gray-50"
                        title="Buscar por código"
                      >
                        <Search size={12} className="text-gray-500" />
                      </button>
                    )}
                  </div>
                  
                  <button
                    className="p-0.5 border rounded disabled:opacity-50"
                    onClick={prevVehiculosPage}
                    disabled={vehiculosPage === 0}
                  >
                    <ChevronLeft size={12} />
                  </button>
                  <button
                    className="p-0.5 border rounded disabled:opacity-50"
                    onClick={nextVehiculosPage}
                    disabled={(vehiculosPage + 1) * PAGE_SIZE >= sortedAndFilteredVehiculos.length}
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="text-xs">Código</TableHead>
                    <TableHead className="text-xs">Ubicación</TableHead>
                    <TableHead className="text-xs">Carga Actual</TableHead>
                    <TableHead className="text-xs">Punto Pedido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleVehiculosFiltered.map((truck, index) => (
                    <TruckRow 
                      key={`${truck.codigo}-${vehiculosPage}-${index}`}
                      truck={truck}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tab de Pedidos - ACTUALIZAR nombres de funciones */}
          <TabsContent value="pedidos" className="flex-1 overflow-hidden">
            <div className="p-3 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-sm">Lista de Pedidos Pendientes</h3>
                  <p className="text-xs text-gray-500">
                    {pedidosPage * PAGE_SIZE + 1}–{Math.min((pedidosPage + 1) * PAGE_SIZE, pedidosI.length)} de {pedidosI.length}
                  </p>
                  <p className="text-[10.5px] text-gray-500">
                    Urgencia de los pedidos:
                  </p>
                  {/* LEYENDA COMPACTA DE PRIORIDADES */}
                  <div className="flex items-center gap-4 mt-1 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">🚨</span>
                      <span className="text-gray-900">≤6h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-blue-600" />
                      <span className="text-gray-900">7-12h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-yellow-600" />
                      <span className="text-gray-900">13-24h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowDown className="w-3 h-3 text-green-600" />
                      <span className="text-gray-900">&gt;24h</span>
                    </div>
                  </div>
                  {/* Nueva leyenda de volúmenes - más compacta */}
                  <div className="border-l pl-2 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <PackageOpen size={11} className="text-green-500" aria-label="Ligero" />
                      <span className="text-[10px] text-gray-600">≤3m³</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Boxes size={11} className="text-orange-500" aria-label="Medio" />
                      <span className="text-[10px] text-gray-600">4-10m³</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Container size={11} className="text-red-500" aria-label="Pesado" />
                      <span className="text-[10px] text-gray-600">&gt;10m³</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="relative flex items-center">
                    {isSearchingPedidos ? (
                      <input
                        ref={searchPedidosInputRef}
                        type="text"
                        value={searchTermPedidos}
                        onChange={(e) => handlePedidosSearch(e.target.value)}
                        onBlur={() => {
                          if (!searchTermPedidos) {
                            setIsSearchingPedidos(false);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            handlePedidosSearch('');
                            setIsSearchingPedidos(false);
                          }
                        }}
                        className="absolute right-6 w-20 text-xs py-0.5 px-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="c-9..."
                      />
                    ) : (
                      <button
                        onClick={() => setIsSearchingPedidos(true)}
                        className="p-0.5 border rounded hover:bg-gray-50"
                        title="Buscar por cliente"
                      >
                        <Search size={12} className="text-gray-500" />
                      </button>
                    )}
                  </div>
                  
                  <button
                    className="p-0.5 border rounded disabled:opacity-50"
                    onClick={prevPedidosPage}
                    disabled={pedidosPage === 0}
                  >
                    <ChevronLeft size={12} />
                  </button>
                  <button
                    className="p-0.5 border rounded disabled:opacity-50"
                    onClick={nextPedidosPage}
                    disabled={(pedidosPage + 1) * PAGE_SIZE >= pedidosWithPriority.length}
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="text-xs py-2 px-1 w-[60px]">Cliente</TableHead>
                    <TableHead className="text-xs py-2 px-0 w-[35px] text-left">Vol (m3)</TableHead>
                    <TableHead className="text-xs py-2 px-1 w-[55px]">Fecha</TableHead>
                    <TableHead className="text-xs py-2 px-1 w-[45px] text-center">Ubicación</TableHead>
                    <TableHead className="text-xs py-2 px-1 w-[55px] text-center">Hora Max</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visiblePedidos.map((pedido) => (
                    <PedidoRowI key={pedido.id} pedido={pedido} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tab de Leyenda - CON ICONOS SVG ORIGINALES */}
          <TabsContent value="leyenda" className="flex-1 overflow-hidden">
            <div className="p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-3">Leyenda del Mapa</h3>
              </div>
              
              <div className="space-y-3">
                {/* Camiones TA */}
                <div className="flex items-center gap-2 mb-1">
                  <TruckSVG color="#FCFF33"/>
                  <span className="text-xs font-bold">Camiones TA</span>
                  <span className="text-xs ml-auto">{activosTA}/2</span>
                </div>

                {/* Camiones TB */}
                <div className="flex items-center gap-2 mb-1">
                  <TruckSVG color="#33F9FF"/>
                  <span className="text-xs font-bold">Camiones TB</span>
                  <span className="text-xs ml-auto">{activosTB}/4</span>
                </div>

                {/* Camiones TC */}
                <div className="flex items-center gap-2 mb-1">
                  <TruckSVG color="#FFAD3E"/>
                  <span className="text-xs font-bold">Camiones TC</span>
                  <span className="text-xs ml-auto">{activosTC}/4</span>
                </div>

                {/* Camiones TD */}
                <div className="flex items-center gap-2 mb-1">
                  <TruckSVG color="#C4C3C2"/>
                  <span className="text-xs font-bold">Camiones TD</span>
                  <span className="text-xs ml-auto">{activosTD}/10</span>
                </div>

                {/* Planta Principal */}
                <div className="flex items-center gap-2">
                  <HomeSVG/>
                  <span className="text-xs font-bold">Planta principal</span>
                  <span className="text-xs ml-auto">1</span>
                </div>

                {/* Abastecimiento */}
                <div className="flex items-center gap-2">
                  <WarehouseSVG/>
                  <span className="text-xs font-bold">Abastecimiento</span>
                  <span className="text-xs ml-auto">2</span>
                </div>

                {/* Pedidos */}
                <div className="flex items-center gap-2">
                  <PedidoSVG/>
                  <span className="text-xs font-bold">Pedidos</span>
                  <span className="text-xs ml-auto">{numPedidos}</span>
                </div>

                {/* Bloqueos */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6">
                    <div className="w-4 h-0.5 bg-red-500 rounded-full"></div>
                  </div>
                  <span className="text-xs font-bold">Bloqueos</span>
                  <span className="text-xs ml-auto text-red-500">●</span>
                </div>

               
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ✅ FUNCIÓN: Obtener prioridad basada en horas límite (rangos mejorados) a
const getPriorityFromHours = (horasLimite: number) => {
  if (horasLimite <= 6) {
    return {
      level: 'urgent',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: Siren,
      label: 'Urgente'
    };
  } else if (horasLimite <= 12) {
    return {
      level: 'high',
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      icon: Zap,
      label: 'Alta'
    };
  } else if (horasLimite <= 24) {
    return {
      level: 'medium',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50', 
      icon: Clock,
      label: 'Media'
    };
  } else {
    return {
      level: 'low',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: ArrowDown,
      label: 'Baja'
    };
  }
};

// Componente PedidoRowI actualizado con iconos de prioridad
const PedidoRowI = React.memo(({ pedido }: {pedido: any}) => {
  const { pedidoSeleccionadoId, setPedidoSeleccionadoId } = useMapContext();
  const priority = getPriorityFromHours(pedido.horasLimite);
  const IconComponent = priority.icon;

  const handleClick = () => {
    setPedidoSeleccionadoId(prev => prev === pedido.id ? null : pedido.id);
  };

  const estaSeleccionado = pedidoSeleccionadoId === pedido.id;

  return (
    <TableRow
      onClick={handleClick}
      className={`
        cursor-pointer hover:${priority.bgColor} transition-colors
        ${estaSeleccionado ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
      `}
    >
      <TableCell className="text-xs py-2 px-1">
        {pedido.cliente ? pedido.cliente.codigo || pedido.idCliente : pedido.idCliente || 'N/A'}
      </TableCell>
      <TableCell className="text-xs py-2 px-0 text-left flex items-center gap-1">
        {getVolumeIcon(pedido.cantidadGLP)}
        <span>{pedido.cantidadGLP}</span>
      </TableCell>
      <TableCell className="text-xs py-2 px-1">
        {pedido.dia}/{pedido.mesPedido}/{pedido.anio} {pedido.hora}:{String(pedido.minuto).padStart(2, '0')}
      </TableCell>
      <TableCell className="text-[11px] py-2 px-1 text-center whitespace-nowrap">
        ({pedido.posX}, {pedido.posY})
      </TableCell>
      <TableCell className="text-xs py-2 px-1">
        <div className="flex items-center justify-center gap-1">
          <IconComponent className={`w-3 h-3 ${priority.color}`} />
          <span className="text-gray-900 font-medium">{pedido.horasLimite}h</span>
        </div>
      </TableCell>
    </TableRow>
  );
});

// Mantener el componente original para el caso de que se use pedidos
const PedidoRow = React.memo(({ pedido }: PedidoRow) => (
  <TableRow>
    <TableCell className="text-xs">#ID{pedido.idPedido}</TableCell>
    <TableCell className="text-xs">{pedido.clientCode}</TableCell>
    <TableCell className="text-xs">{pedido.volumenGLP} m³</TableCell>
    <TableCell className="text-xs">{pedido.fechaRegistro}</TableCell>
    <TableCell className="text-xs">{badgePediddosHandler(pedido.estado)}</TableCell>
  </TableRow>
));

// ✅ NUEVA FUNCIÓN: Obtener color según tipo de camión
const getTruckTypeColor = (codigo: string) => {
  const tipo = codigo.substring(0, 2); // Extrae "TA", "TB", "TC", "TD"
  switch (tipo) {
    case 'TA': return 'bg-yellow-400';
    case 'TB': return 'bg-blue-400';
    case 'TC': return 'bg-orange-500';
    case 'TD': return 'bg-gray-500';
    default: return 'bg-gray-400';
  }
};

// ✅ COMPONENTE TruckRow ACTUALIZADO - Mostrar solo el próximo pedido
const TruckRow = React.memo(({ truck }: TruckRow) => {
  const { camionSeleccionadoId, setCamionSeleccionadoId } = useMapContext();
  
  const handleClickCamion = useCallback(() => {
    if (camionSeleccionadoId === truck.id) {
      setCamionSeleccionadoId(null);
    } else {
      setCamionSeleccionadoId(truck.id);
    }
  }, [truck.id, camionSeleccionadoId, setCamionSeleccionadoId]);

  const estaSeleccionado = camionSeleccionadoId === truck.id;

  // Función para obtener el próximo punto de destino de pedido
  const getPuntoDestino = (truck: VehiculoI) => {
    if (!truck.route || truck.route.length === 0) {
      return "Sin ruta";
    }
    
    // Buscar el primer punto de pedido en la ruta (el próximo pedido)
    const proximoPedido = truck.route.find(punto => punto.pedido === true);
    
    if (!proximoPedido) {
      return "N/A";
    }
    
    // Mostrar solo las coordenadas del próximo pedido
    return `(${proximoPedido.x},${proximoPedido.y})`;
  };

  return (
    <TableRow 
      onClick={handleClickCamion}
      className={`cursor-pointer hover:bg-gray-50 transition-colors ${
        estaSeleccionado ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
    >
      <TableCell className="text-xs">
        <div className="flex items-center gap-2">
          <span 
            className={`inline-block w-2 h-2 rounded-full ${getTruckTypeColor(truck.codigo)}`}
            title={`Tipo ${truck.codigo.substring(0, 2)}`}
          />
          {truck.codigo}
        </div>
      </TableCell>
      <TableCell className="text-xs">({truck.ubicacionActual.x},{truck.ubicacionActual.y})</TableCell>
      <TableCell className="text-xs">{truck.cargaAsignada} m³</TableCell>
      <TableCell className="text-xs">
        {getPuntoDestino(truck)}
      </TableCell>
    </TableRow>
  );
});

//esto debo de reutilizarlo, si es que lo necesito en otro lugar
interface ProgressProps {
  value: number;
  total:number;
  
}
const ProgressFlow = React.memo(({ value, total }: ProgressProps) => {
const percent = total > 0 ? (value / total) * 100 : 0;

const getBarColor = () => {
  console.log("percent", percent);
  if (percent <= 25) return "[&>div]:bg-red-500";
  if (percent <= 50) return "[&>div]:bg-yellow-400";
  return "[&>div]:bg-green-500";
};

  return (
    <>
    <Progress
      value={percent}
      className={`
        w-[40%] h-2 bg-gray-200 rounded-full
        [&>div]:transition-all
        [&>div]:duration-300
        [&>div]:ease-in-out
        ${getBarColor()}
        `}
        />
    <span className=" text-gray-500 ml-2">
      {value} m³
    </span>
    </>
  );
});

// Agregar la función helper (después de las interfaces)
const getVolumeIcon = (volumen: number) => {
  if (volumen <= 3) {
    return <PackageOpen size={12} className="text-green-500" aria-label="Ligero (≤3m³)" />;
  } else if (volumen <= 10) {
    return <Boxes size={13} className="text-orange-500" aria-label="Medio (4-10m³)" />;
  } else {
    return <Container size={14} className="text-red-500" aria-label="Pesado (>10m³)" />;
  }
};

/*
cricri estuvo aqui 

*/