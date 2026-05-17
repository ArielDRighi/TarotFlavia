import { Test, TestingModule } from '@nestjs/testing';
import { ExpirePendingPurchasesUseCase } from './expire-pending-purchases.use-case';
import { SERVICE_PURCHASE_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { IServicePurchaseRepository } from '../../domain/interfaces/service-purchase-repository.interface';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';
import { ServicePurchase } from '../../entities/service-purchase.entity';

describe('ExpirePendingPurchasesUseCase', () => {
  let useCase: ExpirePendingPurchasesUseCase;
  let mockRepository: jest.Mocked<
    Pick<IServicePurchaseRepository, 'findPendingBeforeDate' | 'updateStatus'>
  >;

  const buildPurchase = (id: number, selectedDate: string): ServicePurchase =>
    ({
      id,
      userId: 1,
      holisticServiceId: 1,
      paymentStatus: PurchaseStatus.PENDING,
      selectedDate,
      amountArs: 1000,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    }) as ServicePurchase;

  beforeEach(async () => {
    mockRepository = {
      findPendingBeforeDate: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpirePendingPurchasesUseCase,
        { provide: SERVICE_PURCHASE_REPOSITORY, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get(ExpirePendingPurchasesUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return zero counts when there are no expired purchases', async () => {
      mockRepository.findPendingBeforeDate.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result.expired).toBe(0);
      expect(result.failed).toBe(0);
      expect(mockRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should mark all found pending purchases as EXPIRED', async () => {
      const purchases = [
        buildPurchase(1, '2026-05-10'),
        buildPurchase(2, '2026-05-11'),
        buildPurchase(3, '2026-05-12'),
      ];
      mockRepository.findPendingBeforeDate.mockResolvedValue(purchases);
      mockRepository.updateStatus.mockResolvedValue({
        ...purchases[0],
        paymentStatus: PurchaseStatus.EXPIRED,
      } as ServicePurchase);

      const result = await useCase.execute();

      expect(result.expired).toBe(3);
      expect(result.failed).toBe(0);
      expect(mockRepository.updateStatus).toHaveBeenCalledTimes(3);
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(
        1,
        PurchaseStatus.EXPIRED,
      );
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(
        2,
        PurchaseStatus.EXPIRED,
      );
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(
        3,
        PurchaseStatus.EXPIRED,
      );
    });

    it('should count failures when updateStatus returns null for a purchase', async () => {
      const purchases = [buildPurchase(1, '2026-05-10')];
      mockRepository.findPendingBeforeDate.mockResolvedValue(purchases);
      mockRepository.updateStatus.mockResolvedValue(null);

      const result = await useCase.execute();

      expect(result.expired).toBe(0);
      expect(result.failed).toBe(1);
    });

    it('should count failures when updateStatus throws an error', async () => {
      const purchases = [
        buildPurchase(1, '2026-05-10'),
        buildPurchase(2, '2026-05-11'),
      ];
      mockRepository.findPendingBeforeDate.mockResolvedValue(purchases);
      mockRepository.updateStatus
        .mockResolvedValueOnce({
          ...purchases[0],
          paymentStatus: PurchaseStatus.EXPIRED,
        } as ServicePurchase)
        .mockRejectedValueOnce(new Error('DB error'));

      const result = await useCase.execute();

      expect(result.expired).toBe(1);
      expect(result.failed).toBe(1);
    });

    it('should pass the correct cutoff date (24h grace period before today)', async () => {
      // Fix "today" so the test is deterministic
      const fixedNow = new Date('2026-05-17T03:00:00.000Z');
      jest.useFakeTimers({ now: fixedNow });

      mockRepository.findPendingBeforeDate.mockResolvedValue([]);

      await useCase.execute();

      // Cutoff = today - 1 day = 2026-05-16 formatted as YYYY-MM-DD
      expect(mockRepository.findPendingBeforeDate).toHaveBeenCalledWith(
        '2026-05-16',
      );

      jest.useRealTimers();
    });

    it('should be idempotent: running twice with same data returns zero on second run', async () => {
      const purchases = [buildPurchase(1, '2026-05-10')];
      mockRepository.findPendingBeforeDate
        .mockResolvedValueOnce(purchases)
        .mockResolvedValueOnce([]);
      mockRepository.updateStatus.mockResolvedValue({
        ...purchases[0],
        paymentStatus: PurchaseStatus.EXPIRED,
      } as ServicePurchase);

      const first = await useCase.execute();
      const second = await useCase.execute();

      expect(first.expired).toBe(1);
      expect(second.expired).toBe(0);
    });

    it('should process all purchases even when some fail (no early exit)', async () => {
      const purchases = [
        buildPurchase(1, '2026-05-10'),
        buildPurchase(2, '2026-05-11'),
        buildPurchase(3, '2026-05-12'),
      ];
      mockRepository.findPendingBeforeDate.mockResolvedValue(purchases);
      mockRepository.updateStatus
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce({
          ...purchases[1],
          paymentStatus: PurchaseStatus.EXPIRED,
        } as ServicePurchase)
        .mockRejectedValueOnce(new Error('fail'));

      const result = await useCase.execute();

      expect(result.expired).toBe(1);
      expect(result.failed).toBe(2);
      // All 3 attempts were made
      expect(mockRepository.updateStatus).toHaveBeenCalledTimes(3);
    });
  });
});
