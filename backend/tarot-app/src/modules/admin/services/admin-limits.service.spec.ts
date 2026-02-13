import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminLimitsService } from './admin-limits.service';
import { SystemConfig } from '../entities/system-config.entity';
import { AuditLogService } from '../../audit/audit-log.service';
import { AuditAction } from '../../audit/enums/audit-action.enum';
import { UserPlan } from '../../users/entities/user.entity';
import { UsageFeature } from '../../usage-limits/entities/usage-limit.entity';
import { UpdateBirthChartLimitsDto } from '../dto/usage-limits.dto';

describe('AdminLimitsService', () => {
  let service: AdminLimitsService;
  let configRepository: jest.Mocked<Repository<SystemConfig>>;
  let auditLogService: jest.Mocked<AuditLogService>;

  const mockConfigRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockAuditLogService = {
    log: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminLimitsService,
        {
          provide: getRepositoryToken(SystemConfig),
          useValue: mockConfigRepository,
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
      ],
    }).compile();

    service = module.get<AdminLimitsService>(AdminLimitsService);
    configRepository = module.get(getRepositoryToken(SystemConfig));
    auditLogService = module.get(AuditLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should load limits from database on init', async () => {
      const mockConfigs: SystemConfig[] = [
        {
          id: 1,
          category: 'usage_limits',
          key: UsageFeature.BIRTH_CHART,
          value: JSON.stringify({
            [UserPlan.ANONYMOUS]: 1,
            [UserPlan.FREE]: 3,
            [UserPlan.PREMIUM]: 5,
          }),
          description: null,
          updatedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      configRepository.find.mockResolvedValue(mockConfigs);

      await service.onModuleInit();

      expect(configRepository.find).toHaveBeenCalledWith({
        where: { category: 'usage_limits' },
      });
    });

    it('should handle errors during initialization', async () => {
      configRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.onModuleInit()).resolves.not.toThrow();
    });
  });

  describe('getLimit', () => {
    it('should return override limit if exists', () => {
      // Set up override
      service['limitsOverrides'].set(UsageFeature.BIRTH_CHART, {
        [UserPlan.FREE]: 10,
        [UserPlan.PREMIUM]: 20,
        [UserPlan.ANONYMOUS]: 1,
      });

      const limit = service.getLimit(UsageFeature.BIRTH_CHART, UserPlan.FREE);

      expect(limit).toBe(10);
    });

    it('should return default limit if no override exists', () => {
      const limit = service.getLimit(UsageFeature.BIRTH_CHART, UserPlan.FREE);

      // Default from constants
      expect(limit).toBe(3);
    });

    it('should return 0 for unknown feature', () => {
      const limit = service.getLimit(
        'unknown' as unknown as UsageFeature,
        UserPlan.FREE,
      );

      expect(limit).toBe(0);
    });

    it('should return override for premium plan', () => {
      service['limitsOverrides'].set(UsageFeature.BIRTH_CHART, {
        [UserPlan.FREE]: 10,
        [UserPlan.PREMIUM]: 20,
        [UserPlan.ANONYMOUS]: 1,
      });

      const limit = service.getLimit(
        UsageFeature.BIRTH_CHART,
        UserPlan.PREMIUM,
      );

      expect(limit).toBe(20);
    });
  });

  describe('getBirthChartLimits', () => {
    it('should return current birth chart limits', async () => {
      configRepository.findOne.mockResolvedValue({
        id: 1,
        category: 'usage_limits',
        key: UsageFeature.BIRTH_CHART,
        value: JSON.stringify({
          [UserPlan.FREE]: 3,
          [UserPlan.PREMIUM]: 5,
        }),
        description: null,
        updatedBy: 'admin@auguria.com',
        createdAt: new Date('2026-02-06T12:00:00Z'),
        updatedAt: new Date('2026-02-06T12:00:00Z'),
      } as SystemConfig);

      const result = await service.getBirthChartLimits();

      expect(result).toEqual({
        usageType: UsageFeature.BIRTH_CHART,
        period: 'monthly',
        limits: {
          anonymous: 1,
          free: 3,
          premium: 5,
        },
        updatedAt: expect.any(String),
        updatedBy: 'admin@auguria.com',
      });
    });

    it('should return default limits when no config exists', async () => {
      configRepository.findOne.mockResolvedValue(null);

      const result = await service.getBirthChartLimits();

      expect(result.limits.free).toBe(3); // Default from constants
      expect(result.limits.premium).toBe(5); // Default from constants
    });
  });

  describe('updateBirthChartLimits', () => {
    it('should create new config when none exists', async () => {
      const dto: UpdateBirthChartLimitsDto = {
        freeLimit: 10,
        premiumLimit: 20,
      };

      const newConfig: SystemConfig = {
        id: 1,
        category: 'usage_limits',
        key: UsageFeature.BIRTH_CHART,
        value: JSON.stringify({
          [UserPlan.ANONYMOUS]: 1,
          [UserPlan.FREE]: 10,
          [UserPlan.PREMIUM]: 20,
        }),
        description: `Límites de ${UsageFeature.BIRTH_CHART}`,
        updatedBy: 'admin@auguria.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Setup mocks antes de la llamada
      configRepository.findOne.mockResolvedValue(null); // Default: siempre retorna null
      configRepository.create.mockReturnValue(newConfig);
      configRepository.save.mockResolvedValue(newConfig);

      const result = await service.updateBirthChartLimits(
        dto,
        1,
        'admin@auguria.com',
      );

      // Verificar que create fue llamado (indica que no existía config)
      expect(configRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'usage_limits',
          key: UsageFeature.BIRTH_CHART,
          updatedBy: 'admin@auguria.com',
        }),
      );
      expect(configRepository.save).toHaveBeenCalled();
      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update_usage_limits',
          entityType: 'SystemConfig',
          userId: 1,
        }),
      );
      expect(result.limits.free).toBe(10);
      expect(result.limits.premium).toBe(20);
    });

    it('should update existing config', async () => {
      const dto: UpdateBirthChartLimitsDto = {
        freeLimit: 15,
        premiumLimit: 25,
      };

      const existingConfig: SystemConfig = {
        id: 1,
        category: 'usage_limits',
        key: UsageFeature.BIRTH_CHART,
        value: JSON.stringify({
          [UserPlan.FREE]: 3,
          [UserPlan.PREMIUM]: 5,
        }),
        description: null,
        updatedBy: 'old@auguria.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Setup mocks: findOne retorna existingConfig
      configRepository.findOne.mockResolvedValue(existingConfig);
      configRepository.save.mockResolvedValue(existingConfig); // El save modifica el objeto

      const result = await service.updateBirthChartLimits(
        dto,
        1,
        'admin@auguria.com',
      );

      // Verificar que NO se llamó create (indica que SÍ existía config)
      expect(configRepository.create).not.toHaveBeenCalled();
      // Verificar que se llamó save con el config actualizado
      expect(configRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          value: JSON.stringify({
            [UserPlan.ANONYMOUS]: 1,
            [UserPlan.FREE]: 15,
            [UserPlan.PREMIUM]: 25,
          }),
          updatedBy: 'admin@auguria.com',
        }),
      );
      expect(auditLogService.log).toHaveBeenCalled();
      expect(result.limits.free).toBe(15);
      expect(result.limits.premium).toBe(25);
    });

    it('should always set anonymous limit to 1 (lifetime)', async () => {
      const dto: UpdateBirthChartLimitsDto = {
        freeLimit: 10,
        premiumLimit: 20,
      };

      configRepository.findOne.mockResolvedValue(null);

      const newConfig: SystemConfig = {
        id: 1,
        category: 'usage_limits',
        key: UsageFeature.BIRTH_CHART,
        value: JSON.stringify({
          [UserPlan.ANONYMOUS]: 1,
          [UserPlan.FREE]: 10,
          [UserPlan.PREMIUM]: 20,
        }),
        description: null,
        updatedBy: 'admin@auguria.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      configRepository.create.mockReturnValue(newConfig);
      configRepository.save.mockResolvedValue(newConfig);
      configRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(newConfig);

      const result = await service.updateBirthChartLimits(
        dto,
        1,
        'admin@auguria.com',
      );

      expect(result.limits.anonymous).toBe(1);
    });

    it('should update in-memory cache after save', async () => {
      const dto: UpdateBirthChartLimitsDto = {
        freeLimit: 10,
        premiumLimit: 20,
      };

      configRepository.findOne.mockResolvedValue(null);

      const newConfig: SystemConfig = {
        id: 1,
        category: 'usage_limits',
        key: UsageFeature.BIRTH_CHART,
        value: JSON.stringify({
          [UserPlan.ANONYMOUS]: 1,
          [UserPlan.FREE]: 10,
          [UserPlan.PREMIUM]: 20,
        }),
        description: null,
        updatedBy: 'admin@auguria.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      configRepository.create.mockReturnValue(newConfig);
      configRepository.save.mockResolvedValue(newConfig);
      configRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(newConfig);

      await service.updateBirthChartLimits(dto, 1, 'admin@auguria.com');

      // Verify cache was updated
      const limit = service.getLimit(UsageFeature.BIRTH_CHART, UserPlan.FREE);
      expect(limit).toBe(10);
    });
  });

  describe('getLimitsHistory', () => {
    it('should return audit history for birth chart limits', async () => {
      const mockHistory = [
        {
          id: 1,
          action: 'UPDATE_USAGE_LIMITS',
          entityType: 'SystemConfig',
          userId: 1,
          previousValue: '{"free":3,"premium":5}',
          newValue: '{"free":5,"premium":10}',
          createdAt: new Date(),
        },
      ];

      const mockResponse = {
        logs: mockHistory as unknown as never[],
        meta: {
          currentPage: 1,
          itemsPerPage: 20,
          totalItems: 1,
          totalPages: 1,
        },
      };

      auditLogService.findAll.mockResolvedValue(mockResponse);

      const result = await service.getLimitsHistory();

      expect(auditLogService.findAll).toHaveBeenCalledWith({
        action: AuditAction.UPDATE_USAGE_LIMITS,
        entityType: 'SystemConfig',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return empty logs array when no history exists', async () => {
      const mockResponse = {
        logs: [],
        meta: {
          currentPage: 1,
          itemsPerPage: 20,
          totalItems: 0,
          totalPages: 0,
        },
      };

      auditLogService.findAll.mockResolvedValue(mockResponse);

      const result = await service.getLimitsHistory();

      expect(result).toEqual(mockResponse);
    });
  });
});
