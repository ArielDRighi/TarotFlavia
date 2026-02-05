import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { PendulumController } from './pendulum.controller';
import { PendulumService } from '../../application/services/pendulum.service';
import { PendulumHistoryService } from '../../application/services/pendulum-history.service';
import {
  PendulumResponse,
  PendulumMovement,
} from '../../domain/enums/pendulum.enums';
import { UserPlan } from '../../../users/entities/user.entity';
import { OptionalJwtAuthGuard } from '../../../auth/infrastructure/guards/optional-jwt-auth.guard';
import { CheckUsageLimitGuard } from '../../../usage-limits/guards/check-usage-limit.guard';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { IncrementUsageInterceptor } from '../../../usage-limits/interceptors/increment-usage.interceptor';

describe('PendulumController', () => {
  let controller: PendulumController;
  let pendulumService: jest.Mocked<PendulumService>;
  let historyService: jest.Mocked<PendulumHistoryService>;

  beforeEach(async () => {
    const mockPendulumService = {
      query: jest.fn(),
    };

    const mockHistoryService = {
      getUserHistory: jest.fn(),
      getUserStats: jest.fn(),
      deleteQuery: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PendulumController],
      providers: [
        { provide: PendulumService, useValue: mockPendulumService },
        { provide: PendulumHistoryService, useValue: mockHistoryService },
      ],
    })
      .overrideGuard(OptionalJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CheckUsageLimitGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(IncrementUsageInterceptor)
      .useValue({
        intercept: (_context: unknown, next: { handle: () => unknown }) =>
          next.handle(),
      })
      .compile();

    controller = module.get<PendulumController>(PendulumController);
    pendulumService = module.get(PendulumService);
    historyService = module.get(PendulumHistoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('query', () => {
    const mockResponse = {
      response: PendulumResponse.YES,
      movement: PendulumMovement.VERTICAL,
      responseText: 'Sí',
      interpretation: 'El universo afirma tu camino.',
      queryId: null,
      lunarPhase: 'waxing_crescent',
      lunarPhaseName: 'Luna Creciente',
    };

    it('should allow anonymous user to query pendulum', async () => {
      pendulumService.query.mockResolvedValue(mockResponse);

      const result = await controller.query({}, undefined);

      expect(result).toEqual(mockResponse);
      expect(pendulumService.query).toHaveBeenCalledWith({}, undefined);
    });

    it('should allow free user to query pendulum without saving history', async () => {
      const freeUser = { userId: 1, plan: UserPlan.FREE };
      pendulumService.query.mockResolvedValue(mockResponse);

      const result = await controller.query({}, freeUser);

      expect(result).toEqual(mockResponse);
      expect(pendulumService.query).toHaveBeenCalledWith({}, undefined);
    });

    it('should allow premium user to query with question', async () => {
      const premiumUser = {
        userId: 1,
        plan: UserPlan.PREMIUM,
      };
      const dto = { question: '¿Debo aceptar este trabajo?' };
      const responseWithId = { ...mockResponse, queryId: 123 };
      pendulumService.query.mockResolvedValue(responseWithId);

      const result = await controller.query(dto, premiumUser);

      expect(result).toEqual(responseWithId);
      expect(pendulumService.query).toHaveBeenCalledWith(dto, 1);
    });

    it('should strip question from non-premium users', async () => {
      const freeUser = { userId: 1, plan: UserPlan.FREE };
      const dto = { question: 'Mi pregunta' };
      pendulumService.query.mockResolvedValue(mockResponse);

      await controller.query(dto, freeUser);

      expect(pendulumService.query).toHaveBeenCalledWith(
        { question: undefined },
        undefined,
      );
      // Verificar que el DTO original no fue mutado
      expect(dto.question).toBe('Mi pregunta');
    });

    it('should throw BadRequestException for blocked content', async () => {
      const premiumUser = {
        userId: 1,
        plan: UserPlan.PREMIUM,
      };
      const dto = { question: '¿Tengo cáncer?' };
      pendulumService.query.mockRejectedValue(
        new BadRequestException({
          code: 'BLOCKED_CONTENT',
          category: 'salud',
          message:
            'Tu pregunta contiene temas de salud. Te recomendamos consultar con un profesional.',
        }),
      );

      await expect(controller.query(dto, premiumUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getHistory', () => {
    it('should return history for premium users', async () => {
      const premiumUser = {
        userId: 1,
        plan: UserPlan.PREMIUM,
      };
      const testDate = new Date('2026-02-04T21:28:41.999Z');
      const mockHistory = [
        {
          id: 1,
          userId: 1,
          question: 'Test',
          response: PendulumResponse.YES,
          interpretation: 'Test interpretation',
          lunarPhase: 'full',
          createdAt: testDate,
        },
      ];
      historyService.getUserHistory.mockResolvedValue(mockHistory as any);

      const result = await controller.getHistory(premiumUser, 20);

      expect(result).toEqual([
        {
          id: 1,
          question: 'Test',
          response: PendulumResponse.YES,
          interpretation: 'Test interpretation',
          lunarPhase: 'full',
          createdAt: testDate.toISOString(),
        },
      ]);
      expect(historyService.getUserHistory).toHaveBeenCalledWith(
        1,
        20,
        undefined,
      );
    });

    it('should throw ForbiddenException for non-premium users', async () => {
      const freeUser = { userId: 1, plan: UserPlan.FREE };

      await expect(controller.getHistory(freeUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(historyService.getUserHistory).not.toHaveBeenCalled();
    });

    it('should filter history by response type', async () => {
      const premiumUser = {
        userId: 1,
        plan: UserPlan.PREMIUM,
      };
      historyService.getUserHistory.mockResolvedValue([]);

      await controller.getHistory(premiumUser, 10, PendulumResponse.YES);

      expect(historyService.getUserHistory).toHaveBeenCalledWith(
        1,
        10,
        PendulumResponse.YES,
      );
    });

    it('should throw BadRequestException when limit is less than 1', async () => {
      const premiumUser = {
        userId: 1,
        plan: UserPlan.PREMIUM,
      };

      await expect(controller.getHistory(premiumUser, 0)).rejects.toThrow(
        BadRequestException,
      );
      expect(historyService.getUserHistory).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when limit is greater than 100', async () => {
      const premiumUser = {
        userId: 1,
        plan: UserPlan.PREMIUM,
      };

      await expect(controller.getHistory(premiumUser, 101)).rejects.toThrow(
        BadRequestException,
      );
      expect(historyService.getUserHistory).not.toHaveBeenCalled();
    });

    it('should accept valid limit values (1-100)', async () => {
      const premiumUser = {
        userId: 1,
        plan: UserPlan.PREMIUM,
      };
      historyService.getUserHistory.mockResolvedValue([]);

      await controller.getHistory(premiumUser, 1);
      expect(historyService.getUserHistory).toHaveBeenCalledWith(
        1,
        1,
        undefined,
      );

      await controller.getHistory(premiumUser, 100);
      expect(historyService.getUserHistory).toHaveBeenCalledWith(
        1,
        100,
        undefined,
      );
    });
  });

  describe('getStats', () => {
    it('should return stats for premium users', async () => {
      const premiumUser = {
        userId: 1,
        plan: UserPlan.PREMIUM,
      };
      const mockStats = {
        total: 10,
        yesCount: 4,
        noCount: 4,
        maybeCount: 2,
      };
      historyService.getUserStats.mockResolvedValue(mockStats);

      const result = await controller.getStats(premiumUser);

      expect(result).toEqual(mockStats);
      expect(historyService.getUserStats).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException for non-premium users', async () => {
      const freeUser = { userId: 1, plan: UserPlan.FREE };

      await expect(controller.getStats(freeUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(historyService.getUserStats).not.toHaveBeenCalled();
    });
  });

  describe('deleteQuery', () => {
    it('should delete query for premium users', async () => {
      const premiumUser = {
        userId: 1,
        plan: UserPlan.PREMIUM,
      };
      historyService.deleteQuery.mockResolvedValue(true);

      await controller.deleteQuery(premiumUser, 123);

      expect(historyService.deleteQuery).toHaveBeenCalledWith(1, 123);
    });

    it('should throw ForbiddenException for non-premium users', async () => {
      const freeUser = { userId: 1, plan: UserPlan.FREE };

      await expect(controller.deleteQuery(freeUser, 123)).rejects.toThrow(
        ForbiddenException,
      );
      expect(historyService.deleteQuery).not.toHaveBeenCalled();
    });
  });
});
