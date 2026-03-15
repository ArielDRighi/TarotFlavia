import { Test, TestingModule } from '@nestjs/testing';
import { AdminGetExceptionsUseCase } from './admin-get-exceptions.use-case';
import { EXCEPTION_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { TarotistException } from '../../entities/tarotist-exception.entity';
import { ExceptionType } from '../../domain/enums';

describe('AdminGetExceptionsUseCase', () => {
  let useCase: AdminGetExceptionsUseCase;

  const mockExceptionRepo = {
    getExceptions: jest.fn(),
  };

  const mockExceptions = [
    {
      id: 1,
      tarotistaId: 5,
      exceptionDate: '2026-12-25',
      exceptionType: ExceptionType.BLOCKED,
      startTime: null,
      endTime: null,
      reason: 'Navidad',
      createdAt: new Date('2025-01-01'),
    },
    {
      id: 2,
      tarotistaId: 5,
      exceptionDate: '2026-12-31',
      exceptionType: ExceptionType.CUSTOM_HOURS,
      startTime: '10:00',
      endTime: '14:00',
      reason: 'Año Nuevo',
      createdAt: new Date('2025-01-01'),
    },
  ] as TarotistException[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGetExceptionsUseCase,
        {
          provide: EXCEPTION_REPOSITORY,
          useValue: mockExceptionRepo,
        },
      ],
    }).compile();

    useCase = module.get<AdminGetExceptionsUseCase>(AdminGetExceptionsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return exceptions for a tarotista', async () => {
      mockExceptionRepo.getExceptions.mockResolvedValue(mockExceptions);

      const result = await useCase.execute(5);

      expect(mockExceptionRepo.getExceptions).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockExceptions);
    });

    it('should return empty array when no exceptions', async () => {
      mockExceptionRepo.getExceptions.mockResolvedValue([]);

      const result = await useCase.execute(99);

      expect(result).toEqual([]);
    });

    it('should propagate repository errors', async () => {
      mockExceptionRepo.getExceptions.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(5)).rejects.toThrow('DB error');
    });
  });
});
