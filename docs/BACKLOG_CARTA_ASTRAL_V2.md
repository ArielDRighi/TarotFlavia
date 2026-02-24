# MÓDULO 7: CARTA ASTRAL — BACKLOG V2 (CORRECCIONES DE PRECISIÓN)

**Proyecto:** Auguria - Plataforma de Servicios Místicos
**Módulo:** Carta Astral
**Versión:** 2.0
**Fecha:** 24 de febrero de 2026
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)
**Contexto:** Correcciones detectadas al comparar Auguria con el sistema de referencia "Los Arcanos"

---

## RESUMEN EJECUTIVO

Durante el análisis comparativo entre Auguria y Los Arcanos se identificaron 4 discrepancias en el motor de cálculo y la presentación de la carta astral. Este backlog documenta las tareas de corrección en el orden de implementación recomendado.

| ID | Tarea | Tipo | Prioridad | Esfuerzo | Estado |
|----|-------|------|-----------|----------|--------|
| T-CA-057 | Incluir MC en cálculo de distribución (Elementos/Modalidades/Polaridades) | Fix backend | Must | 1h | ⬜ PENDIENTE |
| T-CA-058 | Formato sexagesimal de grados en la UI | Fix frontend | Must | 2h | ⬜ PENDIENTE |
| T-CA-059 | Sistema de orbes dual: strict / commercial | Feature | Should | 4h | ⬜ PENDIENTE |
| T-CA-060 | Reducir drift en cúspides de casas | Investigación + Fix | Could | 3h | ⬜ PENDIENTE |

---

## DETALLE DE TAREAS

---

### T-CA-057: Incluir MC en Cálculo de Distribución (Elementos / Modalidades / Polaridades)

**Estado:** ⬜ PENDIENTE
**Tipo:** Corrección / Bug Fix
**Prioridad:** Must
**Estimación:** 1 hora
**Capa:** Backend

---

#### Contexto

El sistema "Los Arcanos" contabiliza **12 puntos** para calcular los balances de elementos, modalidades y polaridades:

> 10 planetas + Ascendente (AC) + Medio Cielo (MC) = 12

Auguria actualmente solo contabiliza **11 puntos**: 10 planetas + AC. El MC se calcula correctamente pero no se incluye en `calculateDistribution()`.

---

#### Problema

**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/services/chart-calculation.service.ts`

Línea 92:
```typescript
const distribution = this.calculateDistribution(planets, ascendant);
```

Línea 219:
```typescript
const allPoints = [...planets, ascendant]; // ← MC falta aquí
```

El `midheaven` ya está disponible en el scope (calculado en línea 84–86) pero no se pasa a la función de distribución.

---

#### Solución

**Paso 1:** Actualizar la llamada en línea 92:
```typescript
// Antes:
const distribution = this.calculateDistribution(planets, ascendant);

// Después:
const distribution = this.calculateDistribution(planets, ascendant, midheaven);
```

**Paso 2:** Actualizar la firma de la función privada (línea 214):
```typescript
// Antes:
private calculateDistribution(
  planets: PlanetPosition[],
  ascendant: PlanetPosition,
): ChartDistribution

// Después:
private calculateDistribution(
  planets: PlanetPosition[],
  ascendant: PlanetPosition,
  midheaven: PlanetPosition,
): ChartDistribution
```

**Paso 3:** Incluir `midheaven` en `allPoints` (línea 219):
```typescript
// Antes:
const allPoints = [...planets, ascendant];

// Después:
const allPoints = [...planets, ascendant, midheaven];
```

---

#### Tests a crear / actualizar

**Archivo:** `src/modules/birth-chart/__tests__/unit/chart-calculation.service.spec.ts`

```typescript
describe('calculateDistribution', () => {
  it('should count 12 points total (10 planets + AC + MC)', () => {
    // Arrange: carta con todos en Aries para simplificar
    const planets = Array(10).fill({ sign: 'aries', ... });
    const ascendant = { sign: 'aries', ... };
    const midheaven = { sign: 'aries', ... };

    // Act
    const dist = service['calculateDistribution'](planets, ascendant, midheaven);

    // Assert
    const total = dist.elements.fire + dist.elements.earth +
                  dist.elements.air + dist.elements.water;
    expect(total).toBe(12); // era 11 antes del fix
  });
});
```

---

#### Impacto

- Los porcentajes de distribución se recalculan automáticamente sobre 12 puntos.
- Los datos guardados en BD (cartas Premium) reflejarán la distribución actualizada en los nuevos cálculos. Las cartas existentes en BD **no se recalculan** (comportamiento esperado).

---

#### Archivos a modificar

- `backend/tarot-app/src/modules/birth-chart/application/services/chart-calculation.service.ts`
- `backend/tarot-app/src/modules/birth-chart/__tests__/unit/chart-calculation.service.spec.ts`

---

### T-CA-058: Formato Sexagesimal de Grados en la UI

**Estado:** ⬜ PENDIENTE
**Tipo:** Corrección visual / Frontend
**Prioridad:** Must
**Estimación:** 2 horas
**Capa:** Frontend + Backend (edge case)

---

#### Contexto

Los Arcanos muestra los grados en formato sexagesimal estándar: `26°0'` y `14°10'`.
Auguria está renderizando el valor decimal crudo en algún componente: `26.0°` y `14.2°`.

> El backend (`BirthChartFacadeService.formatPosition()`) ya genera correctamente el campo `formattedPosition` como `"26° 0' Virgo"`. El problema es que algún componente frontend ignora este campo y renderiza `signDegree` directamente como número.

---

#### Diagnóstico

| Componente | ¿Usa `formattedPosition`? | Estado |
|---|---|---|
| `PlanetPositionsTable.tsx` | Tiene su propia función `formatPosition()` local → correcto | ✅ OK |
| `BigThree.tsx` | No muestra grado | ✅ OK |
| `PlanetInterpretation` | **A verificar** — candidato principal | ⚠️ Revisar |
| Tooltips / detalles | **A auditar** | ⚠️ Revisar |

Adicionalmente, la facade tiene un edge case sin manejar: si `Math.round(minutes)` devuelve `60`, no se normaliza a `+1 grado, 0 minutos`. El `PlanetPositionService.formatPosition()` sí lo maneja.

---

#### Solución

**Paso 1 — Crear utility compartida en frontend:**

**Archivo a crear:** `frontend/src/components/features/birth-chart/lib/degree.utils.ts`

```typescript
/**
 * Convierte grados decimales a formato sexagesimal (GG°MM')
 *
 * @param signDegree - Grados dentro del signo (0-30 decimal)
 * @returns String en formato "X° Y'"
 *
 * @example
 * formatDegreeSexagesimal(26.0) // "26° 0'"
 * formatDegreeSexagesimal(14.166) // "14° 10'"
 */
export function formatDegreeSexagesimal(signDegree: number): string {
  let deg = Math.floor(signDegree);
  let min = Math.round((signDegree - deg) * 60);
  if (min === 60) {
    deg += 1;
    min = 0;
  }
  return `${deg}° ${min}'`;
}
```

**Paso 2 — Auditar y corregir componentes:**

Buscar en `frontend/src/components/features/birth-chart/` cualquier patrón que renderice el grado directamente:
- `{planet.signDegree}°`
- `{house.signDegree}°`
- `{signDegree.toFixed(1)}°`
- `${signDegree}°`

Reemplazar con:
```typescript
import { formatDegreeSexagesimal } from '../lib/degree.utils';
// ...
{formatDegreeSexagesimal(planet.signDegree)}
```

O usar el `formattedPosition` del backend cuando se necesite con nombre de signo:
```typescript
{planet.formattedPosition} // ya viene como "26° 0' Virgo"
```

**Paso 3 — Fix edge case en facade (backend):**

**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-facade.service.ts`

Método privado `formatPosition()` (aprox. línea 572):
```typescript
// Antes (sin normalización de minutos):
private formatPosition(signDegree: number, sign: string): string {
  const wholeDegrees = Math.floor(signDegree);
  const minutes = Math.round((signDegree - wholeDegrees) * 60);
  const signName = ZodiacSignMetadata[sign as ZodiacSign]?.name ?? sign;
  return `${wholeDegrees}° ${minutes}' ${signName}`;
}

// Después (con normalización):
private formatPosition(signDegree: number, sign: string): string {
  let degrees = Math.floor(signDegree);
  let minutes = Math.round((signDegree - degrees) * 60);
  if (minutes === 60) {
    degrees += 1;
    minutes = 0;
  }
  const signName = ZodiacSignMetadata[sign as ZodiacSign]?.name ?? sign;
  return `${degrees}° ${minutes}' ${signName}`;
}
```

---

#### Tests a crear

**Archivo:** `frontend/src/components/features/birth-chart/lib/degree.utils.test.ts`

```typescript
import { formatDegreeSexagesimal } from './degree.utils';

describe('formatDegreeSexagesimal', () => {
  it('should format whole degrees', () => {
    expect(formatDegreeSexagesimal(26.0)).toBe("26° 0'");
  });

  it('should format decimal degrees to minutes', () => {
    expect(formatDegreeSexagesimal(14.166)).toBe("14° 10'");
  });

  it('should normalize 60 minutes to +1 degree', () => {
    // 29.9999... rounds to 30° 0'
    expect(formatDegreeSexagesimal(29.9999)).toBe("30° 0'");
  });

  it('should handle 0 degrees', () => {
    expect(formatDegreeSexagesimal(0)).toBe("0° 0'");
  });
});
```

---

#### Archivos a modificar / crear

- `frontend/src/components/features/birth-chart/lib/degree.utils.ts` ← **CREAR**
- `frontend/src/components/features/birth-chart/lib/degree.utils.test.ts` ← **CREAR**
- Componentes con renders de `signDegree` crudo ← **AUDITAR y corregir**
- `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-facade.service.ts` ← edge case minutes

---

### T-CA-059: Sistema de Orbes Dual (strict / commercial)

**Estado:** ⬜ PENDIENTE
**Tipo:** Feature / Mejora
**Prioridad:** Should
**Estimación:** 4 horas
**Capa:** Backend + Frontend

---

#### Contexto

Auguria detecta ~13 aspectos con sus orbes actuales (estrictos). Los Arcanos detecta más aspectos porque usa orbes más permisivos. En lugar de elegir un único sistema, implementamos un parámetro opcional `orbSystem` que el cliente puede enviar para elegir el nivel de tolerancia.

| Aspecto | `strict` (actual) | `commercial` (nuevo default) |
|---------|-------------------|-----------------------------|
| Conjunción ☌ | 8° | 10° |
| Oposición ☍ | 8° | 10° |
| Cuadratura □ | 6° | 8° |
| Trígono △ | 8° | 10° |
| Sextil ⚹ | 4° | 8° |

---

#### Solución Backend

**Paso 1 — Agregar tipo y constantes de orbes:**

**Archivo:** `backend/tarot-app/src/modules/birth-chart/domain/enums/aspect-type.enum.ts`

```typescript
// Agregar al final del archivo:

export type OrbSystem = 'strict' | 'commercial';

/**
 * Matrices de orbes por sistema
 *
 * strict: Purista / profesional — filtra aspectos débiles
 * commercial: Amplios — paridad con plataformas comerciales (Los Arcanos, Astro.com)
 */
export const ORB_CONFIGS: Record<OrbSystem, Record<AspectType, number>> = {
  strict: {
    [AspectType.CONJUNCTION]: 8,
    [AspectType.OPPOSITION]: 8,
    [AspectType.SQUARE]: 6,
    [AspectType.TRINE]: 8,
    [AspectType.SEXTILE]: 4,
  },
  commercial: {
    [AspectType.CONJUNCTION]: 10,
    [AspectType.OPPOSITION]: 10,
    [AspectType.SQUARE]: 8,
    [AspectType.TRINE]: 10,
    [AspectType.SEXTILE]: 8,
  },
};
```

**Paso 2 — Actualizar AspectCalculationService:**

**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/services/aspect-calculation.service.ts`

```typescript
// Antes:
calculateAspects(planets: PlanetPosition[], ascendant: PlanetPosition): ChartAspect[]

// Después:
calculateAspects(
  planets: PlanetPosition[],
  ascendant: PlanetPosition,
  orbSystem: OrbSystem = 'commercial',
): ChartAspect[]
```

Reemplazar el uso de `AspectTypeMetadata[type].orb` por:
```typescript
import { ORB_CONFIGS, OrbSystem } from '../../domain/enums/aspect-type.enum';
// ...
const maxOrb = ORB_CONFIGS[orbSystem][aspectType];
```

**Paso 3 — Actualizar ChartCalculationInput y ChartCalculationService:**

**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/services/chart-calculation.service.ts`

```typescript
export interface ChartCalculationInput {
  // ... campos existentes ...
  orbSystem?: OrbSystem; // default: 'commercial'
}
```

Línea 89 (llamada a calculateAspects):
```typescript
// Antes:
const aspects = this.aspectService.calculateAspects(planets, ascendant);

// Después:
const aspects = this.aspectService.calculateAspects(
  planets,
  ascendant,
  input.orbSystem ?? 'commercial',
);
```

**Paso 4 — Agregar al DTO de request:**

**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/dto/generate-chart.dto.ts`

```typescript
import { OrbSystem } from '../../domain/enums/aspect-type.enum';

// Agregar en GenerateChartDto:
@ApiPropertyOptional({
  enum: ['strict', 'commercial'],
  default: 'commercial',
  description: 'Sistema de orbes: strict (purista) o commercial (permisivo)',
})
@IsOptional()
@IsIn(['strict', 'commercial'], {
  message: 'Sistema de orbes inválido. Use "strict" o "commercial"',
})
orbSystem?: OrbSystem;
```

**Paso 5 — Pasar orbSystem desde la facade:**

**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-facade.service.ts`

Buscar donde se llama a `chartCalculationService.calculateChart(input)` y asegurar que `dto.orbSystem` se pasa en el input.

---

#### Solución Frontend

**Archivo:** `frontend/src/types/birth-chart-api.types.ts` (o donde esté el tipo de request)

```typescript
export interface GenerateChartRequest {
  // ... campos existentes ...
  orbSystem?: 'strict' | 'commercial';
}
```

La UI puede exponer esto como un toggle (si se desea en el futuro). Por ahora solo fluye como parámetro de la API.

---

#### Tests a crear / actualizar

**Archivo:** `backend/tarot-app/src/modules/birth-chart/__tests__/unit/aspect-calculation.service.spec.ts`

```typescript
describe('orbSystem', () => {
  it('should detect more aspects with commercial orbs than strict', () => {
    const planets = [...]; // datos que tengan aspectos en el rango 8°-10°

    const strictAspects = service.calculateAspects(planets, ascendant, 'strict');
    const commercialAspects = service.calculateAspects(planets, ascendant, 'commercial');

    expect(commercialAspects.length).toBeGreaterThanOrEqual(strictAspects.length);
  });

  it('should default to commercial when no orbSystem provided', () => {
    const aspects = service.calculateAspects(planets, ascendant);
    const commercialAspects = service.calculateAspects(planets, ascendant, 'commercial');
    expect(aspects.length).toBe(commercialAspects.length);
  });
});
```

---

#### Archivos a modificar

- `backend/tarot-app/src/modules/birth-chart/domain/enums/aspect-type.enum.ts`
- `backend/tarot-app/src/modules/birth-chart/application/services/aspect-calculation.service.ts`
- `backend/tarot-app/src/modules/birth-chart/application/services/chart-calculation.service.ts`
- `backend/tarot-app/src/modules/birth-chart/application/dto/generate-chart.dto.ts`
- `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-facade.service.ts`
- `frontend/src/types/birth-chart-api.types.ts`
- `backend/tarot-app/src/modules/birth-chart/__tests__/unit/aspect-calculation.service.spec.ts`

---

### T-CA-060: Reducir Drift en Cúspides de Casas

**Estado:** ⬜ PENDIENTE
**Tipo:** Investigación + Fix
**Prioridad:** Could
**Estimación:** 3 horas (1h investigación + 2h fix si se confirma causa)
**Capa:** Backend

---

#### Contexto

Existe una desviación sistemática de ~0.2° a 0.3° entre las cúspides de casas calculadas por Auguria y las de Los Arcanos.

| Casa | Los Arcanos | Auguria | Delta |
|------|-------------|---------|-------|
| Casa 10 (MC) | 6°59' Piscis (6.98°) | 7.2° | +0.22° |
| Casa 5 | 8°43' (8.71°) | 8.9° | +0.19° |

Esta desviación es sistemática (afecta a todas las casas en la misma dirección), lo que sugiere una diferencia en el motor de cálculo y no un bug puntual.

---

#### Causas identificadas

**Causa A — Redondeo prematuro (confirmada):**
En `BirthChartFacadeService`, `signDegree` se redondea a 2 decimales antes de enviarse al cliente:
```typescript
signDegree: Number(planet.signDegree.toFixed(2)),
```
Esto reduce la precisión del dato crudo. El redondeo debe ocurrir solo en el display.

**Causa B — SWEPH_PATH no configurado (probable):**
En el `.env` actual no existe `SWEPH_PATH`. Sin esta variable, Swiss Ephemeris usa las tablas de Moshier (menor precisión) en lugar de los archivos de efemérides `.se1`.

El `EphemerisWrapper` ya tiene soporte implementado:
```typescript
const ephePath = this.configService.get<string>('SWEPH_PATH');
if (ephePath) {
  sweph.set_ephe_path(ephePath);
}
```

**Causa C — Diferencia de motor (posible):**
Los Arcanos podría usar un motor de efemérides diferente (Astro.com usa también Swiss Ephemeris, pero con configuración distinta). Si Auguria coincide con Astro.com, el delta no es un bug de Auguria.

---

#### Solución

**Paso 1 — Eliminar redondeo prematuro en la facade (inmediato):**

**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-facade.service.ts`

En `formatPlanetsForResponse()` y `formatHousesForResponse()`:
```typescript
// Antes:
signDegree: Number(planet.signDegree.toFixed(2)),

// Después:
signDegree: planet.signDegree,
```

El redondeo visual queda en el frontend (la utility `formatDegreeSexagesimal` de T-CA-058).

**Paso 2 — Configurar SWEPH_PATH (si aplica):**

Descargar archivos de efemérides Swiss Ephemeris (`.se1`) para el rango 1800–2400 desde:
https://www.astro.com/ftp/swisseph/ephe/

Agregar al `.env`:
```
SWEPH_PATH=./ephe
```

Y colocar los archivos descargados en `backend/tarot-app/ephe/`.

**Paso 3 — Verificación comparativa:**

Calcular una carta con datos conocidos y comparar el Julian Day y las cúspides con Astro.com:

```typescript
// Logging temporal en EphemerisWrapper.calculate():
this.logger.debug(`Julian Day: ${julianDay}`);
this.logger.debug(`MC longitude: ${result.data.points[1]}`);
this.logger.debug(`ASC longitude: ${result.data.points[0]}`);
```

Si Auguria coincide con Astro.com → el delta con Los Arcanos es inherente a los motores (documentar como comportamiento esperado, no es un bug).
Si Auguria no coincide con Astro.com → escalar investigación a `localToUtc()` en `timezone-utils.ts`.

---

#### Tests

No se crean tests nuevos para esta tarea. La verificación es comparativa/manual contra Astro.com.

---

#### Archivos a modificar

- `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-facade.service.ts` (redondeo)
- `backend/tarot-app/.env` (SWEPH_PATH si aplica)
- `backend/tarot-app/ephe/` (archivos descargados si aplica)

---

## ORDEN DE IMPLEMENTACIÓN

```
T-CA-057 → T-CA-058 → T-CA-059 → T-CA-060
  (1h)       (2h)       (4h)       (3h)
```

**Justificación del orden:**
1. **T-CA-057** primero por ser el fix más pequeño y de mayor impacto en corrección de datos
2. **T-CA-058** segundo porque su utility es necesaria para T-CA-060
3. **T-CA-059** tercero como feature independiente con mayor alcance
4. **T-CA-060** último porque requiere investigación y puede no tener fix de código

---

## CRITERIOS DE ACEPTACIÓN GLOBALES

- [ ] Distribución total = 12 puntos (10 planetas + AC + MC) en la respuesta de la API
- [ ] Todos los grados en la UI muestran formato `X° Y'` (sin decimales visibles)
- [ ] Request con `orbSystem: 'commercial'` detecta Sol sextil Júpiter y Venus conjunción Urano
- [ ] Request con `orbSystem: 'strict'` devuelve ~13 aspectos (comportamiento actual)
- [ ] MC calculado coincide con Astro.com dentro de ±0.1° para el dato de prueba
- [ ] `npm run test:cov` ≥ 80% en módulo birth-chart
- [ ] `npm run build` exitoso en backend y frontend

---

## NOTAS TÉCNICAS

1. **T-CA-057 no requiere migración:** `distribution` se recalcula en el momento; las cartas existentes en BD guardan el valor viejo (snapshot). Es comportamiento correcto y esperado.

2. **T-CA-059 default es 'commercial':** Esto cambia la cantidad de aspectos para usuarios existentes. Si se quiere mantener compatibilidad hacia atrás, documentar el cambio en release notes.

3. **T-CA-060 puede ser "no reproducible":** Si Auguria ya coincide con Astro.com, el drift vs Los Arcanos no es un bug de Auguria sino una diferencia en los motores de cálculo. En ese caso la tarea se cierra como "by design".

4. **OrbSystem en respuesta:** Por ahora no se devuelve el `orbSystem` usado en la respuesta de la API. Si se necesita en el futuro (para mostrar en UI), agregar al DTO de respuesta.
