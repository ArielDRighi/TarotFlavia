# T-CA-021: Análisis del Sistema de Límites Existente

## Contexto

Este análisis revisa el estado real del módulo `backend/tarot-app/src/modules/usage-limits/` para planificar la extensión a límites mensuales de carta astral sin romper límites diarios existentes.

## Estructura Actual

### Entidades

1. `UsageLimit` (`usage_limit`)
   - Campos principales: `userId`, `feature`, `count`, `date`.
   - Modelo agregado por día para usuarios autenticados (`count` acumulado).

2. `AnonymousUsage` (`anonymous_usage`)
   - Campos principales: `fingerprint`, `ip`, `feature`, `date`.
   - Modelo por evento para anónimos (sin `count`).

### Enum de features (tipo de límite)

- Se usa `UsageFeature` (no `UsageType`) en `usage-limit.entity.ts`.
- Incluye: `DAILY_CARD`, `TAROT_READING`, `ORACLE_QUERY`, `INTERPRETATION_REGENERATION`, `PENDULUM_QUERY`, `BIRTH_CHART`.

### Servicios

1. `UsageLimitsService`
   - `checkLimit(userId, feature)`: valida límite contra uso diario.
   - `incrementUsage(userId, feature)`: incrementa uso diario en `usage_limit`.
   - `getUsageByPeriod(userId, feature, period)`: soporta `daily | monthly | lifetime` para consulta.
   - `getLimit()`: mezcla configuración dinámica (`PlanConfigService`) y fallback en constantes.

2. `AnonymousTrackingService`
   - Genera `fingerprint` SHA-256 con IP + User-Agent.
   - `canAccessByIpAndUserAgent(...)`: validación diaria por `date`.
   - `canAccessLifetime(...)`: validación lifetime por existencia de registro.

### Guard e interceptor

1. `CheckUsageLimitGuard`
   - Lee metadata del decorador `@CheckUsageLimit(feature)`.
   - Flujo autenticado:
     - `DAILY_CARD`: consulta `daily_readings`.
     - `TAROT_READING`: consulta `tarot_readings` + plan config.
     - Otros features: delega a `UsageLimitsService.checkLimit()` (diario).
   - Flujo anónimo:
     - Especial `PENDULUM_QUERY`: lifetime.
     - Default: `anonymousTrackingService.canAccess()` (diario).

2. `IncrementUsageInterceptor`
   - Solo incrementa para usuario autenticado.
   - Para anónimos no incrementa (retorna sin registrar uso).

### Configuración de límites

- Archivo: `usage-limits.constants.ts` (`USAGE_LIMITS`).
- Hay mezcla de fuentes:
  - `DAILY_CARD`, `TAROT_READING`, `PENDULUM_QUERY`: fuente principal en `PlanConfigService`.
  - Resto: fallback en constantes.
- `BIRTH_CHART` ya está definido con intención de límites:
  - Anonymous: 1 (lifetime esperado)
  - Free: 3 (mensual esperado)
  - Premium: 5 (mensual esperado)

## Sistema de reset actual

El sistema actual combina dos mecanismos:

1. **Reset lógico por fecha en consultas**
   - Límites diarios se calculan con filtro por día actual UTC.
2. **Retención por cron**
   - `UsageLimitsResetService` elimina registros antiguos de `usage_limit` (más de 7 días).

Conclusión: sí existe cron, pero no para “resetear contador”, sino para limpieza de históricos.

## Hallazgos clave para Carta Astral

1. `BIRTH_CHART` no se valida como mensual en el guard actual.
   - `checkLimit()` usa registro diario (`getTodayUsageRecord`).

2. Hay soporte parcial mensual en lectura de estado.
   - `getUsageByPeriod(..., 'monthly')` ya existe y se usa en `BirthChartFacadeService.getUsageStatus()`.

3. Flujo anónimo no está alineado con “1 lifetime” de carta astral.
   - Solo `PENDULUM_QUERY` tiene ruta explícita lifetime en guard.

4. Inconsistencia en tracking anónimo genérico.
   - `AnonymousTrackingService.recordUsage()` persiste `feature: TAROT_READING` fijo.
   - Esto impide registrar correctamente otras features si se usa ese método.

5. El interceptor no registra uso anónimo.
   - El registro anónimo depende de lógica interna del guard.

## Puntos de extensión identificados

### Se puede agregar período mensual sin romper lo diario

Sí. La base actual permite extender sin rediseño completo:

- Reusar `UsageLimit` para authenticated monthly con suma por rango de fechas.
- Reusar `AnonymousUsage` para lifetime por feature + fingerprint.
- Introducir `UsagePeriod` y un mapping por feature (`daily`, `monthly`, `lifetime`).

### ¿Nuevas entidades?

No son estrictamente necesarias para `T-CA-022`.

- Para monthly de carta astral, `UsageLimit` actual es suficiente.
- Para lifetime anónimo con límite 1, `AnonymousUsage` actual es suficiente.
- Nuevas tablas (`monthly_usage`, `anonymous_lifetime_usage`) solo serían recomendables si se busca optimización analítica o consolidación de consultas a gran escala.

### ¿El guard actual puede manejar diferentes períodos?

No de forma genérica hoy; requiere extensión.

- Actualmente está hardcodeado por feature en varios `switch`.
- Debe evolucionar a resolución por período + estrategia de chequeo.

## Opciones evaluadas

### Opción A: Extender modelo actual con `UsagePeriod` (recomendada)

- Crear `UsagePeriod` y mapa `FEATURE_PERIOD`.
- Adaptar `checkLimit()` e `incrementUsage()` para resolver por período.
- Corregir tracking anónimo para registrar feature real.
- Mantener compatibilidad con lógica específica de `DAILY_CARD` y `TAROT_READING`.

**Ventajas:** menor riesgo, menos migraciones, aprovecha código existente.

### Opción B: Nuevas tablas por período

- Crear `monthly_usage` y `anonymous_lifetime_usage`.

**Ventajas:** modelo explícito por período.
**Desventajas:** mayor complejidad, migraciones y duplicación de lógica.

### Opción C: Tracking flexible en JSONB

**Desventajas:** complejidad de consulta, validación y mantenimiento; no recomendado para este contexto.

## Recomendación para T-CA-022

Implementar **Opción A** con cambios acotados y compatibles:

1. Introducir `UsagePeriod` y mapa feature→period.
2. Extender `UsageLimitsService` para:
   - `checkLimitByPeriod(...)`
   - `incrementUsageByPeriod(...)`
3. Ajustar `CheckUsageLimitGuard` para resolver por período.
4. Corregir `AnonymousTrackingService.recordUsage()` para aceptar `feature`.
5. Mantener lógica especial diaria de `DAILY_CARD` y `TAROT_READING` sin regresiones.
6. Cubrir con tests unitarios e integración para daily/monthly/lifetime.

## Riesgos y consideraciones

1. Riesgo de regresión en límites de tarot diarios por cambios en guard.
2. Riesgo de inconsistencia entre `PlanConfigService` y constantes.
3. Riesgo de doble registro si guard e interceptor incrementan la misma feature sin coordinación.
4. Riesgo de timezone si mensual no se calcula en UTC de forma uniforme.

## Estimación refinada para T-CA-022

- Estimación original: 4h.
- Estimación refinada: **6h a 8h**.

Desglose sugerido:

1. Diseño y refactor de períodos: 2h
2. Ajustes en guard/interceptor/anonymous tracking: 2h
3. Tests unitarios + integración: 2h a 3h
4. Ajustes finos + validaciones: 1h
