import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AdminSetWeeklyAvailabilityUseCase } from './admin-set-weekly-availability.use-case';
import { AVAILABILITY_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { TarotistAvailability } from '../../entities/tarotist-availability.entity';
import { DayOfWeek } from '../../domain/enums';
import { SetWeeklyAvailabilityDto } from '../dto/set-weekly-availability.dto';

describe('AdminSetWeeklyAvailabilityUseCase', () => {
  let useCase: AdminSetWeeklyAvailabilityUseCase;

  const mockAvailabilityRepo = {
    setWeeklyAvailability: jest.fn(),
  };

  const dto: SetWeeklyAvailabilityDto = {
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: '09:00',
    endTime: '18:00',
  };

  const mockResult = {
    id: 1,
    tarotistaId: 5,
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: '09:00',
    endTime: '18:00',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as TarotistAvailability;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminSetWeeklyAvailabilityUseCase,
        {
          provide: AVAILABILITY_REPOSITORY,
          useValue: mockAvailabilityRepo,
        },
      ],
    }).compile();

    useCase = module.get<AdminSetWeeklyAvailabilityUseCase>(
      AdminSetWeeklyAvailabilityUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should set weekly availability for a tarotista', async () => {
      mockAvailabilityRepo.setWeeklyAvailability.mockResolvedValue(mockResult);

      const result = await useCase.execute(5, dto);

      expect(mockAvailabilityRepo.setWeeklyAvailability).toHaveBeenCalledWith(
        5,
        dto,
      );
      expect(result).toEqual(mockResult);
    });

    it('should propagate ConflictException from repository', async () => {
      mockAvailabilityRepo.setWeeklyAvailability.mockRejectedValue(
        new ConflictException(
          'La hora de inicio debe ser anterior a la hora de fin',
        ),
      );

      await expect(useCase.execute(5, dto)).rejects.toThrow(ConflictException);
    });

    it('should propagate repository errors', async () => {
      mockAvailabilityRepo.setWeeklyAvailability.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(useCase.execute(5, dto)).rejects.toThrow('DB error');
    });
  });
});
