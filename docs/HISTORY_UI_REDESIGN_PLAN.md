# Plan de Rediseño: Historial de Lecturas (`/historial`)

## Resumen Ejecutivo

El historial de lecturas de tarot (`/historial`) presenta problemas graves de UX que requieren rediseño urgente. Las tarjetas actuales ocupan mucho espacio vertical pero muestran información mínima (solo fecha relativa e icono), mientras que el historial de carta del día (`/carta-del-dia/historial`) ya implementa un diseño superior que puede servir de modelo.

---

## Alineación con DESIGN_HAND-OFF.md

Este plan sigue las especificaciones del documento de diseño oficial:

**Referencia:** `backend/tarot-app/docs/DESIGN_HAND-OFF.md` - Sección 3.4 "Historial de Lecturas"

### Especificación Original (DESIGN_HAND-OFF):

```
Componente ReadingItem (tarjeta fila):
- Izquierda: Icono o miniatura de la carta principal revelada
- Centro: Título grande (pregunta realizada), Fecha relativa ('hace 2 días') en gris
- Derecha: Badge del tipo de tirada (ej: 'Cruz Celta') y botón icono 'Ver' (ojo o flecha)

Filtros:
- Dropdown simple arriba a la derecha para filtrar por fecha
```

### Design Tokens Utilizados:

| Token          | Valor                                     | Uso               |
| -------------- | ----------------------------------------- | ----------------- |
| `bg-main`      | `#F9F7F2`                                 | Fondo página      |
| `surface`      | `#FFFFFF`                                 | Fondo tarjetas    |
| `text-primary` | `#2D3748`                                 | Pregunta (título) |
| `text-muted`   | `#718096`                                 | Fecha relativa    |
| `primary`      | `#805AD5`                                 | Acentos, enlaces  |
| `shadow-soft`  | `0 4px 20px -2px rgba(128, 90, 213, 0.1)` | Sombra tarjetas   |

---

## Análisis del Estado Actual

### Capturas de Pantalla

Las capturas se encuentran en `.playwright-mcp/`:

- `historial-lecturas.png` - Vista actual del historial de lecturas
- `carta-del-dia-historial.png` - Vista del historial de carta del día (mejor diseño)

### Problemas Identificados en `/historial`

| Problema                                         | Impacto                                  | Severidad |
| ------------------------------------------------ | ---------------------------------------- | --------- |
| Tarjetas enormes con espacio vacío               | Desperdicio de pantalla, scroll excesivo | Alta      |
| Solo muestra fecha relativa ("hace 2 días")      | Usuario no puede identificar lecturas    | Alta      |
| No muestra la pregunta del usuario               | Información crítica faltante             | Alta      |
| No muestra tipo de tirada (spread)               | Usuario no diferencia lecturas           | Media     |
| No muestra cantidad de cartas                    | Contexto faltante                        | Media     |
| No muestra preview de cartas                     | Oportunidad visual desperdiciada         | Media     |
| Icono genérico en lugar de imagen                | Diseño aburrido, sin identidad           | Media     |
| No diferencia lecturas de tarot vs carta del día | Si se unifican, confusión                | Alta      |

### Comparación: Historial Lecturas vs Carta del Día

| Característica         | `/historial` (actual) | `/carta-del-dia/historial`    |
| ---------------------- | --------------------- | ----------------------------- |
| Fecha                  | Relativa ("hace X")   | Completa ("Lunes 2 de enero") |
| Nombre carta           | No                    | Sí                            |
| Orientación            | No                    | Sí (badge "Invertida")        |
| Preview texto          | No                    | Sí (2 líneas truncadas)       |
| Indicador regeneración | No                    | Sí (badge)                    |
| Espacio utilizado      | 30%                   | 70%                           |
| Acciones               | 2 (ver, eliminar)     | 1 (ver completa)              |

### Análisis del Código

**Archivo:** `frontend/src/components/features/readings/ReadingCard.tsx`

```typescript
// Datos disponibles en Reading (pero NO usados en la UI):
interface Reading {
  id: number;
  spreadId: number;
  spreadName?: string; // ❌ No mostrado
  question: string; // ❌ No mostrado
  createdAt: string; // ✅ Solo fecha relativa
  cardsCount?: number; // ❌ No mostrado
  deletedAt?: string | null;
  shareToken?: string | null;
}

// Props del componente - recibe 'cards' pero casi nunca se pasa:
interface ReadingCardProps {
  reading: Reading;
  cards?: ReadingCard[]; // ❌ Opcional y no usado en la lista
  onView: (id: number) => void;
  onDelete: (id: number) => void;
}
```

**Problema raíz:** El componente `ReadingsHistory` NO pasa las cartas ni la pregunta porque el tipo `Reading` del listado ya las tiene, pero el componente no las renderiza.

---

## Diseño Propuesto

### Nueva Estructura de Tarjeta de Lectura

> **Alineado con DESIGN_HAND-OFF.md sección 3.4**

```
┌────────────────────────────────────────────────────────────────┐
│ ┌──────┐  "¿Qué puedo esperar en mi relación?"   [Cruz Celta] │
│ │ 🎴   │  ─────────────────────────────────────────────────── │
│ │      │  hace 2 días                                    [👁] │
│ └──────┘                                                      │
└────────────────────────────────────────────────────────────────┘
```

### Elementos del Nuevo Diseño (según DESIGN_HAND-OFF)

El documento `DESIGN_HAND-OFF.md` especifica:

> **Componente ReadingItem (tarjeta fila):**
>
> - Izquierda: Icono o miniatura de la carta principal revelada
> - Centro: Título grande (pregunta realizada), Fecha relativa ('hace 2 días') en gris
> - Derecha: Badge del tipo de tirada (ej: 'Cruz Celta') y botón icono 'Ver' (ojo o flecha)

Implementación propuesta:

1. **Miniatura carta** (izquierda) - Primera carta de la tirada o icono placeholder
2. **Pregunta grande** (centro, arriba) - Texto truncado a 2 líneas, font-semibold
3. **Fecha relativa** (centro, abajo) - "hace 2 días" en `text-muted`
4. **Badge tipo tirada** (derecha) - Nombre del spread (ej: "Cruz Celta", "3 Cartas")
5. **Botón Ver** (derecha) - Icono ojo para navegar al detalle
6. **Botón Eliminar** (derecha) - Icono papelera (adicional, no en diseño original pero necesario)

### Mejoras Adicionales

1. **Tarjetas compactas** - Reducir altura de ~150px a ~100px
2. **Hover mejorado** - Mostrar más info on hover (preview interpretación)
3. **Filtros mejorados** - Añadir filtro por tipo de spread
4. **Vista grid opcional** - Para usuarios con muchas lecturas

---

## Plan de Implementación

### TASK-UI-001: Modificar API para incluir datos de preview

**Tipo:** Backend
**Archivos:**

- `backend/tarot-app/src/modules/tarot/readings/domain/interfaces/reading-repository.interface.ts`
- `backend/tarot-app/src/modules/tarot/readings/infrastructure/repositories/typeorm-reading.repository.ts`
- `backend/tarot-app/src/modules/tarot/readings/application/services/readings-orchestrator.service.ts`

**Cambios:**

1. Modificar query de `findByUserId` para incluir relación con `cards` (primeras 3)
2. Añadir campo `cardPreviews` al DTO de respuesta del listado
3. Incluir `spreadName` en la respuesta (ya está en el tipo pero verificar que se retorna)

**Nuevo DTO de respuesta:**

```typescript
interface ReadingListItemDto {
  id: number;
  question: string;
  spreadId: number;
  spreadName: string;
  cardsCount: number;
  cardPreviews: Array<{
    id: number;
    name: string;
    imageUrl: string;
    isReversed: boolean;
  }>;
  createdAt: string;
  deletedAt?: string;
}
```

---

### TASK-UI-002: Actualizar tipos TypeScript en frontend ✅ COMPLETADA

**Estado:** ✅ Completada (13 enero 2026)
**Rama:** `feature/TASK-UI-002-reading-types`
**Tipo:** Frontend
**Archivos:**

- `frontend/src/types/reading.types.ts`
- `frontend/src/types/reading.types.test.ts` (NUEVO)
- `frontend/src/hooks/api/useReadings.test.tsx` (actualizado mocks)
- `frontend/src/lib/api/readings-api.test.ts` (actualizado mocks)

**Cambios realizados:**

1. ✅ Creada interfaz `CardPreview` para previews de cartas:

```typescript
export interface CardPreview {
  id: number;
  name: string;
  imageUrl: string;
  isReversed: boolean;
}
```

2. ✅ Extendida interfaz `Reading` con campos de preview:

```typescript
export interface Reading {
  id: number;
  spreadId: number;
  spreadName: string; // Cambiado de opcional a requerido
  question: string;
  createdAt: string;
  cardsCount: number; // Cambiado de opcional a requerido
  cardPreviews?: CardPreview[]; // Nuevo campo opcional
  deletedAt?: string | null;
  shareToken?: string | null;
}
```

3. ✅ Actualizados mocks en tests para incluir campos requeridos
4. ✅ Creados tests unitarios para validar tipos (12 tests)

**Resultados:**

- ✅ TypeCheck: 0 errores
- ✅ Lint: 0 errores
- ✅ Tests: 1846/1846 pasando (100%)
- ✅ Build: Exitoso

**Decisiones técnicas:**

- `cardPreviews` es opcional para mantener compatibilidad con backend mientras se implementa TASK-UI-001
- `spreadName` y `cardsCount` ahora requeridos para garantizar datos completos en listados

---

### TASK-UI-003: Rediseñar componente ReadingCard ✅ COMPLETADA

**Estado:** ✅ Completada (13 enero 2026)
**Rama:** `feature/TASK-UI-003-redesign-reading-card`
**Tipo:** Frontend
**Archivos:**

- `frontend/src/components/features/readings/ReadingCard.tsx`
- `frontend/src/components/features/readings/ReadingCard.test.tsx` (actualizado tests)

**Cambios realizados:**

1. ✅ Cambiado layout a horizontal (flex-row) permanente
2. ✅ Sección izquierda: Miniatura de carta (h-20 w-14) o placeholder icon
3. ✅ Sección centro: Pregunta (font-semibold, line-clamp-2) + fecha relativa (text-muted)
4. ✅ Sección derecha: Badge spread + botones ver/eliminar
5. ✅ Reducido padding y altura total
6. ✅ Usa cardPreviews de reading (TASK-UI-002) con fallback a cards prop
7. ✅ Optimizado con useMemo y useCallback para performance

**Resultados:**

- ✅ TypeCheck: 0 errores
- ✅ Lint: 0 errores
- ✅ Tests: 1847/1847 pasando (100%)
- ✅ Build: Exitoso
- ✅ Validación arquitectura: Exitosa

**Decisiones técnicas:**

- Eliminado responsive (flex-col/flex-row): Ahora siempre horizontal para consistencia
- Preferencia cardPreviews sobre cards prop para integración con TASK-UI-002
- Memoización de fecha relativa y callbacks para mejor performance
- Diseño alineado exactamente con DESIGN_HAND-OFF.md especificación

---

---

### TASK-UI-004: Crear componente CardThumbnails ✅ COMPLETADA

**Estado:** ✅ Completada (13 enero 2026)
**Rama:** `feature/TASK-UI-004-card-thumbnails`
**Tipo:** Frontend
**Archivos:**

- `frontend/src/components/features/readings/CardThumbnails.tsx` (NUEVO)
- `frontend/src/components/features/readings/CardThumbnails.test.tsx` (NUEVO)

**Descripción:**
Componente reutilizable que muestra miniaturas de cartas apiladas o en fila.

```typescript
interface CardThumbnailsProps {
  cards?: CardPreview[];
  max?: number; // Default 3
  size?: "sm" | "md"; // Default 'sm'
  stacked?: boolean; // Default true (cartas superpuestas)
}
```

**Cambios realizados:**

1. ✅ Componente con 4 variantes configurables (size, stacked, max)
2. ✅ Placeholder con icono Sparkles cuando no hay cartas
3. ✅ Indicador visual para cartas invertidas (badge con flecha)
4. ✅ Optimizado con useMemo para performance
5. ✅ Soporte para layout stacked (superpuestas) o row (fila)
6. ✅ JSDoc completo con ejemplos de uso
7. ✅ 16 tests unitarios con 100% coverage

**Resultados:**

- ✅ TypeCheck: 0 errores
- ✅ Lint: 0 errores
- ✅ Tests: 16/16 pasando (100%)
- ✅ Coverage: 100%
- ✅ Build: Exitoso
- ✅ Validación arquitectura: Exitosa

**Decisiones técnicas:**

- Usa `lucide-react` para icono Sparkles (placeholder)
- Memoización de `displayCards` y `sizeClasses` para evitar re-cálculos
- Design tokens del proyecto para colores (border-white, bg-secondary)
- z-index dinámico para efecto de apilado visual

---

### TASK-UI-005: Mejorar filtros del historial

**Tipo:** Frontend
**Archivos:**

- `frontend/src/components/features/readings/ReadingsHistory.tsx`

**Cambios:**

1. Añadir filtro por tipo de spread (dropdown)
2. Añadir toggle vista lista/grid (opcional)
3. Mejorar búsqueda para incluir nombre de spread

**Nuevo filtro:**

```typescript
const SPREAD_FILTER_OPTIONS = [
  { label: "Todas las tiradas", value: "all" },
  { label: "3 Cartas", value: "3-cards" },
  { label: "5 Cartas", value: "5-cards" },
  { label: "Cruz Celta", value: "celtic-cross" },
];
```

---

### TASK-UI-006: Actualizar tests

**Tipo:** Frontend
**Archivos:**

- `frontend/src/components/features/readings/ReadingCard.test.tsx`
- `frontend/src/components/features/readings/ReadingsHistory.test.tsx`
- `frontend/src/components/features/readings/CardThumbnails.test.tsx` (NUEVO)

**Cambios:**

1. Actualizar mocks con nuevos campos (cardPreviews, spreadName)
2. Añadir tests para CardThumbnails
3. Actualizar tests de ReadingCard para validar nuevos elementos
4. Añadir tests para nuevos filtros

---

### TASK-UI-007: (Opcional) Unificar historiales

**Tipo:** Full Stack
**Archivos:**

- `frontend/src/app/historial/page.tsx`
- `frontend/src/components/features/readings/ReadingsHistory.tsx`
- Backend endpoints (si se requiere nuevo endpoint unificado)

**Descripción:**
Evaluar si tiene sentido mostrar TODAS las lecturas (tarot + carta del día) en un solo historial con filtro por tipo.

**Consideraciones:**

- Ventaja: Una sola vista para todo el historial
- Desventaja: Complejidad de implementación, diferentes estructuras de datos
- Recomendación: Mantener separados pero con diseño consistente

---

## Priorización

| Task        | Prioridad | Complejidad | Impacto UX |
| ----------- | --------- | ----------- | ---------- |
| TASK-UI-003 | Alta      | Media       | Alto       |
| TASK-UI-004 | Alta      | Baja        | Alto       |
| TASK-UI-001 | Alta      | Media       | Alto       |
| TASK-UI-002 | Alta      | Baja        | Medio      |
| TASK-UI-006 | Media     | Baja        | Bajo       |
| TASK-UI-005 | Baja      | Media       | Medio      |
| TASK-UI-007 | Baja      | Alta        | Medio      |

**Orden de implementación recomendado:**

1. TASK-UI-001 (Backend - datos necesarios)
2. TASK-UI-002 (Frontend - tipos)
3. TASK-UI-004 (Frontend - componente helper)
4. TASK-UI-003 (Frontend - rediseño principal)
5. TASK-UI-006 (Tests)
6. TASK-UI-005 (Filtros mejorados - opcional)
7. TASK-UI-007 (Unificación - evaluar después)

---

## Mockup Visual (ASCII)

### Estado Actual (Problema)

```
┌──────────────────────────────────────────────────────────┐
│  ┌────┐                                                  │
│  │ 📚 │   hace 2 días                           [👁][🗑] │
│  └────┘   (sin pregunta, sin badge de tirada)            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Estado Propuesto (Alineado con DESIGN_HAND-OFF.md)

```
┌──────────────────────────────────────────────────────────┐
│ ┌─────┐  "¿Qué puedo esperar en mi trabajo?"            │
│ │ 🎴  │   hace 2 días              [Cruz Celta] [👁][🗑] │
│ └─────┘                                                  │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ ┌─────┐  "¿Cómo mejorar mi relación de pareja?"         │
│ │ 🎴  │   hace 4 días              [3 Cartas]   [👁][🗑] │
│ └─────┘                                                  │
└──────────────────────────────────────────────────────────┘
```

> **Nota:** El diseño sigue exactamente la especificación del DESIGN_HAND-OFF.md:
>
> - Izquierda: Miniatura de carta
> - Centro: Pregunta (título grande) + fecha relativa (gris)
> - Derecha: Badge tipo tirada + botón ver

---

## Métricas de Éxito

1. **Reducción de scroll:** -40% en scroll necesario para ver misma cantidad de lecturas
2. **Identificación de lectura:** Usuario puede identificar lectura específica sin abrir
3. **Consistencia visual:** Mismo estilo que `/carta-del-dia/historial`
4. **Densidad de información:** 3x más info visible por tarjeta

---

## Referencias

- **Componente modelo:** `frontend/src/components/features/daily-reading/DailyReadingCard.tsx`
- **Plan anterior:** `docs/HISTORY_RETENTION_PLAN.md`
- **Capturas:** `.playwright-mcp/historial-*.png`
