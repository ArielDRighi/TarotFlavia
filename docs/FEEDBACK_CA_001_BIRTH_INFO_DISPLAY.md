# FEEDBACK Carta Astral — Backlog de Correcciones UX/UI

**Módulo:** Carta Astral
**Fecha de reporte:** 23 de febrero de 2026
**Reportado por:** Ariel (Product Owner)

---

## Índice de Feedbacks

| ID | Descripción | Tipo | Prioridad | Tareas |
|----|-------------|------|-----------|--------|
| FB-CA-001 | Carta guardada muestra fecha de creación en lugar de datos de nacimiento | Bug / UX | High | T-CA-051 (Backend), T-CA-052 (Frontend) |
| FB-CA-002 | Gráfico SVG web muestra elementos superpuestos + botón "Descargar SVG" a eliminar | Bug / UX | High | T-CA-053 (Frontend) |

---

## FB-CA-001: Carta Guardada — Mostrar Datos de Nacimiento en Lugar de Fecha de Creación

**Tipo:** Bug / UX Fix
**Prioridad:** High

---

### Descripción del Problema

En la página de detalle de una carta astral guardada (`/carta-astral/resultado/[id]`), debajo del nombre de la persona se muestra la **fecha de creación** de la carta:

> _"Guardada el 23 de febrero de 2026"_

Esta información es **irrelevante para el usuario** en ese contexto. Lo que el usuario necesita ver son los **datos de nacimiento** con los que se generó la carta: fecha, hora y lugar de nacimiento.

---

### Comparación de Comportamiento

| Página | URL | Subtítulo actual | Comportamiento esperado |
|--------|-----|-----------------|------------------------|
| Resultado de carta nueva | `/carta-astral/resultado` | `15 de agosto de 1990 • 14:30 • Buenos Aires, Argentina` | ✅ Correcto |
| Detalle de carta guardada | `/carta-astral/resultado/[id]` | `Guardada el 23 de febrero de 2026` | ❌ Incorrecto |

---

### Análisis Técnico

#### Causa raíz

El problema tiene **dos capas**: backend y frontend.

#### 1. Backend — `getChartById` no devuelve datos de nacimiento

**Archivo:** [`birth-chart-history.service.ts`](../backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-history.service.ts)

El método `getChartById` (líneas 69–170) construye el objeto de respuesta (`PremiumChartResponseDto`) e incluye `name` y `createdAt`, pero **omite** `birthDate`, `birthTime` y `birthPlace`, a pesar de que la entidad `BirthChart` los tiene guardados.

```typescript
// ❌ Estado actual — datos de nacimiento NO incluidos en la respuesta
return {
  success: true,
  // ... (planets, houses, aspects, bigThree, etc.)
  name: chart.name,
  createdAt: chart.createdAt.toISOString(),
  // ❌ Faltan: birthDate, birthTime, birthPlace
};
```

**Archivo:** [`chart-response.dto.ts`](../backend/tarot-app/src/modules/birth-chart/application/dto/chart-response.dto.ts)

`PremiumChartResponseDto` tiene `name` y `createdAt` como campos opcionales, pero **no define** `birthDate`, `birthTime` ni `birthPlace`.

#### 2. Frontend — `SavedChartPageContent.tsx` muestra `createdAt`

**Archivo:** [`SavedChartPageContent.tsx`](../frontend/src/components/features/birth-chart/SavedChartPageContent/SavedChartPageContent.tsx) (líneas 274–281)

```tsx
// ❌ Estado actual — muestra fecha de creación
<p className="text-muted-foreground mt-1">
  Guardada el{' '}
  {formatTimestampLocalized(chart.createdAt, 'es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}
</p>
```

**Archivo:** [`birth-chart-api.types.ts`](../frontend/src/types/birth-chart-api.types.ts) (líneas 70–73)

`SavedChartResponse` extiende `PremiumChartResponse` y agrega solo `name` y `createdAt`, sin `birthDate`, `birthTime` ni `birthPlace`.

#### 3. Patrón correcto (referencia)

**Archivo:** [`ChartResultPageContent.tsx`](../frontend/src/components/features/birth-chart/ChartResultPageContent/ChartResultPageContent.tsx) (líneas 147–153)

```tsx
// ✅ Patrón correcto en página de resultado nuevo
<p className="text-muted-foreground mt-1">
  {parseDateString(formData.birthDate).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}{' '}
  • {formData.birthTime} • {formData.birthPlace}
</p>
```

---

### Solución Propuesta

### Backend (T-CA-051)

1. Agregar `birthDate`, `birthTime`, `birthPlace` como campos opcionales en `PremiumChartResponseDto`
2. Mapear esos campos desde la entidad `BirthChart` en `getChartById`
3. Actualizar tests del servicio y DTO

### Frontend (T-CA-052)

1. Agregar `birthDate`, `birthTime`, `birthPlace` a `SavedChartResponse` en `birth-chart-api.types.ts`
2. Reemplazar el subtítulo en `SavedChartPageContent.tsx` para mostrar datos de nacimiento, siguiendo el patrón de `ChartResultPageContent.tsx`
3. Actualizar tests del componente

---

### Tareas

### T-CA-051: [Backend] Incluir datos de nacimiento en respuesta de carta guardada

**Tipo:** Fix
**Módulo:** Backend — `birth-chart`
**Prioridad:** High
**Estimación:** 1h
**Dependencias:** Ninguna
**Estado:** ✅ COMPLETADA

#### Descripción

Agregar `birthDate`, `birthTime` y `birthPlace` a la respuesta del endpoint `GET /birth-chart/history/:id`, para que el frontend pueda mostrar los datos de nacimiento en la página de detalle de una carta guardada.

#### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `backend/tarot-app/src/modules/birth-chart/application/dto/chart-response.dto.ts` | Agregar `birthDate`, `birthTime`, `birthPlace` como campos opcionales en `PremiumChartResponseDto` |
| `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-history.service.ts` | Mapear `chart.birthDate`, `chart.birthTime`, `chart.birthPlace` en el objeto retornado por `getChartById` |

#### Subtareas

- [x] Leer `WORKFLOW_BACKEND.md` antes de implementar
- [x] En `PremiumChartResponseDto` agregar:
  ```typescript
  @ApiProperty({ example: '1990-05-15', description: 'Fecha de nacimiento (formato YYYY-MM-DD)', required: false })
  birthDate?: string;

  @ApiProperty({ example: '14:30', description: 'Hora de nacimiento (formato HH:mm)', required: false })
  birthTime?: string;

  @ApiProperty({ example: 'Buenos Aires, Argentina', description: 'Lugar de nacimiento', required: false })
  birthPlace?: string;
  ```
- [x] En `getChartById` del servicio, dentro del objeto retornado, agregar el mapeo de los campos desde la entidad `BirthChart`:
  ```typescript
  birthDate: typeof chart.birthDate === 'string'
    ? chart.birthDate
    : chart.birthDate.toISOString().split('T')[0],
  birthTime: chart.birthTime.substring(0, 5), // HH:mm (sin segundos)
  birthPlace: chart.birthPlace,
  ```
- [x] Actualizar el test unitario de `birth-chart-history.service.spec.ts` para verificar que `getChartById` retorna los tres nuevos campos
- [x] Actualizar el test de `chart-response.dto.spec.ts` si aplica
- [x] Ejecutar ciclo de calidad completo:
  - [x] `npm run format`
  - [x] `npm run lint`
  - [x] `npm run test:cov` (coverage ≥ 80%)
  - [x] `npm run build`
  - [x] `node scripts/validate-architecture.js`
- [x] Actualizar backlog (marcar completada)
- [x] Commit y PR → `develop`

#### Criterios de aceptación

1. ✅ `GET /birth-chart/history/:id` retorna `birthDate` (formato `YYYY-MM-DD`), `birthTime` (formato `HH:mm`) y `birthPlace` (string)
2. ✅ Los campos son opcionales para no romper retrocompatibilidad
3. ✅ Tests pasan con coverage ≥ 80% (81.99% statements)
4. ✅ Build exitoso

---

### T-CA-052: [Frontend] Mostrar datos de nacimiento en página de carta guardada

**Tipo:** Fix
**Módulo:** Frontend — `birth-chart`
**Prioridad:** High
**Estimación:** 1h
**Dependencias:** T-CA-051 (backend debe retornar los nuevos campos)
**Estado:** ✅ COMPLETADA

#### Descripción

Reemplazar el subtítulo "Guardada el [fecha de creación]" en la página de detalle de carta guardada (`/carta-astral/resultado/[id]`) por los datos de nacimiento: fecha, hora y lugar de nacimiento, siguiendo el mismo patrón visual de la página de resultado recién generada.

#### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `frontend/src/types/birth-chart-api.types.ts` | Agregar `birthDate`, `birthTime`, `birthPlace` a `SavedChartResponse` |
| `frontend/src/components/features/birth-chart/SavedChartPageContent/SavedChartPageContent.tsx` | Reemplazar subtítulo de creación por datos de nacimiento |

#### Subtareas

- [x] Leer `WORKFLOW_FRONTEND.md` antes de implementar
- [x] En `birth-chart-api.types.ts`, actualizar `SavedChartResponse`:
  ```typescript
  export interface SavedChartResponse extends PremiumChartResponse {
    name: string;
    createdAt: string;
    birthDate?: string; // YYYY-MM-DD
    birthTime?: string; // HH:mm
    birthPlace?: string;
  }
  ```
- [x] En `SavedChartPageContent.tsx`, reemplazar el bloque del subtítulo (líneas 274–281):
  ```tsx
  // ❌ ELIMINAR
  <p className="text-muted-foreground mt-1">
    Guardada el{' '}
    {formatTimestampLocalized(chart.createdAt, 'es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}
  </p>

  // ✅ REEMPLAZAR POR (si hay datos de nacimiento disponibles)
  {(chart.birthDate || chart.birthTime || chart.birthPlace) && (
    <p className="text-muted-foreground mt-1">
      {chart.birthDate &&
        parseDateString(chart.birthDate).toLocaleDateString('es-AR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      {chart.birthTime && ` • ${chart.birthTime}`}
      {chart.birthPlace && ` • ${chart.birthPlace}`}
    </p>
  )}
  ```
- [x] Agregar import de `parseDateString` desde `@/lib/utils/date` si no está presente
- [x] Verificar que el import de `formatTimestampLocalized` puede eliminarse si ya no se usa en el componente (o mantenerlo si se usa en otro lugar del archivo)
- [x] Actualizar/agregar tests en `SavedChartPageContent.test.tsx` (si existe) para verificar que:
  - Se muestran los datos de nacimiento cuando están disponibles
  - No se muestra la fecha de creación
- [x] Ejecutar ciclo de calidad completo:
  - [x] `npm run format`
  - [x] `npm run lint:fix`
  - [x] `npm run type-check`
  - [x] `npm run test:run`
  - [x] `npm run build`
  - [x] `node scripts/validate-architecture.js`
- [x] Actualizar backlog (marcar completada)
- [x] Commit y PR → `develop`

#### Criterios de aceptación

1. ✅ La página `/carta-astral/resultado/[id]` muestra debajo del nombre: `15 de agosto de 1990 • 14:30 • Buenos Aires, Argentina`
2. ✅ El formato visual es consistente con la página de resultado recién generada
3. ✅ Si algún campo no está disponible, se omite gracefully (sin errores)
4. ✅ La fecha de creación ya no aparece en el subtítulo del título
5. ✅ Tests pasan con coverage ≥ 80%
6. ✅ Build y type-check exitosos

---

### Resumen de Impacto

| Capa | Archivos afectados | Complejidad |
|------|--------------------|-------------|
| Backend DTO | `chart-response.dto.ts` | Baja — agregar 3 campos opcionales |
| Backend Service | `birth-chart-history.service.ts` | Baja — mapear 3 campos en `getChartById` |
| Backend Tests | `birth-chart-history.service.spec.ts` | Baja — actualizar mock de respuesta |
| Frontend Types | `birth-chart-api.types.ts` | Baja — agregar 3 campos opcionales a interfaz |
| Frontend Component | `SavedChartPageContent.tsx` | Baja — reemplazar ~8 líneas de JSX |
| Frontend Tests | `SavedChartPageContent.test.tsx` | Baja — actualizar/agregar casos de prueba |

**Riesgo:** Muy bajo. Cambio aditivo (nuevos campos opcionales) + sustitución de display en un solo componente. No rompe ningún contrato existente.

---

### Notas de Implementación

- Los campos son **opcionales** (`?`) en ambos lados (DTO backend y tipo frontend) para mantener retrocompatibilidad con respuestas existentes que no incluyan esos campos.
- El formato de `birthTime` en la entidad se guarda como `HH:mm:ss`. Al retornarlo, truncar a `HH:mm` con `substring(0, 5)`.
- El formato de `birthDate` en la entidad es un `Date` de TypeScript. Convertir a string `YYYY-MM-DD` antes de retornar.
- En el frontend, usar `parseDateString` (ya importado en `ChartResultPageContent.tsx`) para formatear la fecha de nacimiento al español.

---

## FB-CA-002: Gráfico SVG Web con Elementos Superpuestos + Eliminar Botón "Descargar SVG"

**Tipo:** Bug + UX Fix
**Prioridad:** High

---

### Descripción del Problema

El gráfico circular de carta astral (`ChartWheel`) renderizado en la web presenta **símbolos de planetas y casas superpuestos**, haciendo el gráfico ilegible cuando varios planetas están en posiciones cercanas. En contraste, el gráfico del **PDF se genera correctamente** con elementos bien espaciados.

Adicionalmente, existe un botón **"Descargar SVG"** en el encabezado del gráfico que debe eliminarse de la interfaz.

---

### Comparación de Comportamiento

| Versión | Estado | Descripción |
|---------|--------|-------------|
| Web (`ChartWheel.tsx`) | ❌ Incorrecto | Símbolos de planetas superpuestos, ilegibles |
| PDF (`chart-pdf.service.ts`) | ✅ Correcto | Elementos bien espaciados, legibles |

---

### Análisis Técnico

#### Causa raíz — Elementos superpuestos en el gráfico web

El gráfico web usa la librería `@astrodraw/astrochart`. La configuración en [astrochart.config.ts](../frontend/src/components/features/birth-chart/lib/astrochart.config.ts) tiene dos problemas principales:

**1. `SYMBOL_SCALE: 1.2` — símbolos demasiado grandes**

El scale de 1.2x infla los símbolos un 20% sobre el tamaño base de la librería. Cuando dos o más planetas están en la misma casa o a pocos grados de distancia, sus símbolos se solapan inevitablemente.

```typescript
// ❌ Estado actual en CHART_SETTINGS
SYMBOL_SCALE: 1.2,  // 20% más grande → causa solapamiento
```

**2. `MARGIN: 50` — margen excesivo para el tamaño de chart usado**

El `ChartWheel` se renderiza a `size=400` en ambas páginas de carta (guardada y resultado). Con `MARGIN: 50`, el área efectiva de renderizado es solo `400 - 2×50 = 300px`, comprimiendo todos los anillos concéntricos y aumentando las colisiones.

```typescript
// ❌ Estado actual
MARGIN: 50,   // 50px de margen en un chart de 400px = área efectiva 300px
PADDING: 18,  // padding entre anillos
```

**Ambos valores se heredan** en `CHART_SETTINGS_LIGHT` (modo claro, el que se usa por defecto cuando el tema es claro) vía spread operator, por lo que el fix aplica a los dos modos.

#### Causa raíz — Botón "Descargar SVG"

En [ChartWheel.tsx](../frontend/src/components/features/birth-chart/ChartWheel/ChartWheel.tsx) (líneas 126–144), el bloque `showControls` renderiza un botón que descarga el SVG del gráfico. Este botón no se necesita en la UI del usuario final.

```tsx
// ❌ Botón a eliminar (líneas 132–143)
<Button
  variant="outline"
  size="sm"
  onClick={handleExport}
  disabled={!isRendered || !!error}
  data-testid="export-button"
>
  <Download className="mr-2 h-4 w-4" />
  Descargar SVG
</Button>
```

#### Por qué el PDF no tiene este problema

El PDF usa `renderChartWheel` en [`chart-pdf.service.ts`](../backend/tarot-app/src/modules/birth-chart/application/services/chart-pdf.service.ts) — un renderizador **completamente distinto**, dibujado manualmente con PDFKit. Calcula radios y posiciones proporcionales al `radius` recibido, distribuye los símbolos en arcos y gestiona el espaciado manualmente. No depende de `@astrodraw/astrochart` ni de sus configuraciones.

---

### Solución Propuesta

#### 1. Corregir configuración de `astrochart.config.ts`

Reducir `SYMBOL_SCALE` y `MARGIN` en `CHART_SETTINGS` (aplica automáticamente a `CHART_SETTINGS_LIGHT` por herencia via spread):

```typescript
// ✅ Valores corregidos
SYMBOL_SCALE: 0.8,  // Reducido de 1.2 → símbolos más pequeños, menos colisiones
MARGIN: 30,         // Reducido de 50 → más área útil de renderizado
PADDING: 12,        // Reducido de 18 → mejor distribución de anillos
```

#### 2. Limpiar `ChartWheel.tsx` — eliminar botón y código asociado

- Eliminar el botón "Descargar SVG" del JSX
- Eliminar la función `handleExport` (líneas 95–111)
- Eliminar el prop `onExport` de la interfaz `ChartWheelProps` (no se usa en ninguna página)
- Eliminar el import de `Download` de `lucide-react` si queda sin uso
- Si al eliminar el botón el bloque `showControls` solo muestra el texto de estado ("Gráfico renderizado"), evaluar si tiene valor para el usuario y simplificar o eliminar ese bloque también
- Actualizar el tipo de retorno de `useChartWheel` para eliminar `exportSvg` si ya no se usa

---

### Tarea

### T-CA-053: [Frontend] Corregir superposición del gráfico SVG y eliminar botón "Descargar SVG"

**Tipo:** Bug Fix + UX Fix
**Módulo:** Frontend — `birth-chart`
**Prioridad:** High
**Estimación:** 1.5h
**Dependencias:** Ninguna
**Estado:** ✅ COMPLETADA

#### Descripción

Corregir los valores de configuración de `@astrodraw/astrochart` que causan superposición de elementos en el gráfico web, y eliminar el botón "Descargar SVG" del componente `ChartWheel`.

#### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `frontend/src/components/features/birth-chart/lib/astrochart.config.ts` | Ajustar `SYMBOL_SCALE`, `MARGIN` y `PADDING` en `CHART_SETTINGS` |
| `frontend/src/components/features/birth-chart/ChartWheel/ChartWheel.tsx` | Eliminar botón SVG, `handleExport`, prop `onExport` e import `Download` |
| `frontend/src/components/features/birth-chart/ChartWheel/ChartWheel.hooks.ts` | Eliminar `exportSvg` del return si ya no tiene uso externo |

#### Subtareas

- [x] Leer `WORKFLOW_FRONTEND.md` antes de implementar
- [x] **En `astrochart.config.ts`**: modificar `CHART_SETTINGS`:
  ```typescript
  SYMBOL_SCALE: 0.8,  // era 1.2
  MARGIN: 30,         // era 50
  PADDING: 12,        // era 18
  ```
  > Nota: `CHART_SETTINGS_LIGHT` hereda estos valores vía spread, por lo que se corrige automáticamente. `CHART_SETTINGS_PDF` tiene sus propios valores y **no debe tocarse**.
- [x] **En `ChartWheel.tsx`**:
  - Eliminar el `<Button>` "Descargar SVG" (líneas 132–143)
  - Eliminar la función `handleExport` (líneas 95–111)
  - Eliminar el prop `onExport?: (svg: string) => void` de `ChartWheelProps`
  - Eliminar `onExport` del destructuring en la firma del componente
  - Eliminar `exportSvg` del destructuring del hook `useChartWheel`
  - Eliminar el import `Download` de `lucide-react` (verificar que no se use en otro lugar del archivo)
  - Evaluar si el bloque `showControls` (que quedaría solo con el texto de estado) sigue siendo útil; si no, eliminar el bloque y el prop `showControls`
- [x] **En `ChartWheel.hooks.ts`**:
  - Eliminar `exportSvg` del objeto retornado por `useChartWheel`
  - Eliminar la función `exportSvg` (líneas 136–149)
  - Actualizar la interfaz `UseChartWheelReturn` para remover `exportSvg`
- [x] Verificar en `ChartWheel.test.tsx` que los tests que referencian `export-button` o `exportSvg` se actualicen o eliminen
- [x] Verificar visualmente (si es posible) que los símbolos del gráfico ya no se superponen con los nuevos valores de configuración
- [x] Ejecutar ciclo de calidad completo:
  - [x] `npm run format`
  - [x] `npm run lint:fix`
  - [x] `npm run type-check`
  - [x] `npm run test:run`
  - [x] `npm run build`
  - [x] `node scripts/validate-architecture.js`
- [x] Actualizar backlog (marcar completada)
- [x] Commit y PR → `develop`

#### Criterios de aceptación

1. Los símbolos de planetas y casas en el gráfico web no se superponen (o la superposición es mínima y tolerable cuando planetas están en conjunción exacta)
2. El botón "Descargar SVG" ya no aparece en el gráfico
3. El gráfico del PDF **no se ve afectado** (usa configuración independiente `CHART_SETTINGS_PDF`)
4. No hay imports sin uso (`Download`, `exportSvg`)
5. Tests pasan, build y type-check exitosos

---

### Resumen de Impacto

| Capa | Archivos afectados | Complejidad |
|------|--------------------|-------------|
| Config librería | `astrochart.config.ts` | Baja — 3 valores numéricos |
| Componente | `ChartWheel.tsx` | Baja — eliminar ~25 líneas |
| Hook | `ChartWheel.hooks.ts` | Baja — eliminar función `exportSvg` |
| Tests | `ChartWheel.test.tsx` | Baja — actualizar/eliminar casos del botón |

**Riesgo:** Muy bajo. Los cambios de config solo afectan el renderizado visual del gráfico web. El PDF usa su propio renderizador y no se ve afectado.

### Notas de Implementación

- Los valores `SYMBOL_SCALE: 0.8`, `MARGIN: 30`, `PADDING: 12` son un punto de partida. Si tras aplicarlos el gráfico sigue mostrando colisiones o los símbolos se ven demasiado pequeños, ajustar iterativamente dentro del rango `SYMBOL_SCALE: 0.7–1.0`, `MARGIN: 25–40`.
- La librería `@astrodraw/astrochart` **no tiene collision avoidance nativo** para planetas en conjunción. Cuando dos planetas están en el mismo grado, siempre habrá cierta superposición. El objetivo es minimizarla para casos normales donde los planetas están a varios grados de distancia.
- El prop `showControls` se pasa como `showControls={true}` explícitamente en `ChartResultPageContent.tsx`. Si se elimina el prop, asegurarse de limpiar esa referencia también.
