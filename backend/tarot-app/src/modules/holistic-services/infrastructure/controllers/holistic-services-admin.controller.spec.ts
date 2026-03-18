import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { HolisticServicesAdminController } from './holistic-services-admin.controller';
import { HolisticServicesOrchestratorService } from '../../application/orchestrators/holistic-services-orchestrator.service';
import { HolisticServiceAdminResponseDto } from '../../application/dto/holistic-service-response.dto';
import { PurchaseResponseDto } from '../../application/dto/purchase-response.dto';
import { CreateHolisticServiceDto } from '../../application/dto/create-holistic-service.dto';
import { UpdateHolisticServiceDto } from '../../application/dto/update-holistic-service.dto';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';
import { SessionType } from '../../../scheduling/domain/enums';

describe('HolisticServicesAdminController', () => {
  let controller: HolisticServicesAdminController;

  const mockOrchestrator: jest.Mocked<
    Pick<
      HolisticServicesOrchestratorService,
      | 'adminCreateService'
      | 'adminUpdateService'
      | 'adminGetAllServices'
      | 'getAllPurchases'
    >
  > = {
    adminCreateService: jest.fn(),
    adminUpdateService: jest.fn(),
    adminGetAllServices: jest.fn(),
    getAllPurchases: jest.fn(),
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
    preferenceId: null,
    initPoint: null,
    selectedDate: null,
    selectedTime: null,
    mercadoPagoPaymentId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPaidPurchase: PurchaseResponseDto = {
    id: 2,
    userId: 11,
    holisticServiceId: 1,
    sessionId: null,
    paymentStatus: PurchaseStatus.PAID,
    amountArs: 15000,
    paymentReference: 'MP-REF-001',
    paidAt: new Date('2024-02-01'),
    preferenceId: 'pref_abc123',
    initPoint: null,
    selectedDate: '2024-03-01',
    selectedTime: '14:30',
    mercadoPagoPaymentId: 'pay_987654321',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-01'),
  };

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
      mockOrchestrator.adminGetAllServices.mockResolvedValue([]);

      const result = await controller.getAllServices();

      expect(result).toEqual([]);
      expect(mockOrchestrator.adminGetAllServices).toHaveBeenCalledTimes(1);
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
    it('should return all purchases (all statuses) as transaction history', async () => {
      mockOrchestrator.getAllPurchases.mockResolvedValue([
        mockPendingPurchase,
        mockPaidPurchase,
      ]);

      const result = await controller.getAllPurchases();

      expect(result).toEqual([mockPendingPurchase, mockPaidPurchase]);
      expect(mockOrchestrator.getAllPurchases).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no purchases exist', async () => {
      mockOrchestrator.getAllPurchases.mockResolvedValue([]);

      const result = await controller.getAllPurchases();

      expect(result).toEqual([]);
    });

    it('should include mercadoPagoPaymentId in the response', async () => {
      mockOrchestrator.getAllPurchases.mockResolvedValue([mockPaidPurchase]);

      const result = await controller.getAllPurchases();

      expect(result[0].mercadoPagoPaymentId).toBe('pay_987654321');
    });
  });

  describe('PATCH /admin/holistic-services/payments/:id/approve — REMOVED', () => {
    it('should not have an approvePayment method on the controller', () => {
      expect(
        (controller as unknown as Record<string, unknown>)['approvePayment'],
      ).toBeUndefined();
    });
  });
});
