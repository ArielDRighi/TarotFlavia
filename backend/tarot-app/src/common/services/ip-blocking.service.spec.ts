import { Test, TestingModule } from '@nestjs/testing';
import { IPBlockingService } from './ip-blocking.service';

describe('IPBlockingService', () => {
  let service: IPBlockingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IPBlockingService],
    }).compile();

    service = module.get<IPBlockingService>(IPBlockingService);
  });

  afterEach(() => {
    // Clear all tracked IPs after each test
    service.clearAll();
  });

  describe('recordViolation', () => {
    it('should record a violation for an IP', () => {
      // Act
      service.recordViolation('192.168.1.1');

      // Assert
      const violations = service.getViolations('192.168.1.1');
      expect(violations).toBe(1);
    });

    it('should increment violations for repeated offenses', () => {
      // Act
      service.recordViolation('192.168.1.1');
      service.recordViolation('192.168.1.1');
      service.recordViolation('192.168.1.1');

      // Assert
      const violations = service.getViolations('192.168.1.1');
      expect(violations).toBe(3);
    });

    it('should track violations for different IPs independently', () => {
      // Act
      service.recordViolation('192.168.1.1');
      service.recordViolation('192.168.1.1');
      service.recordViolation('192.168.1.2');

      // Assert
      expect(service.getViolations('192.168.1.1')).toBe(2);
      expect(service.getViolations('192.168.1.2')).toBe(1);
    });
  });

  describe('isBlocked', () => {
    it('should return false for IP with no violations', () => {
      // Act & Assert
      expect(service.isBlocked('192.168.1.1')).toBe(false);
    });

    it('should return false for IP with violations below threshold', () => {
      // Act
      for (let i = 0; i < 9; i++) {
        service.recordViolation('192.168.1.1');
      }

      // Assert
      expect(service.isBlocked('192.168.1.1')).toBe(false);
    });

    it('should return true for IP with 10 or more violations', () => {
      // Act
      for (let i = 0; i < 10; i++) {
        service.recordViolation('192.168.1.1');
      }

      // Assert
      expect(service.isBlocked('192.168.1.1')).toBe(true);
    });

    it('should return true for manually blocked IP', () => {
      // Act
      service.blockIP('192.168.1.1', 3600);

      // Assert
      expect(service.isBlocked('192.168.1.1')).toBe(true);
    });
  });

  describe('blockIP', () => {
    it('should block an IP for specified duration in seconds', () => {
      // Act
      service.blockIP('192.168.1.1', 3600); // 1 hour

      // Assert
      expect(service.isBlocked('192.168.1.1')).toBe(true);
    });

    it('should automatically unblock IP after duration expires', async () => {
      // Act
      service.blockIP('192.168.1.1', 1); // 1 second
      expect(service.isBlocked('192.168.1.1')).toBe(true);

      // Wait for block to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Assert
      expect(service.isBlocked('192.168.1.1')).toBe(false);
    }, 2000);
  });

  describe('unblockIP', () => {
    it('should unblock a blocked IP', () => {
      // Arrange
      service.blockIP('192.168.1.1', 3600);
      expect(service.isBlocked('192.168.1.1')).toBe(true);

      // Act
      service.unblockIP('192.168.1.1');

      // Assert
      expect(service.isBlocked('192.168.1.1')).toBe(false);
    });

    it('should reset violation count when unblocking', () => {
      // Arrange
      for (let i = 0; i < 15; i++) {
        service.recordViolation('192.168.1.1');
      }
      service.blockIP('192.168.1.1', 3600);

      // Act
      service.unblockIP('192.168.1.1');

      // Assert
      expect(service.getViolations('192.168.1.1')).toBe(0);
    });
  });

  describe('getViolations', () => {
    it('should return 0 for IP with no violations', () => {
      // Act & Assert
      expect(service.getViolations('192.168.1.1')).toBe(0);
    });

    it('should return correct violation count', () => {
      // Act
      for (let i = 0; i < 7; i++) {
        service.recordViolation('192.168.1.1');
      }

      // Assert
      expect(service.getViolations('192.168.1.1')).toBe(7);
    });
  });

  describe('getAllViolations', () => {
    it('should return empty array when no violations', () => {
      // Act
      const violations = service.getAllViolations();

      // Assert
      expect(violations).toEqual([]);
    });

    it('should return all IPs with their violation counts', () => {
      // Act
      service.recordViolation('192.168.1.1');
      service.recordViolation('192.168.1.1');
      service.recordViolation('192.168.1.2');
      service.recordViolation('192.168.1.3');
      service.recordViolation('192.168.1.3');
      service.recordViolation('192.168.1.3');

      // Assert
      const violations = service.getAllViolations();
      expect(violations).toHaveLength(3);
      expect(violations.find((v) => v.ip === '192.168.1.1')?.count).toBe(2);
      expect(violations.find((v) => v.ip === '192.168.1.2')?.count).toBe(1);
      expect(violations.find((v) => v.ip === '192.168.1.3')?.count).toBe(3);
    });

    it('should include blocked IPs', () => {
      // Act
      for (let i = 0; i < 12; i++) {
        service.recordViolation('192.168.1.1');
      }
      service.recordViolation('192.168.1.2');

      // Assert
      const violations = service.getAllViolations();
      expect(violations.find((v) => v.ip === '192.168.1.1')?.count).toBe(12);
      expect(violations.find((v) => v.ip === '192.168.1.2')?.count).toBe(1);
    });
  });

  describe('clearAll', () => {
    it('should clear all violations and blocks', () => {
      // Arrange
      service.recordViolation('192.168.1.1');
      service.recordViolation('192.168.1.2');
      service.blockIP('192.168.1.3', 3600);

      // Act
      service.clearAll();

      // Assert
      expect(service.getViolations('192.168.1.1')).toBe(0);
      expect(service.getViolations('192.168.1.2')).toBe(0);
      expect(service.isBlocked('192.168.1.3')).toBe(false);
      expect(service.getAllViolations()).toEqual([]);
    });
  });

  describe('getBlockedIPs', () => {
    it('should return empty array when no IPs are blocked', () => {
      // Act & Assert
      expect(service.getBlockedIPs()).toEqual([]);
    });

    it('should return all currently blocked IPs', () => {
      // Act
      service.blockIP('192.168.1.1', 3600);
      service.blockIP('192.168.1.2', 3600);
      for (let i = 0; i < 10; i++) {
        service.recordViolation('192.168.1.3');
      }

      // Assert
      const blocked = service.getBlockedIPs();
      expect(blocked).toHaveLength(3);
      expect(blocked.find((b) => b.ip === '192.168.1.1')).toBeDefined();
      expect(blocked.find((b) => b.ip === '192.168.1.2')).toBeDefined();
      expect(blocked.find((b) => b.ip === '192.168.1.3')).toBeDefined();
    });
  });
});
