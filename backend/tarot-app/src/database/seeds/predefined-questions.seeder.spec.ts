import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PredefinedQuestion } from '../../modules/predefined-questions/entities/predefined-question.entity';
import { ReadingCategory } from '../../modules/categories/entities/reading-category.entity';
import { seedPredefinedQuestions } from './predefined-questions.seeder';

describe('PredefinedQuestions Seeder', () => {
  let questionRepository: Repository<PredefinedQuestion>;
  let categoryRepository: Repository<ReadingCategory>;
  let mockCategories: ReadingCategory[];

  beforeEach(async () => {
    // Create mock categories matching the actual ones
    mockCategories = [
      {
        id: 1,
        name: 'Amor y Relaciones',
        slug: 'amor-relaciones',
        description: 'Consultas sobre amor y relaciones',
        icon: '❤️',
        color: '#FF6B9D',
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Trabajo y Carrera',
        slug: 'carrera-trabajo',
        description: 'Orientación profesional',
        icon: '💼',
        color: '#4A90E2',
        order: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: 'Dinero y Finanzas',
        slug: 'dinero-finanzas',
        description: 'Situación financiera',
        icon: '💰',
        color: '#F5A623',
        order: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: 'Salud y Bienestar',
        slug: 'salud-bienestar',
        description: 'Bienestar físico y emocional',
        icon: '🌿',
        color: '#7ED321',
        order: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        name: 'Espiritual y Crecimiento',
        slug: 'crecimiento-espiritual',
        description: 'Desarrollo espiritual',
        icon: '✨',
        color: '#9013FE',
        order: 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        name: 'General',
        slug: 'consulta-general',
        description: 'Consultas generales',
        icon: '🔮',
        color: '#50E3C2',
        order: 6,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(PredefinedQuestion),
          useValue: {
            count: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ReadingCategory),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    questionRepository = module.get<Repository<PredefinedQuestion>>(
      getRepositoryToken(PredefinedQuestion),
    );
    categoryRepository = module.get<Repository<ReadingCategory>>(
      getRepositoryToken(ReadingCategory),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('seedPredefinedQuestions', () => {
    it('should throw error if no categories exist', async () => {
      jest.spyOn(categoryRepository, 'count').mockResolvedValue(0);

      await expect(
        seedPredefinedQuestions(questionRepository, categoryRepository),
      ).rejects.toThrow(
        'Cannot seed predefined questions: no categories exist',
      );
    });

    it('should skip seeding if questions already exist', async () => {
      jest.spyOn(categoryRepository, 'count').mockResolvedValue(6);
      jest.spyOn(questionRepository, 'count').mockResolvedValue(30);
      const saveSpy = jest.spyOn(questionRepository, 'save');

      await seedPredefinedQuestions(questionRepository, categoryRepository);

      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should seed minimum 30 questions (5 per category)', async () => {
      jest.spyOn(categoryRepository, 'count').mockResolvedValue(6);
      jest.spyOn(categoryRepository, 'find').mockResolvedValue(mockCategories);
      jest.spyOn(questionRepository, 'count').mockResolvedValue(0);

      const saveSpy = jest
        .spyOn(questionRepository, 'save')
        .mockResolvedValue([] as never);

      await seedPredefinedQuestions(questionRepository, categoryRepository);

      expect(saveSpy).toHaveBeenCalledTimes(1);
      const savedQuestions = saveSpy.mock.calls[0][0] as PredefinedQuestion[];
      expect(Array.isArray(savedQuestions)).toBe(true);
      expect(savedQuestions.length).toBeGreaterThanOrEqual(30);
    });

    it('should associate questions with correct categories', async () => {
      jest.spyOn(categoryRepository, 'count').mockResolvedValue(6);
      jest.spyOn(categoryRepository, 'find').mockResolvedValue(mockCategories);
      jest.spyOn(questionRepository, 'count').mockResolvedValue(0);

      const saveSpy = jest
        .spyOn(questionRepository, 'save')
        .mockResolvedValue([] as never);

      await seedPredefinedQuestions(questionRepository, categoryRepository);

      expect(saveSpy).toHaveBeenCalled();
      const savedQuestions = saveSpy.mock.calls[0][0] as PredefinedQuestion[];

      savedQuestions.forEach((q) => {
        expect(q.categoryId).toBeGreaterThan(0);
        expect(q.categoryId).toBeLessThanOrEqual(6);
      });
    });

    it('should create all questions with isActive: true', async () => {
      jest.spyOn(categoryRepository, 'count').mockResolvedValue(6);
      jest.spyOn(categoryRepository, 'find').mockResolvedValue(mockCategories);
      jest.spyOn(questionRepository, 'count').mockResolvedValue(0);

      const saveSpy = jest
        .spyOn(questionRepository, 'save')
        .mockResolvedValue([] as never);

      await seedPredefinedQuestions(questionRepository, categoryRepository);

      expect(saveSpy).toHaveBeenCalled();
      const savedQuestions = saveSpy.mock.calls[0][0] as PredefinedQuestion[];

      savedQuestions.forEach((q) => {
        expect(q.isActive).toBe(true);
      });
    });

    it('should have at least 5 questions per category', async () => {
      jest.spyOn(categoryRepository, 'count').mockResolvedValue(6);
      jest.spyOn(categoryRepository, 'find').mockResolvedValue(mockCategories);
      jest.spyOn(questionRepository, 'count').mockResolvedValue(0);

      const saveSpy = jest
        .spyOn(questionRepository, 'save')
        .mockResolvedValue([] as never);

      await seedPredefinedQuestions(questionRepository, categoryRepository);

      expect(saveSpy).toHaveBeenCalled();
      const savedQuestions = saveSpy.mock.calls[0][0] as PredefinedQuestion[];

      // Count questions per category
      const questionsPerCategory: { [key: number]: number } = {};
      savedQuestions.forEach((q) => {
        questionsPerCategory[q.categoryId] =
          (questionsPerCategory[q.categoryId] || 0) + 1;
      });

      // Each category should have at least 5 questions
      Object.values(questionsPerCategory).forEach((count) => {
        expect(count).toBeGreaterThanOrEqual(5);
      });
    });

    it('should have questions with proper text length (max 200 chars)', async () => {
      jest.spyOn(categoryRepository, 'count').mockResolvedValue(6);
      jest.spyOn(categoryRepository, 'find').mockResolvedValue(mockCategories);
      jest.spyOn(questionRepository, 'count').mockResolvedValue(0);

      const saveSpy = jest
        .spyOn(questionRepository, 'save')
        .mockResolvedValue([] as never);

      await seedPredefinedQuestions(questionRepository, categoryRepository);

      expect(saveSpy).toHaveBeenCalled();
      const savedQuestions = saveSpy.mock.calls[0][0] as PredefinedQuestion[];

      savedQuestions.forEach((q) => {
        expect(q.questionText.length).toBeGreaterThan(0);
        expect(q.questionText.length).toBeLessThanOrEqual(200);
      });
    });

    it('should set proper order for questions', async () => {
      jest.spyOn(categoryRepository, 'count').mockResolvedValue(6);
      jest.spyOn(categoryRepository, 'find').mockResolvedValue(mockCategories);
      jest.spyOn(questionRepository, 'count').mockResolvedValue(0);

      const saveSpy = jest
        .spyOn(questionRepository, 'save')
        .mockResolvedValue([] as never);

      await seedPredefinedQuestions(questionRepository, categoryRepository);

      expect(saveSpy).toHaveBeenCalled();
      const savedQuestions = saveSpy.mock.calls[0][0] as PredefinedQuestion[];

      savedQuestions.forEach((q) => {
        expect(q.order).toBeGreaterThanOrEqual(0);
      });
    });

    it('should initialize usageCount to 0', async () => {
      jest.spyOn(categoryRepository, 'count').mockResolvedValue(6);
      jest.spyOn(categoryRepository, 'find').mockResolvedValue(mockCategories);
      jest.spyOn(questionRepository, 'count').mockResolvedValue(0);

      const saveSpy = jest
        .spyOn(questionRepository, 'save')
        .mockResolvedValue([] as never);

      await seedPredefinedQuestions(questionRepository, categoryRepository);

      expect(saveSpy).toHaveBeenCalled();
      const savedQuestions = saveSpy.mock.calls[0][0] as PredefinedQuestion[];

      savedQuestions.forEach((q) => {
        expect(q.usageCount).toBe(0);
      });
    });
  });
});
