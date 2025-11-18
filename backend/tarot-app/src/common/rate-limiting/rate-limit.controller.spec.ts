import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitController } from './rate-limit.controller';
import { RateLimitService } from './rate-limit.service';
import { UserPlan } from '../../modules/users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('RateLimitController', () => {
  let controller: RateLimitController;
  let service: RateLimitService;

  const mockRateLimitService = {
    getRateLimitStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RateLimitController],
      providers: [
        {
          provide: RateLimitService,
          useValue: mockRateLimitService,
        },
      ],
    }).compile();

    controller = module.get<RateLimitController>(RateLimitController);
    service = module.get<RateLimitService>(RateLimitService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStatus', () => {
    it('should throw UnauthorizedException if user is not authenticated', async () => {
      const req = {};
      await expect(controller.getStatus(req)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return rate limit status for authenticated FREE user', async () => {
      const req = {
        user: {
          userId: 1,
          plan: UserPlan.FREE,
        },
        ip: '192.168.1.1',
      };

      const expectedStatus = {
        plan: UserPlan.FREE,
        limits: {
          requestsPerHour: 60,
          requestsPerMinute: 100,
          regenerationsPerReading: 0,
        },
        usage: {
          requestsThisHour: 10,
          requestsThisMinute: 5,
          remaining: {
            hour: 50,
            minute: 95,
          },
        },
        resetAt: {
          hour: expect.any(Number) as number,
          minute: expect.any(Number) as number,
        },
      };

      mockRateLimitService.getRateLimitStatus.mockResolvedValue(expectedStatus);

      const result = await controller.getStatus(req);

      expect(result).toEqual(expectedStatus);
      expect(service.getRateLimitStatus).toHaveBeenCalledWith(1);
    });

    it('should return rate limit status for authenticated PREMIUM user', async () => {
      const req = {
        user: {
          userId: 2,
          plan: UserPlan.PREMIUM,
        },
        ip: '192.168.1.2',
      };

      const expectedStatus = {
        plan: UserPlan.PREMIUM,
        limits: {
          requestsPerHour: 300,
          requestsPerMinute: 200,
          regenerationsPerReading: 3,
        },
        usage: {
          requestsThisHour: 50,
          requestsThisMinute: 10,
          remaining: {
            hour: 250,
            minute: 190,
          },
        },
        resetAt: {
          hour: expect.any(Number) as number,
          minute: expect.any(Number) as number,
        },
      };

      mockRateLimitService.getRateLimitStatus.mockResolvedValue(expectedStatus);

      const result = await controller.getStatus(req);

      expect(result).toEqual(expectedStatus);
      expect(service.getRateLimitStatus).toHaveBeenCalledWith(2);
    });

    it('should return unlimited status for ADMIN users', async () => {
      const req = {
        user: {
          userId: 3,
          plan: UserPlan.FREE,
          isAdmin: true,
        },
        ip: '192.168.1.3',
      };

      const expectedStatus = {
        plan: 'ADMIN',
        limits: {
          requestsPerHour: Infinity,
          requestsPerMinute: Infinity,
          regenerationsPerReading: Infinity,
        },
        usage: {
          requestsThisHour: 0,
          requestsThisMinute: 0,
          remaining: {
            hour: Infinity,
            minute: Infinity,
          },
        },
        resetAt: {
          hour: null,
          minute: null,
        },
      };

      mockRateLimitService.getRateLimitStatus.mockResolvedValue(expectedStatus);

      const result = await controller.getStatus(req);

      expect(result).toEqual(expectedStatus);
    });
  });
});
