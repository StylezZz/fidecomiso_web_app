import { Group, Rect, Text, Circle } from "react-konva";

export enum TooltipType {
  PEDIDO = "pedido",
  ALMACEN = "almacen", 
  CAMION = "camion",
  BLOQUEO = "bloqueo"
}

interface TooltipField {
  label: string;
  value: string;
  color?: string;
}

interface StorageData {
  current: number;
  total: number;
  unit?: string;
  label?: string;
}

interface MapTooltipProps {
  type: TooltipType;
  title: string;
  fields: TooltipField[];
  posX: number;
  posY: number;
  iconColor: string;
  storageData?: StorageData; 
}

export const MapTooltip = ({
  type,
  title, 
  fields,
  posX,
  posY,
  iconColor,
  storageData
}: MapTooltipProps) => {
  // ✨ ANCHO ESPECÍFICO POR TIPO DE TOOLTIP:
  const getOptimalWidthByType = () => {
    switch (type) {
      case TooltipType.PEDIDO:
        return 140; // ✅ Muy compacto para textos cortos
        
      case TooltipType.ALMACEN:
        return 160; // ✅ Compacto para textos medianos
        
      case TooltipType.CAMION:
        return 170; // ✅ Ligeramente más ancho
        
      case TooltipType.BLOQUEO:
        return 220; // ✅ Más ancho para fechas largas
        
      default:
        return 180;
    }
  };

  const getStorageBarData = () => {
    if(!storageData) return null;
    
    // 🚦 Para camiones, usar la misma lógica del panel
    if (type === TooltipType.CAMION) {
      const tipo = title.substring(0, 2); // Extraer tipo del código del camión (ej: "TA01" -> "TA")
      
      // ✅ Capacidades por tipo de camión (igual que en el panel)
      const getCapacidadMaxima = (tipo: string) => {
        switch (tipo) {
          case "TA": return 25; // Camiones tipo A: 25m³
          case "TB": return 15; // Camiones tipo B: 15m³
          case "TC": return 10; // Camiones tipo C: 10m³
          case "TD": return 5;  // Camiones tipo D: 5m³
          default: return 10;
        }
      };
      
      const capacidadMaxima = getCapacidadMaxima(tipo);
      const cargaActual = storageData.current;
      const percentage = Math.min((cargaActual / capacidadMaxima) * 100, 100);
      
      const barWidth = getOptimalWidthByType() - 20;
      const fillWidth = (barWidth * percentage) / 100;

      // Sistema de colores tipo semáforo (igual que en el panel)
      let barColor = "#6b7280"; // Gris por defecto (vacío)
      let statusText = "Vacío";
      
      if (percentage >= 80) {
        barColor = "#ef4444"; // Rojo: casi lleno (80-100%)
        statusText = "Casi lleno";
      } else if (percentage >= 50) {
        barColor = "#f59e0b"; // Amarillo: medio lleno (50-79%)
        statusText = "Medio lleno";
      } else if (percentage > 0) {
        barColor = "#22c55e"; // Verde: poco cargado (1-49%)
        statusText = "Poco cargado";
      }

      return {
        percentage: percentage.toFixed(1),
        barWidth,
        fillWidth,
        barColor,
        statusText,
        label: "Carga",
        text: `${cargaActual} / ${capacidadMaxima} m³`
      };
    }
    
    // Para otros tipos (almacenes, etc.), mantener lógica original
    const percentage = (storageData.current / storageData.total) * 100;
    const barWidth = getOptimalWidthByType() - 20;
    const fillWidth = (barWidth * percentage) / 100;
    
    let barColor = "#6b7280"; // Gris por defecto
    let statusText = "Vacío";
    
    if(percentage > 80) {
      barColor = "#ef4444"; // Rojo si > 80%
      statusText = "Casi lleno";
    } else if(percentage > 60) {
      barColor = "#f59e0b"; // Amarillo si > 60%
      statusText = "Medio lleno";
    } else if(percentage > 0) {
      barColor = "#4ade80"; // Verde si > 0%
      statusText = "En uso";
    }

    return {
      percentage: percentage.toFixed(1),
      barWidth,
      fillWidth,
      barColor,
      statusText,
      label: storageData.label || "Almacenamiento",
      text: `${storageData.current} / ${storageData.total} ${storageData.unit || "m³"}`
    }
  }

  // ✨ ALTURA ESPECÍFICA POR TIPO:
  const getOptimalHeightByType = () => {
    const headerHeight = 35;
    let fieldHeight = 18;
    let padding = 12;
    let storageBarHeight = storageData ? 30 : 0; // ✅ Espacio para la barra de almacenamiento

    // Ajustar espaciado según tipo
    switch (type) {
      case TooltipType.PEDIDO:
        fieldHeight = 16; // ✅ Más compacto
        padding = 10;
        break;
        
      case TooltipType.ALMACEN:
        fieldHeight = 17;
        padding = 11;
        break;
        
      case TooltipType.CAMION:
        fieldHeight = 17;
        padding = 12;
        break;
        
      case TooltipType.BLOQUEO:
        fieldHeight = 19; // ✅ Más espacio para fechas
        padding = 15;
        break;
    }
    
    return headerHeight + (fields.length * fieldHeight) + padding + storageBarHeight;
  };

  const toolTipWidth = getOptimalWidthByType();
  const toolTipHeight = getOptimalHeightByType();
  const headerHeight = 35;

  // ✨ MÁRGENES ESPECÍFICOS POR TIPO:
  const getMargins = () => {
    switch (type) {
      case TooltipType.PEDIDO:
        return { iconX: 10, titleX: 22, fieldX: 10, textWidth: toolTipWidth - 15 };
        
      case TooltipType.ALMACEN:
        return { iconX: 10, titleX: 23, fieldX: 10, textWidth: toolTipWidth - 15 };
        
      case TooltipType.CAMION:
        return { iconX: 11, titleX: 24, fieldX: 11, textWidth: toolTipWidth - 17 };
        
      case TooltipType.BLOQUEO:
        return { iconX: 12, titleX: 25, fieldX: 12, textWidth: toolTipWidth - 20 };
        
      default:
        return { iconX: 12, titleX: 25, fieldX: 12, textWidth: toolTipWidth - 20 };
    }
  };

  const margins = getMargins();
  const storageBar = getStorageBarData();
  const fieldsEndY = headerHeight + 5 + (fields.length * (type === TooltipType.BLOQUEO ? 19 : 17));

  return(
    <Group x={posX} y={posY}>
      {/* Fondo principal */}
      <Rect
        width={toolTipWidth}
        height={toolTipHeight}
        fill="#fff"
        stroke="#e5e7eb"
        strokeWidth={2}
        cornerRadius={8}
        shadowColor="black"
        shadowBlur={10}
        shadowOpacity={0.1}
        shadowOffsetX={0}
        shadowOffsetY={4}
      />
      
      {/* Header */}
      <Rect width={toolTipWidth} height={headerHeight} fill="#f8fafc" />
      
      {/* Icono */}
      <Circle 
        fill={iconColor}
        radius={5}
        x={margins.iconX}
        y={headerHeight/2}
      />
      
      {/* Título */}
      <Text
        text={title}
        fontStyle="bold"
        fontSize={14}
        fill="#1f2937"
        x={margins.titleX}
        y={12}
        width={margins.textWidth}
      />
      
      {/* ✨ CAMPOS SUBIDOS - Más cerca del título */}
      {fields.map((field, index) => (
        <Text
          key={`field-${index}`}
          text={`${field.label}: ${field.value}`}
          fontStyle="bold"
          fontSize={12}
          fill={field.color || "#6b7280"}
          x={margins.fieldX}
          y={headerHeight + 5 + (index * (type === TooltipType.BLOQUEO ? 19 : 17))}
          width={margins.textWidth}
        />
      ))}

      {storageBar && (
        <Group>
          {/* Título con estado para camiones */}
          <Text
            text={type === TooltipType.CAMION 
              ? `${storageBar.label}: ${storageBar.text} (${storageBar.percentage}%) - ${storageBar.statusText}`
              : `${storageBar.label}: ${storageBar.text} (${storageBar.percentage}%)`
            }
            fontSize={10}
            fill="#374151"
            fontStyle="bold"
            x={10}
            y={fieldsEndY + 2}
            width={margins.textWidth}
          />
          
          {/* Barra de fondo */}
          <Rect
            x={10}
            y={fieldsEndY + 15}
            width={storageBar.barWidth}
            height={12}
            fill="#e5e7eb"
            cornerRadius={6}
            stroke="#d1d5db"
            strokeWidth={1}
          />
          
          {/* Barra de progreso con colores semáforo */}
          <Rect
            x={10}
            y={fieldsEndY + 15}
            width={storageBar.fillWidth}
            height={12}
            fill={storageBar.barColor}
            cornerRadius={6}
          />
          
          {/* Indicador visual adicional para camiones */}
          {type === TooltipType.CAMION && (
            <Circle
              x={storageBar.barWidth + 20}
              y={fieldsEndY + 21}
              radius={4}
              fill={storageBar.barColor}
              stroke="#ffffff"
              strokeWidth={1}
            />
          )}
        </Group>
      )}

    </Group>
  )
}
