import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { DailyReadingCleanupService } from './daily-reading-cleanup.service';
import { DailyReading } from './entities/daily-reading.entity';
import { UserPlan } from '../../users/entities/user.entity';
import { DAILY_READING_RETENTION_DAYS } from '../readings/readings.constants';

describe('DailyReadingCleanupService', () => {
  let service: DailyReadingCleanupService;
  let dailyReadingRepo: jest.Mocked<Repository<DailyReading>>;

  beforeEach(async () => {
    const mockRepository = {
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyReadingCleanupService,
        {
          provide: getRepositoryToken(DailyReading),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DailyReadingCleanupService>(
      DailyReadingCleanupService,
    );
    dailyReadingRepo = module.get(getRepositoryToken(DailyReading));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cleanupOldDailyReadings', () => {
    it('should execute cleanup sequence in correct order', async () => {
      // Mock delete results
      dailyReadingRepo.delete.mockResolvedValue({
        affected: 2,
      } as DeleteResult);

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 3 }),
      };

      dailyReadingRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.cleanupOldDailyReadings();

      // Verify all cleanup methods were called
      expect(dailyReadingRepo.delete).toHaveBeenCalledTimes(1);
      expect(dailyReadingRepo.createQueryBuilder).toHaveBeenCalledTimes(2);
    });

    it('should delete anonymous daily readings older than 1 day', async () => {
      dailyReadingRepo.delete.mockResolvedValue({
        affected: 5,
      } as DeleteResult);

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };

      dailyReadingRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.cleanupOldDailyReadings();

      // Verify anonymous cleanup was called
      expect(dailyReadingRepo.delete).toHaveBeenCalledWith({
        userId: expect.any(Object),
        readingDate: expect.any(Object),
      });

      // Verify the delete was called with IsNull and LessThan operators
      const callArgs = dailyReadingRepo.delete.mock.calls[0][0] as any;
      expect(callArgs.userId).toBeDefined();
      expect(callArgs.readingDate).toBeDefined();
    });

    it('should delete FREE user daily readings older than 30 days', async () => {
      dailyReadingRepo.delete.mockResolvedValue({
        affected: 0,
      } as DeleteResult);

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 7 }),
      };

      dailyReadingRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.cleanupOldDailyReadings();

      // Verify FREE cleanup was called with correct parameters
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.plan = :plan', {
        plan: UserPlan.FREE,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'daily.readingDate < :cutoffDate',
        expect.objectContaining({ cutoffDate: expect.any(Date) }),
      );
    });

    it('should delete PREMIUM user daily readings older than 365 days', async () => {
      dailyReadingRepo.delete.mockResolvedValue({
        affected: 0,
      } as DeleteResult);

      let premiumCalled = false;
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        where: jest.fn(function (
          _condition: string,
          params: { plan?: UserPlan },
        ) {
          if (params.plan === UserPlan.PREMIUM) {
            premiumCalled = true;
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return this;
        }),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 3 }),
      };

      dailyReadingRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.cleanupOldDailyReadings();

      expect(premiumCalled).toBe(true);
      expect(mockQueryBuilder.execute).toHaveBeenCalledTimes(2);
    });

    it('should return 0 when no daily readings are deleted', async () => {
      dailyReadingRepo.delete.mockResolvedValue({
        affected: 0,
      } as DeleteResult);

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };

      dailyReadingRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.cleanupOldDailyReadings();

      // Should complete without errors
      expect(dailyReadingRepo.delete).toHaveBeenCalledTimes(1);
      expect(dailyReadingRepo.createQueryBuilder).toHaveBeenCalledTimes(2);
    });

    it('should handle errors gracefully and log them', async () => {
      const error = new Error('Database error');
      dailyReadingRepo.delete.mockRejectedValue(error);

      // Should not throw
      await expect(service.cleanupOldDailyReadings()).resolves.not.toThrow();
    });

    it('should log starting message', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');

      dailyReadingRepo.delete.mockResolvedValue({
        affected: 0,
      } as DeleteResult);

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };

      dailyReadingRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.cleanupOldDailyReadings();

      expect(logSpy).toHaveBeenCalledWith(
        'Starting daily readings retention cleanup...',
      );
    });

    it('should log completion message', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');

      dailyReadingRepo.delete.mockResolvedValue({
        affected: 0,
      } as DeleteResult);

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };

      dailyReadingRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.cleanupOldDailyReadings();

      expect(logSpy).toHaveBeenCalledWith(
        'Daily readings retention cleanup completed',
      );
    });

    it('should log number of deleted readings for each category', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');

      dailyReadingRepo.delete.mockResolvedValue({
        affected: 2,
      } as DeleteResult);

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest
          .fn()
          .mockResolvedValueOnce({ affected: 3 })
          .mockResolvedValueOnce({ affected: 1 }),
      };

      dailyReadingRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.cleanupOldDailyReadings();

      expect(logSpy).toHaveBeenCalledWith(
        'Deleted 2 old anonymous daily readings',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Deleted 3 old FREE user daily readings',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Deleted 1 old PREMIUM user daily readings',
      );
    });

    it('should use constants for retention days', () => {
      expect(DAILY_READING_RETENTION_DAYS[UserPlan.ANONYMOUS]).toBe(1);
      expect(DAILY_READING_RETENTION_DAYS[UserPlan.FREE]).toBe(30);
      expect(DAILY_READING_RETENTION_DAYS[UserPlan.PREMIUM]).toBe(365);
    });

    it('should handle undefined affected count', async () => {
      dailyReadingRepo.delete.mockResolvedValue({} as DeleteResult);

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      };

      dailyReadingRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await expect(service.cleanupOldDailyReadings()).resolves.not.toThrow();
    });

    it('should continue cleanup if anonymous deletion fails', async () => {
      const error = new Error('Delete error');
      dailyReadingRepo.delete.mockRejectedValue(error);

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 5 }),
      };

      dailyReadingRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const errorSpy = jest.spyOn(service['logger'], 'error');
      const logSpy = jest.spyOn(service['logger'], 'log');

      await service.cleanupOldDailyReadings();

      // Verify error was logged for anonymous cleanup
      expect(errorSpy).toHaveBeenCalledWith(
        'Error during anonymous daily readings cleanup:',
        error,
      );

      // Verify FREE and PREMIUM cleanups continued
      expect(dailyReadingRepo.createQueryBuilder).toHaveBeenCalledTimes(2);
      expect(logSpy).toHaveBeenCalledWith(
        'Deleted 5 old FREE user daily readings',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Deleted 5 old PREMIUM user daily readings',
      );
    });
  });
});
