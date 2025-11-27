import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TypeOrmAvailabilityRepository } from './typeorm-availability.repository';
import { TarotistAvailability } from '../../entities/tarotist-availability.entity';
import { SetWeeklyAvailabilityDto } from '../../application/dto/set-weekly-availability.dto';

describe('TypeOrmAvailabilityRepository', () => {
  let repository: TypeOrmAvailabilityRepository;
  let typeOrmRepository: jest.Mocked<Repository<TarotistAvailability>>;

  const mockAvailability: TarotistAvailability = {
    id: 1,
    tarotistaId: 1,
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '18:00',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as TarotistAvailability;

  beforeEach(async () => {
    const mockTypeOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmAvailabilityRepository,
        {
          provide: getRepositoryToken(TarotistAvailability),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmAvailabilityRepository>(
      TypeOrmAvailabilityRepository,
    );
    typeOrmRepository = module.get(getRepositoryToken(TarotistAvailability));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setWeeklyAvailability', () => {
    const dto: SetWeeklyAvailabilityDto = {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '18:00',
    };

    it('should throw ConflictException when startTime >= endTime', async () => {
      const invalidDto: SetWeeklyAvailabilityDto = {
        dayOfWeek: 1,
        startTime: '18:00',
        endTime: '09:00',
      };

      await expect(
        repository.setWeeklyAvailability(1, invalidDto),
      ).rejects.toThrow(ConflictException);
      await expect(
        repository.setWeeklyAvailability(1, invalidDto),
      ).rejects.toThrow('La hora de inicio debe ser anterior a la hora de fin');
    });

    it('should update existing availability when found', async () => {
      const existing = { ...mockAvailability };
      typeOrmRepository.findOne.mockResolvedValue(existing);
      typeOrmRepository.save.mockResolvedValue({
        ...existing,
        startTime: dto.startTime,
        endTime: dto.endTime,
      });

      const result = await repository.setWeeklyAvailability(1, dto);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { tarotistaId: 1, dayOfWeek: 1 },
      });
      expect(typeOrmRepository.save).toHaveBeenCalledWith({
        ...existing,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
      });
      expect(result.startTime).toBe('09:00');
      expect(result.endTime).toBe('18:00');
    });

    it('should create new availability when not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);
      typeOrmRepository.create.mockReturnValue(mockAvailability);
      typeOrmRepository.save.mockResolvedValue(mockAvailability);

      const result = await repository.setWeeklyAvailability(1, dto);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { tarotistaId: 1, dayOfWeek: 1 },
      });
      expect(typeOrmRepository.create).toHaveBeenCalledWith({
        tarotistaId: 1,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
      });
      expect(typeOrmRepository.save).toHaveBeenCalledWith(mockAvailability);
      expect(result).toEqual(mockAvailability);
    });
  });

  describe('getWeeklyAvailability', () => {
    it('should return all active weekly availability for a tarotist', async () => {
      const availabilities = [
        mockAvailability,
        { ...mockAvailability, id: 2, dayOfWeek: 2 },
      ];
      typeOrmRepository.find.mockResolvedValue(availabilities);

      const result = await repository.getWeeklyAvailability(1);

      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: { tarotistaId: 1, isActive: true },
        order: { dayOfWeek: 'ASC' },
      });
      expect(result).toEqual(availabilities);
    });

    it('should return empty array when no availability found', async () => {
      typeOrmRepository.find.mockResolvedValue([]);

      const result = await repository.getWeeklyAvailability(1);

      expect(result).toEqual([]);
    });
  });

  describe('removeWeeklyAvailability', () => {
    it('should remove availability when found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockAvailability);
      typeOrmRepository.remove.mockResolvedValue(mockAvailability);

      await repository.removeWeeklyAvailability(1, 1);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, tarotistaId: 1 },
      });
      expect(typeOrmRepository.remove).toHaveBeenCalledWith(mockAvailability);
    });

    it('should throw NotFoundException when availability not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      await expect(repository.removeWeeklyAvailability(1, 999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(repository.removeWeeklyAvailability(1, 999)).rejects.toThrow(
        'Disponibilidad no encontrada',
      );
    });
  });

  describe('findByTarotistaAndDay', () => {
    it('should find availability by tarotist and day', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockAvailability);

      const result = await repository.findByTarotistaAndDay(1, 1);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { tarotistaId: 1, dayOfWeek: 1 },
      });
      expect(result).toEqual(mockAvailability);
    });

    it('should return null when not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByTarotistaAndDay(1, 7);

      expect(result).toBeNull();
    });
  });
});
