import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { HolisticServicesController } from './holistic-services.controller';
import { HolisticServicesOrchestratorService } from '../../application/orchestrators/holistic-services-orchestrator.service';
import { PurchaseResponseDto } from '../../application/dto/purchase-response.dto';
import { CreatePurchaseDto } from '../../application/dto/purchase.dto';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';

describe('HolisticServicesController', () => {
  let controller: HolisticServicesController;

  const mockOrchestrator: jest.Mocked<
    Pick<
      HolisticServicesOrchestratorService,
      | 'createPurchase'
      | 'getUserPurchases'
      | 'getPurchaseById'
      | 'cancelPurchase'
    >
  > = {
    createPurchase: jest.fn(),
    getUserPurchases: jest.fn(),
    getPurchaseById: jest.fn(),
    cancelPurchase: jest.fn(),
  };

  const mockPurchase: PurchaseResponseDto = {
    id: 1,
    userId: 42,
    holisticServiceId: 1,
    sessionId: null,
    paymentStatus: PurchaseStatus.PENDING,
    amountArs: 15000,
    paymentReference: null,
    paidAt: null,
    preferenceId: null,
    initPoint: null,
    selectedDate: null,
    selectedTime: null,
    mercadoPagoPaymentId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockRequest = { user: { userId: 42, email: 'user@test.com' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HolisticServicesController],
      providers: [
        {
          provide: HolisticServicesOrchestratorService,
          useValue: mockOrchestrator,
        },
      ],
    }).compile();

    controller = module.get<HolisticServicesController>(
      HolisticServicesController,
    );
    jest.clearAllMocks();
  });

  describe('POST /holistic-services/purchases', () => {
    it('should create a purchase for authenticated user', async () => {
      const dto: CreatePurchaseDto = { holisticServiceId: 1 };
      mockOrchestrator.createPurchase.mockResolvedValue(mockPurchase);

      const result = await controller.createPurchase(mockRequest, dto);

      expect(result).toEqual(mockPurchase);
      expect(mockOrchestrator.createPurchase).toHaveBeenCalledWith(
        42,
        dto,
        'user@test.com',
      );
    });

    it('should propagate errors from orchestrator', async () => {
      const dto: CreatePurchaseDto = { holisticServiceId: 1 };
      mockOrchestrator.createPurchase.mockRejectedValue(
        new NotFoundException('Servicio no encontrado'),
      );

      await expect(controller.createPurchase(mockRequest, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('GET /holistic-services/purchases/my', () => {
    it('should return purchases for authenticated user', async () => {
      mockOrchestrator.getUserPurchases.mockResolvedValue([mockPurchase]);

      const result = await controller.getMyPurchases(mockRequest);

      expect(result).toEqual([mockPurchase]);
      expect(mockOrchestrator.getUserPurchases).toHaveBeenCalledWith(42);
    });

    it('should return empty array when user has no purchases', async () => {
      mockOrchestrator.getUserPurchases.mockResolvedValue([]);

      const result = await controller.getMyPurchases(mockRequest);

      expect(result).toEqual([]);
    });
  });

  describe('GET /holistic-services/purchases/:id', () => {
    it('should return purchase detail for owner', async () => {
      mockOrchestrator.getPurchaseById.mockResolvedValue(mockPurchase);

      const result = await controller.getPurchaseById(mockRequest, 1);

      expect(result).toEqual(mockPurchase);
      expect(mockOrchestrator.getPurchaseById).toHaveBeenCalledWith(1, 42);
    });

    it('should throw NotFoundException when purchase not found', async () => {
      mockOrchestrator.getPurchaseById.mockRejectedValue(
        new NotFoundException('Compra no encontrada'),
      );

      await expect(
        controller.getPurchaseById(mockRequest, 999),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      mockOrchestrator.getPurchaseById.mockRejectedValue(
        new ForbiddenException('No tienes permiso para ver esta compra'),
      );

      await expect(controller.getPurchaseById(mockRequest, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('PATCH /holistic-services/purchases/:id/cancel', () => {
    it('should cancel a purchase for the owner', async () => {
      const cancelledPurchase: PurchaseResponseDto = {
        ...mockPurchase,
        paymentStatus: PurchaseStatus.CANCELLED,
      };
      mockOrchestrator.cancelPurchase.mockResolvedValue(cancelledPurchase);

      const result = await controller.cancelPurchase(mockRequest, 1);

      expect(result).toEqual(cancelledPurchase);
      expect(mockOrchestrator.cancelPurchase).toHaveBeenCalledWith(
        1,
        42,
        false,
      );
    });

    it('should propagate errors from orchestrator', async () => {
      mockOrchestrator.cancelPurchase.mockRejectedValue(
        new NotFoundException('Compra no encontrada'),
      );

      await expect(controller.cancelPurchase(mockRequest, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
