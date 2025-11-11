# Plan de Refactorización Arquitectural - Tarot Backend

**Fecha de creación:** 2025-11-10  
**Última actualización:** 2025-11-10  
**Autor:** GitHub Copilot  
**Basado en:** ARQUITECTURA_ANALISIS.md  
**Estado:** En desarrollo

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Estrategia General](#estrategia-general)
3. [Precondiciones Obligatorias](#precondiciones-obligatorias)
4. [Fases de Refactorización](#fases-de-refactorización)
   - [Fase 1: Quick Wins](#fase-1-quick-wins)
     - [TASK-ARCH-001: Extraer Módulo Cache](#task-arch-001-extraer-módulo-cache)
     - [TASK-ARCH-002: Extraer Módulo AI](#task-arch-002-extraer-módulo-ai)
   - [Fase 2: Refactorización Moderada](#fase-2-refactorización-moderada)
     - [TASK-ARCH-003: Dividir readings.service.ts](#task-arch-003-dividir-readingsservicets)
     - [TASK-ARCH-004: Repository Pattern Explícito](#task-arch-004-repository-pattern-explícito)
   - [Fase 3: Mejoras Arquitecturales](#fase-3-mejoras-arquitecturales)
     - [TASK-ARCH-005: Introducir CQRS](#task-arch-005-introducir-cqrs)
     - [TASK-ARCH-006: Separar Capas en Módulos Críticos](#task-arch-006-separar-capas-en-módulos-críticos)
   - [Fase 4: Documentación y Governance](#fase-4-documentación-y-governance)
     - [TASK-ARCH-007: Documentación y Governance](#task-arch-007-documentación-y-governance)
5. [Validación Continua](#validación-continua)
6. [Troubleshooting](#troubleshooting)
7. [Apéndices](#apéndices)

---

## 🎯 Introducción

Este documento detalla el **plan de acción paso a paso** para refactorizar la arquitectura del backend de Tarot hacia un diseño **enterprise-grade**, manteniendo la funcionalidad actual y mejorando la mantenibilidad, testabilidad y escalabilidad.

### Objetivos de la Refactorización

1. ✅ **Separar responsabilidades** - Extraer módulos `cache` y `ai` independientes
2. ✅ **Reducir complejidad** - Dividir services >300 líneas en componentes especializados
3. ✅ **Mejorar testabilidad** - Preservar y aumentar coverage actual (~37%)
4. ⭐ **Preservar funcionalidad marketplace** - Tarotistas personalizados deben seguir funcionando
5. ✅ **Aplicar mejores prácticas** - Enfoque híbrido NestJS feature-based con subcapas en módulos complejos

### Contexto del Proyecto

**Métricas actuales:**

- **readings.service.ts:** 719 líneas ⚠️
- **interpretation-cache.service.ts:** 399 líneas ⚠️
- **interpretations.service.ts:** 352 líneas ⚠️
- **prompt-builder.service.ts:** 304 líneas ⚠️
- **ai-provider.service.ts:** 272 líneas ⚠️
- **Coverage de tests:** ~37% (7 archivos .spec.ts)
- **Módulo interpretations:** 19 archivos .ts + 7 archivos .spec.ts

**Deuda técnica identificada:**

- ❌ InterpretationsModule con 6 responsabilidades mezcladas
- ❌ 6 entidades TypeORM importadas en un solo módulo
- ❌ Lógica de negocio acoplada a implementaciones de infraestructura
- ❌ Services monolíticos difíciles de testear

---

## 🎯 Estrategia General

### Enfoque: **Refactorización Incremental Híbrida**

**Filosofía:**

- ✅ Feature-based a nivel módulo (estilo NestJS estándar)
- ✅ Layered dentro de módulos complejos (domain/application/infrastructure)
- ✅ **Criterio:** Si módulo >10 archivos o >1000 líneas → aplicar subcapas

**Principios:**

1. **Incremental:** Cambios pequeños y validados continuamente
2. **Reversible:** Cada paso puede rollback si falla
3. **Test-first:** Mover tests junto con código, mantener >37% coverage
4. **Build-safe:** Build exitoso después de cada paso
5. **Marketplace-safe:** Verificar tarotistas personalizados funcionando

### Orden de Ejecución

```
Fase 1 (Semana 1-2)
├── TASK-ARCH-001: Extraer módulo cache (3-5 días)
└── TASK-ARCH-002: Extraer módulo AI (3-5 días)

Fase 2 (Semana 3-4)
├── TASK-ARCH-003: Dividir readings.service.ts (5-7 días)
└── TASK-ARCH-004: Repository Pattern (3-5 días)

Fase 3 (Semana 5-8)
├── TASK-ARCH-005: Introducir CQRS (7-10 días)
└── TASK-ARCH-006: Separar capas (7-10 días)

Fase 4 (Semana 9-10)
└── TASK-ARCH-007: Documentación y Governance (5-7 días)
```

---

## ⚠️ Precondiciones Obligatorias

**ANTES de ejecutar CUALQUIER tarea, verificar:**

### 1. ✅ Crear Rama de Feature

```bash
# Nomenclatura estricta
git checkout develop
git pull origin develop
git checkout -b feature/TASK-ARCH-00X-nombre-descriptivo

# Ejemplo para TASK-ARCH-001
git checkout -b feature/TASK-ARCH-001-extraer-modulo-cache
```

**❌ NUNCA trabajar directamente en `develop`**

### 2. ✅ Verificar Tests Actuales Pasan

```bash
# Ejecutar suite completa
npm test

# Verificar coverage
npm run test:cov

# Debe mostrar:
# - Statements   : ~37%
# - Branches     : ~30%
# - Functions    : ~35%
# - Lines        : ~37%
```

**❌ NO proceder si hay tests fallidos**

### 3. ✅ Ejecutar Build Completo

```bash
# Build debe completar sin errores
npm run build

# Verificar output exitoso
# dist/ debe generarse correctamente
```

**❌ NO proceder si hay errores de compilación**

### 4. ⭐ Validar Funcionalidad Marketplace

```bash
# Levantar aplicación en modo desarrollo
npm run start:dev

# Verificar endpoints de tarotistas personalizados
# GET /api/tarotistas
# POST /api/interpretations (con tarotistaId)

# Verificar logs: PromptBuilderService debe usar tarotistas config
```

**❌ NO proceder si marketplace no funciona**

### 5. ✅ Backup de Base de Datos (Opcional pero Recomendado)

```bash
# Backup de desarrollo
npm run db:backup

# O manual
pg_dump -U postgres tarot_dev > backup_pre_refactor_$(date +%Y%m%d).sql
```

---

## 🚀 Fases de Refactorización

### Fase 1: Quick Wins

---

## TASK-ARCH-001: Extraer Módulo Cache

**Prioridad:** 🔴 Alta  
**Duración estimada:** 3-5 días  
**Complejidad:** Media  
**Dependencias:** Ninguna

### Objetivo

Extraer toda la lógica de caché de interpretaciones del módulo `interpretations` hacia un módulo `cache` independiente con arquitectura limpia de 3 capas (domain/application/infrastructure).

### Justificación

- **interpretation-cache.service.ts:** 399 líneas (supera límite de 300)
- **Responsabilidades mezcladas:** Cache está acoplado a interpretations
- **Reutilización:** Cache podría usarse para otros módulos en el futuro
- **Tests existentes:** 3 archivos .spec.ts (~37% del total) que deben preservarse

### Archivos a Mover

#### Del módulo `interpretations/` al módulo `cache/`

**Servicios (3 archivos):**

```
src/modules/tarot/interpretations/interpretation-cache.service.ts
  → src/modules/cache/application/services/interpretation-cache.service.ts

src/modules/tarot/interpretations/cache-cleanup.service.ts
  → src/modules/cache/application/services/cache-cleanup.service.ts
```

**Entidades (1 archivo):**

```
src/modules/tarot/interpretations/entities/cached-interpretation.entity.ts
  → src/modules/cache/infrastructure/entities/cached-interpretation.entity.ts
```

**Controller (1 archivo):**

```
src/modules/tarot/interpretations/cache-admin.controller.ts
  → src/modules/cache/infrastructure/controllers/cache-admin.controller.ts
```

**Tests (3 archivos):**

```
test/cache-admin.controller.spec.ts
  → test/cache/cache-admin.controller.spec.ts

test/interpretation-cache.service.spec.ts
  → test/cache/interpretation-cache.service.spec.ts

test/interpretation-cache-invalidation.spec.ts
  → test/cache/interpretation-cache-invalidation.spec.ts
```

### Estructura del Nuevo Módulo

```
src/modules/cache/
├── domain/
│   ├── interfaces/
│   │   └── cache-repository.interface.ts          # NEW - Interface para repositorio
│   └── entities/
│       └── cache-entry.entity.ts                  # NEW - Entidad de dominio pura
├── application/
│   ├── services/
│   │   ├── interpretation-cache.service.ts        # MOVED - Servicio principal
│   │   ├── cache-cleanup.service.ts               # MOVED - Limpieza automática
│   │   └── cache-invalidation.service.ts          # NEW - Lógica de invalidación separada
│   └── dto/
│       ├── cache-stats.dto.ts                     # NEW - DTOs para estadísticas
│       └── invalidate-cache.dto.ts                # NEW - DTOs para invalidación
├── infrastructure/
│   ├── repositories/
│   │   └── typeorm-cache.repository.ts            # NEW - Implementación TypeORM
│   ├── controllers/
│   │   └── cache-admin.controller.ts              # MOVED - Controller admin
│   └── entities/
│       └── cached-interpretation.entity.ts        # MOVED - Entidad TypeORM
└── cache.module.ts                                # NEW - Módulo NestJS
```

### Pasos de Implementación

#### Paso 1: Crear Estructura de Carpetas

```bash
# Desde backend/tarot-app/
mkdir -p src/modules/cache/domain/interfaces
mkdir -p src/modules/cache/domain/entities
mkdir -p src/modules/cache/application/services
mkdir -p src/modules/cache/application/dto
mkdir -p src/modules/cache/infrastructure/repositories
mkdir -p src/modules/cache/infrastructure/controllers
mkdir -p src/modules/cache/infrastructure/entities
```

**Validación:**

```bash
tree src/modules/cache -L 3
# Debe mostrar la estructura completa
```

---

#### Paso 2: Crear Interfaces de Dominio

**Crear:** `src/modules/cache/domain/interfaces/cache-repository.interface.ts`

```typescript
import { CachedInterpretation } from '../../infrastructure/entities/cached-interpretation.entity';

export interface ICacheRepository {
  findByKey(key: string): Promise<CachedInterpretation | null>;
  save(entry: CachedInterpretation): Promise<CachedInterpretation>;
  delete(key: string): Promise<void>;
  deleteExpired(): Promise<number>;
  getStats(): Promise<{
    total: number;
    expired: number;
    hits: number;
    misses: number;
  }>;
}
```

**Validación:**

```bash
# Verificar que el archivo existe
ls -la src/modules/cache/domain/interfaces/
```

---

#### Paso 3: Mover Entidad TypeORM a Infrastructure

```bash
# Copiar (no mover aún, para mantener backup)
cp src/modules/tarot/interpretations/entities/cached-interpretation.entity.ts \
   src/modules/cache/infrastructure/entities/cached-interpretation.entity.ts
```

**Modificar:** `src/modules/cache/infrastructure/entities/cached-interpretation.entity.ts`

Actualizar imports:

```typescript
// ANTES
import { TarotInterpretation } from './tarot-interpretation.entity';

// DESPUÉS
import { TarotInterpretation } from '../../../tarot/interpretations/entities/tarot-interpretation.entity';
```

**Validación:**

```bash
npm run build
# Debe compilar sin errores
```

---

#### Paso 4: Crear Implementación de Repositorio

**Crear:** `src/modules/cache/infrastructure/repositories/typeorm-cache.repository.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ICacheRepository } from '../../domain/interfaces/cache-repository.interface';
import { CachedInterpretation } from '../entities/cached-interpretation.entity';

@Injectable()
export class TypeOrmCacheRepository implements ICacheRepository {
  constructor(
    @InjectRepository(CachedInterpretation)
    private readonly cacheRepo: Repository<CachedInterpretation>,
  ) {}

  async findByKey(key: string): Promise<CachedInterpretation | null> {
    return this.cacheRepo.findOne({
      where: { cacheKey: key },
      relations: ['interpretation'],
    });
  }

  async save(entry: CachedInterpretation): Promise<CachedInterpretation> {
    return this.cacheRepo.save(entry);
  }

  async delete(key: string): Promise<void> {
    await this.cacheRepo.delete({ cacheKey: key });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.cacheRepo.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected || 0;
  }

  async getStats(): Promise<{
    total: number;
    expired: number;
    hits: number;
    misses: number;
  }> {
    const total = await this.cacheRepo.count();
    const expired = await this.cacheRepo.count({
      where: { expiresAt: LessThan(new Date()) },
    });

    // Implementar lógica de hits/misses si existe métricas
    return {
      total,
      expired,
      hits: 0, // TODO: Implementar tracking
      misses: 0, // TODO: Implementar tracking
    };
  }
}
```

**Validación:**

```bash
npm run build
```

---

#### Paso 5: Crear DTOs de Aplicación

**Crear:** `src/modules/cache/application/dto/cache-stats.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CacheStatsDto {
  @ApiProperty({ description: 'Total cache entries' })
  total: number;

  @ApiProperty({ description: 'Expired cache entries' })
  expired: number;

  @ApiProperty({ description: 'Cache hit count' })
  hits: number;

  @ApiProperty({ description: 'Cache miss count' })
  misses: number;

  @ApiProperty({ description: 'Hit rate percentage' })
  hitRate: number;
}
```

**Crear:** `src/modules/cache/application/dto/invalidate-cache.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class InvalidateCacheDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tarotistaId?: string;
}
```

**Validación:**

```bash
npm run build
```

---

#### Paso 6: Mover y Adaptar Servicios

**Mover interpretation-cache.service.ts:**

```bash
cp src/modules/tarot/interpretations/interpretation-cache.service.ts \
   src/modules/cache/application/services/interpretation-cache.service.ts
```

**Modificar:** `src/modules/cache/application/services/interpretation-cache.service.ts`

Actualizar imports:

```typescript
// ANTES
import { CachedInterpretation } from './entities/cached-interpretation.entity';
import { TarotInterpretation } from './entities/tarot-interpretation.entity';

// DESPUÉS
import { CachedInterpretation } from '../../infrastructure/entities/cached-interpretation.entity';
import { TarotInterpretation } from '../../../tarot/interpretations/entities/tarot-interpretation.entity';
import { ICacheRepository } from '../../domain/interfaces/cache-repository.interface';
```

Inyectar repositorio en lugar de TypeORM directamente:

```typescript
// ANTES
constructor(
  @InjectRepository(CachedInterpretation)
  private readonly cacheRepo: Repository<CachedInterpretation>,
) {}

// DESPUÉS
constructor(
  @Inject('ICacheRepository')
  private readonly cacheRepo: ICacheRepository,
) {}
```

**Mover cache-cleanup.service.ts:**

```bash
cp src/modules/tarot/interpretations/cache-cleanup.service.ts \
   src/modules/cache/application/services/cache-cleanup.service.ts
```

Actualizar imports de manera similar.

**Validación:**

```bash
npm run build
```

---

#### Paso 7: Mover Controller

```bash
cp src/modules/tarot/interpretations/cache-admin.controller.ts \
   src/modules/cache/infrastructure/controllers/cache-admin.controller.ts
```

**Modificar:** `src/modules/cache/infrastructure/controllers/cache-admin.controller.ts`

Actualizar imports:

```typescript
// ANTES
import { InterpretationCacheService } from '../interpretation-cache.service';

// DESPUÉS
import { InterpretationCacheService } from '../../application/services/interpretation-cache.service';
import { CacheStatsDto } from '../../application/dto/cache-stats.dto';
import { InvalidateCacheDto } from '../../application/dto/invalidate-cache.dto';
```

Actualizar rutas si es necesario:

```typescript
// Mantener o actualizar según convención
@Controller('admin/cache') // o @Controller('cache/admin')
export class CacheAdminController {
  // ...
}
```

**Validación:**

```bash
npm run build
```

---

#### Paso 8: Crear Módulo Cache

**Crear:** `src/modules/cache/cache.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { CachedInterpretation } from './infrastructure/entities/cached-interpretation.entity';

// Services
import { InterpretationCacheService } from './application/services/interpretation-cache.service';
import { CacheCleanupService } from './application/services/cache-cleanup.service';

// Controllers
import { CacheAdminController } from './infrastructure/controllers/cache-admin.controller';

// Repositories
import { TypeOrmCacheRepository } from './infrastructure/repositories/typeorm-cache.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CachedInterpretation])],
  controllers: [CacheAdminController],
  providers: [
    InterpretationCacheService,
    CacheCleanupService,
    {
      provide: 'ICacheRepository',
      useClass: TypeOrmCacheRepository,
    },
  ],
  exports: [InterpretationCacheService, CacheCleanupService],
})
export class CacheModule {}
```

**Validación:**

```bash
npm run build
```

---

#### Paso 9: Actualizar AppModule

**Modificar:** `src/app.module.ts`

```typescript
// AGREGAR import
import { CacheModule } from './modules/cache/cache.module';

@Module({
  imports: [
    // ... otros imports
    CacheModule, // AGREGAR
    // ...
  ],
  // ...
})
export class AppModule {}
```

**Validación:**

```bash
npm run build
npm run start:dev
# Verificar que la aplicación levanta sin errores
```

---

#### Paso 10: Actualizar InterpretationsModule

**Modificar:** `src/modules/tarot/interpretations/interpretations.module.ts`

```typescript
// AGREGAR import
import { CacheModule } from '../../cache/cache.module';

// REMOVER imports antiguos
// import { InterpretationCacheService } from './interpretation-cache.service';
// import { CacheCleanupService } from './cache-cleanup.service';
// import { CacheAdminController } from './cache-admin.controller';
// import { CachedInterpretation } from './entities/cached-interpretation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TarotInterpretation,
      // CachedInterpretation, // REMOVER
      TarotistaConfig,
      TarotistaCardMeaning,
      Tarotista,
      TarotCard,
    ]),
    CacheModule, // AGREGAR
    // ... otros imports
  ],
  controllers: [
    InterpretationsController,
    // CacheAdminController, // REMOVER
  ],
  providers: [
    InterpretationsService,
    // InterpretationCacheService, // REMOVER
    AIProviderService,
    PromptBuilderService,
    // CacheCleanupService, // REMOVER
    GroqProvider,
    DeepSeekProvider,
    OpenAIProvider,
  ],
  exports: [
    InterpretationsService,
    AIProviderService,
    PromptBuilderService,
    // InterpretationCacheService, // REMOVER
  ],
})
export class InterpretationsModule {}
```

**Validación:**

```bash
npm run build
```

---

#### Paso 11: Actualizar Inyección de Dependencias en InterpretationsService

**Modificar:** `src/modules/tarot/interpretations/interpretations.service.ts`

Actualizar import:

```typescript
// ANTES
import { InterpretationCacheService } from './interpretation-cache.service';

// DESPUÉS
import { InterpretationCacheService } from '../../cache/application/services/interpretation-cache.service';
```

El constructor debería funcionar sin cambios si el servicio se exporta correctamente desde CacheModule.

**Validación:**

```bash
npm run build
```

---

#### Paso 12: Mover y Actualizar Tests

**Mover tests:**

```bash
mkdir -p test/cache

# Mover tests
mv test/cache-admin.controller.spec.ts test/cache/
mv test/interpretation-cache.service.spec.ts test/cache/
mv test/interpretation-cache-invalidation.spec.ts test/cache/
```

**Actualizar imports en cada archivo de test:**

**Ejemplo:** `test/cache/interpretation-cache.service.spec.ts`

```typescript
// ANTES
import { InterpretationCacheService } from '../src/modules/tarot/interpretations/interpretation-cache.service';
import { CachedInterpretation } from '../src/modules/tarot/interpretations/entities/cached-interpretation.entity';

// DESPUÉS
import { InterpretationCacheService } from '../../src/modules/cache/application/services/interpretation-cache.service';
import { CachedInterpretation } from '../../src/modules/cache/infrastructure/entities/cached-interpretation.entity';
```

Repetir para todos los archivos .spec.ts movidos.

**Validación:**

```bash
npm test -- --testPathPattern=cache
# Todos los tests de cache deben pasar
```

---

#### Paso 13: Ejecutar Suite Completa de Tests

```bash
# Ejecutar todos los tests
npm test

# Verificar coverage
npm run test:cov

# Coverage debe mantenerse >=37%
```

**Criterio de aceptación:**

- ✅ Todos los tests pasan
- ✅ Coverage >= 37%
- ✅ No hay tests fallidos

---

#### Paso 14: Validar Build de Producción

```bash
# Build completo
npm run build

# Verificar que dist/ se genera correctamente
ls -la dist/

# Ejecutar en modo producción (opcional)
NODE_ENV=production node dist/main
```

---

#### Paso 15: Eliminar Archivos Antiguos

**⚠️ SOLO después de validar que TODO funciona:**

```bash
# Eliminar archivos movidos de interpretations
rm src/modules/tarot/interpretations/interpretation-cache.service.ts
rm src/modules/tarot/interpretations/cache-cleanup.service.ts
rm src/modules/tarot/interpretations/cache-admin.controller.ts
rm src/modules/tarot/interpretations/entities/cached-interpretation.entity.ts

# Verificar build nuevamente
npm run build
npm test
```

---

#### Paso 16: Commit y Push

```bash
# Stage cambios
git add .

# Commit descriptivo
git commit -m "refactor(arch): TASK-ARCH-001 - Extraer módulo cache independiente

- Crear CacheModule con arquitectura de 3 capas
- Mover InterpretationCacheService (399 líneas) a cache/application/
- Mover CacheCleanupService a cache/application/
- Mover CacheAdminController a cache/infrastructure/
- Mover CachedInterpretation entity a cache/infrastructure/
- Crear ICacheRepository interface y TypeOrmCacheRepository
- Mover 3 archivos .spec.ts a test/cache/
- Actualizar InterpretationsModule para importar CacheModule
- Coverage mantenido: 37%
- Build exitoso
- Todos los tests pasando"

# Push a rama feature
git push origin feature/TASK-ARCH-001-extraer-modulo-cache
```

---

### Criterios de Aceptación

**✅ Checklist de validación:**

- [ ] CacheModule creado en `src/modules/cache/`
- [ ] Estructura de 3 capas implementada (domain/application/infrastructure)
- [ ] ICacheRepository interface creada
- [ ] TypeOrmCacheRepository implementado
- [ ] InterpretationCacheService movido y funcionando
- [ ] CacheCleanupService movido y funcionando
- [ ] CacheAdminController movido y funcionando
- [ ] CachedInterpretation entity movida
- [ ] 3 archivos .spec.ts movidos a test/cache/
- [ ] Todos los imports actualizados correctamente
- [ ] InterpretationsModule actualizado (imports CacheModule)
- [ ] AppModule actualizado (imports CacheModule)
- [ ] Build exitoso (`npm run build`)
- [ ] Todos los tests pasan (`npm test`)
- [ ] Coverage >= 37% (`npm run test:cov`)
- [ ] Aplicación levanta sin errores (`npm run start:dev`)
- [ ] Endpoints de cache funcionando (GET /admin/cache/stats)
- [ ] InterpretationsModule redujo archivos en ~30%
- [ ] Archivos antiguos eliminados de interpretations/
- [ ] Commit creado con mensaje descriptivo
- [ ] Push a rama feature exitoso

---

### Métricas Esperadas

**Antes:**

- InterpretationsModule: 19 archivos .ts
- interpretation-cache.service.ts: 399 líneas
- Coverage: ~37%

**Después:**

- InterpretationsModule: ~15 archivos .ts (-21%)
- CacheModule: 9 archivos .ts (nuevo)
- interpretation-cache.service.ts: 399 líneas (movido)
- Coverage: >=37% (mantenido o mejorado)

---

### Troubleshooting

**Error: "Cannot find module CachedInterpretation"**

- Verificar que todos los imports usen rutas relativas correctas
- Verificar que TypeOrmModule.forFeature incluya la entidad en CacheModule

**Error: "Circular dependency detected"**

- Verificar que CacheModule no importe InterpretationsModule
- Solo InterpretationsModule debe importar CacheModule

**Tests fallando después de mover:**

- Actualizar imports en archivos .spec.ts
- Verificar que TestingModule incluya todos los providers necesarios
- Mockear ICacheRepository en tests

**Build falla con TypeORM errors:**

- Verificar que CachedInterpretation esté en TypeOrmModule.forFeature()
- Verificar decoradores @Entity, @Column correctos
- Ejecutar `npm run typeorm:cache:clear` si es necesario

---

### Rollback Plan

Si algo sale mal y necesitas revertir:

```bash
# 1. Descartar cambios no commiteados
git reset --hard HEAD

# 2. Volver a develop
git checkout develop

# 3. Eliminar rama feature
git branch -D feature/TASK-ARCH-001-extraer-modulo-cache

# 4. Verificar que aplicación funciona
npm run build
npm test
npm run start:dev
```

---

## TASK-ARCH-002: Extraer Módulo AI

**Prioridad:** 🔴 Alta  
**Duración estimada:** 3-5 días  
**Complejidad:** Media-Alta  
**Dependencias:** TASK-ARCH-001 completada (recomendado, no obligatorio)

### Objetivo

Extraer toda la lógica de integración con proveedores de IA (Groq, DeepSeek, OpenAI) del módulo `interpretations` hacia un módulo `ai` independiente con arquitectura limpia de 3 capas.

### Justificación

- **ai-provider.service.ts:** 272 líneas
- **prompt-builder.service.ts:** 304 líneas
- **3 providers:** groq, deepseek, openai (~100 líneas cada uno)
- **3 error utilities:** circuit-breaker, retry, ai-error-types (~100 líneas cada uno)
- **Total:** 10+ archivos, ~1000+ líneas de código
- **Tests existentes:** 4 archivos .spec.ts que deben preservarse
- ⭐ **CRÍTICO:** Integración con Tarotistas Personalizados (marketplace)

### Archivos a Mover

#### Del módulo `interpretations/` al módulo `ai/`

**Servicios (2 archivos):**

```
src/modules/tarot/interpretations/ai-provider.service.ts
  → src/modules/ai/application/services/ai-provider.service.ts

src/modules/tarot/interpretations/prompt-builder.service.ts
  → src/modules/ai/application/services/prompt-builder.service.ts
```

**Interfaces (1 archivo):**

```
src/modules/tarot/interpretations/ai-provider.interface.ts
  → src/modules/ai/domain/interfaces/ai-provider.interface.ts
```

**Providers (3 archivos):**

```
src/modules/tarot/interpretations/providers/groq.provider.ts
  → src/modules/ai/infrastructure/providers/groq.provider.ts

src/modules/tarot/interpretations/providers/deepseek.provider.ts
  → src/modules/ai/infrastructure/providers/deepseek.provider.ts

src/modules/tarot/interpretations/providers/openai.provider.ts
  → src/modules/ai/infrastructure/providers/openai.provider.ts
```

**Error Utilities (3 archivos):**

```
src/modules/tarot/interpretations/errors/ai-error.types.ts
  → src/modules/ai/infrastructure/errors/ai-error.types.ts

src/modules/tarot/interpretations/errors/circuit-breaker.utils.ts
  → src/modules/ai/infrastructure/errors/circuit-breaker.utils.ts

src/modules/tarot/interpretations/errors/retry.utils.ts
  → src/modules/ai/infrastructure/errors/retry.utils.ts
```

**Prompts (1 archivo):**

```
src/modules/tarot/interpretations/tarot-prompts.ts
  → src/modules/ai/application/prompts/tarot-prompts.ts
```

**Tests (4 archivos):**

```
test/prompt-builder.service.spec.ts
  → test/ai/prompt-builder.service.spec.ts

src/modules/tarot/interpretations/errors/circuit-breaker.utils.spec.ts
  → test/ai/circuit-breaker.utils.spec.ts

src/modules/tarot/interpretations/errors/retry.utils.spec.ts
  → test/ai/retry.utils.spec.ts

src/modules/tarot/interpretations/errors/ai-error.types.spec.ts
  → test/ai/ai-error.types.spec.ts
```

### Estructura del Nuevo Módulo

```
src/modules/ai/
├── domain/
│   ├── interfaces/
│   │   ├── ai-provider.interface.ts              # MOVED - Interface principal
│   │   └── prompt-builder.interface.ts           # NEW - Interface para builder
│   └── value-objects/
│       ├── ai-request.vo.ts                      # NEW - Value object request
│       └── ai-response.vo.ts                     # NEW - Value object response
├── application/
│   ├── services/
│   │   ├── ai-provider.service.ts                # MOVED - Orquestador de providers
│   │   └── prompt-builder.service.ts             # MOVED - Constructor de prompts
│   ├── prompts/
│   │   └── tarot-prompts.ts                      # MOVED - Templates de prompts
│   └── dto/
│       ├── ai-request.dto.ts                     # NEW - DTO para requests
│       └── ai-response.dto.ts                    # NEW - DTO para responses
├── infrastructure/
│   ├── providers/
│   │   ├── groq.provider.ts                      # MOVED - Provider Groq
│   │   ├── deepseek.provider.ts                  # MOVED - Provider DeepSeek
│   │   └── openai.provider.ts                    # MOVED - Provider OpenAI
│   ├── errors/
│   │   ├── ai-error.types.ts                     # MOVED - Tipos de error
│   │   ├── circuit-breaker.utils.ts              # MOVED - Circuit breaker
│   │   └── retry.utils.ts                        # MOVED - Retry logic
│   └── http/
│       └── ai-http.adapter.ts                    # NEW - Adapter para HTTP
└── ai.module.ts                                   # NEW - Módulo NestJS
```

### Pasos de Implementación

#### Paso 1: Crear Estructura de Carpetas

```bash
# Desde backend/tarot-app/
mkdir -p src/modules/ai/domain/interfaces
mkdir -p src/modules/ai/domain/value-objects
mkdir -p src/modules/ai/application/services
mkdir -p src/modules/ai/application/prompts
mkdir -p src/modules/ai/application/dto
mkdir -p src/modules/ai/infrastructure/providers
mkdir -p src/modules/ai/infrastructure/errors
mkdir -p src/modules/ai/infrastructure/http
```

**Validación:**

```bash
tree src/modules/ai -L 3
```

---

#### Paso 2: Mover Interface de Dominio

```bash
cp src/modules/tarot/interpretations/ai-provider.interface.ts \
   src/modules/ai/domain/interfaces/ai-provider.interface.ts
```

**Validación:**

```bash
npm run build
```

---

#### Paso 3: Mover Error Utilities a Infrastructure

```bash
# Mover errors/
cp src/modules/tarot/interpretations/errors/ai-error.types.ts \
   src/modules/ai/infrastructure/errors/ai-error.types.ts

cp src/modules/tarot/interpretations/errors/circuit-breaker.utils.ts \
   src/modules/ai/infrastructure/errors/circuit-breaker.utils.ts

cp src/modules/tarot/interpretations/errors/retry.utils.ts \
   src/modules/ai/infrastructure/errors/retry.utils.ts
```

**Validación:**

```bash
npm run build
```

---

#### Paso 4: Mover Providers a Infrastructure

```bash
# Mover providers/
cp src/modules/tarot/interpretations/providers/groq.provider.ts \
   src/modules/ai/infrastructure/providers/groq.provider.ts

cp src/modules/tarot/interpretations/providers/deepseek.provider.ts \
   src/modules/ai/infrastructure/providers/deepseek.provider.ts

cp src/modules/tarot/interpretations/providers/openai.provider.ts \
   src/modules/ai/infrastructure/providers/openai.provider.ts
```

**Modificar cada provider para actualizar imports:**

**Ejemplo:** `src/modules/ai/infrastructure/providers/groq.provider.ts`

```typescript
// ANTES
import { IAIProvider } from '../ai-provider.interface';
import { AIError, AIErrorType } from '../errors/ai-error.types';
import { withRetry } from '../errors/retry.utils';
import { CircuitBreaker } from '../errors/circuit-breaker.utils';

// DESPUÉS
import { IAIProvider } from '../../domain/interfaces/ai-provider.interface';
import { AIError, AIErrorType } from '../errors/ai-error.types';
import { withRetry } from '../errors/retry.utils';
import { CircuitBreaker } from '../errors/circuit-breaker.utils';
```

Repetir para deepseek.provider.ts y openai.provider.ts.

**Validación:**

```bash
npm run build
```

---

#### Paso 5: Mover Prompts a Application

```bash
cp src/modules/tarot/interpretations/tarot-prompts.ts \
   src/modules/ai/application/prompts/tarot-prompts.ts
```

**Validación:**

```bash
npm run build
```

---

#### Paso 6: Mover PromptBuilderService

```bash
cp src/modules/tarot/interpretations/prompt-builder.service.ts \
   src/modules/ai/application/services/prompt-builder.service.ts
```

**Modificar:** `src/modules/ai/application/services/prompt-builder.service.ts`

Actualizar imports:

```typescript
// ANTES
import { TAROT_PROMPTS } from './tarot-prompts';
import { TarotistaConfig } from '../../../tarotistas/entities/tarotista-config.entity';
import { TarotistaCardMeaning } from '../../../tarotistas/entities/tarotista-card-meaning.entity';
import { Tarotista } from '../../../tarotistas/entities/tarotista.entity';

// DESPUÉS
import { TAROT_PROMPTS } from '../prompts/tarot-prompts';
import { TarotistaConfig } from '../../../tarotistas/entities/tarotista-config.entity';
import { TarotistaCardMeaning } from '../../../tarotistas/entities/tarotista-card-meaning.entity';
import { Tarotista } from '../../../tarotistas/entities/tarotista.entity';
```

⭐ **IMPORTANTE:** Las referencias a entidades de tarotistas se mantienen para preservar funcionalidad de marketplace.

**Validación:**

```bash
npm run build
```

---

#### Paso 7: Mover AIProviderService

```bash
cp src/modules/tarot/interpretations/ai-provider.service.ts \
   src/modules/ai/application/services/ai-provider.service.ts
```

**Modificar:** `src/modules/ai/application/services/ai-provider.service.ts`

Actualizar imports:

```typescript
// ANTES
import { IAIProvider } from './ai-provider.interface';
import { GroqProvider } from './providers/groq.provider';
import { DeepSeekProvider } from './providers/deepseek.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { CircuitBreaker } from './errors/circuit-breaker.utils';
import { AIError, AIErrorType } from './errors/ai-error.types';

// DESPUÉS
import { IAIProvider } from '../../domain/interfaces/ai-provider.interface';
import { GroqProvider } from '../../infrastructure/providers/groq.provider';
import { DeepSeekProvider } from '../../infrastructure/providers/deepseek.provider';
import { OpenAIProvider } from '../../infrastructure/providers/openai.provider';
import { CircuitBreaker } from '../../infrastructure/errors/circuit-breaker.utils';
import {
  AIError,
  AIErrorType,
} from '../../infrastructure/errors/ai-error.types';
```

**Validación:**

```bash
npm run build
```

---

#### Paso 8: Crear DTOs de Aplicación

**Crear:** `src/modules/ai/application/dto/ai-request.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class AIRequestDto {
  @ApiProperty({ description: 'Prompt to send to AI' })
  @IsString()
  prompt: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}
```

**Crear:** `src/modules/ai/application/dto/ai-response.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class AIResponseDto {
  @ApiProperty()
  content: string;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  model: string;

  @ApiProperty({ required: false })
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  @ApiProperty({ required: false })
  metadata?: Record<string, any>;
}
```

**Validación:**

```bash
npm run build
```

---

#### Paso 9: Crear Módulo AI

**Crear:** `src/modules/ai/ai.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Services
import { AIProviderService } from './application/services/ai-provider.service';
import { PromptBuilderService } from './application/services/prompt-builder.service';

// Providers
import { GroqProvider } from './infrastructure/providers/groq.provider';
import { DeepSeekProvider } from './infrastructure/providers/deepseek.provider';
import { OpenAIProvider } from './infrastructure/providers/openai.provider';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    AIProviderService,
    PromptBuilderService,
    GroqProvider,
    DeepSeekProvider,
    OpenAIProvider,
  ],
  exports: [AIProviderService, PromptBuilderService],
})
export class AIModule {}
```

**Validación:**

```bash
npm run build
```

---

#### Paso 10: Actualizar AppModule

**Modificar:** `src/app.module.ts`

```typescript
// AGREGAR import
import { AIModule } from './modules/ai/ai.module';

@Module({
  imports: [
    // ... otros imports
    CacheModule,
    AIModule, // AGREGAR
    // ...
  ],
  // ...
})
export class AppModule {}
```

**Validación:**

```bash
npm run build
npm run start:dev
```

---

#### Paso 11: Actualizar InterpretationsModule

**Modificar:** `src/modules/tarot/interpretations/interpretations.module.ts`

```typescript
// AGREGAR import
import { AIModule } from '../../ai/ai.module';

// REMOVER imports antiguos
// import { AIProviderService } from './ai-provider.service';
// import { PromptBuilderService } from './prompt-builder.service';
// import { GroqProvider } from './providers/groq.provider';
// import { DeepSeekProvider } from './providers/deepseek.provider';
// import { OpenAIProvider } from './providers/openai.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TarotInterpretation,
      TarotistaConfig,
      TarotistaCardMeaning,
      Tarotista,
      TarotCard,
    ]),
    CacheModule,
    AIModule, // AGREGAR
    // ... otros imports
  ],
  controllers: [InterpretationsController],
  providers: [
    InterpretationsService,
    // AIProviderService, // REMOVER
    // PromptBuilderService, // REMOVER
    // GroqProvider, // REMOVER
    // DeepSeekProvider, // REMOVER
    // OpenAIProvider, // REMOVER
  ],
  exports: [
    InterpretationsService,
    // AIProviderService, // REMOVER
    // PromptBuilderService, // REMOVER
  ],
})
export class InterpretationsModule {}
```

**Validación:**

```bash
npm run build
```

---

#### Paso 12: Actualizar Inyección de Dependencias en InterpretationsService

**Modificar:** `src/modules/tarot/interpretations/interpretations.service.ts`

Actualizar imports:

```typescript
// ANTES
import { AIProviderService } from './ai-provider.service';
import { PromptBuilderService } from './prompt-builder.service';

// DESPUÉS
import { AIProviderService } from '../../ai/application/services/ai-provider.service';
import { PromptBuilderService } from '../../ai/application/services/prompt-builder.service';
```

El constructor debería funcionar sin cambios.

**Validación:**

```bash
npm run build
```

---

#### Paso 13: ⭐ Validar Funcionalidad de Tarotistas Personalizados

**CRÍTICO:** Verificar que la integración de marketplace sigue funcionando.

```bash
# Levantar aplicación
npm run start:dev

# Verificar logs durante startup:
# Debe cargar TarotistaConfig, TarotistaCardMeaning, Tarotista

# Probar endpoint de interpretación con tarotista
curl -X POST http://localhost:3000/api/interpretations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "spreadId": "...",
    "question": "Test question",
    "tarotistaId": "..."
  }'

# Verificar en logs que PromptBuilderService usa configuración de tarotista
```

**Criterio de aceptación:**

- ✅ PromptBuilderService genera prompts personalizados
- ✅ Significados de cartas por tarotista se aplican
- ✅ No hay errores de "Cannot find entity TarotistaConfig"

---

#### Paso 14: Mover y Actualizar Tests

**Mover tests:**

```bash
mkdir -p test/ai

# Mover tests
mv test/prompt-builder.service.spec.ts test/ai/

# Mover tests unitarios de errors/ (si están en src/)
mv src/modules/tarot/interpretations/errors/circuit-breaker.utils.spec.ts test/ai/
mv src/modules/tarot/interpretations/errors/retry.utils.spec.ts test/ai/
mv src/modules/tarot/interpretations/errors/ai-error.types.spec.ts test/ai/
```

**Actualizar imports en cada archivo:**

**Ejemplo:** `test/ai/prompt-builder.service.spec.ts`

```typescript
// ANTES
import { PromptBuilderService } from '../src/modules/tarot/interpretations/prompt-builder.service';
import { TAROT_PROMPTS } from '../src/modules/tarot/interpretations/tarot-prompts';

// DESPUÉS
import { PromptBuilderService } from '../../src/modules/ai/application/services/prompt-builder.service';
import { TAROT_PROMPTS } from '../../src/modules/ai/application/prompts/tarot-prompts';
```

**Ejemplo:** `test/ai/circuit-breaker.utils.spec.ts`

```typescript
// ANTES
import { CircuitBreaker } from './circuit-breaker.utils';

// DESPUÉS
import { CircuitBreaker } from '../../src/modules/ai/infrastructure/errors/circuit-breaker.utils';
```

Repetir para retry.utils.spec.ts y ai-error.types.spec.ts.

**Validación:**

```bash
npm test -- --testPathPattern=ai
# Todos los tests de ai deben pasar
```

---

#### Paso 15: Ejecutar Suite Completa de Tests

```bash
# Ejecutar todos los tests
npm test

# Verificar coverage
npm run test:cov

# Coverage debe mantenerse >=37%
```

---

#### Paso 16: Validar Build de Producción

```bash
npm run build
ls -la dist/
NODE_ENV=production node dist/main
```

---

#### Paso 17: Eliminar Archivos Antiguos

**⚠️ SOLO después de validar:**

```bash
# Eliminar archivos movidos
rm src/modules/tarot/interpretations/ai-provider.service.ts
rm src/modules/tarot/interpretations/prompt-builder.service.ts
rm src/modules/tarot/interpretations/ai-provider.interface.ts
rm src/modules/tarot/interpretations/tarot-prompts.ts
rm -rf src/modules/tarot/interpretations/providers/
rm -rf src/modules/tarot/interpretations/errors/

# Verificar
npm run build
npm test
```

---

#### Paso 18: Commit y Push

```bash
git add .

git commit -m "refactor(arch): TASK-ARCH-002 - Extraer módulo AI independiente

- Crear AIModule con arquitectura de 3 capas
- Mover AIProviderService (272 líneas) a ai/application/
- Mover PromptBuilderService (304 líneas) a ai/application/
- Mover 3 providers (Groq, DeepSeek, OpenAI) a ai/infrastructure/
- Mover 3 error utilities (circuit-breaker, retry, ai-error) a ai/infrastructure/
- Mover tarot-prompts.ts a ai/application/prompts/
- Mover 4 archivos .spec.ts a test/ai/
- Actualizar InterpretationsModule para importar AIModule
- PRESERVAR integración con Tarotistas Personalizados
- Coverage mantenido: 37%
- Build exitoso
- Todos los tests pasando
- Funcionalidad marketplace validada"

git push origin feature/TASK-ARCH-002-extraer-modulo-ai
```

---

### Criterios de Aceptación

**✅ Checklist de validación:**

- [ ] AIModule creado en `src/modules/ai/`
- [ ] Estructura de 3 capas implementada
- [ ] IAIProvider interface movida a domain/
- [ ] AIProviderService movido y funcionando
- [ ] PromptBuilderService movido y funcionando
- [ ] 3 providers movidos (Groq, DeepSeek, OpenAI)
- [ ] 3 error utilities movidas (circuit-breaker, retry, ai-error)
- [ ] tarot-prompts.ts movido
- [ ] 4 archivos .spec.ts movidos a test/ai/
- [ ] Todos los imports actualizados
- [ ] InterpretationsModule actualizado (imports AIModule)
- [ ] AppModule actualizado (imports AIModule)
- [ ] Build exitoso
- [ ] Todos los tests pasan
- [ ] Coverage >= 37%
- [ ] Aplicación levanta sin errores
- [ ] ⭐ Tarotistas personalizados funcionando correctamente
- [ ] ⭐ PromptBuilderService genera prompts personalizados
- [ ] ⭐ No hay errores de entidades de tarotistas
- [ ] InterpretationsModule redujo archivos en ~40%
- [ ] Archivos antiguos eliminados
- [ ] Commit y push exitoso

---

### Métricas Esperadas

**Antes:**

- InterpretationsModule: ~15 archivos .ts (después de TASK-ARCH-001)
- ai-provider.service.ts: 272 líneas
- prompt-builder.service.ts: 304 líneas
- 3 providers: ~300 líneas total
- Coverage: ~37%

**Después:**

- InterpretationsModule: ~5 archivos .ts (-67% desde inicio)
- AIModule: 10 archivos .ts (nuevo)
- Coverage: >=37%
- Funcionalidad marketplace: ✅ Preservada

---

### Troubleshooting

**Error: "Cannot inject TarotistaConfig in PromptBuilderService"**

- Verificar que AIModule NO importa TypeOrmModule.forFeature con entidades de tarotistas
- Las entidades de tarotistas deben seguir en TarotistasModule o InterpretationsModule
- PromptBuilderService solo necesita inyectar repositorios, no entidades directamente

**Error: "Circular dependency between AIModule and InterpretationsModule"**

- Solo InterpretationsModule debe importar AIModule
- AIModule NO debe importar InterpretationsModule
- Si AIModule necesita algo de interpretations, crear un módulo compartido

**Tests de PromptBuilder fallando:**

- Verificar que tests mockeen correctamente TarotistaConfig
- Verificar imports de TAROT_PROMPTS actualizados
- Verificar que TestingModule incluya todos los providers

**Prompts personalizados no funcionan:**

- Verificar que InterpretationsModule sigue importando TypeOrmModule.forFeature con entidades de tarotistas
- Verificar logs de PromptBuilderService durante generación
- Verificar que tarotistaId se pasa correctamente en request

---

### Fase 2: Refactorización Moderada

---

## TASK-ARCH-003: Dividir readings.service.ts

**Prioridad:** 🟡 Media  
**Duración estimada:** 5-7 días  
**Complejidad:** Alta  
**Dependencias:** TASK-ARCH-001 y TASK-ARCH-002 completadas (recomendado)

### Objetivo

Dividir el service monolítico `readings.service.ts` (719 líneas) en use-cases específicos y servicios auxiliares especializados, aplicando principios de SRP (Single Responsibility Principle) y facilitando testabilidad.

### Justificación

- **readings.service.ts:** 719 líneas (supera límite de 300)
- **Múltiples responsabilidades:** CRUD, validación, compartir, paginación, regeneración
- **Difícil de testear:** Requiere mockear múltiples dependencias
- **Dificulta mantenimiento:** Cambios en una funcionalidad afectan todo el service

### Análisis del Servicio Actual

**readings.service.ts responsabilidades actuales:**

1. **CRUD básico:** create, findOne, findAll, update, delete
2. **Validación:** Validar spreads, questions, user permissions
3. **Compartir lecturas:** Generate share URLs, manage share tokens
4. **Paginación:** Implementar paginación con filtros
5. **Regeneración:** Regenerar lecturas existentes
6. **Integraciones:** Spreads, Users, Categories, Interpretations

### Estructura Propuesta

```
src/modules/tarot/readings/
├── domain/
│   ├── interfaces/
│   │   └── reading-repository.interface.ts       # NEW - Interface repositorio
│   └── entities/
│       └── reading.entity.ts                     # MOVED - Entidad de dominio
├── application/
│   ├── use-cases/
│   │   ├── create-reading.use-case.ts            # NEW - Crear lectura
│   │   ├── get-reading.use-case.ts               # NEW - Obtener lectura
│   │   ├── list-readings.use-case.ts             # NEW - Listar con paginación
│   │   ├── regenerate-reading.use-case.ts        # NEW - Regenerar lectura
│   │   ├── share-reading.use-case.ts             # NEW - Compartir lectura
│   │   └── delete-reading.use-case.ts            # NEW - Eliminar lectura
│   ├── services/
│   │   ├── reading-validator.service.ts          # NEW - Validaciones
│   │   ├── reading-share.service.ts              # NEW - Lógica de compartir
│   │   └── readings-orchestrator.service.ts      # REFACTORED - Orquestador simple
│   └── dto/
│       ├── create-reading.dto.ts                 # EXISTING
│       ├── update-reading.dto.ts                 # EXISTING
│       ├── paginate-readings.dto.ts              # EXISTING
│       └── share-reading.dto.ts                  # NEW
├── infrastructure/
│   ├── repositories/
│   │   └── typeorm-reading.repository.ts         # NEW - Implementación TypeORM
│   ├── controllers/
│   │   └── readings.controller.ts                # EXISTING - Actualizar
│   └── entities/
│       └── reading.entity.ts                     # EXISTING - TypeORM entity
└── readings.module.ts                             # EXISTING - Actualizar
```

### Pasos de Implementación

#### Paso 1: Analizar readings.service.ts

```bash
# Ver estructura actual
cat src/modules/tarot/readings/readings.service.ts | grep -E '(async|public|private).*\(' | head -20

# Contar líneas por método (aproximado)
```

Identificar métodos principales:

- `create()` → create-reading.use-case.ts
- `findAll()` → list-readings.use-case.ts
- `findOne()` → get-reading.use-case.ts
- `regenerate()` → regenerate-reading.use-case.ts
- `share()` → share-reading.use-case.ts
- `delete()` → delete-reading.use-case.ts
- `validateSpread()` → reading-validator.service.ts
- `generateShareToken()` → reading-share.service.ts

---

#### Paso 2: Crear Estructura de Carpetas

```bash
mkdir -p src/modules/tarot/readings/domain/interfaces
mkdir -p src/modules/tarot/readings/domain/entities
mkdir -p src/modules/tarot/readings/application/use-cases
mkdir -p src/modules/tarot/readings/application/services
mkdir -p src/modules/tarot/readings/application/dto
mkdir -p src/modules/tarot/readings/infrastructure/repositories
mkdir -p src/modules/tarot/readings/infrastructure/controllers
mkdir -p src/modules/tarot/readings/infrastructure/entities
```

---

#### Paso 3: Crear Interface de Repositorio

**Crear:** `src/modules/tarot/readings/domain/interfaces/reading-repository.interface.ts`

```typescript
import { Reading } from '../../infrastructure/entities/reading.entity';

export interface IReadingRepository {
  create(reading: Partial<Reading>): Promise<Reading>;
  findById(id: string): Promise<Reading | null>;
  findByUserId(
    userId: string,
    options?: PaginationOptions,
  ): Promise<[Reading[], number]>;
  findAll(options?: PaginationOptions): Promise<[Reading[], number]>;
  update(id: string, data: Partial<Reading>): Promise<Reading>;
  delete(id: string): Promise<void>;
  findByShareToken(token: string): Promise<Reading | null>;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
```

---

#### Paso 4: Crear Implementación de Repositorio

**Crear:** `src/modules/tarot/readings/infrastructure/repositories/typeorm-reading.repository.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IReadingRepository,
  PaginationOptions,
} from '../../domain/interfaces/reading-repository.interface';
import { Reading } from '../entities/reading.entity';

@Injectable()
export class TypeOrmReadingRepository implements IReadingRepository {
  constructor(
    @InjectRepository(Reading)
    private readonly readingRepo: Repository<Reading>,
  ) {}

  async create(reading: Partial<Reading>): Promise<Reading> {
    const newReading = this.readingRepo.create(reading);
    return this.readingRepo.save(newReading);
  }

  async findById(id: string): Promise<Reading | null> {
    return this.readingRepo.findOne({
      where: { id },
      relations: ['spread', 'user', 'cards', 'interpretation'],
    });
  }

  async findByUserId(
    userId: string,
    options?: PaginationOptions,
  ): Promise<[Reading[], number]> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options || {};

    return this.readingRepo.findAndCount({
      where: { userId },
      relations: ['spread', 'cards'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
    });
  }

  async findAll(options?: PaginationOptions): Promise<[Reading[], number]> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      filters,
    } = options || {};

    return this.readingRepo.findAndCount({
      where: filters,
      relations: ['spread', 'user', 'cards'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
    });
  }

  async update(id: string, data: Partial<Reading>): Promise<Reading> {
    await this.readingRepo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.readingRepo.delete(id);
  }

  async findByShareToken(token: string): Promise<Reading | null> {
    return this.readingRepo.findOne({
      where: { shareToken: token },
      relations: ['spread', 'cards', 'interpretation'],
    });
  }
}
```

---

#### Paso 5: Crear Servicio de Validación

**Crear:** `src/modules/tarot/readings/application/services/reading-validator.service.ts`

```typescript
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spread } from '../../../spreads/entities/spread.entity';
import { User } from '../../../../users/entities/user.entity';

@Injectable()
export class ReadingValidatorService {
  constructor(
    @InjectRepository(Spread)
    private readonly spreadRepo: Repository<Spread>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async validateSpread(spreadId: string): Promise<Spread> {
    const spread = await this.spreadRepo.findOne({
      where: { id: spreadId },
      relations: ['positions'],
    });

    if (!spread) {
      throw new NotFoundException(`Spread with ID ${spreadId} not found`);
    }

    if (!spread.positions || spread.positions.length === 0) {
      throw new BadRequestException(
        `Spread ${spreadId} has no positions defined`,
      );
    }

    return spread;
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  validateQuestion(question: string): void {
    if (!question || question.trim().length === 0) {
      throw new BadRequestException('Question cannot be empty');
    }

    if (question.length > 500) {
      throw new BadRequestException('Question cannot exceed 500 characters');
    }
  }

  validateCardsCount(cardsCount: number, expectedCount: number): void {
    if (cardsCount !== expectedCount) {
      throw new BadRequestException(
        `Expected ${expectedCount} cards but received ${cardsCount}`,
      );
    }
  }
}
```

---

#### Paso 6: Crear Servicio de Compartir

**Crear:** `src/modules/tarot/readings/application/services/reading-share.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

@Injectable()
export class ReadingShareService {
  constructor(private readonly configService: ConfigService) {}

  generateShareToken(): string {
    return randomBytes(32).toString('hex');
  }

  generateShareUrl(token: string): string {
    const baseUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    return `${baseUrl}/shared/readings/${token}`;
  }

  calculateExpiresAt(days: number = 7): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }

  isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }
}
```

---

#### Paso 7: Crear Use Case - Create Reading

**Crear:** `src/modules/tarot/readings/application/use-cases/create-reading.use-case.ts`

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { ReadingValidatorService } from '../services/reading-validator.service';
import { CreateReadingDto } from '../dto/create-reading.dto';
import { Reading } from '../../infrastructure/entities/reading.entity';

@Injectable()
export class CreateReadingUseCase {
  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
    private readonly validator: ReadingValidatorService,
  ) {}

  async execute(dto: CreateReadingDto, userId: string): Promise<Reading> {
    // Validar spread
    const spread = await this.validator.validateSpread(dto.spreadId);

    // Validar usuario
    await this.validator.validateUser(userId);

    // Validar pregunta
    this.validator.validateQuestion(dto.question);

    // Validar cantidad de cartas
    this.validator.validateCardsCount(
      dto.cards.length,
      spread.positions.length,
    );

    // Crear lectura
    const reading = await this.readingRepo.create({
      userId,
      spreadId: dto.spreadId,
      question: dto.question,
      cards: dto.cards,
      categoryId: dto.categoryId,
      predefinedQuestionId: dto.predefinedQuestionId,
    });

    return reading;
  }
}
```

---

#### Paso 8: Crear Use Case - List Readings

**Crear:** `src/modules/tarot/readings/application/use-cases/list-readings.use-case.ts`

```typescript
import { Injectable, Inject } from '@nestjs/common';
import {
  IReadingRepository,
  PaginationOptions,
} from '../../domain/interfaces/reading-repository.interface';
import { Reading } from '../../infrastructure/entities/reading.entity';

@Injectable()
export class ListReadingsUseCase {
  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
  ) {}

  async execute(
    userId: string,
    options: PaginationOptions,
  ): Promise<{
    readings: Reading[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [readings, total] = await this.readingRepo.findByUserId(
      userId,
      options,
    );

    const totalPages = Math.ceil(total / options.limit);

    return {
      readings,
      total,
      page: options.page,
      totalPages,
    };
  }
}
```

---

#### Paso 9: Crear Use Case - Share Reading

**Crear:** `src/modules/tarot/readings/application/use-cases/share-reading.use-case.ts`

```typescript
import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { ReadingShareService } from '../services/reading-share.service';
import { Reading } from '../../infrastructure/entities/reading.entity';

@Injectable()
export class ShareReadingUseCase {
  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
    private readonly shareService: ReadingShareService,
  ) {}

  async execute(
    readingId: string,
    userId: string,
    days: number = 7,
  ): Promise<{ shareUrl: string }> {
    // Obtener lectura
    const reading = await this.readingRepo.findById(readingId);

    if (!reading) {
      throw new NotFoundException(`Reading with ID ${readingId} not found`);
    }

    // Verificar ownership
    if (reading.userId !== userId) {
      throw new ForbiddenException('You do not own this reading');
    }

    // Generar token y URL
    const shareToken = this.shareService.generateShareToken();
    const shareUrl = this.shareService.generateShareUrl(shareToken);
    const expiresAt = this.shareService.calculateExpiresAt(days);

    // Actualizar lectura
    await this.readingRepo.update(readingId, {
      shareToken,
      shareUrl,
      shareExpiresAt: expiresAt,
    });

    return { shareUrl };
  }
}
```

---

#### Paso 10: Crear Use Case - Regenerate Reading

**Crear:** `src/modules/tarot/readings/application/use-cases/regenerate-reading.use-case.ts`

```typescript
import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { Reading } from '../../infrastructure/entities/reading.entity';

@Injectable()
export class RegenerateReadingUseCase {
  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
  ) {}

  async execute(readingId: string, userId: string): Promise<Reading> {
    // Obtener lectura existente
    const reading = await this.readingRepo.findById(readingId);

    if (!reading) {
      throw new NotFoundException(`Reading with ID ${readingId} not found`);
    }

    // Verificar ownership
    if (reading.userId !== userId) {
      throw new ForbiddenException('You do not own this reading');
    }

    // Marcar interpretación como obsoleta (si existe)
    // La nueva interpretación se generará por InterpretationsService

    // Actualizar timestamp de regeneración
    const updatedReading = await this.readingRepo.update(readingId, {
      regeneratedAt: new Date(),
      // Aquí podrías marcar un flag para regenerar interpretación
    });

    return updatedReading;
  }
}
```

---

#### Paso 11: Crear Orquestador Simplificado

**Crear:** `src/modules/tarot/readings/application/services/readings-orchestrator.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { CreateReadingUseCase } from '../use-cases/create-reading.use-case';
import { ListReadingsUseCase } from '../use-cases/list-readings.use-case';
import { ShareReadingUseCase } from '../use-cases/share-reading.use-case';
import { RegenerateReadingUseCase } from '../use-cases/regenerate-reading.use-case';
import { CreateReadingDto } from '../dto/create-reading.dto';
import { PaginationOptions } from '../../domain/interfaces/reading-repository.interface';

@Injectable()
export class ReadingsOrchestratorService {
  constructor(
    private readonly createReadingUC: CreateReadingUseCase,
    private readonly listReadingsUC: ListReadingsUseCase,
    private readonly shareReadingUC: ShareReadingUseCase,
    private readonly regenerateReadingUC: RegenerateReadingUseCase,
  ) {}

  async createReading(dto: CreateReadingDto, userId: string) {
    return this.createReadingUC.execute(dto, userId);
  }

  async listReadings(userId: string, options: PaginationOptions) {
    return this.listReadingsUC.execute(userId, options);
  }

  async shareReading(readingId: string, userId: string, days?: number) {
    return this.shareReadingUC.execute(readingId, userId, days);
  }

  async regenerateReading(readingId: string, userId: string) {
    return this.regenerateReadingUC.execute(readingId, userId);
  }
}
```

**Total líneas:** ~50 líneas (vs 719 del service original)

---

#### Paso 12: Actualizar Controller

**Modificar:** `src/modules/tarot/readings/infrastructure/controllers/readings.controller.ts`

```typescript
// ANTES
import { ReadingsService } from '../readings.service';

// DESPUÉS
import { ReadingsOrchestratorService } from '../../application/services/readings-orchestrator.service';

@Controller('readings')
export class ReadingsController {
  constructor(
    // private readonly readingsService: ReadingsService, // REMOVER
    private readonly orchestrator: ReadingsOrchestratorService, // AGREGAR
  ) {}

  @Post()
  async create(@Body() dto: CreateReadingDto, @Req() req) {
    // return this.readingsService.create(dto, req.user.id); // ANTES
    return this.orchestrator.createReading(dto, req.user.id); // DESPUÉS
  }

  @Get()
  async findAll(@Req() req, @Query() query) {
    // return this.readingsService.findAll(req.user.id, query); // ANTES
    return this.orchestrator.listReadings(req.user.id, query); // DESPUÉS
  }

  @Post(':id/share')
  async share(@Param('id') id: string, @Req() req) {
    // return this.readingsService.share(id, req.user.id); // ANTES
    return this.orchestrator.shareReading(id, req.user.id); // DESPUÉS
  }

  @Post(':id/regenerate')
  async regenerate(@Param('id') id: string, @Req() req) {
    // return this.readingsService.regenerate(id, req.user.id); // ANTES
    return this.orchestrator.regenerateReading(id, req.user.id); // DESPUÉS
  }
}
```

---

#### Paso 13: Actualizar ReadingsModule

**Modificar:** `src/modules/tarot/readings/readings.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Reading } from './infrastructure/entities/reading.entity';
import { Spread } from '../spreads/entities/spread.entity';
import { User } from '../../users/entities/user.entity';

// Use Cases
import { CreateReadingUseCase } from './application/use-cases/create-reading.use-case';
import { ListReadingsUseCase } from './application/use-cases/list-readings.use-case';
import { ShareReadingUseCase } from './application/use-cases/share-reading.use-case';
import { RegenerateReadingUseCase } from './application/use-cases/regenerate-reading.use-case';

// Services
import { ReadingValidatorService } from './application/services/reading-validator.service';
import { ReadingShareService } from './application/services/reading-share.service';
import { ReadingsOrchestratorService } from './application/services/readings-orchestrator.service';

// Repositories
import { TypeOrmReadingRepository } from './infrastructure/repositories/typeorm-reading.repository';

// Controllers
import { ReadingsController } from './infrastructure/controllers/readings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reading, Spread, User])],
  controllers: [ReadingsController],
  providers: [
    // Repositories
    {
      provide: 'IReadingRepository',
      useClass: TypeOrmReadingRepository,
    },

    // Use Cases
    CreateReadingUseCase,
    ListReadingsUseCase,
    ShareReadingUseCase,
    RegenerateReadingUseCase,

    // Services
    ReadingValidatorService,
    ReadingShareService,
    ReadingsOrchestratorService,

    // DEPRECAR (comentar primero, eliminar después)
    // ReadingsService,
  ],
  exports: [
    ReadingsOrchestratorService,
    // ReadingsService, // DEPRECAR
  ],
})
export class ReadingsModule {}
```

---

#### Paso 14: Ejecutar Build y Tests

```bash
npm run build

# Si hay errores, ajustar imports

npm test -- --testPathPattern=readings

# Crear tests para use-cases (próximo paso)
```

---

#### Paso 15: Crear Tests para Use Cases

**Crear:** `test/readings/create-reading.use-case.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CreateReadingUseCase } from '../../src/modules/tarot/readings/application/use-cases/create-reading.use-case';
import { ReadingValidatorService } from '../../src/modules/tarot/readings/application/services/reading-validator.service';

describe('CreateReadingUseCase', () => {
  let useCase: CreateReadingUseCase;
  let mockRepo: any;
  let mockValidator: any;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
    };

    mockValidator = {
      validateSpread: jest.fn(),
      validateUser: jest.fn(),
      validateQuestion: jest.fn(),
      validateCardsCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReadingUseCase,
        {
          provide: 'IReadingRepository',
          useValue: mockRepo,
        },
        {
          provide: ReadingValidatorService,
          useValue: mockValidator,
        },
      ],
    }).compile();

    useCase = module.get<CreateReadingUseCase>(CreateReadingUseCase);
  });

  it('should create a reading successfully', async () => {
    const dto = {
      spreadId: 'spread-123',
      question: 'Will I succeed?',
      cards: [{ cardId: '1', position: 0 }],
    };

    const userId = 'user-123';

    mockValidator.validateSpread.mockResolvedValue({
      positions: [{ id: '1' }],
    });
    mockValidator.validateUser.mockResolvedValue({ id: userId });
    mockValidator.validateQuestion.mockReturnValue(undefined);
    mockValidator.validateCardsCount.mockReturnValue(undefined);
    mockRepo.create.mockResolvedValue({ id: 'reading-123', ...dto });

    const result = await useCase.execute(dto, userId);

    expect(result).toBeDefined();
    expect(result.id).toBe('reading-123');
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining(dto));
  });
});
```

Repetir para list-readings, share-reading, regenerate-reading use-cases.

---

#### Paso 16: Deprecar readings.service.ts Original

```bash
# Renombrar para marcarlo como deprecado
mv src/modules/tarot/readings/readings.service.ts \
   src/modules/tarot/readings/readings.service.DEPRECATED.ts

# O comentar todo el contenido y agregar warning
```

**En `readings.service.DEPRECATED.ts`:**

```typescript
/**
 * @deprecated
 * Este servicio ha sido reemplazado por:
 * - ReadingsOrchestratorService (orquestación)
 * - CreateReadingUseCase, ListReadingsUseCase, etc. (use-cases)
 *
 * NO USAR en nuevo código.
 * Mantener solo para referencia durante transición.
 */
```

---

#### Paso 17: Validación Completa

```bash
# Build
npm run build

# Tests
npm test

# Coverage
npm run test:cov

# Levantar aplicación
npm run start:dev

# Probar endpoints
curl -X POST http://localhost:3000/api/readings \
  -H "Authorization: Bearer <token>" \
  -d '{"spreadId": "...", "question": "Test"}'
```

---

#### Paso 18: Commit y Push

```bash
git add .

git commit -m "refactor(arch): TASK-ARCH-003 - Dividir readings.service.ts en use-cases

- Crear 4 use-cases: CreateReading, ListReadings, ShareReading, RegenerateReading
- Crear ReadingValidatorService (validaciones)
- Crear ReadingShareService (compartir lógica)
- Crear ReadingsOrchestratorService (orquestador ~50 líneas)
- Implementar IReadingRepository y TypeOrmReadingRepository
- Actualizar ReadingsController para usar orchestrator
- Actualizar ReadingsModule con nueva estructura
- Deprecar readings.service.ts original (719 líneas)
- Crear tests unitarios para use-cases
- Build exitoso
- Todos los tests pasando"

git push origin feature/TASK-ARCH-003-dividir-readings-service
```

---

### Criterios de Aceptación

**✅ Checklist:**

- [ ] IReadingRepository interface creada
- [ ] TypeOrmReadingRepository implementado
- [ ] ReadingValidatorService creado (<150 líneas)
- [ ] ReadingShareService creado (<100 líneas)
- [ ] CreateReadingUseCase creado (<100 líneas)
- [ ] ListReadingsUseCase creado (<50 líneas)
- [ ] ShareReadingUseCase creado (<80 líneas)
- [ ] RegenerateReadingUseCase creado (<80 líneas)
- [ ] ReadingsOrchestratorService creado (<100 líneas)
- [ ] ReadingsController actualizado
- [ ] ReadingsModule actualizado
- [ ] readings.service.ts original deprecado
- [ ] Ningún servicio/use-case >200 líneas
- [ ] Build exitoso
- [ ] Tests unitarios creados para use-cases
- [ ] Todos los tests pasan
- [ ] Coverage mantenido o mejorado
- [ ] Endpoints funcionando correctamente

---

### Métricas Esperadas

**Antes:**

- readings.service.ts: 719 líneas
- 1 archivo monolítico

**Después:**

- ReadingsOrchestratorService: ~50 líneas
- 4 use-cases: ~300 líneas total (~75 líneas cada uno)
- 2 servicios auxiliares: ~200 líneas total
- 1 repositorio: ~150 líneas
- **Total:** ~700 líneas distribuidas en 8 archivos
- **Líneas por archivo:** <150 líneas máximo

---

### Troubleshooting

**Error: "Circular dependency in ReadingsModule"**

- Verificar imports de use-cases
- Use-cases NO deben importar controller

**Tests fallando después de refactor:**

- Actualizar mocks de ReadingsService a ReadingsOrchestratorService
- Mockear use-cases individuales

**Controller no encuentra ReadingsOrchestratorService:**

- Verificar que esté en providers de ReadingsModule
- Verificar exports

---

## TASK-ARCH-004: Repository Pattern Explícito

**Prioridad:** 🟡 Media  
**Duración estimada:** 3-5 días  
**Complejidad:** Media  
**Dependencias:** TASK-ARCH-003 completada (recomendado)

### Objetivo

Aplicar Repository Pattern explícito en todos los módulos críticos, separando la lógica de acceso a datos (TypeORM) de la lógica de negocio, facilitando testabilidad y preparando para potenciales cambios de ORM/DB en el futuro.

### Justificación

- **Acoplamiento a TypeORM:** Services inyectan Repository<Entity> directamente
- **Dificulta testing:** Mockear TypeORM repositories es complejo
- **Viola Dependency Inversion:** Domain depende de infrastructure
- **Preparación para cambios:** Facilita migrar de TypeORM a Prisma/otro ORM si es necesario

### Módulos a Refactorizar

1. ✅ **readings** - Ya tiene IReadingRepository (TASK-ARCH-003)
2. ✅ **cache** - Ya tiene ICacheRepository (TASK-ARCH-001)
3. **interpretations** - Crear IInterpretationRepository
4. **tarotistas** - Crear ITarotistaRepository
5. **spreads** - Crear ISpreadRepository
6. **cards** - Crear ICardRepository
7. **users** - Crear IUserRepository (opcional, depende de complejidad)

### Estructura por Módulo

**Patrón general:**

```
src/modules/{module}/
├── domain/
│   └── interfaces/
│       └── {entity}-repository.interface.ts    # Interface del repositorio
├── infrastructure/
│   └── repositories/
│       └── typeorm-{entity}.repository.ts      # Implementación TypeORM
```

### Pasos de Implementación

#### Paso 1: Crear IInterpretationRepository

**Crear:** `src/modules/tarot/interpretations/domain/interfaces/interpretation-repository.interface.ts`

```typescript
import { TarotInterpretation } from '../../entities/tarot-interpretation.entity';

export interface IInterpretationRepository {
  create(
    interpretation: Partial<TarotInterpretation>,
  ): Promise<TarotInterpretation>;
  findById(id: string): Promise<TarotInterpretation | null>;
  findByReadingId(readingId: string): Promise<TarotInterpretation | null>;
  findByUserId(
    userId: string,
    options?: PaginationOptions,
  ): Promise<[TarotInterpretation[], number]>;
  update(
    id: string,
    data: Partial<TarotInterpretation>,
  ): Promise<TarotInterpretation>;
  delete(id: string): Promise<void>;
  regenerate(readingId: string): Promise<TarotInterpretation>;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
```

---

#### Paso 2: Implementar TypeOrmInterpretationRepository

**Crear:** `src/modules/tarot/interpretations/infrastructure/repositories/typeorm-interpretation.repository.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IInterpretationRepository,
  PaginationOptions,
} from '../../domain/interfaces/interpretation-repository.interface';
import { TarotInterpretation } from '../../entities/tarot-interpretation.entity';

@Injectable()
export class TypeOrmInterpretationRepository
  implements IInterpretationRepository
{
  constructor(
    @InjectRepository(TarotInterpretation)
    private readonly repo: Repository<TarotInterpretation>,
  ) {}

  async create(
    interpretation: Partial<TarotInterpretation>,
  ): Promise<TarotInterpretation> {
    const newInterpretation = this.repo.create(interpretation);
    return this.repo.save(newInterpretation);
  }

  async findById(id: string): Promise<TarotInterpretation | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['reading', 'reading.cards', 'tarotista'],
    });
  }

  async findByReadingId(
    readingId: string,
  ): Promise<TarotInterpretation | null> {
    return this.repo.findOne({
      where: { readingId },
      relations: ['tarotista'],
    });
  }

  async findByUserId(
    userId: string,
    options?: PaginationOptions,
  ): Promise<[TarotInterpretation[], number]> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options || {};

    return this.repo.findAndCount({
      where: { reading: { userId } },
      relations: ['reading', 'tarotista'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
    });
  }

  async update(
    id: string,
    data: Partial<TarotInterpretation>,
  ): Promise<TarotInterpretation> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async regenerate(readingId: string): Promise<TarotInterpretation> {
    // Marcar interpretación anterior como obsoleta
    const existing = await this.findByReadingId(readingId);

    if (existing) {
      await this.update(existing.id, { isObsolete: true });
    }

    // La nueva interpretación se creará por el servicio
    return null;
  }
}
```

---

#### Paso 3: Actualizar InterpretationsService

**Modificar:** `src/modules/tarot/interpretations/interpretations.service.ts`

```typescript
// ANTES
constructor(
  @InjectRepository(TarotInterpretation)
  private readonly interpretationRepo: Repository<TarotInterpretation>,
  // ...
) {}

// DESPUÉS
constructor(
  @Inject('IInterpretationRepository')
  private readonly interpretationRepo: IInterpretationRepository,
  // ...
) {}
```

---

#### Paso 4: Actualizar InterpretationsModule

**Modificar:** `src/modules/tarot/interpretations/interpretations.module.ts`

```typescript
import { TypeOrmInterpretationRepository } from './infrastructure/repositories/typeorm-interpretation.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TarotInterpretation /* otras entidades */]),
    // ...
  ],
  providers: [
    InterpretationsService,
    // Agregar repositorio
    {
      provide: 'IInterpretationRepository',
      useClass: TypeOrmInterpretationRepository,
    },
    // ...
  ],
  // ...
})
export class InterpretationsModule {}
```

---

#### Paso 5: Repetir para Módulo Tarotistas

**Crear estructura:**

```bash
mkdir -p src/modules/tarotistas/domain/interfaces
mkdir -p src/modules/tarotistas/infrastructure/repositories
```

**Crear:** `src/modules/tarotistas/domain/interfaces/tarotista-repository.interface.ts`

```typescript
import { Tarotista } from '../../entities/tarotista.entity';
import { TarotistaConfig } from '../../entities/tarotista-config.entity';
import { TarotistaCardMeaning } from '../../entities/tarotista-card-meaning.entity';

export interface ITarotistaRepository {
  // Tarotista
  findTarotistaById(id: string): Promise<Tarotista | null>;
  findAllTarotistas(): Promise<Tarotista[]>;
  createTarotista(data: Partial<Tarotista>): Promise<Tarotista>;

  // Config
  findConfigByTarotistaId(tarotistaId: string): Promise<TarotistaConfig | null>;
  updateConfig(
    tarotistaId: string,
    data: Partial<TarotistaConfig>,
  ): Promise<TarotistaConfig>;

  // Card Meanings
  findCardMeaningsByTarotista(
    tarotistaId: string,
  ): Promise<TarotistaCardMeaning[]>;
  findCardMeaning(
    tarotistaId: string,
    cardId: string,
  ): Promise<TarotistaCardMeaning | null>;
  upsertCardMeaning(
    data: Partial<TarotistaCardMeaning>,
  ): Promise<TarotistaCardMeaning>;
}
```

**Crear:** `src/modules/tarotistas/infrastructure/repositories/typeorm-tarotista.repository.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITarotistaRepository } from '../../domain/interfaces/tarotista-repository.interface';
import { Tarotista } from '../../entities/tarotista.entity';
import { TarotistaConfig } from '../../entities/tarotista-config.entity';
import { TarotistaCardMeaning } from '../../entities/tarotista-card-meaning.entity';

@Injectable()
export class TypeOrmTarotistaRepository implements ITarotistaRepository {
  constructor(
    @InjectRepository(Tarotista)
    private readonly tarotistaRepo: Repository<Tarotista>,
    @InjectRepository(TarotistaConfig)
    private readonly configRepo: Repository<TarotistaConfig>,
    @InjectRepository(TarotistaCardMeaning)
    private readonly cardMeaningRepo: Repository<TarotistaCardMeaning>,
  ) {}

  async findTarotistaById(id: string): Promise<Tarotista | null> {
    return this.tarotistaRepo.findOne({
      where: { id },
      relations: ['config', 'cardMeanings'],
    });
  }

  async findAllTarotistas(): Promise<Tarotista[]> {
    return this.tarotistaRepo.find({
      relations: ['config'],
    });
  }

  async createTarotista(data: Partial<Tarotista>): Promise<Tarotista> {
    const tarotista = this.tarotistaRepo.create(data);
    return this.tarotistaRepo.save(tarotista);
  }

  async findConfigByTarotistaId(
    tarotistaId: string,
  ): Promise<TarotistaConfig | null> {
    return this.configRepo.findOne({
      where: { tarotistaId },
    });
  }

  async updateConfig(
    tarotistaId: string,
    data: Partial<TarotistaConfig>,
  ): Promise<TarotistaConfig> {
    await this.configRepo.update({ tarotistaId }, data);
    return this.findConfigByTarotistaId(tarotistaId);
  }

  async findCardMeaningsByTarotista(
    tarotistaId: string,
  ): Promise<TarotistaCardMeaning[]> {
    return this.cardMeaningRepo.find({
      where: { tarotistaId },
      relations: ['card'],
    });
  }

  async findCardMeaning(
    tarotistaId: string,
    cardId: string,
  ): Promise<TarotistaCardMeaning | null> {
    return this.cardMeaningRepo.findOne({
      where: { tarotistaId, cardId },
      relations: ['card'],
    });
  }

  async upsertCardMeaning(
    data: Partial<TarotistaCardMeaning>,
  ): Promise<TarotistaCardMeaning> {
    const existing = await this.findCardMeaning(data.tarotistaId, data.cardId);

    if (existing) {
      await this.cardMeaningRepo.update(existing.id, data);
      return this.findCardMeaning(data.tarotistaId, data.cardId);
    }

    const newCardMeaning = this.cardMeaningRepo.create(data);
    return this.cardMeaningRepo.save(newCardMeaning);
  }
}
```

**Actualizar TarotistasModule:**

```typescript
import { TypeOrmTarotistaRepository } from './infrastructure/repositories/typeorm-tarotista.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tarotista,
      TarotistaConfig,
      TarotistaCardMeaning,
    ]),
  ],
  providers: [
    TarotistasService,
    {
      provide: 'ITarotistaRepository',
      useClass: TypeOrmTarotistaRepository,
    },
  ],
  exports: [TarotistasService],
})
export class TarotistasModule {}
```

---

#### Paso 6: Repetir para Módulos Restantes

**Spreads:**

- `ISpreadRepository`
- `TypeOrmSpreadRepository`

**Cards:**

- `ICardRepository`
- `TypeOrmCardRepository`

**Users (opcional):**

- `IUserRepository`
- `TypeOrmUserRepository`

_Misma estructura que los ejemplos anteriores._

---

#### Paso 7: Crear Tests para Repositories

**Crear:** `test/repositories/interpretation.repository.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmInterpretationRepository } from '../../src/modules/tarot/interpretations/infrastructure/repositories/typeorm-interpretation.repository';
import { TarotInterpretation } from '../../src/modules/tarot/interpretations/entities/tarot-interpretation.entity';

describe('TypeOrmInterpretationRepository', () => {
  let repository: TypeOrmInterpretationRepository;
  let mockTypeOrmRepo: any;

  beforeEach(async () => {
    mockTypeOrmRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmInterpretationRepository,
        {
          provide: getRepositoryToken(TarotInterpretation),
          useValue: mockTypeOrmRepo,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmInterpretationRepository>(
      TypeOrmInterpretationRepository,
    );
  });

  describe('create', () => {
    it('should create and save an interpretation', async () => {
      const data = { readingId: 'reading-123', content: 'Test interpretation' };
      const created = { ...data, id: 'interp-123' };

      mockTypeOrmRepo.create.mockReturnValue(created);
      mockTypeOrmRepo.save.mockResolvedValue(created);

      const result = await repository.create(data);

      expect(result).toEqual(created);
      expect(mockTypeOrmRepo.create).toHaveBeenCalledWith(data);
      expect(mockTypeOrmRepo.save).toHaveBeenCalledWith(created);
    });
  });

  describe('findById', () => {
    it('should find interpretation by id', async () => {
      const id = 'interp-123';
      const interpretation = { id, content: 'Test' };

      mockTypeOrmRepo.findOne.mockResolvedValue(interpretation);

      const result = await repository.findById(id);

      expect(result).toEqual(interpretation);
      expect(mockTypeOrmRepo.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: expect.any(Array),
      });
    });
  });
});
```

Repetir para TarotistaRepository, SpreadRepository, etc.

---

#### Paso 8: Validación Completa

```bash
npm run build
npm test
npm run test:cov
npm run start:dev
```

---

#### Paso 9: Commit y Push

```bash
git add .

git commit -m "refactor(arch): TASK-ARCH-004 - Implementar Repository Pattern explícito

- Crear IInterpretationRepository + TypeOrmInterpretationRepository
- Crear ITarotistaRepository + TypeOrmTarotistaRepository
- Crear ISpreadRepository + TypeOrmSpreadRepository
- Crear ICardRepository + TypeOrmCardRepository
- Actualizar services para inyectar interfaces en lugar de TypeORM repos
- Actualizar módulos con providers de repositories
- Crear tests unitarios para repositories
- Separar domain/interfaces de infrastructure/repositories
- Build exitoso
- Todos los tests pasando"

git push origin feature/TASK-ARCH-004-repository-pattern
```

---

### Criterios de Aceptación

**✅ Checklist:**

- [ ] IInterpretationRepository creada
- [ ] TypeOrmInterpretationRepository implementado
- [ ] ITarotistaRepository creada
- [ ] TypeOrmTarotistaRepository implementado
- [ ] ISpreadRepository creada
- [ ] TypeOrmSpreadRepository implementado
- [ ] ICardRepository creada
- [ ] TypeOrmCardRepository implementado
- [ ] Services actualizados (inyectan interfaces)
- [ ] Módulos actualizados (providers configurados)
- [ ] Tests unitarios creados para repositories
- [ ] Build exitoso
- [ ] Todos los tests pasan
- [ ] Coverage mantenido o mejorado
- [ ] No hay @InjectRepository en services (solo en repositories)

---

### Métricas Esperadas

**Antes:**

- Services inyectan Repository<Entity> directamente
- Acoplamiento a TypeORM en capa de aplicación

**Después:**

- Services inyectan I{Entity}Repository (interfaces)
- TypeORM confinado a infrastructure/repositories
- Fácil cambiar ORM en el futuro
- Tests de services más simples (mockean interfaces)

---

### Troubleshooting

**Error: "Cannot inject I{Entity}Repository"**

- Verificar que el provider esté configurado en módulo
- Verificar string del @Inject() coincide con provide

**Tests fallando:**

- Mockear interface en lugar de TypeORM Repository
- Usar valores en lugar de TypeORM query builders

**Circular dependencies:**

- Repositories NO deben inyectar services
- Solo entities y otros repositories

---

### Fase 3: Mejoras Arquitecturales

---

## TASK-ARCH-005: Introducir CQRS

**Prioridad:** 🟢 Baja  
**Duración estimada:** 7-10 días  
**Complejidad:** Alta  
**Dependencias:** TASK-ARCH-001 a TASK-ARCH-004 completadas

### Objetivo

Introducir el patrón CQRS (Command Query Responsibility Segregation) para operaciones complejas de lecturas e interpretaciones, separando comandos (escritura) de queries (lectura) para mejorar escalabilidad y claridad.

### Justificación

- **Operaciones complejas:** Lecturas con paginación, filtros, ordenamiento
- **Escalabilidad:** Separar lecturas (queries) de escrituras (commands) permite optimizar por separado
- **Event-driven:** Facilita implementar eventos de dominio (ReadingCreated, InterpretationGenerated)
- **Auditoría:** Comandos pueden registrarse fácilmente para auditoría

### Módulos a Aplicar CQRS

1. **Readings** - Operaciones complejas de paginación y filtros
2. **Interpretations** - Generación asíncrona de interpretaciones

### Instalación de Dependencias

```bash
npm install @nestjs/cqrs
```

### Estructura Propuesta (Readings)

```
src/modules/tarot/readings/
├── application/
│   ├── commands/
│   │   ├── handlers/
│   │   │   ├── create-reading.handler.ts
│   │   │   ├── regenerate-reading.handler.ts
│   │   │   ├── share-reading.handler.ts
│   │   │   └── delete-reading.handler.ts
│   │   ├── impl/
│   │   │   ├── create-reading.command.ts
│   │   │   ├── regenerate-reading.command.ts
│   │   │   ├── share-reading.command.ts
│   │   │   └── delete-reading.command.ts
│   ├── queries/
│   │   ├── handlers/
│   │   │   ├── get-reading.handler.ts
│   │   │   ├── list-readings.handler.ts
│   │   │   └── get-shared-reading.handler.ts
│   │   ├── impl/
│   │   │   ├── get-reading.query.ts
│   │   │   ├── list-readings.query.ts
│   │   │   └── get-shared-reading.query.ts
│   ├── events/
│   │   ├── handlers/
│   │   │   ├── reading-created.handler.ts
│   │   │   └── reading-regenerated.handler.ts
│   │   ├── impl/
│   │   │   ├── reading-created.event.ts
│   │   │   └── reading-regenerated.event.ts
│   └── sagas/
│       └── readings.saga.ts
```

### Pasos de Implementación

#### Paso 1: Crear Commands

**Crear:** `src/modules/tarot/readings/application/commands/impl/create-reading.command.ts`

```typescript
export class CreateReadingCommand {
  constructor(
    public readonly userId: string,
    public readonly spreadId: string,
    public readonly question: string,
    public readonly cards: Array<{ cardId: string; position: number }>,
    public readonly categoryId?: string,
    public readonly predefinedQuestionId?: string,
  ) {}
}
```

**Crear:** `src/modules/tarot/readings/application/commands/impl/regenerate-reading.command.ts`

```typescript
export class RegenerateReadingCommand {
  constructor(
    public readonly readingId: string,
    public readonly userId: string,
  ) {}
}
```

---

#### Paso 2: Crear Command Handlers

**Crear:** `src/modules/tarot/readings/application/commands/handlers/create-reading.handler.ts`

```typescript
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateReadingCommand } from '../impl/create-reading.command';
import { IReadingRepository } from '../../../domain/interfaces/reading-repository.interface';
import { ReadingValidatorService } from '../../services/reading-validator.service';
import { ReadingCreatedEvent } from '../../events/impl/reading-created.event';
import { Reading } from '../../../infrastructure/entities/reading.entity';

@CommandHandler(CreateReadingCommand)
export class CreateReadingHandler
  implements ICommandHandler<CreateReadingCommand>
{
  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
    private readonly validator: ReadingValidatorService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateReadingCommand): Promise<Reading> {
    const {
      userId,
      spreadId,
      question,
      cards,
      categoryId,
      predefinedQuestionId,
    } = command;

    // Validaciones
    const spread = await this.validator.validateSpread(spreadId);
    await this.validator.validateUser(userId);
    this.validator.validateQuestion(question);
    this.validator.validateCardsCount(cards.length, spread.positions.length);

    // Crear lectura
    const reading = await this.readingRepo.create({
      userId,
      spreadId,
      question,
      cards,
      categoryId,
      predefinedQuestionId,
    });

    // Publicar evento
    this.eventBus.publish(new ReadingCreatedEvent(reading.id, userId));

    return reading;
  }
}
```

**Crear:** `src/modules/tarot/readings/application/commands/handlers/regenerate-reading.handler.ts`

```typescript
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RegenerateReadingCommand } from '../impl/regenerate-reading.command';
import { IReadingRepository } from '../../../domain/interfaces/reading-repository.interface';
import { ReadingRegeneratedEvent } from '../../events/impl/reading-regenerated.event';
import { Reading } from '../../../infrastructure/entities/reading.entity';

@CommandHandler(RegenerateReadingCommand)
export class RegenerateReadingHandler
  implements ICommandHandler<RegenerateReadingCommand>
{
  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegenerateReadingCommand): Promise<Reading> {
    const { readingId, userId } = command;

    const reading = await this.readingRepo.findById(readingId);

    if (!reading) {
      throw new NotFoundException(`Reading with ID ${readingId} not found`);
    }

    if (reading.userId !== userId) {
      throw new ForbiddenException('You do not own this reading');
    }

    const updatedReading = await this.readingRepo.update(readingId, {
      regeneratedAt: new Date(),
    });

    // Publicar evento para regenerar interpretación
    this.eventBus.publish(new ReadingRegeneratedEvent(readingId, userId));

    return updatedReading;
  }
}
```

---

#### Paso 3: Crear Queries

**Crear:** `src/modules/tarot/readings/application/queries/impl/get-reading.query.ts`

```typescript
export class GetReadingQuery {
  constructor(
    public readonly readingId: string,
    public readonly userId: string,
  ) {}
}
```

**Crear:** `src/modules/tarot/readings/application/queries/impl/list-readings.query.ts`

```typescript
export class ListReadingsQuery {
  constructor(
    public readonly userId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly sortBy?: string,
    public readonly sortOrder?: 'ASC' | 'DESC',
    public readonly filters?: Record<string, any>,
  ) {}
}
```

---

#### Paso 4: Crear Query Handlers

**Crear:** `src/modules/tarot/readings/application/queries/handlers/get-reading.handler.ts`

```typescript
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetReadingQuery } from '../impl/get-reading.query';
import { IReadingRepository } from '../../../domain/interfaces/reading-repository.interface';
import { Reading } from '../../../infrastructure/entities/reading.entity';

@QueryHandler(GetReadingQuery)
export class GetReadingHandler implements IQueryHandler<GetReadingQuery> {
  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
  ) {}

  async execute(query: GetReadingQuery): Promise<Reading> {
    const { readingId, userId } = query;

    const reading = await this.readingRepo.findById(readingId);

    if (!reading) {
      throw new NotFoundException(`Reading with ID ${readingId} not found`);
    }

    if (reading.userId !== userId) {
      throw new ForbiddenException('You do not own this reading');
    }

    return reading;
  }
}
```

**Crear:** `src/modules/tarot/readings/application/queries/handlers/list-readings.handler.ts`

```typescript
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListReadingsQuery } from '../impl/list-readings.query';
import { IReadingRepository } from '../../../domain/interfaces/reading-repository.interface';
import { Reading } from '../../../infrastructure/entities/reading.entity';

@QueryHandler(ListReadingsQuery)
export class ListReadingsHandler implements IQueryHandler<ListReadingsQuery> {
  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
  ) {}

  async execute(query: ListReadingsQuery): Promise<{
    readings: Reading[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { userId, page, limit, sortBy, sortOrder, filters } = query;

    const [readings, total] = await this.readingRepo.findByUserId(userId, {
      page,
      limit,
      sortBy,
      sortOrder,
      filters,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      readings,
      total,
      page,
      totalPages,
    };
  }
}
```

---

#### Paso 5: Crear Events

**Crear:** `src/modules/tarot/readings/application/events/impl/reading-created.event.ts`

```typescript
export class ReadingCreatedEvent {
  constructor(
    public readonly readingId: string,
    public readonly userId: string,
  ) {}
}
```

**Crear:** `src/modules/tarot/readings/application/events/impl/reading-regenerated.event.ts`

```typescript
export class ReadingRegeneratedEvent {
  constructor(
    public readonly readingId: string,
    public readonly userId: string,
  ) {}
}
```

---

#### Paso 6: Crear Event Handlers

**Crear:** `src/modules/tarot/readings/application/events/handlers/reading-created.handler.ts`

```typescript
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ReadingCreatedEvent } from '../impl/reading-created.event';

@EventsHandler(ReadingCreatedEvent)
export class ReadingCreatedHandler
  implements IEventHandler<ReadingCreatedEvent>
{
  private readonly logger = new Logger(ReadingCreatedHandler.name);

  handle(event: ReadingCreatedEvent) {
    this.logger.log(
      `Reading created: ${event.readingId} by user ${event.userId}`,
    );

    // Aquí se puede:
    // - Disparar generación de interpretación
    // - Enviar notificación
    // - Actualizar analytics
    // - Invalidar caché
  }
}
```

**Crear:** `src/modules/tarot/readings/application/events/handlers/reading-regenerated.handler.ts`

```typescript
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ReadingRegeneratedEvent } from '../impl/reading-regenerated.event';

@EventsHandler(ReadingRegeneratedEvent)
export class ReadingRegeneratedHandler
  implements IEventHandler<ReadingRegeneratedEvent>
{
  private readonly logger = new Logger(ReadingRegeneratedHandler.name);

  handle(event: ReadingRegeneratedEvent) {
    this.logger.log(
      `Reading regenerated: ${event.readingId} by user ${event.userId}`,
    );

    // Aquí se puede:
    // - Marcar interpretación anterior como obsoleta
    // - Disparar nueva generación
    // - Invalidar caché de interpretación
  }
}
```

---

#### Paso 7: Actualizar Controller para usar CQRS

**Modificar:** `src/modules/tarot/readings/infrastructure/controllers/readings.controller.ts`

```typescript
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateReadingCommand } from '../../application/commands/impl/create-reading.command';
import { RegenerateReadingCommand } from '../../application/commands/impl/regenerate-reading.command';
import { GetReadingQuery } from '../../application/queries/impl/get-reading.query';
import { ListReadingsQuery } from '../../application/queries/impl/list-readings.query';
import { CreateReadingDto } from '../../application/dto/create-reading.dto';

@Controller('readings')
@UseGuards(JwtAuthGuard)
export class ReadingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() dto: CreateReadingDto, @Req() req) {
    const command = new CreateReadingCommand(
      req.user.id,
      dto.spreadId,
      dto.question,
      dto.cards,
      dto.categoryId,
      dto.predefinedQuestionId,
    );

    return this.commandBus.execute(command);
  }

  @Get()
  async findAll(@Req() req, @Query() query) {
    const listQuery = new ListReadingsQuery(
      req.user.id,
      query.page || 1,
      query.limit || 10,
      query.sortBy,
      query.sortOrder,
      query.filters,
    );

    return this.queryBus.execute(listQuery);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const query = new GetReadingQuery(id, req.user.id);
    return this.queryBus.execute(query);
  }

  @Post(':id/regenerate')
  async regenerate(@Param('id') id: string, @Req() req) {
    const command = new RegenerateReadingCommand(id, req.user.id);
    return this.commandBus.execute(command);
  }
}
```

---

#### Paso 8: Actualizar ReadingsModule

**Modificar:** `src/modules/tarot/readings/readings.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Reading } from './infrastructure/entities/reading.entity';
import { Spread } from '../spreads/entities/spread.entity';
import { User } from '../../users/entities/user.entity';

// Command Handlers
import { CreateReadingHandler } from './application/commands/handlers/create-reading.handler';
import { RegenerateReadingHandler } from './application/commands/handlers/regenerate-reading.handler';

// Query Handlers
import { GetReadingHandler } from './application/queries/handlers/get-reading.handler';
import { ListReadingsHandler } from './application/queries/handlers/list-readings.handler';

// Event Handlers
import { ReadingCreatedHandler } from './application/events/handlers/reading-created.handler';
import { ReadingRegeneratedHandler } from './application/events/handlers/reading-regenerated.handler';

// Services
import { ReadingValidatorService } from './application/services/reading-validator.service';

// Repositories
import { TypeOrmReadingRepository } from './infrastructure/repositories/typeorm-reading.repository';

// Controllers
import { ReadingsController } from './infrastructure/controllers/readings.controller';

const CommandHandlers = [CreateReadingHandler, RegenerateReadingHandler];
const QueryHandlers = [GetReadingHandler, ListReadingsHandler];
const EventHandlers = [ReadingCreatedHandler, ReadingRegeneratedHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Reading, Spread, User])],
  controllers: [ReadingsController],
  providers: [
    // Repositories
    {
      provide: 'IReadingRepository',
      useClass: TypeOrmReadingRepository,
    },

    // Services
    ReadingValidatorService,

    // CQRS Handlers
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [],
})
export class ReadingsModule {}
```

---

#### Paso 9: Validación

```bash
npm run build
npm test
npm run start:dev

# Probar endpoints
curl -X POST http://localhost:3000/api/readings \
  -H "Authorization: Bearer <token>" \
  -d '{"spreadId": "...", "question": "Test CQRS"}'
```

---

#### Paso 10: Commit y Push

```bash
git add .

git commit -m "refactor(arch): TASK-ARCH-005 - Introducir CQRS en Readings

- Instalar @nestjs/cqrs
- Crear Commands: CreateReading, RegenerateReading
- Crear Command Handlers
- Crear Queries: GetReading, ListReadings
- Crear Query Handlers
- Crear Events: ReadingCreated, ReadingRegenerated
- Crear Event Handlers
- Actualizar ReadingsController para usar CommandBus/QueryBus
- Actualizar ReadingsModule con CqrsModule
- Build exitoso
- Todos los tests pasando"

git push origin feature/TASK-ARCH-005-introducir-cqrs
```

---

### Criterios de Aceptación

**✅ Checklist:**

- [ ] @nestjs/cqrs instalado
- [ ] Commands creados (CreateReading, RegenerateReading, ShareReading, DeleteReading)
- [ ] Command Handlers implementados
- [ ] Queries creados (GetReading, ListReadings, GetSharedReading)
- [ ] Query Handlers implementados
- [ ] Events creados (ReadingCreated, ReadingRegenerated)
- [ ] Event Handlers implementados
- [ ] ReadingsController usa CommandBus/QueryBus
- [ ] ReadingsModule importa CqrsModule
- [ ] Build exitoso
- [ ] Tests pasando
- [ ] Eventos se publican correctamente

---

### Troubleshooting

**Error: "CommandBus/QueryBus not injected"**

- Verificar que CqrsModule esté importado en módulo

**Handlers no se ejecutan:**

- Verificar que handlers estén en providers del módulo
- Verificar decoradores @CommandHandler/@QueryHandler

**Eventos no se publican:**

- Verificar que EventBus esté inyectado
- Verificar que EventHandlers estén en providers

---

## TASK-ARCH-006: Separar Capas en Módulos Críticos

**Prioridad:** 🟢 Baja  
**Duración estimada:** 7-10 días  
**Complejidad:** Media  
**Dependencias:** TASK-ARCH-001 a TASK-ARCH-005 completadas

### Objetivo

Aplicar separación explícita de capas (domain/application/infrastructure) en módulos críticos restantes que aún no la tienen, completando la transformación hacia arquitectura limpia híbrida.

### Justificación

- **Consistencia arquitectural:** Todos los módulos complejos deben seguir mismo patrón
- **Mantenibilidad:** Facilita onboarding de nuevos desarrolladores
- **Escalabilidad:** Preparado para crecimiento del proyecto

### Módulos a Refactorizar

1. ✅ **cache** - Ya tiene capas (TASK-ARCH-001)
2. ✅ **ai** - Ya tiene capas (TASK-ARCH-002)
3. ✅ **readings** - Ya tiene capas (TASK-ARCH-003)
4. **interpretations** - Aplicar capas
5. **spreads** - Evaluar si necesita (probablemente NO)
6. **cards** - Evaluar si necesita (probablemente NO)
7. **tarotistas** - Evaluar si necesita

### Criterio de Aplicación

**Aplicar capas SI:**

- Módulo tiene >10 archivos .ts
- Módulo tiene >1000 líneas de código total
- Módulo tiene lógica de negocio compleja
- Módulo tiene múltiples responsabilidades

**NO aplicar capas SI:**

- Módulo es simple CRUD
- Módulo tiene <5 archivos .ts
- Módulo tiene <500 líneas de código total

### Paso 1: Evaluar Módulo Interpretations

**Análisis:**

- Después de TASK-ARCH-001 y TASK-ARCH-002: ~5 archivos restantes
- interpretations.service.ts: 352 líneas
- interpretations.controller.ts: ~100 líneas
- interpretations.module.ts: ~50 líneas
- entities/tarot-interpretation.entity.ts: ~50 líneas
- dto/generate-interpretation.dto.ts: ~30 líneas

**Total:** ~5 archivos, ~582 líneas

**Decisión:** **NO aplicar capas** - Módulo simplificado después de extracciones previas.

---

### Paso 2: Evaluar Módulo Spreads

**Análisis:**

```bash
cd src/modules/tarot/spreads
find . -name "*.ts" -not -name "*.spec.ts" | wc -l
cat *.ts | wc -l
```

**Si >10 archivos o >1000 líneas:**

**Aplicar estructura:**

```
spreads/
├── domain/
│   ├── interfaces/
│   │   └── spread-repository.interface.ts
│   └── entities/
│       └── spread.entity.ts
├── application/
│   ├── services/
│   │   └── spreads.service.ts
│   └── dto/
│       ├── create-spread.dto.ts
│       └── update-spread.dto.ts
├── infrastructure/
│   ├── repositories/
│   │   └── typeorm-spread.repository.ts
│   ├── controllers/
│   │   └── spreads.controller.ts
│   └── entities/
│       └── spread.entity.ts
└── spreads.module.ts
```

**Si NO cumple criterio:**

- Mantener estructura flat actual

---

### Paso 3: Evaluar Módulo Tarotistas

**Análisis:**

- tarotistas.service.ts: ~200 líneas
- tarotistas.controller.ts: ~150 líneas
- 3 entidades (Tarotista, TarotistaConfig, TarotistaCardMeaning)
- ⭐ **CRÍTICO para marketplace**

**Total estimado:** ~6-8 archivos, ~500-700 líneas

**Decisión:** **Aplicar capas** si se planea expandir funcionalidad marketplace (ratings, reviews, bookings)

**Estructura propuesta:**

```
tarotistas/
├── domain/
│   ├── interfaces/
│   │   └── tarotista-repository.interface.ts    # Ya creado en TASK-ARCH-004
│   └── entities/
│       └── tarotista.entity.ts                   # Entidad de dominio
├── application/
│   ├── services/
│   │   ├── tarotistas.service.ts
│   │   └── tarotista-config.service.ts           # Separar config
│   └── dto/
│       ├── create-tarotista.dto.ts
│       ├── update-tarotista.dto.ts
│       └── update-config.dto.ts
├── infrastructure/
│   ├── repositories/
│   │   └── typeorm-tarotista.repository.ts       # Ya creado en TASK-ARCH-004
│   ├── controllers/
│   │   ├── tarotistas.controller.ts
│   │   └── tarotista-config.controller.ts        # Separar admin config
│   └── entities/
│       ├── tarotista.entity.ts                   # TypeORM entity
│       ├── tarotista-config.entity.ts
│       └── tarotista-card-meaning.entity.ts
└── tarotistas.module.ts
```

---

### Paso 4: Implementar Separación en Tarotistas (Ejemplo)

**Solo si se decide aplicar:**

#### Crear estructura de carpetas

```bash
mkdir -p src/modules/tarotistas/domain/interfaces
mkdir -p src/modules/tarotistas/domain/entities
mkdir -p src/modules/tarotistas/application/services
mkdir -p src/modules/tarotistas/application/dto
mkdir -p src/modules/tarotistas/infrastructure/repositories
mkdir -p src/modules/tarotistas/infrastructure/controllers
mkdir -p src/modules/tarotistas/infrastructure/entities
```

#### Mover archivos

```bash
# Mover entities a infrastructure
mv src/modules/tarotistas/entities/*.ts \
   src/modules/tarotistas/infrastructure/entities/

# Mover dto a application
mv src/modules/tarotistas/dto/*.ts \
   src/modules/tarotistas/application/dto/

# Mover service a application
mv src/modules/tarotistas/tarotistas.service.ts \
   src/modules/tarotistas/application/services/

# Mover controller a infrastructure
mv src/modules/tarotistas/tarotistas.controller.ts \
   src/modules/tarotistas/infrastructure/controllers/
```

#### Actualizar imports

Actualizar todos los imports en archivos movidos para reflejar nuevas rutas.

#### Actualizar módulo

```typescript
// tarotistas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Tarotista } from './infrastructure/entities/tarotista.entity';
import { TarotistaConfig } from './infrastructure/entities/tarotista-config.entity';
import { TarotistaCardMeaning } from './infrastructure/entities/tarotista-card-meaning.entity';

// Services
import { TarotistasService } from './application/services/tarotistas.service';

// Repositories
import { TypeOrmTarotistaRepository } from './infrastructure/repositories/typeorm-tarotista.repository';

// Controllers
import { TarotistasController } from './infrastructure/controllers/tarotistas.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tarotista,
      TarotistaConfig,
      TarotistaCardMeaning,
    ]),
  ],
  controllers: [TarotistasController],
  providers: [
    TarotistasService,
    {
      provide: 'ITarotistaRepository',
      useClass: TypeOrmTarotistaRepository,
    },
  ],
  exports: [TarotistasService],
})
export class TarotistasModule {}
```

---

### Paso 5: Validación

```bash
npm run build
npm test
npm run test:cov
npm run start:dev
```

---

### Paso 6: Documentar Decisiones

**Crear:** `docs/ADR-002-layered-architecture-criteria.md`

```markdown
# ADR-002: Criterio para Aplicar Arquitectura por Capas

## Contexto

No todos los módulos necesitan la complejidad de 3 capas (domain/application/infrastructure).

## Decisión

Aplicar capas SOLO SI:

- Módulo >10 archivos .ts
- Módulo >1000 líneas código
- Lógica de negocio compleja

Mantener flat SI:

- Módulo simple CRUD
- <5 archivos
- <500 líneas código

## Consecuencias

- Módulos complejos: cache, ai, readings (CON capas)
- Módulos simples: cards, decks, categories (SIN capas)
- Módulos intermedios: interpretations, spreads (EVALUAR)
```

---

### Paso 7: Commit y Push

```bash
git add .

git commit -m "refactor(arch): TASK-ARCH-006 - Separar capas en módulos críticos

- Evaluar módulos según criterio de complejidad
- Aplicar capas en Tarotistas (si aplica)
- Mantener flat en Interpretations (simplificado)
- Documentar criterio en ADR-002
- Build exitoso
- Todos los tests pasando"

git push origin feature/TASK-ARCH-006-separar-capas
```

---

### Criterios de Aceptación

**✅ Checklist:**

- [ ] Módulos evaluados según criterio (>10 archivos o >1000 líneas)
- [ ] Capas aplicadas en módulos que cumplen criterio
- [ ] Módulos simples mantienen estructura flat
- [ ] ADR documentado con criterio
- [ ] Build exitoso
- [ ] Tests pasando
- [ ] Documentación actualizada

---

### Troubleshooting

**Duda sobre aplicar capas:**

- Evaluar complejidad futura del módulo
- Si hay duda, mejor NO aplicar (YAGNI)

---

### Rollback Plan

```bash
git reset --hard HEAD
git checkout develop
git branch -D feature/TASK-ARCH-006-separar-capas
npm run build
npm test
```

---

### Fase 4: Documentación y Governance

---

## TASK-ARCH-007: Documentación y Governance

**Prioridad:** 🟡 Media  
**Duración estimada:** 5-7 días  
**Complejidad:** Baja-Media  
**Dependencias:** TASK-ARCH-001 a TASK-ARCH-006 completadas

### Objetivo

Crear documentación arquitectural, ADRs, guías de contribución y configurar governance para mantener calidad arquitectural en el tiempo.

### Entregables

1. **ADRs (Architecture Decision Records)**
2. **Guía de Contribución**
3. **Documentación de Arquitectura**
4. **Setup de CI/CD para validación arquitectural**
5. **Code Review Guidelines**

### Pasos de Implementación

#### Paso 1: Crear ADRs

**Estructura de ADRs:**

```
docs/architecture/decisions/
├── 0001-adopt-feature-based-modules.md
├── 0002-layered-architecture-criteria.md
├── 0003-repository-pattern.md
├── 0004-cqrs-for-complex-operations.md
└── template.md
```

**Crear:** `docs/architecture/decisions/template.md`

```markdown
# ADR-XXXX: [Título]

**Fecha:** YYYY-MM-DD  
**Estado:** [Propuesto | Aceptado | Rechazado | Deprecado | Reemplazado por ADR-YYYY]  
**Contexto:** [Equipo, Módulo, Feature]

## Contexto

[Describir el problema o situación que requiere decisión]

## Decisión

[Describir la decisión tomada]

## Alternativas Consideradas

1. **Opción A:** [Descripción]

   - ✅ Pro 1
   - ❌ Contra 1

2. **Opción B:** [Descripción]
   - ✅ Pro 1
   - ❌ Contra 1

## Consecuencias

### Positivas

- [Beneficio 1]
- [Beneficio 2]

### Negativas

- [Trade-off 1]
- [Trade-off 2]

## Implementación

[Pasos para implementar o referencia a TASK]

## Referencias

- [Link 1]
- [Link 2]
```

---

**Crear:** `docs/architecture/decisions/0001-adopt-feature-based-modules.md`

```markdown
# ADR-0001: Adoptar Feature-Based Modules con Capas Internas

**Fecha:** 2025-11-10  
**Estado:** Aceptado  
**Contexto:** Refactorización arquitectural del backend Tarot

## Contexto

El proyecto necesita balance entre cohesión de negocio y separación técnica para escalar a marketplace enterprise.

## Decisión

Adoptar enfoque **híbrido**:

- Feature-based a nivel módulo (estilo NestJS)
- Layered (domain/application/infrastructure) dentro de módulos complejos

## Alternativas Consideradas

1. **NestJS puro flat** - Rechazada (no escala)
2. **Clean Architecture pura** - Rechazada (over-engineering para MVP)
3. **Híbrido** - **ACEPTADA**

## Consecuencias

### Positivas

- Cohesión de negocio por feature
- Separación técnica en módulos complejos
- Fácil navegar Y fácil testear

### Negativas

- Requiere criterio para decidir cuándo aplicar capas
- Convivencia temporal de estilos

## Implementación

Ver TASK-ARCH-001 a TASK-ARCH-006

## Referencias

- ARQUITECTURA_ANALISIS.md
- PLAN_REFACTORIZACION.md
```

---

#### Paso 2: Crear Guía de Contribución

**Crear:** `CONTRIBUTING.md`

```markdown
# Guía de Contribución - Tarot Backend

## Arquitectura

Este proyecto usa **arquitectura híbrida** NestJS:

- Feature-based modules
- Layered architecture en módulos complejos

### Criterio para Capas

Aplicar capas (domain/application/infrastructure) SI:

- ✅ Módulo >10 archivos .ts
- ✅ Módulo >1000 líneas código
- ✅ Lógica de negocio compleja

Mantener flat SI:

- ❌ Módulo <5 archivos
- ❌ <500 líneas código
- ❌ Simple CRUD

## Convenciones de Código

### Naming

- **Entities:** `{Entity}.entity.ts` (PascalCase)
- **Services:** `{feature}.service.ts` (kebab-case)
- **Controllers:** `{feature}.controller.ts` (kebab-case)
- **DTOs:** `{action}-{entity}.dto.ts` (kebab-case)
- **Interfaces:** `I{Name}.ts` o `{name}.interface.ts`

### Estructura de Carpetas

**Módulo con capas:**
```

module/
├── domain/
│ ├── interfaces/
│ └── entities/
├── application/
│ ├── services/
│ ├── use-cases/ (si usa CQRS)
│ └── dto/
├── infrastructure/
│ ├── repositories/
│ ├── controllers/
│ └── entities/
└── module.module.ts

```

**Módulo flat:**
```

module/
├── entities/
├── dto/
├── module.service.ts
├── module.controller.ts
└── module.module.ts

````

## Tests

### Coverage Mínimo

- **Unit tests:** 80%
- **Integration tests:** 60%
- **E2E tests:** Endpoints críticos

### Naming de Tests

```typescript
describe('FeatureService', () => {
  describe('methodName', () => {
    it('should do X when Y', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
````

## Code Review

### Checklist de PR

- [ ] Build pasa (`npm run build`)
- [ ] Tests pasan (`npm test`)
- [ ] Coverage >= actual (`npm run test:cov`)
- [ ] Linter pasa (`npm run lint`)
- [ ] Commits siguen [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] ADR creado si decisión arquitectural
- [ ] Documentación actualizada

## Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(module): agregar funcionalidad X
fix(module): corregir bug Y
refactor(arch): aplicar patrón Z
docs(adr): documentar decisión W
test(module): agregar tests para Q
```

## Crear Nuevo Módulo

1. Evaluar si necesita capas (criterio arriba)
2. Crear estructura de carpetas
3. Implementar repository pattern si >200 líneas
4. Agregar tests (>=80% coverage)
5. Documentar en README del módulo
6. Actualizar AppModule
7. Crear PR con checklist completo

````

---

#### Paso 3: Setup CI/CD para Validación Arquitectural

**Crear:** `.github/workflows/architecture-validation.yml`

```yaml
name: Architecture Validation

on:
  pull_request:
    branches: [develop, main]

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: cd backend/tarot-app && npm ci

      - name: Build
        run: cd backend/tarot-app && npm run build

      - name: Run tests
        run: cd backend/tarot-app && npm test

      - name: Check coverage
        run: |
          cd backend/tarot-app
          npm run test:cov
          # Verificar que coverage no baje
          # TODO: Implementar comparación con main

      - name: Lint
        run: cd backend/tarot-app && npm run lint

      - name: Validate module structure
        run: |
          cd backend/tarot-app
          # Script para validar que módulos complejos tengan capas
          node scripts/validate-architecture.js

      - name: Check for circular dependencies
        run: |
          cd backend/tarot-app
          npm install -g madge
          madge --circular --extensions ts src/
````

**Crear:** `backend/tarot-app/scripts/validate-architecture.js`

```javascript
const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, '../src/modules');
const THRESHOLD_FILES = 10;
const THRESHOLD_LINES = 1000;

function countFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let count = 0;

  files.forEach((file) => {
    if (file.isDirectory()) {
      count += countFiles(path.join(dir, file.name));
    } else if (file.name.endsWith('.ts') && !file.name.endsWith('.spec.ts')) {
      count++;
    }
  });

  return count;
}

function hasLayeredStructure(dir) {
  const contents = fs.readdirSync(dir);
  return (
    contents.includes('domain') &&
    contents.includes('application') &&
    contents.includes('infrastructure')
  );
}

function validateModules() {
  const modules = fs.readdirSync(MODULES_DIR, { withFileTypes: true });

  modules.forEach((module) => {
    if (!module.isDirectory()) return;

    const modulePath = path.join(MODULES_DIR, module.name);
    const fileCount = countFiles(modulePath);

    console.log(`\nValidating ${module.name}:`);
    console.log(`  Files: ${fileCount}`);

    if (fileCount >= THRESHOLD_FILES) {
      const hasLayers = hasLayeredStructure(modulePath);

      if (!hasLayers) {
        console.error(
          `  ❌ Module ${module.name} has ${fileCount} files but NO layered structure!`,
        );
        process.exit(1);
      } else {
        console.log(`  ✅ Layered structure present`);
      }
    } else {
      console.log(`  ℹ️ Below threshold, flat structure OK`);
    }
  });

  console.log('\n✅ Architecture validation passed!');
}

validateModules();
```

---

#### Paso 4: Documentar Arquitectura Final

**Crear:** `docs/ARCHITECTURE.md`

```markdown
# Arquitectura - Tarot Backend

## Visión General

Backend del marketplace de tarotistas construido con NestJS, aplicando arquitectura **híbrida feature-based con capas internas**.

## Principios Arquitecturales

1. **Feature-based Modules:** Cohesión de negocio por dominio
2. **Layered (cuando aplica):** Separación domain/application/infrastructure
3. **Repository Pattern:** Abstracción de acceso a datos
4. **CQRS (selectivo):** Para operaciones complejas (readings, interpretations)
5. **Event-Driven:** Eventos de dominio para desacoplar módulos

## Estructura de Módulos

### Módulos con Capas (Complejos)

- `cache/` - Gestión de caché de interpretaciones
- `ai/` - Integración con proveedores de IA
- `readings/` - Lecturas de tarot (CQRS aplicado)
- `tarotistas/` - Marketplace de tarotistas

### Módulos Flat (Simples)

- `cards/` - Cartas del tarot (CRUD)
- `decks/` - Mazos (CRUD)
- `categories/` - Categorías (CRUD)
- `interpretations/` - Simplificado después de extracción

## Patrones Aplicados

### Repository Pattern

Todos los módulos complejos usan:

- `I{Entity}Repository` (domain/interfaces)
- `TypeOrm{Entity}Repository` (infrastructure/repositories)

### CQRS

Módulos con operaciones complejas:

- `readings/` - Separación Commands/Queries/Events
- `interpretations/` - (futuro)

### Dependency Injection

- Services inyectan **interfaces**, no implementaciones
- Configuración en módulos con `provide/useClass`

## Testing

- **Unit:** 80% coverage mínimo
- **Integration:** 60% coverage
- **E2E:** Endpoints críticos

## CI/CD

- Validación automática de estructura
- Coverage no puede bajar
- Build debe pasar
- Linter debe pasar

## Referencias

- [ADRs](./architecture/decisions/)
- [Guía de Contribución](../CONTRIBUTING.md)
- [Plan de Refactorización](./PLAN_REFACTORIZACION.md)
```

---

#### Paso 5: Commit y Push

```bash
git add .

git commit -m "docs(arch): TASK-ARCH-007 - Documentación y Governance

- Crear ADRs (0001-0004)
- Crear CONTRIBUTING.md con convenciones
- Setup CI/CD para validación arquitectural
- Crear scripts/validate-architecture.js
- Documentar arquitectura final en ARCHITECTURE.md
- Configurar GitHub Actions para PRs"

git push origin feature/TASK-ARCH-007-documentacion-governance
```

---

### Criterios de Aceptación

**✅ Checklist:**

- [ ] ADRs creados (mínimo 4)
- [ ] CONTRIBUTING.md creado
- [ ] ARCHITECTURE.md creado
- [ ] CI/CD configurado (GitHub Actions)
- [ ] Script de validación arquitectural funcionando
- [ ] Code review guidelines documentadas
- [ ] Commits siguen Conventional Commits
- [ ] Documentación en README actualizada

---

### Rollback Plan

```bash
git reset --hard HEAD
git checkout develop
git branch -D feature/TASK-ARCH-007-documentacion-governance
```

---

## 6. Validación Continua

### Checklist General (Ejecutar después de CADA task)

**✅ Build exitoso:**

```bash
cd backend/tarot-app
npm run build
```

**✅ Tests pasando:**

```bash
npm test
npm run test:cov
```

**Coverage esperado:**

- Unit: >= 80%
- Integration: >= 60%
- E2E: Endpoints críticos cubiertos

**✅ Linter OK:**

```bash
npm run lint
```

**✅ Aplicación inicia:**

```bash
npm run start:dev
# Verificar logs sin errores
# Probar endpoints con Postman/Insomnia
```

**✅ Base de datos:**

```bash
npm run migration:run
# Verificar migraciones aplicadas
```

**✅ Tests E2E:**

```bash
npm run test:e2e
# Verificar flujos críticos funcionan
```

---

### Validación Post-Refactorización Completa

**Después de completar TODAS las tasks (ARCH-001 a ARCH-007):**

#### 1. Validación de Estructura

```bash
# Verificar estructura de carpetas
tree -L 4 src/modules/

# Ejecutar script de validación
node scripts/validate-architecture.js
```

**Verificar manualmente:**

- [ ] Módulos complejos tienen domain/application/infrastructure
- [ ] Módulos simples mantienen estructura flat
- [ ] No hay carpetas vacías
- [ ] Nombres de archivos siguen convención

---

#### 2. Validación de Build y Tests

```bash
# Clean build
rm -rf dist/
npm run build

# Full test suite
npm test -- --coverage

# E2E tests
npm run test:e2e
```

**Métricas esperadas:**

- Build time: <60 segundos
- Test time: <120 segundos
- Coverage unit: >=80%
- Coverage integration: >=60%
- E2E: 0 fallos

---

#### 3. Validación de Dependencias Circulares

```bash
npm install -g madge

# Verificar dependencias circulares
madge --circular --extensions ts src/

# Generar gráfico de dependencias
madge --image deps-graph.svg --extensions ts src/
```

**Resultado esperado:**

- ❌ 0 dependencias circulares detectadas

---

#### 4. Validación de Imports

```bash
# Verificar que no hay imports absolutos innecesarios
grep -r "from 'src/" src/ || echo "OK"

# Verificar imports relativos correctos
grep -r "from '../../../" src/ | wc -l
# Si >20 imports con más de 3 niveles, considerar path aliases
```

---

#### 5. Validación de Inyección de Dependencias

**Verificar manualmente en código:**

```typescript
// ❌ MAL - Inyectar implementación directa
constructor(
  @InjectRepository(User)
  private userRepo: Repository<User>,
) {}

// ✅ BIEN - Inyectar interfaz
constructor(
  @Inject('IUserRepository')
  private userRepo: IUserRepository,
) {}
```

**Buscar anti-patrones:**

```bash
grep -r "@InjectRepository" src/modules/*/application/
# Debería retornar 0 resultados (solo en infrastructure)
```

---

#### 6. Validación de Tests

**Verificar coverage por módulo:**

```bash
npm run test:cov

# Ver reporte HTML
open coverage/lcov-report/index.html
```

**Verificar que cada módulo crítico tiene:**

- [ ] Unit tests para services
- [ ] Integration tests para repositories
- [ ] E2E tests para controllers

---

#### 7. Validación de Documentación

**Verificar existencia:**

- [ ] `ARCHITECTURE.md` existe
- [ ] `CONTRIBUTING.md` existe
- [ ] `docs/architecture/decisions/` tiene ADRs
- [ ] Cada módulo complejo tiene `README.md`

**Verificar contenido:**

```bash
# Verificar que ADRs siguen template
ls docs/architecture/decisions/*.md | wc -l
# Debe haber al menos 4 ADRs
```

---

#### 8. Validación de Performance

**Benchmark endpoints críticos:**

```bash
# Instalar autocannon
npm install -g autocannon

# Benchmark crear lectura
autocannon -c 10 -d 30 http://localhost:3000/api/readings \
  -m POST \
  -H "Content-Type: application/json" \
  -b '{"spreadId":1,"userId":1}'

# Benchmark listar lecturas
autocannon -c 10 -d 30 http://localhost:3000/api/readings
```

**Métricas esperadas:**

- Latencia p95: <500ms
- Throughput: >100 req/s

---

#### 9. Validación de Marketplace Features

**Tests críticos para marketplace:**

```bash
# Test tarotistas personalizados
npm run test:e2e -- tarotistas.e2e-spec.ts

# Test interpretaciones con IA custom
npm run test:e2e -- ai-custom.e2e-spec.ts
```

**Verificar manualmente:**

- [ ] Tarotistas pueden configurar modelos de IA
- [ ] Prompts personalizados funcionan
- [ ] Configuración de tarjetas custom funciona

---

#### 10. Validación de Rollback

**Verificar que cada task tiene rollback plan:**

```bash
grep -c "Rollback Plan" docs/PLAN_REFACTORIZACION.md
# Debe retornar >= 7 (una por task)
```

**Probar rollback de última task:**

```bash
git log --oneline | head -n 1
git reset --hard HEAD~1
npm run build
npm test
# Si pasa, rollback funciona ✅
git reset --hard HEAD@{1}  # Volver al estado actual
```

---

### Checklist Final de Aceptación

**Ejecutar cuando todas las tasks estén completas:**

#### Arquitectura

- [ ] Módulos complejos usan domain/application/infrastructure
- [ ] Módulos simples usan estructura flat
- [ ] Repository pattern aplicado en todos los módulos complejos
- [ ] CQRS aplicado en readings
- [ ] 0 dependencias circulares
- [ ] Inyección de dependencias usa interfaces

#### Código

- [ ] Build exitoso (<60s)
- [ ] 0 errores de linter
- [ ] Coverage unit >=80%
- [ ] Coverage integration >=60%
- [ ] Tests E2E pasan (endpoints críticos)
- [ ] No hay imports absolutos desde src/
- [ ] No hay anti-patrones en inyección

#### Documentación

- [ ] ARCHITECTURE.md creado
- [ ] CONTRIBUTING.md creado
- [ ] ADRs creados (mínimo 4)
- [ ] Cada módulo complejo tiene README.md
- [ ] CI/CD configurado

#### Performance

- [ ] Latencia p95 <500ms
- [ ] Throughput >100 req/s
- [ ] Sin degradación vs baseline pre-refactorización

#### Marketplace

- [ ] Tarotistas personalizados funcionan
- [ ] Prompts custom funcionan
- [ ] Configuración de IA custom funciona
- [ ] Tests E2E marketplace pasan

#### Governance

- [ ] Scripts de validación automática creados
- [ ] GitHub Actions configurado
- [ ] Rollback plans documentados
- [ ] Convenciones de código documentadas

---

## 7. Troubleshooting General

### Errores Comunes Durante Refactorización

#### 1. Error: Circular Dependency Detected

**Síntomas:**

```
Error: Nest cannot create the InterpretationsModule instance.
The module at index [2] of the InterpretationsModule "imports" array is undefined.

Potential causes:
- A circular dependency between modules.
```

**Causas:**

- Módulo A importa módulo B que importa módulo A

**Solución:**

```typescript
// ❌ MAL
@Module({
  imports: [CacheModule], // CacheModule importa InterpretationsModule
})
export class InterpretationsModule {}

// ✅ BIEN - Usar forwardRef
@Module({
  imports: [forwardRef(() => CacheModule)],
})
export class InterpretationsModule {}
```

**Validar:**

```bash
madge --circular --extensions ts src/
```

---

#### 2. Error: Cannot find module after moving files

**Síntomas:**

```
Error: Cannot find module '../services/cache.service'
```

**Causas:**

- Imports no actualizados después de mover archivos

**Solución:**

```bash
# Buscar imports rotos
npm run build 2>&1 | grep "Cannot find module"

# Actualizar imports manualmente o con find/replace
# VS Code: Cmd+Shift+H (Mac) / Ctrl+Shift+H (Windows)
```

**Prevención:**

- Usar auto-import de VS Code
- Configurar path aliases en tsconfig.json:

```json
{
  "compilerOptions": {
    "paths": {
      "@modules/*": ["src/modules/*"],
      "@common/*": ["src/common/*"]
    }
  }
}
```

---

#### 3. Error: Provider not found

**Síntomas:**

```
Error: Nest can't resolve dependencies of the ReadingsService (?).
Please make sure that the argument IReadingRepository at index [0] is available in the ReadingsModule context.
```

**Causas:**

- Repository no registrado en módulo
- Token de inyección incorrecto

**Solución:**

```typescript
// Verificar que está en providers del módulo
@Module({
  providers: [
    ReadingsService,
    {
      provide: 'IReadingRepository',  // ← Token debe coincidir
      useClass: TypeOrmReadingRepository,
    },
  ],
})

// Verificar inyección en service
constructor(
  @Inject('IReadingRepository')  // ← Token debe coincidir
  private readingRepo: IReadingRepository,
) {}
```

---

#### 4. Tests fallan después de refactorización

**Síntomas:**

```
TypeError: Cannot read property 'findOne' of undefined
```

**Causas:**

- Mocks no actualizados para usar interfaces
- Providers no configurados en TestingModule

**Solución:**

```typescript
// Actualizar test para usar mock de interfaz
const mockReadingRepo: IReadingRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  // ... implementar todos los métodos de la interfaz
};

const module: TestingModule = await Test.createTestingModule({
  providers: [
    ReadingsService,
    {
      provide: 'IReadingRepository',
      useValue: mockReadingRepo,
    },
  ],
}).compile();
```

---

#### 5. Build tarda demasiado después de refactorización

**Síntomas:**

- `npm run build` tarda >120 segundos

**Causas:**

- Demasiadas re-exports
- Barrel files (index.ts) anidados
- Dependencias circulares sutiles

**Solución:**

```bash
# Identificar archivos con muchos imports
madge --summary --extensions ts src/

# Eliminar barrel files problemáticos
rm src/modules/*/index.ts

# Importar directamente desde archivos
```

**Optimización:**

```typescript
// ❌ MAL - Barrel file con todo
export * from './services';
export * from './controllers';
export * from './entities';

// ✅ BIEN - Exports selectivos
export { ReadingsService } from './services/readings.service';
export { ReadingsController } from './controllers/readings.controller';
```

---

#### 6. Coverage baja después de refactorización

**Síntomas:**

- Coverage cae de 80% a 60%

**Causas:**

- Tests no movidos con archivos
- Paths en tests no actualizados
- Nuevos archivos sin tests

**Solución:**

```bash
# Identificar archivos sin tests
npm run test:cov
open coverage/lcov-report/index.html

# Buscar archivos .service.ts sin .spec.ts
find src/ -name "*.service.ts" ! -name "*.spec.ts" -exec test ! -f {}.spec.ts \; -print
```

**Crear tests faltantes:**

```bash
# Generar spec file con NestJS CLI
nest g service modules/cache/application/services/cache --no-spec=false
```

---

#### 7. E2E tests fallan

**Síntomas:**

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Causas:**

- Base de datos de test no iniciada
- Migraciones no ejecutadas en test DB

**Solución:**

```bash
# Iniciar DB de test
docker-compose -f docker-compose.test.yml up -d

# Ejecutar migraciones
NODE_ENV=test npm run migration:run

# Ejecutar tests
npm run test:e2e
```

**Prevención:**

```javascript
// test/jest-e2e.json
{
  "globalSetup": "./test/setup.ts",
  "globalTeardown": "./test/teardown.ts"
}

// test/setup.ts
import { exec } from 'child_process';
export default async () => {
  await exec('docker-compose -f docker-compose.test.yml up -d');
  await exec('NODE_ENV=test npm run migration:run');
};
```

---

#### 8. TypeORM entities no encontradas

**Síntomas:**

```
EntityMetadataNotFound: No metadata for "Reading" was found.
```

**Causas:**

- Entities no registradas en TypeOrmModule.forFeature()
- Path de entities movido

**Solución:**

```typescript
// Verificar que están en module
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reading,           // ← Debe estar aquí
      Interpretation,
    ]),
  ],
})

// Verificar path en app.module.ts
TypeOrmModule.forRoot({
  entities: ['dist/**/*.entity.js'],  // ← Verificar que compila
})
```

**Validar:**

```bash
# Ver entities compiladas
ls -R dist/ | grep entity.js
```

---

#### 9. Hot reload no funciona después de refactorización

**Síntomas:**

- Cambios en código no se reflejan en servidor

**Causas:**

- Webpack watch no detecta nuevas carpetas

**Solución:**

```bash
# Reiniciar servidor dev
npm run start:dev

# Si persiste, limpiar cache
rm -rf dist/
npm run start:dev
```

---

#### 10. Git merge conflicts masivos

**Síntomas:**

- > 50 archivos en conflicto al mergear

**Causas:**

- Branch muy desactualizado
- Múltiples personas moviendo archivos

**Solución:**

```bash
# Estrategia 1: Rebase incremental
git fetch origin develop
git rebase -i origin/develop

# Estrategia 2: Mergear en pequeños pasos
git merge origin/develop --no-commit
git checkout --theirs package.json  # Resolver conflicts críticos primero
git add package.json
git merge --continue

# Estrategia 3: Recrear branch (último recurso)
git checkout develop
git pull
git checkout -b feature/TASK-ARCH-001-v2
# Re-aplicar cambios manualmente
```

**Prevención:**

- Mergear develop a feature branch frecuentemente (cada 2-3 días)
- Coordinar refactorizaciones con equipo
- Usar feature flags para cambios grandes

---

### Comandos Útiles para Debugging

```bash
# Ver estructura de módulo
tree -L 3 src/modules/cache/

# Buscar TODOs pendientes
grep -r "TODO" src/

# Ver imports de un archivo
grep "^import" src/modules/readings/application/services/readings.service.ts

# Contar líneas de código
find src/ -name "*.ts" ! -name "*.spec.ts" | xargs wc -l

# Ver dependencias de un módulo
madge --depends ReadingsModule --extensions ts src/

# Ver archivos modificados en task
git diff --name-only origin/develop

# Ver estadísticas de cambios
git diff --stat origin/develop
```

---

## 8. Apéndices

### Apéndice A: Comandos de Referencia Rápida

#### Gestión de Base de Datos

```bash
# Crear migración
npm run migration:create -- -n MigrationName

# Ejecutar migraciones
npm run migration:run

# Revertir última migración
npm run migration:revert

# Ver migraciones pendientes
npm run migration:show

# Limpiar DB desarrollo
npm run db:dev:clean

# Reset DB desarrollo
npm run db:dev:reset

# Limpiar DB e2e
npm run db:e2e:clean

# Reset DB e2e
npm run db:e2e:reset
```

---

#### Tests y Coverage

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con coverage
npm run test:cov

# Ejecutar tests en watch mode
npm run test:watch

# Ejecutar tests E2E
npm run test:e2e

# Ejecutar tests de un archivo específico
npm test -- readings.service.spec.ts

# Ver reporte HTML de coverage
open coverage/lcov-report/index.html
```

---

#### Build y Desarrollo

```bash
# Compilar
npm run build

# Modo desarrollo (hot reload)
npm run start:dev

# Modo producción
npm run start:prod

# Linter
npm run lint

# Fix linter automático
npm run lint:fix

# Format con Prettier
npm run format
```

---

#### Docker

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Parar servicios
docker-compose down

# Rebuild y reiniciar
docker-compose up -d --build

# Limpiar volúmenes
docker-compose down -v
```

---

#### Git Workflow

```bash
# Crear feature branch
git checkout -b feature/TASK-ARCH-001-extraer-cache

# Commits frecuentes
git add .
git commit -m "refactor(cache): mover entities a infrastructure"

# Push a remote
git push origin feature/TASK-ARCH-001-extraer-cache

# Mergear develop a feature (mantener actualizado)
git fetch origin develop
git merge origin/develop

# Squash commits antes de PR
git rebase -i HEAD~5
```

---

#### NestJS CLI

```bash
# Generar módulo
nest g module modules/feature

# Generar service
nest g service modules/feature

# Generar controller
nest g controller modules/feature

# Generar todo junto
nest g resource modules/feature

# Generar clase
nest g class modules/feature/dto/create-feature

# Generar interfaz
nest g interface modules/feature/domain/interfaces/feature-repository
```

---

### Apéndice B: Estructura de Carpetas Completa

```
backend/tarot-app/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   │
│   ├── common/                          # Utilidades compartidas
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── utils/
│   │
│   ├── config/                          # Configuración
│   │   ├── database.config.ts
│   │   ├── auth.config.ts
│   │   └── app.config.ts
│   │
│   ├── database/                        # Migraciones y seeders
│   │   ├── migrations/
│   │   └── seeds/
│   │
│   └── modules/                         # Módulos de negocio
│       │
│       ├── cache/                       # ✅ CON CAPAS (TASK-ARCH-001)
│       │   ├── domain/
│       │   │   ├── interfaces/
│       │   │   │   └── cache-repository.interface.ts
│       │   │   └── entities/
│       │   │       └── cached-interpretation.entity.ts
│       │   ├── application/
│       │   │   └── services/
│       │   │       ├── interpretation-cache.service.ts
│       │   │       └── cache-cleanup.service.ts
│       │   ├── infrastructure/
│       │   │   ├── repositories/
│       │   │   │   └── typeorm-cache.repository.ts
│       │   │   ├── controllers/
│       │   │   │   └── cache-admin.controller.ts
│       │   │   └── entities/
│       │   │       └── cached-interpretation.entity.ts
│       │   └── cache.module.ts
│       │
│       ├── ai/                          # ✅ CON CAPAS (TASK-ARCH-002)
│       │   ├── domain/
│       │   │   ├── interfaces/
│       │   │   │   └── ai-provider.interface.ts
│       │   │   └── types/
│       │   │       └── ai-types.ts
│       │   ├── application/
│       │   │   └── services/
│       │   │       ├── ai-provider.service.ts
│       │   │       └── prompt-builder.service.ts
│       │   ├── infrastructure/
│       │   │   ├── providers/
│       │   │   │   ├── groq-provider.service.ts
│       │   │   │   ├── deepseek-provider.service.ts
│       │   │   │   └── openai-provider.service.ts
│       │   │   ├── prompts/
│       │   │   │   └── tarot-prompts.ts
│       │   │   └── utils/
│       │   │       ├── ai-errors.ts
│       │   │       ├── ai-token-calculator.ts
│       │   │       └── ai-retry-handler.ts
│       │   └── ai.module.ts
│       │
│       ├── readings/                    # ✅ CON CAPAS + CQRS (TASK-ARCH-003 + 005)
│       │   ├── domain/
│       │   │   ├── interfaces/
│       │   │   │   └── reading-repository.interface.ts
│       │   │   └── entities/
│       │   │       └── reading.entity.ts
│       │   ├── application/
│       │   │   ├── use-cases/
│       │   │   │   ├── create-reading.use-case.ts
│       │   │   │   ├── list-readings.use-case.ts
│       │   │   │   ├── share-reading.use-case.ts
│       │   │   │   └── regenerate-reading.use-case.ts
│       │   │   ├── commands/
│       │   │   │   ├── create-reading.command.ts
│       │   │   │   ├── regenerate-reading.command.ts
│       │   │   │   └── handlers/
│       │   │   │       ├── create-reading.handler.ts
│       │   │   │       └── regenerate-reading.handler.ts
│       │   │   ├── queries/
│       │   │   │   ├── get-reading.query.ts
│       │   │   │   ├── list-readings.query.ts
│       │   │   │   └── handlers/
│       │   │   │       ├── get-reading.handler.ts
│       │   │   │       └── list-readings.handler.ts
│       │   │   ├── events/
│       │   │   │   ├── reading-created.event.ts
│       │   │   │   └── handlers/
│       │   │   │       └── reading-created.handler.ts
│       │   │   ├── services/
│       │   │   │   ├── readings-orchestrator.service.ts
│       │   │   │   ├── reading-validator.service.ts
│       │   │   │   └── reading-share.service.ts
│       │   │   └── dto/
│       │   │       ├── create-reading.dto.ts
│       │   │       └── list-readings.dto.ts
│       │   ├── infrastructure/
│       │   │   ├── repositories/
│       │   │   │   └── typeorm-reading.repository.ts
│       │   │   ├── controllers/
│       │   │   │   └── readings.controller.ts
│       │   │   └── entities/
│       │   │       └── reading.entity.ts
│       │   └── readings.module.ts
│       │
│       ├── interpretations/             # ❌ SIN CAPAS (simplificado)
│       │   ├── entities/
│       │   │   └── tarot-interpretation.entity.ts
│       │   ├── dto/
│       │   │   └── generate-interpretation.dto.ts
│       │   ├── interpretations.service.ts
│       │   ├── interpretations.controller.ts
│       │   └── interpretations.module.ts
│       │
│       ├── tarotistas/                  # ⚖️ EVALUAR (marketplace critical)
│       │   ├── entities/
│       │   │   ├── tarotista.entity.ts
│       │   │   ├── tarotista-config.entity.ts
│       │   │   └── tarotista-card-meaning.entity.ts
│       │   ├── dto/
│       │   ├── tarotistas.service.ts
│       │   ├── tarotistas.controller.ts
│       │   └── tarotistas.module.ts
│       │
│       ├── spreads/                     # ❌ SIN CAPAS (simple CRUD)
│       │   ├── entities/
│       │   ├── dto/
│       │   ├── spreads.service.ts
│       │   ├── spreads.controller.ts
│       │   └── spreads.module.ts
│       │
│       ├── cards/                       # ❌ SIN CAPAS (simple CRUD)
│       │   ├── entities/
│       │   ├── dto/
│       │   ├── cards.service.ts
│       │   ├── cards.controller.ts
│       │   └── cards.module.ts
│       │
│       └── [otros módulos simples...]
│
├── test/                                # Tests E2E
│   ├── app.e2e-spec.ts
│   ├── readings.e2e-spec.ts
│   ├── cache-admin.e2e-spec.ts
│   └── ...
│
├── docs/                                # Documentación
│   ├── ARCHITECTURE.md
│   ├── PLAN_REFACTORIZACION.md
│   ├── architecture/
│   │   └── decisions/
│   │       ├── 0001-adopt-feature-based-modules.md
│   │       ├── 0002-layered-architecture-criteria.md
│   │       ├── 0003-repository-pattern.md
│   │       └── 0004-cqrs-for-complex-operations.md
│   └── [otros docs...]
│
├── scripts/                             # Scripts de automatización
│   ├── validate-architecture.js
│   ├── db-dev-clean.sh
│   ├── db-e2e-reset.sh
│   └── ...
│
├── .github/
│   └── workflows/
│       └── architecture-validation.yml
│
├── CONTRIBUTING.md
├── package.json
├── tsconfig.json
├── nest-cli.json
├── docker-compose.yml
└── README.md
```

---

### Apéndice C: Glosario

**ADR (Architecture Decision Record):** Documento que registra una decisión arquitectural significativa, contexto, alternativas y consecuencias.

**CQRS (Command Query Responsibility Segregation):** Patrón que separa operaciones de lectura (queries) de operaciones de escritura (commands).

**DDD (Domain-Driven Design):** Enfoque de diseño de software centrado en el dominio de negocio, con entidades, value objects, agregados, etc.

**DTOs (Data Transfer Objects):** Objetos simples usados para transferir datos entre capas, sin lógica de negocio.

**Dependency Injection (DI):** Patrón de diseño donde las dependencias se inyectan en lugar de crearse internamente.

**Feature-based Modules:** Organización de código por funcionalidades de negocio (readings, tarotistas) en lugar de capas técnicas.

**Hybrid Architecture:** Combinación de feature-based modules (NestJS) con layered architecture (Clean Architecture) dentro de módulos complejos.

**Layered Architecture:** Separación del código en capas (domain, application, infrastructure) con dependencias unidireccionales.

**Repository Pattern:** Abstracción que encapsula lógica de acceso a datos, permitiendo cambiar ORM sin afectar lógica de negocio.

**Use Case:** Clase que representa una acción de negocio específica (ej: CreateReading, ShareReading).

**Entity:** Objeto con identidad única que persiste en base de datos (ej: Reading, Tarotista).

**Value Object:** Objeto sin identidad, definido por sus atributos (ej: Money, Email).

**Aggregate:** Conjunto de entidades tratadas como unidad (ej: Reading + Cards).

**Domain Events:** Eventos que representan algo significativo que ocurrió en el dominio (ej: ReadingCreated).

---

### Apéndice D: Referencias Externas

#### Documentación Oficial

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CQRS Pattern by Martin Fowler](https://martinfowler.com/bliki/CQRS.html)

#### Artículos Recomendados

- [Feature-based vs Layered in NestJS](https://trilon.io/blog/feature-based-architecture-in-nestjs)
- [Repository Pattern in TypeScript](https://khalilstemmler.com/articles/typescript-domain-driven-design/repository-dto-mapper/)
- [CQRS with NestJS](https://docs.nestjs.com/recipes/cqrs)
- [Architectural Decision Records](https://adr.github.io/)

#### Herramientas

- [Madge](https://github.com/pahen/madge) - Visualizar dependencias y detectar ciclos
- [Jest](https://jestjs.io/) - Testing framework
- [ESLint](https://eslint.org/) - Linter
- [Prettier](https://prettier.io/) - Code formatter

---

## 9. Conclusión

Este plan de refactorización transforma el backend de una aplicación monolítica a una **arquitectura híbrida enterprise-ready**, balanceando:

✅ **Cohesión de negocio** (feature-based modules)  
✅ **Separación de responsabilidades** (layered architecture)  
✅ **Testabilidad** (repository pattern, DI)  
✅ **Escalabilidad** (CQRS, eventos)  
✅ **Mantenibilidad** (documentación, ADRs, CI/CD)

### Métricas de Éxito

**Antes:**

- Servicios de 700+ líneas
- Tests dispersos (37% coverage)
- Acoplamiento fuerte
- Sin documentación arquitectural

**Después:**

- Servicios <200 líneas
- Coverage >=80%
- Módulos desacoplados
- Documentación completa (ADRs, ARCHITECTURE.md, CONTRIBUTING.md)
- CI/CD con validación automática

### Próximos Pasos

1. **Ejecutar tasks en orden:** ARCH-001 → ARCH-007
2. **Validar continuamente:** Build + Tests después de cada task
3. **Documentar decisiones:** Crear ADRs cuando surjan dudas
4. **Mantener comunicación:** Daily standups durante refactorización
5. **Celebrar wins:** Pequeños PRs, feedback continuo

---

**¡Éxito en la refactorización! 🚀**
