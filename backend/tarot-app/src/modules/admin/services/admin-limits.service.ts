import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../entities/system-config.entity';
import {
  UpdateBirthChartLimitsDto,
  UsageLimitConfigDto,
} from '../dto/usage-limits.dto';
import { AuditLogService } from '../../audit/audit-log.service';
import { AuditAction } from '../../audit/enums/audit-action.enum';
import { USAGE_LIMITS } from '../../usage-limits/usage-limits.constants';
import { UsageFeature } from '../../usage-limits/entities/usage-limit.entity';
import { UserPlan } from '../../users/entities/user.entity';

/**
 * Servicio para administrar límites de uso configurables
 * Gestiona la configuración de límites desde el panel de administración
 */
@Injectable()
export class AdminLimitsService implements OnModuleInit {
  private readonly logger = new Logger(AdminLimitsService.name);

  // Caché en memoria de límites configurables (sobrescribe constantes)
  private limitsOverrides: Map<UsageFeature, Record<UserPlan, number>> =
    new Map();

  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepo: Repository<SystemConfig>,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * Carga límites personalizados desde DB al iniciar el módulo
   */
  async onModuleInit(): Promise<void> {
    try {
      const configs = await this.configRepo.find({
        where: { category: 'usage_limits' },
      });

      for (const config of configs) {
        const usageType = config.key as UsageFeature;
        const limits = JSON.parse(config.value) as Record<UserPlan, number>;
        this.limitsOverrides.set(usageType, limits);
      }

      this.logger.log(
        `Loaded ${this.limitsOverrides.size} custom limit configs from database`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to load limits from DB during initialization:',
        error,
      );
      // No lanzar error para no bloquear el inicio del módulo
    }
  }

  /**
   * Obtiene el límite actual para un tipo de uso y plan
   * Primero verifica overrides de DB, luego fallback a constantes
   */
  getLimit(usageType: UsageFeature, plan: UserPlan): number {
    // Primero verificar overrides desde DB
    const override = this.limitsOverrides.get(usageType);
    if (override && override[plan] !== undefined) {
      return override[plan];
    }

    // Fallback a constantes por defecto
    return USAGE_LIMITS[plan]?.[usageType] ?? 0;
  }

  /**
   * Obtiene la configuración actual de límites de carta astral
   */
  async getBirthChartLimits(): Promise<UsageLimitConfigDto> {
    const usageType = UsageFeature.BIRTH_CHART;
    const updatedBy = await this.getLastUpdatedBy(usageType);

    return {
      usageType,
      period: 'monthly',
      limits: {
        anonymous: this.getLimit(usageType, UserPlan.ANONYMOUS),
        free: this.getLimit(usageType, UserPlan.FREE),
        premium: this.getLimit(usageType, UserPlan.PREMIUM),
      },
      updatedAt: await this.getLastUpdateTime(usageType),
      updatedBy: updatedBy ?? undefined, // Convertir null a undefined
    };
  }

  /**
   * Actualiza los límites de carta astral
   * Los cambios se aplican inmediatamente (caché en memoria) y persisten en DB
   */
  async updateBirthChartLimits(
    dto: UpdateBirthChartLimitsDto,
    adminUserId: number,
    adminEmail: string,
  ): Promise<UsageLimitConfigDto> {
    const usageType = UsageFeature.BIRTH_CHART;

    // Obtener límites actuales
    const currentLimits = await this.getBirthChartLimits();

    // IMPORTANTE: Anonymous siempre es 1 lifetime (no configurable)
    // Si dto.freeLimit o dto.premiumLimit son undefined, mantener valor actual
    const newLimits: Record<UserPlan, number> = {
      [UserPlan.ANONYMOUS]: 1,
      [UserPlan.FREE]: dto.freeLimit ?? currentLimits.limits.free,
      [UserPlan.PREMIUM]: dto.premiumLimit ?? currentLimits.limits.premium,
    };

    // Buscar o crear config en DB
    const configKey = usageType;
    let config = await this.configRepo.findOne({
      where: { category: 'usage_limits', key: configKey },
    });

    const previousValue = config?.value;
    const parsedPreviousValue: Record<string, unknown> | undefined =
      previousValue
        ? (JSON.parse(previousValue) as Record<string, unknown>)
        : undefined;

    if (config) {
      // Actualizar existente
      config.value = JSON.stringify(newLimits);
      config.updatedBy = adminEmail;
    } else {
      // Crear nuevo
      config = this.configRepo.create({
        category: 'usage_limits',
        key: configKey,
        value: JSON.stringify(newLimits),
        updatedBy: adminEmail,
        description: `Límites de ${usageType}`,
      });
    }

    // Guardar en DB
    await this.configRepo.save(config);

    // Actualizar caché en memoria (aplicación inmediata)
    this.limitsOverrides.set(usageType, newLimits);

    // Registrar en audit log
    await this.auditLog.log({
      action: AuditAction.UPDATE_USAGE_LIMITS,
      entityType: 'SystemConfig',
      entityId: config.id.toString(),
      userId: adminUserId,
      oldValue: parsedPreviousValue,
      newValue: newLimits as Record<string, unknown>,
    });

    this.logger.log(
      `Birth chart limits updated by ${adminEmail}: Free=${newLimits[UserPlan.FREE]}, Premium=${newLimits[UserPlan.PREMIUM]}`,
    );

    return this.getBirthChartLimits();
  }

  /**
   * Obtiene el historial de cambios de límites desde el audit log
   */
  async getLimitsHistory(): Promise<unknown[]> {
    const result = await this.auditLog.findAll({
      action: AuditAction.UPDATE_USAGE_LIMITS,
      entityType: 'SystemConfig',
    });

    return result.logs;
  }

  /**
   * Helper: Obtiene la fecha de última actualización de una configuración
   */
  private async getLastUpdateTime(usageType: UsageFeature): Promise<string> {
    const config = await this.configRepo.findOne({
      where: { category: 'usage_limits', key: usageType },
    });
    return config?.updatedAt?.toISOString() || new Date().toISOString();
  }

  /**
   * Helper: Obtiene el email del último admin que actualizó una configuración
   */
  private async getLastUpdatedBy(
    usageType: UsageFeature,
  ): Promise<string | null | undefined> {
    const config = await this.configRepo.findOne({
      where: { category: 'usage_limits', key: usageType },
    });
    return config?.updatedBy;
  }
}
