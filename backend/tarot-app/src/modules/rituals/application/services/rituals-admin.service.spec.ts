import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { RitualsAdminService } from './rituals-admin.service';
import { Ritual } from '../../entities/ritual.entity';
import { RitualStep } from '../../entities/ritual-step.entity';
import { RitualMaterial } from '../../entities/ritual-material.entity';
import {
  RitualCategory,
  RitualDifficulty,
  LunarPhase,
  MaterialType,
} from '../../domain/enums';
import { CreateRitualDto } from '../dto/create-ritual.dto';
import { UpdateRitualDto } from '../dto/update-ritual.dto';

describe('RitualsAdminService', () => {
  let service: RitualsAdminService;
  let ritualRepository: jest.Mocked<Repository<Ritual>>;
  let stepRepository: jest.Mocked<Repository<RitualStep>>;
  let materialRepository: jest.Mocked<Repository<RitualMaterial>>;
  let _dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;

  const mockRitual: Partial<Ritual> = {
    id: 1,
    slug: 'ritual-test',
    title: 'Ritual de Test',
    description: 'Descripción de test',
    category: RitualCategory.LUNAR,
    difficulty: RitualDifficulty.BEGINNER,
    durationMinutes: 30,
    bestLunarPhase: LunarPhase.NEW_MOON,
    imageUrl: '/images/test.jpg',
    isActive: true,
    isFeatured: false,
    completionCount: 0,
    viewCount: 0,
    materials: [],
    steps: [],
  };

  const mockCreateDto: CreateRitualDto = {
    slug: 'ritual-test',
    title: 'Ritual de Test',
    description: 'Descripción de test',
    category: RitualCategory.LUNAR,
    difficulty: RitualDifficulty.BEGINNER,
    durationMinutes: 30,
    imageUrl: '/images/test.jpg',
    materials: [
      {
        name: 'Vela blanca',
        type: MaterialType.REQUIRED,
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Paso 1',
        description: 'Descripción paso 1',
      },
    ],
  };

  beforeEach(async () => {
    // Mock QueryRunner
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RitualsAdminService,
        {
          provide: getRepositoryToken(Ritual),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RitualStep),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RitualMaterial),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => queryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<RitualsAdminService>(RitualsAdminService);
    ritualRepository = module.get(getRepositoryToken(Ritual));
    stepRepository = module.get(getRepositoryToken(RitualStep));
    materialRepository = module.get(getRepositoryToken(RitualMaterial));
    _dataSource = module.get(DataSource);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a complete ritual with materials and steps', async () => {
      ritualRepository.findOne.mockResolvedValue(null);
      ritualRepository.create.mockReturnValue(mockRitual as Ritual);
      (queryRunner.manager.save as jest.Mock).mockResolvedValue(mockRitual);

      const findByIdSpy = jest
        .spyOn(service, 'findById')
        .mockResolvedValue(mockRitual as Ritual);

      const result = await service.create(mockCreateDto);

      expect(ritualRepository.findOne).toHaveBeenCalledWith({
        where: { slug: mockCreateDto.slug },
      });
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(findByIdSpy).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if slug already exists', async () => {
      ritualRepository.findOne.mockResolvedValue(mockRitual as Ritual);

      await expect(service.create(mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(mockCreateDto)).rejects.toThrow(
        `Ya existe un ritual con el slug "${mockCreateDto.slug}"`,
      );
    });

    it('should rollback transaction on error', async () => {
      ritualRepository.findOne.mockResolvedValue(null);
      (queryRunner.manager.save as jest.Mock).mockRejectedValue(
        new Error('DB Error'),
      );

      await expect(service.create(mockCreateDto)).rejects.toThrow('DB Error');
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all rituals including inactive ones', async () => {
      const rituals = [mockRitual, { ...mockRitual, id: 2, isActive: false }];
      ritualRepository.find.mockResolvedValue(rituals as Ritual[]);

      const result = await service.findAll();

      expect(ritualRepository.find).toHaveBeenCalledWith({
        relations: ['materials', 'steps'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(rituals);
      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should return a ritual by id', async () => {
      ritualRepository.findOne.mockResolvedValue(mockRitual as Ritual);

      const result = await service.findById(1);

      expect(ritualRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['materials', 'steps'],
      });
      expect(result).toEqual(mockRitual);
    });

    it('should throw NotFoundException if ritual not found', async () => {
      ritualRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      await expect(service.findById(999)).rejects.toThrow(
        'Ritual con ID 999 no encontrado',
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateRitualDto = {
      title: 'Ritual Actualizado',
    };

    it('should update a ritual', async () => {
      ritualRepository.findOne.mockResolvedValue(mockRitual as Ritual);
      ritualRepository.save.mockResolvedValue({
        ...mockRitual,
        ...updateDto,
      } as Ritual);

      const result = await service.update(1, updateDto);

      expect(ritualRepository.save).toHaveBeenCalled();
      expect(result.title).toBe(updateDto.title);
    });

    it('should replace materials if provided in update', async () => {
      const updateWithMaterials: UpdateRitualDto = {
        materials: [
          {
            name: 'Nueva vela',
            type: MaterialType.REQUIRED,
          },
        ],
      };

      ritualRepository.findOne.mockResolvedValue(mockRitual as Ritual);
      ritualRepository.save.mockResolvedValue(mockRitual as Ritual);
      materialRepository.delete.mockResolvedValue({ affected: 1 } as any);
      materialRepository.create.mockReturnValue({} as RitualMaterial);
      materialRepository.save.mockResolvedValue({} as RitualMaterial);

      await service.update(1, updateWithMaterials);

      expect(materialRepository.delete).toHaveBeenCalledWith({ ritualId: 1 });
      expect(materialRepository.save).toHaveBeenCalled();
    });

    it('should replace steps if provided in update', async () => {
      const updateWithSteps: UpdateRitualDto = {
        steps: [
          {
            stepNumber: 1,
            title: 'Nuevo paso',
            description: 'Nueva descripción',
          },
        ],
      };

      ritualRepository.findOne.mockResolvedValue(mockRitual as Ritual);
      ritualRepository.save.mockResolvedValue(mockRitual as Ritual);
      stepRepository.delete.mockResolvedValue({ affected: 1 } as any);
      stepRepository.create.mockReturnValue({} as RitualStep);
      stepRepository.save.mockResolvedValue({} as RitualStep);

      await service.update(1, updateWithSteps);

      expect(stepRepository.delete).toHaveBeenCalledWith({ ritualId: 1 });
      expect(stepRepository.save).toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('should mark ritual as inactive', async () => {
      const activeMockRitual = { ...mockRitual, isActive: true };
      ritualRepository.findOne.mockResolvedValue(activeMockRitual as Ritual);
      ritualRepository.save.mockResolvedValue({
        ...activeMockRitual,
        isActive: false,
      } as Ritual);

      await service.softDelete(1);

      expect(ritualRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });

    it('should throw NotFoundException if ritual not found', async () => {
      ritualRepository.findOne.mockResolvedValue(null);

      await expect(service.softDelete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleActive', () => {
    it('should toggle isActive from true to false', async () => {
      const activeMockRitual = { ...mockRitual, isActive: true };
      ritualRepository.findOne.mockResolvedValue(activeMockRitual as Ritual);
      ritualRepository.save.mockResolvedValue({
        ...activeMockRitual,
        isActive: false,
      } as Ritual);

      const result = await service.toggleActive(1);

      expect(result.isActive).toBe(false);
    });

    it('should toggle isActive from false to true', async () => {
      const inactiveMockRitual = { ...mockRitual, isActive: false };
      ritualRepository.findOne.mockResolvedValue(inactiveMockRitual as Ritual);
      ritualRepository.save.mockResolvedValue({
        ...inactiveMockRitual,
        isActive: true,
      } as Ritual);

      const result = await service.toggleActive(1);

      expect(result.isActive).toBe(true);
    });
  });

  describe('duplicate', () => {
    it('should duplicate a ritual with new slug', async () => {
      const originalRitual = {
        ...mockRitual,
        materials: [
          {
            id: 1,
            name: 'Vela',
            type: MaterialType.REQUIRED,
            ritualId: 1,
          } as RitualMaterial,
        ],
        steps: [
          {
            id: 1,
            stepNumber: 1,
            title: 'Paso 1',
            description: 'Desc',
            ritualId: 1,
          } as RitualStep,
        ],
      };

      ritualRepository.findOne
        .mockResolvedValueOnce(originalRitual as Ritual) // findById
        .mockResolvedValueOnce(null); // Check new slug doesn't exist

      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockRitual as Ritual);

      const result = await service.duplicate(1, 'ritual-test-copia');

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'ritual-test-copia',
          title: expect.stringContaining('(copia)'),
          isActive: false,
          isFeatured: false,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if new slug already exists', async () => {
      ritualRepository.findOne
        .mockResolvedValueOnce(mockRitual as Ritual) // findById
        .mockResolvedValueOnce(mockRitual as Ritual); // Slug already exists

      await expect(service.duplicate(1, 'existing-slug')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('addStep', () => {
    const newStepDto = {
      stepNumber: 2,
      title: 'Paso 2',
      description: 'Nueva descripción',
    };

    it('should add a new step to a ritual', async () => {
      ritualRepository.findOne.mockResolvedValue(mockRitual as Ritual);
      stepRepository.create.mockReturnValue(newStepDto as RitualStep);
      stepRepository.save.mockResolvedValue(newStepDto as RitualStep);

      const result = await service.addStep(1, newStepDto);

      expect(stepRepository.create).toHaveBeenCalledWith({
        ...newStepDto,
        ritualId: 1,
      });
      expect(stepRepository.save).toHaveBeenCalled();
      expect(result).toEqual(newStepDto);
    });

    it('should throw NotFoundException if ritual not found', async () => {
      ritualRepository.findOne.mockResolvedValue(null);

      await expect(service.addStep(999, newStepDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStep', () => {
    const updateStepDto = {
      title: 'Paso Actualizado',
    };

    it('should update a step', async () => {
      const existingStep = {
        id: 1,
        ritualId: 1,
        stepNumber: 1,
        title: 'Paso Original',
        description: 'Desc',
      } as RitualStep;

      stepRepository.findOne.mockResolvedValue(existingStep);
      stepRepository.save.mockResolvedValue({
        ...existingStep,
        ...updateStepDto,
      });

      const result = await service.updateStep(1, 1, updateStepDto);

      expect(stepRepository.save).toHaveBeenCalled();
      expect(result.title).toBe(updateStepDto.title);
    });

    it('should throw NotFoundException if step not found', async () => {
      stepRepository.findOne.mockResolvedValue(null);

      await expect(service.updateStep(1, 999, updateStepDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteStep', () => {
    it('should delete a step', async () => {
      stepRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.deleteStep(1, 1);

      expect(stepRepository.delete).toHaveBeenCalledWith({
        id: 1,
        ritualId: 1,
      });
    });

    it('should throw NotFoundException if step not found', async () => {
      stepRepository.delete.mockResolvedValue({ affected: 0 } as any);

      await expect(service.deleteStep(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addMaterial', () => {
    const newMaterialDto = {
      name: 'Incienso',
      type: MaterialType.OPTIONAL,
    };

    it('should add a new material to a ritual', async () => {
      ritualRepository.findOne.mockResolvedValue(mockRitual as Ritual);
      materialRepository.create.mockReturnValue(
        newMaterialDto as RitualMaterial,
      );
      materialRepository.save.mockResolvedValue(
        newMaterialDto as RitualMaterial,
      );

      const result = await service.addMaterial(1, newMaterialDto);

      expect(materialRepository.create).toHaveBeenCalledWith({
        ...newMaterialDto,
        ritualId: 1,
      });
      expect(materialRepository.save).toHaveBeenCalled();
      expect(result).toEqual(newMaterialDto);
    });
  });

  describe('updateMaterial', () => {
    const updateMaterialDto = {
      name: 'Incienso Actualizado',
    };

    it('should update a material', async () => {
      const existingMaterial = {
        id: 1,
        ritualId: 1,
        name: 'Incienso Original',
        type: MaterialType.OPTIONAL,
      } as RitualMaterial;

      materialRepository.findOne.mockResolvedValue(existingMaterial);
      materialRepository.save.mockResolvedValue({
        ...existingMaterial,
        ...updateMaterialDto,
      });

      const result = await service.updateMaterial(1, 1, updateMaterialDto);

      expect(materialRepository.save).toHaveBeenCalled();
      expect(result.name).toBe(updateMaterialDto.name);
    });

    it('should throw NotFoundException if material not found', async () => {
      materialRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateMaterial(1, 999, updateMaterialDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteMaterial', () => {
    it('should delete a material', async () => {
      materialRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.deleteMaterial(1, 1);

      expect(materialRepository.delete).toHaveBeenCalledWith({
        id: 1,
        ritualId: 1,
      });
    });

    it('should throw NotFoundException if material not found', async () => {
      materialRepository.delete.mockResolvedValue({ affected: 0 } as any);

      await expect(service.deleteMaterial(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
