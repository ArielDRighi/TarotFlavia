import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReadingPatternAnalyzerService } from './reading-pattern-analyzer.service';
import { TarotReading } from '../../../tarot/readings/entities/tarot-reading.entity';
import { ReadingCategory } from '../../../categories/entities/reading-category.entity';
import { EmotionalPattern } from '../../enums/reading-patterns.enums';

describe('ReadingPatternAnalyzerService', () => {
  let service: ReadingPatternAnalyzerService;
  let readingRepo: jest.Mocked<Repository<TarotReading>>;
  let _categoryRepo: jest.Mocked<Repository<ReadingCategory>>;

  beforeEach(async () => {
    const mockReadingRepo = {
      find: jest.fn(),
    };

    const mockCategoryRepo = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingPatternAnalyzerService,
        {
          provide: getRepositoryToken(TarotReading),
          useValue: mockReadingRepo,
        },
        {
          provide: getRepositoryToken(ReadingCategory),
          useValue: mockCategoryRepo,
        },
      ],
    }).compile();

    service = module.get<ReadingPatternAnalyzerService>(
      ReadingPatternAnalyzerService,
    );
    readingRepo = module.get(getRepositoryToken(TarotReading));
    _categoryRepo = module.get(getRepositoryToken(ReadingCategory));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeUserPatterns', () => {
    it('should return hasEnoughData: false when user has less than 2 readings', async () => {
      // Arrange
      readingRepo.find.mockResolvedValue([
        {
          id: 1,
          cards: [{ id: 16, name: 'La Torre', imageUrl: '' }],
          category: { id: 1, slug: 'amor', name: 'Amor' },
          createdAt: new Date(),
        } as unknown as TarotReading,
      ]);

      // Act
      const result = await service.analyzeUserPatterns(1, 5);

      // Assert
      expect(result.hasEnoughData).toBe(false);
      expect(result.patterns).toEqual([]);
      expect(result.recommendations).toEqual([]);
    });

    it('should detect HEARTBREAK pattern when cards La Torre and La Luna appear', async () => {
      // Arrange
      readingRepo.find.mockResolvedValue([
        {
          id: 1,
          cards: [
            { id: 16, name: 'La Torre', imageUrl: '' },
            { id: 18, name: 'La Luna', imageUrl: '' },
          ],
          category: { id: 1, slug: 'amor', name: 'Amor' },
          createdAt: new Date(),
        } as unknown as TarotReading,
        {
          id: 2,
          cards: [
            { id: 5, name: 'El Hierofante', imageUrl: '' },
            { id: 16, name: 'La Torre', imageUrl: '' },
          ],
          category: { id: 1, slug: 'amor', name: 'Amor' },
          createdAt: new Date(),
        } as unknown as TarotReading,
      ]);

      // Act
      const result = await service.analyzeUserPatterns(1, 5);

      // Assert
      expect(result.hasEnoughData).toBe(true);
      expect(result.patterns).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: EmotionalPattern.HEARTBREAK,
            confidence: expect.any(Number),
          }),
        ]),
      );
    });

    it('should detect MATERIAL_BLOCK pattern when card El Colgado appears multiple times', async () => {
      // Arrange
      readingRepo.find.mockResolvedValue([
        {
          id: 1,
          cards: [{ id: 12, name: 'El Colgado', imageUrl: '' }],
          category: { id: 2, slug: 'trabajo', name: 'Trabajo' },
          createdAt: new Date(),
        } as unknown as TarotReading,
        {
          id: 2,
          cards: [{ id: 12, name: 'El Colgado', imageUrl: '' }],
          category: { id: 2, slug: 'trabajo', name: 'Trabajo' },
          createdAt: new Date(),
        } as unknown as TarotReading,
      ]);

      // Act
      const result = await service.analyzeUserPatterns(1, 5);

      // Assert
      expect(result.hasEnoughData).toBe(true);
      expect(result.patterns).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: EmotionalPattern.MATERIAL_BLOCK,
          }),
        ]),
      );
    });

    it('should detect SUCCESS_EXPANSION pattern with El Sol, El Mundo, Rueda', async () => {
      // Arrange
      readingRepo.find.mockResolvedValue([
        {
          id: 1,
          cards: [
            { id: 19, name: 'El Sol', imageUrl: '' },
            { id: 21, name: 'El Mundo', imageUrl: '' },
          ],
          category: { id: 2, slug: 'trabajo', name: 'Trabajo' },
          createdAt: new Date(),
        } as unknown as TarotReading,
        {
          id: 2,
          cards: [{ id: 10, name: 'La Rueda de la Fortuna', imageUrl: '' }],
          category: { id: 3, slug: 'dinero', name: 'Dinero' },
          createdAt: new Date(),
        } as unknown as TarotReading,
      ]);

      // Act
      const result = await service.analyzeUserPatterns(1, 5);

      // Assert
      expect(result.hasEnoughData).toBe(true);
      expect(result.patterns).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: EmotionalPattern.SUCCESS_EXPANSION,
          }),
        ]),
      );
    });

    it('should detect OBSESSION when same category appears in last 3 readings', async () => {
      // Arrange
      const category = {
        id: 1,
        slug: 'amor',
        name: 'Amor',
      } as ReadingCategory;

      readingRepo.find.mockResolvedValue([
        {
          id: 1,
          cards: [{ id: 1, name: 'El Mago', imageUrl: '' }],
          category,
          createdAt: new Date('2026-02-01T10:00:00Z'),
        } as unknown as TarotReading,
        {
          id: 2,
          cards: [{ id: 2, name: 'La Sacerdotisa', imageUrl: '' }],
          category,
          createdAt: new Date('2026-02-01T09:00:00Z'),
        } as unknown as TarotReading,
        {
          id: 3,
          cards: [{ id: 3, name: 'La Emperatriz', imageUrl: '' }],
          category,
          createdAt: new Date('2026-02-01T08:00:00Z'),
        } as unknown as TarotReading,
      ]);

      // Act
      const result = await service.analyzeUserPatterns(1, 5);

      // Assert
      expect(result.hasEnoughData).toBe(true);
      expect(result.patterns).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: EmotionalPattern.OBSESSION,
          }),
        ]),
      );
    });

    it('should generate recommendations based on detected patterns', async () => {
      // Arrange
      readingRepo.find.mockResolvedValue([
        {
          id: 1,
          cards: [
            { id: 16, name: 'La Torre', imageUrl: '' },
            { id: 18, name: 'La Luna', imageUrl: '' },
          ],
          category: { id: 1, slug: 'amor', name: 'Amor' },
          createdAt: new Date(),
        } as unknown as TarotReading,
        {
          id: 2,
          cards: [{ id: 16, name: 'La Torre', imageUrl: '' }],
          category: { id: 1, slug: 'amor', name: 'Amor' },
          createdAt: new Date(),
        } as unknown as TarotReading,
      ]);

      // Act
      const result = await service.analyzeUserPatterns(1, 5);

      // Assert
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]).toMatchObject({
        pattern: expect.any(String),
        message: expect.any(String),
        suggestedCategories: expect.any(Array),
        priority: expect.stringMatching(/^(high|medium|low)$/),
      });
    });

    it('should include analysis metadata', async () => {
      // Arrange
      readingRepo.find.mockResolvedValue([
        {
          id: 1,
          cards: [{ id: 1, name: 'El Mago', imageUrl: '' }],
          category: { id: 1, slug: 'amor', name: 'Amor' },
          createdAt: new Date(),
        } as unknown as TarotReading,
        {
          id: 2,
          cards: [{ id: 2, name: 'La Sacerdotisa', imageUrl: '' }],
          category: { id: 1, slug: 'amor', name: 'Amor' },
          createdAt: new Date(),
        } as unknown as TarotReading,
      ]);

      // Act
      const result = await service.analyzeUserPatterns(1, 5);

      // Assert
      expect(result.analysisDate).toBeInstanceOf(Date);
      expect(result.readingsAnalyzed).toBe(2);
    });

    it('should limit analysis to specified number of readings', async () => {
      // Arrange
      const mockReadings = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        cards: [{ id: 1, name: 'El Mago', imageUrl: '' }],
        category: { id: 1, slug: 'amor', name: 'Amor' },
        createdAt: new Date(),
      })) as unknown as TarotReading[];

      readingRepo.find.mockResolvedValue(mockReadings);

      // Act
      await service.analyzeUserPatterns(1, 3);

      // Assert
      expect(readingRepo.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['cards', 'category'],
        order: { createdAt: 'DESC' },
        take: 3,
      });
    });

    it('should prioritize high confidence patterns', async () => {
      // Arrange - simulate strong HEARTBREAK pattern
      readingRepo.find.mockResolvedValue([
        {
          id: 1,
          cards: [
            { id: 16, name: 'La Torre', imageUrl: '' },
            { id: 18, name: 'La Luna', imageUrl: '' },
          ],
          category: { id: 1, slug: 'amor', name: 'Amor' },
          createdAt: new Date(),
        } as unknown as TarotReading,
        {
          id: 2,
          cards: [
            { id: 16, name: 'La Torre', imageUrl: '' },
            { id: 18, name: 'La Luna', imageUrl: '' },
          ],
          category: { id: 1, slug: 'amor', name: 'Amor' },
          createdAt: new Date(),
        } as unknown as TarotReading,
        {
          id: 3,
          cards: [
            { id: 16, name: 'La Torre', imageUrl: '' },
            { id: 18, name: 'La Luna', imageUrl: '' },
          ],
          category: { id: 1, slug: 'amor', name: 'Amor' },
          createdAt: new Date(),
        } as unknown as TarotReading,
      ]);

      // Act
      const result = await service.analyzeUserPatterns(1, 5);

      // Assert
      const heartbreakPattern = result.patterns.find(
        (p) => p.type === EmotionalPattern.HEARTBREAK,
      );
      expect(heartbreakPattern).toBeDefined();
      expect(heartbreakPattern?.confidence).toBeGreaterThan(0.7);

      const heartbreakRec = result.recommendations.find(
        (r) => r.pattern === EmotionalPattern.HEARTBREAK,
      );
      expect(heartbreakRec?.priority).toBe('high');
    });
  });
});
