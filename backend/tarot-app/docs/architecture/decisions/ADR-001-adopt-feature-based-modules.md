# ADR-001: Adoptar Feature-Based Modules con Capas Internas

**Fecha:** 2025-11-10  
**Estado:** Aceptado  
**Contexto:** Refactorización arquitectural del backend Tarot (PLAN_REFACTORIZACION.md)  
**Relacionado con:** TASK-ARCH-001, TASK-ARCH-002, TASK-ARCH-003

---

## Contexto

El proyecto Tarot Backend necesita evolucionar de MVP a marketplace enterprise, manteniendo velocidad de desarrollo pero mejorando:

- **Testabilidad:** Código difícil de mockear por acoplamiento
- **Mantenibilidad:** Services monolíticos (>700 líneas)
- **Escalabilidad:** Preparación para multi-tenant (múltiples tarotistas)

**Desafío:** Balance entre cohesión de negocio y separación técnica.

**Estado inicial:**

- Feature-based modules (estilo NestJS estándar)
- Estructura flat dentro de cada módulo
- TypeORM repositories inyectados directamente en services
- Services con múltiples responsabilidades

---

## Decisión

Adoptar enfoque **híbrido** que combina:

### 1. Feature-Based Modules (nivel superior)

- Organización por dominio de negocio
- Cohesión funcional (todo lo relacionado a "readings" junto)
- Estilo NestJS nativo

### 2. Layered Architecture (dentro de módulos complejos)

- **domain/**: Interfaces, contratos, lógica de negocio pura
- **application/**: Use cases, services, DTOs, orquestación
- **infrastructure/**: Repositories TypeORM, controllers, entities

### 3. Criterio de Aplicación

Aplicar capas SOLO en módulos que cumplan:

- > 10 archivos .ts O >1000 líneas de código
- Lógica de negocio compleja
- Alta criticidad para negocio

---

## Alternativas Consideradas

### Opción 1: NestJS Puro Flat

**Descripción:** Mantener estructura flat estándar de NestJS

**Pros:**

- ✅ Simplicidad máxima
- ✅ Onboarding rápido
- ✅ Documentación abundante

**Contras:**

- ❌ No escala a marketplace enterprise
- ❌ Services monolíticos difíciles de testear
- ❌ Acoplamiento a TypeORM

**Razón de rechazo:** No cumple objetivos de escalabilidad y testabilidad

---

### Opción 2: Clean Architecture Pura

**Descripción:** Separación total por capas técnicas (domain/, application/, infrastructure/) a nivel raíz

**Pros:**

- ✅ Separación de responsabilidades perfecta
- ✅ Testabilidad máxima
- ✅ Independencia de frameworks

**Contras:**

- ❌ Over-engineering para MVP actual
- ❌ Dificulta navegación (feature disperso en 3 carpetas)
- ❌ Requiere mucho boilerplate
- ❌ Onboarding lento

**Razón de rechazo:** Complejidad innecesaria para tamaño actual del proyecto

---

### Opción 3: Arquitectura Híbrida (Feature + Capas) ⭐ **ELEGIDA**

**Descripción:** Feature-based a nivel módulo, layered dentro de módulos complejos

**Pros:**

- ✅ Cohesión de negocio por feature (fácil navegar)
- ✅ Separación técnica en módulos complejos (fácil testear)
- ✅ Pragmático: solo aplicar capas donde se justifica
- ✅ Escalable: preparado para crecimiento

**Contras:**

- ⚠️ Requiere criterio para decidir cuándo aplicar capas (mitigado por ADR-002)
- ⚠️ Convivencia temporal de estilos (documentado y aceptado)

**Razón de selección:**

- Balance perfecto entre simplicidad y escalabilidad
- Permite evolución gradual sin reescritura total
- Mantiene ventajas de NestJS + beneficios de Clean Architecture

---

## Consecuencias

### Positivas

1. **Testabilidad mejorada:**

   - Services inyectan interfaces (fácil mockear)
   - Use cases pequeños y focalizados
   - Repository pattern abstrae TypeORM

2. **Mantenibilidad mejorada:**

   - Código organizado por feature (cohesión)
   - Separación de capas en módulos complejos (baja complejidad)
   - Services <200 líneas

3. **Escalabilidad preparada:**

   - Fácil agregar nuevos tarotistas (multi-tenant)
   - Preparado para CQRS en operaciones complejas
   - Infraestructura intercambiable (cambiar ORM si es necesario)

4. **Onboarding facilitado:**
   - Convención clara y documentada
   - Estructura predecible
   - Ejemplos de referencia (cache, ai, readings)

### Negativas / Trade-offs

1. **Convivencia de estilos:**

   - Algunos módulos con capas, otros flat
   - **Mitigación:** Criterio claro en ADR-002

2. **Requiere disciplina:**

   - Evitar regresar a servicios monolíticos
   - **Mitigación:** Code review guidelines + CI/CD validations

3. **Refactorización gradual:**
   - Trabajo inicial considerable (TASK-ARCH-001 a 006)
   - **Mitigación:** Plan detallado, ejecución incremental

---

## Implementación

### Estado Inicial (Pre-Refactorización)

```
src/modules/
└── tarot/
    ├── cache/
    │   └── cache.service.ts (300 líneas - lógica mezclada)
    ├── ai/
    │   └── ai.service.ts (400 líneas - multi-provider acoplado)
    └── readings/
        └── readings.service.ts (719 líneas - monolítico)
```

### Estado Objetivo (Post-Refactorización)

```
src/modules/
└── tarot/
    ├── cache/                      ✅ CON CAPAS
    │   ├── domain/
    │   │   └── interfaces/
    │   ├── application/
    │   │   ├── services/
    │   │   └── use-cases/
    │   └── infrastructure/
    │       └── repositories/
    ├── ai/                         ✅ CON CAPAS
    │   ├── domain/
    │   ├── application/
    │   └── infrastructure/
    ├── readings/                   ✅ CON CAPAS + CQRS
    │   ├── domain/
    │   ├── application/
    │   │   ├── commands/
    │   │   ├── queries/
    │   │   └── events/
    │   └── infrastructure/
    ├── interpretations/            ❌ FLAT (simplificado)
    ├── spreads/                    ❌ FLAT (CRUD simple)
    └── cards/                      ❌ FLAT (catálogo)
```

### Plan de Acción

1. ✅ **TASK-ARCH-001:** Extraer módulo cache con capas
2. ✅ **TASK-ARCH-002:** Extraer módulo AI con capas
3. ✅ **TASK-ARCH-003:** Dividir readings.service en use-cases
4. ✅ **TASK-ARCH-004:** Repository pattern explícito
5. ⏳ **TASK-ARCH-005:** CQRS en readings (opcional)
6. ✅ **TASK-ARCH-006:** Evaluar módulos restantes
7. ⏳ **TASK-ARCH-007:** Documentación y governance

---

## Métricas de Éxito

### Antes de Refactorización

- **Archivos >500 líneas:** 3 (cache.service, ai.service, readings.service)
- **Testabilidad:** Difícil (acoplamiento a TypeORM)
- **Coverage:** ~38%
- **Tiempo de build:** ~15s
- **Tiempo de tests:** ~40s

### Después de Refactorización (Objetivo)

- **Archivos >200 líneas:** 0
- **Testabilidad:** Fácil (inyección de interfaces)
- **Coverage:** ≥38% (mantener o mejorar)
- **Tiempo de build:** <20s
- **Tiempo de tests:** <50s
- **Dependencias circulares:** 0

---

## Referencias

- [PLAN_REFACTORIZACION.md](../../PLAN_REFACTORIZACION.md)
- [ARQUITECTURA_ANALISIS.md](../../ARQUITECTURA_ANALISIS.md)
- [ADR-002: Criterio de Capas](./ADR-002-layered-architecture-criteria.md)
- Clean Architecture (Robert C. Martin)
- NestJS Best Practices

---

## Revisiones

- **2025-11-10:** Creación inicial (inicio refactorización)
- **2025-11-11:** Actualización post TASK-ARCH-006
- **Próxima revisión:** 2026-05-11 (6 meses post-refactor)

---

## Notas Adicionales

### Lecciones Aprendidas (TASK-ARCH-001 a 003)

1. **PRESERVE-VERIFY-REFACTOR funciona:**

   - Duplicar antes de eliminar previene errores
   - Tests continuos detectan problemas temprano

2. **Coverage es indicador crítico:**

   - Nunca debe bajar
   - Fuerza a mover tests junto con código

3. **Commits incrementales son clave:**

   - Facilita debugging si algo falla
   - Permite rollback granular

4. **Criterio de capas es esencial:**
   - Evita over-engineering
   - Mantiene simplicidad donde es posible
