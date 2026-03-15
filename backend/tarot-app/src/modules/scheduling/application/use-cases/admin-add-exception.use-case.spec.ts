import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AdminAddExceptionUseCase } from './admin-add-exception.use-case';
import { EXCEPTION_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { TarotistException } from '../../entities/tarotist-exception.entity';
import { ExceptionType } from '../../domain/enums';
import { AddExceptionDto } from '../dto/add-exception.dto';

describe('AdminAddExceptionUseCase', () => {
  let useCase: AdminAddExceptionUseCase;

  const mockExceptionRepo = {
    addException: jest.fn(),
  };

  const blockedDto: AddExceptionDto = {
    exceptionDate: '2026-12-25',
    exceptionType: ExceptionType.BLOCKED,
    reason: 'Navidad',
  };

  const customHoursDto: AddExceptionDto = {
    exceptionDate: '2026-12-31',
    exceptionType: ExceptionType.CUSTOM_HOURS,
    startTime: '10:00',
    endTime: '14:00',
    reason: 'Año Nuevo',
  };

  const mockBlockedResult = {
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
        AdminAddExceptionUseCase,
        {
          provide: EXCEPTION_REPOSITORY,
          useValue: mockExceptionRepo,
        },
      ],
    }).compile();

    useCase = module.get<AdminAddExceptionUseCase>(AdminAddExceptionUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should add a blocked exception', async () => {
      mockExceptionRepo.addException.mockResolvedValue(mockBlockedResult);

      const result = await useCase.execute(5, blockedDto);

      expect(mockExceptionRepo.addException).toHaveBeenCalledWith(
        5,
        blockedDto,
      );
      expect(result).toEqual(mockBlockedResult);
    });

    it('should add a custom hours exception', async () => {
      const mockCustomResult = {
        id: 2,
        tarotistaId: 5,
        exceptionDate: '2026-12-31',
        exceptionType: ExceptionType.CUSTOM_HOURS,
        startTime: '10:00',
        endTime: '14:00',
        reason: 'Año Nuevo',
        createdAt: new Date('2025-01-01'),
      } as TarotistException;
      mockExceptionRepo.addException.mockResolvedValue(mockCustomResult);

      const result = await useCase.execute(5, customHoursDto);

      expect(result.exceptionType).toBe(ExceptionType.CUSTOM_HOURS);
      expect(result.startTime).toBe('10:00');
    });

    it('should propagate ConflictException when exception already exists', async () => {
      mockExceptionRepo.addException.mockRejectedValue(
        new ConflictException('Ya existe una excepción para esta fecha'),
      );

      await expect(useCase.execute(5, blockedDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should propagate ConflictException for past dates', async () => {
      mockExceptionRepo.addException.mockRejectedValue(
        new ConflictException('No se pueden agregar excepciones en el pasado'),
      );

      await expect(useCase.execute(5, blockedDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should propagate repository errors', async () => {
      mockExceptionRepo.addException.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(5, blockedDto)).rejects.toThrow('DB error');
    });
  });
});
