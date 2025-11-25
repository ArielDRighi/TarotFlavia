# TASK-ARCH-007: Corrección de Violaciones de Arquitectura

**Fecha:** 2025-11-25
**Estado:** Pendiente
**Prioridad:** Alta (Bloqueante - CI debe pasar validación)
**Estimación:** 6-8 horas

## Contexto

El script `validate-architecture.js` reporta violaciones a las reglas de arquitectura híbrida feature-based del proyecto. Estas violaciones bloquean el pipeline de CI y deben corregirse antes de cualquier PR.

### Reglas de Arquitectura Violadas

Según `docs/ARCHITECTURE.md` y `ADR-002-layered-architecture-criteria.md`:

**Módulos Flat (< 10 archivos o < 1000 líneas):**

- Solo pueden tener carpetas conceptuales: `entities/`, `dto/`, `constants/`
- No pueden tener subcarpetas organizacionales: `services/`, `validators/`, `enums/`, etc.

**Módulos Complejos (≥ 10 archivos o ≥ 1000 líneas):**

- Deben aplicar capas: `domain/`, `application/`, `infrastructure/`
- Pueden tener subcarpetas organizacionales dentro de las capas

## Problemas Identificados

### ERRORES (Bloqueantes - 3)

#### 1. `src/modules/auth/dto/validators/`

**Problema:** Módulo flat (5 archivos, 127 líneas) con subcarpeta organizacional `validators/`

**Violación:**

```
� Validating auth/dto:
   Files: 5
   Lines: 127
   Has layers: ❌
   Organizational subfolders: validators
   ❌ ERROR: Module is below threshold but has organizational subfolders
```

**Solución:**

- Mover archivos de `validators/` a `auth/dto/` (raíz)
- Renombrar con convención: `email-validation.helper.ts` → `email.validator.ts`

**Archivos afectados:**

- `auth/dto/validators/*.ts` → `auth/dto/*.validator.ts`

---

#### 2. `src/modules/scheduling/domain/enums/`

**Problema:** Módulo flat (6 archivos, 60 líneas) con subcarpeta organizacional `enums/`

**Violación:**

```
� Validating scheduling/domain:
   Files: 6
   Lines: 60
   Has layers: ❌
   Organizational subfolders: enums
   ❌ ERROR: Module is below threshold but has organizational subfolders
```

**Solución:**

- Analizar si `scheduling/domain/` es apropiado (podría ser flat `scheduling/enums/`)
- **Opción A (Recomendada):** Mover `scheduling/domain/enums/` → `scheduling/enums/`
- **Opción B:** Si hay otras carpetas en `domain/`, refactorizar a estructura layered completa

**Archivos afectados:**

- `scheduling/domain/enums/*.ts` → `scheduling/enums/*.ts` (si Opción A)

---

#### 3. `src/modules/tarot/cards/services/`

**Problema:** Módulo flat (7 archivos, 967 líneas) con subcarpeta organizacional `services/`

**Violación:**

```
� Validating tarot/cards:
   Files: 7
   Lines: 967
   Has layers: ❌
   Organizational subfolders: services
   ❌ ERROR: Module is below threshold but has organizational subfolders
```

**Solución:**

- Mover archivos de `services/` a `tarot/cards/` (raíz)
- Archivos service quedan al mismo nivel que `entities/`, `dto/`

**Archivos afectados:**

- `tarot/cards/services/*.service.ts` → `tarot/cards/*.service.ts`

---

### WARNINGS (Recomendaciones - 3)

#### 4. Módulo `tarotistas` sin capas (módulos complejos)

**Problema:** 3 submódulos superan umbrales pero no tienen estructura layered:

```
� Validating tarotistas/dto:
   Files: 13
   Lines: 932
   ⚠️  WARNING: Module meets complexity threshold but lacks layered structure

� Validating tarotistas/entities:
   Files: 7
   Lines: 1028
   ⚠️  WARNING: Module meets complexity threshold but lacks layered structure

� Validating tarotistas/services:
   Files: 5
   Lines: 1292
   ⚠️  WARNING: Module meets complexity threshold but lacks layered structure
```

**Decisión:**

- **NO APLICAR en esta tarea** (refactorización mayor)
- Crear `TASK-ARCH-008` para refactorizar `tarotistas` a estructura layered
- Razón: Requiere análisis profundo de dominio, mover lógica entre capas, actualizar tests

**Acción:**

- Documentar en `docs/PLAN_REFACTORIZACION.md` como tarea futura

---

## Plan de Ejecución

### Fase 1: Preparación

```bash
# 1. Verificar estado actual
cd /d/Personal/tarot/backend/tarot-app
npm run build && npm test && npm run test:e2e
node scripts/validate-architecture.js

# 2. Crear rama
git checkout develop
git pull origin develop
git checkout -b feature/TASK-ARCH-007-fix-architecture-violations

# 3. Documentar baseline
npm run test:cov > baseline-coverage.txt
```

### Fase 2: Corrección ERROR 1 - `auth/dto/validators/`

**Paso 1:** Inspeccionar estructura actual

```bash
tree src/modules/auth/dto -L 2
```

**Paso 2:** Mover archivos

```bash
# Desde src/modules/auth/dto/validators/ a src/modules/auth/dto/
# Renombrar: *-validation.helper.ts → *.validator.ts
```

**Paso 3:** Actualizar imports

- Buscar: `from './validators/`
- Reemplazar: `from './`
- Buscar: `from '../validators/`
- Reemplazar: `from '../dto/`

**Paso 4:** Validar

```bash
npm run build
npm run lint
npm test -- auth
```

**Paso 5:** Commit

```bash
git add src/modules/auth/
git commit -m "refactor(auth): TASK-ARCH-007 - move validators to dto root (1/3)"
```

---

### Fase 3: Corrección ERROR 2 - `scheduling/domain/enums/`

**Paso 1:** Inspeccionar `scheduling/domain/`

```bash
tree src/modules/scheduling/domain -L 2
ls -la src/modules/scheduling/
```

**Paso 2:** Determinar estrategia

- Si solo hay `enums/` en `domain/` → Mover a `scheduling/enums/`
- Si hay más carpetas → Evaluar si aplicar layered completo

**Paso 3:** Ejecutar movimiento (Opción A - Recomendada)

```bash
# Mover scheduling/domain/enums/ → scheduling/enums/
# Eliminar scheduling/domain/ si queda vacío
```

**Paso 4:** Actualizar imports

- Buscar: `from './domain/enums/`
- Reemplazar: `from './enums/`
- Buscar: `from '../domain/enums/`
- Reemplazar: `from '../enums/`

**Paso 5:** Validar

```bash
npm run build
npm run lint
npm test -- scheduling
```

**Paso 6:** Commit

```bash
git add src/modules/scheduling/
git commit -m "refactor(scheduling): TASK-ARCH-007 - move enums to module root (2/3)"
```

---

### Fase 4: Corrección ERROR 3 - `tarot/cards/services/`

**Paso 1:** Inspeccionar estructura

```bash
tree src/modules/tarot/cards -L 2
```

**Paso 2:** Mover services a raíz

```bash
# Desde src/modules/tarot/cards/services/ a src/modules/tarot/cards/
```

**Paso 3:** Actualizar imports

- Buscar: `from './services/`
- Reemplazar: `from './`
- Buscar: `from '../services/`
- Reemplazar: `from '../cards/`

**Paso 4:** Validar

```bash
npm run build
npm run lint
npm test -- tarot/cards
npm test -- tarot  # Tests completos del módulo
```

**Paso 5:** Commit

```bash
git add src/modules/tarot/cards/
git commit -m "refactor(tarot): TASK-ARCH-007 - move card services to module root (3/3)"
```

---

### Fase 5: Validación Final

```bash
# 1. Limpiar y reconstruir
rm -rf dist/ node_modules/.cache
npm run build

# 2. Calidad de código
npm run lint
npm run format

# 3. Tests completos
npm test
npm run test:cov
npm run test:e2e -- auth.e2e.spec.ts
npm run test:e2e -- scheduling.e2e.spec.ts
npm run test:e2e -- tarot.e2e.spec.ts

# 4. Validación de arquitectura (debe pasar sin errores)
node scripts/validate-architecture.js

# 5. Dependencias circulares
npx madge --circular --extensions ts src/

# 6. Verificar coverage >= baseline
npm run test:cov > final-coverage.txt
diff baseline-coverage.txt final-coverage.txt
```

**Criterios de Éxito:**

- ✅ `validate-architecture.js` sin ERRORES (warnings de tarotistas OK)
- ✅ Build sin errores
- ✅ Lint sin errores
- ✅ Tests: 100% passing
- ✅ Coverage >= baseline
- ✅ 0 dependencias circulares
- ✅ App arranca: `npm run start:dev`

---

### Fase 6: Documentación y PR

**Paso 1:** Actualizar documentación

```bash
# Si cambios requieren actualizar ejemplos en:
# - docs/ARCHITECTURE.md
# - docs/architecture/decisions/ADR-002-layered-architecture-criteria.md
```

**Paso 2:** Crear TASK-ARCH-008 para tarotistas

```bash
# Agregar a docs/PLAN_REFACTORIZACION.md:
# TASK-ARCH-008: Refactorizar módulo tarotistas a estructura layered
```

**Paso 3:** Push y CI

```bash
git push origin feature/TASK-ARCH-007-fix-architecture-violations

# Monitorear CI
gh run list --branch feature/TASK-ARCH-007-fix-architecture-violations --limit 1
gh run watch <run-id>
```

**Paso 4:** Crear PR

**Título:**

```
refactor: TASK-ARCH-007 - Fix architecture validation errors
```

**Descripción:**

````markdown
## Objetivo

Corregir violaciones de arquitectura reportadas por `validate-architecture.js` que bloquean CI.

## Cambios Realizados

### 1. Módulo `auth` (ERROR 1)

- ❌ Antes: `auth/dto/validators/` (subcarpeta organizacional en flat module)
- ✅ Después: Validators movidos a `auth/dto/*.validator.ts`
- Archivos afectados: [listar]

### 2. Módulo `scheduling` (ERROR 2)

- ❌ Antes: `scheduling/domain/enums/` (estructura innecesaria)
- ✅ Después: `scheduling/enums/` (flat structure)
- Archivos afectados: [listar]

### 3. Módulo `tarot/cards` (ERROR 3)

- ❌ Antes: `tarot/cards/services/` (subcarpeta organizacional en flat module)
- ✅ Después: Services movidos a `tarot/cards/*.service.ts`
- Archivos afectados: [listar]

## Validaciones

- ✅ `validate-architecture.js` sin ERRORES
- ✅ Build: OK
- ✅ Lint: OK
- ✅ Tests unitarios: X/X passing
- ✅ Tests e2e: X/X passing
- ✅ Coverage: X% (baseline: X%)
- ✅ Dependencias circulares: 0

## Warnings Pendientes (No bloqueantes)

- ⚠️ `tarotistas/{dto,entities,services}`: Requiere refactorización mayor (TASK-ARCH-008)
- ⚠️ `cache/domain`: Excepción documentada (TASK-ARCH-006)

## Testing

```bash
node scripts/validate-architecture.js  # ✅ Sin ERRORES
npm run build && npm test && npm run test:e2e
```
````

## Próximos Pasos

- [ ] Crear TASK-ARCH-008: Refactorizar `tarotistas` a estructura layered

````

---

## Métricas de Éxito

| Métrica | Antes | Después | Estado |
|---------|-------|---------|--------|
| `validate-architecture.js` ERRORS | 3 | 0 | ✅ |
| `validate-architecture.js` WARNINGS | 4 | 4 | ℹ️ (3 tarotistas + 1 cache OK) |
| Build | ✅ | ✅ | ✅ |
| Tests unitarios | X passing | X passing | ✅ |
| Tests e2e | X passing | X passing | ✅ |
| Coverage | X% | ≥X% | ✅ |
| Dependencias circulares | 0 | 0 | ✅ |

---

## Prohibiciones

🚫 **NO hacer en esta tarea:**
- Refactorizar `tarotistas` a layered (crear TASK-ARCH-008)
- Cambiar lógica de negocio
- Eliminar tests
- Usar `eslint-disable`
- Bajar coverage

✅ **SÍ hacer:**
- Solo mover archivos y actualizar imports
- Mantener 100% de funcionalidad
- Validar cada módulo antes de commit
- Commits incrementales (3 commits: 1 por ERROR)

---

## Notas Técnicas

### Convenciones de Nombres
- Validators: `*.validator.ts` (ej: `email.validator.ts`)
- Services: `*.service.ts` (ej: `cards.service.ts`)
- Enums: `*.enum.ts` (ej: `status.enum.ts`)

### Estructura de Imports
```typescript
// ❌ Antes (auth/dto/)
import { EmailValidator } from './validators/email-validation.helper';

// ✅ Después
import { EmailValidator } from './email.validator';
````

### Tests a Verificar

- `auth.e2e.spec.ts` (validación de DTOs)
- `scheduling.e2e.spec.ts` (uso de enums)
- `tarot.e2e.spec.ts` (card services)
- Tests unitarios de cada módulo afectado

---

## Referencias

- `docs/ARCHITECTURE.md` - Arquitectura híbrida feature-based
- `docs/architecture/decisions/ADR-002-layered-architecture-criteria.md` - Criterios de capas
- `scripts/validate-architecture.js` - Script de validación
- `docs/PLAN_REFACTORIZACION.md` - Plan general de refactorización

---

## Checklist de Ejecución

### Pre-requisitos

- [ ] Branch `develop` actualizado
- [ ] Baseline de coverage documentado
- [ ] Tests pasando 100%

### Ejecución

- [ ] ERROR 1: `auth/dto/validators/` → `auth/dto/*.validator.ts`
- [ ] ERROR 2: `scheduling/domain/enums/` → `scheduling/enums/`
- [ ] ERROR 3: `tarot/cards/services/` → `tarot/cards/*.service.ts`

### Validación

- [ ] `validate-architecture.js` sin ERRORES
- [ ] Build OK
- [ ] Lint OK
- [ ] Tests unitarios OK
- [ ] Tests e2e OK
- [ ] Coverage >= baseline
- [ ] 0 dependencias circulares
- [ ] App funcional (`npm run start:dev`)

### Documentación

- [ ] TASK-ARCH-008 creada (refactor tarotistas)
- [ ] PR creada con descripción completa
- [ ] CI verde

---

**Fecha Estimada de Finalización:** [A definir según asignación]
**Responsable:** [A asignar]
