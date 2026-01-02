# Implementación de Tracking Anónimo - Guía Técnica

Este documento contiene los ejemplos de código para implementar el tracking de usuarios anónimos según la estrategia definida en el backlog (TASK-002).

---

## 1. Entity: AnonymousUsage

**Archivo:** `backend/tarot-app/src/modules/usage-limits/entities/anonymous-usage.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { UsageFeature } from '../enums/usage-feature.enum';

@Entity('anonymous_usage')
@Index(['fingerprint', 'date', 'feature']) // Index compuesto para búsquedas rápidas
export class AnonymousUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64 })
  fingerprint: string; // SHA-256 hash de IP + User Agent

  @Column({ length: 45 })
  ip: string; // Guardado para auditoría/investigación de abuso

  @Column({ type: 'date' })
  date: Date; // Solo fecha (sin hora) para reseteo diario

  @Column({
    type: 'enum',
    enum: UsageFeature,
  })
  feature: UsageFeature; // DAILY_CARD

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## 2. Migration: Crear Tabla anonymous_usage

**Archivo:** `backend/tarot-app/src/database/migrations/YYYYMMDDHHMMSS-create-anonymous-usage-table.ts`

```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAnonymousUsageTable1234567890123
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'anonymous_usage',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'fingerprint',
            type: 'varchar',
            length: '64',
          },
          {
            name: 'ip',
            type: 'varchar',
            length: '45', // IPv6 puede tener hasta 45 caracteres
          },
          {
            name: 'date',
            type: 'date',
          },
          {
            name: 'feature',
            type: 'enum',
            enum: ['TAROT_READING', 'DAILY_CARD', 'AI_INTERPRETATION'],
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Crear índice compuesto para búsquedas rápidas
    await queryRunner.createIndex(
      'anonymous_usage',
      new TableIndex({
        name: 'IDX_ANONYMOUS_FINGERPRINT_DATE_FEATURE',
        columnNames: ['fingerprint', 'date', 'feature'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'anonymous_usage',
      'IDX_ANONYMOUS_FINGERPRINT_DATE_FEATURE',
    );
    await queryRunner.dropTable('anonymous_usage');
  }
}
```

---

## 3. Service: AnonymousTrackingService

**Archivo:** `backend/tarot-app/src/modules/usage-limits/services/anonymous-tracking.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { createHash } from 'crypto';
import { AnonymousUsage } from '../entities/anonymous-usage.entity';
import { UsageFeature } from '../enums/usage-feature.enum';

@Injectable()
export class AnonymousTrackingService {
  constructor(
    @InjectRepository(AnonymousUsage)
    private readonly anonymousUsageRepo: Repository<AnonymousUsage>,
  ) {}

  /**
   * Genera fingerprint único basado en IP + User Agent
   * @param ip - Dirección IP del request
   * @param userAgent - User Agent del navegador
   * @returns Hash SHA-256 de 64 caracteres
   */
  private generateFingerprint(ip: string, userAgent: string): string {
    const data = `${ip}:${userAgent}`;
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Obtiene la fecha actual solo con día (sin hora)
   * @returns Date object con hora 00:00:00
   */
  private getTodayDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Verifica si un usuario anónimo puede acceder a una feature
   * @param req - Request de Express
   * @param feature - Feature a verificar (ej: DAILY_CARD)
   * @returns true si puede acceder, false si ya alcanzó el límite
   */
  async canAccess(req: Request, feature: UsageFeature): Promise<boolean> {
    const fingerprint = this.generateFingerprint(
      req.ip,
      req.headers['user-agent'] || 'unknown',
    );

    const today = this.getTodayDate();

    const usage = await this.anonymousUsageRepo.findOne({
      where: {
        fingerprint,
        date: today,
        feature,
      },
    });

    return !usage; // Si no existe registro, puede acceder
  }

  /**
   * Registra el uso de una feature por usuario anónimo
   * @param req - Request de Express
   * @param feature - Feature utilizada
   */
  async recordUsage(req: Request, feature: UsageFeature): Promise<void> {
    const fingerprint = this.generateFingerprint(
      req.ip,
      req.headers['user-agent'] || 'unknown',
    );

    const today = this.getTodayDate();

    await this.anonymousUsageRepo.save({
      fingerprint,
      ip: req.ip,
      date: today,
      feature,
    });
  }

  /**
   * Obtiene el conteo de usos de un usuario anónimo en el día actual
   * @param req - Request de Express
   * @param feature - Feature a consultar
   * @returns Número de veces que usó la feature hoy
   */
  async getUsageCount(req: Request, feature: UsageFeature): Promise<number> {
    const fingerprint = this.generateFingerprint(
      req.ip,
      req.headers['user-agent'] || 'unknown',
    );

    const today = this.getTodayDate();

    return await this.anonymousUsageRepo.count({
      where: {
        fingerprint,
        date: today,
        feature,
      },
    });
  }

  /**
   * Limpia registros antiguos (más de 30 días)
   * Útil para ejecutar como cron job
   */
  async cleanOldRecords(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.anonymousUsageRepo
      .createQueryBuilder()
      .delete()
      .where('date < :date', { date: thirtyDaysAgo })
      .execute();

    return result.affected || 0;
  }
}
```

---

## 4. Modificar CheckUsageLimitGuard

**Archivo:** `backend/tarot-app/src/modules/usage-limits/guards/check-usage-limit.guard.ts`

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsageLimitsService } from '../usage-limits.service';
import { AnonymousTrackingService } from '../services/anonymous-tracking.service';
import { UsageFeature } from '../enums/usage-feature.enum';
import { USAGE_FEATURE_KEY } from '../decorators/usage-feature.decorator';

@Injectable()
export class CheckUsageLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usageLimitsService: UsageLimitsService,
    private readonly anonymousTrackingService: AnonymousTrackingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get<UsageFeature>(
      USAGE_FEATURE_KEY,
      context.getHandler(),
    );

    if (!feature) {
      return true; // Si no hay feature definida, permitir acceso
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Puede ser undefined si es usuario anónimo

    // CASO 1: Usuario autenticado
    if (user && user.id) {
      const canAccess = await this.usageLimitsService.canAccess(
        user.id,
        feature,
      );

      if (!canAccess) {
        throw new ForbiddenException(
          'Has alcanzado tu límite diario para esta función. Mejora tu plan para continuar.',
        );
      }

      return true;
    }

    // CASO 2: Usuario anónimo
    const canAccessAnonymous = await this.anonymousTrackingService.canAccess(
      request,
      feature,
    );

    if (!canAccessAnonymous) {
      throw new ForbiddenException(
        'Ya viste tu carta del día. Regístrate para acceder a más lecturas.',
      );
    }

    return true;
  }
}
```

---

## 5. Modificar IncrementUsageInterceptor

**Archivo:** `backend/tarot-app/src/modules/usage-limits/interceptors/increment-usage.interceptor.ts`

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UsageLimitsService } from '../usage-limits.service';
import { AnonymousTrackingService } from '../services/anonymous-tracking.service';
import { UsageFeature } from '../enums/usage-feature.enum';
import { USAGE_FEATURE_KEY } from '../decorators/usage-feature.decorator';

@Injectable()
export class IncrementUsageInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly usageLimitsService: UsageLimitsService,
    private readonly anonymousTrackingService: AnonymousTrackingService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const feature = this.reflector.get<UsageFeature>(
      USAGE_FEATURE_KEY,
      context.getHandler(),
    );

    if (!feature) {
      return next.handle(); // Si no hay feature, no incrementar
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      tap(async () => {
        // CASO 1: Usuario autenticado
        if (user && user.id) {
          await this.usageLimitsService.incrementUsage(user.id, feature);
        }
        // CASO 2: Usuario anónimo
        else {
          await this.anonymousTrackingService.recordUsage(request, feature);
        }
      }),
    );
  }
}
```

---

## 6. Actualizar Module

**Archivo:** `backend/tarot-app/src/modules/usage-limits/usage-limits.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageLimitsService } from './usage-limits.service';
import { AnonymousTrackingService } from './services/anonymous-tracking.service';
import { UsageLimit } from './entities/usage-limit.entity';
import { AnonymousUsage } from './entities/anonymous-usage.entity';
import { CheckUsageLimitGuard } from './guards/check-usage-limit.guard';
import { IncrementUsageInterceptor } from './interceptors/increment-usage.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([UsageLimit, AnonymousUsage])],
  providers: [
    UsageLimitsService,
    AnonymousTrackingService,
    CheckUsageLimitGuard,
    IncrementUsageInterceptor,
  ],
  exports: [
    UsageLimitsService,
    AnonymousTrackingService,
    CheckUsageLimitGuard,
    IncrementUsageInterceptor,
  ],
})
export class UsageLimitsModule {}
```

---

## 7. Uso en DailyReadingController

**Archivo:** `backend/tarot-app/src/modules/tarot/daily-reading/daily-reading.controller.ts`

```typescript
import {
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { DailyReadingService } from './daily-reading.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CheckUsageLimitGuard } from '../../usage-limits/guards/check-usage-limit.guard';
import { IncrementUsageInterceptor } from '../../usage-limits/interceptors/increment-usage.interceptor';
import { UsageFeature } from '../../usage-limits/decorators/usage-feature.decorator';
import { UsageFeature as UsageFeatureEnum } from '../../usage-limits/enums/usage-feature.enum';

@Controller('daily-reading')
export class DailyReadingController {
  constructor(private readonly dailyReadingService: DailyReadingService) {}

  /**
   * Endpoint PÚBLICO para carta del día (usuarios anónimos)
   */
  @Get('public/today')
  @UseGuards(CheckUsageLimitGuard)
  @UseInterceptors(IncrementUsageInterceptor)
  @UsageFeature(UsageFeatureEnum.DAILY_CARD)
  async getTodayCardPublic(@Request() req) {
    // req.user será undefined para usuarios anónimos
    return this.dailyReadingService.getTodayCard(null, false); // null = anónimo, false = sin IA
  }

  /**
   * Endpoint PROTEGIDO para carta del día (usuarios autenticados)
   */
  @Get('today')
  @UseGuards(JwtAuthGuard, CheckUsageLimitGuard)
  @UseInterceptors(IncrementUsageInterceptor)
  @UsageFeature(UsageFeatureEnum.DAILY_CARD)
  async getTodayCard(@Request() req) {
    const userId = req.user.id;
    const userPlan = req.user.plan; // FREE, PREMIUM
    const useAI = userPlan === 'PREMIUM'; // Solo PREMIUM usa IA

    return this.dailyReadingService.getTodayCard(userId, useAI);
  }
}
```

---

## 8. Cron Job para Limpieza de Registros Antiguos (Opcional)

**Archivo:** `backend/tarot-app/src/modules/usage-limits/tasks/cleanup-anonymous-usage.task.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnonymousTrackingService } from '../services/anonymous-tracking.service';

@Injectable()
export class CleanupAnonymousUsageTask {
  private readonly logger = new Logger(CleanupAnonymousUsageTask.name);

  constructor(
    private readonly anonymousTrackingService: AnonymousTrackingService,
  ) {}

  /**
   * Ejecuta limpieza de registros antiguos cada día a las 3 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCleanup() {
    this.logger.log('Iniciando limpieza de registros anónimos antiguos...');

    const deletedCount =
      await this.anonymousTrackingService.cleanOldRecords();

    this.logger.log(
      `Limpieza completada: ${deletedCount} registros eliminados.`,
    );
  }
}
```

---

## 9. Testing

**Archivo:** `backend/tarot-app/src/modules/usage-limits/services/anonymous-tracking.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnonymousTrackingService } from './anonymous-tracking.service';
import { AnonymousUsage } from '../entities/anonymous-usage.entity';
import { UsageFeature } from '../enums/usage-feature.enum';
import { Request } from 'express';

describe('AnonymousTrackingService', () => {
  let service: AnonymousTrackingService;
  let repository: Repository<AnonymousUsage>;

  const mockRequest = {
    ip: '192.168.1.1',
    headers: {
      'user-agent': 'Mozilla/5.0 (Test Browser)',
    },
  } as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnonymousTrackingService,
        {
          provide: getRepositoryToken(AnonymousUsage),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AnonymousTrackingService>(AnonymousTrackingService);
    repository = module.get<Repository<AnonymousUsage>>(
      getRepositoryToken(AnonymousUsage),
    );
  });

  describe('canAccess', () => {
    it('debe retornar true si no hay uso previo', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.canAccess(
        mockRequest,
        UsageFeature.DAILY_CARD,
      );

      expect(result).toBe(true);
    });

    it('debe retornar false si ya usó la feature hoy', async () => {
      const mockUsage = {
        id: 1,
        fingerprint: 'test-fingerprint',
        ip: '192.168.1.1',
        date: new Date(),
        feature: UsageFeature.DAILY_CARD,
      } as AnonymousUsage;

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUsage);

      const result = await service.canAccess(
        mockRequest,
        UsageFeature.DAILY_CARD,
      );

      expect(result).toBe(false);
    });
  });

  describe('recordUsage', () => {
    it('debe registrar el uso correctamente', async () => {
      jest.spyOn(repository, 'save').mockResolvedValue({} as AnonymousUsage);

      await service.recordUsage(mockRequest, UsageFeature.DAILY_CARD);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ip: '192.168.1.1',
          feature: UsageFeature.DAILY_CARD,
        }),
      );
    });
  });
});
```

---

## Notas de Implementación

### Seguridad

1. **IP Spoofing:** El sistema guarda la IP real del request. Si usas proxy/load balancer, asegúrate de configurar `trust proxy` en Express.

```typescript
// backend/tarot-app/src/main.ts
app.set('trust proxy', true);
```

2. **Fingerprint Collision:** La probabilidad de colisión SHA-256 es extremadamente baja, pero si dos usuarios diferentes tienen misma IP + User Agent, compartirán límite (comportamiento aceptado).

### Performance

1. **Índice de DB:** El índice compuesto `[fingerprint, date, feature]` optimiza las búsquedas.

2. **Limpieza automática:** El cron job elimina registros antiguos (>30 días) para mantener la tabla pequeña.

### Privacidad

1. **Datos guardados:** Solo guardamos hash del fingerprint + IP. No guardamos cookies ni información personal.

2. **GDPR:** Los registros anónimos NO están vinculados a usuarios identificables, pero es recomendable mencionar en Privacy Policy que se rastrea IP para prevenir abuso.

---

## Comandos para Ejecutar

### 1. Crear y ejecutar migration:

```bash
cd backend/tarot-app
npm run migration:generate -- src/database/migrations/CreateAnonymousUsageTable
npm run migration:run
```

### 2. Testing:

```bash
npm run test -- anonymous-tracking.service.spec.ts
```

### 3. Verificar en DB:

```sql
-- Ver registros de usuarios anónimos del día
SELECT * FROM anonymous_usage
WHERE date = CURDATE();

-- Contar usos por fingerprint
SELECT fingerprint, COUNT(*) as count
FROM anonymous_usage
WHERE date = CURDATE()
GROUP BY fingerprint;
```

---

## Próximos Pasos

Después de implementar TASK-002, continuar con:

1. **TASK-003:** Modificar frontend para manejar límites y mostrar mensajes de conversión
2. **TASK-009:** Crear landing page con comparativa de planes
3. **TASK-010:** Implementar onboarding post-registro

---

**Documento creado:** 2026-01-02
**Última actualización:** 2026-01-02
