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
| FB-CA-003 | Geocoding con Nominatim: localidades sin resultados, duplicados, coordenadas no confiables | Bug / Mejora Crítica | Critical | T-CA-054 (Backend) — Photon+Nominatim, T-CA-055 (Frontend) |
| FB-CA-004 | Falta botón "Nueva carta" en página de carta guardada | UX | Medium | T-CA-056 (Frontend) |

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

---

## FB-CA-003: Geocoding — Localidades sin Resultados, Duplicados y Coordenadas No Confiables

**Tipo:** Bug / Mejora Crítica
**Prioridad:** Critical
**Impacto:** Alto — coordenadas incorrectas producen cartas astrales erróneas (especialmente el Ascendente)

---

### Descripción del Problema

El sistema de autocompletado de "Lugar de nacimiento" presenta tres problemas graves:

1. **Localidades pequeñas sin resultados** — Lugares como *Campamento Vespucio* o *General Enrique Mosconi* (Salta, Argentina) no aparecen entre las sugerencias.
2. **Resultados duplicados** — Al escribir "Salta" o "Córdoba", aparecen dos o más opciones visualmente idénticas mezcladas con resultados irrelevantes.
3. **Coordenadas no confiables** — Para carta astral, coordenadas imprecisas afectan directamente el cálculo del Ascendente y las cúspides de casas. Un error de pocos kilómetros puede cambiar el Ascendente varios minutos de arco.

---

### Análisis Técnico — Fuente actual de datos

#### API usada: Nominatim (OpenStreetMap) — Gratuita, sin API key

**Archivo:** [`geocode.service.ts`](../backend/tarot-app/src/modules/birth-chart/application/services/geocode.service.ts)

```typescript
// Estado actual — Nominatim sin filtros de calidad
private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Query sin filtros de tipo de lugar:
params: {
  q: query,
  format: 'json',
  addressdetails: 1,
  limit: 5,
  'accept-language': 'es',
}
```

#### Causa de cada problema

**Problema 1 — Localidades pequeñas sin resultados:**
Nominatim depende de la cobertura de colaboradores de OpenStreetMap. Muchas localidades rurales o semi-urbanas de Argentina (especialmente en el norte) tienen cobertura parcial o nula. *General Enrique Mosconi* y *Campamento Vespucio* son localidades del departamento Gral. San Martín, Salta, con escasa presencia en OSM.

**Problema 2 — Resultados duplicados:**
Nominatim devuelve múltiples objetos OSM para el mismo topónimo (la ciudad capital, la provincia, el departamento, el municipio, el barrio, etc.). Por ejemplo, para "Salta" retorna:
- `Salta` (ciudad capital) → type: `city`
- `Salta` (provincia) → type: `administrative`
- `Salta` (departamento) → type: `administrative`

La función `extractCity` del servicio solo usa `address.city || address.town || ...`, por lo que todos estos resultados muestran el mismo texto en el dropdown del frontend.

**Problema 3 — Timezone como fallback por longitud:**
Si no hay `TIMEZONEDB_API_KEY` configurada, el servicio usa `estimateTimezoneByLongitude()` que redondea a horas completas (`Etc/GMT+3`), perdiendo la información de zona horaria IANA real (ej: `America/Argentina/Salta`). Esto afecta el cálculo del tiempo sidéreo y por ende la posición del Ascendente.

---

### Solución Propuesta — Migrar a Photon (Komoot) con Nominatim como fallback

Para una aplicación con alta carga de usuarios free, Google Places API no es sostenible: a partir de ~170 DAU el free tier ($200/mes) ya se supera (~$0.034/búsqueda única, incluyendo Autocomplete + Place Details). La solución óptima para usuarios free es **Photon (Komoot)** como fuente primaria.

#### Comparativa de opciones

| Herramienta | Cobertura AR rural | Duplicados | Costo real | API Key |
|-------------|-------------------|------------|------------|---------|
| **Nominatim (actual)** | Baja | Sí (sin filtros) | Gratis | No |
| **Photon/Komoot (propuesto)** | Media-Alta | Mínimos | **Gratis** | **No** |
| Google Places API | Excelente | No | ~$0.034/búsqueda única → +$200/mes con >170 DAU | Sí |
| Mapbox Geocoding | Buena | Ocasionales | 100k req/mes gratis, luego $0.75/1000 | Sí |

**Photon** es un geocoder open-source de Komoot que usa los mismos datos OSM pero con **Elasticsearch**, lo que resulta en búsquedas mucho más precisas, soporte de acentos y mejor cobertura de localidades pequeñas argentinas. Es completamente gratuito, no requiere API key y puede auto-hostearse.

#### Arquitectura propuesta

```
Frontend (PlaceAutocomplete)
  → Llama al backend: GET /birth-chart/geocode/search?q=...
      → Backend (GeocodeService)
           → Photon API (Komoot)  ← NUEVA implementación primaria (gratis)
             → OK: retornar resultados de Photon
             → ERROR: fallback automático a Nominatim
           → Nominatim (OSM)      ← fallback (ya implementado)
           → TimeZoneDB API       ← timezone, sin cambios
           → Cache                ← sin cambios
```

**La interfaz pública del backend no cambia** — el endpoint y el `GeocodeSearchResponseDto` se mantienen. El cambio es interno al servicio.

---

### Tareas

#### T-CA-054: [Backend] Migrar geocoding a Photon (Komoot) con Nominatim como fallback

**Estado:** ✅ COMPLETADA

**Tipo:** Mejora Crítica
**Módulo:** Backend — `birth-chart/geocode`
**Prioridad:** Critical
**Estimación:** 3h
**Dependencias:** Ninguna (sin API key requerida)

##### Descripción

Reemplazar Nominatim por **Photon (Komoot)** como fuente primaria de geocoding, manteniendo Nominatim como fallback automático. Photon usa los mismos datos OSM pero con Elasticsearch, ofreciendo búsquedas más precisas, sin duplicados y mejor cobertura de localidades pequeñas argentinas — **completamente gratis y sin API key**. El contrato público (endpoint y DTOs) no cambia.

##### Estrategia Híbrida (Photon primario + Nominatim fallback)

```
searchPlaces(query):
  1. Llamar Photon API (Komoot) — siempre, sin condición
     → OK:    retornar resultados de Photon
     → ERROR: log.warn("Photon failed, falling back to Nominatim") → Nominatim
```

**Ventajas:**
- Costo cero en cualquier volumen de usuarios free
- Sin API key, sin límites publicados (fair use)
- Mejor cobertura que Nominatim para localidades pequeñas argentinas
- Sin duplicados (Photon devuelve un resultado por entidad, no múltiples objetos OSM del mismo topónimo)
- El contrato del endpoint no cambia para el frontend en ningún caso
- Auto-hosteable en el futuro si se necesita control total

##### Photon API

```
GET https://photon.komoot.io/api/
Params: q=<query>, lang=es, limit=5, osm_tag=place:city, osm_tag=place:town, osm_tag=place:village
```

Ejemplo de respuesta (GeoJSON FeatureCollection):
```json
{
  "features": [{
    "geometry": { "coordinates": [-65.4095, -24.7859] },
    "properties": {
      "osm_id": 12345,
      "osm_type": "N",
      "name": "Salta",
      "country": "Argentina",
      "state": "Salta",
      "type": "city",
      "extent": [-65.5, -24.9, -65.3, -24.7]
    }
  }]
}
```

##### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `backend/tarot-app/src/modules/birth-chart/application/services/geocode.service.ts` | Agregar `searchWithPhoton()`, refactorizar `searchPlaces()` con lógica híbrida |

##### Subtareas

- [x] Leer `WORKFLOW_BACKEND.md` antes de implementar
- [x] Agregar interfaz `PhotonFeature` para tipar la respuesta GeoJSON de Photon:
  ```typescript
  interface PhotonFeature {
    geometry: { coordinates: [number, number] };
    properties: {
      osm_id: number;
      osm_type: string;
      name: string;
      country?: string;
      state?: string;
      city?: string;
      type?: string;
    };
  }
  ```
- [x] Implementar método privado `searchWithPhoton(query)`:
  - URL: `https://photon.komoot.io/api/`
  - Params: `{ q: query, lang: 'es', limit: 5 }`
  - Headers: `{ 'User-Agent': 'Auguria/1.0 (contact@auguria.com)' }`
  - Mapear cada feature al `GeocodedPlaceDto` existente:
    - `placeId`: `photon_${feature.properties.osm_type}_${feature.properties.osm_id}`
    - `displayName`: construir como `${name}, ${state}, ${country}` (con los campos disponibles)
    - `city`: `feature.properties.name`
    - `country`: `feature.properties.country || ''`
    - `latitude`: `feature.geometry.coordinates[1]`
    - `longitude`: `feature.geometry.coordinates[0]`
    - `timezone`: seguir usando `getTimezone()` existente (sin cambio)
- [x] Refactorizar `searchPlaces()` con lógica híbrida:
  ```typescript
  async searchPlaces(query: string): Promise<GeocodeSearchResponseDto> {
    const cached = await this.cacheService.getSearchResults(query);
    if (cached) return { results: cached, count: cached.length };

    try {
      return await this.searchWithPhoton(query);
    } catch (error) {
      this.logger.warn(`Photon geocoding failed, using Nominatim fallback: ${error.message}`);
      return await this.searchWithNominatim(query);
    }
  }
  ```
- [x] Renombrar la lógica actual de Nominatim a método privado `searchWithNominatim(query)` (mantener sin cambios funcionales)
- [x] Mantener el caché existente (`GeocodeCacheService`), rate limiting de Nominatim y `NominatimResult` sin cambios
- [x] Actualizar tests de `geocode.service.spec.ts`:
  - Test: Photon OK → retorna resultados de Photon
  - Test: Photon falla → hace fallback a Nominatim
  - Test: resultado de Photon mapeado correctamente al `GeocodedPlaceDto`
- [x] Ejecutar ciclo de calidad completo
- [x] Actualizar backlog y crear PR → `develop`

##### Criterios de aceptación

1. Buscar "Salta" devuelve máximo 1 resultado por ciudad (sin duplicados del tipo city/administrative)
2. Buscar "Córdoba" diferencia "Córdoba, Córdoba, Argentina" de otras homónimas
3. El endpoint `GET /birth-chart/geocode/search` sigue funcionando con el mismo contrato
4. Si Photon falla, el servicio continúa funcionando con Nominatim (sin error 500)
5. Tests pasan con coverage ≥ 80%
6. Build exitoso

---

#### T-CA-055: [Frontend] Mejorar display del autocomplete para mostrar resultados diferenciados

**Tipo:** UX Fix
**Módulo:** Frontend — `birth-chart`
**Prioridad:** High
**Estimación:** 1h
**Dependencias:** T-CA-054 (los nuevos resultados de Photon ya vienen diferenciados por `displayName` completo)

##### Descripción

Ajustar `PlaceAutocomplete.tsx` para aprovechar la estructura mejorada de los resultados de Photon, mostrando subtítulos más informativos en cada opción del dropdown (ej: `"Salta, Salta, Argentina"`) para ayudar al usuario a distinguir entre resultados con nombres similares.

##### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `frontend/src/components/features/birth-chart/PlaceAutocomplete/PlaceAutocomplete.tsx` | Mejorar display de cada resultado en la lista |

##### Cambio en el dropdown (cada opción)

```tsx
// ✅ MEJORADO — mostrar nombre completo de la ciudad + país + timezone
<span className="text-sm font-medium">
  {place.city || place.displayName.split(',')[0]?.trim()}
</span>
<span className="text-muted-foreground text-xs">
  {place.displayName}  {/* nombre completo: "Salta, Salta, Argentina" */}
  {place.timezone && ` • ${place.timezone}`}
</span>
```

##### Subtareas

- [ ] Leer `WORKFLOW_FRONTEND.md` antes de implementar
- [ ] En `PlaceAutocomplete.tsx`, en el render de cada `place`, reemplazar la línea del subtítulo:
  ```tsx
  // ❌ Actual — solo muestra country y timezone
  <span className="text-muted-foreground text-xs">
    {place.country}{place.timezone && ` • ${place.timezone}`}
  </span>
  // ✅ Mejorado — muestra displayName completo para diferenciar resultados
  <span className="text-muted-foreground text-xs">
    {place.displayName}{place.timezone && ` • ${place.timezone}`}
  </span>
  ```
- [ ] Verificar que `GeocodedPlace` en `birth-chart-geocode.types.ts` incluye `displayName` (ya existe)
- [ ] Ejecutar ciclo de calidad completo
- [ ] Actualizar backlog y crear PR → `develop`

##### Criterios de aceptación

1. Al buscar "Salta", cada sugerencia muestra su nombre completo: ej. `"Salta, Salta, Argentina"` vs `"Salta, Buenos Aires, Argentina"` (si existiera), permitiendo distinguirlas
2. Al buscar "Córdoba", se diferencia "Córdoba, Argentina" de otras homónimas
3. Tests pasan, build y type-check exitosos

---

### Resumen de Impacto FB-CA-003

| Capa | Archivos afectados | Complejidad |
|------|--------------------|-------------|
| Backend Service | `geocode.service.ts` | Media — reemplazar implementación HTTP, mantener contrato |
| Backend Config | `.env.example` | Mínima — agregar variable |
| Backend Tests | `geocode.service.spec.ts` | Media — actualizar mocks |
| Frontend Component | `PlaceAutocomplete.tsx` | Baja — 2-3 líneas de JSX |

**Riesgo:** Muy bajo. El contrato del endpoint no cambia. Photon no requiere API key ni configuración. El fallback a Nominatim garantiza continuidad si Photon no está disponible.

### Notas de Implementación

- Photon no tiene un límite de rate oficialmente publicado, pero sus términos de uso requieren "fair use". Con el caché de 7 días del `GeocodeCacheService`, las llamadas repetidas a la misma query no generan nuevos requests.
- El `displayName` de Photon debe construirse manualmente concatenando `name + state + country` ya que Photon no devuelve un campo `display_name` listo, a diferencia de Nominatim.
- Photon no devuelve timezone — se sigue usando `getTimezone()` con TimeZoneDB (o el fallback por longitud), sin cambios.
- Para localidades muy pequeñas que Photon tampoco encuentre (cobertura OSM insuficiente), el fallback a Nominatim actúa como segunda red de seguridad. Si ninguno encuentra la localidad, el usuario puede ingresar el lugar manualmente con coordenadas (feature futura).
- Si en el futuro se necesita control total del servicio (por ejemplo, en caso de que Komoot restrinja el acceso), Photon puede auto-hostearse con Docker usando los datos de OpenStreetMap.

---

## FB-CA-004: Falta Botón "Nueva Carta" en Página de Carta Guardada

**Tipo:** UX Fix
**Prioridad:** Medium

---

### Descripción del Problema

En la página de detalle de carta guardada (`/carta-astral/resultado/[id]`), no existe ningún botón para que el usuario pueda generar una nueva carta astral desde allí.

En contraste, la página de resultado de carta recién generada (`/carta-astral/resultado`) **ya tiene** un botón "← Nueva carta" en el encabezado y un botón "Generar otra carta" en el footer, lo que crea una inconsistencia de UX entre ambas páginas.

---

### Comparación de Comportamiento

| Página | Botón "Nueva carta" | Navegación disponible |
|--------|--------------------|-----------------------|
| `/carta-astral/resultado` (resultado fresco) | ✅ "← Nueva carta" (header) + "Generar otra carta" (footer) | Completa |
| `/carta-astral/resultado/[id]` (carta guardada) | ❌ No existe | Solo "← Mi historial" |

---

### Análisis Técnico

**Archivo:** [`SavedChartPageContent.tsx`](../frontend/src/components/features/birth-chart/SavedChartPageContent/SavedChartPageContent.tsx)

El header actual de la página de carta guardada (líneas 172–233) tiene:
- Izquierda: `← Mi historial` (Link a `/carta-astral/historial`)
- Derecha: Badge "Guardada" + Botón "PDF" + Menú `⋮` (Renombrar / Eliminar)

No hay acceso a generar una nueva carta desde esta página. El usuario debe navegar manualmente a `/carta-astral` o usar el menú de navegación superior.

**Referencia — patrón correcto en `ChartResultPageContent.tsx`** (líneas 107–109):
```tsx
<Button variant="ghost" size="sm" onClick={handleNewChart}>
  <ArrowLeft className="mr-2 h-4 w-4" />
  Nueva carta
</Button>
```
Donde `handleNewChart` hace `reset()` del store y navega a `/carta-astral`.

---

### Tarea

#### T-CA-056: [Frontend] Agregar botón "Nueva carta" en página de carta guardada

**Tipo:** UX Fix
**Módulo:** Frontend — `birth-chart`
**Prioridad:** Medium
**Estimación:** 0.5h
**Dependencias:** Ninguna

##### Descripción

Agregar un botón "Nueva carta" en `SavedChartPageContent.tsx` para permitir al usuario navegar directamente a generar una nueva carta astral, siendo consistente con la UX de `ChartResultPageContent.tsx`.

##### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `frontend/src/components/features/birth-chart/SavedChartPageContent/SavedChartPageContent.tsx` | Agregar botón "Nueva carta" en el header |

##### Cambio propuesto

En el encabezado de `SavedChartPageContent.tsx`, reemplazar el botón "← Mi historial" actual por dos botones:

```tsx
// ✅ Header con ambas opciones de navegación
<div className="flex items-center gap-2">
  <Button variant="ghost" size="sm" asChild>
    <Link href="/carta-astral/historial">
      <ArrowLeft className="mr-2 h-4 w-4" />
      Mi historial
    </Link>
  </Button>
  <Button variant="ghost" size="sm" asChild>
    <Link href="/carta-astral">
      <Star className="mr-2 h-4 w-4" />
      Nueva carta
    </Link>
  </Button>
</div>
```

> Nota: A diferencia de `ChartResultPageContent`, en esta página **no** es necesario hacer `reset()` del store porque la carta guardada no usa el store de `birthChartStore` (obtiene sus datos directo desde el API por ID).

##### Subtareas

- [ ] Leer `WORKFLOW_FRONTEND.md` antes de implementar
- [ ] En `SavedChartPageContent.tsx`, en el bloque del breadcrumb de navegación (línea ~172):
  - Reemplazar el único `<Button>` izquierdo por los dos botones descritos arriba
  - Verificar que `Star` ya está importado de `lucide-react` (lo está, línea 25)
  - Verificar que `Link` ya está importado de `next/link` (lo está, línea 27)
- [ ] Actualizar tests en `SavedChartPageContent.test.tsx` si hay tests del header
- [ ] Ejecutar ciclo de calidad completo:
  - [ ] `npm run format`
  - [ ] `npm run lint:fix`
  - [ ] `npm run type-check`
  - [ ] `npm run test:run`
  - [ ] `npm run build`
  - [ ] `node scripts/validate-architecture.js`
- [ ] Actualizar backlog y crear PR → `develop`

##### Criterios de aceptación

1. La página `/carta-astral/resultado/[id]` muestra un botón "Nueva carta" en el header
2. Hacer click en "Nueva carta" navega a `/carta-astral`
3. "← Mi historial" se mantiene funcional
4. El layout del header no se rompe en mobile ni desktop
5. Tests pasan, build y type-check exitosos

---

### Resumen de Impacto FB-CA-004

| Capa | Archivos afectados | Complejidad |
|------|--------------------|-------------|
| Frontend Component | `SavedChartPageContent.tsx` | Muy baja — agregar ~8 líneas de JSX |
| Frontend Tests | `SavedChartPageContent.test.tsx` | Muy baja — verificar nuevo botón |

**Riesgo:** Mínimo. Solo agrega elementos UI sin tocar lógica.
