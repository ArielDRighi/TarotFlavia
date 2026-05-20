import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';
import { AuditAction } from './enums/audit-action.enum';

describe('AuditLogController', () => {
  let controller: AuditLogController;
  let service: AuditLogService;

  const mockService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
      providers: [
        {
          provide: AuditLogService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AuditLogController>(AuditLogController);
    service = module.get<AuditLogService>(AuditLogService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated audit logs using standard {data, meta} contract', async () => {
      const mockResponse = {
        data: [
          {
            id: 'uuid-1',
            userId: 1,
            action: AuditAction.USER_BANNED,
            entityType: 'User',
            entityId: '2',
            newValue: {},
            createdAt: new Date(),
          },
        ],
        meta: {
          page: 1,
          limit: 20,
          totalItems: 1,
          totalPages: 1,
        },
      };

      mockService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResponse);
      expect(result.data).toBeDefined();
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('should forward query parameters to service', async () => {
      const query = {
        userId: 5,
        action: AuditAction.PLAN_CHANGED,
        entityType: 'User',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        page: 2,
        limit: 50,
      };

      mockService.findAll.mockResolvedValue({
        data: [],
        meta: { page: 2, limit: 50, totalItems: 0, totalPages: 0 },
      });

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should return empty data array when no logs match', async () => {
      mockService.findAll.mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
      });

      const result = await controller.findAll({ userId: 9999 });

      expect(result.data).toEqual([]);
      expect(result.meta.totalItems).toBe(0);
    });
  });
});
