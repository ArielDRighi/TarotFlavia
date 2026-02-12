import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { UsageLimitsResetService } from './usage-limits-reset.service';
import { UsageLimit } from '../entities/usage-limit.entity';
import { Logger } from '@nestjs/common';

describe('UsageLimitsResetService', () => {
  let service: UsageLimitsResetService;
  let repository: jest.Mocked<Repository<UsageLimit>>;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const mockRepository = {
      delete: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageLimitsResetService,
        {
          provide: getRepositoryToken(UsageLimit),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsageLimitsResetService>(UsageLimitsResetService);
    repository = module.get(getRepositoryToken(UsageLimit));

    // Spy on logger methods
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleDailyReset', () => {
    it('should delete records older than 7 days', async () => {
      // Arrange
      const mockDeleteResult = { affected: 5 };
      repository.delete.mockResolvedValue(
        mockDeleteResult as unknown as DeleteResult,
      );

      // Act
      await service.handleDailyReset();

      // Assert
      expect(repository.delete).toHaveBeenCalledTimes(1);
      const callArgs = repository.delete.mock.calls[0][0] as Record<
        string,
        unknown
      >;
      expect(callArgs).toHaveProperty('date');
      expect(callArgs.date).toBeDefined();
    });

    it('should log the number of deleted records', async () => {
      // Arrange
      const mockDeleteResult = { affected: 3 };
      repository.delete.mockResolvedValue(
        mockDeleteResult as unknown as DeleteResult,
      );

      // Act
      await service.handleDailyReset();

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith(
        'Daily usage limits reset job started',
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        'Deleted 3 usage limit records older than 7 days',
      );
    });

    it('should handle zero deleted records', async () => {
      // Arrange
      const mockDeleteResult = { affected: 0 };
      repository.delete.mockResolvedValue(
        mockDeleteResult as unknown as DeleteResult,
      );

      // Act
      await service.handleDailyReset();

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith(
        'Deleted 0 usage limit records older than 7 days',
      );
    });

    it('should handle undefined affected count', async () => {
      // Arrange
      const mockDeleteResult = { affected: undefined };
      repository.delete.mockResolvedValue(
        mockDeleteResult as unknown as DeleteResult,
      );

      // Act
      await service.handleDailyReset();

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith(
        'Deleted 0 usage limit records older than 7 days',
      );
    });

    it('should catch and log errors without throwing', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      repository.delete.mockRejectedValue(mockError);
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      // Act & Assert
      await expect(service.handleDailyReset()).resolves.not.toThrow();
      expect(errorSpy).toHaveBeenCalledWith(
        'Error during daily usage limits reset',
        mockError.stack,
      );
    });

    it('should use correct date calculation for 7 days retention', async () => {
      // Arrange
      const mockDeleteResult = { affected: 2 };
      repository.delete.mockResolvedValue(
        mockDeleteResult as unknown as DeleteResult,
      );

      const now = new Date('2025-12-27T00:00:00Z');
      jest.useFakeTimers().setSystemTime(now);

      try {
        // Act
        await service.handleDailyReset();

        // Assert
        const expectedDate = new Date(now);
        expectedDate.setDate(expectedDate.getDate() - 7);
        expectedDate.setHours(0, 0, 0, 0);

        expect(repository.delete).toHaveBeenCalledTimes(1);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('getRetentionStats', () => {
    it('should return count of records to be deleted', async () => {
      // Arrange
      repository.count.mockResolvedValue(10);

      // Act
      const result = await service.getRetentionStats();

      // Assert
      expect(result).toEqual({
        recordsToDelete: 10,
        retentionDays: 7,
      });
      expect(repository.count).toHaveBeenCalledTimes(1);
    });

    it('should handle count errors gracefully', async () => {
      // Arrange
      repository.count.mockRejectedValue(new Error('Count failed'));

      // Act & Assert
      await expect(service.getRetentionStats()).rejects.toThrow('Count failed');
    });
  });
});
