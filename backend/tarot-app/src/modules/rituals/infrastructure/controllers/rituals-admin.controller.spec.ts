import { Test, TestingModule } from '@nestjs/testing';
import { RitualsAdminController } from './rituals-admin.controller';
import { RitualsAdminService } from '../../application/services/rituals-admin.service';
import {
  CreateRitualDto,
  UpdateRitualDto,
  CreateRitualStepDto,
  UpdateRitualStepDto,
  CreateRitualMaterialDto,
  UpdateRitualMaterialDto,
  DuplicateRitualDto,
} from '../../application/dto';
import { Ritual } from '../../entities/ritual.entity';
import { RitualStep } from '../../entities/ritual-step.entity';
import { RitualMaterial } from '../../entities/ritual-material.entity';
import {
  RitualCategory,
  RitualDifficulty,
  MaterialType,
} from '../../domain/enums';

describe('RitualsAdminController', () => {
  let controller: RitualsAdminController;
  let service: RitualsAdminService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    toggleActive: jest.fn(),
    duplicate: jest.fn(),
    addStep: jest.fn(),
    updateStep: jest.fn(),
    deleteStep: jest.fn(),
    addMaterial: jest.fn(),
    updateMaterial: jest.fn(),
    deleteMaterial: jest.fn(),
  };

  const mockRitual: Partial<Ritual> = {
    id: 1,
    slug: 'ritual-test',
    title: 'Ritual de Test',
    description: 'Descripción de test',
    category: RitualCategory.LUNAR,
    difficulty: RitualDifficulty.BEGINNER,
    durationMinutes: 30,
    imageUrl: '/images/test.jpg',
    isActive: true,
    isFeatured: false,
    materials: [],
    steps: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RitualsAdminController],
      providers: [
        {
          provide: RitualsAdminService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RitualsAdminController>(RitualsAdminController);
    service = module.get<RitualsAdminService>(RitualsAdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a ritual', async () => {
      const createDto: CreateRitualDto = {
        slug: 'ritual-test',
        title: 'Ritual de Test',
        description: 'Descripción',
        category: RitualCategory.LUNAR,
        difficulty: RitualDifficulty.BEGINNER,
        durationMinutes: 30,
        imageUrl: '/images/test.jpg',
        materials: [],
        steps: [],
      };

      mockService.create.mockResolvedValue(mockRitual);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockRitual);
    });
  });

  describe('findAll', () => {
    it('should return all rituals including inactive', async () => {
      const rituals = [mockRitual, { ...mockRitual, id: 2, isActive: false }];
      mockService.findAll.mockResolvedValue(rituals);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(rituals);
    });
  });

  describe('findById', () => {
    it('should return a ritual by id', async () => {
      mockService.findById.mockResolvedValue(mockRitual);

      const result = await controller.findById(1);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockRitual);
    });
  });

  describe('update', () => {
    it('should update a ritual', async () => {
      const updateDto: UpdateRitualDto = {
        title: 'Ritual Actualizado',
      };

      const updatedRitual = { ...mockRitual, ...updateDto };
      mockService.update.mockResolvedValue(updatedRitual);

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedRitual);
    });
  });

  describe('delete', () => {
    it('should soft delete a ritual', async () => {
      mockService.softDelete.mockResolvedValue(undefined);

      await controller.delete(1);

      expect(service.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('toggleActive', () => {
    it('should toggle ritual active status', async () => {
      const toggledRitual = { ...mockRitual, isActive: false };
      mockService.toggleActive.mockResolvedValue(toggledRitual);

      const result = await controller.toggleActive(1);

      expect(service.toggleActive).toHaveBeenCalledWith(1);
      expect(result).toEqual(toggledRitual);
    });
  });

  describe('duplicate', () => {
    it('should duplicate a ritual with new slug', async () => {
      const duplicateDto: DuplicateRitualDto = {
        newSlug: 'ritual-test-copia',
      };

      const duplicatedRitual = {
        ...mockRitual,
        id: 2,
        slug: 'ritual-test-copia',
        isActive: false,
      };

      mockService.duplicate.mockResolvedValue(duplicatedRitual);

      const result = await controller.duplicate(1, duplicateDto);

      expect(service.duplicate).toHaveBeenCalledWith(1, duplicateDto.newSlug);
      expect(result).toEqual(duplicatedRitual);
    });
  });

  describe('addStep', () => {
    it('should add a step to a ritual', async () => {
      const stepDto: CreateRitualStepDto = {
        stepNumber: 1,
        title: 'Paso 1',
        description: 'Descripción del paso',
      };

      const mockStep: Partial<RitualStep> = {
        id: 1,
        ritualId: 1,
        ...stepDto,
      };

      mockService.addStep.mockResolvedValue(mockStep);

      const result = await controller.addStep(1, stepDto);

      expect(service.addStep).toHaveBeenCalledWith(1, stepDto);
      expect(result).toEqual(mockStep);
    });
  });

  describe('updateStep', () => {
    it('should update a step', async () => {
      const updateStepDto: UpdateRitualStepDto = {
        title: 'Paso Actualizado',
      };

      const mockStep: Partial<RitualStep> = {
        id: 1,
        ritualId: 1,
        stepNumber: 1,
        title: 'Paso Actualizado',
        description: 'Descripción',
      };

      mockService.updateStep.mockResolvedValue(mockStep);

      const result = await controller.updateStep(1, 1, updateStepDto);

      expect(service.updateStep).toHaveBeenCalledWith(1, 1, updateStepDto);
      expect(result).toEqual(mockStep);
    });
  });

  describe('deleteStep', () => {
    it('should delete a step', async () => {
      mockService.deleteStep.mockResolvedValue(undefined);

      await controller.deleteStep(1, 1);

      expect(service.deleteStep).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('addMaterial', () => {
    it('should add a material to a ritual', async () => {
      const materialDto: CreateRitualMaterialDto = {
        name: 'Vela blanca',
        type: MaterialType.REQUIRED,
      };

      const mockMaterial: Partial<RitualMaterial> = {
        id: 1,
        ritualId: 1,
        ...materialDto,
      };

      mockService.addMaterial.mockResolvedValue(mockMaterial);

      const result = await controller.addMaterial(1, materialDto);

      expect(service.addMaterial).toHaveBeenCalledWith(1, materialDto);
      expect(result).toEqual(mockMaterial);
    });
  });

  describe('updateMaterial', () => {
    it('should update a material', async () => {
      const updateMaterialDto: UpdateRitualMaterialDto = {
        name: 'Vela plateada',
      };

      const mockMaterial: Partial<RitualMaterial> = {
        id: 1,
        ritualId: 1,
        name: 'Vela plateada',
        type: MaterialType.REQUIRED,
      };

      mockService.updateMaterial.mockResolvedValue(mockMaterial);

      const result = await controller.updateMaterial(1, 1, updateMaterialDto);

      expect(service.updateMaterial).toHaveBeenCalledWith(
        1,
        1,
        updateMaterialDto,
      );
      expect(result).toEqual(mockMaterial);
    });
  });

  describe('deleteMaterial', () => {
    it('should delete a material', async () => {
      mockService.deleteMaterial.mockResolvedValue(undefined);

      await controller.deleteMaterial(1, 1);

      expect(service.deleteMaterial).toHaveBeenCalledWith(1, 1);
    });
  });
});
