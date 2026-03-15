import { Test, TestingModule } from '@nestjs/testing';
import { AdminGetWeeklyAvailabilityUseCase } from './admin-get-weekly-availability.use-case';
import { AVAILABILITY_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { TarotistAvailability } from '../../entities/tarotist-availability.entity';
import { DayOfWeek } from '../../domain/enums';

describe('AdminGetWeeklyAvailabilityUseCase', () => {
  let useCase: AdminGetWeeklyAvailabilityUseCase;

  const mockAvailabilityRepo = {
    getWeeklyAvailability: jest.fn(),
  };

  const mockAvailabilities = [
    {
      id: 1,
      tarotistaId: 5,
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: '09:00',
      endTime: '18:00',
      isActive: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    {
      id: 2,
      tarotistaId: 5,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: '10:00',
      endTime: '16:00',
      isActive: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
  ] as TarotistAvailability[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGetWeeklyAvailabilityUseCase,
        {
          provide: AVAILABILITY_REPOSITORY,
          useValue: mockAvailabilityRepo,
        },
      ],
    }).compile();

    useCase = module.get<AdminGetWeeklyAvailabilityUseCase>(
      AdminGetWeeklyAvailabilityUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return weekly availability for a tarotista', async () => {
      mockAvailabilityRepo.getWeeklyAvailability.mockResolvedValue(
        mockAvailabilities,
      );

      const result = await useCase.execute(5);

      expect(mockAvailabilityRepo.getWeeklyAvailability).toHaveBeenCalledWith(
        5,
      );
      expect(result).toEqual(mockAvailabilities);
    });

    it('should return empty array when no availability configured', async () => {
      mockAvailabilityRepo.getWeeklyAvailability.mockResolvedValue([]);

      const result = await useCase.execute(99);

      expect(result).toEqual([]);
    });

    it('should propagate repository errors', async () => {
      mockAvailabilityRepo.getWeeklyAvailability.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(useCase.execute(5)).rejects.toThrow('DB error');
    });
  });
});
