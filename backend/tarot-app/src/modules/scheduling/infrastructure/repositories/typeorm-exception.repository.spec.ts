import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TypeOrmExceptionRepository } from './typeorm-exception.repository';
import { TarotistException } from '../../entities/tarotist-exception.entity';
import { AddExceptionDto } from '../../application/dto/add-exception.dto';
import { ExceptionType } from '../../domain/enums/exception-type.enum';

describe('TypeOrmExceptionRepository', () => {
  let repository: TypeOrmExceptionRepository;
  let typeOrmRepository: jest.Mocked<Repository<TarotistException>>;

  const mockException: TarotistException = {
    id: 1,
    tarotistaId: 1,
    exceptionDate: '2025-06-15',
    exceptionType: ExceptionType.BLOCKED,
    startTime: undefined,
    endTime: undefined,
    reason: 'Personal',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

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
        TypeOrmExceptionRepository,
        {
          provide: getRepositoryToken(TarotistException),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmExceptionRepository>(
      TypeOrmExceptionRepository,
    );
    typeOrmRepository = module.get(getRepositoryToken(TarotistException));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addException', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    it('should throw ConflictException when date is in the past', async () => {
      const pastDto: AddExceptionDto = {
        exceptionDate: '2020-01-01',
        exceptionType: ExceptionType.BLOCKED,
      };

      await expect(repository.addException(1, pastDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(repository.addException(1, pastDto)).rejects.toThrow(
        'No se pueden agregar excepciones en el pasado',
      );
    });

    it('should throw ConflictException when custom_hours has startTime >= endTime', async () => {
      const invalidDto: AddExceptionDto = {
        exceptionDate: futureDateStr,
        exceptionType: ExceptionType.CUSTOM_HOURS,
        startTime: '18:00',
        endTime: '09:00',
      };

      await expect(repository.addException(1, invalidDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(repository.addException(1, invalidDto)).rejects.toThrow(
        'La hora de inicio debe ser anterior a la hora de fin',
      );
    });

    it('should throw ConflictException when exception already exists for date', async () => {
      const dto: AddExceptionDto = {
        exceptionDate: futureDateStr,
        exceptionType: ExceptionType.BLOCKED,
        reason: 'Vacation',
      };

      typeOrmRepository.findOne.mockResolvedValue(mockException);

      await expect(repository.addException(1, dto)).rejects.toThrow(
        ConflictException,
      );
      await expect(repository.addException(1, dto)).rejects.toThrow(
        'Ya existe una excepción para esta fecha',
      );
    });

    it('should create exception when validation passes', async () => {
      const dto: AddExceptionDto = {
        exceptionDate: futureDateStr,
        exceptionType: ExceptionType.BLOCKED,
        reason: 'Personal',
      };

      typeOrmRepository.findOne.mockResolvedValue(null);
      typeOrmRepository.create.mockReturnValue(mockException);
      typeOrmRepository.save.mockResolvedValue(mockException);

      const result = await repository.addException(1, dto);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { tarotistaId: 1, exceptionDate: futureDateStr },
      });
      expect(typeOrmRepository.create).toHaveBeenCalledWith({
        tarotistaId: 1,
        exceptionDate: futureDateStr,
        exceptionType: ExceptionType.BLOCKED,
        startTime: undefined,
        endTime: undefined,
        reason: 'Personal',
      });
      expect(result).toEqual(mockException);
    });

    it('should create custom_hours exception with valid times', async () => {
      const dto: AddExceptionDto = {
        exceptionDate: futureDateStr,
        exceptionType: ExceptionType.CUSTOM_HOURS,
        startTime: '10:00',
        endTime: '14:00',
        reason: 'Limited hours',
      };

      const customException = {
        ...mockException,
        exceptionType: ExceptionType.CUSTOM_HOURS,
        startTime: '10:00',
        endTime: '14:00',
      };

      typeOrmRepository.findOne.mockResolvedValue(null);
      typeOrmRepository.create.mockReturnValue(customException);
      typeOrmRepository.save.mockResolvedValue(customException);

      const result = await repository.addException(1, dto);

      expect(typeOrmRepository.create).toHaveBeenCalledWith({
        tarotistaId: 1,
        exceptionDate: futureDateStr,
        exceptionType: ExceptionType.CUSTOM_HOURS,
        startTime: '10:00',
        endTime: '14:00',
        reason: 'Limited hours',
      });
      expect(result).toEqual(customException);
    });
  });

  describe('getExceptions', () => {
    it('should return future exceptions for a tarotist', async () => {
      const exceptions = [mockException];
      typeOrmRepository.find.mockResolvedValue(exceptions);

      const result = await repository.getExceptions(1);

      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: {
          tarotistaId: 1,
          exceptionDate: Between(expect.any(String), '2099-12-31'),
        },
        order: { exceptionDate: 'ASC' },
      });
      expect(result).toEqual(exceptions);
    });
  });

  describe('getExceptionsByDateRange', () => {
    it('should return exceptions within date range', async () => {
      const exceptions = [mockException];
      typeOrmRepository.find.mockResolvedValue(exceptions);

      const result = await repository.getExceptionsByDateRange(
        1,
        '2025-06-01',
        '2025-06-30',
      );

      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: {
          tarotistaId: 1,
          exceptionDate: Between('2025-06-01', '2025-06-30'),
        },
      });
      expect(result).toEqual(exceptions);
    });
  });

  describe('removeException', () => {
    it('should remove exception when found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockException);
      typeOrmRepository.remove.mockResolvedValue(mockException);

      await repository.removeException(1, 1);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, tarotistaId: 1 },
      });
      expect(typeOrmRepository.remove).toHaveBeenCalledWith(mockException);
    });

    it('should throw NotFoundException when exception not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      await expect(repository.removeException(1, 999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(repository.removeException(1, 999)).rejects.toThrow(
        'Excepción no encontrada',
      );
    });
  });

  describe('findByTarotistaAndDate', () => {
    it('should find exception by tarotist and date', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockException);

      const result = await repository.findByTarotistaAndDate(1, '2025-06-15');

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { tarotistaId: 1, exceptionDate: '2025-06-15' },
      });
      expect(result).toEqual(mockException);
    });

    it('should return null when not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByTarotistaAndDate(1, '2025-12-25');

      expect(result).toBeNull();
    });
  });
});
