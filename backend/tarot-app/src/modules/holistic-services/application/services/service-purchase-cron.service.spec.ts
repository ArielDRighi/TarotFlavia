import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ServicePurchaseCronService } from './service-purchase-cron.service';
import { ExpirePendingPurchasesUseCase } from '../use-cases/expire-pending-purchases.use-case';

describe('ServicePurchaseCronService', () => {
  let cronService: ServicePurchaseCronService;
  let mockExpireUseCase: jest.Mocked<
    Pick<ExpirePendingPurchasesUseCase, 'execute'>
  >;

  beforeEach(async () => {
    mockExpireUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicePurchaseCronService,
        {
          provide: ExpirePendingPurchasesUseCase,
          useValue: mockExpireUseCase,
        },
      ],
    }).compile();

    cronService = module.get(ServicePurchaseCronService);

    // Silence logger output in tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('expirePendingPurchases', () => {
    it('should call ExpirePendingPurchasesUseCase.execute', async () => {
      mockExpireUseCase.execute.mockResolvedValue({ expired: 3, failed: 0 });

      await cronService.expirePendingPurchases();

      expect(mockExpireUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should log the number of expired purchases when > 0', async () => {
      mockExpireUseCase.execute.mockResolvedValue({ expired: 5, failed: 0 });
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await cronService.expirePendingPurchases();

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('5'),
        expect.any(String),
      );
    });

    it('should log a warning when some purchases failed to update', async () => {
      mockExpireUseCase.execute.mockResolvedValue({ expired: 2, failed: 1 });
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      await cronService.expirePendingPurchases();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('1'),
        expect.any(String),
      );
    });

    it('should log and not rethrow when the use-case throws an error', async () => {
      mockExpireUseCase.execute.mockRejectedValue(new Error('DB failure'));
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(
        cronService.expirePendingPurchases(),
      ).resolves.toBeUndefined();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should not log a warning when there are no failures', async () => {
      mockExpireUseCase.execute.mockResolvedValue({ expired: 0, failed: 0 });
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      await cronService.expirePendingPurchases();

      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
