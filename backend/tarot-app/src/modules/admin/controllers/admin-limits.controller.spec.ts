import { Test, TestingModule } from '@nestjs/testing';
import { AdminLimitsController } from './admin-limits.controller';
import { AdminLimitsService } from '../services/admin-limits.service';
import { BadRequestException } from '@nestjs/common';
import { UserRole } from '../../../common/enums/user-role.enum';
import { Request } from 'express';

type AuthenticatedRequest = Request & {
  user: { userId: number; email: string; roles: string[] };
};

describe('AdminLimitsController', () => {
  let controller: AdminLimitsController;
  let limitsService: AdminLimitsService;

  const mockLimitsService = {
    getBirthChartLimits: jest.fn(),
    updateBirthChartLimits: jest.fn(),
    getLimitsHistory: jest.fn(),
  };

  const mockRequest = {
    user: { userId: 1, email: 'admin@example.com', roles: [UserRole.ADMIN] },
    ip: '127.0.0.1',
    headers: { 'user-agent': 'test-agent' },
  } as Partial<AuthenticatedRequest> as AuthenticatedRequest;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminLimitsController],
      providers: [
        {
          provide: AdminLimitsService,
          useValue: mockLimitsService,
        },
      ],
    }).compile();

    controller = module.get<AdminLimitsController>(AdminLimitsController);
    limitsService = module.get<AdminLimitsService>(AdminLimitsService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBirthChartLimits', () => {
    it('should return current birth chart limits', async () => {
      const mockLimits = {
        anonymous: 1,
        free: 3,
        premium: 5,
      };

      mockLimitsService.getBirthChartLimits.mockResolvedValue(mockLimits);

      const result = await controller.getBirthChartLimits();

      expect(result).toEqual(mockLimits);
      expect(limitsService.getBirthChartLimits).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockLimitsService.getBirthChartLimits.mockRejectedValue(error);

      await expect(controller.getBirthChartLimits()).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('updateBirthChartLimits', () => {
    it('should update limits with valid data', async () => {
      const updateDto = {
        freeLimit: 5,
        premiumLimit: 10,
      };

      const mockUpdatedLimits = {
        anonymous: 1,
        free: 5,
        premium: 10,
      };

      mockLimitsService.updateBirthChartLimits.mockResolvedValue(
        mockUpdatedLimits,
      );

      const result = await controller.updateBirthChartLimits(
        updateDto,
        mockRequest,
      );

      expect(result).toEqual({
        message: 'Límites actualizados exitosamente',
        limits: mockUpdatedLimits,
      });
      expect(limitsService.updateBirthChartLimits).toHaveBeenCalledWith(
        updateDto,
        1,
        'admin@example.com',
      );
    });

    it('should update only free limit', async () => {
      const updateDto = {
        freeLimit: 4,
      };

      const mockUpdatedLimits = {
        anonymous: 1,
        free: 4,
        premium: 5,
      };

      mockLimitsService.updateBirthChartLimits.mockResolvedValue(
        mockUpdatedLimits,
      );

      const result = await controller.updateBirthChartLimits(
        updateDto,
        mockRequest,
      );

      expect(result).toEqual({
        message: 'Límites actualizados exitosamente',
        limits: mockUpdatedLimits,
      });
      expect(limitsService.updateBirthChartLimits).toHaveBeenCalledWith(
        updateDto,
        1,
        'admin@example.com',
      );
    });

    it('should update only premium limit', async () => {
      const updateDto = {
        premiumLimit: 8,
      };

      const mockUpdatedLimits = {
        anonymous: 1,
        free: 3,
        premium: 8,
      };

      mockLimitsService.updateBirthChartLimits.mockResolvedValue(
        mockUpdatedLimits,
      );

      const result = await controller.updateBirthChartLimits(
        updateDto,
        mockRequest,
      );

      expect(result).toEqual({
        message: 'Límites actualizados exitosamente',
        limits: mockUpdatedLimits,
      });
    });

    it('should handle validation errors from DTO', async () => {
      const invalidDto = {
        freeLimit: -1, // Invalid: negative
        premiumLimit: 101, // Invalid: > 100
      };

      // DTO validation should happen before reaching the service
      // This test verifies the controller can handle validation errors
      mockLimitsService.updateBirthChartLimits.mockRejectedValue(
        new BadRequestException('Validation failed'),
      );

      await expect(
        controller.updateBirthChartLimits(invalidDto, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('should extract userId from request correctly', async () => {
      const updateDto = { freeLimit: 5 };
      const mockUpdatedLimits = {
        anonymous: 1,
        free: 5,
        premium: 5,
      };

      mockLimitsService.updateBirthChartLimits.mockResolvedValue(
        mockUpdatedLimits,
      );

      await controller.updateBirthChartLimits(updateDto, mockRequest);

      expect(limitsService.updateBirthChartLimits).toHaveBeenCalledWith(
        updateDto,
        1, // userId from mockRequest
        'admin@example.com',
      );
    });

    it('should handle service errors during update', async () => {
      const updateDto = { freeLimit: 5 };
      const error = new Error('Database connection failed');

      mockLimitsService.updateBirthChartLimits.mockRejectedValue(error);

      await expect(
        controller.updateBirthChartLimits(updateDto, mockRequest),
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('getLimitsHistory', () => {
    it('should return limits change history', async () => {
      const mockHistory = [
        {
          id: 1,
          action: 'UPDATE_USAGE_LIMITS',
          performedBy: 1,
          performedAt: new Date('2026-02-12T10:00:00Z'),
          oldValue: { free: 3, premium: 5 },
          newValue: { free: 5, premium: 10 },
        },
        {
          id: 2,
          action: 'UPDATE_USAGE_LIMITS',
          performedBy: 1,
          performedAt: new Date('2026-02-11T15:30:00Z'),
          oldValue: { free: 2, premium: 4 },
          newValue: { free: 3, premium: 5 },
        },
      ];

      mockLimitsService.getLimitsHistory.mockResolvedValue(mockHistory);

      const result = await controller.getLimitsHistory();

      expect(result).toEqual(mockHistory);
      expect(limitsService.getLimitsHistory).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no history exists', async () => {
      mockLimitsService.getLimitsHistory.mockResolvedValue([]);

      const result = await controller.getLimitsHistory();

      expect(result).toEqual([]);
      expect(limitsService.getLimitsHistory).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors when fetching history', async () => {
      const error = new Error('Failed to fetch history');
      mockLimitsService.getLimitsHistory.mockRejectedValue(error);

      await expect(controller.getLimitsHistory()).rejects.toThrow(
        'Failed to fetch history',
      );
    });
  });

  describe('Request structure validation', () => {
    it('should work with different admin users', async () => {
      const differentAdminRequest = {
        user: {
          userId: 999,
          email: 'other@example.com',
          roles: [UserRole.ADMIN],
        },
        ip: '192.168.1.1',
        headers: { 'user-agent': 'different-agent' },
      } as Partial<AuthenticatedRequest> as AuthenticatedRequest;

      const updateDto = { freeLimit: 5 };
      const mockUpdatedLimits = {
        anonymous: 1,
        free: 5,
        premium: 5,
      };

      mockLimitsService.updateBirthChartLimits.mockResolvedValue(
        mockUpdatedLimits,
      );

      await controller.updateBirthChartLimits(updateDto, differentAdminRequest);

      expect(limitsService.updateBirthChartLimits).toHaveBeenCalledWith(
        updateDto,
        999, // Different userId
        'other@example.com',
      );
    });
  });
});
