import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RateLimitsAdminController } from './rate-limits-admin.controller';
import { IPBlockingService } from '../../../common/services/ip-blocking.service';

describe('RateLimitsAdminController', () => {
  let controller: RateLimitsAdminController;
  let ipBlockingService: jest.Mocked<
    Pick<
      IPBlockingService,
      'getAllViolations' | 'getBlockedIPs' | 'isBlocked' | 'unblockIP'
    >
  >;

  beforeEach(async () => {
    const mockIPBlockingService = {
      getAllViolations: jest.fn(),
      getBlockedIPs: jest.fn(),
      isBlocked: jest.fn(),
      unblockIP: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RateLimitsAdminController],
      providers: [
        {
          provide: IPBlockingService,
          useValue: mockIPBlockingService,
        },
      ],
    }).compile();

    controller = module.get<RateLimitsAdminController>(
      RateLimitsAdminController,
    );
    ipBlockingService = mockIPBlockingService;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getViolationsStats', () => {
    it('should return violations, blocked IPs and aggregated stats', () => {
      const mockViolations = [
        {
          ip: '192.168.1.1',
          count: 5,
          firstViolation: new Date(),
          lastViolation: new Date(),
        },
        {
          ip: '192.168.1.2',
          count: 3,
          firstViolation: new Date(),
          lastViolation: new Date(),
        },
      ];
      const mockBlockedIps = [
        {
          ip: '10.0.0.1',
          reason: 'Rate limit exceeded',
          blockedAt: new Date(),
          expiresAt: new Date(),
        },
      ];

      ipBlockingService.getAllViolations.mockReturnValue(mockViolations);
      ipBlockingService.getBlockedIPs.mockReturnValue(mockBlockedIps);

      const result = controller.getViolationsStats();

      expect(result.violations).toEqual(mockViolations);
      expect(result.blockedIps).toEqual(mockBlockedIps);
      expect(result.stats.totalViolations).toBe(8); // 5 + 3
      expect(result.stats.totalBlockedIps).toBe(1);
      expect(result.stats.activeViolationsCount).toBe(2);
    });

    it('should return zeroed stats when no violations or blocks', () => {
      ipBlockingService.getAllViolations.mockReturnValue([]);
      ipBlockingService.getBlockedIPs.mockReturnValue([]);

      const result = controller.getViolationsStats();

      expect(result.violations).toEqual([]);
      expect(result.blockedIps).toEqual([]);
      expect(result.stats.totalViolations).toBe(0);
      expect(result.stats.totalBlockedIps).toBe(0);
      expect(result.stats.activeViolationsCount).toBe(0);
    });
  });

  describe('unblockIp', () => {
    it('should unblock a blocked IP and return success message', () => {
      ipBlockingService.isBlocked.mockReturnValue(true);
      ipBlockingService.unblockIP.mockReturnValue(undefined);

      const result = controller.unblockIp('192.168.1.100');

      expect(result).toEqual({
        message: 'IP 192.168.1.100 desbloqueada exitosamente',
        ip: '192.168.1.100',
      });
      expect(ipBlockingService.isBlocked).toHaveBeenCalledWith('192.168.1.100');
      expect(ipBlockingService.unblockIP).toHaveBeenCalledWith('192.168.1.100');
    });

    it('should throw NotFoundException when IP is not blocked', () => {
      ipBlockingService.isBlocked.mockReturnValue(false);

      expect(() => controller.unblockIp('192.168.1.99')).toThrow(
        NotFoundException,
      );
      expect(ipBlockingService.unblockIP).not.toHaveBeenCalled();
    });

    it('should include the IP in the NotFoundException message', () => {
      ipBlockingService.isBlocked.mockReturnValue(false);

      expect(() => controller.unblockIp('10.0.0.5')).toThrow(
        'La IP 10.0.0.5 no se encuentra bloqueada',
      );
    });
  });
});
