# TASK: Refactoring del pipeline de cálculo de carta astral — orbSystem & UTC bug

> **Tipo:** Bug fix + Refactoring backend NestJS
> **Branch:** `fix/birth-chart-orbsystem-pipeline`
> **Prioridad:** Alta — afecta corrección astronómica de cartas históricas
> **Fecha:** 2026-02-24

---

## 🐛 Problema

El parámetro `orbSystem` (STRICT/COMMERCIAL) produce posiciones planetarias distintas para fechas históricas argentinas (ej. mayo 1978), cuando debería afectar **exclusivamente** el filtrado de orbes en aspectos.

**Síntoma observado (Florencia — 1978-05-21, Buenos Aires):**
| Modo | Luna | Ascendente |
|------|------|------------|
| STRICT | 20.1° Escorpio | **Libra** ✅ |
| COMMERCIAL | 20.7° Escorpio | **Escorpio** ❌ |

Diferencia de ~0.6° en Luna = ~1 hora de desfase en el cálculo. El Ascendente cambia de signo.

**Bugs adicionales:**
- Una carta generada con COMMERCIAL queda fijada en caché para ese set de datos; la siguiente solicitud con STRICT devuelve la carta errónea (cache-hit).
- En el historial (usuarios Premium), el chart guardado con un orbSystem no puede sobreescribirse con el otro porque el índice único de la entidad no incluye `orbSystem`.

---

## 🔍 Causa Raíz

### Bug 1 — UTC getters sobre Date local-midnight (principal)

**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/services/chart-calculation.service.ts` líneas 191-198

`parseBirthDate("1978-05-21")` crea `new Date(1978, 4, 21)` (local midnight).
`parseDateTime` luego extrae componentes con getters UTC:

```typescript
// BUG: si el servidor es UTC+X, getUTCDate() devuelve el día anterior
year: birthDate.getUTCFullYear(),
month: birthDate.getUTCMonth() + 1,
day: birthDate.getUTCDate(),
```

Esto pasa las componentes incorrectas a `localToUtc()`, que aplica reglas DST históricas de Argentina sobre el día equivocado, produciendo un desfase de ~1 hora.

### Bug 2a — Cache key sin `orbSystem`

**Archivo:** `chart-cache.service.ts` línea 100 / `birth-chart-facade.service.ts` líneas 75-80

`generateChartCacheKey(birthDate, birthTime, lat, lng)` no incluye `orbSystem`.
El `chartData` cacheado incluye aspectos. El primer request fija los aspectos en cache para todos los modos.

### Bug 2b — Índice único y upsert de BD sin `orbSystem`

**Archivo:** `birth-chart.entity.ts` líneas 89-92 / `birth-chart-facade.service.ts` `saveChart`

El índice `idx_birth_chart_user_birth` es `['userId', 'birthDate', 'birthTime', 'latitude', 'longitude']`.
El `upsert` usa las mismas columnas como conflicto. Dos modos del mismo nacimiento sobreescriben el mismo registro.

---

## 📁 Archivos Afectados

| Archivo | Tipo de cambio |
|---------|---------------|
| `application/services/chart-calculation.service.ts` | Refactoring de interfaz + `parseDateTime` |
| `application/services/birth-chart-facade.service.ts` | Actualizar inputs + cache key |
| `application/services/chart-cache.service.ts` | Agregar `orbSystem` al cache key |
| `entities/birth-chart.entity.ts` | Nueva columna `orbSystem` + índice único |
| `database/migrations/` | Nueva migración para columna `orbSystem` |
| Tests de los servicios anteriores | Actualizar según TDD |

---

## 📋 Tareas en Orden Recomendado (TDD)

### FASE 0 — Preparación

- [ ] Crear branch `fix/birth-chart-orbsystem-pipeline` desde `develop`
- [ ] Verificar que todos los tests existentes pasan antes de comenzar
  ```bash
  cd backend/tarot-app && npm run test:cov
  ```

---

### FASE 1 — Tests primero (RED)

> Escribir tests que fallen. No implementar nada todavía.

#### Tarea 1.1 — Tests para `ChartCalculationService` (nuevo contrato de interfaz)

**Archivo:** `src/modules/birth-chart/application/services/chart-calculation.service.spec.ts`

Agregar/actualizar tests para el nuevo campo `birthDateStr: string` en `ChartCalculationInput`:

```typescript
// Test: rechaza formato de fecha inválido
it('should throw on invalid birthDateStr format', () => {
  const input: ChartCalculationInput = {
    birthDateStr: '21/05/1978',  // formato incorrecto
    birthTime: '05:30',
    latitude: -34.6037,
    longitude: -58.3816,
    timezone: 'America/Argentina/Buenos_Aires',
  };
  expect(() => service.calculateChart(input)).toThrow(
    'Invalid birthDateStr format',
  );
});

// Test: para Florencia con STRICT y COMMERCIAL, los planetas son idénticos
it('should produce identical planet positions regardless of orbSystem', () => {
  const baseInput = {
    birthDateStr: '1978-05-21',
    birthTime: '05:30',
    latitude: -34.6037,
    longitude: -58.3816,
    timezone: 'America/Argentina/Buenos_Aires',
  };
  const strict = service.calculateChart({ ...baseInput, orbSystem: OrbSystem.STRICT });
  const commercial = service.calculateChart({ ...baseInput, orbSystem: OrbSystem.COMMERCIAL });

  expect(strict.chartData.planets).toEqual(commercial.chartData.planets);
  expect(strict.chartData.ascendant).toEqual(commercial.chartData.ascendant);
  expect(strict.chartData.houses).toEqual(commercial.chartData.houses);
  // Los aspectos SÍ deben diferir
  expect(strict.chartData.aspects).not.toEqual(commercial.chartData.aspects);
});
```

#### Tarea 1.2 — Tests para `ChartCacheService` (orbSystem en cache key)

**Archivo:** `src/modules/birth-chart/application/services/chart-cache.service.spec.ts`

```typescript
// Test: el mismo nacimiento con diferente orbSystem genera claves distintas
it('should generate different keys for different orbSystems', () => {
  const base = {
    birthDate: new Date(1978, 4, 21),
    birthTime: '05:30',
    latitude: -34.6037,
    longitude: -58.3816,
  };
  const keyStrict = service.generateChartCacheKey(
    base.birthDate, base.birthTime, base.latitude, base.longitude, OrbSystem.STRICT,
  );
  const keyCommercial = service.generateChartCacheKey(
    base.birthDate, base.birthTime, base.latitude, base.longitude, OrbSystem.COMMERCIAL,
  );
  expect(keyStrict).not.toBe(keyCommercial);
});

// Test: el mismo input con el mismo orbSystem genera la misma clave (determinismo)
it('should be deterministic for same inputs', () => {
  const key1 = service.generateChartCacheKey(
    new Date(1978, 4, 21), '05:30', -34.6037, -58.3816, OrbSystem.STRICT,
  );
  const key2 = service.generateChartCacheKey(
    new Date(1978, 4, 21), '05:30', -34.6037, -58.3816, OrbSystem.STRICT,
  );
  expect(key1).toBe(key2);
});

// Test: sin orbSystem retorna clave válida (backward compat)
it('should handle undefined orbSystem without throwing', () => {
  expect(() =>
    service.generateChartCacheKey(
      new Date(1978, 4, 21), '05:30', -34.6037, -58.3816, undefined,
    )
  ).not.toThrow();
});
```

#### Tarea 1.3 — Tests de integración en `BirthChartFacadeService`

**Archivo:** `src/modules/birth-chart/application/services/birth-chart-facade.service.spec.ts`

Verificar que el facade llama al `calculationService.calculateChart` con `birthDateStr` (string):

```typescript
it('should call calculateChart with birthDateStr as raw string', async () => {
  await facade.generateChart(dto, UserPlan.FREE, 1);
  expect(mockCalculationService.calculateChart).toHaveBeenCalledWith(
    expect.objectContaining({
      birthDateStr: dto.birthDate,  // debe ser el string crudo
    }),
  );
});

it('should call generateChartCacheKey with orbSystem', async () => {
  await facade.generateChart(dto, UserPlan.FREE, 1);
  expect(mockCacheService.generateChartCacheKey).toHaveBeenCalledWith(
    expect.any(Date),
    dto.birthTime,
    dto.latitude,
    dto.longitude,
    dto.orbSystem,
  );
});
```

**▶ Verificar que todos los tests nuevos FALLAN antes de implementar:**
```bash
cd backend/tarot-app
npm run test -- src/modules/birth-chart/application/services/chart-calculation.service.spec.ts
npm run test -- src/modules/birth-chart/application/services/chart-cache.service.spec.ts
npm run test -- src/modules/birth-chart/application/services/birth-chart-facade.service.spec.ts
```

---

### FASE 2 — Implementación (GREEN)

> Hacer que los tests pasen. Implementar el mínimo necesario.

#### Tarea 2.1 — Cambiar `ChartCalculationInput` en `chart-calculation.service.ts`

Reemplazar el campo `birthDate: Date` por `birthDateStr: string`:

```typescript
export interface ChartCalculationInput {
  birthDateStr: string;  // "YYYY-MM-DD" — raw string, nunca se convierte a Date
  birthTime: string;     // "HH:mm" o "HH:mm:ss"
  latitude: number;
  longitude: number;
  timezone: string;
  orbSystem?: OrbSystem;
}
```

#### Tarea 2.2 — Refactorizar `parseDateTime` en `chart-calculation.service.ts`

Reemplazar la firma y el cuerpo completo del método `parseDateTime`:

```typescript
private parseDateTime(
  birthDateStr: string,
  birthTime: string,
  timezone: string,
): { year: number; month: number; day: number; hour: number; minute: number } {
  // 1. Parsear fecha desde string — SIN intermediario JS Date
  const dateParts = birthDateStr.split('-').map(Number);
  if (dateParts.length !== 3 || dateParts.some(Number.isNaN)) {
    throw new Error(
      `Invalid birthDateStr format: "${birthDateStr}". Expected "YYYY-MM-DD".`,
    );
  }
  const [year, month, day] = dateParts;

  // 2. Parsear hora
  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
  const match = birthTime.match(timeRegex);
  if (!match) {
    throw new Error(
      `Invalid birthTime format: "${birthTime}". Expected "HH:mm" or "HH:mm:ss".`,
    );
  }
  const localHour = Number(match[1]);
  const localMinute = Number(match[2]);

  if (localHour < 0 || localHour > 23) {
    throw new Error(`Invalid hour: ${localHour}. Hour must be between 0 and 23.`);
  }
  if (localMinute < 0 || localMinute > 59) {
    throw new Error(`Invalid minute: ${localMinute}. Minute must be between 0 and 59.`);
  }

  // 3. Una sola pasada Luxon: datetime local → UTC respetando DST histórico (IANA)
  return localToUtc({ year, month, day, hour: localHour, minute: localMinute }, timezone);
}
```

Actualizar la llamada en `calculateChart` (donde antes decía `input.birthDate`):

```typescript
const { year, month, day, hour, minute } = this.parseDateTime(
  input.birthDateStr,  // ← string crudo, no Date
  input.birthTime,
  input.timezone,
);
```

Eliminar la validación `isNaN(birthDate.getTime())` en `parseDateTime` (ya no aplica).

#### Tarea 2.3 — Actualizar `generateChartCacheKey` en `chart-cache.service.ts`

Agregar `orbSystem?: OrbSystem` al método:

```typescript
generateChartCacheKey(
  birthDate: Date,
  birthTime: string,
  latitude: number,
  longitude: number,
  orbSystem?: OrbSystem,
): string {
  const normalizedTime =
    birthTime.includes(':')
      ? birthTime.split(':').length === 2
        ? `${birthTime}:00`
        : birthTime
      : birthTime;

  const normalizedLat = parseFloat(latitude.toFixed(6));
  const normalizedLng = parseFloat(longitude.toFixed(6));
  const orbKey = orbSystem ?? 'default';

  const dataString = `chart:${birthDate.toISOString()}:${normalizedTime}:${normalizedLat}:${normalizedLng}:${orbKey}`;
  return createHash('sha256').update(dataString).digest('hex');
}
```

Agregar el import de `OrbSystem` en el encabezado del archivo si no está:
```typescript
import { OrbSystem } from '../../domain/enums';
```

#### Tarea 2.4 — Actualizar los tres `ChartCalculationInput` en `birth-chart-facade.service.ts`

En `generateChart` (línea ~91), `generatePdf` (línea ~141) y `generateSynthesisOnly` (línea ~263):

```typescript
// ANTES:
const input: ChartCalculationInput = {
  birthDate: parseBirthDate(dto.birthDate),
  ...
};

// DESPUÉS:
const input: ChartCalculationInput = {
  birthDateStr: dto.birthDate,   // ← string crudo del DTO
  birthTime: dto.birthTime,
  latitude: dto.latitude,
  longitude: dto.longitude,
  timezone: dto.timezone,
  orbSystem: dto.orbSystem,
};
```

Agregar `dto.orbSystem` a la llamada `generateChartCacheKey` en `generateChart`:

```typescript
const cacheKey = this.cacheService.generateChartCacheKey(
  birthDate,
  dto.birthTime,
  dto.latitude,
  dto.longitude,
  dto.orbSystem,  // ← nuevo parámetro
);
```

**`parseBirthDate(dto.birthDate)` se mantiene SÓLO donde se necesita el `Date` para TypeORM o metadata:**
- `saveChart` línea ~490 → almacenamiento en BD (`birthDate`)
- `generatePdf` → `pdfService.generatePDF` líneas ~162, ~173 → metadata del PDF
- `buildPremiumResponse` → `aiSynthesisService.generateSynthesis` línea ~337 → metadata IA

#### Tarea 2.5 — Agregar columna `orbSystem` a la entidad y nuevo índice único

**Archivo:** `entities/birth-chart.entity.ts`

Agregar columna después de `timezone`:

```typescript
@ApiProperty({
  example: 'commercial',
  description: 'Sistema de orbes usado en el cálculo (strict o commercial)',
})
@Column({ type: 'varchar', length: 20, default: 'commercial' })
orbSystem: string;
```

Actualizar el índice único `idx_birth_chart_user_birth`:

```typescript
@Index(
  'idx_birth_chart_user_birth',
  ['userId', 'birthDate', 'birthTime', 'latitude', 'longitude', 'orbSystem'],
  { unique: true },
)
```

#### Tarea 2.6 — Actualizar `saveChart` en `birth-chart-facade.service.ts`

Incluir `orbSystem` en el objeto upsert y en las columnas de conflicto:

```typescript
const result = await this.chartRepo.upsert(
  {
    userId,
    name: dto.name,
    birthDate,
    birthTime,
    birthPlace: dto.birthPlace,
    latitude: dto.latitude,
    longitude: dto.longitude,
    timezone: dto.timezone,
    orbSystem: dto.orbSystem ?? 'commercial',  // ← nuevo campo
    chartData: { ...chartData, aiSynthesis },
    sunSign: this.findPlanetSign(chartData, Planet.SUN),
    moonSign: this.findPlanetSign(chartData, Planet.MOON),
    ascendantSign: chartData.ascendant.sign as ZodiacSign,
  },
  ['userId', 'birthDate', 'birthTime', 'latitude', 'longitude', 'orbSystem'],  // ← orbSystem en conflicto
);
```

#### Tarea 2.7 — Generar migración TypeORM

```bash
cd backend/tarot-app
npm run migration:generate -- src/database/migrations/AddOrbSystemToBirthChart
```

Verificar que la migración generada contenga:
1. `ALTER TABLE birth_charts ADD COLUMN orb_system varchar(20) NOT NULL DEFAULT 'commercial'`
2. `DROP INDEX idx_birth_chart_user_birth`
3. `CREATE UNIQUE INDEX idx_birth_chart_user_birth ON birth_charts (user_id, birth_date, birth_time, latitude, longitude, orb_system)`

**▶ Verificar que todos los tests nuevos PASAN:**
```bash
cd backend/tarot-app
npm run test -- src/modules/birth-chart/application/services/chart-calculation.service.spec.ts
npm run test -- src/modules/birth-chart/application/services/chart-cache.service.spec.ts
npm run test -- src/modules/birth-chart/application/services/birth-chart-facade.service.spec.ts
```

---

### FASE 3 — Refactoring (REFACTOR)

> Mejorar sin cambiar comportamiento. Tests deben seguir pasando.

- [ ] Asegurar orden de imports en todos los archivos modificados (ver AGENTS.md):
  1. Framework (`@nestjs/*`)
  2. Third-party (typeorm, etc.)
  3. Swagger decorators
  4. Internal modules
  5. Common utilities

- [ ] Verificar que NO se usó `any`, `eslint-disable`, `@ts-ignore` en ningún lugar
  ```bash
  grep -rn "any\b" src/modules/birth-chart/application/services/ | grep -v "\.spec\." | grep -v "node_modules"
  ```

- [ ] Revisar el comentario JSDoc en `chart-cache.service.ts` para reflejar el nuevo parámetro

---

### FASE 4 — Validación de Calidad (OBLIGATORIO)

```bash
cd backend/tarot-app

# 1. Format primero (CRÍTICO — no omitir)
npm run format

# 2. Lint
npm run lint

# 3. Tests + coverage (debe ser ≥ 80%)
npm run test:cov

# 4. Build TypeScript
npm run build

# 5. Validar arquitectura limpia
node scripts/validate-architecture.js

# 6. Migración (si hay DB disponible)
npm run migration:run
```

**Checklist antes de crear el commit:**

- [ ] `npm run format` ejecutado sin errores
- [ ] `npm run lint` sin errores
- [ ] `npm run test:cov` — todos los tests pasan, coverage ≥ 80%
- [ ] `npm run build` — compilación exitosa
- [ ] `node scripts/validate-architecture.js` — arquitectura válida
- [ ] No hay `any`, `eslint-disable` ni `@ts-ignore` en el código
- [ ] IDs son numéricos (no aplica cambios aquí)
- [ ] Texto user-facing en español (no aplica cambios aquí)

---

### FASE 5 — Prueba Manual Crítica

Antes de crear el PR, verificar manualmente el fix del bug original:

1. Iniciar el servidor con `npm run start:dev`
2. Generar carta para **Florencia** con estos datos:
   - `birthDate`: `1978-05-21`
   - `birthTime`: `05:30`
   - `latitude`: `-34.6037`
   - `longitude`: `-58.3816`
   - `timezone`: `America/Argentina/Buenos_Aires`
3. Probar con `orbSystem: STRICT` y `orbSystem: COMMERCIAL`
4. **Verificar:**
   - Luna: misma posición (~20.1° Escorpio) en **ambos** modos ✅
   - Ascendente: misma posición (Libra) en **ambos** modos ✅
   - Aspectos: listas **distintas** entre modos ✅ (este es el comportamiento esperado)
5. Para usuarios Premium: verificar que el historial muestra **dos entradas separadas** para el mismo nacimiento, una por modo ✅

---

### FASE 6 — Commit y PR

```bash
cd backend/tarot-app

git add src/modules/birth-chart/application/services/chart-calculation.service.ts \
        src/modules/birth-chart/application/services/birth-chart-facade.service.ts \
        src/modules/birth-chart/application/services/chart-cache.service.ts \
        src/modules/birth-chart/entities/birth-chart.entity.ts \
        src/database/migrations/<timestamp>-AddOrbSystemToBirthChart.ts \
        src/modules/birth-chart/application/services/chart-calculation.service.spec.ts \
        src/modules/birth-chart/application/services/chart-cache.service.spec.ts \
        src/modules/birth-chart/application/services/birth-chart-facade.service.spec.ts

git commit -m "fix(birth-chart): corregir pipeline de cálculo para que orbSystem no afecte efemérides"
```

```bash
git push -u origin fix/birth-chart-orbsystem-pipeline

# PR siempre a develop (NUNCA a main)
gh pr create --base develop \
  --title "fix(birth-chart): corregir pipeline orbSystem — separar cálculo de efemérides de orbes" \
  --body "$(cat <<'EOF'
## Resumen

- **Bug 1:** `parseDateTime` usaba `getUTCFullYear/Month/Date` sobre un Date local-midnight → componentes de fecha incorrectas en servidores UTC+ → desfase de ~1h en efemérides para fechas DST históricas de Argentina (mayo 1978).
- **Bug 2a:** Cache key sin `orbSystem` → primer modo calculado fija los aspectos para todos los modos.
- **Bug 2b:** Índice único y upsert de BD sin `orbSystem` → charts de distintos modos sobreescriben el mismo registro en el historial.

## Cambios

- `ChartCalculationInput.birthDate: Date` → `birthDateStr: string` — el string raw fluye directo a Luxon
- `parseDateTime` refactorizado para parsear fecha desde string (sin JS Date intermediario)
- `generateChartCacheKey` incluye `orbSystem` en el hash SHA-256
- Entidad `BirthChart` + índice único actualizados para incluir `orbSystem`
- Migración: nueva columna `orb_system` con `DEFAULT 'commercial'`

## Pipeline resultante

```
dto.birthDate (string) → parseDateTime → localToUtc (Luxon, IANA) → ephemeris → aspectos(ORB_CONFIG[orbSystem])
                                                                                 ↑
                                                              orbSystem sólo aquí
```

## Test plan

- [ ] `npm run test:cov` — todos pasan, coverage ≥ 80%
- [ ] `npm run build` — compilación exitosa
- [ ] Prueba manual: Florencia 1978-05-21 — Luna y Ascendente idénticos en ambos modos
- [ ] Prueba manual: Aspectos difieren entre modos (correcto)
- [ ] Prueba manual: Historial Premium — entradas separadas por orbSystem

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## 🔑 Notas Técnicas Clave

### ¿Por qué NO cambiar `parseBirthDate`?

`parseBirthDate` crea `new Date(year, month-1, day)` (local midnight) **a propósito** para que TypeORM use los getters locales (`getDate()`, `getMonth()`, `getFullYear()`) al serializar a PostgreSQL. Ver el comentario extenso en `domain/utils/date-utils.ts`. Esta función **no debe tocarse** — el bug estaba en el consumer (`parseDateTime`), no en la utilidad.

### ¿Por qué `birthDateStr` y no `birthDate: Date` con getters locales?

Usar getters locales (`getFullYear()` en lugar de `getUTCFullYear()`) habría sido una solución mínima válida. Se optó por pasar el string crudo porque:
1. Elimina la dependencia de la timezone del servidor (server-agnostic)
2. Clarifica la arquitectura: el string llega al mismo Luxon sin intermediarios
3. Hace explícito que el pipeline de cálculo no necesita un objeto Date

### Compatibilidad de la migración

La columna `orb_system` tiene `DEFAULT 'commercial'`, por lo que los charts existentes en BD adquieren el modo `commercial` automáticamente. El índice único nuevo reemplaza al anterior.
