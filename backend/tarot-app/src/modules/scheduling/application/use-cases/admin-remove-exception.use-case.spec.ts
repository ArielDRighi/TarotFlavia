import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminRemoveExceptionUseCase } from './admin-remove-exception.use-case';
import { EXCEPTION_REPOSITORY } from '../../domain/interfaces/repository.tokens';

describe('AdminRemoveExceptionUseCase', () => {
  let useCase: AdminRemoveExceptionUseCase;

  const mockExceptionRepo = {
    removeException: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminRemoveExceptionUseCase,
        {
          provide: EXCEPTION_REPOSITORY,
          useValue: mockExceptionRepo,
        },
      ],
    }).compile();

    useCase = module.get<AdminRemoveExceptionUseCase>(
      AdminRemoveExceptionUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should remove exception entry', async () => {
      mockExceptionRepo.removeException.mockResolvedValue(undefined);

      await useCase.execute(5, 1);

      expect(mockExceptionRepo.removeException).toHaveBeenCalledWith(5, 1);
    });

    it('should propagate NotFoundException from repository', async () => {
      mockExceptionRepo.removeException.mockRejectedValue(
        new NotFoundException('Excepción no encontrada'),
      );

      await expect(useCase.execute(5, 999)).rejects.toThrow(NotFoundException);
    });

    it('should propagate repository errors', async () => {
      mockExceptionRepo.removeException.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(useCase.execute(5, 1)).rejects.toThrow('DB error');
    });
  });
});
