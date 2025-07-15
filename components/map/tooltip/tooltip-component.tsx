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

interface MapTooltipProps {
  type: TooltipType;
  title: string;
  fields: TooltipField[];
  posX: number;
  posY: number;
  iconColor: string;
}

export const MapTooltip = ({
  type,
  title, 
  fields,
  posX,
  posY,
  iconColor
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

  // ✨ ALTURA ESPECÍFICA POR TIPO:
  const getOptimalHeightByType = () => {
    const headerHeight = 35;
    let fieldHeight = 18;
    let padding = 12;
    
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
    
    return headerHeight + (fields.length * fieldHeight) + padding;
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
    </Group>
  )
}
