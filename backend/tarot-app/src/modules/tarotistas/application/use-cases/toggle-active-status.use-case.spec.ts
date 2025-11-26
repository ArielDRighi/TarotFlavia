import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ToggleActiveStatusUseCase } from './toggle-active-status.use-case';

describe('ToggleActiveStatusUseCase', () => {
  let useCase: ToggleActiveStatusUseCase;

  const mockRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToggleActiveStatusUseCase,
        {
          provide: 'ITarotistaRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ToggleActiveStatusUseCase>(ToggleActiveStatusUseCase);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should toggle active status from true to false', async () => {
      const tarotista = { id: 1, isActive: true };
      const updated = { id: 1, isActive: false };

      mockRepository.findById.mockResolvedValue(tarotista);
      mockRepository.update.mockResolvedValue(updated);

      const result = await useCase.execute(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        isActive: false,
      });
      expect(result).toEqual(updated);
    });

    it('should toggle active status from false to true', async () => {
      const tarotista = { id: 1, isActive: false };
      const updated = { id: 1, isActive: true };

      mockRepository.findById.mockResolvedValue(tarotista);
      mockRepository.update.mockResolvedValue(updated);

      const result = await useCase.execute(1);

      expect(mockRepository.update).toHaveBeenCalledWith(1, { isActive: true });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if tarotista not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
      await expect(useCase.execute(999)).rejects.toThrow(
        'Tarotista with ID 999 not found',
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('setStatus', () => {
    it('should set specific active status', async () => {
      const tarotista = { id: 1, isActive: true };
      const updated = { id: 1, isActive: false };

      mockRepository.findById.mockResolvedValue(tarotista);
      mockRepository.update.mockResolvedValue(updated);

      const result = await useCase.setStatus(1, false);

      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        isActive: false,
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if tarotista not found in setStatus', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.setStatus(999, true)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
