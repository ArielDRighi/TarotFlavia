import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminRemoveWeeklyAvailabilityUseCase } from './admin-remove-weekly-availability.use-case';
import { AVAILABILITY_REPOSITORY } from '../../domain/interfaces/repository.tokens';

describe('AdminRemoveWeeklyAvailabilityUseCase', () => {
  let useCase: AdminRemoveWeeklyAvailabilityUseCase;

  const mockAvailabilityRepo = {
    removeWeeklyAvailability: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminRemoveWeeklyAvailabilityUseCase,
        {
          provide: AVAILABILITY_REPOSITORY,
          useValue: mockAvailabilityRepo,
        },
      ],
    }).compile();

    useCase = module.get<AdminRemoveWeeklyAvailabilityUseCase>(
      AdminRemoveWeeklyAvailabilityUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should remove weekly availability entry', async () => {
      mockAvailabilityRepo.removeWeeklyAvailability.mockResolvedValue(
        undefined,
      );

      await useCase.execute(5, 1);

      expect(
        mockAvailabilityRepo.removeWeeklyAvailability,
      ).toHaveBeenCalledWith(5, 1);
    });

    it('should propagate NotFoundException from repository', async () => {
      mockAvailabilityRepo.removeWeeklyAvailability.mockRejectedValue(
        new NotFoundException('Disponibilidad no encontrada'),
      );

      await expect(useCase.execute(5, 999)).rejects.toThrow(NotFoundException);
    });

    it('should propagate repository errors', async () => {
      mockAvailabilityRepo.removeWeeklyAvailability.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(useCase.execute(5, 1)).rejects.toThrow('DB error');
    });
  });
});
