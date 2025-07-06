"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Datos hardcodeados para los tipos de camiones
const TRUCK_TYPES = [
  {
    id: "TA",
    capacity: "25 m³",
    tara: "2.5 Ton",
    glpWeight: "12.5 Ton",
    combinedWeight: "15.0 Ton",
    units: 2,
    status: "available"
  },
  {
    id: "TB",
    capacity: "15 m³",
    tara: "2.0 Ton",
    glpWeight: "7.5 Ton",
    combinedWeight: "9.5 Ton",
    units: 4,
    status: "available"
  },
  {
    id: "TC",
    capacity: "10 m³",
    tara: "1.5 Ton",
    glpWeight: "5.0 Ton",
    combinedWeight: "6.5 Ton",
    units: 4,
    status: "available"
  },
  {
    id: "TD",
    capacity: "5 m³",
    tara: "1.0 Ton",
    glpWeight: "2.5 Ton",
    combinedWeight: "3.5 Ton",
    units: 10,
    status: "available"
  }
];

export function DashboardTrucks() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge variant="success">Disponible</Badge>
      case "in_transit":
        return <Badge variant="default">En ruta</Badge>
      case "loading":
        return <Badge variant="secondary">Cargando</Badge>
      case "maintenance":
        return <Badge variant="destructive">Mantenimiento</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calcular la capacidad total
  const totalCapacity = TRUCK_TYPES.reduce((sum, truck) => {
    const value = parseFloat(truck.capacity.split(' ')[0]);
    return sum + (value * truck.units);
  }, 0);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px] text-center">Tipo</TableHead>
            <TableHead className="text-center">Peso Tara</TableHead>
            <TableHead className="text-center">Carga GLP</TableHead>
            <TableHead className="text-center">Peso Carga GLP</TableHead>
            <TableHead className="text-center">Peso Combinado</TableHead>
            <TableHead className="text-center">Unidades</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {TRUCK_TYPES.map((truck) => (
            <TableRow key={truck.id}>
              <TableCell className={`${getTruckTypeColor(truck.id)}`}>
                {truck.id}
              </TableCell>
              <TableCell className="text-center">{truck.tara}</TableCell>
              <TableCell className="text-center">{truck.capacity}</TableCell>
              <TableCell className="text-center">{truck.glpWeight}</TableCell>
              <TableCell className="text-center">{truck.combinedWeight}</TableCell>
              <TableCell className="text-center">
                {truck.units.toString().padStart(2, '0')} unid
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Resumen de flota simplificado */}
      <div className="bg-gray-50 rounded-md p-4 border mt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total de unidades:</span>
          <span className="font-semibold">{TRUCK_TYPES.reduce((sum, truck) => sum + truck.units, 0)} camiones</span>
        </div>
      </div>
    </div>
  )
}

// Función para determinar el color de fondo según el tipo de camión
function getTruckTypeColor(type: string) {
  switch (type) {
    case 'TA':
      return 'bg-yellow-200 py-1 px-3 rounded-md text-center font-bold';
    case 'TB':
      return 'bg-blue-200 py-1 px-3 rounded-md text-center font-bold';
    case 'TC':
      return 'bg-orange-200 py-1 px-3 rounded-md text-center font-bold';
    case 'TD':
      return 'bg-gray-200 py-1 px-3 rounded-md text-center font-bold';
    default:
      return '';
  }
}