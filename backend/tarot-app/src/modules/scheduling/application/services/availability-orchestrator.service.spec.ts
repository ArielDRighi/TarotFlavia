import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityOrchestratorService } from './availability-orchestrator.service';
import { GetAvailableSlotsUseCase } from '../use-cases/get-available-slots.use-case';
import { AvailableSlotDto } from '../dto/session-response.dto';

describe('AvailabilityOrchestratorService', () => {
  let service: AvailabilityOrchestratorService;
  let getAvailableSlotsUseCase: jest.Mocked<GetAvailableSlotsUseCase>;

  const mockSlots: AvailableSlotDto[] = [
    {
      date: '2025-01-15',
      time: '10:00',
      durationMinutes: 60,
      available: true,
    },
    {
      date: '2025-01-15',
      time: '14:00',
      durationMinutes: 60,
      available: true,
    },
  ];

  beforeEach(async () => {
    const mockGetAvailableSlotsUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityOrchestratorService,
        {
          provide: GetAvailableSlotsUseCase,
          useValue: mockGetAvailableSlotsUseCase,
        },
      ],
    }).compile();

    service = module.get<AvailabilityOrchestratorService>(
      AvailabilityOrchestratorService,
    );
    getAvailableSlotsUseCase = module.get(GetAvailableSlotsUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAvailableSlots', () => {
    it('should call use case with correct parameters', async () => {
      getAvailableSlotsUseCase.execute.mockResolvedValue(mockSlots);

      const result = await service.getAvailableSlots(
        1,
        '2025-01-15',
        '2025-01-15',
        60,
      );

      expect(getAvailableSlotsUseCase.execute).toHaveBeenCalledWith(
        1,
        '2025-01-15',
        '2025-01-15',
        60,
      );
      expect(result).toEqual(mockSlots);
    });

    it('should return empty array when no slots available', async () => {
      getAvailableSlotsUseCase.execute.mockResolvedValue([]);

      const result = await service.getAvailableSlots(
        1,
        '2025-01-15',
        '2025-01-15',
        60,
      );

      expect(result).toEqual([]);
    });

    it('should propagate errors from use case', async () => {
      const error = new Error('Use case error');
      getAvailableSlotsUseCase.execute.mockRejectedValue(error);

      await expect(
        service.getAvailableSlots(1, '2025-01-15', '2025-01-15', 60),
      ).rejects.toThrow('Use case error');
    });
  });
});
