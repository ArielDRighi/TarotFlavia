# BACKLOG: CORRECCIÓN DE BUGS REPORTADOS — Mayo 2026

## PARTE A: REPORTE DE BUGS

**Proyecto:** Auguria - Plataforma de Servicios Místicos
**Tipo:** Corrección de defectos en módulos existentes
**Versión:** 1.0
**Fecha:** 16 de mayo de 2026
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)

---

## CONTEXTO

Durante la verificación post-deploy se detectaron bugs distribuidos en cuatro áreas (servicios, horóscopo chino, footer, header mobile) más una auditoría profunda del panel `/admin` que reveló múltiples problemas adicionales:

1. **Generación incompleta de horóscopos chinos**: tras la primera ejecución de la generación masiva (60 = 12 animales × 5 elementos), la mayoría se crearon pero algunos quedaron faltantes. No existe mecanismo de reintento automático ni endpoint que regenere solo los faltantes.
2. **Footer desproporcionadamente alto**: el `<footer>` global ocupa demasiado espacio vertical, especialmente en viewports angostos donde la lista de 7 servicios se apila en múltiples filas.
3. **Estado "Pendiente" persistente en servicios vencidos**: las compras de servicios holísticos con fecha pasada y pago no aprobado quedan eternamente con badge "Pendiente". El usuario no diferencia un pago en curso de uno abandonado/vencido, y los pagados antiguos tampoco se diferencian visualmente con claridad. Algunos usuarios de prueba ya tienen registros vencidos sin pagar.
4. **Menú hamburguesa del Header no funciona en mobile**: el botón `<Menu>` se renderiza en pantallas <768px pero no tiene handler ni panel desplegable. Como toda la navegación principal (Tarot del Día, Horóscopo, Servicios, etc.) vive en un `<div className="hidden md:flex">`, en mobile NO hay forma de navegar a las secciones principales desde el header.
5. **Panel `/admin` con múltiples regresiones**: tras auditoría completa se detectan link muerto en el sidebar, dashboard con datos mock/NaN, tracking de costos de IA reportando $0 por pricing table desactualizada, varias acciones administrativas que son `toast.info('próximamente')` (aunque los endpoints backend existen), tipos frontend desfasados respecto al backend, datos de rate-limiting en memoria que se pierden con cada reinicio, y un crash de Radix Select en la pestaña de eventos de seguridad. Adicionalmente la documentación de credenciales de seeders es inconsistente (script imprime `admin123` cuando el hash real es de `Test123456!`).

---

## ÍNDICE DE BUGS

| ID      | Bug                                                                    | Severidad | Módulo afectado          |
| ------- | ---------------------------------------------------------------------- | --------- | ------------------------ |
| BUG-001 | Horóscopos chinos faltantes tras generación masiva inicial             | 🟠 Alta   | Backend — Horoscope      |
| BUG-002 | Footer global ocupa demasiado espacio vertical                         | 🟡 Media  | Frontend — Layout        |
| BUG-003 | Compras de servicios vencidas siguen mostrando estado "Pendiente"      | 🟠 Alta   | Frontend/Backend — Holistic Services |
| BUG-004 | Menú hamburguesa del Header no funciona en mobile                      | 🔴 Crítica | Frontend — Layout        |
| BUG-005 | Credenciales documentadas inconsistentes en scripts/docs de seeders     | 🟡 Media   | Backend — Seeds/Docs     |
| BUG-006 | `/admin/lecturas` listado en sidebar pero no existe (404)               | 🔴 Crítica | Frontend — Admin Routes  |
| BUG-007 | Dashboard `/admin` muestra datos mock + `$NaN` + tabla vacía            | 🔴 Crítica | Frontend/Backend — Admin Dashboard |
| BUG-008 | Tracking de costos de IA reporta siempre `$0` (pricing table desactualizada) | 🔴 Crítica | Backend — AI Usage    |
| BUG-009 | AI Usage: tipos frontend desfasados (mismatch GROQ vs groq, falta gemini) | 🟠 Alta   | Frontend — Admin AI Usage |
| BUG-010 | Acciones admin sin implementar (Desbloquear IP, Roles, Tarotistas)      | 🟠 Alta   | Frontend — Admin Actions |
| BUG-011 | `SecurityEventsTab` crashea por `SelectItem value=""` en Radix          | 🔴 Crítica | Frontend — Admin Seguridad |
| BUG-012 | Rate-limit data en memoria: se pierde IPs bloqueadas al reiniciar       | 🟠 Alta   | Backend — Security       |
| BUG-013 | Agenda admin con `FLAVIA_TAROTISTA_ID = 1` hardcoded                    | 🟡 Media   | Frontend — Admin Agenda  |
| BUG-014 | AI Usage: sin filtro de fecha + `GROQ_DAILY_LIMIT` desfasado            | 🟡 Media   | Frontend — Admin AI Usage |
| BUG-015 | Audit logs usa contrato de paginación distinto al estándar del proyecto | 🟡 Media   | Backend — Audit Logs     |

---

## DETALLE DE BUGS

### BUG-001: Horóscopos Chinos Faltantes tras Generación Masiva Inicial

**Severidad:** 🟠 Alta
**Módulo:** `backend/tarot-app/src/modules/horoscope` (chinese-horoscope)
**Reportado por:** Ariel — verificación visual del catálogo público (16/05/2026)

#### Descripción del Problema

Tras ejecutar la generación masiva inicial (`generateAllForYear`), la base de datos quedó con menos de 60 registros de horóscopos chinos para el año actual. Algunos animales no tienen los 5 elementos completos; al entrar a la página `/horoscopo-chino/[animal]?element=...` para esas combinaciones, el detalle muestra "Horóscopo no disponible para {currentYear}".

#### Causa Raíz Identificada

En `backend/tarot-app/src/modules/horoscope/application/services/chinese-horoscope.service.ts`, el método `generateAllForYear()` (líneas 217-292):

- Itera 12 × 5 = 60 combinaciones con delay de 10s entre cada llamada IA.
- Si una generación individual lanza error (rate limit, timeout del proveedor, fallback agotado, parseo JSON inválido), **se loguea el fallo pero NO se reintenta**.
- El cron anual (`chinese-horoscope-cron.service.ts:50-101`) llama a `generateAllForYear` una sola vez y, si el resultado fue parcial, no hay job de "completar faltantes".
- El endpoint admin `POST /chinese-horoscope/admin/generate/:year` también ejecuta todas las 60 combinaciones de nuevo (no respeta `--force` selectivo) o las salta si ya existen (`generateForAnimalAndElement` retorna el existente en línea 105-110). No hay endpoint "regenerar solo faltantes".

**Resultado**: cualquier fallo transitorio en la generación inicial deja huecos permanentes que requieren intervención manual.

#### Criterios de Aceptación

1. **Dado** que la generación masiva (manual o automática) terminó con N < 60 horóscopos creados
   **Cuando** el admin (o el sistema) detecte la situación
   **Entonces** debe existir un mecanismo que identifique las combinaciones (animal, elemento) faltantes y solo genere esas.

2. **Dado** que una llamada individual a la IA falla en `generateAllForYear`
   **Cuando** el bucle continúa
   **Entonces** se debe reintentar esa combinación al menos N veces con backoff antes de marcarla como definitivamente fallida.

3. **Dado** que el admin entra al panel de horóscopos chinos
   **Cuando** consulta el estado del año actual
   **Entonces** ve un indicador `generados / 60` y un botón "Generar faltantes" que dispara solo las combinaciones ausentes.

4. **Dado** que un usuario consulta un horóscopo y resulta faltante (404)
   **Cuando** el frontend recibe la respuesta
   **Entonces** muestra un mensaje accionable ("Estamos completando los horóscopos. Volvé en unos minutos.") en lugar del genérico "no disponible".

#### Notas Técnicas

- El método `findAllByYear(year)` ya existe (`chinese-horoscope.service.ts:318`); se puede usar para listar lo que hay y diff contra `ChineseZodiacAnimal × ChineseElement`.
- El delay de 10s ya está implementado; reintentos deben mantener el rate limit.
- El cron anual también debería verificar al día siguiente que la generación quedó completa y reintentar si no.

---

### BUG-002: Footer Global Ocupa Demasiado Espacio Vertical

**Severidad:** 🟡 Media
**Módulo:** `frontend/src/components/layout/Footer.tsx`
**Reportado por:** Ariel — inspección visual (16/05/2026)

#### Descripción del Problema

El componente `Footer` se percibe "gigantesco" en distintos viewports. Apilamiento vertical excesivo entre las tres secciones (servicios, legales, copyright), padding `py-8` redundante con los márgenes internos, y wrap de la lista de 7 servicios en múltiples filas en mobile.

#### Causa Raíz Identificada

En `frontend/src/components/layout/Footer.tsx`:

- `<footer className="... py-8">` aporta 32px arriba + 32px abajo.
- La sección "Servicios" tiene `<h3 className="mb-4 ...">` + `<ul>` con `gap-4 md:gap-6`. En mobile, los 7 links (`Carta del Día`, `Horóscopo`, `Horóscopo Chino`, `Numerología`, `Rituales`, `Péndulo`, `Carta Astral`) hacen `flex-wrap` y se acomodan en 3-4 filas con gap vertical generoso.
- `mb-6` entre Servicios y Legales + `mb-4` entre Legales y Copyright apilan separadores adicionales.
- El título "Nuestros Servicios" (h3) suma altura sin agregar contenido informativo crítico en mobile.

Resultado: en pantallas <768px el footer puede superar 350–400px de alto, ocupando más que mucho contenido above-the-fold.

#### Criterios de Aceptación

1. **Dado** que estoy en mobile (<640px)
   **Cuando** abro cualquier página y hago scroll al final
   **Entonces** el footer ocupa ≤ 180px de alto total.

2. **Dado** que estoy en desktop (≥1024px)
   **Cuando** veo el footer
   **Entonces** ocupa ≤ 120px y los servicios entran en una sola línea.

3. **Dado** que veo los links del footer
   **Cuando** los inspecciono en cualquier viewport
   **Entonces** mantienen target táctil mínimo de 32–40px y separación legible.

4. **Dado** que cargo la home (landing) o cualquier ruta
   **Cuando** mido la captura con Playwright/Lighthouse
   **Entonces** la altura del `<footer role="contentinfo">` está bajo los límites del punto 1 y 2.

#### Notas Técnicas

- Reducir `py-8` a `py-4` (o usar `py-5 md:py-6`).
- Considerar eliminar el `<h3>` "Nuestros Servicios" o convertirlo en `sr-only`.
- Mergear las dos `<nav>` (servicios y legales) en una sola fila multi-grupo en desktop.
- Reemplazar `mb-6` / `mb-4` por `space-y-3` en el contenedor.
- Validar visualmente con Playwright (`page.locator('footer').boundingBox()`).
- Coordinar con `BACKLOG_CONSISTENCIA_UI.md` si ya existe tarea relacionada.

---

### BUG-003: Compras de Servicios Vencidas Siguen Mostrando Estado "Pendiente"

**Severidad:** 🟠 Alta
**Módulo:** `frontend/src/lib/utils/holistic-services.ts` + listados de "Mis Servicios"
**Reportado por:** Ariel — usuarios de prueba con compras antiguas (16/05/2026)

#### Descripción del Problema

En la sección "Mis Servicios" (lista completa y widget del dashboard), las compras agendadas para fechas ya pasadas conservan el badge "Pendiente" si el pago nunca fue aprobado. El usuario no distingue:

- Una compra recién creada esperando confirmación de pago.
- Una compra abandonada cuya fecha ya pasó (vencida sin pagar).
- Una compra pagada de un turno ya transcurrido (debería verse "Completado").

Los usuarios de prueba (`free@test.com`, `premium@test.com`, `admin@test.com`) tienen ambas variantes: vencidas sin pagar y pagadas vencidas. Las primeras nunca dejan de aparecer como "Pendiente"; las pagadas vencidas pueden funcionar pero conviene revisar.

#### Causa Raíz Identificada

En `frontend/src/lib/utils/holistic-services.ts:35-43`:

```ts
export function deriveDisplayStatus(purchase: ServicePurchase): DisplayStatus {
  if (purchase.paymentStatus !== 'paid') return purchase.paymentStatus;
  if (!purchase.selectedDate) return 'completed';
  const appointmentDate = parseDateString(purchase.selectedDate);
  const today = new Date();
  return appointmentDate >= today ? 'confirmed' : 'completed';
}
```

- Si `paymentStatus !== 'paid'` la función **devuelve directamente `paymentStatus`** sin consultar `selectedDate`. Una compra `pending` con turno del mes pasado sigue devolviendo `pending` → badge "Pendiente".
- No existe un estado de display "Vencido" / "Expirado" para compras `pending` con fecha pasada.
- Backend tampoco tiene un job que mueva esas compras a `CANCELLED` (o un estado nuevo `EXPIRED`).

`STATUS_LABEL` y `STATUS_COLOR` en `MyServicesList.tsx:30-44` y `STATUS_CONFIG` en `MyServicesWidget.tsx:18-24` no contemplan el caso "vencido".

#### Criterios de Aceptación

1. **Dado** que tengo una compra con `paymentStatus = pending` y `selectedDate < hoy`
   **Cuando** abro "Mis Servicios" o el dashboard
   **Entonces** veo el badge **"Vencido"** (rojo o gris) y NO "Pendiente".

2. **Dado** que tengo una compra con `paymentStatus = pending` y `selectedDate >= hoy` (o sin fecha)
   **Cuando** abro la lista
   **Entonces** sigo viendo "Pendiente" con la opción de completar el pago en MP.

3. **Dado** que tengo una compra `paid` con `selectedDate < hoy`
   **Cuando** abro la lista
   **Entonces** sigo viendo "Completado" (comportamiento actual, validar que se mantiene).

4. **Dado** que una compra `pending` vence (fecha pasada)
   **Cuando** se ejecuta el cron diario del backend
   **Entonces** opcionalmente se marca como `CANCELLED` con motivo `EXPIRED_UNPAID` (decisión de producto: ¿solo display o también persistir?).

5. **Dado** que el usuario quiere limpiar sus compras vencidas
   **Cuando** clickea "Eliminar" en una compra vencida
   **Entonces** se llama al endpoint de cancelación o de borrado lógico (definir alcance).

6. **Dado** que el admin entra al listado de pagos pendientes
   **Cuando** filtra
   **Entonces** puede separar pagos `pending` vigentes de los `vencidos sin pago` (importante para no spammear con recordatorios).

#### Notas Técnicas

- Frontend: extender `DisplayStatus` con `'expired'`; agregar lógica `if (paymentStatus === 'pending' && hasPastDate) return 'expired'`.
- Frontend: agregar entradas en `STATUS_LABEL`, `STATUS_COLOR`, `STATUS_CONFIG`.
- Decidir si la acción "Completar pago" se oculta en estado `expired`.
- Backend (opcional, fase 2): cron que actualice DB; o solo derivar en frontend si no se quiere migración.
- Considerar incluir filtros en `/mis-servicios` (Vigentes / Vencidos / Pagados / Todos).
- Confirmar con producto: ¿permitir al usuario eliminar/ocultar compras vencidas?

---

### BUG-004: Menú Hamburguesa del Header No Funciona en Mobile

**Severidad:** 🔴 Crítica (bloquea la navegación principal en mobile)
**Módulo:** `frontend/src/components/layout/Header.tsx`
**Reportado por:** Ariel — uso desde dispositivo móvil (16/05/2026)

#### Descripción del Problema

Al ingresar desde un viewport mobile (<768px), el `Header` muestra el ícono de menú hamburguesa, pero al tocarlo **no pasa nada**. Como toda la barra de navegación principal (Tarot del Día, Horóscopo, Horóscopo Chino, Numerología, Rituales, Enciclopedia, Péndulo, Carta Astral, Servicios, Tirada de Tarot, Premium) vive en un contenedor con `hidden md:flex`, en mobile el usuario solo ve el logo "Auguria", la campana de notificaciones y el `UserMenu`. No tiene forma de llegar a las páginas principales desde el header.

#### Causa Raíz Identificada

En `frontend/src/components/layout/Header.tsx`:

- Líneas 28-38 — el botón hamburguesa está renderizado pero es **estático**:
  ```tsx
  <Button
    variant="ghost"
    size="icon"
    className="md:hidden"
    aria-label="Menú"
    aria-expanded={false}     // hardcoded
    aria-haspopup="true"
  >
    <Menu className="size-5" />
  </Button>
  ```
  - NO tiene `onClick`.
  - NO hay `useState` para abrir/cerrar.
  - NO existe panel/drawer/sheet asociado.
  - El comentario en línea 28 lo confirma: `{/* Mobile menu button - TODO: Implement mobile navigation panel in TASK 2.3 */}` — quedó como deuda técnica nunca completada.

- Líneas 46-143 — toda la nav (`<div className="hidden items-center gap-6 md:flex">`) está oculta en mobile sin alternativa.

- Hay primitives shadcn disponibles para resolverlo: `frontend/src/components/ui/sheet.tsx` y `frontend/src/components/ui/dialog.tsx`.

**Resultado**: en mobile el usuario depende del Footer (con los mismos problemas reportados en BUG-002), del UserMenu (solo para usuarios autenticados y con un set distinto de links) o de tipear URLs a mano.

#### Criterios de Aceptación

1. **Dado** que estoy en mobile (<768px) y toco el ícono hamburguesa
   **Cuando** se renderiza el menú
   **Entonces** se abre un panel lateral (Sheet/Drawer) con todos los links de la navegación principal y, si estoy autenticado, los links extra (Tirada de Tarot, Premium).

2. **Dado** que el menú está abierto
   **Cuando** toco un link
   **Entonces** navego a la ruta y el menú se cierra automáticamente.

3. **Dado** que el menú está abierto
   **Cuando** toco el botón de cierre, el backdrop, o presiono `Escape`
   **Entonces** el menú se cierra y el foco vuelve al botón hamburguesa.

4. **Dado** que el menú está cerrado/abierto
   **Cuando** un lector de pantalla inspecciona el botón
   **Entonces** `aria-expanded` refleja el estado real (`true`/`false`) y `aria-controls` apunta al id del panel.

5. **Dado** que estoy en desktop (≥768px)
   **Cuando** se renderiza el header
   **Entonces** el botón hamburguesa no es visible y la nav horizontal funciona como hasta ahora (sin regresiones).

6. **Dado** que el plan del usuario es no-premium
   **Cuando** se abre el menú mobile autenticado
   **Entonces** se muestra el link "Premium" con el ícono `Star`; si es premium, no aparece (mismo comportamiento que desktop).

7. **Dado** que la ruta actual coincide con un link del menú (ej: `/servicios`)
   **Cuando** se renderiza el panel mobile
   **Entonces** ese link se muestra como activo (mismo estilo `text-primary font-semibold` que usa desktop para Servicios).

#### Notas Técnicas

- Usar `@/components/ui/sheet` (shadcn ya instalado) con `side="left"` o `side="right"`.
- Estado local en `Header.tsx` con `useState<boolean>(false)` para abrir/cerrar; cerrar en `usePathname` change (cuando navega) o pasando un callback `onClick={() => setOpen(false)}` a cada `Link`.
- Considerar extraer la lista de links a un array o componente compartido (`<NavLinks variant="mobile" />` / `<NavLinks variant="desktop" />`) para evitar duplicación.
- Atajos de accesibilidad: focus trap automático del Sheet, cerrar con `Escape` ya viene incluido en shadcn.
- Validar que el `NotificationBell` y `UserMenu` sigan siendo accesibles fuera del Sheet en mobile (no se duplican).
- Confirmar con producto si el menú mobile debe incluir TAMBIÉN los links de UserMenu (perfil, configuración, logout) o solo la navegación principal.

---

### BUG-005: Credenciales Documentadas Inconsistentes en Seeders

**Severidad:** 🟡 Media
**Módulo:** `backend/tarot-app/scripts/db-seed-users.ts` + `backend/tarot-app/docs/USERS.md`

#### Causa Raíz

- `backend/tarot-app/src/database/seeds/users.seeder.ts:43` hashea **`Test123456!`** y lo aplica a los 3 usuarios de prueba (free/premium/admin).
- `backend/tarot-app/scripts/db-seed-users.ts:31-33` imprime al usuario credenciales **falsas**: `admin123 / premium123 / free123`. Estas nunca funcionan porque NO coinciden con el hash en BD.
- `docs/USERS.md` (líneas 1-20) sí tiene las credenciales correctas (`Test123456!`).

Para un dev nuevo (especialmente cambiando de SO como el usuario actual) esto genera fricción innecesaria: corre `npm run db:seed:users`, lee la salida con `admin123`, intenta loguearse y falla.

#### Criterios de Aceptación

- `db-seed-users.ts` imprime las credenciales reales (`Test123456!` para todos).
- `USERS.md` se mantiene como única fuente de verdad.

---

### BUG-006: `/admin/lecturas` Listado en Sidebar pero No Existe

**Severidad:** 🔴 Crítica
**Módulo:** `frontend/src/lib/config/admin-navigation.ts` + `frontend/src/app/admin/lecturas/`

#### Causa Raíz

- [admin-navigation.ts:40](frontend/src/lib/config/admin-navigation.ts#L40) declara `{ name: 'Lecturas', href: '/admin/lecturas', icon: BookOpen }`.
- No existe `frontend/src/app/admin/lecturas/page.tsx`.
- Resultado: cualquier click desde el sidebar lleva a 404.

#### Criterios de Aceptación

- O bien se elimina la entrada del sidebar mientras la sección no exista.
- O bien se crea el `page.tsx` mínimo con un placeholder "En construcción" y se planea su implementación.

---

### BUG-007: Dashboard `/admin` con Datos Mock + `$NaN` + Tabla Vacía

**Severidad:** 🔴 Crítica
**Módulo:** Frontend admin dashboard + Backend `/admin/dashboard/stats`

#### Causa Raíz

Tres defectos cohabitan en el dashboard principal:

1. **Tabla "Lecturas Recientes" siempre vacía**:
   - Backend `getStats()` (`backend/tarot-app/src/modules/admin/dto/stats-response.dto.ts:288-309` y `admin-dashboard.service.ts:257-273`) devuelve `{ users, readings, cards, openai, questions }`.
   - Frontend espera `stats.recentReadings` (`frontend/src/types/admin.types.ts:84`, `frontend/src/app/admin/page.tsx:123-124`).
   - Resultado: la tabla siempre cae al `EmptyState`. El campo existe en el endpoint deprecado `/admin/dashboard/metrics` pero no en `/stats`.

2. **Card "Revenue del Mes" = `$NaN`**:
   - `frontend/src/lib/utils/dashboard-utils.ts:54-58`: `monthlyRevenue.value = stats.openai.totalCost * 10`.
   - Backend devuelve `openai.totalCostUsd` (`stats-response.dto.ts:215`), pero el tipo frontend lo declara como `openai.totalCost` (`admin.types.ts:55`).
   - `undefined * 10 = NaN`.

3. **Card "Tarotistas Activos" = 25 mock hardcoded**:
   - `frontend/src/lib/utils/dashboard-utils.ts:47-51`: `value: 25` con comentario "backend no tiene este dato aún".

#### Criterios de Aceptación

- La tabla "Lecturas Recientes" se llena con datos reales (extender el endpoint `/stats` o consumir `/metrics`).
- "Revenue del Mes" muestra un valor numérico real o se reemplaza por algo informativo (no `$NaN`).
- "Tarotistas Activos" muestra el count real desde el backend (no `25` hardcoded).

---

### BUG-008: Tracking de Costos de IA Reporta Siempre `$0`

**Severidad:** 🔴 Crítica
**Módulo:** `backend/tarot-app/src/modules/ai-usage/ai-usage.service.ts`

#### Causa Raíz

- Cada llamada de IA SÍ se persiste en `ai_usage_logs` vía `AIProviderService.generateCompletion → AIUsageService.createLog` (verificado: módulos horoscope/chinese-horoscope/numerology/birth-chart usan el mismo flujo).
- Pero la **pricing table** [ai-usage.service.ts:39-44](backend/tarot-app/src/modules/ai-usage/ai-usage.service.ts#L39-L44) tiene `GROQ: { input: 0, output: 0 }` y `GEMINI: { input: 0, output: 0 }`.
- Dado que Groq es el proveedor principal según `CLAUDE.md`, el `costUsd` persistido es **siempre 0** para todas las llamadas exitosas.
- El card "Costo Total" en `/admin/ai-usage` queda en `$0.0000` aunque haya miles de llamadas registradas.

#### Criterios de Aceptación

- `COST_PER_MILLION_TOKENS` se actualiza con los precios reales/aproximados de Groq, Gemini, DeepSeek y OpenAI por modelo.
- Existe documentación interna de dónde se obtuvieron esos precios (link a pricing page o decisión explícita de "Groq es free tier → $0").
- Idealmente: agregar migration que actualice `costUsd` de logs históricos (fase 2).
- El admin ve un costo total > 0 si hubo llamadas con proveedor pago.

---

### BUG-009: AI Usage — Tipos Frontend Desfasados vs Backend

**Severidad:** 🟠 Alta
**Módulo:** `frontend/src/types/admin.types.ts`

#### Causa Raíz

- Frontend declara `provider: 'GROQ' | 'OPENAI' | 'DEEPSEEK'` (uppercase, sin Gemini) en `admin.types.ts:104`.
- Backend devuelve enum **lowercase** `'groq' | 'deepseek' | 'openai' | 'gemini'` (`ai-usage-log.entity.ts:13-18`).
- Cualquier comparación tipo `provider === 'GROQ'` en frontend no matchea nunca.
- La tabla renderiza filas de Gemini pese a que el tipo no las admite (TS no rompe en runtime pero pierde garantías).
- Adicional: `OpenAIStatsDto` frontend tiene `aiCostsPerDay`, backend tiene `costsPerDay` (otro mismatch silencioso).

#### Criterios de Aceptación

- `admin.types.ts` se alinea con los DTOs del backend: provider lowercase, incluir `'gemini'`, renombrar `aiCostsPerDay → costsPerDay`, `totalCost → totalCostUsd`.
- Tests de tipo (`tsc --noEmit`) pasan.
- Renderizado de la tabla mantiene labels human-readable (mostrar `'Groq'` aunque el tipo sea `'groq'`).

---

### BUG-010: Acciones Admin Sin Implementar

**Severidad:** 🟠 Alta
**Módulo:** Múltiples componentes en `frontend/src/components/features/admin/`

#### Causa Raíz

Varias acciones del admin muestran `toast.info('...próximamente')` aunque los endpoints backend ya existen:

1. **Desbloquear IP**: `RateLimitingTab.tsx:47-53` solo muestra toast; el backend tampoco expone `DELETE /admin/security/block-ip/:ip` (ver TODO en `endpoints.ts:250-252`). El AlertDialog se ve funcional pero no hace nada.

2. **Gestionar Roles de usuarios**: `UsersManagementContent.tsx:56-60` muestra `toast.info('Gestión de roles: próximamente')`, pero los endpoints `ADD_TAROTIST_ROLE` / `REMOVE_TAROTIST_ROLE` / `ADD_ADMIN_ROLE` / `REMOVE_ADMIN_ROLE` **ya existen** (`admin-users.controller.ts:233,281,329`).

3. **Acciones de Tarotistas**: `TarotistasManagementContent.tsx:84-94` deja `view-profile`, `edit-config`, `view-metrics` como `toast.info('...próximamente')`. El endpoint `TAROTISTA_CONFIG` ya existe (`endpoints.ts:235`).

#### Criterios de Aceptación

- Implementar handlers reales para los 3 grupos de acciones (o priorizar — ver Parte B).
- Donde el endpoint backend falta (ej. unblock IP), agregarlo o explicitar como tarea separada.

---

### BUG-011: `SecurityEventsTab` Crashea por `SelectItem value=""`

**Severidad:** 🔴 Crítica
**Módulo:** `frontend/src/components/features/admin/SecurityEventsTab.tsx`

#### Causa Raíz

- Líneas 117 y 149 del componente usan `<SelectItem value="">Todos/Todas</SelectItem>`.
- Radix Select (base de shadcn) lanza: `A <Select.Item /> must have a value prop that is not an empty string`.
- Resultado probable: la pestaña "Eventos de Seguridad" crashea al abrirse, o al menos los filtros "Tipo de Evento" y "Severidad" no funcionan.

#### Criterios de Aceptación

- Reemplazar `value=""` por un valor centinela como `"all"` y filtrar en el handler.
- Tests de renderizado de la tab sin errores.

---

### BUG-012: Rate-Limit Data en Memoria — Se Pierde al Reiniciar

**Severidad:** 🟠 Alta
**Módulo:** `backend/tarot-app/src/common/services/ip-blocking.service.ts`

#### Causa Raíz

- Líneas 27-28: `violations` y `blockedIPs` se almacenan como `Map<string, ...>` en memoria del proceso.
- Cada deploy/reinicio borra todas las violaciones y todas las IPs bloqueadas.
- En entornos serverless/multi-instance esto además NUNCA funcionaría correctamente (cada instancia tiene su propio Map).

#### Criterios de Aceptación

- Persistir violaciones y bloqueos en BD o Redis (definir según infra disponible).
- Tras restart, el estado persiste.
- Si se elige BD: nueva tabla `ip_blocks` con `ip, blocked_until, reason, created_at`.

---

### BUG-013: Agenda Admin con Tarotista ID Hardcoded

**Severidad:** 🟡 Media (porque hoy hay 1 tarotista MVP, pero deuda técnica)
**Módulo:** `frontend/src/components/features/admin/AgendaManagementContent.tsx`

#### Causa Raíz

- Línea 51: `const FLAVIA_TAROTISTA_ID = 1;`
- Si por re-seed o migración la ID de Flavia cambia, toda la gestión de agenda falla silenciosamente.
- Bloquea el escalamiento a multi-tarotista (decisión arquitectónica documentada en CLAUDE.md: MVP single tarotista, pero el código asume el ID).

#### Criterios de Aceptación

- Resolver el `tarotistaId` desde el backend (endpoint `/tarotistas/me` o `/tarotistas?primary=true`).
- O al menos extraerlo a una constante de configuración con comentario explícito.
- Tests que cubran el caso de "tarotista no encontrado".

---

### BUG-014: AI Usage — Sin Filtro de Fecha + Límites Desfasados

**Severidad:** 🟡 Media
**Módulo:** `frontend/src/components/features/admin/AIUsageMetricsCards.tsx` + `AIUsageContent.tsx`

#### Causa Raíz

1. `AIUsageContent.tsx:19` llama a `useAIUsageStats()` sin params. El hook acepta `startDate/endDate` pero no hay selector de período en la UI. Cada visita carga el histórico completo, distorsionando "Costo Total" y "Tasa de Éxito".
2. `AIUsageMetricsCards.tsx:14` declara `GROQ_DAILY_LIMIT = 14400`. Backend usa `ALERT_THRESHOLDS.groqDailyLimit = 12000` (`ai-usage.service.ts:47`). El indicador "Groq hoy: X / 14400" jamás coincide con el threshold real de alerta.

#### Criterios de Aceptación

- UI con date range picker (hoy / última semana / mes / custom).
- El daily limit del frontend se importa del backend (DTO) o se centraliza en una sola constante.

---

### BUG-015: Audit Logs Usa Contrato de Paginación Distinto al Estándar

**Severidad:** 🟡 Media
**Módulo:** `backend/tarot-app/src/modules/audit/audit-log.service.ts`

#### Causa Raíz

- Líneas 17-20 devuelven `{ currentPage, itemsPerPage, totalItems, totalPages }`.
- `CLAUDE.md` (raíz, regla #3 "Contratos de API") exige `{ data: [], meta: { page, limit, totalItems, totalPages } }`.
- Funciona porque el frontend de audit lee los campos directos, pero rompe el contrato global. Otras tablas (tarotistas, usuarios) usan `meta.page/limit`.

#### Criterios de Aceptación

- Refactor del response a la forma estándar.
- Frontend de Audit Logs adaptado.
- Tests del controller actualizados.

---

---

## PARTE B: TAREAS TÉCNICAS

> **Convención de IDs:** `T-BUG-XX-A/B` = subtarea (A = backend, B = frontend)
> Estimación en puntos de historia (1 punto ≈ 0.5 día).

### Índice de Tareas Técnicas

| ID         | Tarea                                                                       | Tipo        | Prioridad   | Estimación |
| ---------- | --------------------------------------------------------------------------- | ----------- | ----------- | ---------- |
| T-BUG-001-A | Reintento + endpoint "generar faltantes" para horóscopos chinos             | Backend     | ✅ COMPLETADA  | 5 pts      |
| T-BUG-001-B | UI de estado del año + acción "Generar faltantes" en admin                  | Frontend    | 🟠 Alta     | 3 pts      |
| T-BUG-001-C | Mensaje accionable en página pública cuando falta horóscopo (404)           | Frontend    | 🟡 Media    | 1 pt       |
| T-BUG-002   | Compactar Footer (reducir altura y wrap excesivo)                           | Frontend    | 🟡 Media    | 2 pts      |
| T-BUG-003-A | Derivar estado `expired` para compras `pending` con fecha pasada (frontend) | Frontend    | 🔴 Crítica  | 3 pts      |
| T-BUG-003-B | (Opcional) Cron backend que marque compras `pending` vencidas               | Backend     | 🟡 Media    | 3 pts      |
| T-BUG-003-C | Acción de usuario "Eliminar compra vencida" + filtros en Mis Servicios     | Frontend    | 🟡 Media    | 2 pts      |
| T-BUG-004   | Implementar menú hamburguesa mobile en Header con Sheet                    | Frontend    | 🔴 Crítica  | 3 pts      |
| T-BUG-005   | Corregir credenciales impresas por `db-seed-users.ts`                      | Backend     | 🟡 Media    | 0.5 pt     |
| T-BUG-006   | Crear página placeholder `/admin/lecturas` (o quitar del sidebar)          | Frontend    | 🔴 Crítica  | 1 pt       |
| T-BUG-007-A | Backend: extender `/admin/dashboard/stats` con `recentReadings` + counts reales | Backend  | 🔴 Crítica  | 3 pts      |
| T-BUG-007-B | Frontend: corregir tipos + eliminar mocks del dashboard                    | Frontend    | 🔴 Crítica  | 2 pts      |
| T-BUG-008   | Actualizar pricing table de IA + recalcular costos históricos              | Backend     | 🔴 Crítica  | 3 pts      |
| T-BUG-009   | Alinear tipos frontend de AI Usage con DTOs backend                        | Frontend    | 🟠 Alta     | 1 pt       |
| T-BUG-010-A | Implementar "Desbloquear IP" (frontend + endpoint backend)                 | Full-stack  | 🟠 Alta     | 2 pts      |
| T-BUG-010-B | Implementar "Gestionar roles" en Usuarios admin                            | Frontend    | 🟠 Alta     | 3 pts      |
| T-BUG-010-C | Implementar acciones de Tarotistas (perfil/config IA/métricas)             | Frontend    | 🟡 Media    | 3 pts      |
| T-BUG-011   | Fix `SelectItem value=""` en `SecurityEventsTab`                            | Frontend    | 🔴 Crítica  | 0.5 pt     |
| T-BUG-012   | Persistir rate-limit / IP blocks fuera de memoria                          | Backend     | 🟠 Alta     | 3 pts      |
| T-BUG-013   | Eliminar `FLAVIA_TAROTISTA_ID` hardcoded en agenda admin                   | Frontend    | 🟡 Media    | 1 pt       |
| T-BUG-014   | Date range picker en AI Usage + centralizar `GROQ_DAILY_LIMIT`             | Frontend    | 🟡 Media    | 2 pts      |
| T-BUG-015   | Migrar respuesta de Audit Logs al contrato estándar `{ data, meta }`       | Backend     | 🟡 Media    | 2 pts      |

**Estimación total:** ~49 puntos (~25 días con TDD + ciclo de calidad).

---

## TAREAS DETALLADAS

### T-BUG-001-A: Reintento + Endpoint "Generar Faltantes" para Horóscopos Chinos

**Estado:** ✅ COMPLETADA
**Prioridad:** 🔴 Crítica
**Estimación:** 5 puntos
**Dependencias:** ninguna
**Cubre BUG:** BUG-001

#### 📋 Descripción

Hacer robusta la generación masiva agregando reintentos por combinación fallida y un nuevo endpoint que regenere únicamente los horóscopos faltantes para un año dado. Actualizar el cron anual para que verifique a las 24 hs si la generación quedó completa.

#### ✅ Tareas específicas

**Servicio (`chinese-horoscope.service.ts`):**

- [x] Agregar método `findMissingCombinationsForYear(year): Promise<{ animal, element }[]>` que compare contra los 60 esperados.
- [x] Agregar método `generateMissingForYear(year): Promise<{ successful, failed, results }>` que solo genere las combinaciones faltantes (reusa `generateForAnimalAndElement`).
- [x] Modificar `generateAllForYear` (o el helper privado): por cada combinación, intentar hasta `MAX_RETRIES = 3` con backoff exponencial (10s, 20s, 40s) antes de marcar como fallida definitiva.
- [x] Asegurar que `generateForAnimalAndElement` no rompa el bucle si lanza (catch ya existe en línea 265-277, solo añadir retry layer).

**Cron (`chinese-horoscope-cron.service.ts`):**

- [x] Agregar segundo cron (16 de diciembre a las 12:00 UTC) que verifique si `findMissingCombinationsForYear(nextYear).length > 0` y llame a `generateMissingForYear` si corresponde.
- [x] Loguear cantidad de faltantes + resultado del reintento.

**Controller (`chinese-horoscope.controller.ts`):**

- [x] Agregar `GET /chinese-horoscope/admin/status/:year` que retorne `{ year, total: 60, generated: N, missing: [...] }`.
- [x] Agregar `POST /chinese-horoscope/admin/generate-missing/:year` que dispare `generateMissingForYear`.
- [x] Ambos endpoints requieren `JwtAuthGuard + AdminGuard`.
- [x] Documentación Swagger en español.

**Tests:**

- [x] Unit tests para `findMissingCombinationsForYear` (varios escenarios: vacío, parcial, completo).
- [x] Unit tests para `generateMissingForYear` (mock del provider IA).
- [x] Unit tests para retry logic con mock que falle N veces y luego responda OK.
- [x] Unit tests para el nuevo cron (con `jest.useFakeTimers()`).
- [x] Tests de controller para los dos endpoints nuevos.
- [x] Coverage ≥ 80%.

#### 🎯 Criterios de Aceptación

- [x] Si una combinación falla 3 veces, queda registrada como fallida pero no detiene al resto.
- [x] El endpoint de status devuelve correctamente las combinaciones faltantes.
- [x] `generateMissingForYear(year)` NUNCA regenera horóscopos existentes.
- [x] El cron de respaldo se ejecuta solo si quedan faltantes.
- [x] `npm run test:cov && npm run build && node scripts/validate-architecture.js` pasan.

#### 📁 Archivos involucrados

- `backend/tarot-app/src/modules/horoscope/application/services/chinese-horoscope.service.ts`
- `backend/tarot-app/src/modules/horoscope/application/services/chinese-horoscope-cron.service.ts`
- `backend/tarot-app/src/modules/horoscope/infrastructure/controllers/chinese-horoscope.controller.ts`
- `backend/tarot-app/src/modules/horoscope/application/services/chinese-horoscope.service.spec.ts`
- `backend/tarot-app/src/modules/horoscope/application/services/chinese-horoscope-cron.service.spec.ts`
- `backend/tarot-app/src/modules/horoscope/infrastructure/controllers/chinese-horoscope.controller.spec.ts`

---

### T-BUG-001-B: UI Admin — Estado del Año y Acción "Generar Faltantes"

**Prioridad:** 🟠 Alta
**Estimación:** 3 puntos
**Dependencias:** T-BUG-001-A
**Cubre BUG:** BUG-001
**Estado:** ✅ COMPLETADA

#### ✅ Tareas específicas

- [x] En el panel admin de horóscopos chinos (ruta `/admin/horoscopo-chino`) mostrar un card con `Generados: N / 60` para el año en curso.
- [x] Listar las combinaciones faltantes en una tabla colapsable (animal + elemento + emoji).
- [x] Botón "Generar faltantes" que llame al nuevo endpoint `POST /chinese-horoscope/admin/generate-missing/:year` y muestre toast con resultado.
- [x] Polling/refetch automático del status mientras la generación está en curso (intervalo 30s con `enabled` controlado por estado local).
- [x] Tests del componente con jest mocks del hook (23 tests en total).
- [x] Coverage ≥ 80%.

#### 🎯 Criterios de Aceptación

- El admin ve a simple vista cuántos horóscopos quedan por generar.
- Tras hacer click en "Generar faltantes" la UI refleja el progreso y, al terminar, el contador queda en `60/60`.
- Si la generación devuelve fallidos, se listan con el error correspondiente.
  > ⚠️ **Out-of-scope (T-BUG-001-B):** el endpoint `POST generate-missing` es fire-and-forget y solo retorna `{ message, details }` — no expone la lista de combinaciones fallidas individualmente. Este criterio requiere un nuevo endpoint en el backend (fuera del alcance de T-BUG-001-A/B). Se pospone para una tarea futura cuando el backend lo soporte.

#### 📁 Archivos creados/modificados

- `frontend/src/app/admin/horoscopo-chino/page.tsx` (nuevo)
- `frontend/src/app/admin/horoscopo-chino/page.test.tsx` (nuevo)
- `frontend/src/components/features/admin/ChineseHoroscopeAdminPanel.tsx` (nuevo)
- `frontend/src/components/features/admin/ChineseHoroscopeAdminPanel.test.tsx` (nuevo)
- `frontend/src/hooks/api/useAdminChineseHoroscope.ts` (nuevo)
- `frontend/src/hooks/api/useAdminChineseHoroscope.test.ts` (nuevo)
- `frontend/src/lib/api/admin-chinese-horoscope-api.ts` (nuevo)
- `frontend/src/lib/api/admin-chinese-horoscope-api.test.ts` (nuevo)
- `frontend/src/lib/api/endpoints.ts` (agregados `CHINESE_HOROSCOPE.ADMIN_STATUS` y `ADMIN_GENERATE_MISSING`)
- `frontend/src/types/admin-chinese-horoscope.types.ts` (nuevo)
- `frontend/src/types/index.ts` (exportaciones del nuevo tipo)
- `frontend/src/components/features/admin/index.ts` (exportación del nuevo componente)
- `frontend/src/lib/config/admin-navigation.ts` (entrada "Horóscopo Chino" en SISTEMA)

---

### T-BUG-001-C: Mensaje Accionable cuando Falta Horóscopo en Página Pública

**Prioridad:** 🟡 Media
**Estimación:** 1 punto
**Dependencias:** ninguna (puede ir en paralelo con T-BUG-001-A)
**Cubre BUG:** BUG-001
**Estado:** ✅ COMPLETADA

#### ✅ Tareas específicas

- [x] En `frontend/src/components/features/chinese-horoscope/AnimalHoroscopePage.tsx` (línea 124) reemplazar el texto plano "Horóscopo no disponible para {currentYear}" por un componente más empático: ícono + mensaje + botón "Volver al listado".
- [x] Si el error es 404, sugerir reintentar más tarde; si es 5xx, ofrecer reintento inmediato.
- [x] Asegurar que el `Spinner` siga funcionando durante `isLoading`.
- [x] Test de renderizado por estado (loading / error 404 / error 5xx / éxito).

#### 🎯 Criterios de Aceptación

- El mensaje deja claro que el horóscopo está "en preparación" y no es un error del usuario.
- El usuario tiene una vía de salida visible (volver, otro animal).

#### 📁 Archivos involucrados

- `frontend/src/components/features/chinese-horoscope/AnimalHoroscopePage.tsx`
- `frontend/src/components/features/chinese-horoscope/AnimalHoroscopePage.test.tsx` (si existe; si no, crear/agregar bloque al test del page)

---

### T-BUG-002: Compactar Footer Global

**Prioridad:** 🟡 Media
**Estimación:** 2 puntos
**Dependencias:** ninguna
**Cubre BUG:** BUG-002

#### ✅ Tareas específicas

- [ ] En `frontend/src/components/layout/Footer.tsx`:
  - [ ] Reducir `py-8` → `py-4 md:py-5`.
  - [ ] Convertir el `<h3>` "Nuestros Servicios" a `sr-only` (o eliminarlo si producto lo aprueba).
  - [ ] Reemplazar la doble separación (`mb-6` + `mb-4`) por un contenedor con `space-y-3 md:space-y-2`.
  - [ ] Considerar fusionar las dos `<nav>` (servicios + legales) en una sola fila en desktop (`md:flex-row`) con un separador vertical (`md:divide-x`).
  - [ ] Asegurar que en mobile (<640px) los 7 servicios entren en máximo 2 filas (reducir `gap-4` a `gap-x-3 gap-y-1.5`).
- [ ] Actualizar/crear test visual con `getByRole('contentinfo')` y verificar altura razonable mediante snapshot estructural (no pixel-perfect).
- [ ] Validación con Playwright local (chequeo manual con `page.locator('footer').boundingBox()`); documentar capturas antes/después en el PR.

#### 🎯 Criterios de Aceptación

- Altura medida del footer:
  - Mobile (375px): ≤ 180px.
  - Desktop (1280px): ≤ 120px.
- Los links siguen siendo legibles y clickeables (≥32px de área táctil).
- No se rompe accesibilidad (la navegación sigue con `aria-label`).
- Tests existentes de `Footer.test.tsx` siguen pasando.

#### 📁 Archivos involucrados

- `frontend/src/components/layout/Footer.tsx`
- `frontend/src/components/layout/Footer.test.tsx`

---

### T-BUG-003-A: Estado `expired` para Compras `pending` con Fecha Pasada (Frontend)

**Prioridad:** 🔴 Crítica
**Estimación:** 3 puntos
**Dependencias:** ninguna
**Cubre BUG:** BUG-003

#### 📋 Descripción

Modificar la lógica de derivación de estado en `holistic-services.ts` para distinguir "Pendiente" (compras vigentes) de "Vencido" (pago no realizado y fecha del turno ya pasó). Actualizar listados y widget para reflejar el nuevo estado.

#### ✅ Tareas específicas

**Util (`frontend/src/lib/utils/holistic-services.ts`):**

- [ ] Extender `DisplayStatus` con `'expired'`.
- [ ] Reescribir `deriveDisplayStatus`:
  ```ts
  if (purchase.paymentStatus === 'paid') {
    if (!purchase.selectedDate) return 'completed';
    return parseDateString(purchase.selectedDate) >= new Date() ? 'confirmed' : 'completed';
  }
  if (purchase.paymentStatus === 'pending' && purchase.selectedDate) {
    if (parseDateString(purchase.selectedDate) < new Date()) return 'expired';
  }
  return purchase.paymentStatus;
  ```
- [ ] Tests unitarios cubriendo las 6 ramas (pending/paid × past/future/no-date) + cancelled + refunded.

**`MyServicesList.tsx`:**

- [ ] Agregar entrada `'expired'` en `STATUS_LABEL` ("Vencido") y `STATUS_COLOR` (rojo o gris atenuado, ej `bg-red-50 text-red-700 border-red-200`).
- [ ] En `PurchaseCard`: si `displayStatus === 'expired'`, NO mostrar `showRetryPayment` (el botón de completar pago no tiene sentido).
- [ ] Tests actualizados.

**`MyServicesWidget.tsx`:**

- [ ] Agregar entrada `'expired'` en `STATUS_CONFIG`.
- [ ] Verificar que el ordenamiento sigue mostrando primero los activos (definir si vencidos van al final).
- [ ] Tests actualizados.

**Tests:**

- [ ] Unit tests de `holistic-services.test.ts` (crear si no existe).
- [ ] Tests de componente para los dos listados.
- [ ] Coverage ≥ 80%.

#### 🎯 Criterios de Aceptación

- Una compra `pending` con `selectedDate` ayer (o anterior) muestra badge "Vencido" en rojo.
- Una compra `pending` con `selectedDate` hoy/futuro sigue mostrando "Pendiente" + botón "Completar pago".
- Una compra `paid` con `selectedDate` pasada sigue mostrando "Completado".
- El widget del dashboard refleja el mismo cambio.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `frontend/src/lib/utils/holistic-services.ts`
- `frontend/src/lib/utils/holistic-services.test.ts` (nuevo si falta)
- `frontend/src/components/features/holistic-services/MyServicesList.tsx`
- `frontend/src/components/features/holistic-services/MyServicesList.test.tsx`
- `frontend/src/components/features/dashboard/MyServicesWidget.tsx`
- `frontend/src/components/features/dashboard/MyServicesWidget.test.tsx`

---

### T-BUG-003-B: (Opcional) Cron Backend que Marque Compras `pending` Vencidas

**Prioridad:** 🟡 Media
**Estimación:** 3 puntos
**Dependencias:** decisión de producto sobre si persistir el estado o solo mostrarlo
**Cubre BUG:** BUG-003 (fase 2)

#### ✅ Tareas específicas

- [ ] Decisión: ¿agregar valor `EXPIRED` al enum `PurchaseStatus` o reutilizar `CANCELLED` con motivo?
- [ ] Si nuevo enum: migración que agregue el valor.
- [ ] Crear `ExpirePendingPurchasesUseCase` que busque compras con `paymentStatus = PENDING` y `selectedDate < today - 24h` (margen de gracia).
- [ ] Crear `ServicePurchaseCronService` con `@Cron('0 3 * * *')` (3 AM UTC diariamente).
- [ ] Loguear cantidad de compras movidas.
- [ ] Tests unitarios + e2e mínimo.

#### 🎯 Criterios de Aceptación

- Diariamente, las compras `pending` con fecha de turno anterior a hace 24 h pasan a `EXPIRED`/`CANCELLED`.
- El job es idempotente (re-ejecutarlo no rompe nada).
- Coverage ≥ 80%.

#### 📁 Archivos involucrados

- `backend/tarot-app/src/modules/holistic-services/domain/enums/purchase-status.enum.ts`
- `backend/tarot-app/src/modules/holistic-services/application/use-cases/expire-pending-purchases.use-case.ts`
- `backend/tarot-app/src/modules/holistic-services/application/services/service-purchase-cron.service.ts`
- `backend/tarot-app/src/database/migrations/` (si se agrega enum value)

---

### T-BUG-003-C: Acción "Eliminar Compra Vencida" + Filtros en Mis Servicios

**Prioridad:** 🟡 Media
**Estimación:** 2 puntos
**Dependencias:** T-BUG-003-A
**Cubre BUG:** BUG-003

#### ✅ Tareas específicas

- [ ] Definir con producto si "Eliminar" es borrado físico, soft-delete o solo ocultar en UI.
- [ ] En `MyServicesList.tsx`, agregar pestañas/chips de filtro: `Todos | Vigentes | Vencidos | Pagados`.
- [ ] Agregar acción "Eliminar" en cards con estado `expired` o `cancelled` (con confirmación modal).
- [ ] Endpoint backend (si aplica): `DELETE /holistic-services/purchases/:id` o `PATCH .../hide`.
- [ ] Tests de filtros y acción de eliminar.

#### 🎯 Criterios de Aceptación

- El usuario puede limpiar visualmente compras vencidas.
- Los filtros funcionan sin requerir refetch innecesarios (filtrar en cliente sobre `useMyPurchases`).
- Confirmación antes de eliminar para evitar accidentes.

#### 📁 Archivos involucrados

- `frontend/src/components/features/holistic-services/MyServicesList.tsx`
- `frontend/src/components/features/holistic-services/MyServicesList.test.tsx`
- `frontend/src/hooks/api/useHolisticServices.ts` (posible `useDeletePurchase`)
- Backend: a definir según decisión de producto.

---

### T-BUG-004: Implementar Menú Hamburguesa Mobile en Header

**Prioridad:** 🔴 Crítica
**Estimación:** 3 puntos
**Dependencias:** ninguna
**Cubre BUG:** BUG-004

#### 📋 Descripción

Convertir el botón hamburguesa estático del `Header` en un menú lateral funcional usando el primitive `Sheet` de shadcn. El panel debe mostrar todos los links de navegación principales (mismos que ve un usuario desktop), respetando los condicionales de autenticación y plan (Premium).

#### ✅ Tareas específicas

**Refactor del Header (`frontend/src/components/layout/Header.tsx`):**

- [ ] Agregar `const [mobileMenuOpen, setMobileMenuOpen] = useState(false);` en el componente.
- [ ] Envolver el botón hamburguesa en `<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>` con `<SheetTrigger asChild>` para el botón.
- [ ] Crear `<SheetContent side="left">` con la lista de links + título de menú (visible o `sr-only`).
- [ ] Reemplazar `aria-expanded={false}` hardcoded por `aria-expanded={mobileMenuOpen}` y agregar `aria-controls`.
- [ ] Eliminar el TODO comment de la línea 28 una vez resuelto.

**Extracción de links (recomendado, no obligatorio):**

- [ ] Crear `frontend/src/components/layout/HeaderNavLinks.tsx` con prop `variant: 'mobile' | 'desktop'` y `onNavigate?: () => void`.
- [ ] Mover los links actuales (Tarot del Día, Horóscopo, Horóscopo Chino, Numerología, Rituales, Enciclopedia Mística, Péndulo, Carta Astral, Servicios, Tirada de Tarot, Premium) a este componente.
- [ ] En mobile: `flex flex-col gap-2` con padding generoso; en desktop: `flex gap-6` (comportamiento actual).
- [ ] Mantener la lógica de "link activo" (ej. Servicios usa `pathname.startsWith('/servicios')`) para ambas variantes.
- [ ] Mantener el render condicional del link "Premium" basado en `user.plan !== 'premium'`.

**Comportamiento UX:**

- [ ] Pasar `onClick={() => setMobileMenuOpen(false)}` (o `onNavigate`) a cada `<Link>` del panel para cerrar al navegar.
- [ ] Verificar que el Sheet cierra con `Escape` y click en backdrop (shadcn lo provee por defecto).
- [ ] Target táctil ≥ 44px (WCAG) por link.

**Tests (`Header.test.tsx`):**

- [ ] Test: el botón hamburguesa renderiza con clase `md:hidden`.
- [ ] Test: al clickear el botón se abre el Sheet (`getByRole('dialog')` o `data-testid`).
- [ ] Test: `aria-expanded` cambia de `false` a `true` tras el click.
- [ ] Test: al clickear un link, el `onOpenChange` se llama con `false`.
- [ ] Test: link "Premium" solo aparece cuando `user.plan !== 'premium'`.
- [ ] Coverage ≥ 80%.

**Validación manual:**

- [ ] Chrome DevTools con presets "iPhone 14" y "Pixel 7".
- [ ] Navegación con teclado (Tab, Enter, Escape).

#### 🎯 Criterios de Aceptación

- En viewports <768px, el botón hamburguesa abre un panel lateral con TODOS los links principales.
- Cada link cierra el panel y navega.
- El menú se cierra con Escape, click en backdrop, o al clickear un link.
- En desktop (≥768px) no se ve el botón ni el Sheet; la nav horizontal funciona como antes.
- `aria-expanded` refleja el estado real.
- No hay regresiones en `NotificationBell` ni `UserMenu`.
- Ciclo de calidad frontend completo pasa.

#### 📁 Archivos involucrados

- `frontend/src/components/layout/Header.tsx`
- `frontend/src/components/layout/Header.test.tsx`
- `frontend/src/components/layout/HeaderNavLinks.tsx` (nuevo, opcional)
- `frontend/src/components/ui/sheet.tsx` (existente — usar tal cual)

---

### T-BUG-005: Corregir Credenciales Impresas por `db-seed-users.ts`

**Prioridad:** 🟡 Media · **Estimación:** 0.5 pt · **Cubre BUG:** BUG-005

#### ✅ Tareas

- [ ] En `backend/tarot-app/scripts/db-seed-users.ts:30-33`, reemplazar las contraseñas falsas por `Test123456!` (las 3 líneas).
- [ ] (Opcional) Importar la contraseña desde una constante compartida en `users.seeder.ts` para evitar futuras divergencias.
- [ ] Verificar que `docs/USERS.md` siga siendo coherente.

#### 📁 Archivos

- `backend/tarot-app/scripts/db-seed-users.ts`
- `backend/tarot-app/src/database/seeds/users.seeder.ts` (opcional, extraer constante)

---

### T-BUG-006: Crear Página Placeholder `/admin/lecturas` (o Quitar del Sidebar)

**Prioridad:** 🔴 Crítica · **Estimación:** 1 pt · **Cubre BUG:** BUG-006

#### ✅ Tareas

**Decisión de producto (rápida, en este PR):** crear placeholder o eliminar del sidebar.

**Opción A — Placeholder (recomendada):**

- [ ] Crear `frontend/src/app/admin/lecturas/page.tsx` con título y mensaje "Sección en construcción".
- [ ] Test de renderizado mínimo.

**Opción B — Eliminar del sidebar:**

- [ ] Quitar la entrada `'Lecturas'` de `admin-navigation.ts:40`.
- [ ] Test de sidebar actualizado.

#### 📁 Archivos

- `frontend/src/app/admin/lecturas/page.tsx` (nuevo, opción A)
- `frontend/src/lib/config/admin-navigation.ts` (opción B)

---

### T-BUG-007-A: Backend — Extender `/admin/dashboard/stats` con Datos Reales

**Prioridad:** 🔴 Crítica · **Estimación:** 3 pts · **Cubre BUG:** BUG-007

#### ✅ Tareas

- [ ] Agregar al DTO `StatsResponseDto` el campo `recentReadings: RecentReadingDto[]` (reutilizar del endpoint deprecado `/metrics` si existe).
- [ ] Agregar `activeTarotistas: number` calculado desde `tarotistas` con `isActive = true` (o equivalente).
- [ ] Asegurar que `openai.totalCostUsd` siempre se devuelva (no `totalCost` ni `undefined`).
- [ ] Tests del use case + controller.
- [ ] Coverage ≥ 80%.

#### 📁 Archivos

- `backend/tarot-app/src/modules/admin/application/services/admin-dashboard.service.ts`
- `backend/tarot-app/src/modules/admin/dto/stats-response.dto.ts`

---

### T-BUG-007-B: Frontend — Corregir Tipos y Eliminar Mocks del Dashboard

**Prioridad:** 🔴 Crítica · **Estimación:** 2 pts · **Dependencias:** T-BUG-007-A · **Cubre BUG:** BUG-007

#### ✅ Tareas

- [ ] En `frontend/src/types/admin.types.ts`: renombrar `totalCost → totalCostUsd`, agregar `recentReadings`, agregar `activeTarotistas`.
- [ ] En `frontend/src/lib/utils/dashboard-utils.ts`:
  - Reemplazar `activeTarotistas.value = 25` por `stats.activeTarotistas`.
  - Reemplazar `stats.openai.totalCost * 10` por la fórmula real de revenue (consultar con producto o quitar el card hasta tener fuente).
- [ ] Tests del dashboard con stats mockeados (validar que no aparezca `NaN`).

#### 📁 Archivos

- `frontend/src/types/admin.types.ts`
- `frontend/src/lib/utils/dashboard-utils.ts`
- `frontend/src/app/admin/page.tsx`
- `frontend/src/app/admin/page.test.tsx`

---

### T-BUG-008: Actualizar Pricing Table de IA + Recalcular Históricos

**Prioridad:** 🔴 Crítica · **Estimación:** 3 pts · **Cubre BUG:** BUG-008

#### ✅ Tareas

- [ ] Investigar y documentar pricing por proveedor/modelo (Groq, Gemini, DeepSeek, OpenAI). Para Groq y Gemini: confirmar si el plan actual es free tier (entonces $0 es correcto y solo cambia la presentación).
- [ ] Actualizar `COST_PER_MILLION_TOKENS` en `backend/tarot-app/src/modules/ai-usage/ai-usage.service.ts:39-44` con los valores reales.
- [ ] Si los proveedores principales son free tier: agregar copy en el panel admin que aclare "Costo $0 porque Groq/Gemini en free tier" para evitar confusión.
- [ ] (Opcional fase 2) Migration que recalcule `costUsd` de logs históricos.
- [ ] Tests unitarios del cálculo.

#### 📁 Archivos

- `backend/tarot-app/src/modules/ai-usage/ai-usage.service.ts`
- `backend/tarot-app/src/modules/ai-usage/ai-usage.service.spec.ts`
- `backend/tarot-app/src/database/migrations/` (si fase 2)

---

### T-BUG-009: Alinear Tipos Frontend de AI Usage con DTOs Backend

**Prioridad:** 🟠 Alta · **Estimación:** 1 pt · **Cubre BUG:** BUG-009

#### ✅ Tareas

- [ ] En `frontend/src/types/admin.types.ts`:
  - Cambiar `provider: 'GROQ' | 'OPENAI' | 'DEEPSEEK'` por `provider: 'groq' | 'openai' | 'deepseek' | 'gemini'` (lowercase + incluir gemini).
  - Renombrar `aiCostsPerDay → costsPerDay`.
  - Cualquier comparación en componentes que use uppercase debe actualizarse.
- [ ] Crear helper `getProviderLabel(provider): string` para renderizar capitalizado (`'Groq'`, `'Gemini'`, etc.).
- [ ] Tests de la tabla de proveedores con todos los providers.

#### 📁 Archivos

- `frontend/src/types/admin.types.ts`
- `frontend/src/components/features/admin/AIProvidersTable.tsx`
- `frontend/src/components/features/admin/AIUsageMetricsCards.tsx`

---

### T-BUG-010-A: Implementar "Desbloquear IP"

**Prioridad:** 🟠 Alta · **Estimación:** 2 pts · **Cubre BUG:** BUG-010 (parte 1)

#### ✅ Tareas

**Backend:**

- [ ] Crear endpoint `DELETE /admin/security/block-ip/:ip` (autenticado + AdminGuard).
- [ ] Lógica en `IpBlockingService.unblockIp(ip)` (depende de T-BUG-012 si se persiste en BD).
- [ ] Tests del controller y el service.

**Frontend:**

- [ ] En `RateLimitingTab.tsx:47-53`, reemplazar `toast.info` por mutation real que llame al nuevo endpoint.
- [ ] Invalidar la query del listado de IPs bloqueadas tras éxito.
- [ ] Toast de éxito/error y actualizar UI optimista.

#### 📁 Archivos

- `backend/tarot-app/src/modules/admin/infrastructure/controllers/admin-security.controller.ts` (o donde esté el módulo)
- `backend/tarot-app/src/common/services/ip-blocking.service.ts`
- `frontend/src/components/features/admin/RateLimitingTab.tsx`
- `frontend/src/lib/api/endpoints.ts` (agregar `ADMIN.UNBLOCK_IP`)

---

### T-BUG-010-B: Implementar "Gestionar Roles" en Usuarios Admin

**Prioridad:** 🟠 Alta · **Estimación:** 3 pts · **Cubre BUG:** BUG-010 (parte 2)

#### ✅ Tareas

- [ ] Crear modal `ManageRolesModal` en `frontend/src/components/features/admin/` con checkboxes para CONSUMER/TAROTIST/ADMIN.
- [ ] Hooks de mutation para los 4 endpoints existentes en backend (`ADD_TAROTIST_ROLE`, `REMOVE_TAROTIST_ROLE`, `ADD_ADMIN_ROLE`, `REMOVE_ADMIN_ROLE`).
- [ ] Lógica de "diff": comparar roles actuales con los seleccionados y disparar solo las mutaciones necesarias.
- [ ] Confirmación adicional al quitar rol ADMIN ("Esto removerá el acceso al panel admin. ¿Continuar?").
- [ ] En `UsersManagementContent.tsx:56-60`, reemplazar `toast.info` por abrir el modal.
- [ ] Tests del modal y del flujo.

#### 📁 Archivos

- `frontend/src/components/features/admin/UsersManagementContent.tsx`
- `frontend/src/components/features/admin/ManageRolesModal.tsx` (nuevo)
- `frontend/src/hooks/api/useAdminUsers.ts` (extender con mutations)

---

### T-BUG-010-C: Implementar Acciones de Tarotistas

**Prioridad:** 🟡 Media · **Estimación:** 3 pts · **Cubre BUG:** BUG-010 (parte 3)

#### ✅ Tareas

- [ ] `view-profile`: navegar a `/admin/tarotistas/[id]` o abrir modal con datos del tarotista (definir con producto).
- [ ] `edit-config`: modal o página `/admin/tarotistas/[id]/configuracion` que use `TAROTISTA_CONFIG` ya existente.
- [ ] `view-metrics`: modal/página con stats (sesiones, ingresos, rating) del tarotista.
- [ ] Reemplazar `toast.info('próximamente')` en `TarotistasManagementContent.tsx:84-94`.
- [ ] Tests.

#### 📁 Archivos

- `frontend/src/components/features/admin/TarotistasManagementContent.tsx`
- `frontend/src/components/features/admin/TarotistaConfigModal.tsx` (nuevo)
- `frontend/src/app/admin/tarotistas/[id]/page.tsx` (nuevo si se elige ruta dedicada)

---

### T-BUG-011: Fix `SelectItem value=""` en `SecurityEventsTab`

**Prioridad:** 🔴 Crítica · **Estimación:** 0.5 pt · **Cubre BUG:** BUG-011

#### ✅ Tareas

- [ ] En `frontend/src/components/features/admin/SecurityEventsTab.tsx:117,149` cambiar `value=""` por `value="all"`.
- [ ] En el handler de filtros, tratar `"all"` como "sin filtro" (no enviar el param al backend).
- [ ] Test que verifique que la tab renderiza sin errores y los filtros operan.

#### 📁 Archivos

- `frontend/src/components/features/admin/SecurityEventsTab.tsx`

---

### T-BUG-012: Persistir Rate-Limit / IP Blocks Fuera de Memoria

**Prioridad:** 🟠 Alta · **Estimación:** 3 pts · **Cubre BUG:** BUG-012

#### ✅ Tareas

**Decisión de infra (en el PR):** Redis vs PostgreSQL. Si no hay Redis disponible, usar tabla.

- [ ] Crear migración: tabla `ip_blocks { id, ip, blocked_until, reason, created_at }`.
- [ ] Crear entidad y repositorio (`IIpBlockRepository`, `TypeOrmIpBlockRepository`).
- [ ] Refactor `IpBlockingService` para usar el repo en lugar de `Map` en memoria.
- [ ] Job/lógica que limpie bloqueos expirados (`blocked_until < now`).
- [ ] Tests del service + repo.
- [ ] Validar que en multi-instancia el bloqueo es consistente.

#### 📁 Archivos

- `backend/tarot-app/src/database/migrations/<timestamp>-CreateIpBlocks.ts` (nuevo)
- `backend/tarot-app/src/common/services/ip-blocking.service.ts`
- `backend/tarot-app/src/common/entities/ip-block.entity.ts` (nuevo)
- `backend/tarot-app/src/common/repositories/typeorm-ip-block.repository.ts` (nuevo)

---

### T-BUG-013: Eliminar `FLAVIA_TAROTISTA_ID` Hardcoded en Agenda Admin

**Prioridad:** 🟡 Media · **Estimación:** 1 pt · **Cubre BUG:** BUG-013

#### ✅ Tareas

- [ ] Determinar fuente de verdad: ¿`/tarotistas?primary=true` o un endpoint nuevo `/tarotistas/principal`?
- [ ] Reemplazar el `const FLAVIA_TAROTISTA_ID = 1` por un hook `usePrimaryTarotista()` o equivalente.
- [ ] Manejar estado de loading/error (skeleton en la agenda mientras se resuelve el ID).
- [ ] Tests del nuevo flujo.

#### 📁 Archivos

- `frontend/src/components/features/admin/AgendaManagementContent.tsx`
- `frontend/src/hooks/api/useTarotistas.ts` (posible nuevo hook)

---

### T-BUG-014: Date Range Picker en AI Usage + Centralizar Daily Limit

**Prioridad:** 🟡 Media · **Estimación:** 2 pts · **Cubre BUG:** BUG-014

#### ✅ Tareas

- [ ] Agregar `DateRangePicker` (presets: hoy, 7d, 30d, custom) en `AIUsageContent.tsx`.
- [ ] Pasar `startDate/endDate` al hook `useAIUsageStats({ startDate, endDate })`.
- [ ] Verificar que el endpoint backend ya acepta esos params; si no, agregarlos.
- [ ] En `AIUsageMetricsCards.tsx:14` eliminar `GROQ_DAILY_LIMIT = 14400` y consumirlo del DTO backend (o desde un endpoint `/admin/config/thresholds`).
- [ ] Tests.

#### 📁 Archivos

- `frontend/src/components/features/admin/AIUsageContent.tsx`
- `frontend/src/components/features/admin/AIUsageMetricsCards.tsx`
- `frontend/src/hooks/queries/useAdminAIUsage.ts`

---

### T-BUG-015: Migrar Audit Logs al Contrato Estándar `{ data, meta }`

**Prioridad:** 🟡 Media · **Estimación:** 2 pts · **Cubre BUG:** BUG-015

#### ✅ Tareas

- [ ] Refactor de `audit-log.service.ts:17-20`: devolver `{ data: AuditLog[], meta: { page, limit, totalItems, totalPages } }`.
- [ ] Actualizar el controller y los tipos del controller-spec.
- [ ] Frontend de audit logs adaptado a la nueva respuesta.
- [ ] Tests de paginación.

#### 📁 Archivos

- `backend/tarot-app/src/modules/audit/audit-log.service.ts`
- `backend/tarot-app/src/modules/audit/infrastructure/controllers/audit-log.controller.ts`
- `frontend/src/components/features/admin/AuditLogsTable.tsx` (o equivalente)
- `frontend/src/hooks/api/useAuditLogs.ts`

---

## ORDEN DE EJECUCIÓN SUGERIDO

**Sprint 1 — Críticos que rompen funcionalidad básica:**

1. **T-BUG-005** (0.5 pt — desbloquea desarrollo local con credenciales correctas).
2. **T-BUG-011** (0.5 pt — fix mínimo, evita crash de Security Events).
3. **T-BUG-006** (1 pt — elimina 404 en sidebar admin).
4. **T-BUG-004** (3 pts — sin esto, mobile no puede navegar).
5. **T-BUG-003-A** (3 pts — afecta a todos los usuarios con compras).
6. **T-BUG-001-A** (5 pts — completa los horóscopos faltantes).

**Sprint 2 — Admin panel utilizable:**

7. **T-BUG-007-A + T-BUG-007-B** (5 pts — dashboard con datos reales).
8. **T-BUG-008** (3 pts — costos de IA correctos).
9. **T-BUG-009** (1 pt — tipos alineados, prerequisito para tareas siguientes de AI Usage).
10. **T-BUG-010-A** (2 pts — desbloquear IP funcional).
11. **T-BUG-010-B** (3 pts — gestión de roles).
12. **T-BUG-001-B** (3 pts — UI admin para horóscopos chinos).

**Sprint 3 — Robustez y deuda técnica:**

13. **T-BUG-012** (3 pts — persistencia de rate-limit).
14. **T-BUG-010-C** (3 pts — acciones de tarotistas).
15. **T-BUG-014** (2 pts — date range + daily limit centralizado).
16. **T-BUG-015** (2 pts — contrato de paginación de audit).
17. **T-BUG-002** (2 pts — compactar footer).
18. **T-BUG-013** (1 pt — tarotistaId hardcoded).
19. **T-BUG-001-C** (1 pt — UX 404 horóscopo chino).
20. **T-BUG-003-C** (2 pts — filtros + eliminar en Mis Servicios).

**Backlog futuro / opcional:**

- **T-BUG-003-B** (3 pts — solo si producto decide persistir el estado expired en BD).

---

## DECISIONES PENDIENTES PARA PRODUCTO

| Decisión                                                                                          | Impacto                                       |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| ¿Compras `pending` vencidas pasan a `EXPIRED` en DB o se derivan solo en frontend?               | T-BUG-003-A vs T-BUG-003-B                    |
| ¿Eliminar compras vencidas es borrado físico, soft-delete o solo ocultar en UI?                   | T-BUG-003-C — alcance del endpoint            |
| ¿Eliminamos el título "Nuestros Servicios" del footer o lo dejamos como `sr-only`?                | T-BUG-002 — decisión estética                 |
| ¿Generación de horóscopos faltantes en cron de respaldo se ejecuta automáticamente o solo manual? | T-BUG-001-A — política de uso de tokens IA    |
| ¿El menú mobile incluye también los links del UserMenu (perfil, logout) o solo navegación?        | T-BUG-004 — alcance del panel lateral         |
| ¿`/admin/lecturas` será una sección real o se elimina del sidebar?                                 | T-BUG-006 — decide opción A vs B              |
| ¿Cuál es la fórmula de "Revenue del Mes" o se quita el card hasta tener facturación real?         | T-BUG-007-B — qué mostrar en su lugar         |
| ¿Groq/Gemini en free tier son $0 esperado, o hay que tarifar?                                      | T-BUG-008 — copy del panel admin              |
| ¿Persistencia de rate-limit en Redis o PostgreSQL?                                                 | T-BUG-012 — depende de infra disponible       |

---

## CICLO DE CALIDAD A EJECUTAR ANTES DE CADA PR

**Backend (si aplica):**

```bash
cd backend/tarot-app && npm run format && npm run lint && npm run test:cov && npm run build && node scripts/validate-architecture.js
```

**Frontend (si aplica):**

```bash
cd frontend && npm run format && npm run lint:fix && npm run type-check && npm run test:run && npm run build && node scripts/validate-architecture.js
```
