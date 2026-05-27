# BACKLOG: AUDITORÍA DEL PANEL /ADMIN — Mayo 2026

## PARTE A: REPORTE DE HALLAZGOS

**Proyecto:** Auguria - Plataforma de Servicios Místicos
**Tipo:** Auditoría de completitud y corrección del panel `/admin`
**Versión:** 1.0
**Fecha:** 25 de mayo de 2026
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)

---

## CONTEXTO

Tras cerrar `BACKLOG_BUGFIXES_2026_05.md` se realizó una nueva auditoría sección por sección del panel `/admin` para detectar **implementaciones faltantes** (crear) e **implementaciones existentes pero rotas/incompletas** (corregir).

Se revisaron las 13 entradas del sidebar (`frontend/src/lib/config/admin-navigation.ts`):

| Sección | Ruta | Estado tras auditoría |
| ------- | ---- | --------------------- |
| Dashboard | `/admin` | ✅ Correcto (sin mocks; `recentReadings`, `planDistribution` y counts reales) |
| Métricas | `/admin/metricas` | ⚠️ Parcial — "Sesiones Completadas" sin datos (**ADM-002**) |
| Usuarios | `/admin/usuarios` | ✅ Correcto (tabla, filtros, paginación, ban/unban, cambio de plan, roles) |
| Tarotistas | `/admin/tarotistas` | ⚠️ Links muertos a detalle/config (**ADM-003**) |
| Lecturas | `/admin/lecturas` | ❌ Solo placeholder "En construcción" (**ADM-001**) |
| Servicios | `/admin/servicios` | ✅ Correcto (CRUD servicios + historial transacciones) |
| Agenda | `/admin/agenda` | ✅ Correcto (tarotista primario dinámico, sin hardcode) |
| Uso de Interpretaciones | `/admin/ai-usage` | ✅ Correcto (presets de fecha, tipos lowercase) |
| Configuración de Planes | `/admin/planes` | ✅ Correcto |
| Seguridad | `/admin/seguridad` | ⚠️ Eventos con paginación no estándar (**ADM-004**) |
| Caché | `/admin/cache` | ⚠️ Tarjeta de ahorro sin renderizar (**ADM-005**) |
| Audit Logs | `/admin/audit` | ✅ Correcto (contrato `{data, meta}` estándar) |
| Horóscopo Chino | `/admin/horoscopo-chino` | ✅ Correcto |

> **Nota de alcance (MVP single-tarotista):** la sección Tarotistas proviene de un diseño preliminar multi-tarotista. El MVP actual solo tiene a **Flavia** activa. **No se elimina nada**, pero los flujos multi-tarotista se tratan como deuda de baja prioridad (ver ADM-003).

---

## ÍNDICE DE HALLAZGOS

| ID      | Hallazgo                                                                  | Severidad  | Módulo afectado            |
| ------- | ------------------------------------------------------------------------- | ---------- | -------------------------- |
| ADM-001 | `/admin/lecturas` sin implementación real (solo placeholder)              | 🟠 Alta    | Frontend (+Backend) — Lecturas |
| ADM-002 | Métricas: "Sesiones Completadas" hardcoded `0` + columna "Sesiones" en `-` | 🟡 Media   | Full-stack — Métricas      |
| ADM-003 | Tarotistas: "Ver perfil" y "Configuración" llevan a rutas inexistentes (404) | 🟠 Alta  | Frontend — Admin Tarotistas |
| ADM-004 | Eventos de Seguridad usa contrato de paginación no estándar (`currentPage`/`itemsPerPage`) | 🟡 Media | Backend — Security Events |
| ADM-005 | Caché: tarjeta de ahorro de costos (`savings`) se pasa pero nunca se renderiza | 🟢 Baja  | Full-stack — Caché         |
| ADM-006 | Sin UI admin para IP Whitelist pese a endpoints backend existentes        | 🟢 Baja (opcional) | Frontend — Seguridad |

---

## DETALLE DE HALLAZGOS

### ADM-001: `/admin/lecturas` Sin Implementación Real (Solo Placeholder)

**Severidad:** 🟠 Alta
**Módulo:** `frontend/src/app/admin/lecturas/` + `frontend/src/components/features/admin/LecturasPlaceholderContent.tsx`
**Reportado por:** Auditoría /admin (25/05/2026)

#### Descripción del Problema

La entrada "Lecturas" del sidebar (`admin-navigation.ts:41`) abre una página que solo muestra un cartel **"En construcción"**. El admin no puede visualizar, filtrar ni gestionar las lecturas de tarot del sistema, pese a que el backend ya expone un endpoint para ello.

Esta sección fue creada como placeholder en `BACKLOG_BUGFIXES_2026_05.md` (T-BUG-006) precisamente para evitar el 404; ahora corresponde implementarla de verdad.

#### Causa Raíz Identificada

- `frontend/src/app/admin/lecturas/page.tsx` renderiza `<LecturasPlaceholderContent />`.
- `frontend/src/components/features/admin/LecturasPlaceholderContent.tsx:17-21`: texto "En construcción" / "está en desarrollo".
- Backend **sí** expone `GET /admin/readings` (`backend/tarot-app/src/modules/tarot/readings/readings-admin.controller.ts:28`) con query `includeDeleted` y respuesta `PaginatedReadingsResponseDto`.
- El backend de admin **solo expone `@Get()`**: NO hay endpoints de borrado lógico ni restauración en `readings-admin.controller.ts`, aunque el catálogo de Audit Logs ya contempla `reading_deleted` y `reading_restored` (`AuditLogsContent.tsx:43-44`). Si se quieren esas acciones desde el panel, hay que agregarlas.

#### Criterios de Aceptación

1. **Dado** que el admin entra a `/admin/lecturas`
   **Cuando** carga la página
   **Entonces** ve una tabla paginada con las lecturas reales (fecha, usuario, tarotista/spread, estado), no un placeholder.

2. **Dado** que existen lecturas eliminadas
   **Cuando** el admin activa el toggle "Incluir eliminadas"
   **Entonces** la query usa `?includeDeleted=true` y las muestra diferenciadas.

3. **Dado** que el admin quiere inspeccionar una lectura
   **Cuando** la abre
   **Entonces** ve el detalle (pregunta, cartas, interpretación).

4. (Si se aprueba el alcance de moderación) **Dado** que el admin borra/restaura una lectura
   **Cuando** confirma la acción
   **Entonces** se llama al endpoint correspondiente y queda registrado en Audit Logs.

#### Notas Técnicas

- Reusar patrón de `UsersManagementContent` (hook `useQuery` + tabla + filtros + paginación).
- Crear `hooks/api/useAdminReadings.ts`, `lib/api/admin-readings-api.ts` y entrada en `API_ENDPOINTS` (`/admin/readings`).
- Validar el shape de `PaginatedReadingsResponseDto` (¿`{ data, meta }`?) y respetar el contrato estándar del proyecto.
- Borrado/restauración es **opcional** (decisión de producto). Si se incluye, requiere subtarea backend (`@Delete(':id')` + `@Patch(':id/restore')` en `readings-admin.controller.ts` + audit).

---

### ADM-002: Métricas — "Sesiones Completadas" Sin Datos

**Severidad:** 🟡 Media
**Módulo:** `frontend/src/components/features/admin/PlatformMetricsContent.tsx` + `backend/tarot-app/src/modules/tarotistas`
**Reportado por:** Auditoría /admin (25/05/2026)

#### Descripción del Problema

En `/admin/metricas`, la tarjeta **"Sesiones Completadas"** muestra siempre `0` con un badge **"Próximamente"**, y en la tabla "Top Tarotistas" la columna **"Sesiones"** renderiza `-` para cada fila. Es la única métrica del tablero que no tiene dato real.

#### Causa Raíz Identificada

- `PlatformMetricsContent.tsx:126-128`: valor `0` hardcoded + `<Badge>Próximamente</Badge>`.
- `PlatformMetricsContent.tsx:194`: celda "Sesiones" fija en `-`.
- El DTO del backend **no tiene el campo**: `PlatformMetricsDto` (`backend/tarot-app/src/modules/tarotistas/application/dto/metrics-query.dto.ts:164`) expone `totalReadings`, `totalGrossRevenue`, `activeTarotistas`, `activeUsers`, `topTarotistas`, pero **ningún `completedSessions`**. Lo mismo `TarotistaMetricsDto` (línea 65): tiene `totalReadings` pero no sesiones.

#### Criterios de Aceptación

1. **Dado** que el backend calcula sesiones completadas en el período
   **Cuando** se consulta `GET /tarotistas/metrics/platform`
   **Entonces** la respuesta incluye `completedSessions` (global) y por tarotista en `topTarotistas[].completedSessions`.

2. **Dado** que el frontend recibe el dato
   **Cuando** renderiza la tarjeta y la tabla
   **Entonces** muestra el número real y se elimina el badge "Próximamente" y el `-`.

3. **Dado** que aún no se decide implementarlo
   **Cuando** se revisa producto
   **Entonces** se confirma si "sesiones" aplica al MVP (sesiones en vivo vs lecturas IA) o se retira la tarjeta para no mostrar datos vacíos.

#### Notas Técnicas

- Definir primero la semántica de "sesión" en el MVP (¿turnos de servicios holísticos completados? ¿lecturas en vivo?). Hoy el negocio es mayormente lecturas IA + servicios holísticos.
- Si se mapea a turnos de servicios completados, el dato puede salir de `service_purchases` con `paymentStatus=paid` y fecha pasada.
- Alternativa de bajo costo: retirar la tarjeta y la columna hasta que exista el concepto, evitando UI con `0/-`.

---

### ADM-003: Tarotistas — "Ver Perfil" y "Configuración" Llevan a Rutas Inexistentes (404)

**Severidad:** 🟠 Alta (dead-link real en UI), priorización condicionada al MVP single-tarotista
**Módulo:** `frontend/src/components/features/admin/TarotistasManagementContent.tsx` + `TarotistasTable.tsx`
**Reportado por:** Auditoría /admin (25/05/2026)

#### Descripción del Problema

En `/admin/tarotistas`, el menú de acciones de cada fila ofrece "Ver perfil", "Configuración" y "Ver métricas". Las dos primeras **navegan a rutas que no existen**, produciendo 404:

- "Ver perfil" → `router.push('/admin/tarotistas/${id}')`
- "Configuración" → modal que luego hace `router.push('/admin/tarotistas/${id}/configuracion')`

No existe ningún segmento dinámico `[id]` bajo `frontend/src/app/admin/tarotistas/` (solo `page.tsx`).

> **Contexto MVP:** esta sección es legacy del diseño multi-tarotista; hoy solo existe Flavia. Aun así, hacer click en "Ver perfil" de Flavia hoy da 404. No se elimina la sección.

#### Causa Raíz Identificada

- `TarotistasManagementContent.tsx:86-88`: `case 'view-profile': router.push('/admin/tarotistas/${tarotista.id}')`.
- `TarotistasManagementContent.tsx:382-386`: botón "Ir a Configuración" → `/admin/tarotistas/${id}/configuracion`.
- `TarotistasTable.tsx:131-139`: items de menú `action-view-profile` y `action-edit-config` cableados a esas acciones.
- No hay `app/admin/tarotistas/[id]/page.tsx` ni `.../[id]/configuracion/page.tsx`.
- El backend **sí** soporta el detalle/config: `GET/PUT /admin/tarotistas/:id/config`, `:id/config/reset`, `:id/meanings`, etc. (`tarotistas-admin.controller.ts:93-160`).

#### Criterios de Aceptación (elegir camino según producto)

**Opción A — implementar el detalle (si se mantiene el flujo):**
1. Crear `app/admin/tarotistas/[id]/page.tsx` (perfil + métricas del tarotista) consumiendo endpoints existentes.
2. Crear `app/admin/tarotistas/[id]/configuracion/page.tsx` (editar config IA vía `PUT :id/config`).
3. Ningún click desde el menú produce 404.

**Opción B — interino para MVP single-tarotista (recomendado a corto plazo):**
1. Deshabilitar/ocultar las acciones "Ver perfil" y "Configuración" (o convertirlas en `disabled` con tooltip "Disponible con multi-tarotista") mientras solo exista Flavia.
2. NO eliminar el código subyacente; dejar comentario apuntando a este hallazgo.
3. El menú no expone acciones que terminen en 404.

#### Notas Técnicas

- "Ver métricas" SÍ funciona hoy (abre modal con datos de `AdminTarotista`); no requiere cambios.
- La config de tarotista existe end-to-end en backend; el faltante es puramente de páginas frontend.
- Coordinar con la decisión de mantener o no el marketplace multi-tarotista.

---

### ADM-004: Eventos de Seguridad Usa Contrato de Paginación No Estándar

**Severidad:** 🟡 Media
**Módulo:** `backend/tarot-app/src/modules/security/security-events.controller.ts` + `security-event.service.ts`
**Reportado por:** Auditoría /admin (25/05/2026)

#### Descripción del Problema

La pestaña "Eventos de Seguridad" (`/admin/seguridad`) consume una respuesta con forma `{ events: [...], meta: { currentPage, itemsPerPage, totalItems, totalPages } }`, que **no respeta el contrato estándar** del proyecto definido en `CLAUDE.md` (regla #3): `{ data: [...], meta: { page, limit, totalItems, totalPages } }`.

Es exactamente la misma clase de inconsistencia que se corrigió para Audit Logs en `BACKLOG_BUGFIXES_2026_05.md` (BUG-015 / T-BUG-010-A), pero los Security Events quedaron fuera de aquel alcance.

#### Causa Raíz Identificada

- `frontend/src/components/features/admin/SecurityEventsTab.tsx:91`: `const events = data?.events ?? []` (clave `events`, no `data`).
- `SecurityEventsTab.tsx:245-246`: lee `meta.currentPage` e `meta.itemsPerPage` (no `meta.page` / `meta.limit`).
- El backend `GET /admin/security/events` (`security-events.controller.ts:42`) retorna `securityEventService.findAll(query)` con ese shape no estándar.
- Funciona porque el frontend está adaptado, pero rompe la convención global y obliga a un mapeo distinto al del resto de tablas.

#### Criterios de Aceptación

1. **Dado** el endpoint `GET /admin/security/events`
   **Cuando** responde
   **Entonces** usa `{ data: SecurityEvent[], meta: { page, limit, totalItems, totalPages } }`.

2. **Dado** el frontend `SecurityEventsTab`
   **Cuando** consume la respuesta
   **Entonces** lee `data.data` y `data.meta.page/limit` (alineado con `AuditLogsContent`).

3. **Dado** los tests del controller/servicio y del componente
   **Cuando** se ejecutan
   **Entonces** pasan con el nuevo contrato.

#### Notas Técnicas

- Tomar como referencia el refactor ya hecho en Audit Logs (`audit-log.service.ts` → `{ data, meta }`).
- Actualizar `admin-security.types.ts` (frontend) para reflejar el nuevo `meta`.
- Revisar si algún otro consumidor depende del shape viejo antes de cambiarlo.

---

### ADM-005: Caché — Tarjeta de Ahorro de Costos No Se Renderiza

**Severidad:** 🟢 Baja
**Módulo:** `frontend/src/components/features/admin/CacheStatsCards.tsx`
**Reportado por:** Auditoría /admin (25/05/2026)

#### Descripción del Problema

`CacheManagementContent` pasa `savings={analytics.savings}` a `CacheStatsCards`, pero el componente **no usa esa prop**: solo desestructura `hitRate` y `responseTime`. No existe ninguna tarjeta que muestre el ahorro económico estimado por el caché (llamadas IA evitadas × costo), pese a que el dato viaja en el response.

#### Causa Raíz Identificada

- `CacheStatsCards.tsx:17`: `savings?: SavingsMetrics; // TODO: Use savings metrics when backend provides detailed cost data`.
- `CacheStatsCards.tsx:21`: `export function CacheStatsCards({ hitRate, responseTime }: ...)` — `savings` no se desestructura ni se renderiza.
- Se muestran 4 tarjetas (Total Requests, Hit Rate, Miss Rate, Speed Improvement) pero ninguna de ahorro.

#### Criterios de Aceptación

1. **Dado** que el backend provee `savings` con costo evitado
   **Cuando** se renderiza el grid de stats
   **Entonces** aparece una tarjeta "Ahorro estimado" con el monto.

2. **Dado** que el backend aún no provee costo detallado
   **Cuando** se decide no implementar
   **Entonces** se elimina la prop `savings` muerta para no inducir a error (o se documenta el TODO con issue tracker).

#### Notas Técnicas

- Depende de que la pricing table de IA esté correcta (relación con BUG-008 ya resuelto: precios reales de Groq/Gemini/etc.). Si los costos ya son reales, el `savings` puede calcularse confiablemente.
- Cambio chico y autocontenido en el frontend si el dato ya llega.

---

### ADM-006: Sin UI Admin para IP Whitelist (Endpoints Backend Existen)

**Severidad:** 🟢 Baja (opcional — decisión de producto)
**Módulo:** `frontend/src/app/admin/seguridad/` + `backend/.../admin/rate-limits/ip-whitelist-admin.controller.ts`
**Reportado por:** Auditoría /admin (25/05/2026)

#### Descripción del Problema

El backend expone un CRUD de IP whitelist (`GET/POST/DELETE /admin/ip-whitelist`, `ip-whitelist-admin.controller.ts:35-86`), relacionado con el control de acceso de staging (`docs/STAGING_WHITELIST_ACCESS_CONTROL.md`). El panel `/admin/seguridad` solo tiene dos pestañas (Rate Limiting y Eventos de Seguridad) y **no hay ninguna referencia a `whitelist` en el frontend** — no existe forma de gestionar la whitelist desde la UI admin.

#### Causa Raíz Identificada

- `SecurityManagementContent.tsx:20-23`: solo `RateLimitingTab` y `SecurityEventsTab`.
- `grep "whitelist"` en `frontend/src` → 0 resultados.
- Los endpoints backend existen y no tienen consumidor en la app admin.

#### Criterios de Aceptación

1. **Dado** que producto decide gestionar la whitelist desde la UI
   **Cuando** se agrega una pestaña "IP Whitelist" en Seguridad
   **Entonces** el admin puede listar, agregar y quitar IPs permitidas.

2. **Dado** que la whitelist se gestiona por entorno/seed/infra
   **Cuando** se confirma esa decisión
   **Entonces** se documenta explícitamente que no habrá UI (cerrar el hallazgo como "no aplica").

#### Notas Técnicas

- Verificar primero cómo se administra hoy la whitelist en staging/prod (¿env var, seed, manual?) antes de invertir en UI.
- Si se implementa, reusar patrón de tabs existente + hooks React Query.

---

---

## PARTE B: TAREAS TÉCNICAS

> **Convención de IDs:** `T-ADM-XX-A/B` = subtarea (A = backend, B = frontend).
> Estimación en puntos de historia (1 punto ≈ 0.5 día). PRs SIEMPRE a `develop`.

### Índice de Tareas Técnicas

| ID          | Tarea                                                                       | Tipo        | Prioridad        | Estimación |
| ----------- | --------------------------------------------------------------------------- | ----------- | ---------------- | ---------- |
| T-ADM-001-A | (Opcional) Backend: endpoints soft-delete/restore de lecturas admin         | Backend     | 🟡 Media         | 3 pts      |
| T-ADM-001-B | Frontend: implementar `/admin/lecturas` (tabla + filtros + detalle)         | Frontend    | 🟠 Alta          | 5 pts      |
| T-ADM-002-A | Backend: agregar `completedSessions` a métricas de plataforma y por tarotista | Backend   | 🟡 Media         | 3 pts      |
| T-ADM-002-B | Frontend: consumir sesiones reales en `/admin/metricas`                     | Frontend    | 🟡 Media         | 1 pt       |
| T-ADM-003   | Frontend: resolver dead-links de Tarotistas (Opción A o B)                  | Frontend    | 🟠 Alta          | 3 pts (B) / 6 pts (A) |
| T-ADM-004   | Backend+Frontend: estandarizar paginación de Security Events `{data, meta}` | Full-stack  | 🟡 Media         | 3 pts      |
| T-ADM-005   | Frontend: renderizar tarjeta de ahorro de caché (o limpiar prop muerta)     | Frontend    | 🟢 Baja          | 1 pt       |
| T-ADM-006   | (Opcional) Frontend: pestaña de gestión de IP Whitelist en Seguridad        | Frontend    | 🟢 Baja          | 3 pts      |

**Estimación total:** ~22–25 puntos (según opción elegida en T-ADM-003 y si se incluyen las opcionales).

---

## TAREAS DETALLADAS

### T-ADM-001-A: (Opcional) Backend — Soft-Delete/Restore de Lecturas Admin

**Prioridad:** 🟡 Media
**Estimación:** 3 puntos
**Dependencias:** decisión de producto (¿el admin debe poder moderar lecturas?)
**Cubre hallazgo:** ADM-001
**Estado:** ✅ COMPLETADA

#### ✅ Tareas específicas

- [x] Agregar `@Delete(':id')` (borrado lógico) y `@Patch(':id/restore')` en `readings-admin.controller.ts`, delegando al orchestrator.
- [x] Implementar lógica en `ReadingsOrchestratorService` (soft-delete con `deletedAt`, restore lo limpia).
- [x] Registrar eventos `reading_deleted` / `reading_restored` en Audit Log (ya existen los tipos).
- [x] Guards `JwtAuthGuard + AdminGuard`, Swagger en español.
- [x] Unit tests + coverage ≥ 80%.

#### 🎯 Criterios de Aceptación

- [x] El admin puede borrar y restaurar lecturas; queda traza en Audit Logs.
- [x] `npm run test:cov && npm run build && node scripts/validate-architecture.js` pasan.

#### 📁 Archivos involucrados

- `backend/tarot-app/src/modules/tarot/readings/readings-admin.controller.ts`
- `backend/tarot-app/src/modules/tarot/readings/readings-admin.controller.spec.ts` (nuevo)
- `backend/tarot-app/src/modules/tarot/readings/application/services/readings-orchestrator.service.ts`
- `backend/tarot-app/src/modules/tarot/readings/application/services/readings-orchestrator.service.spec.ts`
- `backend/tarot-app/src/modules/tarot/readings/readings.module.ts`

---

### T-ADM-001-B: Frontend — Implementar `/admin/lecturas`

**Prioridad:** 🟠 Alta
**Estimación:** 5 puntos
**Dependencias:** ninguna para listar (usa `GET /admin/readings`); T-ADM-001-A si se incluyen acciones de moderación
**Cubre hallazgo:** ADM-001
**Estado:** ✅ COMPLETADA

#### ✅ Tareas específicas

- [x] Crear `lib/api/admin-readings-api.ts` + entrada `ADMIN.READINGS` en `API_ENDPOINTS` (`/admin/readings`).
- [x] Crear `hooks/api/useAdminReadings.ts` (React Query, soporta `includeDeleted`).
- [x] Crear `components/features/admin/ReadingsManagementContent.tsx` con tabla paginada, filtros (toggle "Incluir eliminadas") y estados loading/error/empty.
- [x] Reemplazar `LecturasPlaceholderContent` en `app/admin/lecturas/page.tsx` por el nuevo contenido (se mantiene `LecturasPlaceholderContent` en el repo sin borrar).
- [x] Acciones de borrar/restaurar con `AlertDialog` de confirmación (usando endpoints de T-ADM-001-A).
- [x] Tests de componente + hook + api; 19 tests pasando.
- [x] Ciclo de calidad frontend completo (format, lint:fix, type-check, build, validate-architecture).

#### 🎯 Criterios de Aceptación

- [x] `/admin/lecturas` muestra lecturas reales paginadas, no el placeholder.
- [x] El toggle "Incluir eliminadas" envía `?includeDeleted=true`.
- [x] Respeta el contrato `{ data, meta }` estándar.

#### 📁 Archivos involucrados

- `frontend/src/app/admin/lecturas/page.tsx`
- `frontend/src/components/features/admin/ReadingsManagementContent.tsx` (nuevo) + test
- `frontend/src/hooks/api/useAdminReadings.ts` (nuevo) + test
- `frontend/src/lib/api/admin-readings-api.ts` (nuevo) + test
- `frontend/src/lib/api/endpoints.ts`
- `frontend/src/types/` (tipos de lectura admin)

---

### T-ADM-002-A: Backend — Agregar `completedSessions` a Métricas

**Prioridad:** 🟡 Media
**Estimación:** 3 puntos
**Dependencias:** definición de producto sobre qué es una "sesión" en el MVP
**Cubre hallazgo:** ADM-002
**Estado:** ✅ COMPLETADA

#### ✅ Tareas específicas

- [x] Definir la fuente del dato: `sessions` con `status = COMPLETED` y `completedAt` en el período.
- [x] Añadir `completedSessions: number` a `PlatformMetricsDto` y `topTarotistas[].completedSessions` a `TarotistaMetricsDto`.
- [x] Implementar el cálculo en `TypeOrmMetricsRepository.getPlatformMetrics` y `getTarotistaMetrics`.
- [x] Swagger actualizado; unit tests + coverage ≥ 80%.

#### 🎯 Criterios de Aceptación

- [x] `GET /tarotistas/metrics/platform` devuelve sesiones globales y por tarotista.
- [x] Tests cubren período sin sesiones (devuelve 0) y con datos.

#### 📁 Archivos involucrados

- `backend/tarot-app/src/modules/tarotistas/application/dto/metrics-query.dto.ts`
- `backend/tarot-app/src/modules/tarotistas/infrastructure/repositories/typeorm-metrics.repository.ts`
- Specs correspondientes

---

### T-ADM-002-B: Frontend — Consumir Sesiones Reales en Métricas

**Prioridad:** 🟡 Media
**Estimación:** 1 punto
**Dependencias:** T-ADM-002-A
**Cubre hallazgo:** ADM-002
**Estado:** ✅ COMPLETADA

#### ✅ Tareas específicas

- [x] Reemplazar el `0` + badge "Próximamente" (`PlatformMetricsContent.tsx:126-128`) por `metrics.completedSessions`.
- [x] Reemplazar el `-` de la columna "Sesiones" (`:194`) por `tarotista.completedSessions`.
- [x] Actualizar tipos `PlatformMetrics` en `types/` (`completedSessions` en `PlatformMetricsDto` y `TarotistaMetricsDto`).
- [x] Tests actualizados (nuevo `PlatformMetricsContent.test.tsx` + mocks en `usePlatformMetrics.test.ts` + `page.test.tsx`); 24 tests pasando.
- [x] Ciclo de calidad frontend completo (format, lint:fix, type-check, build, validate-architecture).

#### 🎯 Criterios de Aceptación

- [x] La tarjeta y la columna muestran datos reales sin badge "Próximamente".

#### 📁 Archivos involucrados

- `frontend/src/components/features/admin/PlatformMetricsContent.tsx` + test
- `frontend/src/types/` (tipos de métricas)

---

### T-ADM-003: Frontend — Resolver Dead-Links de Tarotistas

**Prioridad:** 🟠 Alta
**Estimación:** 3 pts (Opción B) / 6 pts (Opción A)
**Dependencias:** decisión de producto sobre mantener flujo multi-tarotista
**Cubre hallazgo:** ADM-003
**Estado:** ✅ COMPLETADA (Opción B — MVP single-tarotista)

#### ✅ Tareas específicas — Opción B (interino, recomendada para MVP single-tarotista)

- [x] En `TarotistasTable.tsx`, deshabilitar los items "Ver perfil" y "Configuración" (estado `disabled` + tooltip "Disponible con multi-tarotista").
- [x] En `TarotistasManagementContent.tsx`, neutralizar los `router.push` a rutas inexistentes (`/admin/tarotistas/${id}` y `/admin/tarotistas/${id}/configuracion`). Eliminado `useRouter` ya que no queda uso.
- [x] Código comentado con referencia a ADM-003.
- [x] Tests actualizados: 15 tests pasando (TarotistasTable + TarotistasManagementContent).
- [x] Ciclo de calidad frontend completo (format, lint:fix, type-check, build, validate-architecture).

#### ✅ Tareas específicas — Opción A (implementación completa, si se aprueba multi-tarotista)

- [ ] Crear `app/admin/tarotistas/[id]/page.tsx` (perfil + métricas, consumiendo backend existente).
- [ ] Crear `app/admin/tarotistas/[id]/configuracion/page.tsx` (`PUT :id/config`, `:id/config/reset`).
- [ ] Hooks/API para config de tarotista; tests; ciclo de calidad.

#### 🎯 Criterios de Aceptación

- [x] Ningún click en el menú de acciones de Tarotistas produce 404.
- [ ] (Opción A) Perfil y configuración funcionan end-to-end.

#### 📁 Archivos involucrados

- `frontend/src/components/features/admin/TarotistasManagementContent.tsx` + test
- `frontend/src/components/features/admin/TarotistasTable.tsx` + test
- (Opción A) `frontend/src/app/admin/tarotistas/[id]/...` (nuevos)

---

### T-ADM-004: Estandarizar Paginación de Security Events

**Prioridad:** 🟡 Media
**Estimación:** 3 puntos
**Dependencias:** ninguna
**Cubre hallazgo:** ADM-004
**Estado:** ✅ COMPLETADA

#### ✅ Tareas específicas

- [x] Backend: refactor `SecurityEventService.findAll` para devolver `{ data, meta: { page, limit, totalItems, totalPages } }`.
- [x] Actualizar `SecurityEventListResponse` (interface interna del servicio).
- [x] Frontend: adaptar `SecurityEventsTab.tsx` (`data.data`, `meta.page/limit`) y `admin-security.types.ts`.
- [x] Actualizar tests de controller, servicio y componente (incluyendo `useAdminSecurity.test.ts` y `admin-security-api.test.ts`).
- [x] Crear `security-event.service.spec.ts` (nuevo — 13 tests cubriendo findAll, logSecurityEvent, detectSuspiciousActivity).
- [x] Ciclos de calidad backend y frontend completos.

#### 🎯 Criterios de Aceptación

- [x] El endpoint y el componente usan el contrato estándar del proyecto.
- [x] La pestaña "Eventos de Seguridad" pagina correctamente sin regresiones.

#### 📁 Archivos involucrados

- `backend/tarot-app/src/modules/security/security-event.service.ts` (modificado)
- `backend/tarot-app/src/modules/security/security-event.service.spec.ts` (nuevo)
- `backend/tarot-app/src/modules/security/security-events.controller.spec.ts` (actualizado)
- `frontend/src/components/features/admin/SecurityEventsTab.tsx` (modificado)
- `frontend/src/components/features/admin/SecurityEventsTab.test.tsx` (nuevo)
- `frontend/src/types/admin-security.types.ts` (modificado)
- `frontend/src/hooks/api/useAdminSecurity.test.ts` (actualizado)
- `frontend/src/lib/api/admin-security-api.test.ts` (actualizado)

---

### T-ADM-005: Frontend — Tarjeta de Ahorro de Caché

**Prioridad:** 🟢 Baja
**Estimación:** 1 punto
**Dependencias:** que el backend exponga `savings` con costo real (relación con BUG-008 resuelto)
**Cubre hallazgo:** ADM-005
**Estado:** ✅ COMPLETADA

#### ✅ Tareas específicas

- [x] Si `analytics.savings` trae datos: desestructurar `savings` en `CacheStatsCards` y renderizar una 5ª tarjeta "Ahorro estimado".
- [x] Si no se implementa: eliminar la prop `savings` muerta y su `TODO`.
- [x] Tests actualizados; ciclo de calidad.

#### 🎯 Criterios de Aceptación

- [x] No queda una prop pasada-pero-ignorada: o se muestra el ahorro, o se retira la prop.

#### 📁 Archivos involucrados

- `frontend/src/components/features/admin/CacheStatsCards.tsx` + test
- `frontend/src/components/features/admin/CacheManagementContent.tsx` (si se retira la prop)

---

### T-ADM-006: (Opcional) Frontend — Gestión de IP Whitelist

**Prioridad:** 🟢 Baja
**Estimación:** 3 puntos
**Dependencias:** confirmar que la whitelist debe gestionarse por UI (y no solo por infra/seed)
**Cubre hallazgo:** ADM-006

#### ✅ Tareas específicas

- [ ] Crear `lib/api/admin-ip-whitelist-api.ts` + entradas en `API_ENDPOINTS` (`/admin/ip-whitelist`).
- [ ] Crear `hooks/api/useAdminIpWhitelist.ts` (list/add/remove).
- [ ] Agregar pestaña "IP Whitelist" en `SecurityManagementContent.tsx` con tabla + alta/baja.
- [ ] Tests + ciclo de calidad.

#### 🎯 Criterios de Aceptación

- [ ] El admin puede listar, agregar y quitar IPs permitidas desde `/admin/seguridad`.

#### 📁 Archivos involucrados

- `frontend/src/components/features/admin/SecurityManagementContent.tsx` + test
- `frontend/src/components/features/admin/IpWhitelistTab.tsx` (nuevo) + test
- `frontend/src/hooks/api/useAdminIpWhitelist.ts` (nuevo) + test
- `frontend/src/lib/api/admin-ip-whitelist-api.ts` (nuevo) + test
- `frontend/src/lib/api/endpoints.ts`

---

## RESUMEN EJECUTIVO

- **9 de 13 secciones** del panel `/admin` están correctas y completas.
- **1 sección sin implementar** (Lecturas, hoy placeholder) → ADM-001 (mayor esfuerzo).
- **3 secciones con incompletitud/roturas menores**: Métricas (sesiones), Tarotistas (dead-links), Seguridad (contrato paginación).
- **2 mejoras de baja prioridad**: tarjeta de ahorro de caché y UI de IP whitelist.
- Prioridad sugerida: **ADM-001 → ADM-003 (Opción B) → ADM-004 → ADM-002 → ADM-005 → ADM-006**.
