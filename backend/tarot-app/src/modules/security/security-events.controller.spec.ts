import { Test, TestingModule } from '@nestjs/testing';
import { SecurityEventsController } from './security-events.controller';
import { SecurityEventService } from './security-event.service';
import { SecurityEventType } from './enums/security-event-type.enum';
import { SecurityEventSeverity } from './enums/security-event-severity.enum';

describe('SecurityEventsController', () => {
  let controller: SecurityEventsController;
  let service: jest.Mocked<SecurityEventService>;

  const mockEvent = {
    id: '123',
    eventType: SecurityEventType.FAILED_LOGIN,
    userId: 1,
    ipAddress: '192.168.1.1',
    severity: SecurityEventSeverity.MEDIUM,
    details: {},
    createdAt: new Date(),
  };

  const mockService = {
    findAll: jest.fn().mockResolvedValue({
      events: [mockEvent],
      meta: {
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: 1,
        totalPages: 1,
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecurityEventsController],
      providers: [
        {
          provide: SecurityEventService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SecurityEventsController>(SecurityEventsController);
    service = module.get(SecurityEventService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated security events', async () => {
      const query = {
        page: 1,
        limit: 20,
      };

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        events: [mockEvent],
        meta: {
          currentPage: 1,
          itemsPerPage: 20,
          totalItems: 1,
          totalPages: 1,
        },
      });
    });

    it('should filter by eventType', async () => {
      const query = {
        eventType: SecurityEventType.FAILED_LOGIN,
        page: 1,
        limit: 20,
      };

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter by severity', async () => {
      const query = {
        severity: SecurityEventSeverity.CRITICAL,
        page: 1,
        limit: 20,
      };

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });
});
