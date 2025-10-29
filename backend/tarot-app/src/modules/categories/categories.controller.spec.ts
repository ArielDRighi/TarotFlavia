import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReadingCategory } from './entities/reading-category.entity';

describe('CategoriesController', () => {
  let controller: CategoriesController;

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

  const mockCategoriesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    toggleActive: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const categories = [mockCategory];
      mockCategoriesService.findAll.mockResolvedValue(categories);

      const result = await controller.findAll();

      expect(result).toEqual(categories);
      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(false);
    });

    it('should return only active categories when query param is true', async () => {
      const categories = [mockCategory];
      mockCategoriesService.findAll.mockResolvedValue(categories);

      const result = await controller.findAll('true');

      expect(result).toEqual(categories);
      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(true);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockCategory);
      expect(mockCategoriesService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findBySlug', () => {
    it('should return a category by slug', async () => {
      mockCategoriesService.findBySlug.mockResolvedValue(mockCategory);

      const result = await controller.findBySlug('amor-relaciones');

      expect(result).toEqual(mockCategory);
      expect(mockCategoriesService.findBySlug).toHaveBeenCalledWith(
        'amor-relaciones',
      );
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Amor y Relaciones',
        slug: 'amor-relaciones',
        description: 'Consultas sobre amor',
        icon: '❤️',
        color: '#FF6B9D',
        order: 1,
      };

      mockCategoriesService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockCategory);
      expect(mockCategoriesService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto: UpdateCategoryDto = {
        name: 'Amor y Relaciones Actualizadas',
      };

      const updatedCategory = { ...mockCategory, ...updateDto };
      mockCategoriesService.update.mockResolvedValue(updatedCategory);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(updatedCategory);
      expect(mockCategoriesService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      mockCategoriesService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockCategoriesService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('toggleActive', () => {
    it('should toggle category active status', async () => {
      const inactiveCategory = { ...mockCategory, isActive: false };
      mockCategoriesService.toggleActive.mockResolvedValue(inactiveCategory);

      const result = await controller.toggleActive('1');

      expect(result).toEqual(inactiveCategory);
      expect(mockCategoriesService.toggleActive).toHaveBeenCalledWith(1);
    });
  });
});
