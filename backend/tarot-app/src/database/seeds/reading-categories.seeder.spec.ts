import { Repository } from 'typeorm';
import { ReadingCategory } from '../../modules/categories/entities/reading-category.entity';
import { seedReadingCategories } from './reading-categories.seeder';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

describe('ReadingCategoriesSeeder', () => {
  let mockCategoryRepository: jest.Mocked<Repository<ReadingCategory>>;

  beforeEach(() => {
    mockCategoryRepository = {
      count: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<ReadingCategory>>;
  });

  describe('seedReadingCategories', () => {
    it('should seed exactly 6 categories when database is empty', async () => {
      // Arrange
      mockCategoryRepository.count.mockResolvedValue(0);
      const savedCategories = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        name: `Category ${i + 1}`,
        slug: `category-${i + 1}`,
        description: `Description ${i + 1}`,
        icon: '❤️',
        color: '#FF6B9D',
        order: i + 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as ReadingCategory[];
      mockCategoryRepository.save.mockResolvedValue(
        savedCategories as ReadingCategory & ReadingCategory[],
      );

      // Act
      await seedReadingCategories(mockCategoryRepository);

      // Assert
      expect(mockCategoryRepository.count).toHaveBeenCalledTimes(1);
      expect(mockCategoryRepository.save).toHaveBeenCalledTimes(1);
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: expect.any(String) }),
        ]),
      );
      const savedData = mockCategoryRepository.save.mock
        .calls[0][0] as ReadingCategory[];
      expect(savedData).toHaveLength(6);
    });

    it('should skip seeding if categories already exist (idempotency)', async () => {
      // Arrange
      mockCategoryRepository.count.mockResolvedValue(6);

      // Act
      await seedReadingCategories(mockCategoryRepository);

      // Assert
      expect(mockCategoryRepository.count).toHaveBeenCalledTimes(1);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it('should seed all categories with required icon, color, description, and order', async () => {
      // Arrange
      mockCategoryRepository.count.mockResolvedValue(0);
      mockCategoryRepository.save.mockResolvedValue([] as any);

      // Act
      await seedReadingCategories(mockCategoryRepository);

      // Assert
      const savedData = mockCategoryRepository.save.mock
        .calls[0][0] as ReadingCategory[];
      savedData.forEach((category) => {
        expect(category.icon).toBeDefined();
        expect(category.icon).not.toBe('');
        expect(category.color).toBeDefined();
        expect(category.color).toMatch(/^#[0-9A-F]{6}$/i);
        expect(category.description).toBeDefined();
        expect(category.description.length).toBeGreaterThan(10);
        expect(category.order).toBeDefined();
        expect(category.order).toBeGreaterThanOrEqual(1);
        expect(category.order).toBeLessThanOrEqual(6);
      });
    });

    it('should seed all categories with isActive set to true', async () => {
      // Arrange
      mockCategoryRepository.count.mockResolvedValue(0);
      mockCategoryRepository.save.mockResolvedValue([] as any);

      // Act
      await seedReadingCategories(mockCategoryRepository);

      // Assert
      const savedData = mockCategoryRepository.save.mock
        .calls[0][0] as ReadingCategory[];
      savedData.forEach((category) => {
        expect(category.isActive).toBe(true);
      });
    });

    it('should seed Amor y Relaciones category with correct data', async () => {
      // Arrange
      mockCategoryRepository.count.mockResolvedValue(0);
      mockCategoryRepository.save.mockResolvedValue([] as any);

      // Act
      await seedReadingCategories(mockCategoryRepository);

      // Assert
      const savedData = mockCategoryRepository.save.mock
        .calls[0][0] as ReadingCategory[];
      const amorCategory = savedData.find((c) => c.slug === 'amor-relaciones');
      expect(amorCategory).toBeDefined();
      expect(amorCategory?.name).toBe('Amor y Relaciones');
      expect(amorCategory?.icon).toBe('❤️');
      expect(amorCategory?.color).toBe('#FF6B9D');
      expect(amorCategory?.order).toBe(1);
      expect(amorCategory?.description).toContain('amor');
    });

    it('should seed Carrera y Trabajo category with correct data', async () => {
      // Arrange
      mockCategoryRepository.count.mockResolvedValue(0);
      mockCategoryRepository.save.mockResolvedValue([] as any);

      // Act
      await seedReadingCategories(mockCategoryRepository);

      // Assert
      const savedData = mockCategoryRepository.save.mock
        .calls[0][0] as ReadingCategory[];
      const carreraCategory = savedData.find(
        (c) => c.slug === 'carrera-trabajo',
      );
      expect(carreraCategory).toBeDefined();
      expect(carreraCategory?.name).toBe('Carrera y Trabajo');
      expect(carreraCategory?.icon).toBe('💼');
      expect(carreraCategory?.color).toBe('#4A90E2');
      expect(carreraCategory?.order).toBe(2);
      expect(carreraCategory?.description).toContain('carrera');
    });

    it('should seed Dinero y Finanzas category with correct data', async () => {
      // Arrange
      mockCategoryRepository.count.mockResolvedValue(0);
      mockCategoryRepository.save.mockResolvedValue([] as any);

      // Act
      await seedReadingCategories(mockCategoryRepository);

      // Assert
      const savedData = mockCategoryRepository.save.mock
        .calls[0][0] as ReadingCategory[];
      const dineroCategory = savedData.find(
        (c) => c.slug === 'dinero-finanzas',
      );
      expect(dineroCategory).toBeDefined();
      expect(dineroCategory?.name).toBe('Dinero y Finanzas');
      expect(dineroCategory?.icon).toBe('💰');
      expect(dineroCategory?.color).toBe('#F5A623');
      expect(dineroCategory?.order).toBe(3);
      expect(dineroCategory?.description).toContain('dinero');
    });

    it('should seed Salud y Bienestar category with correct data', async () => {
      // Arrange
      mockCategoryRepository.count.mockResolvedValue(0);
      mockCategoryRepository.save.mockResolvedValue([] as any);

      // Act
      await seedReadingCategories(mockCategoryRepository);

      // Assert
      const savedData = mockCategoryRepository.save.mock
        .calls[0][0] as ReadingCategory[];
      const saludCategory = savedData.find((c) => c.slug === 'salud-bienestar');
      expect(saludCategory).toBeDefined();
      expect(saludCategory?.name).toBe('Salud y Bienestar');
      expect(saludCategory?.icon).toBe('🏥');
      expect(saludCategory?.color).toBe('#7ED321');
      expect(saludCategory?.order).toBe(4);
      expect(saludCategory?.description).toContain('salud');
    });

    it('should seed Crecimiento Espiritual category with correct data', async () => {
      // Arrange
      mockCategoryRepository.count.mockResolvedValue(0);
      mockCategoryRepository.save.mockResolvedValue([] as any);

      // Act
      await seedReadingCategories(mockCategoryRepository);

      // Assert
      const savedData = mockCategoryRepository.save.mock
        .calls[0][0] as ReadingCategory[];
      const espiritualCategory = savedData.find(
        (c) => c.slug === 'crecimiento-espiritual',
      );
      expect(espiritualCategory).toBeDefined();
      expect(espiritualCategory?.name).toBe('Crecimiento Espiritual');
      expect(espiritualCategory?.icon).toBe('✨');
      expect(espiritualCategory?.color).toBe('#9013FE');
      expect(espiritualCategory?.order).toBe(5);
      expect(espiritualCategory?.description).toContain('espiritual');
    });

    it('should seed Consulta General category with correct data', async () => {
      // Arrange
      mockCategoryRepository.count.mockResolvedValue(0);
      mockCategoryRepository.save.mockResolvedValue([] as any);

      // Act
      await seedReadingCategories(mockCategoryRepository);

      // Assert
      const savedData = mockCategoryRepository.save.mock
        .calls[0][0] as ReadingCategory[];
      const generalCategory = savedData.find(
        (c) => c.slug === 'consulta-general',
      );
      expect(generalCategory).toBeDefined();
      expect(generalCategory?.name).toBe('Consulta General');
      expect(generalCategory?.icon).toBe('🌟');
      expect(generalCategory?.color).toBe('#50E3C2');
      expect(generalCategory?.order).toBe(6);
      expect(generalCategory?.description).toContain('general');
    });

    it('should have unique order values for each category', async () => {
      // Arrange
      mockCategoryRepository.count.mockResolvedValue(0);
      mockCategoryRepository.save.mockResolvedValue([] as any);

      // Act
      await seedReadingCategories(mockCategoryRepository);

      // Assert
      const savedData = mockCategoryRepository.save.mock
        .calls[0][0] as ReadingCategory[];
      const orders = savedData.map((c) => c.order);
      const uniqueOrders = new Set(orders);
      expect(uniqueOrders.size).toBe(6);
    });

    it('should have unique slug values for each category', async () => {
      // Arrange
      mockCategoryRepository.count.mockResolvedValue(0);
      mockCategoryRepository.save.mockResolvedValue([] as any);

      // Act
      await seedReadingCategories(mockCategoryRepository);

      // Assert
      const savedData = mockCategoryRepository.save.mock
        .calls[0][0] as ReadingCategory[];
      const slugs = savedData.map((c) => c.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(6);
    });

    it('should log the seeding process', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockCategoryRepository.count.mockResolvedValue(0);
      mockCategoryRepository.save.mockResolvedValue([] as any);

      // Act
      await seedReadingCategories(mockCategoryRepository);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Starting Reading Categories seeding'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Successfully seeded 6 categories'),
      );

      consoleSpy.mockRestore();
    });
  });
});
