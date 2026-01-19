import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { ChineseHoroscopeService } from './chinese-horoscope.service';
import { ChineseHoroscope } from '../../entities/chinese-horoscope.entity';
import { AIProviderService } from '../../../ai/application/services/ai-provider.service';
import { AIProviderType } from '../../../ai/domain/interfaces/ai-provider.interface';
import {
  ChineseZodiacAnimal,
  ChineseElement,
} from '../../../../common/utils/chinese-zodiac.utils';

describe('ChineseHoroscopeService', () => {
  let service: ChineseHoroscopeService;
  let repository: jest.Mocked<Repository<ChineseHoroscope>>;
  let aiProviderService: jest.Mocked<AIProviderService>;

  // Mock response de IA válida
  const mockAIResponse = {
    content: JSON.stringify({
      generalOverview:
        'El año 2026 será un período de grandes oportunidades para el Dragón.',
      areas: {
        love: {
          content: 'Excelentes perspectivas en el amor.',
          rating: 8,
        },
        career: {
          content: 'Oportunidades laborales significativas.',
          rating: 9,
        },
        wellness: {
          content: 'Energía vital alta, buen momento para autocuidado.',
          rating: 7,
        },
        finance: {
          content: 'Estabilidad financiera con posibilidad de inversiones.',
          rating: 8,
        },
      },
      luckyElements: {
        numbers: [3, 7, 9],
        colors: ['Rojo', 'Dorado'],
        directions: ['Sur', 'Este'],
        months: [3, 6, 9],
      },
      monthlyHighlights: 'Marzo y junio serán meses especialmente favorables.',
    }),
    provider: AIProviderType.GROQ,
    model: 'llama-3.1-70b-versatile',
    tokensUsed: {
      prompt: 200,
      completion: 400,
      total: 600,
    },
    durationMs: 1500,
  };

  const mockHoroscope: Partial<ChineseHoroscope> = {
    id: 1,
    animal: ChineseZodiacAnimal.DRAGON,
    element: 'earth' as ChineseElement,
    year: 2026,
    generalOverview:
      'El año 2026 será un período de grandes oportunidades para el Dragón de Tierra.',
    areas: {
      love: {
        content: 'Excelentes perspectivas en el amor.',
        score: 8,
      },
      career: {
        content: 'Oportunidades laborales significativas.',
        score: 9,
      },
      wellness: {
        content: 'Energía vital alta, buen momento para autocuidado.',
        score: 7,
      },
      finance: {
        content: 'Estabilidad financiera con posibilidad de inversiones.',
        score: 8,
      },
    },
    luckyElements: {
      numbers: [3, 7, 9],
      colors: ['Rojo', 'Dorado'],
      directions: ['Sur', 'Este'],
      months: [3, 6, 9],
    },
    compatibility: {
      best: [ChineseZodiacAnimal.RAT, ChineseZodiacAnimal.MONKEY],
      good: [ChineseZodiacAnimal.ROOSTER],
      challenging: [ChineseZodiacAnimal.DOG, ChineseZodiacAnimal.RABBIT],
    },
    monthlyHighlights: 'Marzo y junio serán meses especialmente favorables.',
    aiProvider: 'groq',
    aiModel: 'llama-3.1-70b-versatile',
    tokensUsed: 600,
    generationTimeMs: 1500,
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Mock del Repository
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    // Mock del AIProviderService
    const mockAIService = {
      generateCompletion: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChineseHoroscopeService,
        {
          provide: getRepositoryToken(ChineseHoroscope),
          useValue: mockRepository,
        },
        {
          provide: AIProviderService,
          useValue: mockAIService,
        },
      ],
    }).compile();

    service = module.get<ChineseHoroscopeService>(ChineseHoroscopeService);
    repository = module.get(getRepositoryToken(ChineseHoroscope));
    aiProviderService = module.get(AIProviderService);

    // Reset mocks antes de cada test
    jest.clearAllMocks();
  });

  describe('generateForAnimal', () => {
    it('debe generar un nuevo horóscopo chino cuando no existe', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null); // No existe
      aiProviderService.generateCompletion.mockResolvedValue(mockAIResponse);
      repository.create.mockReturnValue(mockHoroscope as ChineseHoroscope);
      repository.save.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      // Act
      const result = await service.generateForAnimal(
        ChineseZodiacAnimal.DRAGON,
        2026,
      );

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          animal: ChineseZodiacAnimal.DRAGON,
          element: 'earth',
          year: 2026,
        },
      });
      expect(aiProviderService.generateCompletion).toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockHoroscope);
    });

    it('debe retornar horóscopo existente sin generar nuevo', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      // Act
      const result = await service.generateForAnimal(
        ChineseZodiacAnimal.DRAGON,
        2026,
      );

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          animal: ChineseZodiacAnimal.DRAGON,
          element: 'earth',
          year: 2026,
        },
      });
      expect(aiProviderService.generateCompletion).not.toHaveBeenCalled();
      expect(result).toEqual(mockHoroscope);
    });

    it('debe incluir compatibilidad desde información estática del animal', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockResolvedValue(mockAIResponse);
      repository.create.mockReturnValue(mockHoroscope as ChineseHoroscope);
      repository.save.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      // Act
      await service.generateForAnimal(ChineseZodiacAnimal.DRAGON, 2026);

      // Assert
      const createCall = repository.create.mock.calls[0][0];
      expect(createCall.compatibility).toBeDefined();
      expect(createCall.compatibility?.best).toHaveLength(2);
      expect(createCall.compatibility?.good).toBeDefined();
      expect(createCall.compatibility?.challenging).toBeDefined();
    });

    it('debe lanzar error si la IA retorna JSON inválido', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);
      const invalidAIResponse = {
        ...mockAIResponse,
        content: 'esto no es JSON válido',
      };
      aiProviderService.generateCompletion.mockResolvedValue(invalidAIResponse);

      // Act & Assert
      await expect(
        service.generateForAnimal(ChineseZodiacAnimal.DRAGON, 2026),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('debe limpiar markdown code blocks del JSON de IA', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);
      const responseWithMarkdown = {
        ...mockAIResponse,
        content: '```json\n' + mockAIResponse.content + '\n```',
      };
      aiProviderService.generateCompletion.mockResolvedValue(
        responseWithMarkdown,
      );
      repository.create.mockReturnValue(mockHoroscope as ChineseHoroscope);
      repository.save.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      // Act
      const result = await service.generateForAnimal(
        ChineseZodiacAnimal.DRAGON,
        2026,
      );

      // Assert
      expect(result).toEqual(mockHoroscope);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('generateAllForYear', () => {
    it('debe generar horóscopos para todos los 60 combinaciones (12 animales × 5 elementos)', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockResolvedValue(mockAIResponse);
      repository.create.mockReturnValue(mockHoroscope as ChineseHoroscope);
      repository.save.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      // Mock delay para evitar esperas reales en tests
      jest.spyOn(service as any, 'delay').mockResolvedValue(undefined);

      // Act
      const result = await service.generateAllForYear(2026);

      // Assert
      expect(result.successful).toBe(60); // 12 animales × 5 elementos
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(60);
      expect(aiProviderService.generateCompletion).toHaveBeenCalledTimes(60);
    });

    it('debe manejar fallos parciales durante generación masiva', async () => {
      // Arrange
      let callCount = 0;
      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockImplementation(() => {
        callCount++;
        if (callCount === 3) {
          // Falla la tercera combinación (Rata/Madera)
          return Promise.reject(new Error('Error de IA'));
        }
        return Promise.resolve(mockAIResponse);
      });
      repository.create.mockReturnValue(mockHoroscope as ChineseHoroscope);
      repository.save.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      // Mock delay
      jest.spyOn(service as any, 'delay').mockResolvedValue(undefined);

      // Act
      const result = await service.generateAllForYear(2026);

      // Assert
      expect(result.successful).toBe(59); // 59 exitosos, 1 fallido
      expect(result.failed).toBe(1);
      expect(result.results).toHaveLength(60); // Total de combinaciones

      const failedResult = result.results.find((r) => !r.success);
      expect(failedResult).toBeDefined();
      expect(failedResult?.error).toContain('Error de IA');
    });

    it('debe incluir delay de 5s entre cada generación', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockResolvedValue(mockAIResponse);
      repository.create.mockReturnValue(mockHoroscope as ChineseHoroscope);
      repository.save.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      const delaySpy = jest
        .spyOn(service as any, 'delay')
        .mockResolvedValue(undefined);

      // Act
      await service.generateAllForYear(2026);

      // Assert
      // Debe haber 59 delays (no hay delay antes de la primera combinación)
      expect(delaySpy).toHaveBeenCalledTimes(59);
      expect(delaySpy).toHaveBeenCalledWith(5000);
    });
  });

  describe('findByAnimalAndYear', () => {
    it('debe encontrar horóscopo por animal y año', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      // Act
      const result = await service.findByAnimalAndYear(
        ChineseZodiacAnimal.DRAGON,
        2026,
      );

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          animal: ChineseZodiacAnimal.DRAGON,
          element: 'earth',
          year: 2026,
        },
      });
      expect(result).toEqual(mockHoroscope);
    });

    it('debe retornar null si no encuentra el horóscopo', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByAnimalAndYear(
        ChineseZodiacAnimal.DRAGON,
        2026,
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAllByYear', () => {
    it('debe retornar todos los horóscopos de un año ordenados', async () => {
      // Arrange
      const mockHoroscopes = [
        { ...mockHoroscope, animal: ChineseZodiacAnimal.RAT },
        { ...mockHoroscope, animal: ChineseZodiacAnimal.OX },
        { ...mockHoroscope, animal: ChineseZodiacAnimal.TIGER },
      ];
      repository.find.mockResolvedValue(mockHoroscopes as ChineseHoroscope[]);

      // Act
      const result = await service.findAllByYear(2026);

      // Assert
      expect(repository.find).toHaveBeenCalledWith({
        where: { year: 2026 },
        order: { animal: 'ASC' },
      });
      expect(result).toHaveLength(3);
    });

    it('debe retornar array vacío si no hay horóscopos para el año', async () => {
      // Arrange
      repository.find.mockResolvedValue([]);

      // Act
      const result = await service.findAllByYear(2050);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findForUser', () => {
    it('debe encontrar horóscopo basado en birthDate del usuario', async () => {
      // Arrange
      const birthDate = new Date('1988-03-15'); // Dragón de Tierra
      repository.findOne.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      // Act
      const result = await service.findForUser(birthDate, 2026);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          animal: ChineseZodiacAnimal.DRAGON,
          element: 'earth',
          year: 2026,
        },
      });
      expect(result).toEqual(mockHoroscope);
    });

    it('debe calcular correctamente el animal para usuario nacido antes del CNY', async () => {
      // Arrange
      const birthDate = new Date('1988-01-15'); // Antes del CNY 1988 (17 feb) = Conejo de Fuego
      const rabbitHoroscope = {
        ...mockHoroscope,
        animal: ChineseZodiacAnimal.RABBIT,
      };
      repository.findOne.mockResolvedValue(rabbitHoroscope as ChineseHoroscope);

      // Act
      await service.findForUser(birthDate, 2026);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          animal: ChineseZodiacAnimal.RABBIT,
          element: 'fire',
          year: 2026,
        },
      });
    });

    it('debe usar el año actual por defecto', async () => {
      // Arrange
      const birthDate = new Date('1988-03-15');
      const currentYear = new Date().getFullYear();
      repository.findOne.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      // Act
      await service.findForUser(birthDate);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          animal: ChineseZodiacAnimal.DRAGON,
          element: 'earth',
          year: currentYear,
        },
      });
    });
  });

  describe('incrementViewCount', () => {
    it('debe incrementar el contador de vistas usando query builder', async () => {
      // Arrange
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      };
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.incrementViewCount(1);

      // Assert
      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.update).toHaveBeenCalled();
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        viewCount: expect.any(Function),
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id = :id', {
        id: 1,
      });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });
  });

  describe('parseAIResponse (private)', () => {
    it('debe parsear correctamente JSON válido', () => {
      // Act
      const result = (service as any).parseAIResponse(mockAIResponse.content);

      // Assert
      expect(result).toHaveProperty('generalOverview');
      expect(result).toHaveProperty('areas');
      expect(result).toHaveProperty('luckyElements');
    });

    it('debe limpiar markdown code blocks antes de parsear', () => {
      // Arrange
      const contentWithMarkdown =
        '```json\n' + mockAIResponse.content + '\n```';

      // Act
      const result = (service as any).parseAIResponse(contentWithMarkdown);

      // Assert
      expect(result).toHaveProperty('generalOverview');
      expect(result).toHaveProperty('areas');
    });

    it('debe lanzar InternalServerErrorException con JSON inválido', () => {
      // Arrange
      const invalidJSON = 'esto no es JSON';

      // Act & Assert
      expect(() => {
        (service as any).parseAIResponse(invalidJSON);
      }).toThrow(InternalServerErrorException);
    });
  });

  // ===== TASK-124: Tests para 60 horóscopos (animal + elemento) =====
  describe('TASK-124: Schema con elemento', () => {
    it('debe generar horóscopo con elemento específico', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockResolvedValue(mockAIResponse);
      repository.create.mockReturnValue(mockHoroscope as ChineseHoroscope);
      repository.save.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      // Act
      const result = await service.generateForAnimalAndElement(
        ChineseZodiacAnimal.DRAGON,
        'earth' as ChineseElement,
        2026,
      );

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          animal: ChineseZodiacAnimal.DRAGON,
          element: 'earth',
          year: 2026,
        },
      });
      expect(result.element).toBe('earth');
    });

    it('debe generar 60 horóscopos (12 animales × 5 elementos) para un año', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockResolvedValue(mockAIResponse);
      repository.create.mockReturnValue(mockHoroscope as ChineseHoroscope);
      repository.save.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      // Mock delay
      jest.spyOn(service as any, 'delay').mockResolvedValue(undefined);

      // Act
      const result = await service.generateAllForYear(2026);

      // Assert
      expect(result.successful).toBe(60); // 12 animales × 5 elementos
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(60);
      expect(aiProviderService.generateCompletion).toHaveBeenCalledTimes(60);
    });

    it('debe buscar horóscopo por animal, elemento y año', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      // Act
      const result = await service.findByAnimalElementAndYear(
        ChineseZodiacAnimal.DRAGON,
        'earth' as ChineseElement,
        2026,
      );

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          animal: ChineseZodiacAnimal.DRAGON,
          element: 'earth',
          year: 2026,
        },
      });
      expect(result).toEqual(mockHoroscope);
    });

    it('debe retornar null si no encuentra horóscopo con esa combinación', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByAnimalElementAndYear(
        ChineseZodiacAnimal.DRAGON,
        'water' as ChineseElement,
        2026,
      );

      // Assert
      expect(result).toBeNull();
    });

    it('debe encontrar horóscopo para usuario incluyendo su elemento', async () => {
      // Arrange
      const birthDate = new Date('1988-03-15'); // Dragón de Tierra
      repository.findOne.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      // Act
      const result = await service.findForUser(birthDate, 2026);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          animal: ChineseZodiacAnimal.DRAGON,
          element: 'earth',
          year: 2026,
        },
      });
      expect(result?.element).toBe('earth');
    });

    it('debe prevenir duplicados con constraint (animal, element, year)', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      // Act
      const result = await service.generateForAnimalAndElement(
        ChineseZodiacAnimal.DRAGON,
        'earth' as ChineseElement,
        2026,
      );

      // Assert
      expect(aiProviderService.generateCompletion).not.toHaveBeenCalled();
      expect(result).toEqual(mockHoroscope);
    });
  });
});
