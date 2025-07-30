"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  FaBox,
  FaRoute,
  FaTruck,
  FaInfoCircle,
  FaHome,
  FaWarehouse,
  FaGasPump,
  FaSync,
  FaStop,
} from "react-icons/fa";
import { RiTruckLine, RiNodeTree } from "react-icons/ri";
import { IoIosConstruct } from "react-icons/io";
import { MdGroups } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import { BiSearch } from "react-icons/bi";
import { motion } from "framer-motion";

// Grid constants
const GRID_WIDTH = 70;
const GRID_HEIGHT = 50;
const MIN_SCALE = 8;
const MAX_SCALE = 20;

const Monitoreo = () => {
  // Basic state
  const [open, setOpen] = useState(true);
  const [estadoSistema, setEstadoSistema] = useState({});
  const [camiones, setCamiones] = useState([]);
  const [pedidosActivos, setPedidosActivos] = useState([]);
  const [rutasActivas, setRutasActivas] = useState({});
  const [entregasRecientes, setEntregasRecientes] = useState([]);
  const [hoveredCamion, setHoveredCamion] = useState(null);
  const [hoveredPedido, setHoveredPedido] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [conexionWebSocket, setConexionWebSocket] = useState(false);

  // Estados para almacenes interactivos
  const [almacenes, setAlmacenes] = useState([
    {
      id: 'tanque-central-001',
      nombre: 'Tanque Central',
      tipo: 'tanque',
      ubicacion: {
        coordenadaX: 12,
        coordenadaY: 41 // con ajuste de grilla
      },
      stock: {
        capacidadTotal: 5000,
        stockActual: 3500,
        porcentaje: 70,
        estado: 'Normal'
      },
      camionesAsignados: [],
      pedidosAsignados: []
    }
  ]);
  const [selectedAlmacen, setSelectedAlmacen] = useState(null);
  const [showAlmacenDetails, setShowAlmacenDetails] = useState(false);

  // Estados para creación de almacenes
  const [modoCreacionAlmacen, setModoCreacionAlmacen] = useState(false);
  const [showModalCrearAlmacen, setShowModalCrearAlmacen] = useState(false);
  const [coordenadaSeleccionada, setCoordenadaSeleccionada] = useState(null);
  const [formularioAlmacen, setFormularioAlmacen] = useState({
    nombre: '',
    tipo: 'tanque',
    capacidadTotal: 1000,
    stockInicial: 500
  });

  // Estados para creación de pedidos
  const [modoCreacionPedido, setModoCreacionPedido] = useState(false);
  const [showModalCrearPedido, setShowModalCrearPedido] = useState(false);
  const [coordenadaPedido, setCoordenadaPedido] = useState(null);
  const [formularioPedido, setFormularioPedido] = useState({
    hora: new Date().getHours(),
    minuto: new Date().getMinutes(),
    horasLimite: 2,
    cantidadProducto: 200,
    cantidadGLP: 150
  });

  // Grid ref and sizing
  const gridRef = useRef(null);
  const [gridSize, setGridSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(12);

  const [bloqueos, setBloqueos] = useState([]);
  const [bloqueosVisibles, setBloqueosVisibles] = useState([]);

  const [filtrosRutas, setFiltrosRutas] = useState({
    TA: true,
    TB: true,
    TC: true,
    TD: true,
    otros: true,
  });

  const [showFiltrosRutas, setShowFiltrosRutas] = useState(false);

  // Add these states for manual breakdown insertion
  const [showAveriaModal, setShowAveriaModal] = useState(false);
  const [camionesDisponibles, setCamionesDisponibles] = useState([]);
  const [averiaForm, setAveriaForm] = useState({
    idCamion: "",
    tipo: "",
  });

  // WebSocket connection
  const stompClientRef = useRef(null);

  // Grid sizing effect
  useEffect(() => {
    const updateSize = () => {
      if (gridRef.current) {
        const { clientWidth, clientHeight } = gridRef.current;
        setGridSize({ width: clientWidth, height: clientHeight });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Calculate optimal scale
  useEffect(() => {
    if (!gridRef.current) return;

    const { width: containerWidth, height: containerHeight } = gridSize;
    const margin = 4;

    const scaleX = (containerWidth - margin * 2) / GRID_WIDTH;
    const scaleY = (containerHeight - margin * 2) / GRID_HEIGHT;

    const optimalScale = Math.min(scaleX, scaleY);
    const clampedScale = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, Math.floor(optimalScale))
    );

    setScale(clampedScale);
  }, [gridSize]);

  // Message auto-hide effect
  useEffect(() => {
    if (mensaje) {
      const timeout = setTimeout(() => {
        setMensaje("");
        setTipoMensaje("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [mensaje]);

  // Initialize WebSocket connection and load initial data
  useEffect(() => {
    inicializarConexion();
    cargarDatosIniciales();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect();
      }
    };
  }, []);

  // useEffect(() => {
  //   // Clean up old delivery animations every 5 seconds
  //   const cleanup = setInterval(() => {
  //     const now = Date.now();
  //     setEntregasRecientes(prev =>
  //       prev.filter(entrega => now - entrega.timestamp < 5000)
  //     );
  //   }, 5000);

  //   return () => clearInterval(cleanup);
  // }, []);

  // ALTERNATIVE: Replace inicializarConexion with this simpler approach
  const inicializarConexion = () => {
    try {
      console.log("🔄 Iniciando actualizaciones en tiempo real...");
      setConexionWebSocket(true);

      // Use polling for now - more reliable than WebSocket
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(
            "http://localhost:808/api/pedidos/actuales"
          );
          if (response.ok) {
            const data = await response.json();
            actualizarDatosEnTiempoReal(data);
          }
        } catch (error) {
          console.error("❌ Error obteniendo datos:", error);
          setConexionWebSocket(false);
        }
      }, 2000); // Poll every 2 seconds

      // Store interval for cleanup
      // stompClientRef.current = {
      //   disconnect: () => {
      //     clearInterval(pollInterval);
      //     console.log('🛑 Polling detenido');
      //   }
      // };
    } catch (error) {
      console.error("❌ Error inicializando polling:", error);
      setConexionWebSocket(false);
    }
  };

  const pollInterval = setInterval(async() => {
    try{
        const response = await fetch(
            "http://localhost:8080/api/pedidos/actuales"
        );
        if(response.ok){
            const data = await response.json();
            actualizarDatosPedidos(data);
        }
    }catch(error){
        console.error("❌ Error fetching pedidos:", error);
    }
  },2000);

  const actualizarDatosPedidos=(data) => {
    if(!data || !Array.isArray(data.pedidos)){
        setPedidosActivos([]);
        return;
    }

    const pedidosAdaptados = data.pedidos.map((p)=>({
        idPedido: p.id,
        x: p.posX,
        y: p.posY,
        hora: p.hora,
        minuto: p.minuto,
        cliente: p.cliente || "c-101",
        volumenM3: p.cantidadGLP ,
        completado: p.entregado || p.entregadoCompleto,
        urgente: p.prioridad > 0,
        ...p
    }));

    setPedidosActivos(pedidosAdaptados);
    console.log("📦 Pedidos actualizados:", pedidosAdaptados.length);
  }

  // Load blockages for daily operations
  // const cargarBloqueosOperacionesDiarias = async () => {
  //   try {
  //     const data = await obtenerBloqueos();
  //     console.log('📍 Blockages loaded for daily operations:', data.length);
  //     setBloqueos(data);
  //   } catch (error) {
  //     console.error("Error loading blockages for daily operations:", error);
  //   }
  // };

  // Real-time blockage filtering (different from simulation)
  // const filtrarBloqueosActivos = (bloqueosList) => {
  //   if (!bloqueosList || bloqueosList.length === 0) {
  //     return [];
  //   }

  //   const now = new Date();
  //   console.log('🕐 Filtering blockages for real time:', now.toLocaleString());

  //   const activos = bloqueosList.filter((bloqueo) => {
  //     try {
  //       // Parse blockage start and end times
  //       // Assuming blockages use absolute dates, not simulation-relative
  //       const startDate = new Date();
  //       startDate.setDate(bloqueo.dd_inicio);
  //       startDate.setMonth(bloqueo.mm_inicio - 1); // months are 0-indexed
  //       startDate.setFullYear(bloqueo.aa_inicio || now.getFullYear()); // use current year if not specified
  //       startDate.setHours(bloqueo.hh_inicio, bloqueo.mm_inicio, 0, 0);

  //       const endDate = new Date();
  //       endDate.setDate(bloqueo.dd_fin);
  //       endDate.setMonth(bloqueo.mm_fin - 1);
  //       endDate.setFullYear(bloqueo.aa_fin || now.getFullYear());
  //       endDate.setHours(bloqueo.hh_fin, bloqueo.mm_fin, 0, 0);

  //       const isActive = now >= startDate && now <= endDate;

  //       if (isActive) {
  //         console.log(`🚫 ACTIVE blockage: ${bloqueo.dd_inicio}d ${bloqueo.hh_inicio}:${String(bloqueo.mm_inicio).padStart(2, '0')} - ${bloqueo.dd_fin}d ${bloqueo.hh_fin}:${String(bloqueo.mm_fin).padStart(2, '0')}`);
  //       }

  //       return isActive;
  //     } catch (error) {
  //       console.error("❌ Error filtering blockage:", error, bloqueo);
  //       return false;
  //     }
  //   });

  //   console.log(`🚫 Real-time blockage filtering: ${activos.length}/${bloqueosList.length} active`);
  //   return activos;
  // };

  const cargarDatosIniciales = async () => {
    try {
      // Load complete state from dedicated API
      const response = await fetch(
        "http://localhost:8081/api/operaciones-diarias/estado-completo"
      );

      if (response.ok) {
        const data = await response.json();
        actualizarDatosEnTiempoReal(data);

        // Load almacenes if not included in complete state
        if (!data.almacenes) {
          await cargarAlmacenes();
        }
      } else {
        console.error("Error cargando datos iniciales:", response.status);
        setTipoMensaje("error");
        setMensaje("Error cargando datos del sistema");
      }
    } catch (error) {
      console.error("Error cargando datos iniciales:", error);
      setTipoMensaje("error");
      setMensaje("Error de conexión con el servidor");
    }
  };

  // Load blockages on component mount
  // useEffect(() => {
  //   cargarBloqueosOperacionesDiarias();
  // }, []);

  // Filter blockages based on real time (updates every minute)
  // useEffect(() => {
  //   if (bloqueos.length > 0) {
  //     setBloqueosVisibles(filtrarBloqueosActivos(bloqueos));
  //   }

  //   // Set up interval to check blockages every minute
  //   const interval = setInterval(() => {
  //     if (bloqueos.length > 0) {
  //       setBloqueosVisibles(filtrarBloqueosActivos(bloqueos));
  //     }
  //   }, 60000); // Check every minute

  //   return () => clearInterval(interval);
  // }, [bloqueos]);

  // const createBlockagePath = (coordenadas) => {
  //   if (!coordenadas || coordenadas.length === 0) {
  //     console.warn("No coordinates provided for blockage");
  //     return '';
  //   }

  //   let parsedCoords = [];

  //   if (Array.isArray(coordenadas)) {
  //     if (typeof coordenadas[0] === 'string') {
  //       // Parse PostgreSQL point format: "(x,y)"
  //       coordenadas.forEach(coord => {
  //         const match = coord.match(/\((\d+),(\d+)\)/);
  //         if (match) {
  //           parsedCoords.push({
  //             x: parseInt(match[1]),
  //             y: parseInt(match[2])
  //           });
  //         }
  //       });
  //     } else if (typeof coordenadas[0] === 'object' && coordenadas[0].coordenada_x !== undefined) {
  //       parsedCoords = coordenadas.map(coord => ({
  //         x: coord.coordenada_x,
  //         y: coord.coordenada_y
  //       }));
  //     } else if (typeof coordenadas[0] === 'object' && coordenadas[0].x !== undefined) {
  //       parsedCoords = coordenadas.map(coord => ({
  //         x: coord.x,
  //         y: coord.y
  //       }));
  //     }
  //   }

  //   if (parsedCoords.length === 0) {
  //     console.warn("No valid coordinates parsed");
  //     return '';
  //   }

  //   let pathData = '';

  //   for (let i = 0; i < parsedCoords.length; i++) {
  //     const coord = parsedCoords[i];
  //     const x = coord.x * scale;
  //     const y = coord.y * scale;

  //     if (i === 0) {
  //       pathData += `M ${x} ${y}`;
  //     } else {
  //       const prevCoord = parsedCoords[i - 1];
  //       const prevX = prevCoord.x * scale;
  //       const prevY = prevCoord.y * scale;

  //       // Create grid-aligned path
  //       if (x !== prevX) {
  //         pathData += ` L ${x} ${prevY}`;
  //       }
  //       if (y !== prevY) {
  //         pathData += ` L ${x} ${y}`;
  //       }
  //     }
  //   }

  //   return pathData;
  // };

  const cargarAlmacenes = async () => {
    try {
      const response = await fetch(
        "http://localhost:8081/api/operaciones-diarias/almacenes"
      );
      if (response.ok) {
        const almacenesData = await response.json();
        
        // Verificar si ya existe el tanque central en los datos del backend
        const tanqueCentral = almacenesData.find((a: any) => 
          a.ubicacion?.coordenadaX === 12 && 
          a.ubicacion?.coordenadaY === 8 && 
          a.tipo === 'tanque'
        );
        
        if (!tanqueCentral) {
          // Si no existe en el backend, mantener el tanque por defecto y agregar los del backend
          const tanquePorDefecto = {
            id: 'tanque-central-001',
            nombre: 'Tanque Central',
            tipo: 'tanque',
            ubicacion: {
              coordenadaX: 12,
              coordenadaY: 8
            },
            stock: {
              capacidadTotal: 5000,
              stockActual: 3500,
              porcentaje: 70,
              estado: 'Normal'
            },
            camionesAsignados: [],
            pedidosAsignados: []
          };
          
          setAlmacenes([tanquePorDefecto, ...almacenesData]);
        } else {
          // Si existe en el backend, usar los datos del backend
          setAlmacenes(almacenesData);
        }
        
        console.log("📦 Almacenes cargados:", almacenesData.length + (tanqueCentral ? 0 : 1));
      }
    } catch (error) {
      console.error("Error cargando almacenes:", error);
      // En caso de error, mantener solo el tanque por defecto
      setAlmacenes([{
        id: 'tanque-central-001',
        nombre: 'Tanque Central',
        tipo: 'tanque',
        ubicacion: {
          coordenadaX: 12,
          coordenadaY: 8
        },
        stock: {
          capacidadTotal: 5000,
          stockActual: 3500,
          porcentaje: 70,
          estado: 'Normal'
        },
        camionesAsignados: [],
        pedidosAsignados: []
      }]);
    }
  };

  const actualizarDatosEnTiempoReal = (data) => {
    try {
      console.log("📊 RAW WebSocket data received:", data); // NEW: Log the raw data

      console.log("📊 Datos WebSocket recibidos:", {
        camiones: data.camiones?.length || 0,
        pedidos: data.pedidos?.length || 0,
        rutas: Object.keys(data.rutas || {}).length,
        entregas: data.entregas?.length || 0,
        bloqueos: data.bloqueos?.length || 0, // This should show the actual count
        timestamp: new Date().toLocaleTimeString(),
      });

      // DEBUG: Check what assignment data we have
      if (data.camiones) {
        console.log("🚛 Sample truck data:", data.camiones[0]);
        data.camiones.forEach((camion) => {
          if (camion.pedidoAsignado) {
            console.log(
              `🎯 Truck ${camion.tipo} assigned to order ${camion.pedidoAsignado}`
            );
          }
        });
      }

      if (data.pedidos) {
        console.log("📦 Sample order data:", data.pedidos[0]);
        data.pedidos.forEach((pedido) => {
          if (pedido.camionesAsignados || pedido.idCamion) {
            console.log(`📦 Order ${pedido.idPedido} has assignment info:`, {
              camionesAsignados: pedido.camionesAsignados,
              idCamion: pedido.idCamion,
            });
          }
        });
      }

      if (data.estado) {
        setEstadoSistema(data.estado);
      }

      if (data.camiones) {
        setCamiones(data.camiones);
      }

      if (data.pedidos) {
        setPedidosActivos(data.pedidos);
      }

      if (data.rutas) {
        setRutasActivas(data.rutas);
      }

      // if (data.entregas && data.entregas.length > 0) {
      //   console.log('✅ Entregas para animación:', data.entregas.length);
      //   setEntregasRecientes([...data.entregas]);
      // }

      // ENHANCED: Handle blockages from backend with detailed logging
      if (data.bloqueos !== undefined) {
        console.log("🚫 Raw blockages data type:", typeof data.bloqueos);
        console.log("🚫 Raw blockages data:", data.bloqueos);
        console.log("🚫 Is array?", Array.isArray(data.bloqueos));

        if (Array.isArray(data.bloqueos)) {
          console.log(
            "🚫 Blockages received from backend:",
            data.bloqueos.length
          );
          if (data.bloqueos.length > 0) {
            console.log("🚫 First blockage structure:", data.bloqueos[0]);
          }
          setBloqueosVisibles(data.bloqueos); // Use directly from backend
        } else {
          console.warn("🚫 Blockages data is not an array:", data.bloqueos);
          setBloqueosVisibles([]); // Fallback to empty array
        }
      } else {
        console.log("🚫 No blockages field in WebSocket data");
      }

      if (data.almacenes) {
        // Verificar si el tanque central está en los datos del backend
        const tanqueCentral = data.almacenes.find((a: any) => 
          a.ubicacion?.coordenadaX === 12 && 
          a.ubicacion?.coordenadaY === 8 && 
          a.tipo === 'tanque'
        );
        
        if (!tanqueCentral) {
          // Si no está en el backend, mantener el tanque por defecto
          const tanquePorDefecto = {
            id: 'tanque-central-001',
            nombre: 'Tanque Central',
            tipo: 'tanque',
            ubicacion: {
              coordenadaX: 12,
              coordenadaY: 8
            },
            stock: {
              capacidadTotal: 5000,
              stockActual: 3500,
              porcentaje: 70,
              estado: 'Normal'
            },
            camionesAsignados: [],
            pedidosAsignados: []
          };
          
          setAlmacenes([tanquePorDefecto, ...data.almacenes]);
        } else {
          setAlmacenes(data.almacenes);
        }
        
        console.log("🏪 Almacenes actualizados:", data.almacenes.length + (tanqueCentral ? 0 : 1));
      }
    } catch (error) {
      console.error("Error actualizando datos en tiempo real:", error);
    }
  };

  const getTruckStatus = (estado) => {
    switch (estado) {
      case 0:
        return {
          label: "Mantenimiento",
          color: "bg-yellow-500",
          textColor: "text-yellow-700",
          icon: "🔧",
        };
      case 1:
        return {
          label: "Activo",
          color: "bg-green-500",
          textColor: "text-green-700",
          icon: "🚛",
        };
      case 2:
        return {
          label: "Recargando",
          color: "bg-blue-500",
          textColor: "text-blue-700",
          icon: "⛽",
        };
      case 3:
        return {
          label: "Averiado",
          color: "bg-red-500",
          textColor: "text-red-700",
          icon: "⚠️",
        };
      default:
        return {
          label: "Desconocido",
          color: "bg-gray-500",
          textColor: "text-gray-700",
          icon: "❓",
        };
    }
  };

  const getAlmacenColor = (porcentaje) => {
    if (porcentaje < 20) return "#dc2626"; // Rojo - Crítico
    if (porcentaje < 40) return "#f59e0b"; // Amarillo - Advertencia
    if (porcentaje < 80) return "#10b981"; // Verde - Normal
    return "#3b82f6"; // Azul - Lleno
  };

  const getAlmacenIcon = (tipo) => {
    return tipo === "central" ? FaWarehouse : FaGasPump;
  };

  const createGridAlignedPath = (coordenadas) => {
    if (!coordenadas || coordenadas.length < 2) return "";

    let pathData = `M ${coordenadas[0][0] * scale} ${
      coordenadas[0][1] * scale
    }`;

    for (let i = 1; i < coordenadas.length; i++) {
      const prev = coordenadas[i - 1];
      const current = coordenadas[i];

      if (prev[0] !== current[0]) {
        pathData += ` L ${current[0] * scale} ${prev[1] * scale}`;
      }
      if (prev[1] !== current[1]) {
        pathData += ` L ${current[0] * scale} ${current[1] * scale}`;
      }
    }

    return pathData;
  };

  const manejarBusqueda = (termino) => {
    if (!termino.trim()) {
      // Limpiar selecciones si la búsqueda está vacía
      setSelectedAlmacen(null);
      setShowAlmacenDetails(false);
      return;
    }

    const terminoLower = termino.toLowerCase();

    // Buscar en camiones (funcionalidad existente)
    const camionEncontrado = camiones.find((c) =>
      c.tipo.toLowerCase().includes(terminoLower)
    );

    // Buscar en almacenes
    const almacenEncontrado = almacenes.find(
      (a) =>
        a.nombre.toLowerCase().includes(terminoLower) ||
        a.tipo.toLowerCase().includes(terminoLower)
    );

    if (almacenEncontrado) {
      setSelectedAlmacen(almacenEncontrado);
      setShowAlmacenDetails(true);
      setTipoMensaje("exito");
      setMensaje(
        `Almacén ${almacenEncontrado.nombre} encontrado - Stock: ${Math.round(
          almacenEncontrado.stock?.porcentaje || 0
        )}%`
      );
    } else if (camionEncontrado) {
      // Mantener funcionalidad de búsqueda de camiones
      setTipoMensaje("exito");
      setMensaje(
        `Camión ${camionEncontrado.tipo} encontrado en (${camionEncontrado.x}, ${camionEncontrado.y})`
      );
    } else {
      setTipoMensaje("error");
      setMensaje("No se encontraron resultados para la búsqueda");
    }
  };

  // Load available trucks for breakdown selection
  const loadCamionesDisponibles = async () => {
    try {
      const response = await fetch(
        "http://localhost:8081/api/operaciones-diarias/admin/camiones-disponibles-averia"
      );
      if (response.ok) {
        const camiones = await response.json();
        setCamionesDisponibles(camiones);
      }
    } catch (error) {
      console.error("Error loading trucks:", error);
    }
  };

  // Handle manual breakdown insertion
  const handleInsertarAveria = async () => {
    if (!averiaForm.idCamion || !averiaForm.tipo) {
      setTipoMensaje("error");
      setMensaje("Por favor complete todos los campos.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8081/api/operaciones-diarias/admin/insertar-averia",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(averiaForm),
        }
      );

      const result = await response.json();

      if (result.success) {
        setTipoMensaje("exito");
        setMensaje(result.message);
        setShowAveriaModal(false);
        setAveriaForm({ idCamion: "", tipo: "" });

        // Force refresh of truck data
        cargarDatosIniciales();
      } else {
        setTipoMensaje("error");
        setMensaje(result.message);
      }
    } catch (error) {
      setTipoMensaje("error");
      setMensaje("Error al insertar avería: " + error.message);
    }
  };

  const forzarRecalculoRutas = async () => {
    try {
      const response = await fetch(
        "http://localhost:8081/api/operaciones-diarias/admin/recalcular-rutas",
        {
          method: "POST",
        }
      );
      const result = await response.json();

      if (result.success) {
        setTipoMensaje("exito");
        setMensaje("Rutas recalculadas exitosamente");
      } else {
        setTipoMensaje("error");
        setMensaje(result.message);
      }
    } catch (error) {
      setTipoMensaje("error");
      setMensaje("Error recalculando rutas: " + error.message);
    }
  };

  // Función para crear pedidos
  const handleCrearPedido = async () => {
    if (!coordenadaPedido) {
      setTipoMensaje("error");
      setMensaje("Seleccione una posición en el mapa");
      return;
    }

    try {
      const ahora = new Date();
      const payload = {
        dia: ahora.getDate(),
        hora: formularioPedido.hora,
        minuto: formularioPedido.minuto,
        anio: ahora.getFullYear(),
        mesPedido: ahora.getMonth() + 1, // Los meses en JS van de 0-11
        horasLimite: formularioPedido.horasLimite,
        posX: coordenadaPedido.x,
        posY: coordenadaPedido.y,
        cantidadProducto: formularioPedido.cantidadProducto,
        cantidadGLP: formularioPedido.cantidadGLP
      };

      console.log("📦 Creando pedido:", payload);

      const response = await fetch("http://localhost:8080/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        setTipoMensaje("exito");
        setMensaje(`Pedido creado exitosamente en posición (${coordenadaPedido.x}, ${coordenadaPedido.y})`);
        
        // Limpiar formulario y cerrar modal
        setShowModalCrearPedido(false);
        setCoordenadaPedido(null);
        setModoCreacionPedido(false);
        setFormularioPedido({
          hora: new Date().getHours(),
          minuto: new Date().getMinutes(),
          horasLimite: 2,
          cantidadProducto: 200,
          cantidadGLP: 150
        });
        
        // Recargar datos para mostrar el nuevo pedido
        setTimeout(() => {
          cargarDatosIniciales();
        }, 1000);
        
      } else {
        const errorData = await response.json();
        setTipoMensaje("error");
        setMensaje(errorData.message || "Error al crear pedido");
      }
      
    } catch (error) {
      console.error("Error creando pedido:", error);
      setTipoMensaje("error");
      setMensaje("Error de conexión al crear pedido");
    }
  };

  // Función para manejar clicks en el grid (tanto almacenes como pedidos)
  const handleGridClick = (event) => {
    if (!modoCreacionAlmacen && !modoCreacionPedido) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convertir coordenadas de pixel a grid
    const gridX = Math.floor(x / scale);
    const gridY = Math.floor(y / scale);
    
    // Validar que esté dentro de los límites
    if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
      
      if (modoCreacionPedido) {
        // Modo creación de pedido
        setCoordenadaPedido({ x: gridX, y: gridY });
        setShowModalCrearPedido(true);
      } else if (modoCreacionAlmacen) {
        // Modo creación de almacén (funcionalidad existente)
        // Verificar posición del tanque central
        if (gridX === 12 && gridY === 41) {
          setTipoMensaje("error");
          setMensaje("Esta posición está reservada para el Tanque Central del sistema");
          return;
        }
        
        // Verificar que no haya otro almacén en esa posición
        const almacenExistente = almacenes.find(a => 
          a.ubicacion.coordenadaX === gridX && a.ubicacion.coordenadaY === gridY
        );
        
        if (almacenExistente) {
          setTipoMensaje("error");
          setMensaje("Ya existe un almacén en esa posición");
          return;
        }
        
        setCoordenadaSeleccionada({ x: gridX, y: gridY });
        setShowModalCrearAlmacen(true);
      }
    }
  };

  return (
    <section className="flex gap-6 min-h-screen bg-[#F4F6F8]">
      {mensaje && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded shadow-lg text-white ${
            tipoMensaje === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {mensaje}
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-4 space-y-4 bg-gray-100 rounded-lg flex flex-col">
        <header className="flex justify-between items-center bg-white p-3 rounded-lg shadow">
          <h2 className="text-xl font-bold">
            Operaciones Diarias en Tiempo Real
          </h2>
          
          {/* Controles de almacenes */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setModoCreacionPedido(!modoCreacionPedido);
                setModoCreacionAlmacen(false);
                setCoordenadaPedido(null);
                setCoordenadaSeleccionada(null);
              }}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                modoCreacionPedido 
                  ? 'bg-orange-600 text-white hover:bg-orange-700' 
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {modoCreacionPedido ? '✓ Cancelar Pedido' : '📦 Crear Pedido'}
            </button>
            
            <button
              onClick={() => {
                setModoCreacionAlmacen(!modoCreacionAlmacen);
                setModoCreacionPedido(false);
                setCoordenadaSeleccionada(null);
                setCoordenadaPedido(null);
              }}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                modoCreacionAlmacen 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {modoCreacionAlmacen ? '✓ Cancelar Creación' : '+ Crear Almacén'}
            </button>
            
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
            >
              Leyenda
            </button>
          </div>
        </header>

        {/* Add this in your control panel section */}
        <div className="relative">
          {showFiltrosRutas && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
              <div className="p-2">
                <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded">
                  <label
                    htmlFor="filter-ta"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Camiones TA
                  </label>
                  <input
                    id="filter-ta"
                    type="checkbox"
                    checked={filtrosRutas.TA}
                    onChange={() =>
                      setFiltrosRutas({ ...filtrosRutas, TA: !filtrosRutas.TA })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded">
                  <label
                    htmlFor="filter-tb"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Camiones TB
                  </label>
                  <input
                    id="filter-tb"
                    type="checkbox"
                    checked={filtrosRutas.TB}
                    onChange={() =>
                      setFiltrosRutas({ ...filtrosRutas, TB: !filtrosRutas.TB })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded">
                  <label
                    htmlFor="filter-tc"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Camiones TC
                  </label>
                  <input
                    id="filter-tc"
                    type="checkbox"
                    checked={filtrosRutas.TC}
                    onChange={() =>
                      setFiltrosRutas({ ...filtrosRutas, TC: !filtrosRutas.TC })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded">
                  <label
                    htmlFor="filter-td"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Camiones TD
                  </label>
                  <input
                    id="filter-td"
                    type="checkbox"
                    checked={filtrosRutas.TD}
                    onChange={() =>
                      setFiltrosRutas({ ...filtrosRutas, TD: !filtrosRutas.TD })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded">
                  <label
                    htmlFor="filter-otros"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Sin rutas
                  </label>
                  <input
                    id="filter-otros"
                    type="checkbox"
                    checked={filtrosRutas.otros}
                    onChange={() =>
                      setFiltrosRutas({
                        ...filtrosRutas,
                        otros: !filtrosRutas.otros,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main grid */}
        <div className="flex gap-4 bg-white rounded shadow flex-grow">
          <div
            className="flex-1 p-3 relative"
            style={{ maxHeight: "calc(100vh - 280px)" }}
          >
            <div ref={gridRef} className="w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox={`${-scale} ${-scale} ${(GRID_WIDTH + 2) * scale} ${
                  (GRID_HEIGHT + 2) * scale
                }`}
                className="w-full h-full border border-gray-300 rounded bg-white"
                preserveAspectRatio="xMidYMid meet"
                onClick={handleGridClick}
                style={{ cursor: (modoCreacionAlmacen || modoCreacionPedido) ? 'crosshair' : 'default' }}
              >
                {/* Grid Lines */}
                {[...Array(GRID_HEIGHT + 1)].map((_, i) => (
                  <line
                    key={`h${i}`}
                    x1={0}
                    y1={i * scale}
                    x2={GRID_WIDTH * scale}
                    y2={i * scale}
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                  />
                ))}
                {[...Array(GRID_WIDTH + 1)].map((_, i) => (
                  <line
                    key={`v${i}`}
                    x1={i * scale}
                    y1={0}
                    x2={i * scale}
                    y2={GRID_HEIGHT * scale}
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                  />
                ))}
                {/* Mostrar coordenada seleccionada para almacén */}
                {modoCreacionAlmacen && coordenadaSeleccionada && (
                  <circle
                    cx={coordenadaSeleccionada.x * scale}
                    cy={coordenadaSeleccionada.y * scale}
                    r="8"
                    fill="rgba(34, 197, 94, 0.3)"
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  >
                    <animate
                      attributeName="r"
                      values="6;10;6"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Mostrar coordenada seleccionada para pedido */}
                {modoCreacionPedido && coordenadaPedido && (
                  <circle
                    cx={coordenadaPedido.x * scale}
                    cy={coordenadaPedido.y * scale}
                    r="8"
                    fill="rgba(249, 115, 22, 0.3)"
                    stroke="#f97316"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  >
                    <animate
                      attributeName="r"
                      values="6;10;6"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {bloqueosVisibles.map((bloqueo, idx) => {
                  console.log(`🎨 Rendering daily blockage ${idx}:`, bloqueo);

                  if (
                    !bloqueo.coordenadas ||
                    bloqueo.coordenadas.length === 0
                  ) {
                    console.warn(`⚠️ Daily blockage ${idx} has no coordinates`);
                    return null;
                  }

                  const pathData = createBlockagePath(bloqueo.coordenadas);
                  if (!pathData) {
                    console.warn(`⚠️ No path data for daily blockage ${idx}`);
                    return null;
                  }

                  return (
                    <g key={`daily-blockage-${idx}`}>
                      {/* Main blockage path */}
                      <path
                        d={pathData}
                        stroke="#DC2626"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        opacity="0.9"
                      />
                      {/* Highlight path */}
                      <path
                        d={pathData}
                        stroke="#FEE2E2"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        opacity="0.7"
                      />
                      {/* Coordinate markers */}
                      {bloqueo.coordenadas &&
                        bloqueo.coordenadas.map((coord, coordIdx) => {
                          let x, y;
                          if (typeof coord === "string") {
                            const match = coord.match(/\((\d+),(\d+)\)/);
                            if (match) {
                              x = parseInt(match[1]) * scale;
                              y = parseInt(match[2]) * scale;
                            }
                          } else if (coord.x !== undefined) {
                            x = coord.x * scale;
                            y = coord.y * scale;
                          } else if (coord.coordenada_x !== undefined) {
                            x = coord.coordenada_x * scale;
                            y = coord.coordenada_y * scale;
                          }

                          if (x !== undefined && y !== undefined) {
                            return (
                              <circle
                                key={`daily-blockage-point-${idx}-${coordIdx}`}
                                cx={x}
                                cy={y}
                                r="3"
                                fill="#DC2626"
                                opacity="0.8"
                              />
                            );
                          }
                          return null;
                        })}
                    </g>
                  );
                })}
                {/* Active Routes with Progress */}
                {/* NOTE: VERSION ESTABLE DE TRAZADO DE RUTAS*/}
                {/* Enhanced Progressive Truck Routes - EXCLUDE WAREHOUSE RETURNS */}
                {Object.entries(rutasActivas).map(([camionId, rutaInfo]) => {
                  if (
                    !rutaInfo.rutaCompleta ||
                    rutaInfo.rutaCompleta.length < 2
                  ) {
                    return null;
                  }

                  // Apply route filters
                  const tipoCamion = camionId.substring(0, 2);
                  if (
                    (tipoCamion === "TA" && !filtrosRutas.TA) ||
                    (tipoCamion === "TB" && !filtrosRutas.TB) ||
                    (tipoCamion === "TC" && !filtrosRutas.TC) ||
                    (tipoCamion === "TD" && !filtrosRutas.TD) ||
                    (!["TA", "TB", "TC", "TD"].includes(tipoCamion) &&
                      !filtrosRutas.otros)
                  ) {
                    return null;
                  }

                  // ENHANCED: Detect and separate delivery vs return routes
                  let displayRoute = [...rutaInfo.rutaCompleta];
                  const startPoint = displayRoute[0];
                  const endPoint = displayRoute[displayRoute.length - 1];

                  // FIXED: Better detection of return vs delivery routes
                  const isReturnRoute =
                    endPoint[0] === 12 &&
                    endPoint[1] === 8 &&
                    (startPoint[0] !== 12 || startPoint[1] !== 8) &&
                    displayRoute.length <= 15; // Short routes are likely returns

                  // Check if this is a delivery route that includes return (ends at warehouse but has other stops)
                  const includesWarehouseReturn =
                    endPoint[0] === 12 &&
                    endPoint[1] === 8 &&
                    displayRoute.length > 15;

                  // URGENT ROUTE DETECTION: If this route goes to an urgent order location, treat as delivery route
                  const hasUrgentDelivery =
                    rutaInfo.pedidoAsignado &&
                    pedidosActivos.some(
                      (p) => p.idPedido === rutaInfo.pedidoAsignado && p.urgente
                    );

                  // Override return route detection for urgent deliveries
                  const isActuallyReturnRoute =
                    isReturnRoute && !hasUrgentDelivery;

                  // VISUAL DIFFERENTIATION: Different styling for return vs delivery routes
                  let routeColor = camionId.startsWith("TA")
                    ? "#1565C0"
                    : camionId.startsWith("TB")
                    ? "#AD1457"
                    : camionId.startsWith("TC")
                    ? "#EF6C00"
                    : camionId.startsWith("TD")
                    ? "#607D8B"
                    : "#6b7280";

                  // Make return routes more subtle
                  if (isActuallyReturnRoute) {
                    routeColor = routeColor + "80"; // Add transparency
                  }

                  // Get only the remaining route (from current position onwards)
                  const progresoActual = rutaInfo.indiceActual || 0;
                  const remainingRoute = displayRoute.slice(progresoActual);

                  // If no remaining route, don't render anything
                  if (remainingRoute.length < 2) {
                    return null;
                  }

                  const pathData = createGridAlignedPath(remainingRoute);

                  return (
                    <g key={`ruta-${camionId}`}>
                      <path
                        d={pathData}
                        stroke={routeColor}
                        strokeWidth={isActuallyReturnRoute ? "2" : "4"} // Thinner lines for return routes
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        opacity={isActuallyReturnRoute ? "0.4" : "0.8"} // More transparent for return routes
                        strokeDasharray={isActuallyReturnRoute ? "4,4" : "8,4"} // Different dash pattern for return routes
                      />

                      {/* Only show waypoints for delivery routes, not return routes */}
                      {!isActuallyReturnRoute &&
                        remainingRoute.map((coord, idx) => (
                          <circle
                            key={`waypoint-${camionId}-${progresoActual + idx}`}
                            cx={coord[0] * scale}
                            cy={coord[1] * scale}
                            r="3"
                            fill={routeColor}
                            stroke="white"
                            strokeWidth="1"
                            opacity="0.9"
                          />
                        ))}
                    </g>
                  );
                })}

                {/* Active Orders */}
                {pedidosActivos
                  .filter((p) => !p.completado)
                  .map((pedido, idx) => (
                    <circle
                      key={`pedido-${pedido.idPedido}-${idx}`}
                      cx={pedido.x * scale}
                      cy={pedido.y * scale}
                      r={Math.max(4, scale * 0.3)}
                      fill="orange"
                      stroke="darkorange"
                      strokeWidth="2"
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoveredPedido(pedido)}
                      onMouseLeave={() => setHoveredPedido(null)}
                    />
                  ))}

                {/* Recent Delivery Animations */}
                {entregasRecientes.map((entrega, idx) => {
                  // Calculate animation progress
                  const tiempoTranscurrido = Date.now() - entrega.timestamp;
                  const shouldShow = tiempoTranscurrido < 4000; // Show for 4 seconds

                  if (!shouldShow) return null;

                  return (
                    <g
                      key={`entrega-${entrega.pedidoId}-${entrega.timestamp}-${idx}`}
                    >
                      <motion.circle
                        initial={{ r: 0, opacity: 1 }}
                        animate={{ r: 20, opacity: 0 }}
                        transition={{ duration: 3, ease: "easeOut" }}
                        cx={entrega.x * scale}
                        cy={entrega.y * scale}
                        fill="green"
                        stroke="darkgreen"
                        strokeWidth="3"
                      />
                      <motion.g
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 3, ease: "easeOut" }}
                      >
                        <foreignObject
                          x={entrega.x * scale - 15}
                          y={entrega.y * scale - 15}
                          width={30}
                          height={30}
                        >
                          <div className="flex items-center justify-center w-full h-full">
                            <span className="text-green-600 text-3xl font-bold">
                              ✓
                            </span>
                          </div>
                        </foreignObject>
                      </motion.g>
                    </g>
                  );
                })}

                {/* Almacenes Interactivos */}
                {almacenes.map((almacen) => {
                  const colorAlmacen = getAlmacenColor(
                    almacen.stock?.porcentaje || 0
                  );
                  const IconoAlmacen = getAlmacenIcon(almacen.tipo);
                  const isTanqueCentral = almacen.id === 'tanque-central-001';

                  return (
                    <motion.g
                      key={almacen.id}
                      animate={{
                        x: almacen.ubicacion.coordenadaX * scale,
                        y: almacen.ubicacion.coordenadaY * scale,
                      }}
                    >
                      <foreignObject x={-12} y={-12} width={24} height={24}>
                        <IconoAlmacen
                          size={24}
                          color={colorAlmacen}
                        />
                      </foreignObject>                
                    </motion.g>
                  );
                })}

                {/* Trucks - Real-time positions with breakdown status */}
                {camiones.map((camion) => {
                  const status = getTruckStatus(camion.estado);
                  const tipoCamion = camion.tipo.substring(0, 2);

                  // Check if truck has breakdown info from backend
                  const hasBreakdown = camion.averia === true;
                  const breakdownInfo = camion.tipoAveria
                    ? {
                        tipo: parseInt(camion.tipoAveria.replace("TI", "")),
                        descripcion:
                          camion.descripcionAveria || "Avería activa",
                        tiempoLiberacion: camion.tiempoLiberacion,
                      }
                    : null;

                  // Use truck-specific colors, but red for breakdowns
                  const truckColor = hasBreakdown
                    ? "#dc2626"
                    : tipoCamion === "TA"
                    ? "#1565C0"
                    : tipoCamion === "TB"
                    ? "#AD1457"
                    : tipoCamion === "TC"
                    ? "#EF6C00"
                    : tipoCamion === "TD"
                    ? "#607D8B"
                    : status.color === "bg-green-500"
                    ? "#10b981"
                    : status.color === "bg-red-500"
                    ? "#ef4444"
                    : status.color === "bg-blue-500"
                    ? "#3b82f6"
                    : status.color === "bg-yellow-500"
                    ? "#eab308"
                    : "#6b7280";

                  return (
                    <motion.g
                      key={camion.tipo}
                      animate={{
                        x: camion.x * scale,
                        y: camion.y * scale,
                      }}
                      transition={{
                        duration: hasBreakdown ? 0 : 0.8, // Don't animate if broken down
                        ease: "easeInOut",
                        type: "tween",
                      }}
                      onMouseEnter={() => setHoveredCamion(camion)}
                      onMouseLeave={() => setHoveredCamion(null)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Breakdown indicator */}
                      {hasBreakdown && breakdownInfo && (
                        <>
                          <circle
                            cx={0}
                            cy={-20}
                            r={10}
                            fill="red"
                            stroke="white"
                            strokeWidth={2}
                          >
                            <animate
                              attributeName="r"
                              values="8;10;8"
                              dur="1.5s"
                              repeatCount="indefinite"
                            />
                          </circle>
                          <text
                            x={0}
                            y={-20}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="bold"
                            fill="white"
                          >
                            TI{breakdownInfo.tipo}
                          </text>
                        </>
                      )}

                      <foreignObject x={-10} y={-10} width={20} height={20}>
                        <FaTruck
                          size={20}
                          color={truckColor}
                          style={{
                            filter: hasBreakdown
                              ? "grayscale(50%) brightness(1.2)"
                              : "none",
                          }}
                        />
                      </foreignObject>

                      {/* Breakdown description text */}
                      {hasBreakdown && breakdownInfo && (
                        <text
                          x={0}
                          y={15}
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="bold"
                          fill="red"
                        >
                          {breakdownInfo.descripcion.toUpperCase()}
                        </text>
                      )}
                    </motion.g>
                  );
                })}
              </svg>

              {/* Hover tooltips */}
              {hoveredPedido && (
                <div
                  className="absolute bg-black text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-50"
                  style={{
                    left: `${hoveredPedido.x * scale}px`,
                    top: `${hoveredPedido.y * scale - 40}px`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div>
                    <b>Pedido:</b> {hoveredPedido.idPedido}
                  </div>
                  <div>
                    <b>Cliente:</b> {hoveredPedido.cliente}
                  </div>
                  <div>
                    <b>Posición:</b> ({hoveredPedido.x}, {hoveredPedido.y})
                  </div>
                  <div>
                    <b>Volumen:</b> {hoveredPedido.volumenM3} m³
                  </div>
                  <div>
                    <b>Estado:</b>{" "}
                    {hoveredPedido.completado ? "Entregado" : "Pendiente"}
                  </div>
                </div>
              )}

              {hoveredCamion && (
                <div
                  className="absolute bg-black text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-50"
                  style={{
                    left: `${hoveredCamion.x * scale}px`,
                    top: `${
                      hoveredCamion.y * scale - (hoveredCamion.averia ? 70 : 50)
                    }px`,
                    transform: "translateX(-50%)",
                    minWidth: "200px",
                  }}
                >
                  <div>
                    <b>Camión:</b> {hoveredCamion.tipo}
                  </div>
                  <div>
                    <b>Posición:</b> ({hoveredCamion.x}, {hoveredCamion.y})
                  </div>
                  <div>
                    <b>Capacidad:</b> {hoveredCamion.capacidad} m³
                  </div>
                  <div>
                    <b>Carga actual:</b> {hoveredCamion.cantidad} m³
                  </div>
                  <div>
                    <b>Estado:</b> {getTruckStatus(hoveredCamion.estado).label}
                  </div>
                  <div>
                    <b>Ruta activa:</b>{" "}
                    {hoveredCamion.tieneRutaActiva ? "Sí" : "No"}
                  </div>

                  {/* Breakdown information */}
                  {hoveredCamion.averia && (
                    <>
                      <div className="border-t border-gray-600 mt-1 pt-1">
                        <div>
                          <b>Tipo de avería:</b>{" "}
                          <span className="text-red-400">
                            {hoveredCamion.tipoAveria}
                          </span>
                        </div>
                        <div>
                          <b>Descripción:</b>{" "}
                          <span className="text-red-400">
                            {hoveredCamion.descripcionAveria}
                          </span>
                        </div>
                        {hoveredCamion.tiempoLiberacion && (
                          <div>
                            <b>Liberación:</b>{" "}
                            <span className="text-yellow-400">
                              {hoveredCamion.tiempoLiberacion}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Indicador de modo creación */}
            {modoCreacionAlmacen && (
              <div className="absolute top-4 left-4 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg text-sm z-10">
                <div className="font-medium">🏭 Modo Creación de Almacén</div>
                <div className="text-xs">Haz click en cualquier celda vacía para crear un almacén</div>
              </div>
            )}

            {modoCreacionPedido && (
              <div className="absolute top-4 left-4 bg-orange-100 border border-orange-400 text-orange-700 px-3 py-2 rounded-lg text-sm z-10">
                <div className="font-medium">📦 Modo Creación de Pedido</div>
                <div className="text-xs">Haz click en cualquier celda para crear un pedido</div>
              </div>
            )}
            {showLegend && (
              <div className="absolute bottom-16 right-4 bg-white p-4 rounded shadow-lg w-56 text-sm z-20">
                <h3 className="font-semibold mb-2">Leyenda</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <FaTruck size={18} color="#10b981" />
                    <span>Camión Activo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaTruck size={18} color="#ef4444" />
                    <span>Camión Averiado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaTruck size={18} color="#3b82f6" />
                    <span>Recargando</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaTruck size={18} color="#eab308" />
                    <span>Mantenimiento</span>
                  </li>

                  <div className="border-t pt-2 mt-2">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Almacenes:
                    </div>
                    <li className="flex items-center gap-2">
                      <FaWarehouse size={18} color="#10b981" />
                      <span>Central (Normal)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaGasPump size={18} color="#10b981" />
                      <span>Tanque (Normal)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaWarehouse size={18} color="#f59e0b" />
                      <span>Advertencia</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaWarehouse size={18} color="#dc2626" />
                      <span>Crítico</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FaWarehouse size={18} color="#3b82f6" />
                      <span>Lleno</span>
                    </li>
                  </div>

                  <div className="border-t pt-2 mt-2">
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <span>Pedido Pendiente</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-green-500"></div>
                      <span>Ruta Activa</span>
                    </li>
                  </div>
                </ul>
              </div>
            )}

            {/* Modal for manual breakdown insertion */}
            {showAveriaModal && (
              <div className="absolute bottom-16 left-4 bg-white p-4 rounded shadow-lg w-80 text-sm z-20">
                <h3 className="font-semibold mb-3">Insertar Avería Manual</h3>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Camión:
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded text-sm"
                    value={averiaForm.idCamion}
                    onChange={(e) =>
                      setAveriaForm({ ...averiaForm, idCamion: e.target.value })
                    }
                  >
                    <option value="">Seleccionar camión...</option>
                    {camionesDisponibles.map((cam) => (
                      <option key={cam.tipo} value={cam.tipo}>
                        {cam.tipo} - {getTruckStatus(cam.estado).label} - (
                        {cam.posicion_x}, {cam.posicion_y})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">
                    Tipo de Avería:
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded text-sm"
                    value={averiaForm.tipo}
                    onChange={(e) =>
                      setAveriaForm({ ...averiaForm, tipo: e.target.value })
                    }
                    disabled={!averiaForm.idCamion}
                  >
                    <option value="">Seleccionar tipo...</option>
                    <option value="TI1">
                      TI1 - Llanta pinchada (2 horas, continúa desde posición)
                    </option>
                    <option value="TI2">
                      TI2 - Motor obstruido (2 horas + retorno a taller)
                    </option>
                    <option value="TI3">
                      TI3 - Accidente (4 horas + retorno a taller)
                    </option>
                  </select>
                </div>

                <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                  <div className="font-medium mb-1">Información:</div>
                  <div>
                    • El turno se determinará automáticamente según la hora
                    actual
                  </div>
                  <div>
                    • T1: 00:00-07:59 | T2: 08:00-15:59 | T3: 16:00-23:59
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handleInsertarAveria}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                    disabled={!averiaForm.idCamion || !averiaForm.tipo}
                  >
                    Insertar Avería
                  </button>
                  <button
                    onClick={() => {
                      setShowAveriaModal(false);
                      setAveriaForm({ idCamion: "", tipo: "" });
                    }}
                    className="bg-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Modal para crear pedido */}
            {showModalCrearPedido && coordenadaPedido && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                  <h3 className="text-lg font-semibold mb-4">Crear Nuevo Pedido</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Posición:</label>
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      X: {coordenadaPedido.x}, Y: {coordenadaPedido.y}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Fecha actual:</label>
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {new Date().toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Hora:</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded text-sm"
                        value={formularioPedido.hora}
                        onChange={(e) => setFormularioPedido({...formularioPedido, hora: parseInt(e.target.value)})}
                        min="0"
                        max="23"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Minuto:</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded text-sm"
                        value={formularioPedido.minuto}
                        onChange={(e) => setFormularioPedido({...formularioPedido, minuto: parseInt(e.target.value)})}
                        min="0"
                        max="59"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Horas límite:</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded text-sm"
                      value={formularioPedido.horasLimite}
                      onChange={(e) => setFormularioPedido({...formularioPedido, horasLimite: parseInt(e.target.value)})}
                      min="1"
                      max="24"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Tiempo límite para entrega (en horas)
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Cantidad Producto (m³):</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded text-sm"
                      value={formularioPedido.cantidadProducto}
                      onChange={(e) => setFormularioPedido({...formularioPedido, cantidadProducto: parseInt(e.target.value)})}
                      min="1"
                      max="1000"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Cantidad GLP (m³):</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded text-sm"
                      value={formularioPedido.cantidadGLP}
                      onChange={(e) => setFormularioPedido({...formularioPedido, cantidadGLP: parseInt(e.target.value)})}
                      min="1"
                      max="1000"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowModalCrearPedido(false);
                        setCoordenadaPedido(null);
                        setFormularioPedido({
                          hora: new Date().getHours(),
                          minuto: new Date().getMinutes(),
                          horasLimite: 2,
                          cantidadProducto: 200,
                          cantidadGLP: 150
                        });
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCrearPedido}
                      className="px-4 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                    >
                      Crear Pedido
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </section>
  );
};

export default Monitoreo;
