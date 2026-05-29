import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityEventService } from './security-event.service';
import { SecurityEvent } from './entities/security-event.entity';
import { SecurityEventType } from './enums/security-event-type.enum';
import { SecurityEventSeverity } from './enums/security-event-severity.enum';
import { LoggerService } from '../../common/logger/logger.service';

describe('SecurityEventService', () => {
  let service: SecurityEventService;

  const mockEvent = {
    id: 'abc-123',
    eventType: SecurityEventType.FAILED_LOGIN,
    userId: 1,
    ipAddress: '192.168.1.1',
    userAgent: null,
    severity: SecurityEventSeverity.MEDIUM,
    details: { message: 'Login failed' },
    createdAt: new Date('2026-01-01T10:00:00Z'),
    user: null,
  };

  const mockRepository: jest.Mocked<
    Pick<
      Repository<SecurityEvent>,
      'create' | 'save' | 'findAndCount' | 'count'
    >
  > = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
  };

  const mockLogger = {
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityEventService,
        {
          provide: getRepositoryToken(SecurityEvent),
          useValue: mockRepository,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<SecurityEventService>(SecurityEventService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return standard paginated contract {data, meta: {page, limit, totalItems, totalPages}}', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockEvent], 1]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).toEqual({
        data: [mockEvent],
        meta: {
          page: 1,
          limit: 20,
          totalItems: 1,
          totalPages: 1,
        },
      });
    });

    it('should NOT use events key or currentPage/itemsPerPage in response', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockEvent], 1]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).not.toHaveProperty('events');
      expect(result.meta).not.toHaveProperty('currentPage');
      expect(result.meta).not.toHaveProperty('itemsPerPage');
    });

    it('should calculate totalPages correctly', async () => {
      mockRepository.findAndCount.mockResolvedValue([
        [mockEvent, mockEvent, mockEvent],
        25,
      ]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.totalItems).toBe(25);
    });

    it('should return page 1 with no events when there are none', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(0);
      expect(result.meta.totalItems).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('should apply pagination skip correctly for page 2', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockEvent], 21]);

      await service.findAll({ page: 2, limit: 10 });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('should filter by userId when provided', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ userId: 5, page: 1, limit: 20 });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 5 }),
        }),
      );
    });

    it('should filter by eventType when provided', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        eventType: SecurityEventType.FAILED_LOGIN,
        page: 1,
        limit: 20,
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            eventType: SecurityEventType.FAILED_LOGIN,
          }),
        }),
      );
    });

    it('should filter by severity when provided', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        severity: SecurityEventSeverity.CRITICAL,
        page: 1,
        limit: 20,
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            severity: SecurityEventSeverity.CRITICAL,
          }),
        }),
      );
    });

    it('should default to page 1 and limit 20 when not provided', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({});

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });
  });

  describe('logSecurityEvent', () => {
    it('should create and save a security event', async () => {
      mockRepository.create.mockReturnValue(mockEvent);
      mockRepository.save.mockResolvedValue(mockEvent);

      const dto = {
        eventType: SecurityEventType.FAILED_LOGIN,
        severity: SecurityEventSeverity.MEDIUM,
        ipAddress: '192.168.1.1',
        details: { message: 'Test' },
      };

      const result = await service.logSecurityEvent(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('detectSuspiciousActivity', () => {
    it('should return true when failed attempts >= 5', async () => {
      mockRepository.count.mockResolvedValue(5);
      const result = await service.detectSuspiciousActivity('192.168.1.1');
      expect(result).toBe(true);
    });

    it('should return false when failed attempts < 5', async () => {
      mockRepository.count.mockResolvedValue(4);
      const result = await service.detectSuspiciousActivity('192.168.1.1');
      expect(result).toBe(false);
    });
  });
});
