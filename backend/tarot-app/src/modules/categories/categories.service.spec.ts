import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ReadingCategory } from './entities/reading-category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategory: ReadingCategory = {
    id: 1,
    name: 'Amor y Relaciones',
    slug: 'amor-relaciones',
    description:
      'Consultas sobre amor, relaciones de pareja y vínculos afectivos',
    icon: '❤️',
    color: '#FF6B9D',
    order: 1,
    isActive: true,
    readings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(ReadingCategory),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of categories ordered by order field', async () => {
      const categories = [mockCategory];
      mockRepository.find.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(result).toEqual(categories);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { order: 'ASC' },
      });
    });

    it('should return only active categories when activeOnly is true', async () => {
      const categories = [mockCategory];
      mockRepository.find.mockResolvedValue(categories);

      const result = await service.findAll(true);

      expect(result).toEqual(categories);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { order: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockCategory);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCategory);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return a category by slug', async () => {
      mockRepository.findOne.mockResolvedValue(mockCategory);

      const result = await service.findBySlug('amor-relaciones');

      expect(result).toEqual(mockCategory);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'amor-relaciones' },
      });
    });

    it('should throw NotFoundException when category with slug does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto: CreateCategoryDto = {
      name: 'Amor y Relaciones',
      slug: 'amor-relaciones',
      description: 'Consultas sobre amor',
      icon: '❤️',
      color: '#FF6B9D',
      order: 1,
    };

    it('should create a new category', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockCategory);
      mockRepository.save.mockResolvedValue(mockCategory);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCategory);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCategory);
    });

    it('should throw ConflictException when slug already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockCategory);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateCategoryDto = {
      name: 'Amor y Relaciones Actualizadas',
    };

    it('should update a category', async () => {
      const updatedCategory = { ...mockCategory, ...updateDto };
      mockRepository.findOne.mockResolvedValue(mockCategory);
      mockRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedCategory);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent category', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when updating to existing slug', async () => {
      const existingCategory = {
        ...mockCategory,
        id: 2,
        slug: 'trabajo',
      };
      mockRepository.findOne
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce(existingCategory);

      await expect(service.update(1, { slug: 'trabajo' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      mockRepository.findOne.mockResolvedValue(mockCategory);
      mockRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await service.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when removing non-existent category', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleActive', () => {
    it('should toggle category active status', async () => {
      const inactiveCategory = { ...mockCategory, isActive: false };
      mockRepository.findOne.mockResolvedValue(mockCategory);
      mockRepository.save.mockResolvedValue(inactiveCategory);

      const result = await service.toggleActive(1);

      expect(result.isActive).toBe(false);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when toggling non-existent category', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.toggleActive(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
