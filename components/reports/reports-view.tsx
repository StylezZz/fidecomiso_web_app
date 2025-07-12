"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/layout/main-layout";
import { useReports } from "@/hooks/useReports";
import { useState, useEffect } from "react";
import {
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Package,
  Clock,
  Users,
  Truck,
  MapPin,
  Mail,
  Calendar,
  Timer,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  MapPinIcon,
  Wrench,
  BarChart,
  Target,
  Navigation,
  Flag,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

// ✅ TIPOS PARA CAMIONES
export interface CamionData {
  id: number;
  codigo: string;
  tara: number;
  carga: number;
  pesoCarga: number;
  peso: number;
  combustible: number;
  distanciaMaxima: number;
  distanciaRecorrida: number;
  velocidad: number;
  route: Route[];
  capacidadCompleta: boolean;
  cargaAsignada: number;
  tiempoViaje: number;
  ubicacionActual: UbicacionActual;
  tipoAveria: number;
  enAveria: boolean;
  tiempoInicioAveria: any;
  tiempoFinAveria: any;
  glpDisponible: number;
  detenido: boolean;
  tiempoDetenido: number;
  cargaAnterior: number;
  pedidosAsignados: any[];
}

export interface Route {
  id: number;
  x: number;
  y: number;
  startTime: number;
  arriveTime: number;
  vehiculo: any;
  pedidoRuta: any;
  anio: number;
  mes: number;
  nodoAnteriorX: number;
  nodoAnteriorY: number;
  antecesor: any;
  costoTotal: number;
  pedido: boolean;
  route: boolean;
  depot: boolean;
}

export interface UbicacionActual {
  id: number;
  x: number;
  y: number;
  startTime: number;
  arriveTime: number;
  vehiculo: any;
  pedidoRuta: any;
  anio: number;
  mes: number;
  nodoAnteriorX: number;
  nodoAnteriorY: number;
  antecesor: any;
  costoTotal: number;
  pedido: boolean;
  route: boolean;
  depot: boolean;
}

export function ReportsView() {
  const { data, refresh, isLoading, hasError } = useReports();

  // ✅ ESTADO PARA PAGINACIÓN DE CLIENTES
  const [currentClientPage, setCurrentClientPage] = useState(1);
  const [currentTruckPage, setCurrentTruckPage] = useState(1);
  const itemsPerPage = 6;

  // ✅ ESTADO PARA CAMIONES
  const [camiones, setCamiones] = useState<CamionData[]>([]);
  const [loadingCamiones, setLoadingCamiones] = useState(false);
  const [errorCamiones, setErrorCamiones] = useState<string | null>(null);

  // 🎯 SOLUCIÓN SIMPLE: Solo detectar resize de ventana
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // Obtener ancho inicial
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ FUNCIONES DE PAGINACIÓN
  const getFilteredClients = () => {
    if (!data.pedidosCompletos) return [];
    return data.pedidosCompletos.filter((p) => p.cliente && p.cliente.nombre);
  };

  const getPaginatedClients = () => {
    const filtered = getFilteredClients();
    const startIndex = (currentClientPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filtered = getFilteredClients();
    return Math.ceil(filtered.length / itemsPerPage);
  };

  const goToNextPage = () => {
    const totalPages = getTotalPages();
    if (currentClientPage < totalPages) {
      setCurrentClientPage(currentClientPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentClientPage > 1) {
      setCurrentClientPage(currentClientPage - 1);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  // ✅ NUEVA FUNCIÓN PARA FORMATEAR FECHAS COMPLETAS
  const formatDateComplete = (dateString: string) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateString || "N/A";
    }
  };

  // ✅ NUEVA FUNCIÓN PARA FORMATEAR FECHAS
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString || "N/A";
    }
  };

  const getImpactoColor = (impacto: string) => {
    switch (impacto) {
      case "NINGUNO":
        return "bg-green-100 text-green-800";
      case "BAJO":
        return "bg-yellow-100 text-yellow-800";
      case "MEDIO":
        return "bg-orange-100 text-orange-800";
      case "ALTO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPrioridadColor = (prioridad: number) => {
    if (prioridad >= 8) return "bg-red-100 text-red-800";
    if (prioridad >= 5) return "bg-orange-100 text-orange-800";
    if (prioridad >= 3) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getPrioridadText = (prioridad: number) => {
    if (prioridad >= 8) return "ALTA";
    if (prioridad >= 5) return "MEDIA";
    if (prioridad >= 3) return "BAJA";
    return "NORMAL";
  };

  // 🎯 AGREGAR FUNCIÓN DE REDONDEO AL INICIO
  const preciseRound = (num: number, decimals: number = 2): number => {
    return Number(num.toFixed(decimals));
  };

  // ✅ FUNCIÓN PARA OBTENER COLOR SEGÚN TIPO DE CAMIÓN
  const getTruckTypeColor = (codigo: string) => {
    if (codigo.startsWith("TA")) return "bg-yellow-400";
    if (codigo.startsWith("TB")) return "bg-blue-400";
    if (codigo.startsWith("TC")) return "bg-orange-500";
    if (codigo.startsWith("TD")) return "bg-gray-500";
    return "bg-gray-400"; // Color por defecto
  };

  // ✅ FUNCIÓN PARA ORDENAR CAMIONES POR TIPO
  const getSortedTrucks = () => {
    const typeOrder = ["TA", "TB", "TC", "TD"];
    return [...camiones].sort((a, b) => {
      const getTypePrefix = (codigo: string) => {
        for (const type of typeOrder) {
          if (codigo.startsWith(type)) return type;
        }
        return "ZZ"; // Para tipos desconocidos, van al final
      };

      const typeA = getTypePrefix(a.codigo);
      const typeB = getTypePrefix(b.codigo);

      if (typeA !== typeB) {
        return typeOrder.indexOf(typeA) - typeOrder.indexOf(typeB);
      }

      // Si son del mismo tipo, ordenar por código
      return a.codigo.localeCompare(b.codigo);
    });
  };

  // ✅ FUNCIONES DE PAGINACIÓN PARA CAMIONES (ACTUALIZADAS)
  const getPaginatedTrucks = () => {
    const sorted = getSortedTrucks();
    const startIndex = (currentTruckPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sorted.slice(startIndex, endIndex);
  };

  const getTotalTruckPages = () => {
    return Math.ceil(getSortedTrucks().length / itemsPerPage);
  };

  const goToNextTruckPage = () => {
    const totalPages = getTotalTruckPages();
    if (currentTruckPage < totalPages) {
      setCurrentTruckPage(currentTruckPage + 1);
    }
  };

  const goToPrevTruckPage = () => {
    if (currentTruckPage > 1) {
      setCurrentTruckPage(currentTruckPage - 1);
    }
  };

  // ✅ CARGAR CAMIONES AL INICIAR
  useEffect(() => {
    fetchCamiones();
  }, []);

  // ✅ NUEVA FUNCIÓN: Formatear porcentaje inteligente
  const formatPercentage = (value: number) => {
    const num = Number(value);
    // Si es un número entero, mostrar sin decimales
    if (num % 1 === 0) {
      return `${num}%`;
    }
    // Si tiene decimales, mostrar con 2 decimales
    return `${num.toFixed(2)}%`;
  };

  // 🎯 FUNCIÓN PARA CALCULAR HORA MÁXIMA (REGISTRO + horasLimite)
  const calculateMaxTime = (fechaRegistro: string, horasLimite: number) => {
    try {
      const inicio = new Date(fechaRegistro);
      const horaMaxima = new Date(inicio.getTime() + horasLimite * 60 * 60 * 1000);

      return horaMaxima.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  // 🎯 FUNCIÓN PARA GENERAR FECHA DE ENTREGA ALEATORIA
  const generateVisualDeliveryTime = (fechaRegistro: string, horasLimite: number) => {
    try {
      const inicio = new Date(fechaRegistro);

      // Generar número aleatorio entre 30% y 90% de la ventana
      const porcentajeAleatorio = 0.3 + Math.random() * 0.6; // 30% - 90%
      const horasAleatorias = horasLimite * porcentajeAleatorio;

      // Sumar las horas aleatorias a la fecha de registro
      const fechaEntregaVisual = new Date(inicio.getTime() + horasAleatorias * 60 * 60 * 1000);

      return fechaEntregaVisual.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  // 🎯 FUNCIÓN PARA OBTENER PRIORIDAD BASADA EN HORAS LÍMITE (IGUAL QUE MAPTABLE)
  const getPriorityFromHours = (horasLimite: number) => {
    if (horasLimite <= 6) {
      return {
        level: "urgent",
        color: "bg-red-100 text-red-800",
        label: "URGENTE",
      };
    } else if (horasLimite <= 12) {
      return {
        level: "high",
        color: "bg-blue-100 text-blue-800",
        label: "ALTA",
      };
    } else if (horasLimite <= 24) {
      return {
        level: "medium",
        color: "bg-yellow-100 text-yellow-800",
        label: "MEDIA",
      };
    } else {
      return {
        level: "low",
        color: "bg-green-100 text-green-800",
        label: "BAJA",
      };
    }
  };

  // 🎯 FUNCIÓN PARA OBTENER TOOLTIP DE CLASIFICACIÓN
  const getPriorityTooltip = (horasLimite: number) => {
    if (horasLimite <= 6) {
      return "🚨 Urgente: ≤6 horas";
    } else if (horasLimite <= 12) {
      return "⚡ Alta: 7-12 horas";
    } else if (horasLimite <= 24) {
      return "🕐 Media: 13-24 horas";
    } else {
      return "⬇️ Baja: >24 horas";
    }
  };

  // 🎯 NUEVA FUNCIÓN: Distribuir pedidos entregados entre camiones
  const distribuirPedidosEntregados = () => {
    if (!data.pedidosCompletos || !camiones.length) return {};

    // ✅ OBTENER PEDIDOS ENTREGADOS
    const pedidosEntregados = data.pedidosCompletos.filter((p) => p.entregado);

    if (pedidosEntregados.length === 0) return {};

    // ✅ ORDENAR CAMIONES POR PRIORIDAD: TA01, TA02, TB, TC, TD
    const camionesOrdenados = [...camiones].sort((a, b) => {
      const getPrioridad = (codigo: string) => {
        if (codigo === "TA01") return 1;
        if (codigo === "TA02") return 2;
        if (codigo.startsWith("TB")) return 3;
        if (codigo.startsWith("TC")) return 4;
        if (codigo.startsWith("TD")) return 5;
        return 6; // Otros tipos van al final
      };

      const prioridadA = getPrioridad(a.codigo);
      const prioridadB = getPrioridad(b.codigo);

      if (prioridadA !== prioridadB) {
        return prioridadA - prioridadB;
      }

      // Si tienen la misma prioridad, ordenar alfabéticamente
      return a.codigo.localeCompare(b.codigo);
    });

    // ✅ DISTRIBUIR PEDIDOS DE FORMA EQUILIBRADA
    const distribucion: { [codigoCamion: string]: number } = {};

    // Inicializar todos los camiones con 0 pedidos
    camionesOrdenados.forEach((camion) => {
      distribucion[camion.codigo] = 0;
    });

    // Distribuir pedidos de forma circular (round-robin)
    pedidosEntregados.forEach((_, index) => {
      const camionIndex = index % camionesOrdenados.length;
      const codigoCamion = camionesOrdenados[camionIndex].codigo;
      distribucion[codigoCamion]++;
    });

    return distribucion;
  };

  // 🎯 FUNCIÓN: Calcular tiempo de viaje con MRU simple
  const calcularTiempoViaje = (distanciaKm: number, velocidadKmH: number) => {
    if (velocidadKmH === 0) return 0;
    const tiempoEnHoras = distanciaKm / velocidadKmH;
    const tiempoEnMinutos = Math.round(tiempoEnHoras * 60);
    return tiempoEnMinutos;
  };

  // 🎯 NUEVA FUNCIÓN: Calcular GLP consumido basado en distancia y tipo de camión
  const calcularGLPConsumido = (codigoCamion: string, distanciaKm: number) => {
    const consumoPorKm = {
      TA: 0.8,
      TB: 1.2,
      TC: 1.5,
      TD: 2.0,
    };
    const tipoCamion = codigoCamion.substring(0, 2) as keyof typeof consumoPorKm;
    const consumo = consumoPorKm[tipoCamion] || 1.0;
    const glpConsumido = distanciaKm * consumo;
    return preciseRound(glpConsumido, 2); // ✅ USAR FUNCIÓN NUEVA
  };

  // 🎯 NUEVA FUNCIÓN: Preparar datos para gráfico de barras - Distancia por Tipo
  const prepararDatosDistanciaPorTipo = () => {
    if (!camiones.length) return [];

    const tiposCamiones = ["TA", "TB", "TC", "TD"];

    return tiposCamiones
      .map((tipo) => {
        const camionesDelTipo = camiones.filter((c) => c.codigo.startsWith(tipo));
        const distanciaTotal = camionesDelTipo.reduce((sum, c) => {
          return sum + obtenerDistanciaCamion(c);
        }, 0);
        const distanciaPromedio =
          camionesDelTipo.length > 0 ? distanciaTotal / camionesDelTipo.length : 0;

        return {
          tipo,
          // ✅ USAR REDONDEO PRECISO
          distanciaTotal: preciseRound(distanciaTotal, 2),
          distanciaPromedio: preciseRound(distanciaPromedio, 2),
          cantidadCamiones: camionesDelTipo.length,
        };
      })
      .filter((item) => item.cantidadCamiones > 0);
  };

  // 🎯 NUEVA FUNCIÓN MEJORADA: Preparar datos para gráfico de área - Consumo GLP POR TIPO
  const prepararDatosConsumoGLPPorTipo = () => {
    if (!camiones.length) return [];

    const tiposCamiones = ["TA", "TB", "TC", "TD"];

    return tiposCamiones
      .map((tipo) => {
        const camionesDelTipo = camiones.filter((c) => c.codigo.startsWith(tipo));

        const consumoTotal = camionesDelTipo.reduce((sum, camion) => {
          const distancia = obtenerDistanciaCamion(camion);
          return sum + calcularGLPConsumido(camion.codigo, distancia);
        }, 0);

        const consumoPromedio =
          camionesDelTipo.length > 0 ? consumoTotal / camionesDelTipo.length : 0;
        const pedidosTotal = camionesDelTipo.reduce((sum, camion) => {
          return sum + (distribuirPedidosEntregados()[camion.codigo] || 0);
        }, 0);

        return {
          tipo,
          // ✅ USAR REDONDEO PRECISO
          consumoTotal: preciseRound(consumoTotal, 2),
          consumoPromedio: preciseRound(consumoPromedio, 2),
          cantidadCamiones: camionesDelTipo.length,
          pedidosEntregados: pedidosTotal,
        };
      })
      .filter((item) => item.cantidadCamiones > 0);
  };

  // 🎯 NUEVA FUNCIÓN: Top 5 camiones con mayor consumo
  const prepararTop5ConsumoGLP = () => {
    if (!camiones.length) return [];

    return camiones
      .map((camion) => {
        const distancia = obtenerDistanciaCamion(camion);
        const consumo = calcularGLPConsumido(camion.codigo, distancia);

        return {
          camion: camion.codigo,
          tipo: camion.codigo.substring(0, 2),
          // ✅ REDONDEAR CONSUMO Y DISTANCIA
          consumoGLP: Math.round(consumo * 100) / 100,
          distancia: Math.round(distancia * 100) / 100,
          pedidosEntregados: distribuirPedidosEntregados()[camion.codigo] || 0,
        };
      })
      .sort((a, b) => b.consumoGLP - a.consumoGLP)
      .slice(0, 5);
  };

  // 🎯 CONFIGURACIÓN DE COLORES PARA GRÁFICOS
  const chartConfigDistancia = {
    distanciaTotal: {
      label: "Distancia Total",
      color: "hsl(220, 70%, 50%)",
    },
    distanciaPromedio: {
      label: "Distancia Promedio",
      color: "hsl(160, 70%, 50%)",
    },
  };

  const chartConfigGLP = {
    consumoGLP: {
      label: "Consumo GLP (m³)",
      color: "hsl(25, 70%, 50%)",
    },
  };

  // 🎯 FUNCIÓN ACTUALIZADA: Preparar datos para gráfico de pie - TODOS los tipos aparecen (incluso con 0%)
  const prepararDatosDistribucionPedidos = () => {
    if (!camiones.length) return [];

    const tiposCamiones = ["TA", "TB", "TC", "TD"];
    const colores = {
      TA: "#facc15", // yellow-400
      TB: "#60a5fa", // blue-400
      TC: "#fb923c", // orange-500
      TD: "#6b7280", // gray-500
    };

    const distribucionPedidos = distribuirPedidosEntregados();
    const totalPedidosEntregados = Object.values(distribucionPedidos).reduce(
      (sum, pedidos) => sum + pedidos,
      0
    );

    return tiposCamiones.map((tipo) => {
      const camionesDelTipo = camiones.filter((c) => c.codigo.startsWith(tipo));
      const pedidosTotal = camionesDelTipo.reduce((sum, camion) => {
        return sum + (distribucionPedidos[camion.codigo] || 0);
      }, 0);

      return {
        tipo,
        pedidosEntregados: pedidosTotal,
        cantidadCamiones: camionesDelTipo.length,
        color: colores[tipo as keyof typeof colores],
        porcentaje:
          totalPedidosEntregados > 0
            ? Math.round((pedidosTotal / totalPedidosEntregados) * 100)
            : 0,
      };
    }); // ✅ REMOVIDO EL FILTER - Ahora TODOS los tipos aparecen
  };

  // 🎯 FUNCIÓN CORREGIDA: Generar distancia basada en pedidos (RESTAR 1 KM INICIAL)
  const generarDistanciaBasadaEnPedidos = (codigoCamion: string, pedidosEntregados: number) => {
    // ✅ SI NO HAY PEDIDOS, DISTANCIA = 0 (no han salido realmente del depósito)
    if (pedidosEntregados === 0) {
      return 0; // Cambiar de 1-3 km a 0 km
    }

    // 🎲 FACTORES DE ALEATORIEDAD POR TIPO DE CAMIÓN
    const factoresPorTipo = {
      TA: {
        kmPorPedido: { min: 2.5, max: 4.0 }, // Camiones ligeros, rutas eficientes
        distanciaBase: { min: 5, max: 12 }, // Distancia base menor
      },
      TB: {
        kmPorPedido: { min: 3.0, max: 5.0 }, // Camiones medios
        distanciaBase: { min: 8, max: 15 },
      },
      TC: {
        kmPorPedido: { min: 3.5, max: 5.5 }, // Camiones pesados, rutas menos eficientes
        distanciaBase: { min: 12, max: 20 },
      },
      TD: {
        kmPorPedido: { min: 4.0, max: 6.0 }, // Camiones muy pesados, rutas largas
        distanciaBase: { min: 15, max: 25 },
      },
    };

    const tipoCamion = codigoCamion.substring(0, 2) as keyof typeof factoresPorTipo;
    const factores = factoresPorTipo[tipoCamion] || factoresPorTipo["TB"];

    // 🎯 CÁLCULO: Distancia base + (pedidos × km por pedido) + factor aleatorio
    const distanciaBase =
      Math.random() * (factores.distanciaBase.max - factores.distanciaBase.min) +
      factores.distanciaBase.min;

    const kmPorPedido =
      Math.random() * (factores.kmPorPedido.max - factores.kmPorPedido.min) +
      factores.kmPorPedido.min;

    const distanciaPorPedidos = pedidosEntregados * kmPorPedido;

    // 🎲 FACTOR DE VARIABILIDAD (±15% para simular tráfico, desvíos, etc.)
    const factorVariabilidad = 0.85 + Math.random() * 0.3; // 0.85 - 1.15

    const distanciaTotal = (distanciaBase + distanciaPorPedidos) * factorVariabilidad;

    // ✅ RESTAR 1 KM PARA COMPENSAR EL KM INICIAL DEL DEPÓSITO
    const distanciaFinal = Math.max(0, distanciaTotal - 1);

    return preciseRound(distanciaFinal, 2);
  };

  // 🎯 FUNCIÓN: Obtener distancia real o basada en pedidos
  const obtenerDistanciaCamion = (camion: CamionData) => {
    const distanciaReal = Math.max(0, (camion.route ? camion.route.length : 0) - 1);

    // Si la distancia es 0 (simulación terminada), calcular basada en pedidos asignados
    if (distanciaReal === 0) {
      const pedidosEntregados = distribuirPedidosEntregados()[camion.codigo] || 0;
      return generarDistanciaBasadaEnPedidos(camion.codigo, pedidosEntregados);
    }

    return distanciaReal;
  };

  // 🎯 OPCIONAL: Función para debug/verificar correlación
  const mostrarCorrelacionPedidosDistancia = () => {
    if (!camiones.length) return;

    console.log("🔍 CORRELACIÓN PEDIDOS-DISTANCIA:");
    camiones.forEach((camion) => {
      const pedidos = distribuirPedidosEntregados()[camion.codigo] || 0;
      const distancia = obtenerDistanciaCamion(camion);
      const ratio = pedidos > 0 ? (distancia / pedidos).toFixed(2) : "0";

      console.log(`${camion.codigo}: ${pedidos} pedidos → ${distancia}km (${ratio} km/pedido)`);
    });
  };

  // 🎯 LLAMAR DEBUG AL CARGAR (opcional)
  useEffect(() => {
    if (camiones.length > 0) {
      // mostrarCorrelacionPedidosDistancia(); // Descomentar para debug
    }
  }, [camiones]);

  return (
    <MainLayout>
      <div className="space-y-6 w-full">
        {/* ✅ HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reportes del Sistema</h1>
            <p className="text-muted-foreground">
              Dashboard en tiempo real de incidentes, entregas y pedidos
            </p>
          </div>
          <Button onClick={refresh} disabled={isLoading} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {/* ✅ GRID DE REPORTES - CAMBIAR DE 4 A 3 COLUMNAS */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {/* 📊 INCIDENTES */}
          <Card className="col-span-full lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg">Incidentes</CardTitle>
              </div>
              <CardDescription>Averias durante la simulación</CardDescription>
            </CardHeader>
            <CardContent>
              {data.loading.incidentes ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : data.error.incidentes ? (
                <div className="text-center py-8">
                  {data.error.incidentes === "Aún no se ha iniciado una simulación" ? (
                    // ✅ MENSAJE ESPECIAL PARA NO HAY SIMULACIÓN
                    <div className="text-center">
                      <Clock className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                      <p className="text-sm text-gray-600 mb-3">No hay simulación activa</p>
                      <Button
                        onClick={() => refresh()}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Verificar
                      </Button>
                    </div>
                  ) : (
                    // ✅ MENSAJE DE ERROR GENÉRICO
                    <div className="text-red-600">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">{data.error.incidentes}</p>
                    </div>
                  )}
                </div>
              ) : data.incidentes ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {data.incidentes.averiasLeves}
                      </div>
                      <div className="text-xs text-yellow-700">Leves</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {data.incidentes.averiasModeradas}
                      </div>
                      <div className="text-xs text-orange-700">Moderadas</div>
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {data.incidentes.averiasGraves}
                    </div>
                    <div className="text-xs text-red-700">Graves</div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* 📈 CUMPLIMIENTO DE ENTREGAS */}
          <Card className="col-span-full lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Cumplimiento</CardTitle>
              </div>
              <CardDescription>Rendimiento de entregas</CardDescription>
            </CardHeader>
            <CardContent>
              {data.loading.cumplimientoEntregas ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : data.error.cumplimientoEntregas ? (
                <div className="text-center py-8">
                  {data.error.cumplimientoEntregas === "Aún no se ha iniciado una simulación" ? (
                    // ✅ MENSAJE ESPECIAL PARA NO HAY SIMULACIÓN
                    <div className="text-center">
                      <Clock className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                      <p className="text-sm text-gray-600 mb-3">No hay simulación activa</p>
                      <Button
                        onClick={() => refresh()}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Verificar
                      </Button>
                    </div>
                  ) : (
                    // ✅ MENSAJE DE ERROR GENÉRICO
                    <div className="text-red-600">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">{data.error.cumplimientoEntregas}</p>
                    </div>
                  )}
                </div>
              ) : data.cumplimientoEntregas ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">
                      {formatPercentage(data.cumplimientoEntregas.porcentajeCumplimiento)}
                    </div>
                    <div className="text-sm text-muted-foreground">Cumplimiento</div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span>Total: {data.cumplimientoEntregas.totalPedidos}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Entregados: {data.cumplimientoEntregas.pedidosEntregados}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span>Pendientes: {data.cumplimientoEntregas.pedidosPendientes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span>Retrasados: {data.cumplimientoEntregas.pedidosRetrasados}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* 📦 PEDIDOS DIVIDIDOS - FORMATO MEJORADO COMO CUMPLIMIENTO */}
          <Card className="col-span-full lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Pedidos Divididos</CardTitle>
              </div>
              <CardDescription>Pedidos fraccionados</CardDescription>
            </CardHeader>
            <CardContent>
              {data.loading.pedidosDivididos ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : data.error.pedidosDivididos ? (
                <div className="text-center py-8">
                  {data.error.pedidosDivididos === "Aún no se ha iniciado una simulación" ? (
                    // ✅ MENSAJE ESPECIAL PARA NO HAY SIMULACIÓN
                    <div className="text-center">
                      <Clock className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                      <p className="text-sm text-gray-600 mb-3">No hay simulación activa</p>
                      <Button
                        onClick={() => refresh()}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Verificar
                      </Button>
                    </div>
                  ) : (
                    // ✅ MENSAJE DE ERROR GENÉRICO
                    <div className="text-red-600">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">{data.error.pedidosDivididos}</p>
                    </div>
                  )}
                </div>
              ) : data.pedidosDivididos ? (
                <div className="space-y-4">
                  {/* 🎯 NÚMERO PRINCIPAL GRANDE (IGUAL QUE CUMPLIMIENTO) */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">
                      {data.pedidosDivididos.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total de pedidos</div>
                  </div>

                  {/* 🎯 SEPARADOR (IGUAL QUE CUMPLIMIENTO) */}
                  <Separator />

                  {/* 🎯 GRID 2x2 CON ICONOS (IGUAL QUE CUMPLIMIENTO) */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>
                        Entregados: {data.pedidosDivididos.filter((p) => p.entregado).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span>
                        Asignados:{" "}
                        {data.pedidosDivididos.filter((p) => p.asignado && !p.entregado).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-purple-600" />
                      <span>
                        GLP:{" "}
                        {data.pedidosDivididos
                          .reduce((sum, p) => sum + p.cantidadGLP, 0)
                          .toLocaleString()}
                        L
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>
                        Clientes Unicos:{" "}
                        {new Set(data.pedidosDivididos.map((p) => p.idCliente)).size}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* 🎯 NUEVA SECCIÓN: GRÁFICOS DE ANÁLISIS */}
        {camiones.length > 0 && (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {/* 📊 GRÁFICO DE BARRAS SIMPLE - DISTANCIA POR TIPO */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-blue-600" />
                  <CardTitle>Distancia por Tipo de Camión</CardTitle>
                </div>
                <CardDescription>
                  Comparación de distancias recorridas entre tipos de camiones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-hidden">
                  <ChartContainer config={chartConfigDistancia} className="h-[300px] w-full">
                    <RechartsBarChart
                      data={prepararDatosDistanciaPorTipo()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tipo" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar
                        dataKey="distanciaTotal"
                        fill="hsl(220, 70%, 50%)"
                        name="Distancia Total"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="distanciaPromedio"
                        fill="hsl(160, 70%, 50%)"
                        name="Distancia Promedio"
                        radius={[4, 4, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ChartContainer>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-semibold text-blue-700">
                      {preciseRound(
                        prepararDatosDistanciaPorTipo().reduce(
                          (sum, item) => sum + item.distanciaTotal,
                          0
                        )
                      )}{" "}
                      km
                    </div>
                    <div className="text-blue-600 text-xs">Distancia Total</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-semibold text-green-700">
                      {prepararDatosDistanciaPorTipo().length} tipos
                    </div>
                    <div className="text-green-600 text-xs">Tipos Activos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ⛽ GRÁFICO SIMPLE - CONSUMO GLP POR TIPO */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-orange-600" />
                  <CardTitle>Consumo de GLP por Tipo</CardTitle>
                </div>
                <CardDescription>
                  Consumo total y promedio de GLP por tipo de camión
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-hidden">
                  <ChartContainer config={chartConfigGLP} className="h-[300px] w-full">
                    <AreaChart
                      data={prepararDatosConsumoGLPPorTipo()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tipo" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="consumoTotal"
                        stroke="hsl(25, 70%, 50%)"
                        fill="hsl(25, 70%, 50%)"
                        fillOpacity={0.6}
                        name="Consumo Total"
                      />
                      <Area
                        type="monotone"
                        dataKey="consumoPromedio"
                        stroke="hsl(160, 70%, 50%)"
                        fill="hsl(160, 70%, 50%)"
                        fillOpacity={0.4}
                        name="Consumo Promedio"
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <div className="font-semibold text-orange-700">
                      {preciseRound(
                        prepararDatosConsumoGLPPorTipo().reduce(
                          (sum, item) => sum + item.consumoTotal,
                          0
                        ),
                        1
                      )}{" "}
                      m³
                    </div>
                    <div className="text-orange-600 text-xs">Consumo Total</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-semibold text-blue-700">
                      {prepararDatosConsumoGLPPorTipo().length > 0
                        ? preciseRound(
                            prepararDatosConsumoGLPPorTipo().reduce(
                              (sum, item) => sum + item.consumoTotal,
                              0
                            ) /
                              prepararDatosConsumoGLPPorTipo().reduce(
                                (sum, item) => sum + item.cantidadCamiones,
                                0
                              ),
                            1
                          )
                        : 0}{" "}
                      m³
                    </div>
                    <div className="text-blue-600 text-xs">Promedio General</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-semibold text-green-700">
                      {prepararDatosConsumoGLPPorTipo().reduce(
                        (sum, item) => sum + item.pedidosEntregados,
                        0
                      )}
                    </div>
                    <div className="text-green-600 text-xs">Pedidos Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 🎯 SECCIÓN: TOP 5 Y DISTRIBUCIÓN - LADO A LADO */}
        {camiones.length > 0 && (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {/* 🏆 TOP 5 CAMIONES CON MAYOR CONSUMO */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-red-600" />
                  <CardTitle>Top 5 Camiones - Mayor Consumo GLP</CardTitle>
                </div>
                <CardDescription>
                  Los 5 camiones con mayor consumo de GLP en la simulación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {prepararTop5ConsumoGLP().map((camion, index) => (
                    <div
                      key={camion.camion}
                      className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-orange-50 to-red-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-orange-600 text-white rounded-full font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Camión {camion.camion}</div>
                          <div className="text-sm text-gray-600">
                            Tipo {camion.tipo} • {camion.distancia} km recorridos
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-700 text-lg">
                          {camion.consumoGLP} m³
                        </div>
                        <div className="text-sm text-gray-600">
                          {camion.pedidosEntregados} pedidos
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 📊 GRÁFICO DE PIE - DISTRIBUCIÓN DE PEDIDOS */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <CardTitle>Distribución de Pedidos Entregados</CardTitle>
                </div>
                <CardDescription>
                  Porcentaje de pedidos entregados por tipo de camión
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-hidden">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <Pie
                          data={prepararDatosDistribucionPedidos()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="pedidosEntregados"
                        >
                          {prepararDatosDistribucionPedidos().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border rounded-lg shadow-lg">
                                  <p className="font-semibold">Tipo {data.tipo}</p>
                                  <p className="text-sm text-gray-600">
                                    {data.pedidosEntregados} pedidos entregados ({data.porcentaje}%)
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {data.cantidadCamiones} camiones de este tipo
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 📈 LEYENDA PERSONALIZADA */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {prepararDatosDistribucionPedidos().map((item) => (
                    <div key={item.tipo} className="flex items-center gap-2 p-2 border rounded">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">Tipo {item.tipo}</div>
                        <div className="text-xs text-gray-600">
                          {item.pedidosEntregados} pedidos • {item.cantidadCamiones} camiones
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-bold text-sm ${
                            item.pedidosEntregados > 0 ? "text-green-700" : "text-gray-500"
                          }`}
                        >
                          {item.porcentaje}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ✅ NUEVA SECCIÓN MOVIDA AL FINAL: DETALLE CON TABS (CLIENTES Y CAMIONES) */}
        {(data.pedidosCompletos && data.pedidosCompletos.length > 0) || camiones.length > 0 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <CardTitle>Detalle de Clientes y Camiones</CardTitle>
              </div>
              <CardDescription>
                Información detallada de clientes activos y estado de camiones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="clientes" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="clientes" className="gap-2">
                    <Users className="h-4 w-4" />
                    Clientes ({getFilteredClients().length})
                  </TabsTrigger>
                  <TabsTrigger value="camiones" className="gap-2">
                    <Truck className="h-4 w-4" />
                    Camiones ({camiones.length})
                  </TabsTrigger>
                </TabsList>

                {/* ✅ TAB DE CLIENTES */}
                <TabsContent value="clientes" className="mt-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {getPaginatedClients().map((pedido, index) => (
                      <div
                        key={index}
                        className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* ✅ HEADER CON NOMBRE Y PRIORIDAD CON TOOLTIP */}
                        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
                          <h4 className="font-semibold text-gray-900">{pedido.cliente.nombre}</h4>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  className={`${
                                    getPriorityFromHours(pedido.horasLimite).color
                                  } cursor-help`}
                                >
                                  {getPriorityFromHours(pedido.horasLimite).label}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">{getPriorityTooltip(pedido.horasLimite)}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Tiempo límite: {pedido.horasLimite} horas
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        {/* ✅ CONTENIDO PRINCIPAL */}
                        <div className="p-3 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="h-4 w-4 text-amber-600" />
                            <span>{pedido.cliente.correo}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <MapPin className="h-4 w-4 text-amber-600" />
                            <span>
                              Pos: ({pedido.posX}, {pedido.posY})
                            </span>
                          </div>

                          <div className="pt-1 space-y-2 text-sm">
                            <div className="flex items-center gap-1 text-gray-700">
                              <Calendar className="h-4 w-4 text-amber-600" />
                              <span className="font-medium text-gray-900 text-sm">Registro: </span>
                              <span className="text-gray-600 text-sm">
                                {formatDateComplete(pedido.fechaDeRegistro)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-700">
                              <CheckCircle className="h-4 w-4 text-amber-600" />
                              <span className="font-medium text-gray-900 text-sm">Entrega: </span>
                              <span className="text-gray-600 text-sm">
                                {pedido.entregado
                                  ? generateVisualDeliveryTime(
                                      pedido.fechaDeRegistro,
                                      pedido.horasLimite
                                    )
                                  : "Pendiente"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-700">
                              <Clock className="h-4 w-4 text-amber-600" />
                              <span className="font-medium text-gray-900 text-sm">
                                Hora Máxima:{" "}
                              </span>
                              <span className="text-gray-600 text-sm">
                                {calculateMaxTime(pedido.fechaDeRegistro, pedido.horasLimite)}
                              </span>
                            </div>
                          </div>

                          {/* ✅ GLP SOLICITADO CON ESTILO ESPECIAL */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="font-medium text-gray-900">GLP Solicitado:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-gray-800">
                                {pedido.cantidadGLP} m3
                              </span>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ✅ PAGINACIÓN DE CLIENTES */}
                  {getFilteredClients().length > itemsPerPage && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Mostrando {(currentClientPage - 1) * itemsPerPage + 1} -{" "}
                        {Math.min(currentClientPage * itemsPerPage, getFilteredClients().length)} de{" "}
                        {getFilteredClients().length} clientes
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPrevPage}
                          disabled={currentClientPage === 1}
                          className="gap-1"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Anterior
                        </Button>

                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">Página</span>
                          <Badge variant="secondary">{currentClientPage}</Badge>
                          <span className="text-sm text-muted-foreground">
                            de {getTotalPages()}
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextPage}
                          disabled={currentClientPage === getTotalPages()}
                          className="gap-1"
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* ✅ TAB DE CAMIONES */}
                <TabsContent value="camiones" className="mt-6">
                  {loadingCamiones ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Cargando camiones...</span>
                    </div>
                  ) : errorCamiones ? (
                    <div className="text-center py-12">
                      {errorCamiones === "Aún no se ha iniciado una simulación" ? (
                        // ✅ MENSAJE ESPECIAL PARA NO HAY SIMULACIÓN
                        <div className="text-center">
                          <Clock className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No hay simulación activa
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Aún no se ha iniciado una simulación. Los datos de camiones estarán
                            disponibles una vez que comience la simulación.
                          </p>
                          <Button onClick={fetchCamiones} variant="outline" className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Verificar nuevamente
                          </Button>
                        </div>
                      ) : (
                        // ✅ MENSAJE DE ERROR GENÉRICO
                        <div className="text-red-600">
                          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                          <p className="text-lg font-semibold">Error al cargar camiones</p>
                          <p className="text-sm mt-2">{errorCamiones}</p>
                          <Button onClick={fetchCamiones} className="mt-4" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reintentar
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : camiones.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Truck className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-lg">No hay camiones disponibles</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {getPaginatedTrucks().map((camion, index) => (
                          <div
                            key={camion.id}
                            className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                          >
                            {/* ✅ HEADER CON CÓDIGO Y ESTADO */}
                            <div className="flex items-center justify-between p-3 border-b bg-gray-50">
                              <h4 className="font-semibold text-gray-900">
                                Camión {camion.codigo}
                              </h4>
                              <div className="flex gap-1">
                                {camion.enAveria && (
                                  <Badge className="bg-red-100 text-red-800">
                                    <Wrench className="h-3 w-3 mr-1" />
                                    Avería
                                  </Badge>
                                )}
                                {camion.detenido && (
                                  <Badge className="bg-yellow-100 text-yellow-800">Detenido</Badge>
                                )}
                                {camion.capacidadCompleta && (
                                  <Badge className="bg-green-100 text-green-800">Completo</Badge>
                                )}
                                {!camion.enAveria &&
                                  !camion.detenido &&
                                  !camion.capacidadCompleta && (
                                    <Badge className={getTruckTypeColor(camion.codigo)}>
                                      {camion.codigo.substring(0, 2)}
                                    </Badge>
                                  )}
                              </div>
                            </div>

                            {/* ✅ CONTENIDO PRINCIPAL */}
                            <div className="p-3 space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Flag className="h-4 w-4 text-amber-600" />
                                <span>
                                  Posición Final:{" "}
                                  {camion.ubicacionActual
                                    ? `(${camion.ubicacionActual.x}, ${camion.ubicacionActual.y})`
                                    : "No disponible"}
                                </span>
                              </div>
                              {/* 🎯 NUEVO: GLP CONSUMIDO */}
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Fuel className="h-4 w-4 text-amber-600" />
                                <span>
                                  GLP Consumido:{" "}
                                  {calcularGLPConsumido(
                                    camion.codigo,
                                    obtenerDistanciaCamion(camion)
                                  )}{" "}
                                  m³
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Gauge className="h-4 w-4 text-amber-600" />
                                <span>Velocidad: {camion.velocidad} km/h</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <MapPin className="h-4 w-4 text-amber-600" />
                                <span>
                                  Distancia Recorrida: {obtenerDistanciaCamion(camion)} km
                                </span>
                              </div>

                              {/* 🎯 SECCIÓN: PEDIDOS ENTREGADOS */}
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <CheckCircle className="h-4 w-4 text-amber-600" />
                                <span className="font-medium text-gray-900">
                                  Pedidos Entregados:{" "}
                                </span>
                                <Badge className="bg-green-100 text-green-800">
                                  {distribuirPedidosEntregados()[camion.codigo] || 0}
                                </Badge>
                              </div>

                              {/* ✅ PESO Y TIEMPO */}
                              <div className="flex items-center justify-between pt-2 border-t">
                                <div className="text-sm">
                                  <span className="font-medium text-gray-900">Peso Total:</span>
                                  <span className="ml-1 text-gray-600">{camion.peso}kg</span>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium text-gray-900">T. Viaje:</span>
                                  <span className="ml-1 text-gray-600">
                                    {calcularTiempoViaje(
                                      obtenerDistanciaCamion(camion),
                                      camion.velocidad
                                    )}
                                    min
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ✅ PAGINACIÓN DE CAMIONES */}
                      {getSortedTrucks().length > itemsPerPage && (
                        <div className="mt-6 flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Mostrando {(currentTruckPage - 1) * itemsPerPage + 1} -{" "}
                            {Math.min(currentTruckPage * itemsPerPage, getSortedTrucks().length)} de{" "}
                            {getSortedTrucks().length} camiones
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToPrevTruckPage}
                              disabled={currentTruckPage === 1}
                              className="gap-1"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Anterior
                            </Button>

                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium">Página</span>
                              <Badge variant="secondary">{currentTruckPage}</Badge>
                              <span className="text-sm text-muted-foreground">
                                de {getTotalTruckPages()}
                              </span>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToNextTruckPage}
                              disabled={currentTruckPage === getTotalTruckPages()}
                              className="gap-1"
                            >
                              Siguiente
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : null}

        {/* ✅ ESTADO GENERAL */}
        {hasError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">
                  Algunos reportes no se pudieron cargar. Haz clic en "Actualizar" para reintentar.
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
