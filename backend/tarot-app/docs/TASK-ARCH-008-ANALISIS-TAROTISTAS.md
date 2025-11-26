# TASK-ARCH-008: Análisis del Módulo Tarotistas

**Fecha:** 2025-11-25  
**Estado:** En Progreso  
**Responsable:** Refactorización Arquitectural

## Baseline Documentado

### Coverage Actual (Baseline)

```
Statements   : 79.69% ( 5235/6569 )
Branches     : 59.85% ( 990/1654 )
Functions    : 74.72% ( 736/985 )
Lines        : 79.32% ( 4899/6176 )
```

**⚠️ El coverage NO puede bajar de estos valores**

### Estructura Actual del Módulo Tarotistas

**Total:** 31 archivos TypeScript, 3768 líneas de código

#### Controllers (4 archivos, 381 líneas)

- `metrics.controller.ts`: 49 líneas
- `reports.controller.ts`: 35 líneas
- `tarotistas-admin.controller.ts`: 219 líneas ⚠️ (muy grande)
- `tarotistas-public.controller.ts`: 78 líneas

#### DTOs (13 archivos, 919 líneas)

- `apply-to-be-tarotista.dto.ts`: 50 líneas
- `approve-application.dto.ts`: 15 líneas
- `create-tarotista.dto.ts`: 76 líneas
- `get-public-tarotistas-filter.dto.ts`: 75 líneas
- `get-tarotistas-filter.dto.ts`: 94 líneas
- `index.ts`: 12 líneas
- `metrics-query.dto.ts`: 218 líneas ⚠️ (muy grande)
- `reject-application.dto.ts`: 13 líneas
- `report-export.dto.ts`: 123 líneas
- `revenue-calculation.dto.ts`: 79 líneas
- `set-custom-meaning.dto.ts`: 88 líneas
- `update-tarotista-config.dto.ts`: 70 líneas
- `update-tarotista.dto.ts`: 6 líneas

#### Entities (7 archivos, 1021 líneas)

- `tarotista-application.entity.ts`: 130 líneas
- `tarotista-card-meaning.entity.ts`: 97 líneas
- `tarotista-config.entity.ts`: 122 líneas
- `tarotista-revenue-metrics.entity.ts`: 145 líneas
- `tarotista-review.entity.ts`: 129 líneas
- `tarotista.entity.ts`: 251 líneas ⚠️ (muy grande)
- `user-tarotista-subscription.entity.ts`: 147 líneas

#### Services (5 archivos, 1287 líneas)

- `metrics.service.ts`: 272 líneas ⚠️ (grande)
- `reports.service.ts`: 276 líneas ⚠️ (grande)
- `revenue-calculation.service.ts`: 146 líneas
- `tarotistas-admin.service.ts`: 500 líneas 🚨 (CRÍTICO - muy grande)
- `tarotistas-public.service.ts`: 93 líneas

#### Raíz del módulo (2 archivos, 160 líneas)

- `tarotistas.module.ts`: 59 líneas
- `tarotistas.service.ts`: 101 líneas

## Análisis de Complejidad

### Archivos Críticos que Requieren Atención

1. **`tarotistas-admin.service.ts`** (500 líneas) - Candidato principal para use-cases
2. **`reports.service.ts`** (276 líneas) - Puede extraerse
3. **`metrics.service.ts`** (272 líneas) - Puede extraerse
4. **`tarotista.entity.ts`** (251 líneas) - Entidad muy grande
5. **`tarotistas-admin.controller.ts`** (219 líneas) - Controller muy grande
6. **`metrics-query.dto.ts`** (218 líneas) - DTO muy grande

### Dependencias Externas Identificadas

- **AIModule** (PromptBuilderService) - CRÍTICO para marketplace
- UsersModule
- AuthModule
- TarotModule (Cards, Spreads, Readings)

## Estructura Propuesta (Layered)

```
src/modules/tarotistas/
├── domain/
│   ├── entities/
│   │   └── tarotista.entity.ts (entidad de dominio pura)
│   └── interfaces/
│       ├── tarotista-repository.interface.ts
│       ├── metrics-repository.interface.ts
│       └── reports-repository.interface.ts
├── application/
│   ├── use-cases/
│   │   ├── create-tarotista.use-case.ts
│   │   ├── approve-application.use-case.ts
│   │   ├── update-config.use-case.ts
│   │   ├── set-custom-meaning.use-case.ts
│   │   ├── calculate-metrics.use-case.ts
│   │   └── generate-report.use-case.ts
│   ├── services/
│   │   ├── tarotistas-orchestrator.service.ts (coordina use-cases)
│   │   ├── revenue-calculation.service.ts (lógica de negocio)
│   │   └── tarotista-validator.service.ts (validaciones)
│   └── dto/
│       └── (13 archivos DTOs - sin cambios)
├── infrastructure/
│   ├── repositories/
│   │   ├── typeorm-tarotista.repository.ts
│   │   ├── typeorm-metrics.repository.ts
│   │   └── typeorm-reports.repository.ts
│   ├── controllers/
│   │   ├── tarotistas-admin.controller.ts
│   │   ├── tarotistas-public.controller.ts
│   │   ├── metrics.controller.ts
│   │   └── reports.controller.ts
│   └── entities/
│       ├── tarotista.entity.ts (TypeORM entity)
│       ├── tarotista-config.entity.ts
│       ├── tarotista-card-meaning.entity.ts
│       ├── tarotista-application.entity.ts
│       ├── tarotista-review.entity.ts
│       ├── tarotista-revenue-metrics.entity.ts
│       └── user-tarotista-subscription.entity.ts
└── tarotistas.module.ts
```

## Plan de Refactorización

### Fase 1: PRESERVE - Crear Estructura (Sin eliminar código antiguo)

**Paso 1:** Crear estructura de carpetas

```bash
mkdir -p src/modules/tarotistas/domain/entities
mkdir -p src/modules/tarotistas/domain/interfaces
mkdir -p src/modules/tarotistas/application/use-cases
mkdir -p src/modules/tarotistas/application/services
mkdir -p src/modules/tarotistas/application/dto
mkdir -p src/modules/tarotistas/infrastructure/repositories
mkdir -p src/modules/tarotistas/infrastructure/controllers
mkdir -p src/modules/tarotistas/infrastructure/entities
```

**Paso 2:** Crear interfaces de repositorios (domain/interfaces)

- `ITarotistaRepository`
- `IMetricsRepository`
- `IReportsRepository`

**Paso 3:** Implementar repositorios (infrastructure/repositories)

- `TypeOrmTarotistaRepository`
- `TypeOrmMetricsRepository`
- `TypeOrmReportsRepository`

**Paso 4:** Copiar entities a infrastructure/entities (COPIAR, no mover)

**Paso 5:** Copiar DTOs a application/dto (COPIAR, no mover)

**Paso 6:** Copiar controllers a infrastructure/controllers (COPIAR, no mover)

**Paso 7:** Extraer use-cases desde `tarotistas-admin.service.ts`

- Identificar métodos que representan casos de uso
- Crear use-case por cada operación principal
- COPIAR lógica (no eliminar del service original aún)

**Paso 8:** Crear services de aplicación

- `TarotistasOrchestratorService` (orquesta use-cases)
- `TarotistaValidatorService` (validaciones)
- Mantener `RevenueCalculationService` (ya es específico)

### Fase 2: VERIFY - Validar Sin Eliminar Código Antiguo

**Paso 9:** Actualizar `tarotistas.module.ts`

- Agregar providers para repositorios
- Agregar providers para use-cases
- Agregar providers para nuevos services
- MANTENER providers antiguos (convivencia temporal)

**Paso 10:** Actualizar imports en controllers copiados

- Cambiar a usar nuevos use-cases/services
- Validar que compilan

**Paso 11:** Ejecutar validación completa

```bash
npm run build
npm test
npm run test:cov
```

**Checkpoint:** Coverage >= baseline

### Fase 3: REFACTOR - Eliminar Código Antiguo

**Paso 12:** Eliminar archivos antiguos (solo después de validación exitosa)

- Mover `controllers/*.ts` a deprecated/
- Mover `dto/*.ts` a deprecated/
- Mover `entities/*.ts` a deprecated/
- Mover `services/*.ts` a deprecated/

**Paso 13:** Actualizar `tarotistas.module.ts` final

- Eliminar providers antiguos
- Solo usar nuevos providers

**Paso 14:** Validación final

```bash
rm -rf dist/ node_modules/.cache
npm run build
npm run lint
npm test
npm run test:cov
npm run test:e2e
```

## Casos de Uso Identificados

### Desde `tarotistas-admin.service.ts` (500 líneas)

1. **CreateTarotistaUseCase**

   - Método: `create()`
   - Responsabilidad: Crear nuevo tarotista
   - Líneas estimadas: ~50

2. **ApproveApplicationUseCase**

   - Método: `approveApplication()`
   - Responsabilidad: Aprobar solicitud de tarotista
   - Líneas estimadas: ~60

3. **RejectApplicationUseCase**

   - Método: `rejectApplication()`
   - Responsabilidad: Rechazar solicitud
   - Líneas estimadas: ~40

4. **UpdateConfigUseCase**

   - Método: `updateConfig()`
   - Responsabilidad: Actualizar configuración
   - Líneas estimadas: ~40

5. **SetCustomMeaningUseCase**

   - Método: `setCustomMeaning()`
   - Responsabilidad: Configurar significados personalizados
   - Líneas estimadas: ~50

6. **ToggleActiveStatusUseCase**

   - Método: `toggleActiveStatus()`
   - Responsabilidad: Activar/desactivar tarotista
   - Líneas estimadas: ~30

7. **ListTarotistasUseCase**

   - Método: `findAll()`
   - Responsabilidad: Listar tarotistas con filtros
   - Líneas estimadas: ~60

8. **GetTarotistaDetailsUseCase**
   - Método: `findOne()`
   - Responsabilidad: Obtener detalles de tarotista
   - Líneas estimadas: ~30

### Desde `metrics.service.ts` (272 líneas)

9. **CalculateMetricsUseCase**
   - Métodos: `getReadingCountsByTarotista()`, `getMetricsByPeriod()`
   - Responsabilidad: Calcular métricas
   - Líneas estimadas: ~80

### Desde `reports.service.ts` (276 líneas)

10. **GenerateReportUseCase**
    - Métodos: `generateReport()`, `exportReport()`
    - Responsabilidad: Generar reportes
    - Líneas estimadas: ~100

## Estimación de Archivos Resultantes

### Domain (2-3 archivos, ~200 líneas)

- `tarotista.entity.ts`: ~50 líneas (entidad pura)
- `tarotista-repository.interface.ts`: ~80 líneas
- `metrics-repository.interface.ts`: ~40 líneas
- `reports-repository.interface.ts`: ~30 líneas

### Application (16-18 archivos, ~1500 líneas)

- **Use-cases:** 10 archivos, ~540 líneas
- **Services:** 3 archivos, ~250 líneas
- **DTOs:** 13 archivos, 919 líneas (sin cambios)

### Infrastructure (18 archivos, ~1500 líneas)

- **Repositories:** 3 archivos, ~400 líneas
- **Controllers:** 4 archivos, 381 líneas (sin cambios lógicos)
- **Entities:** 7 archivos, 1021 líneas (sin cambios)

### Total: ~36-39 archivos, ~3200 líneas

- Archivos adicionales: +5-8
- Líneas totales: ~3200 (similar al actual)
- **Máximo por archivo:** <150 líneas por use-case/service

## Riesgos y Mitigaciones

### Riesgos

1. **Alto:** Módulo crítico para marketplace
2. **Medio:** Integración con AIModule (PromptBuilderService)
3. **Medio:** 7 entidades interrelacionadas
4. **Medio:** Tests pueden fallar si se rompen dependencias

### Mitigaciones

1. **PRESERVE-VERIFY-REFACTOR:** No eliminar hasta validar
2. **Tests primero:** Aumentar coverage antes de refactor
3. **Commits incrementales:** 1 commit por fase
4. **Validación continua:** Build + tests después de cada paso mayor

## Checklist de Validación

### Antes de Eliminar Código Antiguo

- [ ] Build exitoso con código nuevo
- [ ] Todos los tests pasan
- [ ] Coverage >= baseline (79.69% statements)
- [ ] Lint pasa sin errores
- [ ] Controllers responden correctamente
- [ ] Integración con AIModule funciona

### Después de Eliminar Código Antiguo

- [ ] Build exitoso sin código deprecated
- [ ] Todos los tests pasan
- [ ] Coverage >= baseline
- [ ] Lint pasa
- [ ] E2E tests críticos pasan
- [ ] 0 dependencias circulares (madge)
- [ ] Endpoints marketplace funcionan

## Próximos Pasos

1. ✅ Análisis completado
2. ⏳ Crear estructura de carpetas
3. ⏳ Implementar interfaces de repositorios
4. ⏳ Implementar repositorios TypeORM
5. ⏳ Extraer use-cases
6. ⏳ Crear orchestrator service
7. ⏳ Actualizar módulo
8. ⏳ Validar completamente
9. ⏳ Eliminar código antiguo
10. ⏳ Validación final

---

**Última actualización:** 2025-11-25
