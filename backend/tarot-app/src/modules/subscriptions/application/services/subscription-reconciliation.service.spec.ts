import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SubscriptionReconciliationService } from './subscription-reconciliation.service';
import { IUserRepository } from '../../../users/domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/repository.tokens';
import { MercadoPagoService } from '../../../payments/infrastructure/services/mercadopago.service';
import {
  User,
  UserPlan,
  SubscriptionStatus,
} from '../../../users/entities/user.entity';
import type { PreApprovalResponse } from 'mercadopago/dist/clients/preApproval/commonTypes';

/**
 * Crea un mock de usuario premium activo con mpPreapprovalId
 */
function createPremiumUserWithPreapproval(
  id: number,
  mpPreapprovalId: string,
  subscriptionStatus: SubscriptionStatus = SubscriptionStatus.ACTIVE,
): User {
  const user = new User();
  user.id = id;
  user.plan = UserPlan.PREMIUM;
  user.subscriptionStatus = subscriptionStatus;
  user.mpPreapprovalId = mpPreapprovalId;
  user.planExpiresAt = new Date('2030-12-31T00:00:00.000Z');
  return user;
}

/**
 * Crea un mock de PreApprovalResponse
 */
function createPreapprovalResponse(
  id: string,
  status: string,
  externalReference: string,
): PreApprovalResponse {
  return {
    id,
    status,
    external_reference: externalReference,
  } as PreApprovalResponse;
}

describe('SubscriptionReconciliationService', () => {
  let service: SubscriptionReconciliationService;

  const mockUserRepository: jest.Mocked<
    Pick<IUserRepository, 'findActivePremiumUsersWithPreapproval' | 'save'>
  > = {
    findActivePremiumUsersWithPreapproval: jest.fn(),
    save: jest.fn(),
  };

  const mockMercadoPagoService: jest.Mocked<
    Pick<MercadoPagoService, 'getPreapproval'>
  > = {
    getPreapproval: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionReconciliationService,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: MercadoPagoService,
          useValue: mockMercadoPagoService,
        },
      ],
    }).compile();

    service = module.get<SubscriptionReconciliationService>(
      SubscriptionReconciliationService,
    );

    // Silenciar logs en tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    jest.clearAllMocks();
  });

  describe('reconcileSubscriptions', () => {
    it('debe corregir a cancelled si la suscripción está activa en DB pero cancelada en MP', async () => {
      // Arrange
      const user = createPremiumUserWithPreapproval(
        1,
        'preapproval_123',
        SubscriptionStatus.ACTIVE,
      );
      user.plan = UserPlan.PREMIUM;

      mockUserRepository.findActivePremiumUsersWithPreapproval.mockResolvedValue(
        [user],
      );
      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        createPreapprovalResponse('preapproval_123', 'cancelled', 'sub_1'),
      );
      mockUserRepository.save.mockResolvedValue({
        ...user,
        subscriptionStatus: SubscriptionStatus.CANCELLED,
      } as User);

      // Act
      await service.reconcileSubscriptions();

      // Assert
      expect(
        mockUserRepository.findActivePremiumUsersWithPreapproval,
      ).toHaveBeenCalledTimes(1);
      expect(mockMercadoPagoService.getPreapproval).toHaveBeenCalledWith(
        'preapproval_123',
      );
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      expect(user.subscriptionStatus).toBe(SubscriptionStatus.CANCELLED);
    });

    it('no debe hacer cambios si el estado en DB coincide con MP (ambos activos)', async () => {
      // Arrange
      const user = createPremiumUserWithPreapproval(
        2,
        'preapproval_456',
        SubscriptionStatus.ACTIVE,
      );

      mockUserRepository.findActivePremiumUsersWithPreapproval.mockResolvedValue(
        [user],
      );
      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        createPreapprovalResponse('preapproval_456', 'authorized', 'sub_2'),
      );

      // Act
      await service.reconcileSubscriptions();

      // Assert
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('no debe detener el batch si la API de MP falla para un usuario', async () => {
      // Arrange
      const user1 = createPremiumUserWithPreapproval(1, 'preapproval_1');
      const user2 = createPremiumUserWithPreapproval(2, 'preapproval_2');
      const user3 = createPremiumUserWithPreapproval(3, 'preapproval_3');

      mockUserRepository.findActivePremiumUsersWithPreapproval.mockResolvedValue(
        [user1, user2, user3],
      );

      // user1 falla en MP, user2 y user3 responden correctamente (sin discrepancia)
      mockMercadoPagoService.getPreapproval
        .mockRejectedValueOnce(new Error('MP API timeout'))
        .mockResolvedValueOnce(
          createPreapprovalResponse('preapproval_2', 'authorized', 'sub_2'),
        )
        .mockResolvedValueOnce(
          createPreapprovalResponse('preapproval_3', 'authorized', 'sub_3'),
        );

      // Act — no debe lanzar error
      await expect(service.reconcileSubscriptions()).resolves.not.toThrow();

      // Assert — consultó los 3, aunque uno falló
      expect(mockMercadoPagoService.getPreapproval).toHaveBeenCalledTimes(3);
      // El error de user1 no causó que se guardara nada en DB
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('no debe hacer nada si no hay usuarios con preapproval activo', async () => {
      // Arrange
      mockUserRepository.findActivePremiumUsersWithPreapproval.mockResolvedValue(
        [],
      );

      // Act
      await service.reconcileSubscriptions();

      // Assert
      expect(mockMercadoPagoService.getPreapproval).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('debe manejar error del repositorio sin lanzar excepción', async () => {
      // Arrange
      mockUserRepository.findActivePremiumUsersWithPreapproval.mockRejectedValue(
        new Error('DB connection error'),
      );

      // Act & Assert — no debe lanzar
      await expect(service.reconcileSubscriptions()).resolves.not.toThrow();
    });

    it('debe respetar el rate limit de máximo 50 consultas por ejecución', async () => {
      // Arrange — crear 60 usuarios, se deben procesar solo 50
      const users: User[] = Array.from({ length: 60 }, (_, i) =>
        createPremiumUserWithPreapproval(i + 1, `preapproval_${i + 1}`),
      );

      mockUserRepository.findActivePremiumUsersWithPreapproval.mockResolvedValue(
        users,
      );
      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        createPreapprovalResponse('preapproval_1', 'authorized', 'sub_1'),
      );

      const warnSpy = jest
        .spyOn(Logger.prototype, 'warn')
        .mockImplementation(() => undefined);

      // Act
      await service.reconcileSubscriptions();

      // Assert — máximo 50 consultas
      expect(mockMercadoPagoService.getPreapproval).toHaveBeenCalledTimes(50);
      // Debe advertir que hay usuarios truncados
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Rate limit alcanzado'),
      );
    });

    it('no debe cambiar estado si MP reporta paused (MP reintenta automáticamente)', async () => {
      // Arrange — paused en MP: según el backlog (T-INT-02) no genera cambio en DB,
      // MP reintenta el cobro automáticamente y eventualmente resuelve a authorized o cancelled.
      const user = createPremiumUserWithPreapproval(
        5,
        'preapproval_paused',
        SubscriptionStatus.ACTIVE,
      );

      mockUserRepository.findActivePremiumUsersWithPreapproval.mockResolvedValue(
        [user],
      );
      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        createPreapprovalResponse('preapproval_paused', 'paused', 'sub_5'),
      );

      // Act
      await service.reconcileSubscriptions();

      // Assert — paused no genera corrección en DB (sin save)
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('debe loguear detalle de correcciones realizadas', async () => {
      // Arrange
      const logSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => undefined);

      const user = createPremiumUserWithPreapproval(
        1,
        'preapproval_fix',
        SubscriptionStatus.ACTIVE,
      );

      mockUserRepository.findActivePremiumUsersWithPreapproval.mockResolvedValue(
        [user],
      );
      mockMercadoPagoService.getPreapproval.mockResolvedValue(
        createPreapprovalResponse('preapproval_fix', 'cancelled', 'sub_1'),
      );
      mockUserRepository.save.mockResolvedValue({} as User);

      // Act
      await service.reconcileSubscriptions();

      // Assert — debe haber al menos un log
      expect(logSpy).toHaveBeenCalled();
    });

    it('debe loguear error cuando save falla para un usuario y continuar el batch', async () => {
      // Arrange
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);

      const user1 = createPremiumUserWithPreapproval(
        1,
        'preapproval_1',
        SubscriptionStatus.ACTIVE,
      );
      const user2 = createPremiumUserWithPreapproval(
        2,
        'preapproval_2',
        SubscriptionStatus.ACTIVE,
      );

      mockUserRepository.findActivePremiumUsersWithPreapproval.mockResolvedValue(
        [user1, user2],
      );

      // Ambos están cancelados en MP
      mockMercadoPagoService.getPreapproval
        .mockResolvedValueOnce(
          createPreapprovalResponse('preapproval_1', 'cancelled', 'sub_1'),
        )
        .mockResolvedValueOnce(
          createPreapprovalResponse('preapproval_2', 'cancelled', 'sub_2'),
        );

      // user1 falla al guardar
      mockUserRepository.save
        .mockRejectedValueOnce(new Error('DB save error'))
        .mockResolvedValueOnce({} as User);

      // Act
      await service.reconcileSubscriptions();

      // Assert
      expect(errorSpy).toHaveBeenCalled();
      // user2 se procesó correctamente
      expect(mockUserRepository.save).toHaveBeenCalledTimes(2);
    });

    it('debe manejar errores no-Error (strings/objetos) sin lanzar excepción', async () => {
      // Arrange
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);

      const user = createPremiumUserWithPreapproval(
        1,
        'preapproval_1',
        SubscriptionStatus.ACTIVE,
      );

      mockUserRepository.findActivePremiumUsersWithPreapproval.mockResolvedValue(
        [user],
      );
      mockMercadoPagoService.getPreapproval.mockRejectedValue('string-error');

      // Act
      await service.reconcileSubscriptions();

      // Assert
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
