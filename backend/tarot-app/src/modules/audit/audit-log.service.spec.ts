import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditLogService } from './audit-log.service';
import { AuditLog } from './entities/audit-log.entity';
import { AuditAction } from './enums/audit-action.enum';
import { Between } from 'typeorm';

describe('AuditLogService', () => {
  let service: AuditLogService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      const logData = {
        userId: 1,
        targetUserId: 2,
        action: AuditAction.USER_BANNED,
        entityType: 'User',
        entityId: '2',
        oldValue: { status: 'active' },
        newValue: { status: 'banned', reason: 'Violation' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      const savedLog = { id: 'uuid-123', ...logData, createdAt: new Date() };
      mockRepository.create.mockReturnValue(logData);
      mockRepository.save.mockResolvedValue(savedLog);

      const result = await service.log(logData);

      expect(mockRepository.create).toHaveBeenCalledWith(logData);
      expect(mockRepository.save).toHaveBeenCalledWith(logData);
      expect(result).toEqual(savedLog);
      expect(result.action).toBe(AuditAction.USER_BANNED);
    });

    it('should create log without targetUserId for config changes', async () => {
      const logData = {
        userId: 1,
        action: AuditAction.CONFIG_CHANGED,
        entityType: 'System',
        entityId: 'config-1',
        oldValue: { setting: 'old' },
        newValue: { setting: 'new' },
      };

      const savedLog = { id: 'uuid-456', ...logData, createdAt: new Date() };
      mockRepository.create.mockReturnValue(logData);
      mockRepository.save.mockResolvedValue(savedLog);

      const result = await service.log(logData);

      expect(result.targetUserId).toBeUndefined();
      expect(result.action).toBe(AuditAction.CONFIG_CHANGED);
    });

    it('should create log without oldValue for creation actions', async () => {
      const logData = {
        userId: 1,
        action: AuditAction.USER_CREATED,
        entityType: 'User',
        entityId: '10',
        newValue: { email: 'newuser@example.com' },
      };

      const savedLog = { id: 'uuid-789', ...logData, createdAt: new Date() };
      mockRepository.create.mockReturnValue(logData);
      mockRepository.save.mockResolvedValue(savedLog);

      const result = await service.log(logData);

      expect(result.oldValue).toBeUndefined();
      expect(result.newValue).toBeDefined();
    });

    it('should handle role change actions', async () => {
      const logData = {
        userId: 1,
        targetUserId: 5,
        action: AuditAction.ROLE_ADDED,
        entityType: 'User',
        entityId: '5',
        oldValue: { roles: ['consumer'] },
        newValue: { roles: ['consumer', 'admin'] },
      };

      const savedLog = { id: 'uuid-abc', ...logData, createdAt: new Date() };
      mockRepository.create.mockReturnValue(logData);
      mockRepository.save.mockResolvedValue(savedLog);

      const result = await service.log(logData);

      expect(result.action).toBe(AuditAction.ROLE_ADDED);
      expect(result.targetUserId).toBe(5);
    });
  });

  describe('findAll', () => {
    it('should return paginated audit logs', async () => {
      const mockLogs = [
        {
          id: 'uuid-1',
          userId: 1,
          action: AuditAction.USER_BANNED,
          entityType: 'User',
          entityId: '2',
          newValue: {},
          createdAt: new Date(),
        },
        {
          id: 'uuid-2',
          userId: 1,
          action: AuditAction.PLAN_CHANGED,
          entityType: 'User',
          entityId: '3',
          newValue: {},
          createdAt: new Date(),
        },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockLogs, 2]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.logs).toEqual(mockLogs);
      expect(result.meta).toEqual({
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: 2,
        totalPages: 1,
      });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ['user', 'targetUser'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should filter by userId', async () => {
      const mockLogs = [
        {
          id: 'uuid-1',
          userId: 5,
          action: AuditAction.USER_BANNED,
          entityType: 'User',
          entityId: '2',
          newValue: {},
          createdAt: new Date(),
        },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockLogs, 1]);

      await service.findAll({ userId: 5, page: 1, limit: 20 });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 5 },
        relations: ['user', 'targetUser'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should filter by action', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        action: AuditAction.PLAN_CHANGED,
        page: 1,
        limit: 20,
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { action: AuditAction.PLAN_CHANGED },
        relations: ['user', 'targetUser'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should filter by entityType', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ entityType: 'Reading', page: 1, limit: 20 });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { entityType: 'Reading' },
        relations: ['user', 'targetUser'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should filter by date range (both dates)', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      const startDate = '2025-01-01T00:00:00Z';
      const endDate = '2025-12-31T23:59:59Z';

      await service.findAll({ startDate, endDate, page: 1, limit: 20 });

      const expectedWhere = { createdAt: expect.anything() };
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: expectedWhere,
        relations: ['user', 'targetUser'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should filter by startDate only (logs after date)', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      const startDate = '2025-01-01T00:00:00Z';

      await service.findAll({ startDate, page: 1, limit: 20 });

      const expectedWhere = { createdAt: expect.anything() };
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: expectedWhere,
        relations: ['user', 'targetUser'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should filter by endDate only (logs before date)', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      const endDate = '2025-12-31T23:59:59Z';

      await service.findAll({ endDate, page: 1, limit: 20 });

      const expectedWhere = { createdAt: expect.anything() };
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: expectedWhere,
        relations: ['user', 'targetUser'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should handle pagination correctly', async () => {
      const mockLogs = Array(50)
        .fill(null)
        .map((_, i) => ({
          id: `uuid-${i}`,
          userId: 1,
          action: AuditAction.USER_BANNED,
          entityType: 'User',
          entityId: `${i}`,
          newValue: {},
          createdAt: new Date(),
        }));

      mockRepository.findAndCount.mockResolvedValue([mockLogs.slice(40), 50]);

      const result = await service.findAll({ page: 3, limit: 20 });

      expect(result.meta).toEqual({
        currentPage: 3,
        itemsPerPage: 20,
        totalItems: 50,
        totalPages: 3,
      });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 40,
          take: 20,
        }),
      );
    });

    it('should apply multiple filters simultaneously', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        userId: 1,
        action: AuditAction.ROLE_ADDED,
        entityType: 'User',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        page: 1,
        limit: 50,
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          userId: 1,
          action: AuditAction.ROLE_ADDED,
          entityType: 'User',
          createdAt: Between(new Date('2025-01-01'), new Date('2025-01-31')),
        },
        relations: ['user', 'targetUser'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 50,
      });
    });
  });
});
