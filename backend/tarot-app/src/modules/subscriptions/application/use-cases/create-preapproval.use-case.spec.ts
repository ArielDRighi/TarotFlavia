import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  BadGatewayException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePreapprovalUseCase } from './create-preapproval.use-case';
import { MercadoPagoService } from '../../../payments/infrastructure/services/mercadopago.service';
import {
  User,
  UserPlan,
  SubscriptionStatus,
} from '../../../users/entities/user.entity';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/repository.tokens';

describe('CreatePreapprovalUseCase', () => {
  let useCase: CreatePreapprovalUseCase;

  const mockUserRepo = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const mockMercadoPagoService: jest.Mocked<
    Pick<MercadoPagoService, 'createPreapproval' | 'cancelPreapproval'>
  > = {
    createPreapproval: jest.fn(),
    cancelPreapproval: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const buildUser = (overrides: Partial<User> = {}): User => {
    const user = new User();
    user.id = 42;
    user.email = 'test@example.com';
    user.plan = UserPlan.FREE;
    user.subscriptionStatus = null as unknown as SubscriptionStatus;
    user.mpPreapprovalId = null;
    return Object.assign(user, overrides);
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePreapprovalUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepo },
        { provide: MercadoPagoService, useValue: mockMercadoPagoService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    useCase = module.get<CreatePreapprovalUseCase>(CreatePreapprovalUseCase);

    // Configurar variables de entorno por defecto
    mockConfigService.get.mockImplementation((key: string) => {
      const envMap: Record<string, string> = {
        FRONTEND_URL: 'http://localhost:3001',
        BACKEND_URL: 'http://localhost:3000',
      };
      return envMap[key];
    });
  });

  describe('execute', () => {
    it('usuario free crea preapproval → devuelve initPoint', async () => {
      // Arrange
      const freeUser = buildUser({ plan: UserPlan.FREE });
      mockUserRepo.findById.mockResolvedValue(freeUser);
      mockMercadoPagoService.createPreapproval.mockResolvedValue({
        preapprovalId: 'preapproval_abc123',
        initPoint:
          'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=plan_test_123',
      });
      mockUserRepo.save.mockResolvedValue({
        ...freeUser,
        mpPreapprovalId: 'preapproval_abc123',
      });

      // Act
      const result = await useCase.execute(42, 'test@example.com');

      // Assert
      expect(result).toEqual({
        initPoint:
          'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=plan_test_123',
      });
    });

    it('external_reference tiene formato sub_{userId}', async () => {
      // Arrange
      const freeUser = buildUser({ id: 42, plan: UserPlan.FREE });
      mockUserRepo.findById.mockResolvedValue(freeUser);
      mockMercadoPagoService.createPreapproval.mockResolvedValue({
        preapprovalId: 'preapproval_abc123',
        initPoint: 'https://mp.com/checkout',
      });
      mockUserRepo.save.mockResolvedValue(freeUser);

      // Act
      await useCase.execute(42, 'test@example.com');

      // Assert
      expect(mockMercadoPagoService.createPreapproval).toHaveBeenCalledWith(
        expect.objectContaining({
          externalReference: 'sub_42',
        }),
      );
    });

    it('llama a MercadoPagoService con parámetros correctos', async () => {
      // Arrange
      const freeUser = buildUser({ id: 99, plan: UserPlan.FREE });
      mockUserRepo.findById.mockResolvedValue(freeUser);
      mockMercadoPagoService.createPreapproval.mockResolvedValue({
        preapprovalId: 'preapproval_xyz',
        initPoint: 'https://mp.com/checkout',
      });
      mockUserRepo.save.mockResolvedValue(freeUser);

      // Act
      await useCase.execute(99, 'user99@example.com');

      // Assert
      expect(mockMercadoPagoService.createPreapproval).toHaveBeenCalledWith({
        reason: 'Auguria Premium',
        autoRecurring: {
          frequency: 1,
          frequencyType: 'months',
          transactionAmount: 2999,
          currencyId: 'ARS',
        },
        payerEmail: 'user99@example.com',
        externalReference: 'sub_99',
        backUrl: 'http://localhost:3001/premium/activacion?status=authorized',
        notificationUrl: 'http://localhost:3000/api/v1/webhooks/mercadopago',
      });
    });

    it('mpPreapprovalId se persiste en User entity', async () => {
      // Arrange
      const freeUser = buildUser({ plan: UserPlan.FREE });
      mockUserRepo.findById.mockResolvedValue(freeUser);
      mockMercadoPagoService.createPreapproval.mockResolvedValue({
        preapprovalId: 'preapproval_saved',
        initPoint: 'https://mp.com/checkout',
      });
      mockUserRepo.save.mockResolvedValue({
        ...freeUser,
        mpPreapprovalId: 'preapproval_saved',
      });

      // Act
      await useCase.execute(42, 'test@example.com');

      // Assert
      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          mpPreapprovalId: 'preapproval_saved',
        }),
      );
    });

    it('usuario ya premium → lanza BadRequestException', async () => {
      // Arrange
      const premiumUser = buildUser({
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      });
      mockUserRepo.findById.mockResolvedValue(premiumUser);

      // Act & Assert
      await expect(useCase.execute(42, 'test@example.com')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockMercadoPagoService.createPreapproval).not.toHaveBeenCalled();
    });

    it('usuario ya premium → mensaje de error claro en español', async () => {
      // Arrange
      const premiumUser = buildUser({
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      });
      mockUserRepo.findById.mockResolvedValue(premiumUser);

      // Act & Assert
      await expect(useCase.execute(42, 'test@example.com')).rejects.toThrow(
        'El usuario ya tiene un plan premium activo',
      );
    });

    it('usuario free con preapproval activo existente → no lanza excepción (permite re-iniciar)', async () => {
      // Arrange — usuario free con preapprovalId de un intento anterior
      const userWithOldPreapproval = buildUser({
        plan: UserPlan.FREE,
        mpPreapprovalId: 'old_preapproval_id',
      });
      mockUserRepo.findById.mockResolvedValue(userWithOldPreapproval);
      mockMercadoPagoService.createPreapproval.mockResolvedValue({
        preapprovalId: 'new_preapproval_id',
        initPoint: 'https://mp.com/checkout',
      });
      mockUserRepo.save.mockResolvedValue({
        ...userWithOldPreapproval,
        mpPreapprovalId: 'new_preapproval_id',
      });

      // Act
      const result = await useCase.execute(42, 'test@example.com');

      // Assert — puede crear uno nuevo si no es premium aún
      expect(result).toEqual({ initPoint: 'https://mp.com/checkout' });
    });

    it('MP devuelve error → lanza BadGatewayException con mensaje claro', async () => {
      // Arrange
      const freeUser = buildUser({ plan: UserPlan.FREE });
      mockUserRepo.findById.mockResolvedValue(freeUser);
      mockMercadoPagoService.createPreapproval.mockRejectedValue(
        new Error('MP API connection error'),
      );

      // Act & Assert
      await expect(useCase.execute(42, 'test@example.com')).rejects.toThrow(
        BadGatewayException,
      );
    });

    it('MP devuelve error → mensaje en español', async () => {
      // Arrange
      const freeUser = buildUser({ plan: UserPlan.FREE });
      mockUserRepo.findById.mockResolvedValue(freeUser);
      mockMercadoPagoService.createPreapproval.mockRejectedValue(
        new Error('timeout'),
      );

      // Act & Assert
      await expect(useCase.execute(42, 'test@example.com')).rejects.toThrow(
        'Error al crear la suscripción en Mercado Pago',
      );
    });

    it('busca usuario por ID correcto', async () => {
      // Arrange
      const freeUser = buildUser({ id: 77, plan: UserPlan.FREE });
      mockUserRepo.findById.mockResolvedValue(freeUser);
      mockMercadoPagoService.createPreapproval.mockResolvedValue({
        preapprovalId: 'preapproval_test',
        initPoint: 'https://mp.com/checkout',
      });
      mockUserRepo.save.mockResolvedValue(freeUser);

      // Act
      await useCase.execute(77, 'test@example.com');

      // Assert
      expect(mockUserRepo.findById).toHaveBeenCalledWith(77);
    });

    // ─── Fix 1: user null → NotFoundException ───────────────────────────────

    it('usuario no encontrado → lanza NotFoundException antes de llamar a MP', async () => {
      // Arrange
      mockUserRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(999, 'ghost@example.com')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockMercadoPagoService.createPreapproval).not.toHaveBeenCalled();
    });

    it('usuario no encontrado → mensaje de error claro en español', async () => {
      // Arrange
      mockUserRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(999, 'ghost@example.com')).rejects.toThrow(
        'Usuario no encontrado',
      );
    });

    // ─── Plan constants: inline preapproval uses centralized constants ─────────

    it('usa las constantes del plan (reason, frequency, amount, currency)', async () => {
      // Arrange
      const freeUser = buildUser({ plan: UserPlan.FREE });
      mockUserRepo.findById.mockResolvedValue(freeUser);
      mockMercadoPagoService.createPreapproval.mockResolvedValue({
        preapprovalId: 'preapproval_constants_test',
        initPoint: 'https://mp.com/checkout',
      });
      mockUserRepo.save.mockResolvedValue(freeUser);

      // Act
      await useCase.execute(42, 'test@example.com');

      // Assert — valores provienen de PREAPPROVAL_PLAN constants
      expect(mockMercadoPagoService.createPreapproval).toHaveBeenCalledWith(
        expect.objectContaining({
          reason: 'Auguria Premium',
          autoRecurring: expect.objectContaining({
            frequency: 1,
            frequencyType: 'months',
            transactionAmount: 2999,
            currencyId: 'ARS',
          }),
        }),
      );
    });

    // ─── Fix 3: save falla → compensación cancelPreapproval ─────────────────

    it('save falla → intenta cancelar el preapproval creado en MP', async () => {
      // Arrange
      const freeUser = buildUser({ plan: UserPlan.FREE });
      mockUserRepo.findById.mockResolvedValue(freeUser);
      mockMercadoPagoService.createPreapproval.mockResolvedValue({
        preapprovalId: 'preapproval_orphan',
        initPoint: 'https://mp.com/checkout',
      });
      mockUserRepo.save.mockRejectedValue(new Error('DB connection lost'));
      mockMercadoPagoService.cancelPreapproval.mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute(42, 'test@example.com')).rejects.toThrow();
      expect(mockMercadoPagoService.cancelPreapproval).toHaveBeenCalledWith(
        'preapproval_orphan',
      );
    });

    it('save falla → lanza InternalServerErrorException con mensaje claro', async () => {
      // Arrange
      const freeUser = buildUser({ plan: UserPlan.FREE });
      mockUserRepo.findById.mockResolvedValue(freeUser);
      mockMercadoPagoService.createPreapproval.mockResolvedValue({
        preapprovalId: 'preapproval_orphan',
        initPoint: 'https://mp.com/checkout',
      });
      mockUserRepo.save.mockRejectedValue(new Error('DB connection lost'));
      mockMercadoPagoService.cancelPreapproval.mockResolvedValue(undefined);

      // Act & Assert
      await expect(useCase.execute(42, 'test@example.com')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('save falla y cancelPreapproval también falla → sigue lanzando InternalServerErrorException', async () => {
      // Arrange
      const freeUser = buildUser({ plan: UserPlan.FREE });
      mockUserRepo.findById.mockResolvedValue(freeUser);
      mockMercadoPagoService.createPreapproval.mockResolvedValue({
        preapprovalId: 'preapproval_orphan',
        initPoint: 'https://mp.com/checkout',
      });
      mockUserRepo.save.mockRejectedValue(new Error('DB connection lost'));
      mockMercadoPagoService.cancelPreapproval.mockRejectedValue(
        new Error('MP cancel failed'),
      );

      // Act & Assert — debe seguir lanzando error, no quedar silencioso
      await expect(useCase.execute(42, 'test@example.com')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
