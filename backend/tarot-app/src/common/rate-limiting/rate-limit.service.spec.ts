import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitService } from './rate-limit.service';
import { UserPlan } from '../../modules/users/entities/user.entity';
import { UsersService } from '../../modules/users/users.service';

describe('RateLimitService', () => {
  let service: RateLimitService;

  const mockUsersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<RateLimitService>(RateLimitService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRateLimitStatus', () => {
    it('should return status for FREE user', async () => {
      const userId = 1;

      mockUsersService.findById.mockResolvedValue({
        id: userId,
        plan: UserPlan.FREE,
        isAdmin: false,
      });

      const result = await service.getRateLimitStatus(userId);

      expect(result).toMatchObject({
        plan: UserPlan.FREE,
        limits: {
          requestsPerHour: 60,
          requestsPerMinute: 100,
          regenerationsPerReading: 0,
        },
        usage: {
          requestsThisHour: 0,
          requestsThisMinute: 0,
          remaining: {
            hour: 60,
            minute: 100,
          },
        },
      });

      expect(result.resetAt.hour).toBeGreaterThan(Date.now());
      expect(result.resetAt.minute).toBeGreaterThan(Date.now());
    });

    it('should return status for PREMIUM user', async () => {
      const userId = 2;

      mockUsersService.findById.mockResolvedValue({
        id: userId,
        plan: UserPlan.PREMIUM,
        isAdmin: false,
      });

      const result = await service.getRateLimitStatus(userId);

      expect(result).toMatchObject({
        plan: UserPlan.PREMIUM,
        limits: {
          requestsPerHour: 300,
          requestsPerMinute: 200,
          regenerationsPerReading: 3,
        },
        usage: {
          requestsThisHour: 0,
          requestsThisMinute: 0,
          remaining: {
            hour: 300,
            minute: 200,
          },
        },
      });
    });

    it('should return unlimited status for ADMIN users', async () => {
      const userId = 3;

      mockUsersService.findById.mockResolvedValue({
        id: userId,
        plan: UserPlan.FREE,
        isAdmin: true,
      });

      const result = await service.getRateLimitStatus(userId);

      expect(result).toMatchObject({
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
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = 999;
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.getRateLimitStatus(userId)).rejects.toThrow(
        'User 999 not found',
      );
    });
  });

  describe('getPlanLimits', () => {
    it('should return FREE plan limits', () => {
      const limits = service.getPlanLimits(UserPlan.FREE, false);

      expect(limits).toEqual({
        requestsPerHour: 60,
        requestsPerMinute: 100,
        regenerationsPerReading: 0,
      });
    });

    it('should return PREMIUM plan limits', () => {
      const limits = service.getPlanLimits(UserPlan.PREMIUM, false);

      expect(limits).toEqual({
        requestsPerHour: 300,
        requestsPerMinute: 200,
        regenerationsPerReading: 3,
      });
    });

    it('should return unlimited limits for ADMIN', () => {
      const limits = service.getPlanLimits(UserPlan.FREE, true);

      expect(limits).toEqual({
        requestsPerHour: Infinity,
        requestsPerMinute: Infinity,
        regenerationsPerReading: Infinity,
      });
    });
  });
});
