# MÓDULO 7: CARTA ASTRAL — BACKLOG V2 (CORRECCIONES DE PRECISIÓN)

**Proyecto:** Auguria - Plataforma de Servicios Místicos
**Módulo:** Carta Astral
**Versión:** 2.1 (revisado según AGENTS.md)
**Fecha:** 24 de febrero de 2026
**Preparado por:** Ariel (Product Owner) + Claude (Asistente IA)
**Contexto:** Correcciones detectadas al comparar Auguria con el sistema de referencia "Los Arcanos"

---

## 🚨 REGLAS CRÍTICAS — LEER ANTES DE IMPLEMENTAR

> Estas reglas vienen de `AGENTS.md` y son **obligatorias** en cada tarea de este backlog.

### 1. Workflow obligatorio por tipo de tarea
- Tareas backend (T-CA-057, parte de T-CA-058, T-CA-059, T-CA-060) → leer `docs/WORKFLOW_BACKEND.md`
- Tareas frontend (T-CA-058) → leer `docs/WORKFLOW_FRONTEND.md`

### 2. TDD — Tests PRIMERO, implementación después
El orden **obligatorio** de cada tarea es:
1. **RED:** Escribir el test → ejecutarlo → debe FALLAR (no hay implementación)
2. **GREEN:** Implementar lo mínimo para que el test PASE
3. **REFACTOR:** Limpiar el código sin romper los tests

### 3. Ciclo de calidad completo — OBLIGATORIO antes de cada commit

**Backend:**
```bash
cd backend/tarot-app
npm run format                         # ⚠️ NUNCA omitir
npm run lint                           # Autofix
npm run test:cov                       # Coverage ≥ 80%
npm run build                          # Build exitoso
node scripts/validate-architecture.js  # ⚠️ NUNCA omitir
```

**Frontend:**
```bash
cd frontend
npm run format                         # ⚠️ NUNCA omitir
npm run lint:fix                       # Autofix
npm run type-check                     # TypeScript
npm run test:run                       # Todos los tests
npm run build                          # Build exitoso
node scripts/validate-architecture.js  # ⚠️ NUNCA omitir
```

### 4. Prohibiciones absolutas
- ❌ `any` type (en producción y tests)
- ❌ `eslint-disable`, `@ts-ignore`, `@ts-nocheck`
- ❌ Hardcodear endpoints (usar `API_ENDPOINTS`)
- ❌ Texto user-facing en inglés

### 5. ⛔ ZONA PROTEGIDA — Utils de fechas (NO TOCAR)

> **Bug recurrente:** Modificar las utilidades de fecha rompe el almacenamiento de fechas de nacimiento (Oct 19 → Oct 18). Ha roto **dos veces**.

Los siguientes archivos están **bloqueados** para modificación:

| Archivo | Función protegida | Razón |
|---------|-------------------|-------|
| `backend/.../date-utils.ts` | `parseBirthDate()` | TypeORM usa local getters; UTC-midnight desplaza un día |
| `backend/.../date-utils.ts` | `formatBirthDate()` | Debe usar `getFullYear/getDate` locales |
| `frontend/lib/utils/date.ts` | `parseDateString()` | Usa noon local para evitar shift en UTC-3 |

> `localToUtc()` en `timezone-utils.ts` **sí puede investigarse** en T-CA-060 porque convierte la HORA de nacimiento (no la fecha), pero **no debe modificarse** sin análisis completo.

---

## RESUMEN EJECUTIVO

| ID | Tarea | Tipo | Prioridad | Esfuerzo | Estado |
|----|-------|------|-----------|----------|--------|
| T-CA-057 | Incluir MC en cálculo de distribución | Fix backend | Must | 1h | ✅ COMPLETADA |
| T-CA-058 | Formato sexagesimal de grados en la UI | Fix frontend + backend | Must | 2h | ⬜ PENDIENTE |
| T-CA-059 | Sistema de orbes dual: strict / commercial | Feature | Should | 4h | ⬜ PENDIENTE |
| T-CA-060 | Reducir drift en cúspides de casas | Investigación + Fix | Could | 3h | ⬜ PENDIENTE |

---

## DETALLE DE TAREAS

---

### T-CA-057: Incluir MC en Cálculo de Distribución (Elementos / Modalidades / Polaridades)

**Estado:** ✅ COMPLETADA
**Tipo:** Corrección / Bug Fix
**Prioridad:** Must
**Estimación:** 1 hora
**Capa:** Backend
**Branch:** `feature/T-CA-057-mc-en-distribucion`

---

#### Contexto

El sistema "Los Arcanos" contabiliza **12 puntos** para calcular los balances de elementos, modalidades y polaridades:

> 10 planetas + Ascendente (AC) + Medio Cielo (MC) = 12

Auguria actualmente solo contabiliza **11 puntos**: 10 planetas + AC. El MC se calcula correctamente pero no se incluye en `calculateDistribution()`.

---

#### Problema

**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/services/chart-calculation.service.ts`

```typescript
// Línea 92 — llamada que excluye midheaven:
const distribution = this.calculateDistribution(planets, ascendant);

// Línea 219 — allPoints sin MC:
const allPoints = [...planets, ascendant]; // ← midheaven falta aquí
```

El `midheaven` ya está calculado (líneas 84–86) y disponible en el scope; solo falta pasarlo.

---

#### Implementación (TDD)

**🔴 RED — Escribir tests primero:**

**Archivo:** `src/modules/birth-chart/__tests__/unit/chart-calculation.service.spec.ts`

```typescript
describe('calculateDistribution', () => {
  it('should count 12 points total (10 planets + AC + MC)', () => {
    // Arrange: todos en Aries para contar solo fuego
    const makePlanet = (sign: string) => ({
      planet: 'sun',
      sign,
      signDegree: 15,
      longitude: 15,
      house: 1,
      isRetrograde: false,
    });
    const planets = Array(10).fill(null).map(() => makePlanet('aries'));
    const ascendant = makePlanet('aries');
    const midheaven = makePlanet('aries');

    // Act — acceso al método privado para test unitario
    const dist = (service as unknown as {
      calculateDistribution: (
        p: PlanetPosition[],
        a: PlanetPosition,
        m: PlanetPosition,
      ) => ChartDistribution;
    }).calculateDistribution(planets, ascendant, midheaven);

    // Assert
    const total =
      dist.elements.fire +
      dist.elements.earth +
      dist.elements.air +
      dist.elements.water;
    expect(total).toBe(12); // era 11 antes del fix
    expect(dist.elements.fire).toBe(12); // todos en Aries
  });

  it('should count MC polarity in distribution', () => {
    const makePlanet = (sign: string) => ({
      planet: 'sun',
      sign,
      signDegree: 15,
      longitude: 15,
      house: 1,
      isRetrograde: false,
    });
    const planets = Array(10).fill(null).map(() => makePlanet('taurus')); // tierra = femenino
    const ascendant = makePlanet('taurus');
    const midheaven = makePlanet('aries'); // fuego = masculino → debe contar

    const dist = (service as unknown as {
      calculateDistribution: (
        p: PlanetPosition[],
        a: PlanetPosition,
        m: PlanetPosition,
      ) => ChartDistribution;
    }).calculateDistribution(planets, ascendant, midheaven);

    expect(dist.polarity.masculine).toBe(1);  // solo el MC en Aries
    expect(dist.polarity.feminine).toBe(11);  // 10 planetas + AC en Tauro
  });
});
```

**🟢 GREEN — Implementación:**

1. **Línea 92** — pasar `midheaven`:
   ```typescript
   // Antes:
   const distribution = this.calculateDistribution(planets, ascendant);
   // Después:
   const distribution = this.calculateDistribution(planets, ascendant, midheaven);
   ```

2. **Línea 214** — actualizar firma:
   ```typescript
   private calculateDistribution(
     planets: PlanetPosition[],
     ascendant: PlanetPosition,
     midheaven: PlanetPosition,
   ): ChartDistribution
   ```

3. **Línea 219** — incluir en `allPoints`:
   ```typescript
   // Antes:
   const allPoints = [...planets, ascendant];
   // Después:
   const allPoints = [...planets, ascendant, midheaven];
   ```

---

#### TODO List de Implementación

```
[x] 1. Escribir tests (RED) — deben FALLAR
[x] 2. Implementar cambios en chart-calculation.service.ts (GREEN)
[x] 3. Verificar que tests PASAN
[x] 4. npm run format
[x] 5. npm run lint
[x] 6. npm run test:cov (≥ 80%)
[x] 7. npm run build
[x] 8. node scripts/validate-architecture.js
[x] 9. Actualizar estado en backlog → ✅ COMPLETADA
[x] 10. Crear commit: fix(birth-chart): incluir MC en cálculo de distribución
[x] 11. Push y PR → base: develop
```

---

#### Impacto

- Total de puntos: 11 → 12. Los porcentajes se recalculan automáticamente.
- Las cartas existentes en BD no se recalculan (snapshot). Comportamiento esperado.
- No requiere migración de base de datos.

---

#### Archivos a modificar

- `backend/tarot-app/src/modules/birth-chart/application/services/chart-calculation.service.ts`
- `backend/tarot-app/src/modules/birth-chart/__tests__/unit/chart-calculation.service.spec.ts`

---

### T-CA-058: Formato Sexagesimal de Grados en la UI

**Estado:** ⬜ PENDIENTE
**Tipo:** Corrección visual
**Prioridad:** Must
**Estimación:** 2 horas
**Capa:** Frontend (principal) + Backend (edge case en facade)
**Branch:** `feature/T-CA-058-formato-sexagesimal-grados`

---

#### Contexto

Los Arcanos muestra: `26°0'` y `14°10'`.
Auguria renderiza: `26.0°` y `14.2°`.

El backend ya genera `formattedPosition: "26° 0' Virgo"` correctamente en `BirthChartFacadeService.formatPosition()`. El problema es que algún componente frontend renderiza `signDegree` directamente como número decimal en lugar de usar esa propiedad o convertirla.

---

#### Diagnóstico de componentes

| Componente | Estado | Acción |
|---|---|---|
| `PlanetPositionsTable.tsx` | Tiene `formatPosition()` local ✅ | Solo verificar |
| `BigThree.tsx` | No muestra grado ✅ | Sin cambios |
| `PlanetInterpretation` | Candidato principal ⚠️ | Auditar |
| Tooltips y detalles | Sin verificar ⚠️ | Auditar |
| `birth-chart-facade.service.ts` | Edge case `minutes === 60` sin manejar | Fix puntual |

---

#### Implementación (TDD)

**🔴 RED — Tests primero:**

**Archivo a crear:** `frontend/src/components/features/birth-chart/lib/degree.utils.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { formatDegreeSexagesimal } from './degree.utils';

describe('formatDegreeSexagesimal', () => {
  it('should format whole degrees showing 0 minutes', () => {
    expect(formatDegreeSexagesimal(26.0)).toBe("26° 0'");
  });

  it('should convert decimal fraction to minutes', () => {
    // 14.166... = 14° 10' (0.166... * 60 = 9.99... → round → 10)
    expect(formatDegreeSexagesimal(14.1666)).toBe("14° 10'");
  });

  it('should handle 0 degrees', () => {
    expect(formatDegreeSexagesimal(0)).toBe("0° 0'");
  });

  it('should normalize 60 minutes to +1 degree and 0 minutes', () => {
    // Caso edge: Math.round(0.9999 * 60) = Math.round(59.994) = 60 → debe ser 30° 0'
    expect(formatDegreeSexagesimal(29.9999)).toBe("30° 0'");
  });

  it('should handle mid-sign values', () => {
    // 15.5 = 15° 30'
    expect(formatDegreeSexagesimal(15.5)).toBe("15° 30'");
  });
});
```

**🟢 GREEN — Implementación frontend:**

**Archivo a crear:** `frontend/src/components/features/birth-chart/lib/degree.utils.ts`

```typescript
/**
 * Convierte grados decimales a formato sexagesimal (GG°MM')
 *
 * @param signDegree - Grados dentro del signo (0–30 decimal)
 * @returns String en formato "X° Y'"
 *
 * @example
 * formatDegreeSexagesimal(26.0)    // "26° 0'"
 * formatDegreeSexagesimal(14.1666) // "14° 10'"
 * formatDegreeSexagesimal(15.5)    // "15° 30'"
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

**Auditoría de componentes — reemplazar renders directos:**

Buscar con grep en `frontend/src/components/features/birth-chart/`:
```bash
grep -rn "signDegree}°\|signDegree\.toFixed\|signDegree}\`" \
  frontend/src/components/features/birth-chart/
```

Patrón a eliminar → reemplazar con utility o `formattedPosition`:
```typescript
// ❌ Antes (renderiza decimal):
<span>{planet.signDegree}°</span>

// ✅ Después (opción A — usar campo del backend):
<span>{planet.formattedPosition}</span>  {/* "26° 0' Virgo" */}

// ✅ Después (opción B — si solo se necesita el grado):
<span>{formatDegreeSexagesimal(planet.signDegree)}</span>
```

**Fix en facade (backend) — edge case `minutes === 60`:**

**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-facade.service.ts`

```typescript
// Antes (sin normalización):
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

#### TODO List de Implementación

**Frontend:**
```
[ ] 1. Crear degree.utils.test.ts con todos los casos (RED — deben FALLAR)
[ ] 2. Crear degree.utils.ts con formatDegreeSexagesimal (GREEN)
[ ] 3. Ejecutar tests de la utility — deben PASAR
[ ] 4. Grep para encontrar renders directos de signDegree
[ ] 5. Corregir cada componente encontrado
[ ] 6. npm run format
[ ] 7. npm run lint:fix
[ ] 8. npm run type-check
[ ] 9. npm run test:run
[ ] 10. npm run build
[ ] 11. node scripts/validate-architecture.js
```

**Backend (edge case):**
```
[ ] 12. Corregir formatPosition en birth-chart-facade.service.ts
[ ] 13. npm run format
[ ] 14. npm run lint
[ ] 15. npm run test:cov (≥ 80%)
[ ] 16. npm run build
[ ] 17. node scripts/validate-architecture.js
[ ] 18. Actualizar estado en backlog → ✅ COMPLETADA
[ ] 19. Crear commit: fix(birth-chart): formato sexagesimal de grados en UI y facade
[ ] 20. Push y PR → base: develop
```

---

#### Archivos a modificar / crear

- `frontend/src/components/features/birth-chart/lib/degree.utils.ts` ← **CREAR**
- `frontend/src/components/features/birth-chart/lib/degree.utils.test.ts` ← **CREAR**
- Componentes con renders directos de `signDegree` ← **AUDITAR y corregir**
- `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-facade.service.ts`

---

### T-CA-059: Sistema de Orbes Dual (strict / commercial)

**Estado:** ⬜ PENDIENTE
**Tipo:** Feature / Mejora
**Prioridad:** Should
**Estimación:** 4 horas
**Capa:** Backend + Frontend
**Branch:** `feature/T-CA-059-sistema-orbes-dual`

---

#### Contexto

Auguria detecta ~13 aspectos (orbes estrictos). Los Arcanos detecta más porque usa orbes más permisivos. En lugar de elegir uno, implementamos un parámetro opcional `orbSystem` en el request.

| Aspecto | `strict` (actual) | `commercial` (nuevo default) |
|---------|-------------------|-----------------------------|
| Conjunción ☌ | 8° | 10° |
| Oposición ☍ | 8° | 10° |
| Cuadratura □ | 6° | 8° |
| Trígono △ | 8° | 10° |
| Sextil ⚹ | 4° | 8° |

El default cambia a `'commercial'` para paridad comercial. El modo `'strict'` queda disponible para usuarios avanzados.

---

#### Implementación (TDD)

**🔴 RED — Tests primero:**

**Archivo:** `src/modules/birth-chart/__tests__/unit/aspect-calculation.service.spec.ts`

```typescript
describe('orbSystem parameter', () => {
  // Preparar datos con un aspecto que esté en el rango 8°–10°
  // (visible en 'commercial' pero invisible en 'strict')
  const planetWith9DegOrb: PlanetPosition = {
    planet: 'sun',
    sign: 'aries',
    signDegree: 0,
    longitude: 0,
    house: 1,
    isRetrograde: false,
  };
  const planetAt9Deg: PlanetPosition = {
    planet: 'jupiter',
    sign: 'aries',
    signDegree: 9,
    longitude: 9,
    house: 1,
    isRetrograde: false,
  };

  it('should NOT detect conjunction with 9° orb in strict mode', () => {
    const aspects = service.calculateAspects(
      [planetWith9DegOrb, planetAt9Deg],
      mockAscendant,
      'strict',
    );
    const conjunction = aspects.find(
      (a) =>
        a.aspectType === AspectType.CONJUNCTION &&
        ((a.planet1 === 'sun' && a.planet2 === 'jupiter') ||
          (a.planet1 === 'jupiter' && a.planet2 === 'sun')),
    );
    expect(conjunction).toBeUndefined();
  });

  it('should DETECT conjunction with 9° orb in commercial mode', () => {
    const aspects = service.calculateAspects(
      [planetWith9DegOrb, planetAt9Deg],
      mockAscendant,
      'commercial',
    );
    const conjunction = aspects.find(
      (a) =>
        a.aspectType === AspectType.CONJUNCTION &&
        ((a.planet1 === 'sun' && a.planet2 === 'jupiter') ||
          (a.planet1 === 'jupiter' && a.planet2 === 'sun')),
    );
    expect(conjunction).toBeDefined();
  });

  it('should default to commercial when orbSystem is not provided', () => {
    const defaultAspects = service.calculateAspects(
      [planetWith9DegOrb, planetAt9Deg],
      mockAscendant,
    );
    const commercialAspects = service.calculateAspects(
      [planetWith9DegOrb, planetAt9Deg],
      mockAscendant,
      'commercial',
    );
    expect(defaultAspects.length).toBe(commercialAspects.length);
  });
});
```

**🟢 GREEN — Implementación backend (5 pasos):**

**Paso 1 — Agregar tipo y constantes:**

**Archivo:** `backend/tarot-app/src/modules/birth-chart/domain/enums/aspect-type.enum.ts`

```typescript
// Agregar al final del archivo existente:

export type OrbSystem = 'strict' | 'commercial';

/**
 * Matrices de orbes por sistema.
 * strict: Purista/profesional — filtra aspectos débiles.
 * commercial: Amplios — paridad con plataformas comerciales.
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

**Paso 2 — Actualizar `AspectCalculationService.calculateAspects()`:**

**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/services/aspect-calculation.service.ts`

```typescript
// Agregar import:
import { ORB_CONFIGS, OrbSystem } from '../../domain/enums/aspect-type.enum';

// Actualizar firma del método:
calculateAspects(
  planets: PlanetPosition[],
  ascendant: PlanetPosition,
  orbSystem: OrbSystem = 'commercial',
): ChartAspect[] {
  // ...
  // Reemplazar cada uso de AspectTypeMetadata[type].orb por:
  const maxOrb = ORB_CONFIGS[orbSystem][type];
  // ...
}
```

**Paso 3 — Actualizar `ChartCalculationInput` e inyección:**

**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/services/chart-calculation.service.ts`

```typescript
export interface ChartCalculationInput {
  // ... campos existentes sin cambio ...
  orbSystem?: OrbSystem; // default aplicado en el servicio de aspectos
}
```

```typescript
// Actualizar llamada a calculateAspects (línea ~89):
const aspects = this.aspectService.calculateAspects(
  planets,
  ascendant,
  input.orbSystem ?? 'commercial',
);
```

**Paso 4 — Agregar campo al DTO de entrada:**

**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/dto/generate-chart.dto.ts`

```typescript
import { OrbSystem } from '../../domain/enums/aspect-type.enum';
import { IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Agregar dentro de GenerateChartDto:
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

**Paso 5 — Pasar `orbSystem` desde la facade:**

**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-facade.service.ts`

Localizar donde se construye el `ChartCalculationInput` y agregar:
```typescript
orbSystem: dto.orbSystem, // undefined → ChartCalculationService usa 'commercial' por defecto
```

**🟢 GREEN — Implementación frontend:**

**Archivo:** `frontend/src/types/birth-chart-api.types.ts`

```typescript
// Agregar al tipo del request de generación de carta:
orbSystem?: 'strict' | 'commercial';
```

---

#### TODO List de Implementación

```
[ ] 1. Escribir tests en aspect-calculation.service.spec.ts (RED — deben FALLAR)
[ ] 2. Agregar OrbSystem y ORB_CONFIGS en aspect-type.enum.ts
[ ] 3. Actualizar calculateAspects() para aceptar orbSystem (GREEN)
[ ] 4. Actualizar ChartCalculationInput con orbSystem
[ ] 5. Actualizar llamada a calculateAspects en chart-calculation.service.ts
[ ] 6. Agregar orbSystem al GenerateChartDto con validación
[ ] 7. Pasar orbSystem desde birth-chart-facade.service.ts
[ ] 8. Actualizar tipo de request en frontend (birth-chart-api.types.ts)
[ ] 9. Ejecutar tests — deben PASAR
[ ] 10. npm run format (backend)
[ ] 11. npm run lint (backend)
[ ] 12. npm run test:cov ≥ 80% (backend)
[ ] 13. npm run build (backend)
[ ] 14. node scripts/validate-architecture.js (backend)
[ ] 15. npm run format (frontend)
[ ] 16. npm run lint:fix (frontend)
[ ] 17. npm run type-check (frontend)
[ ] 18. npm run test:run (frontend)
[ ] 19. npm run build (frontend)
[ ] 20. node scripts/validate-architecture.js (frontend)
[ ] 21. Actualizar estado en backlog → ✅ COMPLETADA
[ ] 22. Crear commit: feat(birth-chart): implementar sistema de orbes dual strict/commercial
[ ] 23. Push y PR → base: develop
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
**Branch:** `feature/T-CA-060-reducir-drift-cuspides`

---

#### ⛔ ADVERTENCIA CRÍTICA — ZONA PROTEGIDA

> Esta tarea investiga el flujo de tiempo en el cálculo de efemérides.
> **ESTÁN PROHIBIDAS** modificaciones a las siguientes funciones:
>
> - `parseBirthDate()` en `date-utils.ts` — maneja almacenamiento de fechas en BD
> - `formatBirthDate()` en `date-utils.ts` — formatea fechas para TypeORM
> - `parseDateString()` en `frontend/lib/utils/date.ts` — display de fechas en UI
>
> Ver sección "ZONA PROTEGIDA" al inicio del backlog.
>
> `localToUtc()` en `timezone-utils.ts` **puede investigarse** (convierte la HORA de nacimiento, no la fecha), pero **no modificarse sin análisis exhaustivo y aprobación explícita**.

---

#### Contexto

Existe una desviación sistemática de ~0.2°–0.3° en las cúspides de casas:

| Casa | Los Arcanos | Auguria | Δ |
|------|-------------|---------|---|
| Casa 10 (MC) | 6°59' Piscis (6.98°) | 7.2° | +0.22° |
| Casa 5 | 8°43' (8.71°) | 8.9° | +0.19° |

La desviación es sistemática (misma dirección en todas las casas), lo que sugiere una diferencia de motor o de precisión, no un bug puntual.

---

#### Causas a investigar (en orden de probabilidad)

**Causa A — Redondeo prematuro en facade (acción inmediata, sin riesgo):**

`BirthChartFacadeService` redondea `signDegree` a 2 decimales antes de enviarlo al cliente, perdiendo precisión:
```typescript
// Actual — recorta precisión:
signDegree: Number(planet.signDegree.toFixed(2)),

// Fix — preservar dato crudo:
signDegree: planet.signDegree,
```
El redondeo para display queda en `formatDegreeSexagesimal()` (T-CA-058). Este cambio es seguro y no toca lógica de cálculo.

**Causa B — SWEPH_PATH no configurado:**

Sin `SWEPH_PATH` en `.env`, Swiss Ephemeris usa tablas Moshier (menor precisión para posiciones planetarias). Las casas dependen de tiempo sidéreo, no de tablas de planetas, por lo que el impacto puede ser menor, pero vale verificarlo.

```
# Descargar archivos de Swiss Ephemeris (.se1) para 1800–2400:
# https://www.astro.com/ftp/swisseph/ephe/
# Agregar a .env:
SWEPH_PATH=./ephe
```

**Causa C — Diferencia inherente de motores (posible resultado de la investigación):**

Si Auguria coincide con Astro.com pero no con Los Arcanos → no es un bug de Auguria. Los Arcanos puede usar una versión diferente de Swiss Ephemeris o configuración distinta de ΔT. En ese caso la tarea se cierra como "by design".

---

#### Implementación

**Paso 1 (inmediato) — Eliminar redondeo prematuro:**

**Archivo:** `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-facade.service.ts`

```typescript
// En formatPlanetsForResponse():
// Antes:
signDegree: Number(planet.signDegree.toFixed(2)),
// Después:
signDegree: planet.signDegree,

// En formatHousesForResponse():
// Antes:
signDegree: Number(house.signDegree.toFixed(2)),
// Después:
signDegree: house.signDegree,
```

**Paso 2 (investigación) — Logging comparativo:**

Agregar logs temporales en `EphemerisWrapper.calculate()` para una carta de datos conocidos:

```typescript
// Logging temporal (remover después de verificar):
this.logger.debug(`[DRIFT-DEBUG] JulianDay: ${julianDay}`);
this.logger.debug(`[DRIFT-DEBUG] ASC longitude: ${result.data.points[0]}`);
this.logger.debug(`[DRIFT-DEBUG] MC longitude: ${result.data.points[1]}`);
this.logger.debug(`[DRIFT-DEBUG] Cusps: ${JSON.stringify(cusps)}`);
```

Comparar con Astro.com usando los mismos datos de nacimiento. Documentar el resultado.

**Paso 3 (condicional) — Configurar SWEPH_PATH:**

Solo si el logging muestra diferencias con Astro.com → descargar archivos de efemérides y configurar `SWEPH_PATH`.

> ⚠️ Si se llega a investigar `localToUtc()` y se detecta algún problema: documentarlo y consultar con el Product Owner antes de modificar.

---

#### Tests

No se crean tests nuevos para esta tarea. La verificación es comparativa:
- **Pass:** Auguria coincide con Astro.com (mismo motor, misma configuración) ± 0.05°
- **Fail:** Auguria no coincide con Astro.com → escalar investigación (sin modificar date-utils)

---

#### TODO List de Implementación

```
[ ] 1. Eliminar redondeo prematuro en facade (Causa A)
[ ] 2. npm run format
[ ] 3. npm run lint
[ ] 4. npm run test:cov (≥ 80%)
[ ] 5. npm run build
[ ] 6. node scripts/validate-architecture.js
[ ] 7. Agregar logging temporal en EphemerisWrapper
[ ] 8. Calcular carta con datos conocidos y comparar con Astro.com
[ ] 9. Documentar resultado: "coincide" o "no coincide"
[ ] 10. Si coincide: cerrar tarea como "by design"
[ ] 11. Si no coincide: configurar SWEPH_PATH (Causa B) y re-verificar
[ ] 12. Si persiste: documentar para consulta con Product Owner (⛔ NO tocar date-utils)
[ ] 13. Remover logging temporal
[ ] 14. Actualizar estado en backlog → ✅ COMPLETADA
[ ] 15. Crear commit: fix(birth-chart): eliminar redondeo prematuro en signDegree de facade
[ ] 16. Push y PR → base: develop
```

---

#### Archivos a modificar

- `backend/tarot-app/src/modules/birth-chart/application/services/birth-chart-facade.service.ts` ← redondeo (seguro)
- `backend/tarot-app/.env` ← SWEPH_PATH (solo si aplica, Causa B)
- `backend/tarot-app/ephe/` ← archivos descargados (solo si aplica, Causa B)
- ⛔ `backend/tarot-app/src/.../date-utils.ts` ← **NO MODIFICAR**
- ⛔ `frontend/src/lib/utils/date.ts` ← **NO MODIFICAR**

---

## ORDEN DE IMPLEMENTACIÓN

```
T-CA-057 → T-CA-058 → T-CA-059 → T-CA-060
  (1h)       (2h)       (4h)       (3h)
```

**Justificación:**
1. **T-CA-057** — Fix más pequeño, mayor impacto en corrección de datos, sin riesgo
2. **T-CA-058** — Su utility `formatDegreeSexagesimal` es prerequisito de T-CA-060
3. **T-CA-059** — Feature independiente con mayor alcance (5 archivos backend + 1 frontend)
4. **T-CA-060** — Requiere investigación; puede cerrarse como "by design"

---

## CRITERIOS DE ACEPTACIÓN GLOBALES

- [x] Distribución total = 12 puntos (10 planetas + AC + MC) en la respuesta de la API
- [ ] Todos los grados en la UI muestran formato `X° Y'` (cero decimales visibles)
- [ ] Request con `orbSystem: 'commercial'` detecta Sol sextil Júpiter y Venus conjunción Urano
- [ ] Request con `orbSystem: 'strict'` devuelve ~13 aspectos (comportamiento actual)
- [ ] `npm run test:cov` ≥ 80% en módulo birth-chart tras todas las tareas
- [ ] `npm run build` exitoso en backend y frontend
- [ ] `node scripts/validate-architecture.js` pasa en backend y frontend
- [ ] Sin `any`, `eslint-disable` ni `@ts-ignore` en código nuevo

---

## NOTAS TÉCNICAS

1. **T-CA-057 no requiere migración:** `distribution` se recalcula en el momento. Cartas existentes en BD conservan el valor viejo (snapshot histórico). Correcto.

2. **T-CA-059 cambia el default de orbes:** Las cartas calculadas después del deploy detectarán más aspectos. Si se necesita migrar cartas existentes, es una tarea separada.

3. **T-CA-060 puede cerrarse como "by design":** Si Auguria coincide con Astro.com, el delta con Los Arcanos es diferencia de motores, no un bug.

4. **`OrbSystem` en la respuesta:** No se devuelve en la respuesta de la API. Si en el futuro se necesita mostrar en UI qué sistema se usó, agregar al DTO de respuesta como tarea independiente.

5. **Branch independiente por tarea:** Cada T-CA-XXX va en su propia branch para PRs atómicos y rollback limpio si es necesario.
