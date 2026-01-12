import { Test, TestingModule } from '@nestjs/testing';
import { ReadingsCleanupService } from './readings-cleanup.service';
import { ReadingsOrchestratorService } from './application/services/readings-orchestrator.service';
import { UserPlan } from '../../users/entities/user.entity';
import { READING_RETENTION_DAYS } from './readings.constants';

describe('ReadingsCleanupService', () => {
  let service: ReadingsCleanupService;
  let orchestrator: jest.Mocked<ReadingsOrchestratorService>;

  beforeEach(async () => {
    const mockOrchestrator = {
      cleanupOldDeletedReadings: jest.fn(),
      archiveOldReadings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingsCleanupService,
        {
          provide: ReadingsOrchestratorService,
          useValue: mockOrchestrator,
        },
      ],
    }).compile();

    service = module.get<ReadingsCleanupService>(ReadingsCleanupService);
    orchestrator = module.get(ReadingsOrchestratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('runDailyCleanup', () => {
    it('should execute cleanup sequence in correct order', async () => {
      orchestrator.cleanupOldDeletedReadings.mockResolvedValue(5);
      orchestrator.archiveOldReadings
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);

      await service.runDailyCleanup();

      // Verify execution order
      expect(orchestrator.cleanupOldDeletedReadings).toHaveBeenCalledTimes(1);
      expect(orchestrator.archiveOldReadings).toHaveBeenCalledTimes(2);

      // Verify archiveOldReadings was called with correct arguments
      expect(orchestrator.archiveOldReadings).toHaveBeenNthCalledWith(
        1,
        UserPlan.FREE,
        READING_RETENTION_DAYS[UserPlan.FREE],
      );
      expect(orchestrator.archiveOldReadings).toHaveBeenNthCalledWith(
        2,
        UserPlan.PREMIUM,
        READING_RETENTION_DAYS[UserPlan.PREMIUM],
      );
    });

    it('should hard-delete soft-deleted readings first', async () => {
      orchestrator.cleanupOldDeletedReadings.mockResolvedValue(10);
      orchestrator.archiveOldReadings.mockResolvedValue(0);

      await service.runDailyCleanup();

      expect(orchestrator.cleanupOldDeletedReadings).toHaveBeenCalledTimes(1);
      expect(orchestrator.cleanupOldDeletedReadings).toHaveBeenCalledWith();
    });

    it('should archive FREE user readings older than 30 days', async () => {
      orchestrator.cleanupOldDeletedReadings.mockResolvedValue(0);
      orchestrator.archiveOldReadings
        .mockResolvedValueOnce(7)
        .mockResolvedValueOnce(0);

      await service.runDailyCleanup();

      expect(orchestrator.archiveOldReadings).toHaveBeenCalledWith(
        UserPlan.FREE,
        30,
      );
    });

    it('should archive PREMIUM user readings older than 365 days', async () => {
      orchestrator.cleanupOldDeletedReadings.mockResolvedValue(0);
      orchestrator.archiveOldReadings
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(4);

      await service.runDailyCleanup();

      expect(orchestrator.archiveOldReadings).toHaveBeenCalledWith(
        UserPlan.PREMIUM,
        365,
      );
    });

    it('should handle when no readings need cleanup', async () => {
      orchestrator.cleanupOldDeletedReadings.mockResolvedValue(0);
      orchestrator.archiveOldReadings.mockResolvedValue(0);

      await expect(service.runDailyCleanup()).resolves.not.toThrow();

      expect(orchestrator.cleanupOldDeletedReadings).toHaveBeenCalledTimes(1);
      expect(orchestrator.archiveOldReadings).toHaveBeenCalledTimes(2);
    });

    it('should handle errors gracefully and log them', async () => {
      const error = new Error('Database connection failed');
      orchestrator.cleanupOldDeletedReadings.mockRejectedValue(error);
      orchestrator.archiveOldReadings.mockResolvedValue(0);

      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');

      await service.runDailyCleanup();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error during hard-delete cleanup:',
        error,
      );
    });

    it('should log starting message', async () => {
      orchestrator.cleanupOldDeletedReadings.mockResolvedValue(0);
      orchestrator.archiveOldReadings.mockResolvedValue(0);

      const loggerLogSpy = jest.spyOn(service['logger'], 'log');

      await service.runDailyCleanup();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        'Starting daily readings cleanup...',
      );
    });

    it('should log hard-delete count', async () => {
      orchestrator.cleanupOldDeletedReadings.mockResolvedValue(12);
      orchestrator.archiveOldReadings.mockResolvedValue(0);

      const loggerLogSpy = jest.spyOn(service['logger'], 'log');

      await service.runDailyCleanup();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        'Hard-deleted 12 readings from trash',
      );
    });

    it('should log FREE user archived count', async () => {
      orchestrator.cleanupOldDeletedReadings.mockResolvedValue(0);
      orchestrator.archiveOldReadings
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(0);

      const loggerLogSpy = jest.spyOn(service['logger'], 'log');

      await service.runDailyCleanup();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        'Archived 8 old readings from FREE users',
      );
    });

    it('should log PREMIUM user archived count', async () => {
      orchestrator.cleanupOldDeletedReadings.mockResolvedValue(0);
      orchestrator.archiveOldReadings
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(5);

      const loggerLogSpy = jest.spyOn(service['logger'], 'log');

      await service.runDailyCleanup();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        'Archived 5 old readings from PREMIUM users',
      );
    });

    it('should log completion message', async () => {
      orchestrator.cleanupOldDeletedReadings.mockResolvedValue(0);
      orchestrator.archiveOldReadings.mockResolvedValue(0);

      const loggerLogSpy = jest.spyOn(service['logger'], 'log');

      await service.runDailyCleanup();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        'Daily readings cleanup completed successfully',
      );
    });

    it('should continue cleanup if hard-delete fails', async () => {
      orchestrator.cleanupOldDeletedReadings.mockRejectedValue(
        new Error('Hard-delete failed'),
      );
      orchestrator.archiveOldReadings.mockResolvedValue(5);

      await service.runDailyCleanup();

      // Should still attempt archiving despite hard-delete failure
      expect(orchestrator.cleanupOldDeletedReadings).toHaveBeenCalledTimes(1);
      expect(orchestrator.archiveOldReadings).toHaveBeenCalledTimes(2);
      expect(orchestrator.archiveOldReadings).toHaveBeenCalledWith(
        UserPlan.FREE,
        READING_RETENTION_DAYS[UserPlan.FREE],
      );
      expect(orchestrator.archiveOldReadings).toHaveBeenCalledWith(
        UserPlan.PREMIUM,
        READING_RETENTION_DAYS[UserPlan.PREMIUM],
      );
    });

    it('should use constants for retention days', async () => {
      orchestrator.cleanupOldDeletedReadings.mockResolvedValue(0);
      orchestrator.archiveOldReadings.mockResolvedValue(0);

      await service.runDailyCleanup();

      // Verify correct retention days from constants
      expect(orchestrator.archiveOldReadings).toHaveBeenCalledWith(
        UserPlan.FREE,
        READING_RETENTION_DAYS[UserPlan.FREE],
      );
      expect(orchestrator.archiveOldReadings).toHaveBeenCalledWith(
        UserPlan.PREMIUM,
        READING_RETENTION_DAYS[UserPlan.PREMIUM],
      );
    });
  });
});
