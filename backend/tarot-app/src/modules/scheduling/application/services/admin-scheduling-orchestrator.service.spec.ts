import { Test, TestingModule } from '@nestjs/testing';
import { AdminSchedulingOrchestratorService } from './admin-scheduling-orchestrator.service';
import { AdminGetWeeklyAvailabilityUseCase } from '../use-cases/admin-get-weekly-availability.use-case';
import { AdminSetWeeklyAvailabilityUseCase } from '../use-cases/admin-set-weekly-availability.use-case';
import { AdminRemoveWeeklyAvailabilityUseCase } from '../use-cases/admin-remove-weekly-availability.use-case';
import { AdminGetExceptionsUseCase } from '../use-cases/admin-get-exceptions.use-case';
import { AdminAddExceptionUseCase } from '../use-cases/admin-add-exception.use-case';
import { AdminRemoveExceptionUseCase } from '../use-cases/admin-remove-exception.use-case';
import { TarotistAvailability } from '../../entities/tarotist-availability.entity';
import { TarotistException } from '../../entities/tarotist-exception.entity';
import { DayOfWeek, ExceptionType } from '../../domain/enums';
import { SetWeeklyAvailabilityDto } from '../dto/set-weekly-availability.dto';
import { AddExceptionDto } from '../dto/add-exception.dto';

describe('AdminSchedulingOrchestratorService', () => {
  let orchestrator: AdminSchedulingOrchestratorService;

  const mockGetWeeklyAvailabilityUseCase = {
    execute: jest.fn(),
  };
  const mockSetWeeklyAvailabilityUseCase = {
    execute: jest.fn(),
  };
  const mockRemoveWeeklyAvailabilityUseCase = {
    execute: jest.fn(),
  };
  const mockGetExceptionsUseCase = {
    execute: jest.fn(),
  };
  const mockAddExceptionUseCase = {
    execute: jest.fn(),
  };
  const mockRemoveExceptionUseCase = {
    execute: jest.fn(),
  };

  const mockAvailability = {
    id: 1,
    tarotistaId: 5,
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: '09:00',
    endTime: '18:00',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as TarotistAvailability;

  const mockException = {
    id: 1,
    tarotistaId: 5,
    exceptionDate: '2026-12-25',
    exceptionType: ExceptionType.BLOCKED,
    startTime: null,
    endTime: null,
    reason: 'Navidad',
    createdAt: new Date('2025-01-01'),
  } as TarotistException;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminSchedulingOrchestratorService,
        {
          provide: AdminGetWeeklyAvailabilityUseCase,
          useValue: mockGetWeeklyAvailabilityUseCase,
        },
        {
          provide: AdminSetWeeklyAvailabilityUseCase,
          useValue: mockSetWeeklyAvailabilityUseCase,
        },
        {
          provide: AdminRemoveWeeklyAvailabilityUseCase,
          useValue: mockRemoveWeeklyAvailabilityUseCase,
        },
        {
          provide: AdminGetExceptionsUseCase,
          useValue: mockGetExceptionsUseCase,
        },
        {
          provide: AdminAddExceptionUseCase,
          useValue: mockAddExceptionUseCase,
        },
        {
          provide: AdminRemoveExceptionUseCase,
          useValue: mockRemoveExceptionUseCase,
        },
      ],
    }).compile();

    orchestrator = module.get<AdminSchedulingOrchestratorService>(
      AdminSchedulingOrchestratorService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(orchestrator).toBeDefined();
  });

  describe('getWeeklyAvailability', () => {
    it('should delegate to AdminGetWeeklyAvailabilityUseCase', async () => {
      mockGetWeeklyAvailabilityUseCase.execute.mockResolvedValue([
        mockAvailability,
      ]);

      const result = await orchestrator.getWeeklyAvailability(5);

      expect(mockGetWeeklyAvailabilityUseCase.execute).toHaveBeenCalledWith(5);
      expect(result).toEqual([mockAvailability]);
    });
  });

  describe('setWeeklyAvailability', () => {
    it('should delegate to AdminSetWeeklyAvailabilityUseCase', async () => {
      const dto: SetWeeklyAvailabilityDto = {
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '18:00',
      };
      mockSetWeeklyAvailabilityUseCase.execute.mockResolvedValue(
        mockAvailability,
      );

      const result = await orchestrator.setWeeklyAvailability(5, dto);

      expect(mockSetWeeklyAvailabilityUseCase.execute).toHaveBeenCalledWith(
        5,
        dto,
      );
      expect(result).toEqual(mockAvailability);
    });
  });

  describe('removeWeeklyAvailability', () => {
    it('should delegate to AdminRemoveWeeklyAvailabilityUseCase', async () => {
      mockRemoveWeeklyAvailabilityUseCase.execute.mockResolvedValue(undefined);

      await orchestrator.removeWeeklyAvailability(5, 1);

      expect(mockRemoveWeeklyAvailabilityUseCase.execute).toHaveBeenCalledWith(
        5,
        1,
      );
    });
  });

  describe('getExceptions', () => {
    it('should delegate to AdminGetExceptionsUseCase', async () => {
      mockGetExceptionsUseCase.execute.mockResolvedValue([mockException]);

      const result = await orchestrator.getExceptions(5);

      expect(mockGetExceptionsUseCase.execute).toHaveBeenCalledWith(5);
      expect(result).toEqual([mockException]);
    });
  });

  describe('addException', () => {
    it('should delegate to AdminAddExceptionUseCase', async () => {
      const dto: AddExceptionDto = {
        exceptionDate: '2026-12-25',
        exceptionType: ExceptionType.BLOCKED,
        reason: 'Navidad',
      };
      mockAddExceptionUseCase.execute.mockResolvedValue(mockException);

      const result = await orchestrator.addException(5, dto);

      expect(mockAddExceptionUseCase.execute).toHaveBeenCalledWith(5, dto);
      expect(result).toEqual(mockException);
    });
  });

  describe('removeException', () => {
    it('should delegate to AdminRemoveExceptionUseCase', async () => {
      mockRemoveExceptionUseCase.execute.mockResolvedValue(undefined);

      await orchestrator.removeException(5, 1);

      expect(mockRemoveExceptionUseCase.execute).toHaveBeenCalledWith(5, 1);
    });
  });
});
