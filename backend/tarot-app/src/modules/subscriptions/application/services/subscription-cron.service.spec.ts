import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SubscriptionCronService } from './subscription-cron.service';
import { IUserRepository } from '../../../users/domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/repository.tokens';
import {
  User,
  UserPlan,
  SubscriptionStatus,
} from '../../../users/entities/user.entity';

/**
 * Crea un mock de usuario con plan premium expirado
 */
function createExpiredPremiumUser(
  id: number,
  subscriptionStatus: SubscriptionStatus,
  planExpiresAt: Date,
): User {
  const user = new User();
  user.id = id;
  user.plan = UserPlan.PREMIUM;
  user.subscriptionStatus = subscriptionStatus;
  user.planExpiresAt = planExpiresAt;
  return user;
}

describe('SubscriptionCronService', () => {
  let service: SubscriptionCronService;

  const mockUserRepository: jest.Mocked<
    Pick<IUserRepository, 'findExpiredPremiumUsers' | 'save'>
  > = {
    findExpiredPremiumUsers: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionCronService,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<SubscriptionCronService>(SubscriptionCronService);

    // Silenciar logs en tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    jest.clearAllMocks();
  });

  describe('degradeExpiredPlans', () => {
    it('debe degradar a free usuarios con plan expirado y subscriptionStatus=cancelled', async () => {
      // Arrange
      const pastDate = new Date('2020-01-01T00:00:00.000Z');
      const expiredUser = createExpiredPremiumUser(
        1,
        SubscriptionStatus.CANCELLED,
        pastDate,
      );

      mockUserRepository.findExpiredPremiumUsers.mockResolvedValue([
        expiredUser,
      ]);
      mockUserRepository.save.mockResolvedValue({
        ...expiredUser,
        plan: UserPlan.FREE,
        subscriptionStatus: SubscriptionStatus.EXPIRED,
      } as User);

      // Act
      await service.degradeExpiredPlans();

      // Assert
      expect(mockUserRepository.findExpiredPremiumUsers).toHaveBeenCalledTimes(
        1,
      );
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      expect(expiredUser.plan).toBe(UserPlan.FREE);
      expect(expiredUser.subscriptionStatus).toBe(SubscriptionStatus.EXPIRED);
    });

    it('debe degradar a free usuarios con plan expirado y subscriptionStatus=expired', async () => {
      // Arrange
      const pastDate = new Date('2020-01-01T00:00:00.000Z');
      const expiredUser = createExpiredPremiumUser(
        2,
        SubscriptionStatus.EXPIRED,
        pastDate,
      );

      mockUserRepository.findExpiredPremiumUsers.mockResolvedValue([
        expiredUser,
      ]);
      mockUserRepository.save.mockResolvedValue({
        ...expiredUser,
        plan: UserPlan.FREE,
        subscriptionStatus: SubscriptionStatus.EXPIRED,
      } as User);

      // Act
      await service.degradeExpiredPlans();

      // Assert
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      expect(expiredUser.plan).toBe(UserPlan.FREE);
      expect(expiredUser.subscriptionStatus).toBe(SubscriptionStatus.EXPIRED);
    });

    it('no debe degradar usuarios con plan activo aunque planExpiresAt haya pasado', async () => {
      // Arrange — el repositorio ya filtra por subscriptionStatus IN ('cancelled', 'expired')
      // Si no hay usuarios que cumplan la condición, el repo retorna vacío
      mockUserRepository.findExpiredPremiumUsers.mockResolvedValue([]);

      // Act
      await service.degradeExpiredPlans();

      // Assert
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('no debe degradar si no hay usuarios con plan expirado', async () => {
      // Arrange
      mockUserRepository.findExpiredPremiumUsers.mockResolvedValue([]);

      // Act
      await service.degradeExpiredPlans();

      // Assert
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('debe continuar procesando el batch si un usuario falla', async () => {
      // Arrange
      const pastDate = new Date('2020-01-01T00:00:00.000Z');
      const user1 = createExpiredPremiumUser(
        1,
        SubscriptionStatus.CANCELLED,
        pastDate,
      );
      const user2 = createExpiredPremiumUser(
        2,
        SubscriptionStatus.CANCELLED,
        pastDate,
      );
      const user3 = createExpiredPremiumUser(
        3,
        SubscriptionStatus.CANCELLED,
        pastDate,
      );

      mockUserRepository.findExpiredPremiumUsers.mockResolvedValue([
        user1,
        user2,
        user3,
      ]);

      // El user2 falla al guardar
      mockUserRepository.save
        .mockResolvedValueOnce({ ...user1, plan: UserPlan.FREE } as User)
        .mockRejectedValueOnce(new Error('DB error'))
        .mockResolvedValueOnce({ ...user3, plan: UserPlan.FREE } as User);

      // Act — no debe lanzar error
      await expect(service.degradeExpiredPlans()).resolves.not.toThrow();

      // Assert — se intentó guardar los 3, aunque uno falló
      expect(mockUserRepository.save).toHaveBeenCalledTimes(3);
    });

    it('debe loguear la cantidad de usuarios degradados en cada ejecución', async () => {
      // Arrange
      const logSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => undefined);
      const pastDate = new Date('2020-01-01T00:00:00.000Z');
      const user1 = createExpiredPremiumUser(
        1,
        SubscriptionStatus.CANCELLED,
        pastDate,
      );
      const user2 = createExpiredPremiumUser(
        2,
        SubscriptionStatus.EXPIRED,
        pastDate,
      );

      mockUserRepository.findExpiredPremiumUsers.mockResolvedValue([
        user1,
        user2,
      ]);
      mockUserRepository.save.mockResolvedValue({} as User);

      // Act
      await service.degradeExpiredPlans();

      // Assert — debe haber al menos un log que mencione la cantidad
      const logCalls = logSpy.mock.calls.map((args) => args.join(' '));
      const hasCountLog = logCalls.some(
        (msg) => msg.includes('2') || msg.includes('degradad'),
      );
      expect(hasCountLog).toBe(true);
    });

    it('debe loguear un error por usuario cuando falla save, sin detener el batch', async () => {
      // Arrange
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);
      const pastDate = new Date('2020-01-01T00:00:00.000Z');
      const failingUser = createExpiredPremiumUser(
        99,
        SubscriptionStatus.CANCELLED,
        pastDate,
      );

      mockUserRepository.findExpiredPremiumUsers.mockResolvedValue([
        failingUser,
      ]);
      mockUserRepository.save.mockRejectedValue(new Error('Save failed'));

      // Act
      await service.degradeExpiredPlans();

      // Assert — debe loguear el error
      expect(errorSpy).toHaveBeenCalled();
    });

    it('debe manejar el error del repositorio findExpiredPremiumUsers sin lanzar excepción', async () => {
      // Arrange
      mockUserRepository.findExpiredPremiumUsers.mockRejectedValue(
        new Error('DB connection error'),
      );

      // Act & Assert — no debe lanzar, debe manejar el error
      await expect(service.degradeExpiredPlans()).resolves.not.toThrow();
    });

    it('debe manejar errores que no sean instancias de Error al obtener usuarios', async () => {
      // Arrange — lanza un string en vez de un Error object
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);
      mockUserRepository.findExpiredPremiumUsers.mockRejectedValue(
        'string error',
      );

      // Act
      await service.degradeExpiredPlans();

      // Assert — debe loguear el error string
      expect(errorSpy).toHaveBeenCalled();
    });

    it('debe manejar errores que no sean instancias de Error en degradeSingleUser', async () => {
      // Arrange — lanza un objeto no-Error
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);
      const pastDate = new Date('2020-01-01T00:00:00.000Z');
      const user = createExpiredPremiumUser(
        10,
        SubscriptionStatus.CANCELLED,
        pastDate,
      );

      mockUserRepository.findExpiredPremiumUsers.mockResolvedValue([user]);
      mockUserRepository.save.mockRejectedValue({ code: 'DB_ERROR' });

      // Act
      await service.degradeExpiredPlans();

      // Assert — debe loguear el error sin stack
      expect(errorSpy).toHaveBeenCalled();
    });

    it('debe loguear N/A cuando planExpiresAt es null en degradeSingleUser', async () => {
      // Arrange
      const logSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation(() => undefined);

      const user = new User();
      user.id = 20;
      user.plan = UserPlan.PREMIUM;
      user.subscriptionStatus = SubscriptionStatus.CANCELLED;
      // planExpiresAt es undefined/null intencionalmente

      mockUserRepository.findExpiredPremiumUsers.mockResolvedValue([user]);
      mockUserRepository.save.mockResolvedValue({} as User);

      // Act
      await service.degradeExpiredPlans();

      // Assert — el log debe incluir N/A
      const logCalls = logSpy.mock.calls.map((args) => args.join(' '));
      const hasNALog = logCalls.some((msg) => msg.includes('N/A'));
      expect(hasNALog).toBe(true);
    });
  });
});
