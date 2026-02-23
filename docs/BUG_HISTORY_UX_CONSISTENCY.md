# BUG: Historial de Carta Astral — Funcionalidad Rota y Falta de Consistencia UX

> **Severidad:** Alta — El historial Premium de Carta Astral no funciona (HTTP 500) + inconsistencias UX generalizadas en acceso al historial
> **Fecha de detección:** 2026-02-22
> **Estado:** TASK-FIX-HIST-01 ✅ COMPLETADA | TASK-FIX-HIST-02 ✅ COMPLETADA | TASK-FIX-HIST-03 ✅ COMPLETADA

---

## 1. Diagnóstico del Problema

### 1.1 Historial de Carta Astral retorna HTTP 500

**Endpoint:** `GET /birth-chart/history?page=1&limit=6`
**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-history.service.ts`

El método `toSavedChartSummary()` llama `.toISOString()` sobre `chart.birthDate`, pero TypeORM retorna el tipo PostgreSQL `DATE` como **string** (ej: `"1990-05-15"`), no como objeto `Date`. Los strings no tienen el método `.toISOString()`, causando un `TypeError` no manejado que NestJS convierte en HTTP 500.

```typescript
// ❌ BUG: birthDate puede ser string (no Date) desde TypeORM
private toSavedChartSummary(chart: BirthChart): SavedChartSummaryDto {
  return {
    id: chart.id,
    name: chart.name,
    birthDate: chart.birthDate.toISOString().split('T')[0], // ← TypeError si es string
    sunSign: ...,
    moonSign: ...,
    ascendantSign: ...,
    createdAt: chart.createdAt.toISOString(), // ← mismo riesgo
  };
}
```

**Evidencia:** En el mismo servicio, `generatePdfFromSaved()` ya usa `new Date(chart.birthDate)` de forma defensiva, lo que indica que el equipo era consciente de la inconsistencia del tipo.

**Consecuencia:** La página `/carta-astral/historial` muestra "Error al cargar historial" para **todos** los usuarios Premium.

---

### 1.2 Navegación con botón incorrecto en páginas de resultado de Carta Astral

**Archivos afectados:**
- `frontend/src/app/carta-astral/resultado/page.tsx` (líneas 103–108)
- `frontend/src/app/carta-astral/resultado/[id]/page.tsx` (líneas 170–178)

Ambas páginas crean su propio `<header>` sticky interno (z-50), que aparece **debajo** del header global de navegación, generando una doble barra. Dentro de este header custom hay un botón ghost con `<ArrowLeft>` que no sigue el patrón del resto de la aplicación.

```tsx
// ❌ Header custom interno — aparece como segunda barra de navegación
<header className="bg-background/95 ... sticky top-0 z-50 border-b backdrop-blur">
  <Button variant="ghost" size="sm" onClick={handleNewChart}>
    <ArrowLeft className="mr-2 h-4 w-4" />
    Nueva carta  {/* ← en resultado/page.tsx */}
  </Button>
  {/* ó */}
  <Link href="/carta-astral/historial">
    <ArrowLeft className="mr-2 h-4 w-4" />
    Mi historial  {/* ← en resultado/[id]/page.tsx */}
  </Link>
</header>
```

**Patrones correctos del resto de la app:** `ReadingDetail.tsx` usa un `<ArrowLeft>` estándar dentro del contenido de la página, sin crear un header extra. La doble barra de navegación es visualmente inconsistente y consume espacio visual innecesario.

---

### 1.3 Link de historial incorrecto en página de resultado temporal

**Archivo:** `frontend/src/app/carta-astral/resultado/page.tsx` (línea 292)

El botón "Ver mi historial" en el footer de la página de resultado lleva al usuario a `/historial` (historial de lecturas de **tarot**), en vez de `/carta-astral/historial` (historial de **cartas astrales**).

```tsx
// ❌ BUG: /historial es el historial de tiradas de tarot, NO de carta astral
{isPremium && (
  <Button variant="outline" asChild>
    <Link href="/historial">Ver mi historial</Link>  {/* ← LINK INCORRECTO */}
  </Button>
)}
```

---

### 1.4 Fragmentación del historial — Sin punto de acceso unificado

**Estado actual:** cada módulo tiene su historial aislado, sin cruce de navegación coherente ni punto de acceso común para usuarios Premium.

| Módulo | Ruta del historial | ¿Accesible desde home? |
|--------|-------------------|------------------------|
| Tiradas de Tarot | `/historial` | ✅ Widget QuickActions + Menú usuario |
| Carta del Día | `/carta-del-dia/historial` | ❌ Solo cross-link desde `/historial` |
| Carta Astral (Premium) | `/carta-astral/historial` | ❌ Ningún punto de acceso |
| Rituales | `/rituales/historial` | ❌ Ningún punto de acceso |

**Widget QuickActions** (`frontend/src/components/features/dashboard/QuickActions.tsx`):
- Muestra "Historial de Lecturas" → `/historial` (solo tarot)
- **No incluye acceso a Carta Astral Historial para usuarios Premium**

**Menú de usuario** (`frontend/src/components/layout/UserMenu.tsx`):
- Solo muestra "Mis Lecturas" → `/historial`
- Sin acceso a los demás historiales

**Principio UX violado:** [Nielsen Heuristic #6 - Recognition Rather Than Recall](https://www.nngroup.com/articles/ten-usability-heuristics/): el usuario no debería tener que recordar dónde está su historial de carta astral. Debe ser siempre visible y accesible.

---

## 2. Análisis de Impacto

| Problema | Usuarios afectados | Impacto |
|----------|-------------------|---------|
| HTTP 500 en historial | **Todos los Premium** | Función pagada inaccesible |
| Botón/header inconsistente | Todos los que calculan carta astral | Confusión visual, UX degradada |
| Link incorrecto a historial | Premium que generan carta astral | Desorientación al buscar su historial |
| Sin acceso unificado | Todos los Premium | Historial oculto, función Premium sin valor |

---

## 3. Tareas de Fix

---

### TASK-FIX-HIST-01 — Fix Backend: HTTP 500 en historial de carta astral

**Tipo:** Backend (NestJS)
**Prioridad:** P0 — Bloqueante, función Premium rota
**Estado:** ✅ COMPLETADA
**Branch:** `fix/TASK-FIX-HIST-01-birth-chart-history-500`

#### Problema raíz
TypeORM retorna columnas PostgreSQL tipo `DATE` como `string` (`"YYYY-MM-DD"`), no como objeto `Date`. El método `toSavedChartSummary()` llama `.toISOString()` sobre el valor sin verificar su tipo.

#### Archivos a modificar
- `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-history.service.ts`

#### Solución propuesta
Normalizar los campos de fecha en `toSavedChartSummary()` manejando ambos tipos posibles:

```typescript
// ✅ FIX: maneja string y Date correctamente
private toSavedChartSummary(chart: BirthChart): SavedChartSummaryDto {
  const birthDateStr =
    typeof chart.birthDate === 'string'
      ? chart.birthDate  // ya en formato YYYY-MM-DD desde PostgreSQL DATE
      : chart.birthDate.toISOString().split('T')[0];

  const createdAtStr =
    typeof chart.createdAt === 'string'
      ? chart.createdAt
      : chart.createdAt.toISOString();

  return {
    id: chart.id,
    name: chart.name,
    birthDate: birthDateStr,
    sunSign: ZodiacSignMetadata[chart.sunSign as ZodiacSign]?.name ?? chart.sunSign,
    moonSign: ZodiacSignMetadata[chart.moonSign as ZodiacSign]?.name ?? chart.moonSign,
    ascendantSign:
      ZodiacSignMetadata[chart.ascendantSign as ZodiacSign]?.name ?? chart.ascendantSign,
    createdAt: createdAtStr,
  };
}
```

#### Subtareas técnicas

- [x] Leer `birth-chart-history.service.ts` completo
- [x] Aplicar fix en `toSavedChartSummary()` para `birthDate` y `createdAt`
- [x] Verificar si `getUserChartById()` (para ruta `/result/:id`) tiene el mismo problema
- [x] Actualizar tests existentes para cubrir el caso de `birthDate` como `string` Y como `Date`
- [x] Agregar test de integración del endpoint GET /birth-chart/history

#### Ciclo de calidad
```bash
cd backend/tarot-app
npm run format
npm run lint
npm run test:cov          # coverage ≥ 80%
npm run build
node scripts/validate-architecture.js
```

#### Criterios de aceptación
- [x] `GET /birth-chart/history` retorna HTTP 200 con datos para usuario Premium
- [x] Tests unitarios pasan con birthDate como string y como Date
- [x] Coverage del módulo birth-chart mantiene ≥ 80%
- [x] Build sin errores

---

### TASK-FIX-HIST-02 — Fix Frontend: Navegación inconsistente en páginas de resultado de Carta Astral

**Tipo:** Frontend (Next.js)
**Prioridad:** P1 — UX degradada en flujo principal
**Estado:** ✅ COMPLETADA
**Branch:** `fix/TASK-FIX-HIST-02-birth-chart-result-navigation`

#### Problema raíz
Las páginas de resultado de carta astral crean su propio `<header>` sticky interno, produciendo una doble barra de navegación inconsistente con el resto de la app. Además, el link "Ver mi historial" apunta a la URL incorrecta.

#### Archivos a modificar
- `frontend/src/app/carta-astral/resultado/page.tsx`
- `frontend/src/app/carta-astral/resultado/[id]/page.tsx`

#### Solución propuesta

**A) Eliminar el header sticky interno** y reemplazarlo por navegación dentro del contenido de la página, siguiendo el patrón de `ReadingDetail.tsx` (breadcrumb simple dentro del `<main>`):

```tsx
// ✅ PATRÓN CORRECTO: navegación dentro del contenido, sin crear header extra
<main className="container mx-auto max-w-6xl px-4 py-8">
  {/* Breadcrumb de navegación */}
  <div className="mb-6 flex items-center justify-between">
    <Button variant="ghost" size="sm" asChild>
      <Link href="/carta-astral">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Carta Astral
      </Link>
    </Button>
    {/* Acciones (PDF, compartir, etc.) alineadas a la derecha */}
    <div className="flex items-center gap-2">
      {/* badges y botones de acción */}
    </div>
  </div>
  {/* ... resto del contenido */}
</main>
```

**B) Corregir el link incorrecto** en `resultado/page.tsx`:

```tsx
// ✅ FIX: apunta al historial de carta astral, no al de tarot
{isPremium && (
  <Button variant="outline" asChild>
    <Link href="/carta-astral/historial">Mi historial de cartas</Link>
  </Button>
)}
```

#### Subtareas técnicas

- [x] Leer `resultado/page.tsx` y `resultado/[id]/page.tsx` completos
- [x] Eliminar `<header>` sticky interno en ambas páginas
- [x] Mover los controles de acción (PDF, compartir, menú) al breadcrumb dentro del `<main>`
- [x] Corregir el link "Ver mi historial" en `resultado/page.tsx` → `/carta-astral/historial`
- [x] Verificar consistencia visual con `ReadingDetail.tsx` (misma anchura de contenedor, mismos estilos de botón)
- [x] Actualizar tests de los componentes si corresponde
- [x] Verificar que el breadcrumb sea visible en mobile (responsive)

#### Ciclo de calidad
```bash
cd frontend
npm run format
npm run lint:fix
npm run type-check
npm run test:run
npm run build
node scripts/validate-architecture.js
```

#### Criterios de aceptación
- [x] Las páginas de resultado de carta astral NO crean una segunda barra sticky
- [x] El botón de volver usa el mismo patrón visual que `ReadingDetail.tsx`
- [x] "Ver mi historial" en `resultado/page.tsx` lleva a `/carta-astral/historial`
- [x] La navegación es consistente en mobile y desktop
- [x] Build y tests sin errores

---

### TASK-FIX-HIST-03 — Fix Frontend: Punto de acceso unificado al historial (Premium)

**Tipo:** Frontend (Next.js)
**Prioridad:** P1 — Función Premium invisible para el usuario
**Estado:** ✅ COMPLETADA
**Branch:** `fix/TASK-FIX-HIST-03-unified-history-access`

#### Problema raíz
Los usuarios Premium no tienen forma de acceder al historial de Carta Astral desde el home ni desde el menú de usuario. El widget `QuickActions` y el `UserMenu` solo muestran acceso al historial de tiradas de tarot.

#### Principio UX aplicado
[Nielsen Heuristic #6 - Reconocimiento antes que Recuerdo](https://www.nngroup.com/articles/ten-usability-heuristics/): los elementos que el usuario necesita deben ser visibles, no depender de que el usuario recuerde dónde están.

Patrón de referencia: apps como **Spotify** (historial unificado de todo tipo de contenido), **Netflix** (Continuar Viendo centralizado) y **Google Drive** (Reciente unificado) usan una sección "Actividad reciente" centralizada accesible desde el menú principal. Aplicar este mismo patrón a Auguria.

#### Archivos a modificar
- `frontend/src/components/features/dashboard/QuickActions.tsx`
- `frontend/src/components/layout/UserMenu.tsx`
- `frontend/src/app/historial/page.tsx` (o nuevo componente si se crea vista unificada)

#### Solución propuesta

**A) QuickActions — Adaptar para Premium:**
Para usuarios Premium, reemplazar o agregar una tarjeta que lleve a "Mis Cartas Astrales" (`/carta-astral/historial`), o usar una tarjeta genérica "Mi Historial" con pestañas cuando lleguen.

```tsx
// Opción: para Premium, la tercera tarjeta apunta a carta astral historial
{user?.plan === 'premium' ? (
  <QuickActionCard
    href="/carta-astral/historial"
    icon={<Star className="h-6 w-6" />}
    title="Mis Cartas Astrales"
    description="Accede a tus cartas guardadas"
  />
) : (
  <QuickActionCard
    href="/carta-del-dia"
    icon={<Sparkles className="h-6 w-6" />}
    title="Carta del Día"
    description="Obtén tu carta diaria de inspiración"
  />
)}
```

**B) UserMenu — Agregar acceso a historial de carta astral para Premium:**

```tsx
// ✅ FIX: menú diferenciado para Premium
{user?.plan === 'premium' && (
  <>
    <DropdownMenuItem asChild>
      <Link href="/historial">
        <BookOpen className="mr-2 h-4 w-4" />
        Mis Lecturas
      </Link>
    </DropdownMenuItem>
    <DropdownMenuItem asChild>
      <Link href="/carta-astral/historial">
        <Star className="mr-2 h-4 w-4" />
        Mis Cartas Astrales
      </Link>
    </DropdownMenuItem>
  </>
)}
{user?.plan !== 'premium' && (
  <DropdownMenuItem asChild>
    <Link href="/historial">
      <BookOpen className="mr-2 h-4 w-4" />
      Mis Lecturas
    </Link>
  </DropdownMenuItem>
)}
```

#### Subtareas técnicas

- [x] Leer `QuickActions.tsx` y `UserMenu.tsx` completos
- [x] Actualizar `QuickActions.tsx`: para Premium, mostrar acceso a Carta Astral Historial
- [x] Actualizar `UserMenu.tsx`: para Premium, agregar "Mis Cartas Astrales" en el menú
- [x] Actualizar tests de `QuickActions` y `UserMenu` para cubrir caso Premium
- [x] Verificar que los links nuevos usen `API_ENDPOINTS` si aplica (solo rutas de página, no necesitan endpoints)
- [x] Verificar comportamiento en mobile (menú hamburguesa si existe)

#### Ciclo de calidad
```bash
cd frontend
npm run format
npm run lint:fix
npm run type-check
npm run test:run
npm run build
node scripts/validate-architecture.js
```

#### Criterios de aceptación
- [x] Usuario Premium ve acceso a "Mis Cartas Astrales" en el widget de home
- [x] Usuario Premium ve acceso a "Mis Cartas Astrales" en el menú de usuario
- [x] Usuario Free NO ve la opción Premium (no genera ruido para ellos)
- [x] Tests actualizados cubren ambos estados (Premium / Free)
- [x] Build y tests sin errores

---

## 4. Orden de Ejecución Recomendado

```
TASK-FIX-HIST-01 (backend) → TASK-FIX-HIST-02 (frontend) → TASK-FIX-HIST-03 (frontend)
```

**Razón:** HIST-01 desbloquea la funcionalidad de historial en el servidor. Las tareas de frontend (HIST-02 y HIST-03) pueden desarrollarse en paralelo una vez que el backend funcione, ya que son independientes entre sí.

---

## 5. Referencias

- [Nielsen Norman Group — 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [Nielsen Norman Group — Navigation History UX](https://www.nngroup.com/articles/history-ux/)
- TypeORM Issue: [DATE column type returns string in PostgreSQL](https://github.com/typeorm/typeorm/issues/2176)
- Archivos backend relacionados:
  - `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-history.service.ts`
  - `backend/tarot-app/src/modules/birth-chart/entities/birth-chart.entity.ts`
- Archivos frontend relacionados:
  - `frontend/src/app/carta-astral/resultado/page.tsx`
  - `frontend/src/app/carta-astral/resultado/[id]/page.tsx`
  - `frontend/src/components/features/dashboard/QuickActions.tsx`
  - `frontend/src/components/layout/UserMenu.tsx`
