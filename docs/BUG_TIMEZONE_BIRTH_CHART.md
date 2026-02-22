# BUG: Conversión de Timezone a UTC en Cartas Astrales

> **Severidad:** Crítica — Afecta la precisión astronómica de TODAS las cartas astrales
> **Fecha de detección:** 2026-02-22
> **Estado:** Pendiente de resolución

---

## 1. Diagnóstico del Problema

### 1.1 El Bug Raíz

**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/services/chart-calculation.service.ts`
**Líneas:** 50–53 (sitio de llamada) y 136–182 (método afectado)

El método `parseDateTime` recibe `birthDate` (Date) y `birthTime` (string "HH:mm"), pero
**ignora completamente el campo `timezone`** que viene en `ChartCalculationInput`.
La hora local del nacimiento se pasa directamente a Swiss Ephemeris **sin convertir a UTC**.

```typescript
// ❌ BUG: timezone NO se pasa a parseDateTime
const { year, month, day, hour, minute } = this.parseDateTime(
  input.birthDate,
  input.birthTime,
  // ← input.timezone está disponible pero nunca se usa aquí
);
```

```typescript
// ❌ parseDateTime devuelve la hora LOCAL como si fuera UTC
private parseDateTime(birthDate: Date, birthTime: string) {
  // ... parsea "01:07" → hour=1, minute=7
  return {
    year: birthDate.getUTCFullYear(),
    month: birthDate.getUTCMonth() + 1,
    day: birthDate.getUTCDate(),
    hour,    // ← hora LOCAL, no UTC
    minute,  // ← minuto LOCAL, no UTC
  };
}
```

### 1.2 Por qué esto rompe el cálculo

Swiss Ephemeris usa la función `sweph.calc_ut()` (el sufijo `_ut` = **Universal Time**) y
`sweph.julday()`. Ambas funciones esperan **UT/UTC** como entrada, no hora local.

| Campo | Valor correcto | Valor que recibe la lib |
|-------|---------------|------------------------|
| Hora local (Argentina) | 01:07 | — |
| Offset Argentina (UTC-3) | -3h | — |
| **Hora UTC esperada** | **04:07** | **01:07** ← ERROR |
| Desfase total | — | **−3 horas** |

### 1.3 Validación con el Caso de Prueba

**Datos de entrada:**
- Fecha: 18 de octubre de 2011
- Hora local: 01:07 AM
- Zona horaria: `America/Argentina/Cordoba` (UTC-3, sin DST esa fecha)
- Ubicación: Córdoba, Argentina (lat: -31.4, lon: -64.183)

| Planeta / Punto | Resultado esperado (correcto) | Resultado actual (erróneo) | Desfase |
|----------------|-------------------------------|---------------------------|---------|
| Sol | 24° 25' Libra — Casa 3 | 24.3° Libra — Casa 5 | 0° (signo OK), casa errónea |
| Luna | 1° 17' Cáncer — Casa 12 | 29.7° Géminis — Casa 2 | ~1.5° ≈ 3h de recorrido lunar |
| Ascendente | 8° 00' Cáncer | 28.2° Tauro | ~40° ≈ 3h de rotación terrestre |

La Luna avanza ~0.5°/hora → 3h × 0.5° = **~1.5° de desfase**.
El Ascendente rota ~13°–15°/hora → 3h × ~13° = **~40° de desfase**.
Todo es consistente con exactamente **−3 horas** de error.

---

## 2. Análisis de Contexto

### 2.1 La información de timezone SÍ está disponible

El campo `timezone` (IANA string, ej: `America/Argentina/Cordoba`) ya viaja por toda la
cadena de llamadas pero se descarta silenciosamente:

```
GenerateChartDto.timezone
  → BirthChartFacadeService.generateChart()
    → ChartCalculationInput.timezone
      → ChartCalculationService.calculateChart()
        → parseDateTime(birthDate, birthTime)  ← timezone no se pasa
```

### 2.2 Librerías disponibles y recomendación

El proyecto tiene `date-fns` v4.1 instalado, pero **sin** `date-fns-tz` ni `luxon`.
Para conversiones de timezone históricas con soporte completo de IANA (incluyendo cambios de
DST del pasado), la recomendación es instalar **`luxon`**:

- Maneja la base de datos IANA completa, incluyendo reglas históricas de DST.
- El caso de Argentina es especialmente complejo (múltiples cambios de DST entre 1980–2000).
- Tiene TypeScript typings oficiales (`@types/luxon` incluidos).
- No requiere configuración extra en el servidor.

**Alternativa válida:** `date-fns-tz` v3.x (compatible con `date-fns` v4), pero Luxon es más
robusto para fechas históricas.

### 2.3 El campo `timezone` en el DTO ya es obligatorio y validado

```typescript
// generate-chart.dto.ts — el campo existe y es IANA-válido
@Matches(/^[A-Z][a-zA-Z0-9_+-]*\/[A-Z][a-zA-Z0-9_+-]*(\/[A-Z][a-zA-Z0-9_+-]*)?$/)
timezone: string;
```

No es necesario cambiar contratos de API. Solo hay que **usar** el dato que ya se recibe.

---

## 3. Solución Propuesta

### 3.1 Esquema del fix

```typescript
// chart-calculation.service.ts — DESPUÉS del fix
import { DateTime } from 'luxon';

// 1. Pasar timezone a parseDateTime
const { year, month, day, hour, minute } = this.parseDateTime(
  input.birthDate,
  input.birthTime,
  input.timezone,   // ← agregar este argumento
);

// 2. parseDateTime convierte a UTC con Luxon
private parseDateTime(
  birthDate: Date,
  birthTime: string,
  timezone: string,   // ← nuevo parámetro
): { year: number; month: number; day: number; hour: number; minute: number } {
  // ... validar formato de birthTime como ahora ...

  const localHour = Number(match[1]);
  const localMinute = Number(match[2]);

  // Crear un DateTime en la zona horaria local del nacimiento
  const localDt = DateTime.fromObject(
    {
      year:   birthDate.getUTCFullYear(),
      month:  birthDate.getUTCMonth() + 1,
      day:    birthDate.getUTCDate(),
      hour:   localHour,
      minute: localMinute,
    },
    { zone: timezone },
  );

  if (!localDt.isValid) {
    throw new Error(
      `Cannot resolve timezone "${timezone}": ${localDt.invalidExplanation}`,
    );
  }

  // Convertir a UTC
  const utcDt = localDt.toUTC();

  return {
    year:   utcDt.year,
    month:  utcDt.month,
    day:    utcDt.day,
    hour:   utcDt.hour,
    minute: utcDt.minute,
  };
}
```

### 3.2 Verificación con el caso de prueba

```
Input:  2011-10-18 01:07 America/Argentina/Cordoba
Luxon:  DateTime.fromObject({y:2011, m:10, d:18, h:1, min:7}, {zone:'America/Argentina/Cordoba'})
→ UTC:  2011-10-18T04:07:00Z
→ year=2011, month=10, day=18, hour=4, minute=7  ✅
```

---

## 4. Lista de Tareas (Backlog del Fix)

> **Nota de diseño:** Las 8 subtareas originales fueron consolidadas en 2 para minimizar
> ciclos de validación. Cada tarea ejecuta el ciclo de calidad completo una sola vez al final.

---

### TASK-FIX-TZ-01 — Implementar conversión timezone local → UTC

**Prioridad:** Crítica | **Esfuerzo:** M–L (2–3h)

**Descripción:**
Implementar la corrección completa del bug: instalar la dependencia, crear la utilidad
`localToUtc` con TDD, e integrarla en `ChartCalculationService`. Todo en un único ciclo
de implementación → calidad.

**Subtareas (en orden):**

**1. Instalar `luxon`**
```bash
cd backend/tarot-app
npm install luxon
```
*(Los tipos vienen incluidos. No se necesita `@types/luxon`.)*

**2. Crear `timezone-utils.spec.ts` (TDD — fase RED)**

Archivo: `src/modules/birth-chart/domain/utils/timezone-utils.spec.ts`

```typescript
describe('localToUtc', () => {
  // Caso del bug reportado
  it('CASO DEL BUG: convierte 01:07 Argentina (UTC-3) → 04:07 UTC', () => {
    const result = localToUtc(
      { year: 2011, month: 10, day: 18, hour: 1, minute: 7 },
      'America/Argentina/Cordoba',
    );
    expect(result).toEqual({ year: 2011, month: 10, day: 18, hour: 4, minute: 7 });
  });

  it('convierte hora local UTC-3 (mismo día)', () => {
    const result = localToUtc(
      { year: 2023, month: 6, day: 15, hour: 10, minute: 30 },
      'America/Argentina/Buenos_Aires',
    );
    expect(result).toEqual({ year: 2023, month: 6, day: 15, hour: 13, minute: 30 });
  });

  it('maneja cruce de medianoche: 22:30 UTC-3 → 01:30 UTC día siguiente', () => {
    const result = localToUtc(
      { year: 2023, month: 3, day: 20, hour: 22, minute: 30 },
      'America/Argentina/Buenos_Aires',
    );
    expect(result).toEqual({ year: 2023, month: 3, day: 21, hour: 1, minute: 30 });
  });

  it('maneja cruce de año: 31 dic 23:00 UTC-3 → 1 ene 02:00 UTC', () => {
    const result = localToUtc(
      { year: 2022, month: 12, day: 31, hour: 23, minute: 0 },
      'America/Argentina/Buenos_Aires',
    );
    expect(result).toEqual({ year: 2023, month: 1, day: 1, hour: 2, minute: 0 });
  });

  it('no modifica la hora si la zona es UTC', () => {
    const result = localToUtc(
      { year: 2020, month: 7, day: 4, hour: 12, minute: 0 },
      'UTC',
    );
    expect(result).toEqual({ year: 2020, month: 7, day: 4, hour: 12, minute: 0 });
  });

  it('convierte zona UTC+5:30 correctamente (India, 14:30 → 09:00 UTC)', () => {
    const result = localToUtc(
      { year: 1990, month: 8, day: 15, hour: 14, minute: 30 },
      'Asia/Kolkata',
    );
    expect(result).toEqual({ year: 1990, month: 8, day: 15, hour: 9, minute: 0 });
  });

  it('maneja DST histórico de Europa: verano CEST (UTC+2)', () => {
    // En julio 2005, España está en CEST = UTC+2
    const result = localToUtc(
      { year: 2005, month: 7, day: 10, hour: 12, minute: 0 },
      'Europe/Madrid',
    );
    expect(result).toEqual({ year: 2005, month: 7, day: 10, hour: 10, minute: 0 });
  });

  it('maneja DST histórico de Europa: invierno CET (UTC+1)', () => {
    // En enero 2005, España está en CET = UTC+1
    const result = localToUtc(
      { year: 2005, month: 1, day: 10, hour: 12, minute: 0 },
      'Europe/Madrid',
    );
    expect(result).toEqual({ year: 2005, month: 1, day: 10, hour: 11, minute: 0 });
  });

  it('lanza Error si el timezone IANA no es válido', () => {
    expect(() =>
      localToUtc(
        { year: 2023, month: 6, day: 15, hour: 10, minute: 30 },
        'Invalid/Timezone',
      ),
    ).toThrow();
  });
});
```

**3. Crear `timezone-utils.ts` (TDD — fase GREEN)**

Archivo: `src/modules/birth-chart/domain/utils/timezone-utils.ts`

```typescript
import { DateTime } from 'luxon';

export interface LocalBirthDateTime {
  year: number;
  month: number;  // 1-12
  day: number;
  hour: number;   // 0-23 (local)
  minute: number; // 0-59 (local)
}

export interface UtcDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;   // 0-23 (UTC)
  minute: number; // 0-59 (UTC)
}

/**
 * Convierte fecha/hora local a componentes UTC respetando DST histórico (base IANA).
 * Swiss Ephemeris requiere UT como entrada (ver sweph.calc_ut / sweph.julday).
 */
export function localToUtc(local: LocalBirthDateTime, ianaTimezone: string): UtcDateTime {
  const localDt = DateTime.fromObject(
    { year: local.year, month: local.month, day: local.day,
      hour: local.hour, minute: local.minute, second: 0 },
    { zone: ianaTimezone },
  );

  if (!localDt.isValid) {
    throw new Error(
      `Cannot resolve timezone "${ianaTimezone}" for date ` +
      `${local.year}-${local.month}-${local.day}: ${localDt.invalidExplanation ?? 'unknown error'}`,
    );
  }

  const utcDt = localDt.toUTC();
  return { year: utcDt.year, month: utcDt.month, day: utcDt.day,
           hour: utcDt.hour, minute: utcDt.minute };
}
```

**4. Modificar `chart-calculation.service.ts`**

Archivo: `src/modules/birth-chart/application/services/chart-calculation.service.ts`

Cambios:
- En el sitio de llamada (línea ~50): pasar `input.timezone` a `parseDateTime`.
- En la firma de `parseDateTime`: agregar `timezone: string` como tercer parámetro.
- En el cuerpo de `parseDateTime`: reemplazar el `return` literal por `return localToUtc(...)`.

**5. Actualizar `chart-calculation.service.spec.ts`**

- Agregar campo `timezone` en todos los objetos `ChartCalculationInput` de los tests existentes.
- Ajustar los mocks de `EphemerisWrapper.calculate()` que validan `hour`/`minute` para
  esperar los valores **UTC** (no locales).
- Agregar test de regresión:

```typescript
it('REGRESIÓN BUG-TZ: pasa hora UTC (no local) a Swiss Ephemeris para Argentina', () => {
  const input: ChartCalculationInput = {
    birthDate: new Date(Date.UTC(2011, 9, 18)),
    birthTime: '01:07',
    latitude: -31.4,
    longitude: -64.183,
    timezone: 'America/Argentina/Cordoba',
  };

  service.calculateChart(input);

  expect(mockEphemeris.calculate).toHaveBeenCalledWith(
    expect.objectContaining({ year: 2011, month: 10, day: 18, hour: 4, minute: 7 }),
  );
});
```

**6. Ciclo de calidad (en orden)**
```bash
cd backend/tarot-app
npm run format
npm run lint
npm run test:cov
npm run build
node scripts/validate-architecture.js
```

**Criterios de aceptación:**
- [ ] `luxon` aparece en `package.json` bajo `dependencies`
- [ ] `timezone-utils.spec.ts` existe con todos los casos descritos
- [ ] `timezone-utils.ts` existe y todos sus tests pasan
- [ ] `parseDateTime` acepta `timezone` y retorna componentes UTC
- [ ] Test de regresión del bug pasa (hora enviada a ephemeris = 04:07, no 01:07)
- [ ] `npm run format` sin cambios residuales
- [ ] `npm run lint` — 0 errores
- [ ] `npm run test:cov` — todos los tests pasan, coverage global ≥ 80%
- [ ] `npm run build` — compilación exitosa
- [ ] `node scripts/validate-architecture.js` — arquitectura válida

---

### TASK-FIX-TZ-02 — Commit y Pull Request

**Prioridad:** Alta | **Esfuerzo:** XS (15 min)

**Descripción:**
Crear la rama, el commit y el PR una vez que TASK-FIX-TZ-01 esté completamente validada.

**Pasos:**
```bash
git checkout develop
git pull origin develop
git checkout -b fix/T-CA-TZ-birth-chart-utc-conversion

git add backend/tarot-app/package.json \
        backend/tarot-app/package-lock.json \
        backend/tarot-app/src/modules/birth-chart/domain/utils/timezone-utils.ts \
        backend/tarot-app/src/modules/birth-chart/domain/utils/timezone-utils.spec.ts \
        backend/tarot-app/src/modules/birth-chart/application/services/chart-calculation.service.ts \
        backend/tarot-app/src/modules/birth-chart/application/services/chart-calculation.service.spec.ts

git commit -m "fix(birth-chart): convert local birth time to UTC before ephemeris calculation

Swiss Ephemeris (sweph.calc_ut / sweph.julday) expects Universal Time.
parseDateTime was returning local time components unchanged, causing a
systematic offset equal to the birth timezone UTC offset (e.g. -3h for
Argentina → Moon 1.5° off, Ascendant 40° off).

Fix: install luxon, add localToUtc util (IANA-aware historical DST),
wire timezone through parseDateTime → localToUtc before ephemeris call."

git push -u origin fix/T-CA-TZ-birth-chart-utc-conversion

gh pr create --base develop \
  --title "fix(birth-chart): corrección conversión timezone a UTC en cartas astrales" \
  --body "$(cat <<'EOF'
## Problema

Swiss Ephemeris recibía la hora **local** del nacimiento en lugar de **UTC**.
Ejemplo: nacimiento en Argentina (UTC-3) a las 01:07 → la lib recibía 01:07 en vez de 04:07.
Esto generaba un desfase sistemático de exactamente el offset del timezone en todos los planetas y el Ascendente.

## Causa raíz

`parseDateTime` en `ChartCalculationService` ignoraba el campo `timezone` de `ChartCalculationInput`, devolviendo `hour`/`minute` tal como los ingresa el usuario (hora local).

## Solución

- Se instala `luxon` para conversión timezone-aware con soporte histórico de DST (base IANA).
- Se crea la utilidad `localToUtc` en `domain/utils/timezone-utils.ts`.
- Se agrega `timezone` como parámetro a `parseDateTime`, que ahora retorna componentes UTC.

## Caso de prueba de regresión

| Input | Antes (bug) | Después (fix) |
|-------|-------------|---------------|
| 2011-10-18 01:07 `America/Argentina/Cordoba` | hour=1, minute=7 | hour=4, minute=7 ✅ |

## Validaciones

- [x] `npm run format`
- [x] `npm run lint` — 0 errores
- [x] `npm run test:cov` — todos los tests pasan, coverage ≥ 80%
- [x] `npm run build` — compilación exitosa
- [x] `node scripts/validate-architecture.js` — arquitectura válida
EOF
)"
```

**Criterios de aceptación:**
- [ ] PR apunta a `develop` (nunca a `main`)
- [ ] Descripción del PR incluye tabla de valores antes/después
- [ ] CI pasa sin errores

---

## 5. Resumen de Archivos Afectados

| Archivo | Tipo de cambio |
|---------|---------------|
| `package.json` | Nueva dependencia: `luxon` |
| `domain/utils/timezone-utils.ts` | **NUEVO** — función `localToUtc` |
| `domain/utils/timezone-utils.spec.ts` | **NUEVO** — tests de `localToUtc` |
| `application/services/chart-calculation.service.ts` | MODIFICAR — `parseDateTime` + llamada |
| `application/services/chart-calculation.service.spec.ts` | MODIFICAR — actualizar mocks + agregar test de regresión |

---

## 6. Notas Técnicas Adicionales

### Por qué Luxon y no otras alternativas

| Opción | Pros | Contras |
|--------|------|---------|
| **Luxon** ✅ | Soporte IANA completo, historial de DST, API inmutable, bien tipada | Nueva dependencia |
| `date-fns-tz` | Ya familiar si se usa `date-fns` | Acoplado con `date-fns`, menos robusto para fechas históricas premodernas |
| `Intl` API nativa | Sin dependencias | No convierte bien fechas pre-1970; comportamiento inconsistente entre runtimes |
| `moment-timezone` | Muy maduro | Deprecated; objetos mutables; bundle enorme |

### El caso de Argentina: por qué es especialmente complejo

Argentina tuvo múltiples regímenes de horario de verano entre los años '60 y 2008.
Desde 2008 permanece fija en UTC-3 sin DST.
El caso reportado (2011-10-18) cae en el período post-2008, por lo que UTC-3 es constante.
Sin embargo, una solución genérica DEBE usar la librería IANA para no depender de reglas
hardcodeadas que fallarán con nacimientos en otras fechas o países.

### Swiss Ephemeris y UT

El sufijo `_ut` en `sweph.calc_ut()` significa **Universal Time**.
La función `sweph.julday()` también espera UT.
Ambas funciones son sensibles a diferencias de horas — un error de 3h produce errores
astronómicos observables en todos los planetas y en el Ascendente/MC.

---

*Documento generado: 2026-02-22*
