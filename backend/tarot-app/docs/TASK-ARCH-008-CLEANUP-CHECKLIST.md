# TASK-ARCH-008: Checklist de Limpieza - Completar Migración a Layered Architecture

**Fecha:** 2025-11-25  
**Estado:** 🔄 En Progreso  
**Rama:** `feature/TASK-ARCH-008-refactor-tarotistas-layered`

---

## 📋 Resumen Ejecutivo

El módulo tarotistas está en **fase PRESERVE** pero incompleta. La estructura layered (domain/application/infrastructure) está creada pero los archivos legacy siguen en la raíz, causando violación de arquitectura.

### ❌ Problemas Detectados

1. ✅ Capas creadas: `domain/`, `application/`, `infrastructure/`
2. ❌ Controllers en raíz `controllers/` → deben estar en `infrastructure/controllers/`
3. ❌ DTOs en raíz `dto/` → deben estar en `application/dto/`
4. ❌ Entities en raíz `entities/` → deben estar en `infrastructure/entities/`
5. ❌ Services legacy en raíz `services/` → marcar como deprecated
6. ❌ Carpeta vacía `domain/entities/` → eliminar
7. ⚠️ Validación arquitectura: **FALLA** (organizational subfolders)

### ✅ Lo que ya funciona

- ✅ Build OK
- ✅ 27 test suites, 239 tests pasando
- ✅ Interfaces de dominio creadas (3)
- ✅ Repositorios implementados (3)
- ✅ Use-cases implementados (8)
- ✅ Orchestrator funcionando

---

## 🎯 Objetivo

Completar la migración moviendo archivos a sus ubicaciones correctas según arquitectura layered, manteniendo 100% de compatibilidad y tests pasando.

---

## 📝 CHECKLIST DE TAREAS

### ✅ Fase 0: Preparación

**Duración estimada:** 10 minutos

- [x] Verificar que estamos en rama correcta
- [x] Verificar build OK
- [x] Verificar tests OK (baseline)
- [x] Crear backup de la rama actual
- [ ] Documentar estado actual en este archivo

**Comandos:**

```bash
# Verificar rama
git branch --show-current
# Debe mostrar: feature/TASK-ARCH-008-refactor-tarotistas-layered

# Backup
git branch backup/TASK-ARCH-008-$(date +%Y%m%d-%H%M%S)

# Build baseline
npm run build > build-baseline.log 2>&1

# Tests baseline
npm test -- --testPathPattern=tarotistas --passWithNoTests > tests-baseline.log 2>&1
```

---

### 📁 Fase 1: Crear Estructura de Carpetas

**Duración estimada:** 5 minutos

- [ ] Crear `infrastructure/controllers/` (si no existe)
- [ ] Crear `infrastructure/entities/` (si no existe)
- [ ] Crear `application/dto/` (si no existe)

**Comandos:**

```bash
cd src/modules/tarotistas

# Crear carpetas faltantes
mkdir -p infrastructure/controllers
mkdir -p infrastructure/entities
mkdir -p application/dto

# Verificar estructura
tree -L 2 -d
```

**Checklist:**

- [ ] `infrastructure/controllers/` existe
- [ ] `infrastructure/entities/` existe
- [ ] `application/dto/` existe

---

### 🚚 Fase 2: Mover Controllers

**Duración estimada:** 10 minutos

**Archivos a mover:** 8 archivos (4 controllers + 4 specs)

- [ ] Mover `controllers/tarotistas-admin.controller.ts` → `infrastructure/controllers/`
- [ ] Mover `controllers/tarotistas-admin.controller.spec.ts` → `infrastructure/controllers/`
- [ ] Mover `controllers/tarotistas-public.controller.ts` → `infrastructure/controllers/`
- [ ] Mover `controllers/tarotistas-public.controller.spec.ts` → `infrastructure/controllers/`
- [ ] Mover `controllers/metrics.controller.ts` → `infrastructure/controllers/`
- [ ] Mover `controllers/metrics.controller.spec.ts` → `infrastructure/controllers/`
- [ ] Mover `controllers/reports.controller.ts` → `infrastructure/controllers/`
- [ ] Mover `controllers/reports.controller.spec.ts` → `infrastructure/controllers/`

**Comandos:**

```bash
cd src/modules/tarotistas

# Mover todos los controllers
mv controllers/*.ts infrastructure/controllers/

# Verificar que la carpeta vieja quedó vacía
ls -la controllers/

# Si está vacía, eliminar
rmdir controllers/
```

**Checklist:**

- [ ] 8 archivos movidos a `infrastructure/controllers/`
- [ ] Carpeta `controllers/` eliminada
- [ ] Build compila (pueden haber errores de imports - los arreglaremos después)

**Validación:**

```bash
# Contar archivos en nueva ubicación
ls -1 infrastructure/controllers/*.ts | wc -l
# Debe mostrar: 8
```

---

### 🚚 Fase 3: Mover DTOs

**Duración estimada:** 10 minutos

**Archivos a mover:** 17 archivos (DTOs + specs + index)

- [ ] Mover `dto/*.ts` → `application/dto/`
- [ ] Verificar que `dto/index.ts` fue movido

**Comandos:**

```bash
cd src/modules/tarotistas

# Mover todos los DTOs
mv dto/*.ts application/dto/

# Verificar
ls -la dto/

# Si está vacía, eliminar
rmdir dto/
```

**Checklist:**

- [ ] 17+ archivos movidos a `application/dto/`
- [ ] `application/dto/index.ts` existe
- [ ] Carpeta `dto/` eliminada

**Validación:**

```bash
ls -1 application/dto/*.ts | wc -l
# Debe mostrar: 17 o más
```

---

### 🚚 Fase 4: Mover Entities

**Duración estimada:** 10 minutos

**Archivos a mover:** 11 archivos (entities + specs)

- [ ] Mover `entities/tarotista.entity.ts` → `infrastructure/entities/`
- [ ] Mover `entities/tarotista.entity.spec.ts` → `infrastructure/entities/`
- [ ] Mover `entities/tarotista-config.entity.ts` → `infrastructure/entities/`
- [ ] Mover `entities/tarotista-config.entity.spec.ts` → `infrastructure/entities/`
- [ ] Mover `entities/tarotista-card-meaning.entity.ts` → `infrastructure/entities/`
- [ ] Mover `entities/tarotista-card-meaning.entity.spec.ts` → `infrastructure/entities/`
- [ ] Mover `entities/tarotista-application.entity.ts` → `infrastructure/entities/`
- [ ] Mover `entities/tarotista-revenue-metrics.entity.ts` → `infrastructure/entities/`
- [ ] Mover `entities/tarotista-review.entity.ts` → `infrastructure/entities/`
- [ ] Mover `entities/user-tarotista-subscription.entity.ts` → `infrastructure/entities/`
- [ ] Mover `entities/user-tarotista-subscription.entity.spec.ts` → `infrastructure/entities/`

**Comandos:**

```bash
cd src/modules/tarotistas

# Mover todas las entities
mv entities/*.ts infrastructure/entities/

# Verificar
ls -la entities/

# Si está vacía, eliminar
rmdir entities/
```

**Checklist:**

- [ ] 11 archivos movidos a `infrastructure/entities/`
- [ ] Carpeta `entities/` eliminada

**Validación:**

```bash
ls -1 infrastructure/entities/*.ts | wc -l
# Debe mostrar: 11
```

---

### 🧹 Fase 5: Limpiar Carpeta domain/entities Vacía

**Duración estimada:** 2 minutos

- [ ] Verificar que `domain/entities/` está vacía
- [ ] Eliminar `domain/entities/`

**Comandos:**

```bash
cd src/modules/tarotistas

# Verificar vacía
ls -la domain/entities/

# Eliminar
rmdir domain/entities/

# Verificar estructura domain/
ls -la domain/
# Debe mostrar solo: interfaces/
```

**Checklist:**

- [ ] `domain/entities/` eliminada
- [ ] `domain/interfaces/` sigue existiendo

---

### 🏷️ Fase 6: Marcar Services Legacy como Deprecated

**Duración estimada:** 15 minutos

**NO mover estos archivos**, solo marcarlos como deprecated para futuras fases.

- [ ] Agregar `@deprecated` en `services/tarotistas-admin.service.ts`
- [ ] Agregar `@deprecated` en `services/tarotistas-public.service.ts`
- [ ] Agregar `@deprecated` en `services/metrics.service.ts`
- [ ] Agregar `@deprecated` en `services/reports.service.ts`
- [ ] Agregar `@deprecated` en `services/revenue-calculation.service.ts`
- [ ] Agregar `@deprecated` en `tarotistas.service.ts` (raíz)

**Ejemplo de comentario a agregar:**

```typescript
/**
 * @deprecated This service is in PRESERVE phase (TASK-ARCH-008).
 * Use TarotistasOrchestratorService instead.
 * Will be removed in Cleanup phase after all use-cases are implemented.
 *
 * Migration status:
 * - ✅ Create: Use CreateTarotistaUseCase
 * - ✅ List: Use ListTarotistasUseCase
 * - ✅ Update Config: Use UpdateConfigUseCase
 * - ✅ Approve Application: Use ApproveApplicationUseCase
 * - TODO: Add remaining use-cases
 */
@Injectable()
export class TarotistasAdminService {
  // ... existing code
}
```

**Checklist:**

- [ ] 6 archivos marcados con `@deprecated`
- [ ] Comentarios incluyen referencia a TASK-ARCH-008
- [ ] Comentarios listan use-cases alternativos

---

### 🔧 Fase 7: Actualizar Imports en Archivos Movidos

**Duración estimada:** 30-45 minutos

Esta es la fase más laboriosa. Todos los imports en archivos movidos deben actualizarse.

#### 7.1 Actualizar imports en Controllers

**Archivos afectados:** 4 controllers en `infrastructure/controllers/`

Patrón de cambio:

```typescript
// ANTES (cuando estaban en controllers/)
import { SomeDto } from '../dto/some.dto';
import { SomeEntity } from '../entities/some.entity';
import { SomeService } from '../services/some.service';

// DESPUÉS (ahora en infrastructure/controllers/)
import { SomeDto } from '../../application/dto/some.dto';
import { SomeEntity } from '../entities/some.entity';
import { SomeService } from '../../services/some.service';
import { TarotistasOrchestratorService } from '../../application/services/tarotistas-orchestrator.service';
```

**Checklist:**

- [ ] `infrastructure/controllers/tarotistas-admin.controller.ts` - imports actualizados
- [ ] `infrastructure/controllers/tarotistas-public.controller.ts` - imports actualizados
- [ ] `infrastructure/controllers/metrics.controller.ts` - imports actualizados
- [ ] `infrastructure/controllers/reports.controller.ts` - imports actualizados

#### 7.2 Actualizar imports en DTOs

**Archivos afectados:** ~17 DTOs en `application/dto/`

Patrón de cambio:

```typescript
// ANTES (cuando estaban en dto/)
import { SomeEntity } from '../entities/some.entity';

// DESPUÉS (ahora en application/dto/)
import { SomeEntity } from '../../infrastructure/entities/some.entity';
```

**Checklist:**

- [ ] Todos los DTOs con imports actualizados
- [ ] `application/dto/index.ts` actualizado

#### 7.3 Actualizar imports en Entities

**Archivos afectados:** ~11 entities en `infrastructure/entities/`

Los imports entre entities generalmente son relativos (mismo nivel), no deberían cambiar mucho.

**Checklist:**

- [ ] Verificar imports entre entities
- [ ] Actualizar si es necesario

#### 7.4 Actualizar imports en Repositories

**Archivos afectados:** 3 repositorios en `infrastructure/repositories/`

```typescript
// ANTES
import { Tarotista } from '../../entities/tarotista.entity';

// DESPUÉS
import { Tarotista } from '../entities/tarotista.entity';
```

**Checklist:**

- [ ] `typeorm-tarotista.repository.ts` - imports actualizados
- [ ] `typeorm-metrics.repository.ts` - imports actualizados
- [ ] `typeorm-reports.repository.ts` - imports actualizados

#### 7.5 Actualizar imports en Use-Cases

**Archivos afectados:** ~8 use-cases en `application/use-cases/`

```typescript
// ANTES
import { CreateTarotistaDto } from '../../dto/create-tarotista.dto';

// DESPUÉS
import { CreateTarotistaDto } from '../dto/create-tarotista.dto';
```

**Checklist:**

- [ ] Todos los use-cases actualizados

#### 7.6 Actualizar imports en Orchestrator

**Archivo:** `application/services/tarotistas-orchestrator.service.ts`

```typescript
// ANTES
import { CreateTarotistaDto } from '../../dto/create-tarotista.dto';
import { TarotistasAdminService } from '../../services/tarotistas-admin.service';

// DESPUÉS
import { CreateTarotistaDto } from '../dto/create-tarotista.dto';
import { TarotistasAdminService } from '../../../services/tarotistas-admin.service';
```

**Checklist:**

- [ ] Orchestrator actualizado

---

### 🔧 Fase 8: Actualizar tarotistas.module.ts

**Duración estimada:** 15 minutos

Actualizar todos los imports en el módulo principal.

```typescript
// ANTES
import { TarotistasAdminController } from './controllers/tarotistas-admin.controller';
import { CreateTarotistaDto } from './dto/create-tarotista.dto';
import { Tarotista } from './entities/tarotista.entity';

// DESPUÉS
import { TarotistasAdminController } from './infrastructure/controllers/tarotistas-admin.controller';
// Los DTOs no se importan en el módulo normalmente
import { Tarotista } from './infrastructure/entities/tarotista.entity';
```

**Checklist:**

- [ ] Imports de controllers actualizados
- [ ] Imports de entities actualizados
- [ ] Imports de repositories actualizados
- [ ] Imports de use-cases actualizados
- [ ] Imports de orchestrator actualizados
- [ ] Imports de services legacy actualizados

---

### 🔧 Fase 9: Actualizar Imports en Módulos Externos

**Duración estimada:** 20 minutos

Otros módulos que importan desde tarotistas deben actualizarse.

**Buscar referencias:**

```bash
cd src/modules

# Buscar imports de tarotistas
grep -r "from.*tarotistas" --include="*.ts" --exclude-dir=tarotistas | grep -v ".spec.ts"
```

**Posibles módulos afectados:**

- `ai/` (PromptBuilderService puede usar entities de tarotistas)
- Cualquier otro módulo que importe de tarotistas

**Checklist:**

- [ ] Identificar módulos que importan de tarotistas
- [ ] Actualizar imports en esos módulos
- [ ] Verificar que usan exports públicos del módulo

---

### ✅ Fase 10: Validación Completa

**Duración estimada:** 20 minutos

- [ ] **Build OK:**

  ```bash
  npm run build
  ```

- [ ] **Lint OK:**

  ```bash
  npm run lint -- src/modules/tarotistas
  ```

- [ ] **Tests OK:**

  ```bash
  npm test -- --testPathPattern=tarotistas --passWithNoTests
  ```

  Resultado esperado: 27 suites, 239 tests ✅

- [ ] **Validación de arquitectura OK:**

  ```bash
  node scripts/validate-architecture.js
  ```

  Resultado esperado: ✅ Sin ERRORES en tarotistas

- [ ] **Estructura correcta:**

  ```bash
  tree -L 3 src/modules/tarotistas
  ```

  Esperado:

  ```
  tarotistas/
  ├── application/
  │   ├── dto/           (17+ archivos)
  │   ├── services/      (orchestrator)
  │   └── use-cases/     (8 archivos)
  ├── domain/
  │   └── interfaces/    (3 archivos)
  ├── infrastructure/
  │   ├── controllers/   (8 archivos)
  │   ├── entities/      (11 archivos)
  │   └── repositories/  (3 archivos)
  ├── services/          (5 archivos LEGACY - deprecated)
  ├── tarotistas.module.ts
  ├── tarotistas.service.ts (LEGACY - deprecated)
  └── tarotistas.service.spec.ts
  ```

- [ ] **No hay carpetas vacías:**
  ```bash
  find src/modules/tarotistas -type d -empty
  # Debe retornar: nada
  ```

---

### 📝 Fase 11: Commit y Documentación

**Duración estimada:** 10 minutos

- [ ] Verificar archivos modificados:

  ```bash
  git status
  ```

- [ ] Agregar todos los cambios:

  ```bash
  git add .
  ```

- [ ] Commit descriptivo:

  ```bash
  git commit -m "refactor(arch): TASK-ARCH-008 - Completar migración a layered architecture

  - Mover controllers a infrastructure/controllers/ (8 archivos)
  - Mover DTOs a application/dto/ (17 archivos)
  - Mover entities a infrastructure/entities/ (11 archivos)
  - Eliminar domain/entities/ vacío
  - Marcar services legacy como @deprecated (6 archivos)
  - Actualizar todos los imports afectados
  - Actualizar tarotistas.module.ts
  - Actualizar imports en módulos externos

  ✅ Build OK
  ✅ 27 test suites, 239 tests pasando
  ✅ validate-architecture.js sin errores
  ✅ Lint OK

  Estado: PRESERVE phase completa
  Siguiente: Crear use-cases faltantes y deprecar services legacy"
  ```

- [ ] Actualizar `docs/TASK-ARCH-008-PROGRESS.md` con progreso

---

## 🎯 Criterios de Éxito Final

Al completar todas las fases, debes tener:

- ✅ Estructura layered completa sin archivos legacy en raíz (excepto services deprecated)
- ✅ `validate-architecture.js` pasa sin errores ni warnings
- ✅ Build compila sin errores
- ✅ Todos los tests pasando (27 suites, 239 tests)
- ✅ Lint sin errores
- ✅ Coverage >= baseline
- ✅ Commits bien documentados

---

## 🚨 Plan de Rollback

Si algo sale mal en cualquier fase:

```bash
# Ver estado actual
git status

# Descartar cambios no commiteados
git checkout -- .

# O volver al backup
git checkout backup/TASK-ARCH-008-YYYYMMDD-HHMMSS

# O volver al último commit bueno
git reset --hard HEAD~1

# Verificar que todo funciona
npm run build
npm test -- --testPathPattern=tarotistas
```

---

## 📊 Métricas de Progreso

### Antes de la limpieza:

- Archivos en ubicación incorrecta: 36 (8 controllers + 17 DTOs + 11 entities)
- Carpetas vacías: 1 (domain/entities/)
- Validación arquitectura: ❌ FALLA
- Servicios sin deprecar: 6

### Después de la limpieza:

- Archivos en ubicación incorrecta: 0
- Carpetas vacías: 0
- Validación arquitectura: ✅ PASA
- Servicios deprecated: 6

---

## 📖 Referencias

- **Tarea principal:** TASK-ARCH-008 en `PLAN_REFACTORIZACION.md`
- **Progreso:** `docs/TASK-ARCH-008-PROGRESS.md`
- **Arquitectura:** `docs/ARCHITECTURE.md`
- **ADR:** `docs/architecture/decisions/ADR-002-layered-architecture-criteria.md`

---

## ⏱️ Tiempo Estimado Total

- Fase 0: 10 min
- Fase 1: 5 min
- Fase 2: 10 min
- Fase 3: 10 min
- Fase 4: 10 min
- Fase 5: 2 min
- Fase 6: 15 min
- Fase 7: 45 min ⚠️ (más laboriosa)
- Fase 8: 15 min
- Fase 9: 20 min
- Fase 10: 20 min
- Fase 11: 10 min

**TOTAL: ~2.5 horas**

---

## ✅ Estado Actual

**Última actualización:** 2025-11-25 18:00

- [ ] Fase 0: Preparación
- [ ] Fase 1: Crear estructura
- [ ] Fase 2: Mover controllers
- [ ] Fase 3: Mover DTOs
- [ ] Fase 4: Mover entities
- [ ] Fase 5: Limpiar domain/entities
- [ ] Fase 6: Deprecar services
- [ ] Fase 7: Actualizar imports
- [ ] Fase 8: Actualizar module
- [ ] Fase 9: Actualizar externos
- [ ] Fase 10: Validación
- [ ] Fase 11: Commit

**Próximo paso:** Ejecutar Fase 0
