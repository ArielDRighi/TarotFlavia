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
    it('should return paginated audit logs', async () => {
      const mockResponse = {
        logs: [
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
          currentPage: 1,
          itemsPerPage: 20,
          totalItems: 1,
          totalPages: 1,
        },
      };

      mockService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResponse);
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

      mockService.findAll.mockResolvedValue({ logs: [], meta: {} });

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });
});
