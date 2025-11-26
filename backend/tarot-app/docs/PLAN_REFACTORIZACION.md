# Plan de Refactorización Arquitectural - Tarot Backend

**Fecha de creación:** 2025-11-26  
**Versión:** 2.0  
**Estado:** En progreso

---

## Resumen Ejecutivo

Este documento contiene el plan de refactorización para corregir violaciones de arquitectura y aplicar patrones de diseño consistentes en los módulos del backend Tarot, según los resultados de `validate-architecture.js` y los criterios definidos en `ARCHITECTURE.md`.

### Estado Actual (según validate-architecture.js)

**Módulos con capas (correctos):**

- ✅ `ai` - 13 archivos, 1938 líneas
- ✅ `cache` - 15 archivos, 2191 líneas (1 WARNING con TODO exception)
- ✅ `tarot/readings` - 28 archivos, 2605 líneas
- ⚠️ `tarotistas` - 50 archivos, 4840 líneas (5 ERRORS - domain importa infrastructure)

**Módulos complejos sin capas (necesitan refactorización):**

- ⚠️ `ai-usage` - 12 archivos, 1406 líneas
- ⚠️ `auth` - 16 archivos, 1387 líneas
- ⚠️ `scheduling` - 28 archivos, 1854 líneas
- ⚠️ `users` - 11 archivos, 1435 líneas

**Módulos flat (correctos):**

- ✅ Todos los demás módulos están por debajo de los umbrales

---

## Priorización de Tareas

### 🔴 Críticas (Bloqueantes)

1. **TASK-ARCH-001** - Corregir violaciones domain/infrastructure en `tarotistas`

### 🟡 Altas (Refactorización mayor)

2. **TASK-ARCH-002** - Aplicar capas a `auth`
3. **TASK-ARCH-003** - Aplicar capas a `scheduling`
4. **TASK-ARCH-004** - Aplicar capas a `users`
5. **TASK-ARCH-005** - Aplicar capas a `ai-usage`

### 🟢 Opcional (Mejora técnica)

6. **TASK-ARCH-006** - Resolver TODO exception en `cache`

---

## Metodología de Ejecución de Tareas

### Workflow PRESERVE-VERIFY-REFACTOR

Todas las tareas de refactorización deben seguir esta metodología para garantizar seguridad y cero regresiones:

#### Principios Fundamentales

1. **PRESERVE (Preservar):** Duplicar antes de modificar
2. **VERIFY (Verificar):** Validar que la duplicación funciona
3. **REFACTOR (Refactorizar):** Eliminar código antiguo solo después de verificar

#### Prohibiciones Estrictas

- ❌ **NO realizar cambios funcionales** durante refactorización
- ❌ **NO eliminar tests existentes** (solo moverlos/renombrarlos)
- ❌ **NO reducir coverage** (debe ser >= baseline)
- ❌ **NO cambiar contratos de APIs públicas**
- ❌ **NO hacer commits grandes** (máximo 3-5 archivos por commit)

#### Ciclo de Trabajo (Checkpoints cada 3-5 pasos)

```bash
# PASO 1: Preparación
git checkout -b feature/TASK-ARCH-XXX-description
node scripts/validate-architecture.js > before-validation.txt
npm run test:cov > before-coverage.txt

# PASO 2: Preservar (Duplicar)
# - Crear nueva estructura sin eliminar la antigua
# - Copiar código a nuevas ubicaciones
# - Mantener ambas versiones funcionando

# CHECKPOINT 1: Validar Duplicación
npm run build              # Debe pasar
npm run test              # Todos los tests deben pasar
npm run lint              # Debe pasar

# PASO 3: Verify (Conectar)
# - Actualizar imports para usar nueva estructura
# - Validar que nada se rompe

# CHECKPOINT 2: Validar Conexión
npm run build
npm run test
npm run test:e2e          # Si aplica

# PASO 4: Refactor (Eliminar)
# - Eliminar código antiguo SOLO si checkpoints pasaron
# - Limpiar imports no usados
# - Eliminar carpetas vacías

# CHECKPOINT 3: Validación Final
node scripts/validate-architecture.js
npm run build
npm run test
npm run test:cov > after-coverage.txt
diff before-coverage.txt after-coverage.txt  # Coverage >= baseline

# PASO 5: Commit Incremental
git add .
git commit -m "refactor(arch): TASK-ARCH-XXX - descripción específica del paso"
```

#### Estructura de Commits

Commits deben ser **incrementales y atómicos**:

```bash
# Ejemplo para TASK-ARCH-009:
git commit -m "refactor(arch): TASK-ARCH-009 - crear carpeta entities/ en tarotistas"
git commit -m "refactor(arch): TASK-ARCH-009 - mover 5 entidades a entities/"
git commit -m "refactor(arch): TASK-ARCH-009 - actualizar imports en domain/"
git commit -m "refactor(arch): TASK-ARCH-009 - actualizar imports en infrastructure/"
git commit -m "refactor(arch): TASK-ARCH-009 - actualizar imports en application/"
git commit -m "refactor(arch): TASK-ARCH-009 - eliminar infrastructure/entities/"
git commit -m "refactor(arch): TASK-ARCH-009 - validación final y documentación"
```

#### Validación Exhaustiva

Antes de abrir PR, ejecutar **todas** las validaciones:

```bash
# 1. Arquitectura
node scripts/validate-architecture.js
# Salida esperada: 0 ERRORS/WARNINGS en módulo refactorizado

# 2. Build
npm run build
# Salida esperada: Build exitoso sin errores

# 3. Tests unitarios
npm run test
# Salida esperada: 100% tests pasando

# 4. Coverage
npm run test:cov
# Salida esperada: Coverage >= baseline (ver baseline-coverage.txt)

# 5. Linter
npm run lint
# Salida esperada: 0 errores, 0 warnings

# 6. Formatter
npm run format:check
# Salida esperada: Todo formateado correctamente

# 7. E2E (si aplica)
npm run test:e2e
# Salida esperada: Endpoints del módulo funcionando

# 8. Dependencias circulares
npm run check:circular
# Salida esperada: 0 dependencias circulares detectadas
```

#### Checklist de PR (Copiar/Pegar)

```markdown
## Checklist de Validación

### Arquitectura

- [ ] `validate-architecture.js` pasa sin ERRORS/WARNINGS en módulo refactorizado
- [ ] No hay dependencias circulares

### Build y Tests

- [ ] `npm run build` exitoso
- [ ] `npm run test` 100% pasando
- [ ] `npm run test:cov` >= baseline
- [ ] `npm run test:e2e` pasando (si aplica)

### Calidad de Código

- [ ] `npm run lint` sin errores
- [ ] `npm run format:check` pasando
- [ ] Código sigue guías de estilo del proyecto

### Funcionalidad

- [ ] Comportamiento funcional sin cambios
- [ ] Contratos de API mantenidos
- [ ] Tests no eliminados (solo movidos/renombrados)

### Documentación

- [ ] README del módulo actualizado (si aplica)
- [ ] CHANGELOG actualizado
- [ ] Commits siguen Conventional Commits
- [ ] Branch sigue naming convention: `feature/TASK-ARCH-XXX-description`
```

#### Ejemplo Completo: TASK-ARCH-009

```bash
# 1. Preparación
git checkout -b feature/TASK-ARCH-009-move-tarotistas-entities
node scripts/validate-architecture.js > before-validation.txt
npm run test:cov > before-coverage.txt

# 2. PRESERVE - Crear nueva estructura
mkdir -p src/modules/tarotistas/entities
git add src/modules/tarotistas/entities
git commit -m "refactor(arch): TASK-ARCH-009 - crear carpeta entities/"

# 3. PRESERVE - Copiar entidades (mantener originales)
cp src/modules/tarotistas/infrastructure/entities/*.entity.ts \
   src/modules/tarotistas/entities/

# Verificar que archivos existen en AMBAS ubicaciones
ls src/modules/tarotistas/infrastructure/entities/
ls src/modules/tarotistas/entities/

git add src/modules/tarotistas/entities/
git commit -m "refactor(arch): TASK-ARCH-009 - copiar 5 entidades a entities/"

# 4. CHECKPOINT 1
npm run build && npm run test

# 5. VERIFY - Actualizar imports en domain/
# Editar manualmente:
# - domain/interfaces/tarotista-repository.interface.ts
# - domain/interfaces/metrics-repository.interface.ts
# Cambiar: from '../../infrastructure/entities/'
# Por: from '../../entities/'

git add src/modules/tarotistas/domain/
git commit -m "refactor(arch): TASK-ARCH-009 - actualizar imports en domain/"

# 6. CHECKPOINT 2
npm run build && npm run test

# 7. VERIFY - Actualizar imports en infrastructure/
# Editar manualmente repositorios
# Cambiar: from '../entities/'
# Por: from '../../entities/'

git add src/modules/tarotistas/infrastructure/
git commit -m "refactor(arch): TASK-ARCH-009 - actualizar imports en infrastructure/"

# 8. CHECKPOINT 3
npm run build && npm run test

# 9. VERIFY - Actualizar imports en application/
git add src/modules/tarotistas/application/
git commit -m "refactor(arch): TASK-ARCH-009 - actualizar imports en application/"

# 10. CHECKPOINT 4
npm run build && npm run test && npm run test:e2e

# 11. REFACTOR - Eliminar código antiguo
rm -rf src/modules/tarotistas/infrastructure/entities/
git add src/modules/tarotistas/infrastructure/
git commit -m "refactor(arch): TASK-ARCH-009 - eliminar infrastructure/entities/"

# 12. VALIDACIÓN FINAL
node scripts/validate-architecture.js
npm run build
npm run test
npm run test:cov > after-coverage.txt
npm run lint
npm run format:check

# Comparar coverage
diff before-coverage.txt after-coverage.txt

# 13. Commit final de documentación
git commit -m "refactor(arch): TASK-ARCH-009 - validación final y documentación"

# 14. Push y PR
git push origin feature/TASK-ARCH-009-move-tarotistas-entities
# Abrir PR con checklist completo
```

---

## TASK-ARCH-009: Corregir Violaciones Domain/Infrastructure en Tarotistas

**Prioridad:** 🟡 Alta (Mejora arquitectural)  
**Duración estimada:** 2-4 horas  
**Complejidad:** Baja  
**Dependencias:** Ninguna

### Objetivo

Corregir las 5 violaciones de arquitectura donde la capa `domain` importa entidades desde `infrastructure/entities/`, aplicando el patrón establecido en ADR-003 y seguido por el módulo `readings`.

### Problemas Detectados

```
⚠️  WARNING: Domain importing from infrastructure/entities/ (not documented)
   File: domain\interfaces\metrics-repository.interface.ts:1
   Line: import { TarotistaRevenueMetrics } from '../../infrastructure/entities/...'
   Per ADR-003: Entities should be at module root (entities/) for sharing

⚠️  WARNING: Domain importing from infrastructure/entities/ (not documented)
   File: domain\interfaces\tarotista-repository.interface.ts:1-7
   Lines: Imports de Tarotista, TarotistaConfig, TarotistaCardMeaning, TarotistaApplication
   Per ADR-003: Entities should be at module root (entities/) for sharing
```

### Análisis

El módulo `tarotistas` tiene estructura layered correcta, pero las entidades TypeORM están ubicadas en `infrastructure/entities/` en lugar de estar en la raíz del módulo (`entities/`).

**Según ADR-003 (Enfoque Pragmático):**

- ✅ Las interfaces de repositorio **pueden usar entidades TypeORM directamente** (no se necesitan entidades de dominio separadas)
- ✅ Las entidades deben estar en **`entities/` en la raíz del módulo** para ser compartidas entre capas
- ❌ Domain NO debe importar de `infrastructure/`

**Patrón correcto** (como en `readings`):

```
tarotistas/
├── entities/                           ← Ubicación correcta
│   ├── tarotista.entity.ts
│   ├── tarotista-config.entity.ts
│   ├── tarotista-card-meaning.entity.ts
│   ├── tarotista-application.entity.ts
│   └── tarotista-revenue-metrics.entity.ts
├── domain/
│   └── interfaces/
│       └── tarotista-repository.interface.ts  (importa de ../../entities/)
└── infrastructure/
    └── repositories/
        └── typeorm-tarotista.repository.ts    (importa de ../../entities/)
```

### Solución Propuesta

**Mover entidades TypeORM de `infrastructure/entities/` a `entities/` en la raíz del módulo:**

1. Crear carpeta `tarotistas/entities/` (si no existe)
2. Mover todas las entidades TypeORM desde `infrastructure/entities/` a `entities/`
3. Actualizar imports en:
   - `domain/interfaces/*.ts`
   - `infrastructure/repositories/*.ts`
   - `application/services/*.ts`
   - `tarotistas.module.ts`
4. Eliminar carpeta vacía `infrastructure/entities/`

**NO se necesita:**

- ❌ Crear entidades de dominio puras separadas
- ❌ Crear mappers domain ↔ infrastructure
- ❌ Duplicar tipos o interfaces

### Archivos Afectados

**A mover:**

- `infrastructure/entities/tarotista.entity.ts` → `entities/tarotista.entity.ts`
- `infrastructure/entities/tarotista-config.entity.ts` → `entities/tarotista-config.entity.ts`
- `infrastructure/entities/tarotista-card-meaning.entity.ts` → `entities/tarotista-card-meaning.entity.ts`
- `infrastructure/entities/tarotista-application.entity.ts` → `entities/tarotista-application.entity.ts`
- `infrastructure/entities/tarotista-revenue-metrics.entity.ts` → `entities/tarotista-revenue-metrics.entity.ts`

**A actualizar imports:**

- `domain/interfaces/tarotista-repository.interface.ts`
- `domain/interfaces/metrics-repository.interface.ts`
- `infrastructure/repositories/typeorm-tarotista.repository.ts`
- `infrastructure/repositories/typeorm-metrics.repository.ts`
- `application/services/*.ts` (todos los servicios que usen entidades)
- `infrastructure/controllers/*.ts` (controllers que retornen entidades)
- `tarotistas.module.ts` (TypeOrmModule.forFeature)

### Pasos de Implementación

1. Crear carpeta `src/modules/tarotistas/entities/`
2. Mover 5 archivos de entidades desde `infrastructure/entities/` a `entities/`
3. Buscar y reemplazar imports:
   - `from '../../infrastructure/entities/` → `from '../../entities/`
   - `from '../entities/` → `from '../../entities/` (en infrastructure/)
4. Ejecutar `npm run build` para verificar que no hay errores de importación
5. Ejecutar `node scripts/validate-architecture.js` para verificar que WARNINGS desaparecen
6. Ejecutar tests para asegurar que nada se rompió

### Criterios de Aceptación

- [ ] Carpeta `entities/` creada en raíz del módulo
- [ ] 5 entidades movidas a `entities/`
- [ ] Todos los imports actualizados correctamente
- [ ] Carpeta `infrastructure/entities/` eliminada
- [ ] `validate-architecture.js` pasa sin WARNINGS en tarotistas
- [ ] Build exitoso (`npm run build`)
- [ ] Tests pasando (`npm test`)
- [ ] Funcionalidad del marketplace verificada (crear/listar tarotistas)

### Métricas de Éxito

- **Antes:** 5 WARNINGS de arquitectura
- **Después:** 0 WARNINGS
- **Estructura:** Alineada con ADR-003 y módulo `readings`
- **Coverage:** >= actual
- **Tests:** 100% pasando

### Referencias

- [ADR-003: Repository Pattern](../architecture/decisions/ADR-003-repository-pattern.md) - Enfoque pragmático
- Módulo `readings` - Ejemplo de estructura correcta
- Script `validate-architecture.js` - Validación automatizada

---

## TASK-ARCH-010: Aplicar Arquitectura Layered a Módulo Auth

**Prioridad:** 🟡 Alta  
**Duración estimada:** 3-5 días  
**Complejidad:** Alta  
**Dependencias:** TASK-ARCH-009 completada

### Objetivo

Refactorizar el módulo `auth` aplicando arquitectura layered (domain/application/infrastructure) debido a que supera los umbrales de complejidad (16 archivos, 1387 líneas).

### Análisis

**Estado actual:**

- 16 archivos, 1387 líneas
- Estructura flat con subcarpetas: `dto/`, `entities/`, `guards/`, `strategies/`
- Servicios: `auth.service.ts`, `password-reset.service.ts`, `refresh-token.service.ts`, `password-reset-cleanup.service.ts`
- Responsabilidades: autenticación JWT, refresh tokens, reset de contraseñas, limpieza de tokens expirados

### Justificación

El módulo `auth` es crítico para seguridad y tiene lógica compleja de negocio que justifica separación en capas:

- Validación de credenciales
- Generación y validación de tokens
- Estrategias de autenticación (JWT, refresh)
- Gestión de ciclo de vida de tokens
- Limpieza programada

### Estructura Propuesta

```
auth/
├── domain/
│   └── interfaces/
│       ├── auth-repository.interface.ts
│       ├── token-repository.interface.ts
│       └── password-reset-repository.interface.ts
├── application/
│   ├── services/
│   │   ├── auth-orchestrator.service.ts
│   │   ├── token-validator.service.ts
│   │   └── password-reset-cleanup.service.ts
│   ├── use-cases/
│   │   ├── login.use-case.ts
│   │   ├── register.use-case.ts
│   │   ├── refresh-token.use-case.ts
│   │   └── reset-password.use-case.ts
│   └── dto/
└── infrastructure/
    ├── repositories/
    │   ├── typeorm-refresh-token.repository.ts
    │   └── typeorm-password-reset.repository.ts
    ├── controllers/
    │   └── auth.controller.ts
    ├── guards/
    │   ├── jwt-auth.guard.ts
    │   ├── local-auth.guard.ts
    │   └── refresh-jwt.guard.ts
    ├── strategies/
    │   ├── jwt.strategy.ts
    │   ├── local.strategy.ts
    │   └── refresh-jwt.strategy.ts
    └── entities/
        ├── refresh-token.entity.ts
        └── password-reset-token.entity.ts
```

### Criterios de Aceptación

- [ ] Estructura layered completa creada
- [ ] Repository pattern implementado
- [ ] Use cases extraídos de services monolíticos
- [ ] Guards y strategies movidos a infrastructure
- [ ] `validate-architecture.js` pasa sin WARNINGS en auth
- [ ] Build exitoso
- [ ] Tests pasando (>= baseline coverage)
- [ ] Autenticación y refresh funcionando

### Métricas de Éxito

- **Antes:** 16 archivos flat, 1387 líneas
- **Después:** ~25 archivos en capas, líneas distribuidas
- **Archivo más grande:** < 200 líneas
- **Coverage:** >= actual

---

## TASK-ARCH-011: Aplicar Arquitectura Layered a Módulo Scheduling

**Prioridad:** 🟡 Alta  
**Duración estimada:** 4-6 días  
**Complejidad:** Alta  
**Dependencias:** Ninguna (puede hacerse en paralelo)

### Objetivo

Refactorizar el módulo `scheduling` aplicando arquitectura layered debido a su alta complejidad (28 archivos, 1854 líneas).

### Análisis

**Estado actual:**

- 28 archivos, 1854 líneas (módulo más grande sin capas)
- Subcarpetas: `controllers/`, `dto/`, `entities/`, `enums/`, `helpers/`, `interfaces/`, `services/`, `templates/`
- Servicios: 3 services con lógica de programación de citas
- Responsabilidades: gestión de disponibilidad, reservas, notificaciones, citas con tarotistas

### Justificación

El módulo `scheduling` es crítico para el marketplace y tiene la mayor complejidad de todos los módulos flat:

- Gestión de disponibilidad de tarotistas
- Reservas y confirmaciones
- Sistema de notificaciones
- Integración con email y calendar
- Validaciones complejas de horarios

### Estructura Propuesta

```
scheduling/
├── domain/
│   ├── entities/
│   │   └── appointment.ts (domain pure)
│   ├── interfaces/
│   │   ├── appointment-repository.interface.ts
│   │   └── availability-repository.interface.ts
│   └── enums/
│       └── appointment-status.enum.ts
├── application/
│   ├── services/
│   │   ├── scheduling-orchestrator.service.ts
│   │   ├── availability-validator.service.ts
│   │   └── notification-sender.service.ts
│   ├── use-cases/
│   │   ├── create-appointment.use-case.ts
│   │   ├── confirm-appointment.use-case.ts
│   │   ├── cancel-appointment.use-case.ts
│   │   └── check-availability.use-case.ts
│   ├── dto/
│   └── helpers/
└── infrastructure/
    ├── repositories/
    │   ├── typeorm-appointment.repository.ts
    │   └── typeorm-availability.repository.ts
    ├── controllers/
    ├── entities/
    └── templates/
```

### Criterios de Aceptación

- [ ] Estructura layered completa creada
- [ ] Repository pattern implementado
- [ ] Use cases extraídos (crear, confirmar, cancelar citas)
- [ ] Validadores de disponibilidad separados
- [ ] `validate-architecture.js` pasa sin WARNINGS en scheduling
- [ ] Build exitoso
- [ ] Tests pasando (>= baseline coverage)
- [ ] Sistema de reservas funcionando

### Métricas de Éxito

- **Antes:** 28 archivos flat, 1854 líneas
- **Después:** ~35 archivos en capas, líneas distribuidas
- **Archivo más grande:** < 250 líneas
- **Coverage:** >= actual

---

## TASK-ARCH-012: Aplicar Arquitectura Layered a Módulo Users

**Prioridad:** 🟡 Alta  
**Duración estimada:** 2-4 días  
**Complejidad:** Media  
**Dependencias:** TASK-ARCH-010 completada (integración con auth)

### Objetivo

Refactorizar el módulo `users` aplicando arquitectura layered (11 archivos, 1435 líneas).

### Análisis

**Estado actual:**

- 11 archivos, 1435 líneas
- Estructura flat: `dto/`, `entities/`, `users.service.ts`, `users.controller.ts`
- Responsabilidades: gestión de usuarios, perfiles, roles, preferencias

### Justificación

El módulo `users` es fundamental y tiene lógica de negocio que crece constantemente:

- Gestión de perfiles de usuario
- Sistema de roles y permisos
- Preferencias personalizadas
- Integración con auth, tarotistas, readings
- Validaciones de negocio

### Estructura Propuesta

```
users/
├── domain/
│   ├── entities/
│   │   └── user.ts (domain pure)
│   └── interfaces/
│       └── user-repository.interface.ts
├── application/
│   ├── services/
│   │   ├── users-orchestrator.service.ts
│   │   └── user-validator.service.ts
│   ├── use-cases/
│   │   ├── create-user.use-case.ts
│   │   ├── update-profile.use-case.ts
│   │   ├── update-preferences.use-case.ts
│   │   └── assign-role.use-case.ts
│   └── dto/
└── infrastructure/
    ├── repositories/
    │   └── typeorm-user.repository.ts
    ├── controllers/
    │   └── users.controller.ts
    └── entities/
        └── user.entity.ts
```

### Criterios de Aceptación

- [ ] Estructura layered completa creada
- [ ] Repository pattern implementado
- [ ] Use cases extraídos
- [ ] Validadores separados
- [ ] `validate-architecture.js` pasa sin WARNINGS en users
- [ ] Build exitoso
- [ ] Tests pasando (>= baseline coverage)
- [ ] Gestión de usuarios funcionando
- [ ] Integración con auth validada

### Métricas de Éxito

- **Antes:** 11 archivos flat, 1435 líneas
- **Después:** ~18 archivos en capas, líneas distribuidas
- **Archivo más grande:** < 200 líneas
- **Coverage:** >= actual

---

## TASK-ARCH-013: Aplicar Arquitectura Layered a Módulo AI-Usage

**Prioridad:** 🟡 Media  
**Duración estimada:** 2-3 días  
**Complejidad:** Media  
**Dependencias:** Ninguna

### Objetivo

Refactorizar el módulo `ai-usage` aplicando arquitectura layered (12 archivos, 1406 líneas).

### Análisis

**Estado actual:**

- 12 archivos, 1406 líneas
- Estructura flat: `constants/`, `dto/`, `entities/`
- Servicios: `ai-usage.service.ts`, `ai-quota.service.ts`, `ai-provider-cost.service.ts`
- Responsabilidades: tracking de uso de IA, quotas, costos, límites por plan

### Justificación

El módulo `ai-usage` gestiona aspectos críticos de costos y límites del negocio:

- Tracking de consumo de tokens
- Cálculo de costos por provider
- Gestión de quotas por plan de usuario
- Validación de límites antes de llamadas a IA
- Reporting de uso

### Estructura Propuesta

```
ai-usage/
├── domain/
│   ├── entities/
│   │   └── ai-usage.ts (domain pure)
│   └── interfaces/
│       ├── ai-usage-repository.interface.ts
│       └── quota-validator.interface.ts
├── application/
│   ├── services/
│   │   ├── ai-usage-orchestrator.service.ts
│   │   ├── quota-validator.service.ts
│   │   └── cost-calculator.service.ts
│   ├── use-cases/
│   │   ├── track-ai-usage.use-case.ts
│   │   ├── check-quota.use-case.ts
│   │   └── calculate-costs.use-case.ts
│   ├── dto/
│   └── constants/
└── infrastructure/
    ├── repositories/
    │   └── typeorm-ai-usage.repository.ts
    ├── controllers/
    │   ├── ai-usage.controller.ts
    │   └── ai-quota.controller.ts
    ├── guards/
    │   └── ai-quota.guard.ts
    └── entities/
```

### Criterios de Aceptación

- [ ] Estructura layered completa creada
- [ ] Repository pattern implementado
- [ ] Use cases extraídos
- [ ] Validadores de quota separados
- [ ] Guards movidos a infrastructure
- [ ] `validate-architecture.js` pasa sin WARNINGS en ai-usage
- [ ] Build exitoso
- [ ] Tests pasando (>= baseline coverage)
- [ ] Sistema de quotas funcionando

### Métricas de Éxito

- **Antes:** 12 archivos flat, 1406 líneas
- **Después:** ~20 archivos en capas, líneas distribuidas
- **Archivo más grande:** < 200 líneas
- **Coverage:** >= actual

---

## TASK-ARCH-014: Mover Entidad de Cache a Raíz del Módulo

**Prioridad:** 🟢 Baja (Mejora técnica)  
**Duración estimada:** 1-2 horas  
**Complejidad:** Baja  
**Dependencias:** Ninguna

### Objetivo

Eliminar la violación documentada con TODO en el módulo `cache` moviendo la entidad TypeORM desde `infrastructure/entities/` a la raíz del módulo, alineándolo con ADR-003.

### Problema Detectado

```
⚠️  WARNING: Domain importing TypeORM entity from infrastructure/entities/ (TODO exception)
   File: domain\interfaces\cache-repository.interface.ts:5
   Line: import { CachedInterpretation } from '../../infrastructure/entities/cached-interpretation.entity';
   Note: This is documented with TODO for future refactoring
   Recommendation: Move entity to module root (entities/) like in 'readings' module
```

### Análisis

El módulo `cache` tiene estructura layered correcta pero la entidad `CachedInterpretation` está en `infrastructure/entities/` en lugar de la raíz del módulo.

### Solución Propuesta

**Mover entidad TypeORM siguiendo el mismo patrón que TASK-ARCH-009:**

1. Crear carpeta `cache/entities/`
2. Mover `CachedInterpretation` desde `infrastructure/entities/` a `entities/`
3. Actualizar imports en:
   - `domain/interfaces/cache-repository.interface.ts`
   - `infrastructure/repositories/in-memory-cache.repository.ts`
   - `cache.module.ts`
4. Remover comentario TODO
5. Eliminar carpeta `infrastructure/entities/`

**NO se necesita:**

- ❌ Crear entidad de dominio separada
- ❌ Crear mappers
- ❌ Cambiar la lógica del repositorio

### Archivos Afectados

**A mover:**

- `infrastructure/entities/cached-interpretation.entity.ts` → `entities/cached-interpretation.entity.ts`

**A actualizar imports:**

- `domain/interfaces/cache-repository.interface.ts`
- `infrastructure/repositories/in-memory-cache.repository.ts`
- `cache.module.ts`

### Criterios de Aceptación

- [ ] Carpeta `entities/` creada en raíz del módulo cache
- [ ] `CachedInterpretation` movida a `entities/`
- [ ] Imports actualizados
- [ ] Comentario TODO removido
- [ ] `validate-architecture.js` pasa sin WARNINGS en cache
- [ ] Build exitoso
- [ ] Tests pasando
- [ ] Sistema de caché funcionando

### Métricas de Éxito

- **Antes:** 1 WARNING con TODO exception
- **Después:** 0 WARNINGS
- **Impacto:** Arquitectura 100% limpia en cache
- **Alineación:** Consistente con ADR-003 y módulo `readings`

---

## Orden de Ejecución Recomendado

### Fase 1: Corrección Crítica (Sprint 1 - 1-2 días)

1. **TASK-ARCH-009** - Corregir tarotistas (bloqueante CI)

### Fase 2: Módulos Core (Sprint 2 - 3-5 días)

2. **TASK-ARCH-010** - Refactorizar auth (crítico para seguridad)
3. **TASK-ARCH-012** - Refactorizar users (dependencia de auth)

### Fase 3: Módulos Business (Sprint 3 - 4-6 días)

4. **TASK-ARCH-011** - Refactorizar scheduling (marketplace)
5. **TASK-ARCH-013** - Refactorizar ai-usage (costos)

### Fase 4: Limpieza (Sprint 4 - medio día)

6. **TASK-ARCH-014** - Resolver TODO en cache (opcional)

---

## Validación Continua

### Pre-requisitos para cada Task

```bash
# 1. Crear branch
git checkout -b feature/TASK-ARCH-XXX-description

# 2. Validar estado actual
node scripts/validate-architecture.js

# 3. Obtener baseline de coverage
npm run test:cov
```

### Post-requisitos para cada Task

```bash
# 1. Validar arquitectura
node scripts/validate-architecture.js
# Debe pasar sin ERRORS/WARNINGS en el módulo refactorizado

# 2. Build
npm run build
# Debe pasar sin errores

# 3. Tests
npm run test
# Todos los tests deben pasar

# 4. Coverage
npm run test:cov
# Coverage >= baseline

# 5. Linter
npm run lint
# Debe pasar sin errores

# 6. E2E (si aplica)
npm run test:e2e
# Endpoints del módulo deben funcionar
```

### Checklist de PR

- [ ] `validate-architecture.js` pasa
- [ ] Build exitoso
- [ ] Tests pasando (100%)
- [ ] Coverage >= baseline
- [ ] Linter pasa
- [ ] E2E funcionando (si aplica)
- [ ] Documentación actualizada
- [ ] No hay dependencias circulares
- [ ] Commit messages siguen Conventional Commits

---

## Métricas Globales Esperadas

### Estado Actual

- **Módulos con capas:** 4/32 (12.5%)
- **Violaciones de arquitectura:** 5 ERRORS + 4 WARNINGS
- **Complejidad promedio:** Variable (34-4840 líneas por módulo)

### Estado Final (después de todas las tasks)

- **Módulos con capas:** 9/32 (28%)
- **Violaciones de arquitectura:** 0 ERRORS + 0 WARNINGS
- **Complejidad máxima por archivo:** <250 líneas
- **Coverage total:** >= actual (mantenido o mejorado)
- **Build time:** Similar o mejor
- **Test time:** Similar o mejor

---

## Riesgos y Mitigaciones

### Riesgo 1: Breaking Changes en APIs

**Probabilidad:** Media  
**Impacto:** Alto  
**Mitigación:**

- Tests E2E antes/después de refactorización
- Validar contratos de API no cambien
- Despliegue gradual por módulo

### Riesgo 2: Regresión en Funcionalidad

**Probabilidad:** Media  
**Impacto:** Alto  
**Mitigación:**

- Coverage >= baseline obligatorio
- Tests de integración completos
- Validación manual de flujos críticos

### Riesgo 3: Dependencias Circulares

**Probabilidad:** Baja  
**Impacto:** Alto  
**Mitigación:**

- Validación con madge en cada PR
- Revisar imports en code review
- Usar interfaces para desacoplar

### Riesgo 4: Incremento de Complejidad Percibida

**Probabilidad:** Media  
**Impacto:** Medio  
**Mitigación:**

- Documentar cada capa claramente
- README en cada módulo refactorizado
- Onboarding para el equipo

---

## Referencias

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Guía arquitectural
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guía de contribución
- [ADR-001](./architecture/decisions/ADR-001-adopt-feature-based-modules.md) - Feature-based modules
- [ADR-002](./architecture/decisions/ADR-002-layered-architecture-criteria.md) - Criterio de capas
- [ADR-003](./architecture/decisions/ADR-003-repository-pattern.md) - Repository pattern

---

**Última actualización:** 2025-11-26  
**Responsable:** Equipo de desarrollo  
**Próxima revisión:** Después de completar Fase 1
