import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnonymousTrackingService } from './anonymous-tracking.service';
import { AnonymousUsage } from '../entities/anonymous-usage.entity';
import { UsageFeature } from '../entities/usage-limit.entity';

describe('AnonymousTrackingService', () => {
  let service: AnonymousTrackingService;

  const mockAnonymousUsageRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnonymousTrackingService,
        {
          provide: getRepositoryToken(AnonymousUsage),
          useValue: mockAnonymousUsageRepository,
        },
      ],
    }).compile();

    service = module.get<AnonymousTrackingService>(AnonymousTrackingService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateFingerprint', () => {
    it('should generate SHA-256 fingerprint from IP and User Agent', () => {
      const ip = '192.168.1.1';
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

      const fingerprint = service.generateFingerprint(ip, userAgent);

      expect(fingerprint).toBeDefined();
      expect(typeof fingerprint).toBe('string');
      expect(fingerprint).toHaveLength(64); // SHA-256 produces 64 hex characters
    });

    it('should generate the same fingerprint for the same IP and User Agent', () => {
      const ip = '192.168.1.1';
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

      const fingerprint1 = service.generateFingerprint(ip, userAgent);
      const fingerprint2 = service.generateFingerprint(ip, userAgent);

      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should generate different fingerprints for different IPs', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

      const fingerprint1 = service.generateFingerprint(
        '192.168.1.1',
        userAgent,
      );
      const fingerprint2 = service.generateFingerprint(
        '192.168.1.2',
        userAgent,
      );

      expect(fingerprint1).not.toBe(fingerprint2);
    });

    it('should generate different fingerprints for different User Agents', () => {
      const ip = '192.168.1.1';

      const fingerprint1 = service.generateFingerprint(ip, 'Chrome Browser');
      const fingerprint2 = service.generateFingerprint(ip, 'Firefox Browser');

      expect(fingerprint1).not.toBe(fingerprint2);
    });
  });

  describe('canAccess', () => {
    const mockRequest = {
      ip: '192.168.1.1',
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    };

    it('should return true when anonymous user has not accessed today', async () => {
      mockAnonymousUsageRepository.findOne.mockResolvedValue(null);

      const result = await service.canAccess(mockRequest as any);

      expect(result).toBe(true);
      expect(mockAnonymousUsageRepository.findOne).toHaveBeenCalledWith({
        where: {
          fingerprint: expect.any(String),
          date: expect.any(String),
          feature: UsageFeature.TAROT_READING,
        },
      });
    });

    it('should return false when anonymous user has already accessed today', async () => {
      mockAnonymousUsageRepository.findOne.mockResolvedValue({
        id: 1,
        fingerprint: 'abc123',
        ip: '192.168.1.1',
        date: '2026-01-02',
        feature: UsageFeature.TAROT_READING,
      });

      const result = await service.canAccess(mockRequest as any);

      expect(result).toBe(false);
    });

    it('should handle missing user-agent header gracefully', async () => {
      const requestWithoutUA = {
        ip: '192.168.1.1',
        headers: {},
      };

      mockAnonymousUsageRepository.findOne.mockResolvedValue(null);

      const result = await service.canAccess(requestWithoutUA as any);

      expect(result).toBe(true);
      expect(mockAnonymousUsageRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('recordUsage', () => {
    const mockRequest = {
      ip: '192.168.1.1',
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    };

    it('should create and save a new anonymous usage record', async () => {
      const mockAnonymousUsage = {
        id: 1,
        fingerprint: expect.any(String),
        ip: '192.168.1.1',
        date: expect.any(String),
        feature: UsageFeature.TAROT_READING,
      };

      mockAnonymousUsageRepository.create.mockReturnValue(mockAnonymousUsage);
      mockAnonymousUsageRepository.save.mockResolvedValue(mockAnonymousUsage);

      const result = await service.recordUsage(mockRequest as any);

      expect(mockAnonymousUsageRepository.create).toHaveBeenCalledWith({
        fingerprint: expect.any(String),
        ip: '192.168.1.1',
        date: expect.any(String),
        feature: UsageFeature.TAROT_READING,
      });
      expect(mockAnonymousUsageRepository.save).toHaveBeenCalledWith(
        mockAnonymousUsage,
      );
      expect(result).toEqual(mockAnonymousUsage);
    });

    it('should use empty string for missing user-agent', async () => {
      const requestWithoutUA = {
        ip: '192.168.1.1',
        headers: {},
      };

      const mockAnonymousUsage = {
        id: 1,
        fingerprint: expect.any(String),
        ip: '192.168.1.1',
        date: expect.any(String),
        feature: UsageFeature.TAROT_READING,
      };

      mockAnonymousUsageRepository.create.mockReturnValue(mockAnonymousUsage);
      mockAnonymousUsageRepository.save.mockResolvedValue(mockAnonymousUsage);

      await service.recordUsage(requestWithoutUA as any);

      expect(mockAnonymousUsageRepository.create).toHaveBeenCalled();
      expect(mockAnonymousUsageRepository.save).toHaveBeenCalled();
    });

    it('should handle missing IP by using empty string', async () => {
      const requestWithoutIP = {
        ip: undefined,
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
      };

      const mockAnonymousUsage = {
        id: 1,
        fingerprint: expect.any(String),
        ip: '',
        date: expect.any(String),
        feature: UsageFeature.TAROT_READING,
      };

      mockAnonymousUsageRepository.create.mockReturnValue(mockAnonymousUsage);
      mockAnonymousUsageRepository.save.mockResolvedValue(mockAnonymousUsage);

      await service.recordUsage(requestWithoutIP as any);

      // Verify that IP is stored as empty string
      expect(mockAnonymousUsageRepository.create).toHaveBeenCalledWith({
        fingerprint: expect.any(String),
        ip: '',
        date: expect.any(String),
        feature: UsageFeature.TAROT_READING,
      });
      expect(mockAnonymousUsageRepository.save).toHaveBeenCalled();
    });
  });
});
