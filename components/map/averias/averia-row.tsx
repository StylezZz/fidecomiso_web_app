import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";

export const AveriaRowImproved = React.memo(({ averia }: { averia: any }) => {
  const getTipoAveriaColor = (tipo: string) => {
    switch (tipo) {
      case "LEVE":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "MODERADO":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "GRAVE":
        return "bg-red-50 text-red-700 border-red-200";
      case "MANTENIMIENTO":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getTipoAveriaIcon = (tipo: string) => {
    switch (tipo) {
      case "LEVE":
        return "⚠️ T1 ";
      case "MODERADO":
        return "🔧 T2 ";
      case "GRAVE":
        return "🚨 T3 ";
      case "MANTENIMIENTO":
        return "🛠️";
      default:
        return "❓";
    }
  };

  const formatearMomento = (momento: number, fechaBaseSimulacion: string) => {
    try {
      // Convertir fecha base ISO a Date
      const fechaBase = new Date(fechaBaseSimulacion);

      // Sumar los minutos del momento a la fecha base
      const fechaCalculada = new Date(fechaBase.getTime() + momento * 60 * 1000);

      // Obtener componentes de fecha
      const dia = fechaCalculada.getDate();
      const mes = fechaCalculada.getMonth() + 1; // getMonth() devuelve 0-11
      const anio = fechaCalculada.getFullYear();
      const horas = fechaCalculada.getHours();
      const minutos = fechaCalculada.getMinutes();

      // Nombres de meses abreviados
      const meses = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];

      return `${dia} ${meses[mes - 1]} ${anio} ${horas.toString().padStart(2, "0")}:${minutos
        .toString()
        .padStart(2, "0")}`;
    } catch (error) {
      console.error("Error al formatear momento:", error);
      // Fallback a formato anterior si hay error
      const dias = Math.floor(momento / 1440);
      const horas = Math.floor((momento % 1440) / 60);
      const min = Math.floor(momento % 60);
      return `${dias}d ${horas}h ${min}m`;
    }
  };
  const esAveriaManual = averia.porcentajeRecorrido === 0;

  return (
    <TableRow className="hover:bg-purple-50 border-b border-purple-100 transition-all duration-200">
      <TableCell className="py-4 px-6">
        <div className="flex items-center gap-4">
          <div>
            <div className="font-bold text-base text-slate-800">{averia.codigoCamion}</div>
            <div className="text-sm text-slate-500">Turno {averia.turnoAveria}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${getTipoAveriaColor(
            averia.tipoAveria
          )}`}
        >
          <span className="text-base">{getTipoAveriaIcon(averia.tipoAveria)}</span>
          {averia.tipoAveria}
        </span>
      </TableCell>
      <TableCell className="text-sm text-slate-700 px-8">
        <div className="flex items-center gap-1">
          <div>
            <span className="text-sm font-bold text-slate-800">
              {formatearMomento(averia.momentoGeneracion, averia.fechaBaseSimulacion)}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${
            esAveriaManual
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-green-50 text-green-700 border-green-200"
          }`}
        >
          <span className="text-base">{esAveriaManual ? "👤" : "🤖"}</span>
          {esAveriaManual ? "Manual" : "Planificador"}
        </span>
      </TableCell>
    </TableRow>
  );
});

AveriaRowImproved.displayName = "AveriaRowImproved";
