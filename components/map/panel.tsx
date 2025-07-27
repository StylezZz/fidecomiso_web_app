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
} from "lucide-react";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface Props {
  setShowLegend: Dispatch<SetStateAction<boolean>>;
}
interface TruckRow {
  truck: CamionI;
}

interface CamionStatus {
  id: number;
  isEnRuta: boolean;
  orderIndex: number; // Para mantener orden estable
}

interface AlmacenInfo{
  posX: number;
  posY: number;
  typeHouse: string;
  nombre: string;
  capacidad: string;
  descripcion: string;
  camionesActuales: number;
}

const ALMACENES_DATA: AlmacenInfo[] = [
  {
    posX: 12,
    posY: 8,
    typeHouse: "home",
    nombre: "Almacen Central",
    capacidad: "Ilimitada",
    descripcion: "Centro de distribución principal",
    camionesActuales: 0,
  },
  {
    posX: 42,
    posY: 42,
    typeHouse: "warehouse",
    nombre: "Almacén Norte",
    capacidad: "50,000 L",
    descripcion: "Almacén Intermedio Norte",
    camionesActuales: 0,
  },
  {
    posX: 63,
    posY: 3,
    typeHouse: "warehouse",
    nombre: "Almacén Este",
    capacidad: "50,000 L",
    descripcion: "Almacén Intermedio Este",
    camionesActuales: 0,
  }
]

const PAGE_SIZE = 8;

export const MapPanel = () => {
  const [selectedTab, setSelectedTab] = useState("camiones");
  const {
    camionesRuta,
    pedidosI,
    bloqueosI,
    almacenSeleccionadoId,
    setAlmacenSeleccionadoId,
    bloqueoSeleccionadoId,
    setBloqueoSeleccionadoId,
  } = useMapContext();

  const [pedidosPage, setPedidosPage] = useState<number>(0);
  const [camionesPage, setCamionesPage] = useState<number>(0);
  const [almacenesPage, setAlmacenesPage] = useState<number>(0);
  const [bloqueosPage, setBloqueosPage] = useState<number>(0);

  // ✅ Sistema de estado estable para camiones
  const camionStatusRef = useRef<Map<number, CamionStatus>>(new Map());
  const orderCounterRef = useRef<number>(0);

  // ✅ Determinar estado del camión: "En ruta" o "En almacén"
  const updateCamionStatus = useCallback((camiones: CamionI[]) => {
    const statusMap = camionStatusRef.current;

    camiones.forEach((camion) => {
      const currentStatus = statusMap.get(camion.id);
      const tieneRuta = camion.route && camion.route.length > 0;
      const estaEnAlmacen = camion.route?.some((punto) => punto.esAlmacen) || false;

      // Determinar si está en ruta (tiene ruta y no está en almacén)
      const isEnRuta = tieneRuta && !estaEnAlmacen;

      if (!currentStatus) {
        // Primer registro
        statusMap.set(camion.id, {
          id: camion.id,
          isEnRuta,
          orderIndex: orderCounterRef.current++,
        });
      } else {
        // Solo actualizar el estado, mantener el orden
        currentStatus.isEnRuta = isEnRuta;
      }
    });
  }, []);

  // ✅ Ordenamiento estable de camiones
  const sortedDataCamiones = useMemo(() => {
    if (!camionesRuta?.length) return [];

    updateCamionStatus(camionesRuta);

    const sorted = [...camionesRuta].sort((a, b) => {
      const statusA = camionStatusRef.current.get(a.id);
      const statusB = camionStatusRef.current.get(b.id);

      // 1. Primero: camiones en ruta
      if (statusA?.isEnRuta && !statusB?.isEnRuta) return -1;
      if (!statusA?.isEnRuta && statusB?.isEnRuta) return 1;

      // 2. Dentro del mismo estado, mantener orden estable por orderIndex
      if (statusA?.isEnRuta === statusB?.isEnRuta) {
        const orderA = statusA?.orderIndex || 0;
        const orderB = statusB?.orderIndex || 0;
        if (orderA !== orderB) return orderA - orderB;
      }

      // 3. Fallback: orden alfabético
      return a.codigo.localeCompare(b.codigo);
    });

    return sorted;
  }, [camionesRuta, updateCamionStatus]);

  // Estados de búsqueda
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const sortedAndFilteredCamiones = useMemo(() => {
    if (!sortedDataCamiones?.length) return [];

    if (!searchTerm.trim()) return sortedDataCamiones;

    return sortedDataCamiones.filter((camion) =>
      camion.codigo.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [sortedDataCamiones, searchTerm]);

  const visibleCamionesFiltered = useMemo(
    () => sortedAndFilteredCamiones.slice(camionesPage * PAGE_SIZE, (camionesPage + 1) * PAGE_SIZE),
    [sortedAndFilteredCamiones, camionesPage]
  );

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCamionesPage(0);
  }, []);

  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearching]);

  // Estados para búsqueda de pedidos
  const [isSearchingPedidos, setIsSearchingPedidos] = useState(false);
  const [searchTermPedidos, setSearchTermPedidos] = useState("");
  const searchPedidosInputRef = useRef<HTMLInputElement>(null);

  const handlePedidosSearch = useCallback((value: string) => {
    setSearchTermPedidos(value);
    setPedidosPage(0);
  }, []);

  useEffect(() => {
    if (isSearchingPedidos && searchPedidosInputRef.current) {
      searchPedidosInputRef.current.focus();
    }
  }, [isSearchingPedidos]);

  const [isSearchingAlmacenes,setIsSearchingAlmacenes]= useState(false);
  const [searchTermAlmacenes,setSearchTermAlmacenes]= useState("");
  const searchAlmacenesInputRef = useRef<HTMLInputElement>(null);

  const [isSearchingBloqueos, setIsSearchingBloqueos] = useState(false);
  const [searchTermBloqueos, setSearchTermBloqueos] = useState("");
  const searchBloqueosInputRef = useRef<HTMLInputElement>(null);

  const handleAlmacenesSearch = useCallback((value:string)=>{
    setSearchTermAlmacenes(value);
    setAlmacenesPage(0);
  },[]);

  useEffect(() => {
    if (isSearchingAlmacenes && searchAlmacenesInputRef.current) {
      searchAlmacenesInputRef.current.focus();
    }
  }, [isSearchingAlmacenes]);

  const handleBloqueosSearch = useCallback((value: string) => {
    setSearchTermBloqueos(value);
    setBloqueosPage(0);
  }, []);

  useEffect(() => {
    if (isSearchingBloqueos && searchBloqueosInputRef.current) {
      searchBloqueosInputRef.current.focus();
    }
  }, [isSearchingBloqueos]);

  const filteredAlmacenes = useMemo(()=>{
    if(!searchTermAlmacenes.trim())return ALMACENES_DATA;
    
    return ALMACENES_DATA.filter((almacen)=>
      almacen.nombre.toLowerCase().includes(searchTermAlmacenes.toLowerCase().trim()) || 
      almacen.descripcion.toLowerCase().includes(searchTermAlmacenes.toLowerCase().trim())
    );
  },[searchTermAlmacenes]);

  const visibleAlmacenes = useMemo(()=> filteredAlmacenes.slice(almacenesPage*PAGE_SIZE, (almacenesPage+1)*PAGE_SIZE), [filteredAlmacenes, almacenesPage]);

  const nextAlmacenesPage = useCallback(()=>{
    if((almacenesPage+1)*PAGE_SIZE < filteredAlmacenes.length){
      setAlmacenesPage((p) => p + 1);
    }
  }, [almacenesPage, filteredAlmacenes.length]);

  const prevAlmacenesPage = useCallback(()=>{
    if(almacenesPage > 0 ) setAlmacenesPage((p)=>p-1);
  }, [almacenesPage]);

  const filteredBloqueos = useMemo(() => {
    if (!searchTermBloqueos.trim()) return bloqueosI || [];
    
    return bloqueosI.filter(bloqueo =>
      bloqueo.id.toString().includes(searchTermBloqueos.toLowerCase()) ||
      `bloqueo-${bloqueo.id}`.toLowerCase().includes(searchTermBloqueos.toLowerCase())
    );
  }, [bloqueosI, searchTermBloqueos]);

  const visibleBloqueos = useMemo(
    () => filteredBloqueos.slice(bloqueosPage * PAGE_SIZE, (bloqueosPage + 1) * PAGE_SIZE),
    [filteredBloqueos, bloqueosPage]
  );

  const nextBloqueosPage = useCallback(() => {
    if ((bloqueosPage + 1) * PAGE_SIZE < filteredBloqueos.length)
      setBloqueosPage((p) => p + 1);
  }, [bloqueosPage, filteredBloqueos.length]);

  const prevBloqueosPage = useCallback(() => {
    if (bloqueosPage > 0) setBloqueosPage((p) => p - 1);
  }, [bloqueosPage]);

  const pedidosWithPriority = useMemo(() => {
    if (!pedidosI?.length) return [];

    const sorted = [...pedidosI].sort((a, b) => {
      if (a.dia !== b.dia) return a.dia - b.dia;
      if (a.hora !== b.hora) return a.hora - b.hora;
      return a.minuto - b.minuto;
    });

    const filtered = searchTermPedidos.trim()
      ? sorted.filter((pedido) =>
          pedido.idCliente.toString().toLowerCase().includes(searchTermPedidos.toLowerCase().trim())
        )
      : sorted;

    return filtered.map((pedido) => ({
      ...pedido,
      priority: getPriorityFromHours(pedido.horasLimite),
    }));
  }, [pedidosI, searchTermPedidos]);

    // 2.  ⬇︎  AGREGA este bloque inmediatamente después
    console.log(
      "DEBUG pedidosWithPriority → length:",
      pedidosWithPriority.length,
      " | primer pedido:",
      pedidosWithPriority[0]
    );

  const visiblePedidos = useMemo(
    () => pedidosWithPriority.slice(pedidosPage * PAGE_SIZE, (pedidosPage + 1) * PAGE_SIZE),
    [pedidosWithPriority, pedidosPage]
  );

  // Funciones de paginación
  const nextPedidosPage = useCallback(() => {
    if ((pedidosPage + 1) * PAGE_SIZE < pedidosWithPriority.length) setPedidosPage((p) => p + 1);
  }, [pedidosPage, pedidosWithPriority.length]);

  const prevPedidosPage = useCallback(() => {
    if (pedidosPage > 0) setPedidosPage((p) => p - 1);
  }, [pedidosPage]);

  const nextCamionesPage = useCallback(() => {
    if ((camionesPage + 1) * PAGE_SIZE < sortedAndFilteredCamiones.length)
      setCamionesPage((p) => p + 1);
  }, [camionesPage, sortedAndFilteredCamiones.length]);

  const prevCamionesPage = useCallback(() => {
    if (camionesPage > 0) setCamionesPage((p) => p - 1);
  }, [camionesPage]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-4">
          <div className="flex space-x-2">
            {[
              { id: "camiones", label: "Camiones", icon: Truck, count: sortedDataCamiones.length },
              { id: "pedidos", label: "Pedidos", icon: Package, count: pedidosI.length },
              { id: "almacenes", label: "Almacenes", icon: Warehouse, count: ALMACENES_DATA.length },
              { id: "bloqueos", label: "Bloqueos", icon: Shield, count: bloqueosI?.length || 0 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`
                    relative flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium 
                    transition-all duration-300 group min-w-[90px] justify-center
                    ${
                      isActive
                        ? tab.id === "camiones"
                          ? "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg"
                          : tab.id === "pedidos"
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                          : tab.id === "almacenes"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                          : "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 hover:scale-102"
                    }
                  `}
                >
                  <Icon
                    size={16}
                    className={`transition-transform duration-300 ${
                      isActive ? "scale-110" : "group-hover:scale-105"
                    }`}
                  />
                  <span className="font-semibold text-xs">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`
                      text-xs px-2 py-0.5 rounded-full font-bold transition-all duration-300
                      ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-300 text-slate-700 group-hover:bg-slate-400 group-hover:text-white"
                      }
                    `}
                    >
                      {tab.count}
                    </span>
                  )}

                  {/* Indicador activo */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full opacity-80" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden">
        {/* ✅ TAB DE CAMIONES REDISEÑADO */}
        {selectedTab === "camiones" && (
          <div className="h-full flex flex-col">
            {/* Header con gradiente */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 mb-1">Flota de Camiones</h3>
                  <p className="text-sm text-slate-600">
                    Mostrando {camionesPage * PAGE_SIZE + 1}–
                    {Math.min((camionesPage + 1) * PAGE_SIZE, sortedAndFilteredCamiones.length)} de{" "}
                    {sortedAndFilteredCamiones.length} unidades
                  </p>
                </div>

                {/* Controles rediseñados */}
                <div className="flex items-center gap-3">
                  {/* Búsqueda con nuevo estilo */}
                  <div className="relative">
                    {isSearching ? (
                      <div className="relative">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchTerm}
                          onChange={(e) => handleSearch(e.target.value)}
                          onBlur={() => !searchTerm && setIsSearching(false)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              handleSearch("");
                              setIsSearching(false);
                            }
                          }}
                          className="w-40 text-sm py-2.5 pl-10 pr-4 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-white shadow-sm"
                          placeholder="Buscar TA01..."
                        />
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsSearching(true)}
                        className="p-2.5 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm"
                        title="Buscar camión"
                      >
                        <Search size={16} className="text-slate-500" />
                      </button>
                    )}
                  </div>

                  {/* Paginación con nuevo estilo */}
                  <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
                    <button
                      onClick={prevCamionesPage}
                      disabled={camionesPage === 0}
                      className="p-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                    >
                      <ChevronLeft size={16} className="text-slate-600" />
                    </button>
                    <div className="px-3 py-1 text-sm font-medium text-slate-700 min-w-[60px] text-center">
                      {camionesPage + 1} / {Math.ceil(sortedAndFilteredCamiones.length / PAGE_SIZE)}
                    </div>
                    <button
                      onClick={nextCamionesPage}
                      disabled={(camionesPage + 1) * PAGE_SIZE >= sortedAndFilteredCamiones.length}
                      className="p-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                    >
                      <ChevronRight size={16} className="text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla con nuevo diseño */}
            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-gradient-to-r from-slate-50 to-white border-b-2 border-slate-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-sm font-bold text-slate-700 py-4 px-6">
                      Camión
                    </TableHead>
                    <TableHead className="text-sm font-bold text-slate-700 px-4">Estado</TableHead>
                    <TableHead className="text-sm font-bold text-slate-700 px-4">
                      Ubicación
                    </TableHead>
                    <TableHead className="text-sm font-bold text-slate-700 px-6">Destino</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleCamionesFiltered.map((truck, index) => (
                    <CamionRowImproved
                      key={`${truck.codigo}-${camionesPage}-${index}`}
                      truck={truck}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ✅ TAB DE PEDIDOS REDISEÑADO */}
        {selectedTab === "pedidos" && (
          <div className="h-full flex flex-col">
            {/* Header de pedidos con gradiente */}
            <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-orange-800 mb-1">Pedidos Pendientes</h3>
                  <p className="text-sm text-orange-600">
                    Listando {pedidosPage * PAGE_SIZE + 1}–
                    {Math.min((pedidosPage + 1) * PAGE_SIZE, pedidosWithPriority.length)} de{" "}
                    {pedidosWithPriority.length} órdenes
                  </p>
                </div>

                {/* Controles de pedidos */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {isSearchingPedidos ? (
                      <div className="relative">
                        <input
                          ref={searchPedidosInputRef}
                          type="text"
                          value={searchTermPedidos}
                          onChange={(e) => handlePedidosSearch(e.target.value)}
                          onBlur={() => !searchTermPedidos && setIsSearchingPedidos(false)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              handlePedidosSearch("");
                              setIsSearchingPedidos(false);
                            }
                          }}
                          className="w-40 text-sm py-2.5 pl-10 pr-4 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 bg-white shadow-sm"
                          placeholder="Buscar cliente..."
                        />
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsSearchingPedidos(true)}
                        className="p-2.5 bg-white border-2 border-orange-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 shadow-sm"
                      >
                        <Search size={16} className="text-orange-500" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-orange-200">
                    <button
                      onClick={prevPedidosPage}
                      disabled={pedidosPage === 0}
                      className="p-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-50 transition-colors"
                    >
                      <ChevronLeft size={16} className="text-orange-600" />
                    </button>
                    <div className="px-3 py-1 text-sm font-medium text-orange-700 min-w-[60px] text-center">
                      {pedidosPage + 1} / {Math.ceil(pedidosWithPriority.length / PAGE_SIZE)}
                    </div>
                    <button
                      onClick={nextPedidosPage}
                      disabled={(pedidosPage + 1) * PAGE_SIZE >= pedidosWithPriority.length}
                      className="p-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-50 transition-colors"
                    >
                      <ChevronRight size={16} className="text-orange-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de pedidos */}
            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-gradient-to-r from-orange-50 to-white border-b-2 border-orange-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-sm font-bold text-orange-700 py-4 px-6">
                      Cliente
                    </TableHead>
                    <TableHead className="text-sm font-bold text-orange-700 px-4">
                      Volumen
                    </TableHead>
                    <TableHead className="text-sm font-bold text-orange-700 px-4">Fecha</TableHead>
                    <TableHead className="text-sm font-bold text-orange-700 px-4">
                      Ubicación
                    </TableHead>
                    <TableHead className="text-sm font-bold text-orange-700 px-4">
                      Camión
                    </TableHead>
                    <TableHead className="text-sm font-bold text-orange-700 px-6">
                      Urgencia
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visiblePedidos.map((pedido) => (
                    <PedidoRowImproved key={pedido.id} pedido={pedido} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {selectedTab === "almacenes" && (
          <div className="h-full flex flex-col">
            {/* Header de almacenes con gradiente */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-blue-800 mb-1">Red de Almacenes</h3>
                  <p className="text-sm text-blue-600">
                    Mostrando {almacenesPage * PAGE_SIZE + 1}–
                    {Math.min((almacenesPage + 1) * PAGE_SIZE, filteredAlmacenes.length)} de{" "}
                    {filteredAlmacenes.length} almacenes
                  </p>
                  {almacenSeleccionadoId && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        Almacén seleccionado: {
                          ALMACENES_DATA.find(a => `${a.posX}-${a.posY}` === almacenSeleccionadoId)?.nombre || "Desconocido"
                        }
                      </div>
                      <button
                        onClick={() => setAlmacenSeleccionadoId(null)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded-md transition-colors duration-200"
                        title="Deseleccionar almacén"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Controles de almacenes */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {isSearchingAlmacenes ? (
                      <div className="relative">
                        <input
                          ref={searchAlmacenesInputRef}
                          type="text"
                          value={searchTermAlmacenes}
                          onChange={(e) => handleAlmacenesSearch(e.target.value)}
                          onBlur={() => !searchTermAlmacenes && setIsSearchingAlmacenes(false)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              handleAlmacenesSearch("");
                              setIsSearchingAlmacenes(false);
                            }
                          }}
                          className="w-40 text-sm py-2.5 pl-10 pr-4 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-white shadow-sm"
                          placeholder="Buscar almacén..."
                        />
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsSearchingAlmacenes(true)}
                        className="p-2.5 bg-white border-2 border-blue-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm"
                        title="Buscar almacén"
                      >
                        <Search size={16} className="text-blue-500" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-blue-200">
                    <button
                      onClick={prevAlmacenesPage}
                      disabled={almacenesPage === 0}
                      className="p-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
                    >
                      <ChevronLeft size={16} className="text-blue-600" />
                    </button>
                    <div className="px-3 py-1 text-sm font-medium text-blue-700 min-w-[60px] text-center">
                      {almacenesPage + 1} / {Math.ceil(filteredAlmacenes.length / PAGE_SIZE)}
                    </div>
                    <button
                      onClick={nextAlmacenesPage}
                      disabled={(almacenesPage + 1) * PAGE_SIZE >= filteredAlmacenes.length}
                      className="p-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
                    >
                      <ChevronRight size={16} className="text-blue-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de almacenes */}
            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-gradient-to-r from-blue-50 to-white border-b-2 border-blue-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-sm font-bold text-blue-700 py-4 px-6">
                      Almacén
                    </TableHead>
                    <TableHead className="text-sm font-bold text-blue-700 px-4">
                      Tipo
                    </TableHead>
                    <TableHead className="text-sm font-bold text-blue-700 px-4">
                      Ubicación
                    </TableHead>
                    <TableHead className="text-sm font-bold text-blue-700 px-4">
                      Capacidad
                    </TableHead>
                    <TableHead className="text-sm font-bold text-blue-700 px-6">
                      Camiones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleAlmacenes.map((almacen, index) => (
                    <AlmacenRowImproved 
                      key={`${almacen.posX}-${almacen.posY}-${index}`} 
                      almacen={almacen} 
                      isSelected={almacenSeleccionadoId === `${almacen.posX}-${almacen.posY}`}
                      onSelect={setAlmacenSeleccionadoId}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {selectedTab === "bloqueos" && (
          <div className="h-full flex flex-col">
            {/* Header de bloqueos con gradiente rojo */}
            <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-red-800 mb-1">Bloqueos Activos</h3>
                  <p className="text-sm text-red-600">
                    Mostrando {bloqueosPage * PAGE_SIZE + 1}–
                    {Math.min((bloqueosPage + 1) * PAGE_SIZE, filteredBloqueos.length)} de{" "}
                    {filteredBloqueos.length} bloqueos
                  </p>
                  {bloqueoSeleccionadoId && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-sm font-medium border border-red-200">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        Bloqueo seleccionado: Bloqueo-{bloqueoSeleccionadoId}
                      </div>
                      <button
                        onClick={() => setBloqueoSeleccionadoId(null)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded-md transition-colors duration-200"
                        title="Deseleccionar bloqueo"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Controles de bloqueos */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {isSearchingBloqueos ? (
                      <div className="relative">
                        <input
                          ref={searchBloqueosInputRef}
                          type="text"
                          value={searchTermBloqueos}
                          onChange={(e) => handleBloqueosSearch(e.target.value)}
                          onBlur={() => !searchTermBloqueos && setIsSearchingBloqueos(false)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              handleBloqueosSearch("");
                              setIsSearchingBloqueos(false);
                            }
                          }}
                          className="w-40 text-sm py-2.5 pl-10 pr-4 border-2 border-red-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 bg-white shadow-sm"
                          placeholder="Buscar bloqueo..."
                        />
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsSearchingBloqueos(true)}
                        className="p-2.5 bg-white border-2 border-red-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all duration-200 shadow-sm"
                        title="Buscar bloqueo"
                      >
                        <Search size={16} className="text-red-500" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-red-200">
                    <button
                      onClick={prevBloqueosPage}
                      disabled={bloqueosPage === 0}
                      className="p-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-50 transition-colors"
                    >
                      <ChevronLeft size={16} className="text-red-600" />
                    </button>
                    <div className="px-3 py-1 text-sm font-medium text-red-700 min-w-[60px] text-center">
                      {bloqueosPage + 1} / {Math.ceil(filteredBloqueos.length / PAGE_SIZE)}
                    </div>
                    <button
                      onClick={nextBloqueosPage}
                      disabled={(bloqueosPage + 1) * PAGE_SIZE >= filteredBloqueos.length}
                      className="p-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-50 transition-colors"
                    >
                      <ChevronRight size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de bloqueos */}
            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-gradient-to-r from-red-50 to-white border-b-2 border-red-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-sm font-bold text-red-700 py-4 px-6">
                      Bloqueo
                    </TableHead>
                    <TableHead className="text-sm font-bold text-red-700 px-4">
                      Estado
                    </TableHead>
                    <TableHead className="text-sm font-bold text-red-700 px-4">
                      Duración
                    </TableHead>
                    <TableHead className="text-sm font-bold text-red-700 px-4">
                      Ubicación
                    </TableHead>
                    <TableHead className="text-sm font-bold text-red-700 px-6">
                      Distancia
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleBloqueos.map((bloqueo, index) => (
                    <BloqueoRowImproved 
                      key={`${bloqueo.id}-${index}`} 
                      bloqueo={bloqueo}
                      isSelected={bloqueoSeleccionadoId === bloqueo.id}
                      onSelect={setBloqueoSeleccionadoId}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AlmacenRowImproved = React.memo(({ 
  almacen, 
  isSelected, 
  onSelect 
}: { 
  almacen: AlmacenInfo; 
  isSelected: boolean;
  onSelect: (id: string | null) => void;
}) => {
  const getAlmacenIcon = (typeHouse: string) => {
    return typeHouse === "home" ? "🏢" : "🏭";
  };

  const getAlmacenColor = (typeHouse: string) => {
    return typeHouse === "home" 
      ? "bg-blue-400 shadow-blue-200" 
      : "bg-cyan-400 shadow-cyan-200";
  };

  const getTipoLabel = (typeHouse: string) => {
    return typeHouse === "home" ? "Central" : "Intermedio";
  };

  const handleClick = useCallback(() => {
    const almacenId = `${almacen.posX}-${almacen.posY}`;
    onSelect(isSelected ? null : almacenId);
  }, [almacen.posX, almacen.posY, isSelected, onSelect]);

  return (
    <TableRow 
      onClick={handleClick}
      className={`cursor-pointer transition-all duration-200 hover:bg-blue-50 border-b border-blue-100 ${
        isSelected ? "bg-blue-100 border-l-4 border-blue-500 shadow-lg ring-2 ring-blue-200" : ""
      }`}
    >
      <TableCell className="py-4 px-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-4 h-4 rounded-full ${getAlmacenColor(
              almacen.typeHouse
            )} shadow-sm border-2 border-white ${
              isSelected ? "ring-2 ring-blue-400 scale-125" : ""
            } transition-all duration-200`}
          />
          <div>
            <div className={`font-bold text-base ${
              isSelected ? "text-blue-800" : "text-slate-800"
            } transition-colors duration-200`}>
              {almacen.nombre}
            </div>
            <div className={`text-sm ${
              isSelected ? "text-blue-600" : "text-slate-500"
            } transition-colors duration-200`}>
              {almacen.descripcion}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4">
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${
          isSelected 
            ? "bg-blue-200 text-blue-800 border-blue-300 shadow-md" 
            : "bg-blue-50 text-blue-700 border-blue-200"
        } transition-all duration-200`}>
          <span className="text-base">{getAlmacenIcon(almacen.typeHouse)}</span>
          {getTipoLabel(almacen.typeHouse)}
        </span>
      </TableCell>
      <TableCell className={`text-sm px-4 font-mono ${
        isSelected ? "text-blue-700 font-semibold" : "text-slate-700"
      } transition-colors duration-200`}>
        ({almacen.posX}, {almacen.posY})
      </TableCell>
      <TableCell className="text-sm text-slate-700 px-4">
        <div className="flex items-center gap-2">
          <div className="text-lg">📦</div>
          <div>
            <span className={`text-sm font-bold ${
              isSelected ? "text-blue-800" : "text-slate-800"
            } transition-colors duration-200`}>
              {almacen.capacidad}
            </span>
            <div className={`text-xs ${
              isSelected ? "text-blue-600" : "text-slate-500"
            } transition-colors duration-200`}>
              capacidad
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-6">
        <div className="flex items-center gap-3">
          <div className="text-lg">🚛</div>
          <div>
            <span className={`text-sm font-bold ${
              isSelected ? "text-blue-800" : "text-slate-800"
            } transition-colors duration-200`}>
              {almacen.camionesActuales}
            </span>
            <div className={`text-xs ${
              isSelected ? "text-blue-600" : "text-slate-500"
            } transition-colors duration-200`}>
              en almacén
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
});

AlmacenRowImproved.displayName = "AlmacenRowImproved";

// ✅ COMPONENTE DE FILA DE BLOQUEO
const BloqueoRowImproved = React.memo(({ 
  bloqueo,
  isSelected,
  onSelect
}: { 
  bloqueo: any;
  isSelected: boolean;
  onSelect: (id: number | null) => void;
}) => {
  const { simulationTime } = useMapContext();
  const { timerSimulacion } = simulationTime;

  // Manejar click para selección
  const handleClick = useCallback(() => {
    onSelect(isSelected ? null : bloqueo.id);
  }, [bloqueo.id, isSelected, onSelect]);

  // Calcular si está activo
  const tiempoInicio = bloqueo.diaInicio * 24 * 60 + bloqueo.horaInicio * 60 + bloqueo.minutoInicio;
  const tiempoFin = bloqueo.diaFin * 24 * 60 + bloqueo.horaFin * 60 + bloqueo.minutoFin;
  const isActive = timerSimulacion >= tiempoInicio && timerSimulacion <= tiempoFin;

  // Calcular distancia total del bloqueo
  let distance = 0;
  for (let tramo of bloqueo.tramo) {
    let { x_fin, x_ini, y_fin, y_ini } = tramo;
    if (x_fin === x_ini) distance += Math.abs(y_fin - y_ini);
    if (y_fin === y_ini) distance += Math.abs(x_fin - x_ini);
  }

  // Calcular duración
  const duracionMinutos = tiempoFin - tiempoInicio;
  const duracionHoras = Math.floor(duracionMinutos / 60);
  const duracionMin = duracionMinutos % 60;

  return (
    <TableRow 
      onClick={handleClick}
      className={`cursor-pointer transition-all duration-200 border-b border-red-100 hover:bg-red-50 ${
        isSelected ? "bg-red-100 border-l-4 border-red-500 shadow-lg ring-2 ring-red-200" : ""
      }`}
    >
      <TableCell className="py-4 px-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-4 h-4 rounded-full shadow-sm border-2 border-white ${
              isActive ? "bg-red-500 animate-pulse" : "bg-gray-400"
            }`}
          />
          <div>
            <div className="font-bold text-base text-slate-800">Bloqueo-{bloqueo.id}</div>
            <div className="text-sm text-slate-500">
              {isActive ? "🔴 Activo" : "⭕ Inactivo"}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4">
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${
          isActive 
            ? "bg-red-50 text-red-700 border-red-200" 
            : "bg-gray-50 text-gray-700 border-gray-200"
        }`}>
          <span className="text-base">{isActive ? "🚫" : "⏸️"}</span>
          {isActive ? "Bloqueando" : "Programado"}
        </span>
      </TableCell>
      <TableCell className="text-sm text-slate-700 px-4">
        <div className="flex items-center gap-2">
          <div className="text-lg">⏱️</div>
          <div>
            <span className="text-sm font-bold text-slate-800">
              {duracionHoras}h {duracionMin}m
            </span>
            <div className="text-xs text-slate-500">duración</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm text-slate-700 px-4">
        <div className="space-y-1">
          {bloqueo.tramo.slice(0, 2).map((tramo, index) => (
            <div key={index} className="font-mono text-xs">
              ({tramo.x_ini},{tramo.y_ini}) → ({tramo.x_fin},{tramo.y_fin})
            </div>
          ))}
          {bloqueo.tramo.length > 2 && (
            <div className="text-xs text-slate-500">
              +{bloqueo.tramo.length - 2} tramos más
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="px-6">
        <div className="flex items-center gap-3">
          <div className="text-lg">📏</div>
          <div>
            <span className="text-sm font-bold text-slate-800">{distance}</span>
            <div className="text-xs text-slate-500">unidades</div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
});

BloqueoRowImproved.displayName = "BloqueoRowImproved";

// ✅ COMPONENTE DE FILA DE CAMIÓN MEJORADO CON ESTADOS SIMPLIFICADOS
const CamionRowImproved = React.memo(({ truck }: TruckRow) => {
  const { camionSeleccionadoId, setCamionSeleccionadoId } = useMapContext();

  const handleClick = useCallback(() => {
    setCamionSeleccionadoId((prev) => (prev === truck.id ? null : truck.id));
  }, [truck.id, setCamionSeleccionadoId]);

  const estaSeleccionado = camionSeleccionadoId === truck.id;
  const tipo = truck.codigo.substring(0, 2);

  const getTruckTypeColor = (tipo: string) => {
    switch (tipo) {
      case "TA":
        return "bg-yellow-400 shadow-yellow-200";
      case "TB":
        return "bg-blue-400 shadow-blue-200";
      case "TC":
        return "bg-orange-500 shadow-orange-200";
      case "TD":
        return "bg-slate-500 shadow-slate-200";
      default:
        return "bg-gray-400 shadow-gray-200";
    }
  };

  const getEstadoCamion = (truck: CamionI) => {
    const tieneRuta = truck.route && truck.route.length > 0;
    const posicionAlmacenCentral = {x: 12, y: 8};
    const posicionAlmacenEste = {x:63, y: 3};
    const posicionAlmacenNorte = {x:42,y:42};

    const estaEnPosicionAlmacen = truck.ubicacionActual.x === posicionAlmacenCentral.x && truck.ubicacionActual.y === posicionAlmacenCentral.y ||
      truck.ubicacionActual.x === posicionAlmacenEste.x && truck.ubicacionActual.y === posicionAlmacenEste.y ||
      truck.ubicacionActual.x === posicionAlmacenNorte.x && truck.ubicacionActual.y === posicionAlmacenNorte.y;
    console.log("Estado del camión:", { tieneRuta, estaEnPosicionAlmacen });
    if (tieneRuta && !estaEnPosicionAlmacen) {
      return {
        label: "En ruta",
        color: "text-emerald-700 bg-emerald-100 border-emerald-200",
        icon: "🚛",
      };
    } else {
      return {
        label: "En almacén",
        color: "text-slate-700 bg-slate-100 border-slate-200",
        icon: "🏭",
      };
    }
  };

  const getDestination = (truck: CamionI) => {
    if (!truck.route || truck.route.length === 0) return "Averiado";
    const nextOrder = truck.route.find((punto) => punto.esPedido);
    return nextOrder ? `(${nextOrder.x},${nextOrder.y})` : "Base";
  };

  const estadoCamion = getEstadoCamion(truck);

  return (
    <TableRow
      onClick={handleClick}
      className={`cursor-pointer transition-all duration-200 hover:bg-slate-50 border-b border-slate-100 ${
        estaSeleccionado ? "bg-blue-50 border-l-4 border-blue-500 shadow-md" : ""
      }`}
    >
      <TableCell className="py-4 px-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-4 h-4 rounded-full ${getTruckTypeColor(
              tipo
            )} shadow-sm border-2 border-white`}
          />
          <div>
            <div className="font-bold text-base text-slate-800">{truck.codigo}</div>
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <span>{truck.cargaAsignada}m³</span>
              <span className="text-slate-300">•</span>
              <span>cargado</span>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${estadoCamion.color}`}
        >
          <span className="text-base">{estadoCamion.icon}</span>
          {estadoCamion.label}
        </span>
      </TableCell>
      <TableCell className="text-sm text-slate-700 px-4 font-mono">
        ({truck.ubicacionActual.x}, {truck.ubicacionActual.y})
      </TableCell>
      <TableCell className="text-sm text-slate-700 px-6 font-medium">
        {getDestination(truck)}
      </TableCell>
    </TableRow>
  );
});

// ✅ COMPONENTE DE FILA DE PEDIDO MEJORADO
const PedidoRowImproved = React.memo(({ pedido }: { pedido: any }) => {
  const { pedidoSeleccionadoId, setPedidoSeleccionadoId } = useMapContext();
  const priority = getPriorityFromHours(pedido.horasLimite);
  const IconComponent = priority.icon;

  const handleClick = () => {
    setPedidoSeleccionadoId((prev) => (prev === pedido.id ? null : pedido.id));
  };

  const estaSeleccionado = pedidoSeleccionadoId === pedido.id;

  return (
    <TableRow
      onClick={handleClick}
      className={`cursor-pointer transition-all duration-200 hover:bg-orange-50 border-b border-orange-100 ${
        estaSeleccionado ? "bg-blue-50 border-l-4 border-blue-500 shadow-md" : ""
      }`}
    >
      <TableCell className="py-4 px-6">
        <div className="font-bold text-base text-orange-800">
          {pedido.cliente?.codigo || pedido.idCliente || "N/A"}
        </div>
      </TableCell>
      <TableCell className="px-4">
        <div className="flex items-center gap-3">
          <div className="text-xl">{getVolumeIcon(pedido.cantidadGLP)}</div>
          <div>
            <span className="text-sm font-bold text-slate-800">{pedido.cantidadGLP}m³</span>
            <div className="text-xs text-slate-500">volumen</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm text-slate-700 px-4">
        <div className="font-medium">
          {pedido.dia}/{pedido.mesPedido}
        </div>
        <div className="text-xs text-slate-500">
          {pedido.hora}:{String(pedido.minuto).padStart(2, "0")}
        </div>
      </TableCell>
      <TableCell className="text-sm text-slate-700 px-4 font-mono">
        ({pedido.posX}, {pedido.posY})
      </TableCell>
      {/* Camión asignado */}
      <TableCell className="text-sm text-center px-4 whitespace-nowrap">
        {pedido.idCamion ? (
          <span className="inline-flex items-center gap-1">
            {/* Ícono opcional */}
            {/* <Truck className="h-4 w-4 text-orange-500" /> */}
            {pedido.idCamion}
          </span>
        ) : "—"}
      </TableCell>
      <TableCell className="px-6">
        <div className="flex items-center gap-3">
          <IconComponent className={`w-5 h-5 ${priority.color}`} />
          <div>
            <span className="text-sm font-bold text-slate-800">{pedido.horasLimite}h</span>
            <div className="text-xs text-slate-500">{priority.label}</div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
});

// Funciones helper
const getPriorityFromHours = (horasLimite: number) => {
  if (horasLimite <= 6) {
    return {
      level: "urgent",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: Siren,
      label: "Urgente",
    };
  } else if (horasLimite <= 12) {
    return {
      level: "high",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: Zap,
      label: "Alta",
    };
  } else if (horasLimite <= 24) {
    return {
      level: "medium",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      icon: Clock,
      label: "Media",
    };
  } else {
    return {
      level: "low",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: ArrowDown,
      label: "Baja",
    };
  }
};

const getVolumeIcon = (volumen: number) => {
  if (volumen <= 3) {
    return "📦"; // Ligero
  } else if (volumen <= 10) {
    return "📋"; // Medio
  } else {
    return "🏗️"; // Pesado
  }
};
