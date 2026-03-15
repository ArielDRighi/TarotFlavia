import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AdminSchedulingController } from './admin-scheduling.controller';
import { AdminSchedulingOrchestratorService } from '../../application/services/admin-scheduling-orchestrator.service';
import { TarotistAvailability } from '../../entities/tarotist-availability.entity';
import { TarotistException } from '../../entities/tarotist-exception.entity';
import { DayOfWeek, ExceptionType } from '../../domain/enums';
import { SetWeeklyAvailabilityDto } from '../../application/dto/set-weekly-availability.dto';
import { AddExceptionDto } from '../../application/dto/add-exception.dto';

describe('AdminSchedulingController', () => {
  let controller: AdminSchedulingController;

  const mockOrchestrator = {
    getWeeklyAvailability: jest.fn(),
    setWeeklyAvailability: jest.fn(),
    removeWeeklyAvailability: jest.fn(),
    getExceptions: jest.fn(),
    addException: jest.fn(),
    removeException: jest.fn(),
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
      controllers: [AdminSchedulingController],
      providers: [
        {
          provide: AdminSchedulingOrchestratorService,
          useValue: mockOrchestrator,
        },
      ],
    }).compile();

    controller = module.get<AdminSchedulingController>(
      AdminSchedulingController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ==================== AVAILABILITY ====================

  describe('getWeeklyAvailability', () => {
    it('should return weekly availability for a tarotista', async () => {
      mockOrchestrator.getWeeklyAvailability.mockResolvedValue([
        mockAvailability,
      ]);

      const result = await controller.getWeeklyAvailability(5);

      expect(mockOrchestrator.getWeeklyAvailability).toHaveBeenCalledWith(5);
      expect(result).toEqual([mockAvailability]);
    });

    it('should return empty array when no availability configured', async () => {
      mockOrchestrator.getWeeklyAvailability.mockResolvedValue([]);

      const result = await controller.getWeeklyAvailability(99);

      expect(result).toEqual([]);
    });
  });

  describe('setWeeklyAvailability', () => {
    it('should set weekly availability and return the result', async () => {
      const dto: SetWeeklyAvailabilityDto = {
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '18:00',
      };
      mockOrchestrator.setWeeklyAvailability.mockResolvedValue(
        mockAvailability,
      );

      const result = await controller.setWeeklyAvailability(5, dto);

      expect(mockOrchestrator.setWeeklyAvailability).toHaveBeenCalledWith(
        5,
        dto,
      );
      expect(result).toEqual(mockAvailability);
    });

    it('should propagate ConflictException', async () => {
      const dto: SetWeeklyAvailabilityDto = {
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '18:00',
        endTime: '09:00',
      };
      mockOrchestrator.setWeeklyAvailability.mockRejectedValue(
        new ConflictException(
          'La hora de inicio debe ser anterior a la hora de fin',
        ),
      );

      await expect(controller.setWeeklyAvailability(5, dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('removeWeeklyAvailability', () => {
    it('should remove weekly availability and return message', async () => {
      mockOrchestrator.removeWeeklyAvailability.mockResolvedValue(undefined);

      const result = await controller.removeWeeklyAvailability(5, 1);

      expect(mockOrchestrator.removeWeeklyAvailability).toHaveBeenCalledWith(
        5,
        1,
      );
      expect(result).toEqual({
        message: 'Disponibilidad eliminada correctamente',
      });
    });

    it('should propagate NotFoundException', async () => {
      mockOrchestrator.removeWeeklyAvailability.mockRejectedValue(
        new NotFoundException('Disponibilidad no encontrada'),
      );

      await expect(controller.removeWeeklyAvailability(5, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ==================== EXCEPTIONS ====================

  describe('getExceptions', () => {
    it('should return exceptions for a tarotista', async () => {
      mockOrchestrator.getExceptions.mockResolvedValue([mockException]);

      const result = await controller.getExceptions(5);

      expect(mockOrchestrator.getExceptions).toHaveBeenCalledWith(5);
      expect(result).toEqual([mockException]);
    });
  });

  describe('addException', () => {
    it('should add an exception and return it', async () => {
      const dto: AddExceptionDto = {
        exceptionDate: '2026-12-25',
        exceptionType: ExceptionType.BLOCKED,
        reason: 'Navidad',
      };
      mockOrchestrator.addException.mockResolvedValue(mockException);

      const result = await controller.addException(5, dto);

      expect(mockOrchestrator.addException).toHaveBeenCalledWith(5, dto);
      expect(result).toEqual(mockException);
    });

    it('should propagate ConflictException when date already has exception', async () => {
      const dto: AddExceptionDto = {
        exceptionDate: '2026-12-25',
        exceptionType: ExceptionType.BLOCKED,
      };
      mockOrchestrator.addException.mockRejectedValue(
        new ConflictException('Ya existe una excepción para esta fecha'),
      );

      await expect(controller.addException(5, dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('removeException', () => {
    it('should remove exception and return message', async () => {
      mockOrchestrator.removeException.mockResolvedValue(undefined);

      const result = await controller.removeException(5, 1);

      expect(mockOrchestrator.removeException).toHaveBeenCalledWith(5, 1);
      expect(result).toEqual({ message: 'Excepción eliminada correctamente' });
    });

    it('should propagate NotFoundException', async () => {
      mockOrchestrator.removeException.mockRejectedValue(
        new NotFoundException('Excepción no encontrada'),
      );

      await expect(controller.removeException(5, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
