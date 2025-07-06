// Actualizar los IDs en los datos de ejemplo para que sean números simples
export const ordersData = [
  {
    id: "1",
    customer: "Empresa ABC",
    customerType: "juridico",
    volume: 15.5,
    location: { lat: 25, lng: 30 },
    address: "Av. Industrial 123, Lima",
    createdAt: "2023-06-10T08:30:00Z",
    deadline: "2023-06-12T18:00:00Z",
    estimatedDeliveryTime: "2023-06-12T14:00:00Z",
    status: "delivered",
    priority: "high",
    trackingCode: "PLG-123456-7890",
    timeline: [
      {
        status: "created",
        timestamp: "2023-06-10T08:30:00Z",
      },
      {
        status: "assigned",
        timestamp: "2023-06-10T09:15:00Z",
        truckId: "truck1",
      },
      {
        status: "in_transit",
        timestamp: "2023-06-11T07:00:00Z",
      },
      {
        status: "delivered",
        timestamp: "2023-06-12T14:00:00Z",
        notes: "Entregado sin incidencias",
      },
    ],
    notificationsSent: {
      confirmation: true,
      dispatch: true,
      delivery: true,
    },
  },
  {
    id: "2",
    customer: "Distribuidora XYZ",
    customerType: "juridico",
    volume: 8.2,
    location: { lat: 35, lng: 40 },
    address: "Jr. Comercio 456, Callao",
    createdAt: "2023-06-11T10:15:00Z",
    deadline: "2023-06-13T12:00:00Z",
    estimatedDeliveryTime: "2023-06-13T10:30:00Z",
    status: "in_transit",
    priority: "medium",
    trackingCode: "PLG-234567-8901",
    timeline: [
      {
        status: "created",
        timestamp: "2023-06-11T10:15:00Z",
      },
      {
        status: "assigned",
        timestamp: "2023-06-11T11:00:00Z",
        truckId: "truck2",
      },
      {
        status: "in_transit",
        timestamp: "2023-06-12T08:30:00Z",
      },
    ],
    notificationsSent: {
      confirmation: true,
      dispatch: true,
      delivery: false,
    },
  },
  {
    id: "3",
    customer: "Supermercados Norte",
    customerType: "juridico",
    volume: 12.0,
    location: { lat: 15, lng: 20 },
    address: "Av. Los Pinos 789, Surco",
    createdAt: "2023-06-12T09:00:00Z",
    deadline: "2023-06-14T15:00:00Z",
    estimatedDeliveryTime: "2023-06-14T12:00:00Z",
    status: "assigned",
    priority: "medium",
    trackingCode: "PLG-345678-9012",
    timeline: [
      {
        status: "created",
        timestamp: "2023-06-12T09:00:00Z",
      },
      {
        status: "assigned",
        timestamp: "2023-06-12T10:30:00Z",
        truckId: "truck3",
      },
    ],
    notificationsSent: {
      confirmation: true,
      dispatch: false,
      delivery: false,
    },
  },
  {
    id: "4",
    customer: "Tiendas Retail S.A.",
    customerType: "juridico",
    volume: 5.5,
    location: { lat: 40, lng: 10 },
    address: "Calle Comercio 234, Miraflores",
    createdAt: "2023-06-12T14:30:00Z",
    deadline: "2023-06-15T10:00:00Z",
    estimatedDeliveryTime: "2023-06-15T09:00:00Z",
    status: "pending",
    priority: "low",
    trackingCode: "PLG-456789-0123",
    timeline: [
      {
        status: "created",
        timestamp: "2023-06-12T14:30:00Z",
      },
    ],
    notificationsSent: {
      confirmation: true,
      dispatch: false,
      delivery: false,
    },
  },
  {
    id: "5",
    customer: "Juan Pérez",
    customerType: "natural",
    volume: 2.0,
    location: { lat: 30, lng: 35 },
    address: "Jr. Las Flores 567, San Isidro",
    createdAt: "2023-06-13T08:45:00Z",
    deadline: "2023-06-16T14:00:00Z",
    estimatedDeliveryTime: "2023-06-16T11:00:00Z",
    status: "pending",
    priority: "low",
    trackingCode: "PLG-567890-1234",
    timeline: [
      {
        status: "created",
        timestamp: "2023-06-13T08:45:00Z",
      },
    ],
    notificationsSent: {
      confirmation: true,
      dispatch: false,
      delivery: false,
    },
  },
]

// Actualizar los datos de camiones para incluir los nuevos campos
export const trucksData = [
  {
    id: "truck1",
    plate: "ABC-123",
    capacity: 25, // Camión grande
    currentLoad: 20,
    status: "available",
    position: [12, 10] as [number, number], // Cerca de la planta principal
    driver: "Juan Pérez",
    phone: "999-888-777",
    truckType: "large",
    lastMaintenance: "2023-12-01T10:00:00Z",
    nextMaintenance: "2024-02-01T10:00:00Z",
    fuelConsumption: 12.5,
    totalKilometers: 25000,
    maintenanceHistory: [
      {
        date: "2023-12-01T10:00:00Z",
        type: "preventive",
        description: "Mantenimiento preventivo regular",
        cost: 500,
      },
      {
        date: "2023-10-15T10:00:00Z",
        type: "corrective",
        description: "Reparación de frenos",
        cost: 800,
      },
    ],
    operationalCategory: "high",
    comments: "Camión principal para entregas de gran volumen",
  },
  {
    id: "truck2",
    plate: "DEF-456",
    capacity: 15, // Camión mediano
    currentLoad: 15,
    status: "in_transit",
    position: [30, 25] as [number, number],
    driver: "María López",
    phone: "999-777-888",
    truckType: "medium",
    lastMaintenance: "2023-11-15T10:00:00Z",
    nextMaintenance: "2024-01-15T10:00:00Z",
    fuelConsumption: 10.2,
    totalKilometers: 18000,
    maintenanceHistory: [
      {
        date: "2023-11-15T10:00:00Z",
        type: "preventive",
        description: "Cambio de aceite y filtros",
        cost: 350,
      },
    ],
    operationalCategory: "medium",
    currentOrders: ["order3"],
    destination: [45, 30] as [number, number],
    comments: "Camión para entregas medianas",
  },
  {
    id: "truck3",
    plate: "GHI-789",
    capacity: 10, // Camión pequeño
    currentLoad: 0,
    status: "maintenance",
    position: [42, 40] as [number, number], // Cerca del tanque norte
    driver: "Carlos Rodríguez",
    phone: "999-666-555",
    truckType: "small",
    lastMaintenance: "2024-01-05T10:00:00Z",
    nextMaintenance: "2024-03-05T10:00:00Z",
    fuelConsumption: 8.7,
    totalKilometers: 12000,
    maintenanceHistory: [
      {
        date: "2024-01-05T10:00:00Z",
        type: "corrective",
        description: "Reparación del sistema eléctrico",
        cost: 650,
      },
      {
        date: "2023-11-20T10:00:00Z",
        type: "preventive",
        description: "Mantenimiento preventivo regular",
        cost: 300,
      },
    ],
    operationalCategory: "low",
    comments: "Camión para entregas pequeñas en zonas urbanas",
  },
  {
    id: "truck4",
    plate: "JKL-012",
    capacity: 20,
    currentLoad: 18,
    status: "in_transit",
    position: [50, 15] as [number, number],
    driver: "Ana Gómez",
    phone: "999-555-444",
    truckType: "medium",
    lastMaintenance: "2023-12-20T10:00:00Z",
    nextMaintenance: "2024-02-20T10:00:00Z",
    fuelConsumption: 11.3,
    totalKilometers: 22000,
    maintenanceHistory: [
      {
        date: "2023-12-20T10:00:00Z",
        type: "preventive",
        description: "Revisión general y cambio de aceite",
        cost: 400,
      },
    ],
    operationalCategory: "medium",
    currentOrders: ["order5"],
    destination: [60, 5] as [number, number],
    comments: "Camión para entregas medianas y largas distancias",
  },
  {
    id: "truck5",
    plate: "MNO-345",
    capacity: 5, // Camión muy pequeño
    currentLoad: 5,
    status: "available",
    position: [63, 5] as [number, number], // Cerca del tanque este
    driver: "Luis Torres",
    phone: "999-444-333",
    truckType: "small",
    lastMaintenance: "2024-01-02T10:00:00Z",
    nextMaintenance: "2024-03-02T10:00:00Z",
    fuelConsumption: 7.5,
    totalKilometers: 8000,
    maintenanceHistory: [
      {
        date: "2024-01-02T10:00:00Z",
        type: "preventive",
        description: "Mantenimiento preventivo regular",
        cost: 250,
      },
    ],
    operationalCategory: "low",
    comments: "Camión pequeño para entregas urbanas de bajo volumen",
  },
]

// Configuración de la retícula
export const gridConfig = {
  width: 70, // 70 km de ancho
  height: 50, // 50 km de alto
}

// Datos de la planta principal
export const plantData = {
  id: "plant1",
  position: [12, 8] as [number, number], // Coordenadas cartesianas
  name: "Planta Principal (Central)",
  capacity: null, // Capacidad ilimitada
  currentLevel: null,
}

// Datos de tanques intermedios
export const tanksData = [
  {
    id: "tank1",
    position: [42, 42] as [number, number], // Tanque Intermedio Norte
    name: "Tanque Intermedio Norte",
    capacity: 160,
    currentLevel: 120,
    lastRefill: "2024-01-10T00:00:00Z",
  },
  {
    id: "tank2",
    position: [63, 3] as [number, number], // Tanque Intermedio Este
    name: "Tanque Intermedio Este",
    capacity: 160,
    currentLevel: 85,
    lastRefill: "2024-01-10T00:00:00Z",
  },
]

// Datos de rutas
export const routesData = [
  {
    id: "route1",
    truckId: "truck1",
    path: [
      [12, 10], // Posición inicial del camión
      [15, 10],
      [15, 15],
      [20, 15], // Ubicación del pedido 1
    ] as [number, number][],
    color: "#3b82f6", // blue-500
    completed: false,
  },
  {
    id: "route2",
    truckId: "truck2",
    path: [
      [30, 25], // Posición actual del camión
      [35, 25],
      [35, 30],
      [45, 30], // Ubicación del pedido 3
    ] as [number, number][],
    color: "#ef4444", // red-500
    completed: false,
  },
  {
    id: "route3",
    truckId: "truck4",
    path: [
      [50, 15], // Posición actual del camión
      [55, 15],
      [55, 10],
      [60, 10],
      [60, 5], // Ubicación del pedido 5
    ] as [number, number][],
    color: "#10b981", // green-500
    completed: false,
  },
]

// Datos del dashboard
export const dashboardStatsData = {
  pendingOrders: 5,
  availableTrucks: 4,
  totalTrucks: 6,
  fuelConsumption: 245.8,
  averageDeliveryTime: 1.2,
}

// Datos de algoritmos disponibles
export const algorithmsData = [
  {
    id: "genetic",
    name: "Algoritmo Genético",
    description: "Optimiza rutas mediante evolución de soluciones",
  },
  {
    id: "tabu",
    name: "Búsqueda Tabú",
    description: "Evita óptimos locales mediante lista tabú",
  },
  {
    id: "simulated_annealing",
    name: "Recocido Simulado",
    description: "Simula proceso físico de enfriamiento para optimizar",
  },
  {
    id: "ant_colony",
    name: "Colonia de Hormigas",
    description: "Basado en comportamiento de hormigas buscando comida",
  },
]

// Datos de tipos de simulación
export const simulationTypesData = [
  {
    id: "daily",
    name: "Simulación Diaria",
    description: "Simula operaciones durante un día",
  },
  {
    id: "weekly",
    name: "Simulación Semanal",
    description: "Simula operaciones durante una semana",
  },
  {
    id: "until_collapse",
    name: "Hasta Colapso",
    description: "Simula hasta que el sistema no pueda cumplir con los pedidos",
  },
]

// Datos de mapa completos
export const mapData = {
  plant: plantData,
  tanks: tanksData,
  trucks: trucksData.map(truck => ({
    id: truck.id,
    position: truck.position,
    capacity: truck.capacity,
    currentLoad: truck.currentLoad,
    status: truck.status,
    type: truck.truckType || 'standard', // Usar truckType como type, con un valor por defecto
    currentRoute: truck.currentOrders?.[0],
    destination: truck.destination,
  })),
  orders: ordersData.map((order) => ({
    id: order.id,
    customer: order.customer,
    volume: order.volume,
    position: [order.location.lng, order.location.lat] as [number, number],
    deadline: order.deadline,
    status: order.status,
  })),
  routes: routesData,
  grid: gridConfig,
}
