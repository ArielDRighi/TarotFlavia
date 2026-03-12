import { Test, TestingModule } from '@nestjs/testing';
import { HolisticServicesOrchestratorService } from './holistic-services-orchestrator.service';
import { GetAllActiveServicesUseCase } from '../use-cases/get-all-active-services.use-case';
import { GetServiceBySlugUseCase } from '../use-cases/get-service-by-slug.use-case';
import { AdminCreateServiceUseCase } from '../use-cases/admin-create-service.use-case';
import { AdminUpdateServiceUseCase } from '../use-cases/admin-update-service.use-case';
import { CreatePurchaseUseCase } from '../use-cases/create-purchase.use-case';
import { ApprovePurchaseUseCase } from '../use-cases/approve-purchase.use-case';
import { GetUserPurchasesUseCase } from '../use-cases/get-user-purchases.use-case';
import { GetPendingPaymentsUseCase } from '../use-cases/get-pending-payments.use-case';
import { CancelPurchaseUseCase } from '../use-cases/cancel-purchase.use-case';
import { GetPurchaseByIdUseCase } from '../use-cases/get-purchase-by-id.use-case';
import { HolisticServiceResponseDto } from '../dto/holistic-service-response.dto';
import { PurchaseResponseDto } from '../dto/purchase-response.dto';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';
import { SessionType } from '../../../scheduling/domain/enums';
import { CreateHolisticServiceDto } from '../dto/create-holistic-service.dto';
import { UpdateHolisticServiceDto } from '../dto/update-holistic-service.dto';
import { CreatePurchaseDto, ApprovePurchaseDto } from '../dto/purchase.dto';

const mockServiceResponse: HolisticServiceResponseDto = {
  id: 1,
  name: 'Trabajo con el Árbol Genealógico',
  slug: 'arbol-genealogico',
  shortDescription: '¿Qué heredamos del árbol familiar?',
  priceArs: 15000,
  durationMinutes: 60,
  sessionType: SessionType.FAMILY_TREE,
  imageUrl: null,
  displayOrder: 1,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockPurchaseResponse: PurchaseResponseDto = {
  id: 10,
  userId: 5,
  holisticServiceId: 1,
  sessionId: null,
  paymentStatus: PurchaseStatus.PENDING,
  amountArs: 15000,
  paymentReference: null,
  paidAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('HolisticServicesOrchestratorService', () => {
  let orchestrator: HolisticServicesOrchestratorService;
  let mockGetAllActive: jest.Mocked<
    Pick<GetAllActiveServicesUseCase, 'execute'>
  >;
  let mockGetBySlug: jest.Mocked<Pick<GetServiceBySlugUseCase, 'execute'>>;
  let mockAdminCreate: jest.Mocked<Pick<AdminCreateServiceUseCase, 'execute'>>;
  let mockAdminUpdate: jest.Mocked<Pick<AdminUpdateServiceUseCase, 'execute'>>;
  let mockCreatePurchase: jest.Mocked<Pick<CreatePurchaseUseCase, 'execute'>>;
  let mockApprovePurchase: jest.Mocked<Pick<ApprovePurchaseUseCase, 'execute'>>;
  let mockGetUserPurchases: jest.Mocked<
    Pick<GetUserPurchasesUseCase, 'execute'>
  >;
  let mockGetPendingPayments: jest.Mocked<
    Pick<GetPendingPaymentsUseCase, 'execute'>
  >;
  let mockCancelPurchase: jest.Mocked<Pick<CancelPurchaseUseCase, 'execute'>>;
  let mockGetPurchaseById: jest.Mocked<Pick<GetPurchaseByIdUseCase, 'execute'>>;

  beforeEach(async () => {
    mockGetAllActive = { execute: jest.fn() };
    mockGetBySlug = { execute: jest.fn() };
    mockAdminCreate = { execute: jest.fn() };
    mockAdminUpdate = { execute: jest.fn() };
    mockCreatePurchase = { execute: jest.fn() };
    mockApprovePurchase = { execute: jest.fn() };
    mockGetUserPurchases = { execute: jest.fn() };
    mockGetPendingPayments = { execute: jest.fn() };
    mockCancelPurchase = { execute: jest.fn() };
    mockGetPurchaseById = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HolisticServicesOrchestratorService,
        { provide: GetAllActiveServicesUseCase, useValue: mockGetAllActive },
        { provide: GetServiceBySlugUseCase, useValue: mockGetBySlug },
        { provide: AdminCreateServiceUseCase, useValue: mockAdminCreate },
        { provide: AdminUpdateServiceUseCase, useValue: mockAdminUpdate },
        { provide: CreatePurchaseUseCase, useValue: mockCreatePurchase },
        { provide: ApprovePurchaseUseCase, useValue: mockApprovePurchase },
        { provide: GetUserPurchasesUseCase, useValue: mockGetUserPurchases },
        {
          provide: GetPendingPaymentsUseCase,
          useValue: mockGetPendingPayments,
        },
        { provide: CancelPurchaseUseCase, useValue: mockCancelPurchase },
        { provide: GetPurchaseByIdUseCase, useValue: mockGetPurchaseById },
      ],
    }).compile();

    orchestrator = module.get(HolisticServicesOrchestratorService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAllActiveServices', () => {
    it('debe delegar en GetAllActiveServicesUseCase', async () => {
      mockGetAllActive.execute.mockResolvedValue([mockServiceResponse]);

      const result = await orchestrator.getAllActiveServices();

      expect(mockGetAllActive.execute).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('getServiceBySlug', () => {
    it('debe delegar en GetServiceBySlugUseCase con el slug correcto', async () => {
      mockGetBySlug.execute.mockResolvedValue({
        ...mockServiceResponse,
        longDescription: 'Descripción larga...',
      });

      const result = await orchestrator.getServiceBySlug('arbol-genealogico');

      expect(mockGetBySlug.execute).toHaveBeenCalledWith('arbol-genealogico');
      expect(result.slug).toBe('arbol-genealogico');
    });
  });

  describe('adminCreateService', () => {
    it('debe delegar en AdminCreateServiceUseCase con el DTO correcto', async () => {
      const createDto: CreateHolisticServiceDto = {
        name: 'Nuevo Servicio',
        slug: 'nuevo-servicio',
        shortDescription: 'Descripción corta',
        longDescription: 'Descripción larga...',
        priceArs: 10000,
        durationMinutes: 60,
        sessionType: SessionType.ENERGY_CLEANING,
        whatsappNumber: '+5491112345678',
        mercadoPagoLink: 'https://mpago.la/123',
      };
      mockAdminCreate.execute.mockResolvedValue({
        ...mockServiceResponse,
        ...createDto,
        longDescription: createDto.longDescription,
        whatsappNumber: createDto.whatsappNumber,
        mercadoPagoLink: createDto.mercadoPagoLink,
      });

      const result = await orchestrator.adminCreateService(createDto);

      expect(mockAdminCreate.execute).toHaveBeenCalledWith(createDto);
      expect(result.name).toBe('Nuevo Servicio');
    });
  });

  describe('adminUpdateService', () => {
    it('debe delegar en AdminUpdateServiceUseCase con id y DTO correctos', async () => {
      const updateDto: UpdateHolisticServiceDto = { priceArs: 20000 };
      mockAdminUpdate.execute.mockResolvedValue({
        ...mockServiceResponse,
        priceArs: 20000,
        longDescription: 'Descripción larga...',
        whatsappNumber: '+5491112345678',
        mercadoPagoLink: 'https://mpago.la/123',
      });

      const result = await orchestrator.adminUpdateService(1, updateDto);

      expect(mockAdminUpdate.execute).toHaveBeenCalledWith(1, updateDto);
      expect(result.priceArs).toBe(20000);
    });
  });

  describe('createPurchase', () => {
    it('debe delegar en CreatePurchaseUseCase con userId y DTO correctos', async () => {
      const dto: CreatePurchaseDto = { holisticServiceId: 1 };
      mockCreatePurchase.execute.mockResolvedValue(mockPurchaseResponse);

      const result = await orchestrator.createPurchase(5, dto);

      expect(mockCreatePurchase.execute).toHaveBeenCalledWith(5, dto);
      expect(result.paymentStatus).toBe(PurchaseStatus.PENDING);
    });
  });

  describe('approvePurchase', () => {
    it('debe delegar en ApprovePurchaseUseCase con purchaseId, adminId y DTO', async () => {
      const dto: ApprovePurchaseDto = { paymentReference: 'MP-123' };
      mockApprovePurchase.execute.mockResolvedValue({
        ...mockPurchaseResponse,
        paymentStatus: PurchaseStatus.PAID,
      });

      const result = await orchestrator.approvePurchase(10, 99, dto);

      expect(mockApprovePurchase.execute).toHaveBeenCalledWith(10, 99, dto);
      expect(result.paymentStatus).toBe(PurchaseStatus.PAID);
    });
  });

  describe('getUserPurchases', () => {
    it('debe delegar en GetUserPurchasesUseCase con el userId correcto', async () => {
      mockGetUserPurchases.execute.mockResolvedValue([mockPurchaseResponse]);

      const result = await orchestrator.getUserPurchases(5);

      expect(mockGetUserPurchases.execute).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(1);
    });
  });

  describe('getPendingPayments', () => {
    it('debe delegar en GetPendingPaymentsUseCase', async () => {
      mockGetPendingPayments.execute.mockResolvedValue([mockPurchaseResponse]);

      const result = await orchestrator.getPendingPayments();

      expect(mockGetPendingPayments.execute).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('cancelPurchase', () => {
    it('debe delegar en CancelPurchaseUseCase con los parámetros correctos', async () => {
      mockCancelPurchase.execute.mockResolvedValue({
        ...mockPurchaseResponse,
        paymentStatus: PurchaseStatus.CANCELLED,
      });

      const result = await orchestrator.cancelPurchase(10, 5, false);

      expect(mockCancelPurchase.execute).toHaveBeenCalledWith(10, 5, false);
      expect(result.paymentStatus).toBe(PurchaseStatus.CANCELLED);
    });
  });

  describe('getPurchaseById', () => {
    it('debe delegar en GetPurchaseByIdUseCase con purchaseId y requestingUserId', async () => {
      mockGetPurchaseById.execute.mockResolvedValue(mockPurchaseResponse);

      const result = await orchestrator.getPurchaseById(10, 5);

      expect(mockGetPurchaseById.execute).toHaveBeenCalledWith(10, 5);
      expect(result.id).toBe(10);
    });
  });
});
