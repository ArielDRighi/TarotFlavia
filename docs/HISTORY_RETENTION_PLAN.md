# Plan de Implementacion: Sistema de Historial con Politica de Retencion

**Fecha:** 2026-01-12
**Estado:** Pendiente de implementacion
**Prioridad:** Media

---

## Resumen

Implementar sistema completo de historial de lecturas con:
1. Fix del enlace roto `/lecturas` -> `/historial`
2. Politica de retencion: FREE (30 dias) / PREMIUM (1 ano)
3. Servicio de limpieza automatica (cleanup job nocturno)

---

## Tareas de Implementacion

### TAREA 1: Fix enlace del menu [FRONTEND]

**Archivo:** `frontend/src/components/layout/UserMenu.tsx`
**Linea:** ~70
**Esfuerzo:** Minimo

**Descripcion:**
El menu de usuario tiene un enlace "Mis Lecturas" que apunta a `/lecturas`, pero esa ruta no existe. Cambiar a `/historial` que es la ruta correcta existente.

**Cambio:**
```diff
- <Link href="/lecturas" className="flex items-center">
+ <Link href="/historial" className="flex items-center">
    <BookOpen className="mr-2 size-4" />
    Mis Lecturas
  </Link>
```

**Verificacion:**
- Login -> Click avatar -> "Mis Lecturas" -> Debe ir a `/historial` sin 404

**Riesgo:** Ninguno - la ruta destino ya existe y funciona.

---

### TAREA 2: Crear constantes de retencion [BACKEND]

**Archivo NUEVO:** `backend/tarot-app/src/modules/tarot/readings/readings.constants.ts`
**Esfuerzo:** Bajo

**Descripcion:**
Crear archivo con las constantes que definen los dias de retencion por tipo de plan.

**Codigo:**
```typescript
import { UserPlan } from '../../users/entities/user.entity';

/**
 * Dias de retencion de lecturas de tarot segun el plan del usuario
 * FREE: 30 dias de historial
 * PREMIUM: 365 dias (1 ano) de historial
 * ANONYMOUS: No tienen historial persistente
 */
export const READING_RETENTION_DAYS: Record<UserPlan, number> = {
  [UserPlan.ANONYMOUS]: 0,
  [UserPlan.FREE]: 30,
  [UserPlan.PREMIUM]: 365,
};

/**
 * Dias de gracia para lecturas soft-deleted antes de hard-delete permanente
 */
export const SOFT_DELETE_GRACE_PERIOD_DAYS = 30;

/**
 * Dias de retencion de cartas del dia segun el plan
 */
export const DAILY_READING_RETENTION_DAYS: Record<UserPlan, number> = {
  [UserPlan.ANONYMOUS]: 1,
  [UserPlan.FREE]: 30,
  [UserPlan.PREMIUM]: 365,
};
```

**Riesgo:** Ninguno - archivo nuevo, no modifica codigo existente.

---

### TAREA 3: Extender interface del repository [BACKEND]

**Archivo:** `backend/tarot-app/src/modules/tarot/readings/domain/interfaces/reading-repository.interface.ts`
**Esfuerzo:** Bajo

**Descripcion:**
Agregar firma del metodo `archiveOldReadings` a la interface del repository.

**Cambio:**
Agregar al final de la interface `IReadingRepository`:

```typescript
/**
 * Archiva (soft-delete) lecturas que exceden el periodo de retencion
 * @param userPlan Plan del usuario
 * @param retentionDays Dias de retencion para ese plan
 * @returns Numero de lecturas archivadas
 */
archiveOldReadings(userPlan: UserPlan, retentionDays: number): Promise<number>;
```

**Dependencias:** Importar `UserPlan` del modulo users.

**Riesgo:** Bajo - agregar metodo a interface requiere implementacion en TAREA 4.

---

### TAREA 4: Implementar metodo en TypeORM repository [BACKEND]

**Archivo:** `backend/tarot-app/src/modules/tarot/readings/infrastructure/repositories/typeorm-reading.repository.ts`
**Esfuerzo:** Medio

**Descripcion:**
Implementar el metodo `archiveOldReadings` que busca lecturas antiguas por plan de usuario y las soft-delete.

**Codigo a agregar:**
```typescript
async archiveOldReadings(userPlan: UserPlan, retentionDays: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  // Buscar lecturas antiguas de usuarios con el plan especificado
  const result = await this.readingRepo
    .createQueryBuilder('reading')
    .leftJoin('reading.user', 'user')
    .where('user.plan = :userPlan', { userPlan })
    .andWhere('reading.createdAt < :cutoffDate', { cutoffDate })
    .andWhere('reading.deletedAt IS NULL')
    .getMany();

  if (result.length === 0) {
    return 0;
  }

  // Soft-delete las lecturas antiguas
  const ids = result.map(r => r.id);
  await this.readingRepo.softDelete(ids);

  return ids.length;
}
```

**Dependencias:** Importar `UserPlan`.

**Riesgo:** Bajo - metodo nuevo, no modifica logica existente.

---

### TAREA 5: Agregar metodo al orchestrator service [BACKEND]

**Archivo:** `backend/tarot-app/src/modules/tarot/readings/application/services/readings-orchestrator.service.ts`
**Esfuerzo:** Bajo

**Descripcion:**
Exponer el metodo de archivado desde el orchestrator para que el cleanup service pueda usarlo.

**Codigo a agregar:**
```typescript
/**
 * Archiva lecturas antiguas segun politica de retencion
 */
async archiveOldReadings(userPlan: UserPlan, retentionDays: number): Promise<number> {
  return this.readingRepository.archiveOldReadings(userPlan, retentionDays);
}

/**
 * Obtiene estadisticas de retencion para monitoreo
 */
async getRetentionStats(): Promise<{
  totalReadings: number;
  trashedReadings: number;
  freeUsersReadings: number;
  premiumUsersReadings: number;
}> {
  // TODO: Implementar queries de estadisticas
  return {
    totalReadings: 0,
    trashedReadings: 0,
    freeUsersReadings: 0,
    premiumUsersReadings: 0,
  };
}
```

**Riesgo:** Bajo - metodos nuevos.

---

### TAREA 6: Modificar ReadingsCleanupService [BACKEND]

**Archivo:** `backend/tarot-app/src/modules/tarot/readings/readings-cleanup.service.ts`
**Esfuerzo:** Medio

**Descripcion:**
Extender el cron job existente para incluir la logica de retencion por plan.

**Codigo modificado:**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReadingsOrchestratorService } from './application/services/readings-orchestrator.service';
import { UserPlan } from '../users/entities/user.entity';
import { READING_RETENTION_DAYS } from './readings.constants';

@Injectable()
export class ReadingsCleanupService {
  private readonly logger = new Logger(ReadingsCleanupService.name);

  constructor(private readonly orchestrator: ReadingsOrchestratorService) {}

  /**
   * Ejecuta limpieza de lecturas segun politica de retencion
   * Se ejecuta diariamente a las 4 AM UTC
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async runDailyCleanup() {
    this.logger.log('Starting daily readings cleanup...');

    try {
      // 1. Hard-delete lecturas soft-deleted hace mas de 30 dias
      const hardDeleted = await this.orchestrator.cleanupOldDeletedReadings();
      this.logger.log(`Hard-deleted ${hardDeleted} readings from trash`);

      // 2. Archivar lecturas antiguas de usuarios FREE (30 dias)
      const archivedFree = await this.orchestrator.archiveOldReadings(
        UserPlan.FREE,
        READING_RETENTION_DAYS[UserPlan.FREE]
      );
      this.logger.log(`Archived ${archivedFree} old readings from FREE users`);

      // 3. Archivar lecturas antiguas de usuarios PREMIUM (1 ano)
      const archivedPremium = await this.orchestrator.archiveOldReadings(
        UserPlan.PREMIUM,
        READING_RETENTION_DAYS[UserPlan.PREMIUM]
      );
      this.logger.log(`Archived ${archivedPremium} old readings from PREMIUM users`);

      this.logger.log('Daily readings cleanup completed successfully');
    } catch (error) {
      this.logger.error('Error during readings cleanup:', error);
    }
  }
}
```

**Riesgo:** Bajo - extiende funcionalidad existente, no reemplaza.

---

### TAREA 7: Crear DailyReadingCleanupService [BACKEND]

**Archivo NUEVO:** `backend/tarot-app/src/modules/tarot/daily-reading/daily-reading-cleanup.service.ts`
**Esfuerzo:** Medio

**Descripcion:**
Crear servicio de limpieza para las cartas del dia con la misma politica de retencion.

**Codigo:**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { DailyReading } from './entities/daily-reading.entity';
import { UserPlan } from '../../users/entities/user.entity';
import { DAILY_READING_RETENTION_DAYS } from '../readings/readings.constants';

@Injectable()
export class DailyReadingCleanupService {
  private readonly logger = new Logger(DailyReadingCleanupService.name);

  constructor(
    @InjectRepository(DailyReading)
    private readonly dailyReadingRepo: Repository<DailyReading>,
  ) {}

  /**
   * Limpia cartas del dia antiguas segun politica de retencion
   * Se ejecuta diariamente a las 5 AM UTC (despues de readings cleanup)
   */
  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async cleanupOldDailyReadings() {
    this.logger.log('Starting daily readings retention cleanup...');

    try {
      // 1. Limpiar lecturas de usuarios anonimos (solo mantener las del dia)
      const anonymousDeleted = await this.cleanupAnonymous();
      this.logger.log(`Deleted ${anonymousDeleted} old anonymous daily readings`);

      // 2. Limpiar lecturas de usuarios FREE (30 dias)
      const freeDeleted = await this.cleanupByUserPlan(
        UserPlan.FREE,
        DAILY_READING_RETENTION_DAYS[UserPlan.FREE]
      );
      this.logger.log(`Deleted ${freeDeleted} old FREE user daily readings`);

      // 3. Limpiar lecturas de usuarios PREMIUM (1 ano)
      const premiumDeleted = await this.cleanupByUserPlan(
        UserPlan.PREMIUM,
        DAILY_READING_RETENTION_DAYS[UserPlan.PREMIUM]
      );
      this.logger.log(`Deleted ${premiumDeleted} old PREMIUM user daily readings`);

      this.logger.log('Daily readings retention cleanup completed');
    } catch (error) {
      this.logger.error('Error during daily readings cleanup:', error);
    }
  }

  private async cleanupAnonymous(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 1);

    const result = await this.dailyReadingRepo.delete({
      userId: null,
      readingDate: LessThan(cutoffDate),
    });

    return result.affected || 0;
  }

  private async cleanupByUserPlan(plan: UserPlan, retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.dailyReadingRepo
      .createQueryBuilder('daily')
      .leftJoin('daily.user', 'user')
      .delete()
      .where('user.plan = :plan', { plan })
      .andWhere('daily.readingDate < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
```

**Riesgo:** Ninguno - servicio nuevo, no modifica codigo existente.

---

### TAREA 8: Registrar servicio en modulo [BACKEND]

**Archivo:** `backend/tarot-app/src/modules/tarot/daily-reading/daily-reading.module.ts`
**Esfuerzo:** Minimo

**Descripcion:**
Registrar el nuevo `DailyReadingCleanupService` en el array de providers del modulo.

**Cambio:**
```typescript
import { DailyReadingCleanupService } from './daily-reading-cleanup.service';

@Module({
  // ...imports existentes
  providers: [
    // ...providers existentes
    DailyReadingCleanupService,
  ],
  // ...exports existentes
})
export class DailyReadingModule {}
```

**Riesgo:** Ninguno - solo registra provider adicional.

---

## Resumen de Tareas

| # | Tarea | Capa | Archivo | Tipo | Riesgo |
|---|-------|------|---------|------|--------|
| 1 | Fix enlace menu | FRONTEND | `UserMenu.tsx` | Modificar | Ninguno |
| 2 | Constantes de retencion | BACKEND | `readings.constants.ts` | Crear | Ninguno |
| 3 | Extender interface | BACKEND | `reading-repository.interface.ts` | Modificar | Bajo |
| 4 | Implementar en repository | BACKEND | `typeorm-reading.repository.ts` | Modificar | Bajo |
| 5 | Agregar al orchestrator | BACKEND | `readings-orchestrator.service.ts` | Modificar | Bajo |
| 6 | Modificar cleanup service | BACKEND | `readings-cleanup.service.ts` | Modificar | Bajo |
| 7 | Crear daily cleanup | BACKEND | `daily-reading-cleanup.service.ts` | Crear | Ninguno |
| 8 | Registrar en modulo | BACKEND | `daily-reading.module.ts` | Modificar | Ninguno |

---

## Orden de Ejecucion Recomendado

```
TAREA 1 (Frontend) -----> Puede hacerse independiente
                |
                v
TAREA 2 (Backend) -----> Base para las siguientes
                |
                v
TAREA 3 (Backend) -----> Interface primero
                |
                v
TAREA 4 (Backend) -----> Implementacion del repository
                |
                v
TAREA 5 (Backend) -----> Orchestrator usa repository
                |
                v
TAREA 6 (Backend) -----> Cleanup usa orchestrator
                |
                v
TAREA 7 (Backend) -----> Daily cleanup independiente (usa constantes)
                |
                v
TAREA 8 (Backend) -----> Registrar al final
```

---

## Verificacion Post-Implementacion

### Tests Manuales

1. **TAREA 1:** Navegar Menu -> "Mis Lecturas" -> Debe ir a `/historial`
2. **TAREA 6-7:** Revisar logs del backend a las 4-5 AM UTC o ejecutar manualmente
3. **Integracion:** Crear lectura mock antigua y verificar que se archiva

### Tests Automatizados Sugeridos

```typescript
describe('Readings Retention Policy', () => {
  it('should archive FREE user readings older than 30 days');
  it('should archive PREMIUM user readings older than 365 days');
  it('should hard-delete soft-deleted readings older than 30 days');
  it('should NOT archive readings within retention period');
});
```

---

## Analisis de Impacto

### Funcionalidades que NO se modifican:

- Endpoints de API existentes
- Entidades de base de datos (sin migraciones)
- Flujo de crear/ver/eliminar lecturas
- Autenticacion y autorizacion
- Sistema de suscripciones
- Componentes de frontend (excepto enlace)

### Backward Compatibility

100% compatible - todos los cambios son aditivos o correcciones de bugs.
