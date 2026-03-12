import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmServicePurchaseRepository } from './typeorm-service-purchase.repository';
import { ServicePurchase } from '../../entities/service-purchase.entity';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';

describe('TypeOrmServicePurchaseRepository', () => {
  let repository: TypeOrmServicePurchaseRepository;
  let typeOrmRepository: jest.Mocked<Repository<ServicePurchase>>;

  const mockPurchase: ServicePurchase = {
    id: 1,
    userId: 10,
    holisticServiceId: 1,
    sessionId: null,
    paymentStatus: PurchaseStatus.PENDING,
    amountArs: 15000,
    paymentReference: null,
    paidAt: null,
    approvedByAdminId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as ServicePurchase;

  const mockPaidPurchase: ServicePurchase = {
    ...mockPurchase,
    id: 2,
    paymentStatus: PurchaseStatus.PAID,
    paidAt: new Date(),
    approvedByAdminId: 99,
  } as ServicePurchase;

  beforeEach(async () => {
    const mockTypeOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmServicePurchaseRepository,
        {
          provide: getRepositoryToken(ServicePurchase),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmServicePurchaseRepository>(
      TypeOrmServicePurchaseRepository,
    );
    typeOrmRepository = module.get(getRepositoryToken(ServicePurchase));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should create and save a new purchase', async () => {
      const purchaseData: Partial<ServicePurchase> = {
        userId: 10,
        holisticServiceId: 1,
        amountArs: 15000,
        paymentStatus: PurchaseStatus.PENDING,
      };

      typeOrmRepository.create.mockReturnValue(mockPurchase);
      typeOrmRepository.save.mockResolvedValue(mockPurchase);

      const result = await repository.save(purchaseData);

      expect(typeOrmRepository.create).toHaveBeenCalledWith(purchaseData);
      expect(typeOrmRepository.save).toHaveBeenCalledWith(mockPurchase);
      expect(result).toEqual(mockPurchase);
    });
  });

  describe('findById', () => {
    it('should find a purchase by id', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockPurchase);

      const result = await repository.findById(1);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockPurchase);
    });

    it('should return null when purchase not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find all purchases by userId ordered by createdAt DESC', async () => {
      typeOrmRepository.find.mockResolvedValue([mockPurchase]);

      const result = await repository.findByUserId(10);

      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: { userId: 10 },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockPurchase]);
    });

    it('should return empty array when user has no purchases', async () => {
      typeOrmRepository.find.mockResolvedValue([]);

      const result = await repository.findByUserId(999);

      expect(result).toEqual([]);
    });
  });

  describe('findByUserIdWithService', () => {
    it('should find purchases by userId with holisticService relation', async () => {
      typeOrmRepository.find.mockResolvedValue([mockPurchase]);

      const result = await repository.findByUserIdWithService(10);

      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: { userId: 10 },
        relations: ['holisticService'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockPurchase]);
    });
  });

  describe('findPendingByUserAndService', () => {
    it('should find pending purchase by userId and holisticServiceId', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockPurchase);

      const result = await repository.findPendingByUserAndService(10, 1);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: 10,
          holisticServiceId: 1,
          paymentStatus: PurchaseStatus.PENDING,
        },
      });
      expect(result).toEqual(mockPurchase);
    });

    it('should return null when no pending purchase found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findPendingByUserAndService(10, 999);

      expect(result).toBeNull();
    });
  });

  describe('findPendingPayments', () => {
    it('should find all purchases with PENDING status with relations', async () => {
      typeOrmRepository.find.mockResolvedValue([mockPurchase]);

      const result = await repository.findPendingPayments();

      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: { paymentStatus: PurchaseStatus.PENDING },
        relations: ['user', 'holisticService'],
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual([mockPurchase]);
    });
  });

  describe('findByIdWithRelations', () => {
    it('should find a purchase by id with all relations', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockPurchase);

      const result = await repository.findByIdWithRelations(1);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user', 'holisticService', 'session'],
      });
      expect(result).toEqual(mockPurchase);
    });

    it('should return null when purchase not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByIdWithRelations(999);

      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update payment status and return updated purchase', async () => {
      const extra: Partial<ServicePurchase> = {
        paidAt: new Date(),
        approvedByAdminId: 99,
        paymentReference: 'REF-123',
      };

      typeOrmRepository.update.mockResolvedValue({ affected: 1 } as never);
      typeOrmRepository.findOne.mockResolvedValue(mockPaidPurchase);

      const result = await repository.updateStatus(
        1,
        PurchaseStatus.PAID,
        extra,
      );

      expect(typeOrmRepository.update).toHaveBeenCalledWith(1, {
        paidAt: extra.paidAt,
        approvedByAdminId: extra.approvedByAdminId,
        paymentReference: extra.paymentReference,
        paymentStatus: PurchaseStatus.PAID,
      });
      expect(result).toEqual(mockPaidPurchase);
    });

    it('should update status without extra fields', async () => {
      const cancelledPurchase = {
        ...mockPurchase,
        paymentStatus: PurchaseStatus.CANCELLED,
      } as ServicePurchase;

      typeOrmRepository.update.mockResolvedValue({ affected: 1 } as never);
      typeOrmRepository.findOne.mockResolvedValue(cancelledPurchase);

      const result = await repository.updateStatus(1, PurchaseStatus.CANCELLED);

      expect(typeOrmRepository.update).toHaveBeenCalledWith(1, {
        paymentStatus: PurchaseStatus.CANCELLED,
      });
      expect(result).toEqual(cancelledPurchase);
    });

    it('should return null when purchase to update is not found', async () => {
      typeOrmRepository.update.mockResolvedValue({ affected: 0 } as never);
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.updateStatus(999, PurchaseStatus.PAID);

      expect(result).toBeNull();
    });

    it('should not allow paymentStatus in extra to override the status argument', async () => {
      // extra provides a different paymentStatus — status argument must always win
      const extra: Partial<ServicePurchase> = {
        paymentStatus: PurchaseStatus.CANCELLED,
        paidAt: new Date(),
        approvedByAdminId: 99,
      };

      typeOrmRepository.update.mockResolvedValue({ affected: 1 } as never);
      typeOrmRepository.findOne.mockResolvedValue(mockPaidPurchase);

      await repository.updateStatus(1, PurchaseStatus.PAID, extra);

      const updateCall = typeOrmRepository.update.mock
        .calls[0][1] as Partial<ServicePurchase>;
      expect(updateCall.paymentStatus).toBe(PurchaseStatus.PAID);
    });
  });
});
