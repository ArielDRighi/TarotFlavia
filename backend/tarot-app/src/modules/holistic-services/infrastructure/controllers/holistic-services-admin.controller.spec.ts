import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { HolisticServicesAdminController } from './holistic-services-admin.controller';
import { HolisticServicesOrchestratorService } from '../../application/orchestrators/holistic-services-orchestrator.service';
import { HolisticServiceAdminResponseDto } from '../../application/dto/holistic-service-response.dto';
import { PurchaseResponseDto } from '../../application/dto/purchase-response.dto';
import { CreateHolisticServiceDto } from '../../application/dto/create-holistic-service.dto';
import { UpdateHolisticServiceDto } from '../../application/dto/update-holistic-service.dto';
import { ApprovePurchaseDto } from '../../application/dto/purchase.dto';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';
import { SessionType } from '../../../scheduling/domain/enums';

describe('HolisticServicesAdminController', () => {
  let controller: HolisticServicesAdminController;

  const mockOrchestrator: jest.Mocked<
    Pick<
      HolisticServicesOrchestratorService,
      | 'adminCreateService'
      | 'adminUpdateService'
      | 'getAllActiveServices'
      | 'approvePurchase'
      | 'getPendingPayments'
    >
  > = {
    adminCreateService: jest.fn(),
    adminUpdateService: jest.fn(),
    getAllActiveServices: jest.fn(),
    approvePurchase: jest.fn(),
    getPendingPayments: jest.fn(),
  };

  const mockAdminService: HolisticServiceAdminResponseDto = {
    id: 1,
    name: 'Trabajo con el Árbol Genealógico',
    slug: 'arbol-genealogico',
    shortDescription: 'Descripción corta',
    longDescription: 'Descripción larga',
    priceArs: 15000,
    durationMinutes: 60,
    sessionType: SessionType.FAMILY_TREE,
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
    whatsappNumber: '+5491112345678',
    mercadoPagoLink: 'https://mpago.la/1234567',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPendingPurchase: PurchaseResponseDto = {
    id: 1,
    userId: 10,
    holisticServiceId: 1,
    sessionId: null,
    paymentStatus: PurchaseStatus.PENDING,
    amountArs: 15000,
    paymentReference: null,
    paidAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockAdminRequest = { user: { userId: 99 } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HolisticServicesAdminController],
      providers: [
        {
          provide: HolisticServicesOrchestratorService,
          useValue: mockOrchestrator,
        },
      ],
    }).compile();

    controller = module.get<HolisticServicesAdminController>(
      HolisticServicesAdminController,
    );
    jest.clearAllMocks();
  });

  describe('GET /admin/holistic-services', () => {
    it('should return all services including inactive', async () => {
      mockOrchestrator.getAllActiveServices.mockResolvedValue([]);

      const result = await controller.getAllServices();

      expect(result).toEqual([]);
      expect(mockOrchestrator.getAllActiveServices).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /admin/holistic-services', () => {
    it('should create a new holistic service', async () => {
      const dto: CreateHolisticServiceDto = {
        name: 'Trabajo con el Árbol Genealógico',
        slug: 'arbol-genealogico',
        shortDescription: 'Descripción corta',
        longDescription: 'Descripción larga',
        priceArs: 15000,
        durationMinutes: 60,
        sessionType: SessionType.FAMILY_TREE,
        whatsappNumber: '+5491112345678',
        mercadoPagoLink: 'https://mpago.la/1234567',
        displayOrder: 1,
      };
      mockOrchestrator.adminCreateService.mockResolvedValue(mockAdminService);

      const result = await controller.createService(dto);

      expect(result).toEqual(mockAdminService);
      expect(mockOrchestrator.adminCreateService).toHaveBeenCalledWith(dto);
    });
  });

  describe('PATCH /admin/holistic-services/:id', () => {
    it('should update an existing service', async () => {
      const dto: UpdateHolisticServiceDto = { priceArs: 20000 };
      const updatedService: HolisticServiceAdminResponseDto = {
        ...mockAdminService,
        priceArs: 20000,
      };
      mockOrchestrator.adminUpdateService.mockResolvedValue(updatedService);

      const result = await controller.updateService(1, dto);

      expect(result).toEqual(updatedService);
      expect(mockOrchestrator.adminUpdateService).toHaveBeenCalledWith(1, dto);
    });

    it('should throw NotFoundException when service not found', async () => {
      const dto: UpdateHolisticServiceDto = { priceArs: 20000 };
      mockOrchestrator.adminUpdateService.mockRejectedValue(
        new NotFoundException('Servicio no encontrado'),
      );

      await expect(controller.updateService(999, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('GET /admin/holistic-services/payments', () => {
    it('should return list of pending payments', async () => {
      mockOrchestrator.getPendingPayments.mockResolvedValue([
        mockPendingPurchase,
      ]);

      const result = await controller.getPendingPayments();

      expect(result).toEqual([mockPendingPurchase]);
      expect(mockOrchestrator.getPendingPayments).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no pending payments', async () => {
      mockOrchestrator.getPendingPayments.mockResolvedValue([]);

      const result = await controller.getPendingPayments();

      expect(result).toEqual([]);
    });
  });

  describe('PATCH /admin/holistic-services/payments/:id/approve', () => {
    it('should approve a pending payment', async () => {
      const dto: ApprovePurchaseDto = { paymentReference: 'MP-12345678' };
      const approvedPurchase: PurchaseResponseDto = {
        ...mockPendingPurchase,
        paymentStatus: PurchaseStatus.PAID,
        paymentReference: 'MP-12345678',
        paidAt: new Date(),
        whatsappNumber: '+5491112345678',
      };
      mockOrchestrator.approvePurchase.mockResolvedValue(approvedPurchase);

      const result = await controller.approvePayment(mockAdminRequest, 1, dto);

      expect(result).toEqual(approvedPurchase);
      expect(mockOrchestrator.approvePurchase).toHaveBeenCalledWith(1, 99, dto);
    });

    it('should throw NotFoundException when purchase not found', async () => {
      const dto: ApprovePurchaseDto = {};
      mockOrchestrator.approvePurchase.mockRejectedValue(
        new NotFoundException('Compra no encontrada'),
      );

      await expect(
        controller.approvePayment(mockAdminRequest, 999, dto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
