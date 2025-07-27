# Guía de Uso: Tooltip con Barra de Almacenamiento

## Resumen de la Implementación

Se ha implementado una barra de almacenamiento para los tooltips de camiones que muestra la carga actual vs. la capacidad máxima según el tipo de camión.

## Capacidades por Tipo de Camión

- **TA**: 25 m³ (Camión Tipo A - Grande)
- **TB**: 15 m³ (Camión Tipo B - Mediano)
- **TC**: 10 m³ (Camión Tipo C - Pequeño)
- **TD**: 5 m³  (Camión Tipo D - Mini)

## Archivos Modificados

### 1. `components/map/tooltip/tooltip-component.tsx`
- ✅ Agregada interfaz `StorageData` para datos de almacenamiento
- ✅ Agregado parámetro opcional `storageData` en `MapTooltipProps`
- ✅ Implementada función `getStorageBarData()` para calcular la barra
- ✅ Actualizada función `getOptimalHeightByType()` para incluir espacio para la barra
- ✅ Agregado componente visual de la barra de almacenamiento

### 2. `hooks/use-tooltip.ts`
- ✅ Agregado import de funciones utilitarias de camiones
- ✅ Actualizado caso `TooltipType.CAMION` para incluir `storageData`
- ✅ Extraer tipo de camión del código usando `getTruckTypeFromCode()`
- ✅ Obtener capacidad máxima usando `getTruckCapacityByType()`

### 3. `utils/trucksUtils.ts`
- ✅ Agregada función `getTruckCapacityByType(tipoCamion: string): number`
- ✅ Agregada función `getTruckTypeFromCode(codigo: string): string`

## Características de la Barra de Almacenamiento

### Colores Dinámicos
- 🟢 **Verde** (`#4ade80`): 0-60% de capacidad
- 🟡 **Amarillo** (`#f59e0b`): 60-80% de capacidad  
- 🔴 **Rojo** (`#ef4444`): 80-100% de capacidad

### Información Mostrada
- Etiqueta personalizable (por defecto: "Carga GLP")
- Valores actuales y máximos con unidad
- Porcentaje de ocupación
- Barra visual proporcional

## Ejemplo de Uso

```tsx
// El tooltip se genera automáticamente cuando se hace clic en un camión
// Datos de ejemplo que se pasarían:

const ejemploCamion: CamionI = {
  codigo: "TA01",  // Tipo TA = 25 m³ máximo
  carga: 18,       // 18 m³ de carga actual
  // ... otros campos
};

// Resultado del tooltip:
// - Título: "CAMIÓN: TA01"
// - Tipo: "TA"
// - Barra de almacenamiento: 18/25 m³ (72%) - Color amarillo
```

## Casos de Prueba

### Camión TA (Grande - 25 m³)
- `TA01` con 5 m³ → 20% Verde ✅
- `TA02` con 18 m³ → 72% Amarillo ✅
- `TA03` con 22 m³ → 88% Rojo ✅

### Camión TB (Mediano - 15 m³)
- `TB01` con 8 m³ → 53% Verde ✅
- `TB02` con 12 m³ → 80% Rojo ✅

### Camión TC (Pequeño - 10 m³)
- `TC01` con 4 m³ → 40% Verde ✅
- `TC02` con 9 m³ → 90% Rojo ✅

### Camión TD (Mini - 5 m³)
- `TD01` con 2 m³ → 40% Verde ✅
- `TD02` con 4.5 m³ → 90% Rojo ✅

## Funcionalidades Adicionales

### Responsive por Tipo de Tooltip
- Ancho específico según tipo de tooltip
- Altura automática que incluye espacio para la barra
- Márgenes optimizados por tipo

### Opcional y Retrocompatible
- Solo se muestra si se proporciona `storageData`
- Compatible con todos los tooltips existentes
- No rompe funcionalidad anterior

## Próximos Pasos (Opcional)

1. **Animaciones**: Agregar animación de carga de la barra
2. **Límites de Alerta**: Notificaciones cuando la carga está cerca del límite
3. **Predicción**: Mostrar proyección de carga según la ruta asignada
4. **Histórico**: Gráfico mini de carga a lo largo del tiempo

## Verificación

Para verificar que todo funciona correctamente:

1. Ejecutar la aplicación
2. Ir al mapa de simulación
3. Hacer clic en cualquier camión en el mapa
4. Verificar que aparece el tooltip con:
   - Información básica del camión
   - Barra de almacenamiento con color adecuado
   - Porcentaje y valores correctos
