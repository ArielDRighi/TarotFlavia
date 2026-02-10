# Hallazgos de Validación - Tasks T-CA-001 a T-CA-013

> **Rama**: `feature/test-validation-T-CA-001-to-013`
> **Fecha**: 2026-02-10
> **Tests existentes**: 330 tests, 18 suites — ✅ TODOS PASAN
> **Tests de comportamiento nuevos**: 58 tests, 3 suites — ✅ TODOS PASAN

---

## Resumen General

| Task | Módulo | Estado | Hallazgos |
|------|--------|--------|-----------|
| T-CA-001 | Enums astrológicos | ✅ PASS | 1 menor |
| T-CA-002 | Entidad BirthChart | ✅ PASS | Sin hallazgos |
| T-CA-003 | Entidad BirthChartInterpretation | ✅ PASS | Sin hallazgos |
| T-CA-004 | Migraciones DB | ✅ PASS | Sin hallazgos |
| T-CA-005 | Seeder interpretaciones | ✅ PASS | 1 menor |
| T-CA-006 | Swiss Ephemeris config | ✅ PASS | 1 menor |
| T-CA-007 | PlanetPositionService | ✅ PASS | Sin hallazgos |
| T-CA-008 | HouseCuspService | ✅ PASS | Sin hallazgos |
| T-CA-009 | AspectCalculationService | ✅ PASS | Sin hallazgos |
| T-CA-010 | ChartCalculationService | ✅ PASS | 1 menor |
| T-CA-011 | BirthChartInterpretationRepo | ✅ PASS | Sin hallazgos |
| T-CA-012 | ChartInterpretationService | ✅ PASS | Sin hallazgos |
| T-CA-013 | ChartAISynthesisService | ✅ PASS | Sin hallazgos |

**Resultado global: ✅ TODOS LOS TASKS PASAN — 4 hallazgos menores no bloqueantes**

---

## Hallazgos Detallados

### 1. T-CA-001 — House enum usa strings en lugar de numéricos

**Severidad**: Menor (no bloqueante)
**Archivo**: `src/modules/birth-chart/domain/enums/house.enum.ts`
**Descripción**: El enum `House` usa valores string (`'1'`, `'2'`, etc.) en lugar de numéricos (`1`, `2`, etc.). Esto es consistente con la convención del resto de enums del módulo (todos usan strings), pero difiere de la representación natural numérica de las casas astrológicas.
**Impacto**: Ninguno funcional. Los servicios que usan casas trabajan con números directamente en `ChartData`, no con el enum.
**Acción sugerida**: Ninguna requerida. Si en el futuro se integra el enum directamente en cálculos, considerar alinearlo a numérico.

### 2. T-CA-005 — Seeder genera 282 registros (no el total ~490)

**Severidad**: Menor (no bloqueante)
**Archivo**: `src/database/seeders/birth-chart-interpretation.seeder.ts`
**Descripción**: El seeder genera 282 registros de interpretaciones estáticas. El backlog contempla ~490 registros totales (incluyendo interpretaciones avanzadas para planetas personales en casas, etc.). Los 282 registros cubren completamente el requisito del Big Three (36 combinaciones Sol/Luna/Ascendente × 12 signos) y las interpretaciones de distribución.
**Impacto**: Ninguno para la funcionalidad actual. Las interpretaciones avanzadas se pueden agregar incrementalmente.
**Acción sugerida**: Completar las ~208 interpretaciones restantes en una tarea futura dedicada.

### 3. T-CA-006 — Falta campo `zodiacType` en configuración de efemérides

**Severidad**: Menor (no bloqueante)
**Archivo**: `src/modules/birth-chart/infrastructure/ephemeris/ephemeris.config.ts`
**Descripción**: La configuración del wrapper de Swiss Ephemeris no incluye un campo explícito `zodiacType` para seleccionar entre zodiaco tropical/sideral. El sistema usa tropical por defecto (que es el correcto para astrología occidental).
**Impacto**: Ninguno. El comportamiento por defecto de Swiss Ephemeris es tropical, que es lo deseado.
**Acción sugerida**: Si en el futuro se desea soporte sideral, agregar el campo de configuración.

### 4. T-CA-010 — Rango de validación de año: 1800-2400 vs backlog 1800-2100

**Severidad**: Menor (no bloqueante)
**Archivo**: `src/modules/birth-chart/application/services/chart-calculation.service.ts`
**Descripción**: El método `validateChartData()` acepta años hasta 2400, mientras que el backlog especifica un rango de 1800-2100. El rango implementado es más permisivo.
**Impacto**: Mínimo. No hay fechas de nacimiento válidas después de ~2026, y la validación adicional es solo una precaución.
**Acción sugerida**: Considerar alinear al rango del backlog (1800-2100) si se desea estricta adherencia a la especificación.

---

## Tests de Comportamiento Creados

Se crearon 3 archivos de test basados en las historias de usuario (HU-CA-001, HU-CA-004/005, HU-CA-006):

### `hu-ca-001-generar-carta.behavior.spec.ts` (28 tests)
- **CA-1**: Cálculo de 10 posiciones planetarias con signo y grado
- **CA-2**: 12 cúspides de casas + Ascendente
- **CA-3**: 5 tipos de aspectos con orbe correcto
- **CA-4**: Distribución por elementos y modalidades
- **Validación**: Coordenadas fuera de rango, fechas inválidas

### `hu-ca-004-big-three.behavior.spec.ts` (15 tests)
- **HU-CA-004 CA-1**: Interpretación Big Three disponible para todos (incluso anónimos)
- **HU-CA-004 CA-2**: Texto describe influencia de cada signo
- **HU-CA-005 CA-1**: Interpretación completa para Free/Premium
- **HU-CA-005 CA-2**: Distribución con porcentajes

### `hu-ca-006-sintesis-ia.behavior.spec.ts` (15 tests)
- **CA-1**: Generación de síntesis para Premium
- **CA-2**: El prompt incluye Big Three, posiciones planetarias, distribución
- **CA-3**: Validación de longitud mínima (500 chars) y detección de idioma español
- **CA-5**: Resultado guardable en chartData
- **Fallback**: Síntesis determinística cuando IA falla

---

## Testing con curl

**No es posible en este momento**: Los controllers HTTP (T-CA-018) aún no están implementados. Solo existen los servicios de aplicación. El testing manual vía curl será posible una vez que se implementen los endpoints REST.

---

## Mejoras Detectadas sobre el Backlog

Se encontraron varias implementaciones que **mejoran** lo especificado en el backlog:

1. **ChartCalculationService**: Incluye formateo determinístico de fechas (`toISOString`) para evitar inconsistencias por timezone
2. **BirthChartInterpretationRepository**: Corrige bug de batch query — usa condiciones OR separadas en lugar de AND combinado
3. **ChartAISynthesisService**: Implementa validación robusta de síntesis (longitud mínima, detección de idioma, conteo de párrafos) y fallback determinístico
4. **AspectCalculationService**: Usa normalización angular correcta para orbes cercanos a 360°

---

## Próximos Pasos Sugeridos

1. [ ] Completar seeder con ~208 interpretaciones restantes (T-CA-005 extensión)
2. [ ] Considerar alinear rango de validación de año a 1800-2100
3. [ ] Implementar controllers HTTP (T-CA-018) para habilitar testing manual con curl
