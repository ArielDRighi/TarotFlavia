import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePurchaseUseCase } from './create-purchase.use-case';
import { GetUserPurchasesUseCase } from './get-user-purchases.use-case';
import { GetAllPurchasesUseCase } from './get-all-purchases.use-case';
import { CancelPurchaseUseCase } from './cancel-purchase.use-case';
import { GetPurchaseByIdUseCase } from './get-purchase-by-id.use-case';
import {
  HOLISTIC_SERVICE_REPOSITORY,
  IHolisticServiceRepository,
  SERVICE_PURCHASE_REPOSITORY,
  IServicePurchaseRepository,
} from '../../domain/interfaces';
import { HolisticService } from '../../entities/holistic-service.entity';
import { ServicePurchase } from '../../entities/service-purchase.entity';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';
import { SessionType } from '../../../scheduling/domain/enums';
import { CreatePurchaseDto } from '../dto/purchase.dto';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoService } from '../../../payments/infrastructure/services/mercadopago.service';

const mockService: HolisticService = {
  id: 1,
  name: 'Trabajo con el Árbol Genealógico',
  slug: 'arbol-genealogico',
  shortDescription: '¿Qué heredamos del árbol familiar?',
  longDescription: 'Descripción larga...',
  priceArs: 15000,
  durationMinutes: 60,
  sessionType: SessionType.FAMILY_TREE,
  whatsappNumber: '+5491112345678',
  mercadoPagoLink: 'https://mpago.la/1234567',
  imageUrl: null,
  displayOrder: 1,
  isActive: true,
  purchases: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockPurchasePending: ServicePurchase = {
  id: 10,
  userId: 5,
  user: { id: 5, email: 'user@test.com' } as ServicePurchase['user'],
  holisticServiceId: 1,
  holisticService: mockService,
  sessionId: null,
  session: null,
  paymentStatus: PurchaseStatus.PENDING,
  amountArs: 15000,
  paymentReference: null,
  paidAt: null,
  approvedByAdminId: null,
  selectedDate: null,
  selectedTime: null,
  mercadoPagoPaymentId: null,
  preferenceId: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockPurchasePaid: ServicePurchase = {
  ...mockPurchasePending,
  id: 11,
  paymentStatus: PurchaseStatus.PAID,
  paidAt: new Date('2026-01-02'),
  approvedByAdminId: 99,
};

describe('CreatePurchaseUseCase', () => {
  let useCase: CreatePurchaseUseCase;
  let mockServiceRepo: jest.Mocked<IHolisticServiceRepository>;
  let mockPurchaseRepo: jest.Mocked<IServicePurchaseRepository>;
  let mockMpService: jest.Mocked<Pick<MercadoPagoService, 'createPreference'>>;

  const dto: CreatePurchaseDto = { holisticServiceId: 1 };

  beforeEach(async () => {
    mockServiceRepo = {
      findAllActive: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    mockPurchaseRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdWithService: jest.fn(),
      findPendingByUserAndService: jest.fn(),
      findPendingPayments: jest.fn(),
      findAllPurchases: jest.fn(),
      findByIdWithRelations: jest.fn(),
      updateStatus: jest.fn(),
      updateStatusIfCurrent: jest.fn(),
      findPaidUnassignedByUserAndSessionType: jest.fn(),
      findByMercadoPagoPaymentId: jest.fn(),
      findByPreferenceId: jest.fn(),
      findActiveByDate: jest.fn(),
    };
    mockMpService = {
      createPreference: jest.fn().mockResolvedValue({
        preferenceId: 'pref_test123',
        initPoint:
          'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_test123',
      }),
    };

    const mockConfigServiceFn = jest.fn().mockReturnValue('http://localhost:3001');
    const mockConfigService = {
      get: mockConfigServiceFn,
      getOrThrow: mockConfigServiceFn,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePurchaseUseCase,
        { provide: HOLISTIC_SERVICE_REPOSITORY, useValue: mockServiceRepo },
        { provide: SERVICE_PURCHASE_REPOSITORY, useValue: mockPurchaseRepo },
        { provide: MercadoPagoService, useValue: mockMpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    useCase = module.get(CreatePurchaseUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  it('debe crear una compra PENDING y retornar el PurchaseResponseDto', async () => {
    mockServiceRepo.findById.mockResolvedValue(mockService);
    mockPurchaseRepo.findPendingByUserAndService.mockResolvedValue(null);
    mockPurchaseRepo.save.mockResolvedValue(mockPurchasePending);
    mockPurchaseRepo.updateStatus.mockResolvedValue(mockPurchasePending);

    const result = await useCase.execute(5, dto, 'user@test.com');

    expect(result.id).toBe(10);
    expect(result.paymentStatus).toBe(PurchaseStatus.PENDING);
    expect(result.userId).toBe(5);
    expect(mockPurchaseRepo.save).toHaveBeenCalledTimes(1);
  });

  it('debe guardar preferenceId y retornar initPoint cuando MP responde OK', async () => {
    mockServiceRepo.findById.mockResolvedValue(mockService);
    mockPurchaseRepo.findPendingByUserAndService.mockResolvedValue(null);
    mockPurchaseRepo.save.mockResolvedValue(mockPurchasePending);
    mockPurchaseRepo.updateStatus.mockResolvedValue(mockPurchasePending);

    const result = await useCase.execute(5, dto, 'user@test.com');

    expect(mockMpService.createPreference).toHaveBeenCalledTimes(1);
    expect(result.initPoint).toContain('mercadopago.com.ar');
  });

  it('debe lanzar NotFoundException si el servicio no existe', async () => {
    mockServiceRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(5, dto, 'user@test.com')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockPurchaseRepo.save).not.toHaveBeenCalled();
  });

  it('debe lanzar BadRequestException si el servicio está inactivo', async () => {
    mockServiceRepo.findById.mockResolvedValue({
      ...mockService,
      isActive: false,
    });

    await expect(useCase.execute(5, dto, 'user@test.com')).rejects.toThrow(
      BadRequestException,
    );
    expect(mockPurchaseRepo.save).not.toHaveBeenCalled();
  });

  it('debe lanzar ConflictException si ya existe una compra PENDING del mismo servicio para el usuario', async () => {
    mockServiceRepo.findById.mockResolvedValue(mockService);
    mockPurchaseRepo.findPendingByUserAndService.mockResolvedValue(
      mockPurchasePending,
    );

    await expect(useCase.execute(5, dto, 'user@test.com')).rejects.toThrow(
      ConflictException,
    );
    expect(mockPurchaseRepo.save).not.toHaveBeenCalled();
  });

  it('no debe exponer whatsappNumber en la respuesta (compra PENDING)', async () => {
    mockServiceRepo.findById.mockResolvedValue(mockService);
    mockPurchaseRepo.findPendingByUserAndService.mockResolvedValue(null);
    mockPurchaseRepo.save.mockResolvedValue(mockPurchasePending);
    mockPurchaseRepo.updateStatus.mockResolvedValue(mockPurchasePending);

    const result = await useCase.execute(5, dto, 'user@test.com');

    expect(result.whatsappNumber).toBeUndefined();
  });

  it('debe continuar aunque la creación de preferencia MP falle', async () => {
    mockServiceRepo.findById.mockResolvedValue(mockService);
    mockPurchaseRepo.findPendingByUserAndService.mockResolvedValue(null);
    mockPurchaseRepo.save.mockResolvedValue(mockPurchasePending);
    mockMpService.createPreference.mockRejectedValue(new Error('MP timeout'));

    const result = await useCase.execute(5, dto, 'user@test.com');

    expect(result.id).toBe(10);
    expect(result.initPoint).toBeNull();
  });
});

describe('GetUserPurchasesUseCase', () => {
  let useCase: GetUserPurchasesUseCase;
  let mockPurchaseRepo: jest.Mocked<IServicePurchaseRepository>;

  beforeEach(async () => {
    mockPurchaseRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdWithService: jest.fn(),
      findPendingByUserAndService: jest.fn(),
      findPendingPayments: jest.fn(),
      findAllPurchases: jest.fn(),
      findByIdWithRelations: jest.fn(),
      updateStatus: jest.fn(),
      updateStatusIfCurrent: jest.fn(),
      findPaidUnassignedByUserAndSessionType: jest.fn(),
      findByMercadoPagoPaymentId: jest.fn(),
      findByPreferenceId: jest.fn(),
      findActiveByDate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserPurchasesUseCase,
        { provide: SERVICE_PURCHASE_REPOSITORY, useValue: mockPurchaseRepo },
      ],
    }).compile();

    useCase = module.get(GetUserPurchasesUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  it('debe retornar las compras del usuario con datos del servicio', async () => {
    mockPurchaseRepo.findByUserIdWithService.mockResolvedValue([
      mockPurchasePending,
    ]);

    const result = await useCase.execute(5);

    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe(5);
    expect(mockPurchaseRepo.findByUserIdWithService).toHaveBeenCalledWith(5);
  });

  it('debe retornar lista vacía si el usuario no tiene compras', async () => {
    mockPurchaseRepo.findByUserIdWithService.mockResolvedValue([]);

    const result = await useCase.execute(5);

    expect(result).toHaveLength(0);
  });

  it('no debe incluir whatsappNumber para compras PENDING', async () => {
    mockPurchaseRepo.findByUserIdWithService.mockResolvedValue([
      mockPurchasePending,
    ]);

    const result = await useCase.execute(5);

    expect(result[0].whatsappNumber).toBeUndefined();
  });

  it('debe incluir whatsappNumber para compras PAID', async () => {
    mockPurchaseRepo.findByUserIdWithService.mockResolvedValue([
      { ...mockPurchasePaid, holisticService: mockService },
    ]);

    const result = await useCase.execute(5);

    expect(result[0].whatsappNumber).toBe('+5491112345678');
  });
});

describe('GetAllPurchasesUseCase', () => {
  let useCase: GetAllPurchasesUseCase;
  let mockPurchaseRepo: jest.Mocked<IServicePurchaseRepository>;

  beforeEach(async () => {
    mockPurchaseRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdWithService: jest.fn(),
      findPendingByUserAndService: jest.fn(),
      findPendingPayments: jest.fn(),
      findAllPurchases: jest.fn(),
      findByIdWithRelations: jest.fn(),
      updateStatus: jest.fn(),
      updateStatusIfCurrent: jest.fn(),
      findPaidUnassignedByUserAndSessionType: jest.fn(),
      findByMercadoPagoPaymentId: jest.fn(),
      findByPreferenceId: jest.fn(),
      findActiveByDate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllPurchasesUseCase,
        { provide: SERVICE_PURCHASE_REPOSITORY, useValue: mockPurchaseRepo },
      ],
    }).compile();

    useCase = module.get(GetAllPurchasesUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  it('debe retornar todas las compras de todos los estados', async () => {
    mockPurchaseRepo.findAllPurchases.mockResolvedValue([
      mockPurchasePending,
      { ...mockPurchasePending, id: 11, paymentStatus: PurchaseStatus.PAID },
      {
        ...mockPurchasePending,
        id: 12,
        paymentStatus: PurchaseStatus.CANCELLED,
      },
    ]);

    const result = await useCase.execute();

    expect(result).toHaveLength(3);
    expect(mockPurchaseRepo.findAllPurchases).toHaveBeenCalledTimes(1);
  });

  it('debe incluir mercadoPagoPaymentId en la respuesta', async () => {
    const purchaseWithMpId: ServicePurchase = {
      ...mockPurchasePending,
      id: 11,
      paymentStatus: PurchaseStatus.PAID,
      mercadoPagoPaymentId: 'MP-987654321',
    };
    mockPurchaseRepo.findAllPurchases.mockResolvedValue([purchaseWithMpId]);

    const result = await useCase.execute();

    expect(result[0].mercadoPagoPaymentId).toBe('MP-987654321');
  });

  it('debe retornar lista vacía si no hay compras', async () => {
    mockPurchaseRepo.findAllPurchases.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toHaveLength(0);
  });
});

describe('CancelPurchaseUseCase', () => {
  let useCase: CancelPurchaseUseCase;
  let mockPurchaseRepo: jest.Mocked<IServicePurchaseRepository>;

  beforeEach(async () => {
    mockPurchaseRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdWithService: jest.fn(),
      findPendingByUserAndService: jest.fn(),
      findPendingPayments: jest.fn(),
      findAllPurchases: jest.fn(),
      findByIdWithRelations: jest.fn(),
      updateStatus: jest.fn(),
      updateStatusIfCurrent: jest.fn(),
      findPaidUnassignedByUserAndSessionType: jest.fn(),
      findByMercadoPagoPaymentId: jest.fn(),
      findByPreferenceId: jest.fn(),
      findActiveByDate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelPurchaseUseCase,
        { provide: SERVICE_PURCHASE_REPOSITORY, useValue: mockPurchaseRepo },
      ],
    }).compile();

    useCase = module.get(CancelPurchaseUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  it('debe cancelar la compra si el usuario es el propietario', async () => {
    mockPurchaseRepo.findById.mockResolvedValue(mockPurchasePending);
    mockPurchaseRepo.updateStatus.mockResolvedValue({
      ...mockPurchasePending,
      paymentStatus: PurchaseStatus.CANCELLED,
    });

    const result = await useCase.execute(10, 5, false);

    expect(result.paymentStatus).toBe(PurchaseStatus.CANCELLED);
    expect(mockPurchaseRepo.updateStatus).toHaveBeenCalledWith(
      10,
      PurchaseStatus.CANCELLED,
      {},
    );
  });

  it('debe cancelar la compra si el usuario es admin (aunque no sea propietario)', async () => {
    mockPurchaseRepo.findById.mockResolvedValue(mockPurchasePending);
    mockPurchaseRepo.updateStatus.mockResolvedValue({
      ...mockPurchasePending,
      paymentStatus: PurchaseStatus.CANCELLED,
    });

    const result = await useCase.execute(10, 99, true);

    expect(result.paymentStatus).toBe(PurchaseStatus.CANCELLED);
  });

  it('debe lanzar ForbiddenException si el usuario no es propietario ni admin', async () => {
    mockPurchaseRepo.findById.mockResolvedValue(mockPurchasePending);

    await expect(useCase.execute(10, 99, false)).rejects.toThrow(
      ForbiddenException,
    );
    expect(mockPurchaseRepo.updateStatus).not.toHaveBeenCalled();
  });

  it('debe lanzar NotFoundException si la compra no existe', async () => {
    mockPurchaseRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(999, 5, false)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('debe lanzar BadRequestException si la compra ya no está PENDING', async () => {
    mockPurchaseRepo.findById.mockResolvedValue(mockPurchasePaid);

    await expect(useCase.execute(11, 5, false)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockPurchaseRepo.updateStatus).not.toHaveBeenCalled();
  });
});

describe('GetPurchaseByIdUseCase', () => {
  let useCase: GetPurchaseByIdUseCase;
  let mockPurchaseRepo: jest.Mocked<IServicePurchaseRepository>;

  beforeEach(async () => {
    mockPurchaseRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdWithService: jest.fn(),
      findPendingByUserAndService: jest.fn(),
      findPendingPayments: jest.fn(),
      findAllPurchases: jest.fn(),
      findByIdWithRelations: jest.fn(),
      updateStatus: jest.fn(),
      updateStatusIfCurrent: jest.fn(),
      findPaidUnassignedByUserAndSessionType: jest.fn(),
      findByMercadoPagoPaymentId: jest.fn(),
      findByPreferenceId: jest.fn(),
      findActiveByDate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPurchaseByIdUseCase,
        { provide: SERVICE_PURCHASE_REPOSITORY, useValue: mockPurchaseRepo },
      ],
    }).compile();

    useCase = module.get(GetPurchaseByIdUseCase);
    jest.clearAllMocks();
  });

  it('debe retornar la compra cuando existe y pertenece al usuario', async () => {
    mockPurchaseRepo.findByIdWithRelations.mockResolvedValue(
      mockPurchasePending,
    );

    const result = await useCase.execute(10, 5);

    expect(mockPurchaseRepo.findByIdWithRelations).toHaveBeenCalledWith(10);
    expect(result.id).toBe(10);
    expect(result.userId).toBe(5);
    expect(result.paymentStatus).toBe(PurchaseStatus.PENDING);
  });

  it('debe incluir el holisticService en la respuesta', async () => {
    mockPurchaseRepo.findByIdWithRelations.mockResolvedValue(
      mockPurchasePending,
    );

    const result = await useCase.execute(10, 5);

    expect(result.holisticService).toBeDefined();
    expect(result.holisticService?.id).toBe(1);
    expect(result.holisticService?.name).toBe(
      'Trabajo con el Árbol Genealógico',
    );
  });

  it('debe incluir whatsappNumber si la compra está PAID', async () => {
    mockPurchaseRepo.findByIdWithRelations.mockResolvedValue(mockPurchasePaid);

    const result = await useCase.execute(11, 5);

    expect(result.paymentStatus).toBe(PurchaseStatus.PAID);
    expect(result.whatsappNumber).toBe('+5491112345678');
  });

  it('NO debe incluir whatsappNumber si la compra está PENDING', async () => {
    mockPurchaseRepo.findByIdWithRelations.mockResolvedValue(
      mockPurchasePending,
    );

    const result = await useCase.execute(10, 5);

    expect(result.paymentStatus).toBe(PurchaseStatus.PENDING);
    expect(result.whatsappNumber).toBeUndefined();
  });

  it('debe lanzar NotFoundException si la compra no existe', async () => {
    mockPurchaseRepo.findByIdWithRelations.mockResolvedValue(null);

    await expect(useCase.execute(999, 5)).rejects.toThrow(NotFoundException);
    await expect(useCase.execute(999, 5)).rejects.toThrow(
      'Compra no encontrada',
    );
  });

  it('debe lanzar ForbiddenException si la compra no pertenece al usuario', async () => {
    mockPurchaseRepo.findByIdWithRelations.mockResolvedValue(
      mockPurchasePending,
    );

    await expect(useCase.execute(10, 999)).rejects.toThrow(ForbiddenException);
    await expect(useCase.execute(10, 999)).rejects.toThrow(
      'No tienes permiso para ver esta compra',
    );
  });
});
