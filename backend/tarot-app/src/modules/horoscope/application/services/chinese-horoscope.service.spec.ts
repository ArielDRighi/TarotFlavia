import { Test, TestingModule } from '@nestjs/testing';
import { Repository, SelectQueryBuilder } from 'typeorm';
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

  describe('generateAllForYear', () => {
    it('debe generar horóscopos para todos los 60 combinaciones (12 animales × 5 elementos)', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockResolvedValue(mockAIResponse);
      repository.create.mockReturnValue(mockHoroscope as ChineseHoroscope);
      repository.save.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      // Mock delay para evitar esperas reales en tests
      jest
        .spyOn(service as unknown as Record<string, jest.Mock>, 'delay')
        .mockResolvedValue(undefined);

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
      // La 3ra combinación (índice 2) debe fallar sus 3 intentos (MAX_RETRIES=3)
      // Llamadas 3,4,5 corresponden a los 3 intentos de la 3ra combinación
      let globalCallCount = 0;
      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockImplementation(() => {
        globalCallCount++;
        if (globalCallCount >= 3 && globalCallCount <= 5) {
          return Promise.reject(new Error('Error de IA'));
        }
        return Promise.resolve(mockAIResponse);
      });
      repository.create.mockReturnValue(mockHoroscope as ChineseHoroscope);
      repository.save.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      // Mock delay
      jest
        .spyOn(service as unknown as Record<string, jest.Mock>, 'delay')
        .mockResolvedValue(undefined);

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

    it('debe incluir delay de 10s entre cada generación (TASK-125)', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockResolvedValue(mockAIResponse);
      repository.create.mockReturnValue(mockHoroscope as ChineseHoroscope);
      repository.save.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      const delaySpy = jest
        .spyOn(service as unknown as Record<string, jest.Mock>, 'delay')
        .mockResolvedValue(undefined);

      // Act
      await service.generateAllForYear(2026);

      // Assert
      // Debe haber 59 delays (no hay delay antes de la primera combinación)
      expect(delaySpy).toHaveBeenCalledTimes(59);
      expect(delaySpy).toHaveBeenCalledWith(10000); // TASK-125: 10s delay
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
      repository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as unknown as SelectQueryBuilder<ChineseHoroscope>,
      );

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
      const result = (
        service as unknown as Record<string, (arg: string) => unknown>
      ).parseAIResponse(mockAIResponse.content);

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
      const result = (
        service as unknown as Record<string, (arg: string) => unknown>
      ).parseAIResponse(contentWithMarkdown);

      // Assert
      expect(result).toHaveProperty('generalOverview');
      expect(result).toHaveProperty('areas');
    });

    it('debe lanzar InternalServerErrorException con JSON inválido', () => {
      // Arrange
      const invalidJSON = 'esto no es JSON';

      // Act & Assert
      expect(() => {
        (
          service as unknown as Record<string, (arg: string) => unknown>
        ).parseAIResponse(invalidJSON);
      }).toThrow(InternalServerErrorException);
    });
  });

  // ===== TASK-124: Tests para 60 horóscopos (animal + elemento) =====
  // ===== T-BUG-001-A: Retry + findMissingCombinationsForYear + generateMissingForYear =====
  describe('findMissingCombinationsForYear', () => {
    it('debe retornar las 60 combinaciones cuando no hay ninguna generada', async () => {
      // Arrange
      repository.find.mockResolvedValue([]);

      // Act
      const result = await service.findMissingCombinationsForYear(2026);

      // Assert
      expect(result).toHaveLength(60);
      expect(repository.find).toHaveBeenCalledWith({ where: { year: 2026 } });
    });

    it('debe retornar array vacío cuando todos los 60 horóscopos existen', async () => {
      // Arrange
      const animals = Object.values(ChineseZodiacAnimal);
      const elements: ChineseElement[] = [
        'metal',
        'water',
        'wood',
        'fire',
        'earth',
      ];
      const allHoroscopes = animals.flatMap((animal) =>
        elements.map((element) => ({
          ...mockHoroscope,
          animal,
          element,
        })),
      );
      repository.find.mockResolvedValue(allHoroscopes as ChineseHoroscope[]);

      // Act
      const result = await service.findMissingCombinationsForYear(2026);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('debe retornar solo las combinaciones faltantes cuando hay algunas generadas', async () => {
      // Arrange — solo existe dragón/earth
      repository.find.mockResolvedValue([
        {
          ...mockHoroscope,
          animal: ChineseZodiacAnimal.DRAGON,
          element: 'earth',
        },
      ] as ChineseHoroscope[]);

      // Act
      const result = await service.findMissingCombinationsForYear(2026);

      // Assert
      expect(result).toHaveLength(59);
      const hasDragonEarth = result.some(
        (c) => c.animal === ChineseZodiacAnimal.DRAGON && c.element === 'earth',
      );
      expect(hasDragonEarth).toBe(false);
    });

    it('debe incluir todas las combinaciones esperadas (12 animales × 5 elementos)', async () => {
      // Arrange
      repository.find.mockResolvedValue([]);

      // Act
      const result = await service.findMissingCombinationsForYear(2026);

      // Assert — verificar que hay 5 combinaciones por cada animal
      const animals = Object.values(ChineseZodiacAnimal);
      for (const animal of animals) {
        const combosForAnimal = result.filter((c) => c.animal === animal);
        expect(combosForAnimal).toHaveLength(5);
      }
    });
  });

  describe('generateMissingForYear', () => {
    it('debe generar solo las combinaciones faltantes', async () => {
      // Arrange — solo 1 existente (dragon/earth), 59 faltantes
      repository.find.mockResolvedValue([
        {
          ...mockHoroscope,
          animal: ChineseZodiacAnimal.DRAGON,
          element: 'earth',
        },
      ] as ChineseHoroscope[]);
      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockResolvedValue(mockAIResponse);
      repository.create.mockReturnValue(mockHoroscope as ChineseHoroscope);
      repository.save.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      jest
        .spyOn(service as unknown as Record<string, jest.Mock>, 'delay')
        .mockResolvedValue(undefined);

      // Act
      const result = await service.generateMissingForYear(2026);

      // Assert
      expect(result.successful).toBe(59);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(59);
      // No debería haber llamado a la IA para dragon/earth (ya existe)
      expect(aiProviderService.generateCompletion).toHaveBeenCalledTimes(59);
    });

    it('debe retornar 0 exitosos si no hay faltantes', async () => {
      // Arrange — todos existen
      const animals = Object.values(ChineseZodiacAnimal);
      const elements: ChineseElement[] = [
        'metal',
        'water',
        'wood',
        'fire',
        'earth',
      ];
      const allHoroscopes = animals.flatMap((animal) =>
        elements.map((element) => ({ ...mockHoroscope, animal, element })),
      );
      repository.find.mockResolvedValue(allHoroscopes as ChineseHoroscope[]);

      jest
        .spyOn(service as unknown as Record<string, jest.Mock>, 'delay')
        .mockResolvedValue(undefined);

      // Act
      const result = await service.generateMissingForYear(2026);

      // Assert
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(0);
      expect(aiProviderService.generateCompletion).not.toHaveBeenCalled();
    });

    it('debe NUNCA regenerar horóscopos existentes', async () => {
      // Arrange — dragon/earth existe en DB
      repository.find.mockResolvedValue([
        {
          ...mockHoroscope,
          animal: ChineseZodiacAnimal.DRAGON,
          element: 'earth',
        },
      ] as ChineseHoroscope[]);
      // findOne simula que dragon/earth YA existe (los 59 restantes no)
      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockResolvedValue(mockAIResponse);
      repository.create.mockReturnValue(mockHoroscope as ChineseHoroscope);
      repository.save.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      jest
        .spyOn(service as unknown as Record<string, jest.Mock>, 'delay')
        .mockResolvedValue(undefined);

      // Act
      await service.generateMissingForYear(2026);

      // Assert — debe generar exactamente 59, no 60
      expect(aiProviderService.generateCompletion).toHaveBeenCalledTimes(59);
    });
  });

  describe('retry logic en generateAllForYear', () => {
    it('debe reintentar hasta MAX_RETRIES veces con backoff si la IA falla', async () => {
      // Arrange — la tercera combinación falla en todos los intentos
      let callCount = 0;
      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockImplementation(() => {
        callCount++;
        // La 3ra combinación falla en intentos 3, 4, 5 (3 reintentos)
        if (callCount >= 3 && callCount <= 5) {
          return Promise.reject(new Error('Rate limit error'));
        }
        return Promise.resolve(mockAIResponse);
      });
      repository.create.mockReturnValue(mockHoroscope as ChineseHoroscope);
      repository.save.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      jest
        .spyOn(service as unknown as Record<string, jest.Mock>, 'delay')
        .mockResolvedValue(undefined);

      // Act
      const result = await service.generateAllForYear(2026);

      // Assert — 1 falla definitiva (todos los reintentos agotados), 59 éxitos
      expect(result.failed).toBe(1);
      expect(result.successful).toBe(59);
    });

    it('debe tener éxito si la IA falla en el primer intento pero responde en reintento', async () => {
      // Arrange — la primera llamada a la IA falla, las siguientes tienen éxito
      let firstCallForCombination = true;
      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockImplementation(() => {
        if (firstCallForCombination) {
          firstCallForCombination = false;
          return Promise.reject(new Error('Timeout'));
        }
        return Promise.resolve(mockAIResponse);
      });
      repository.create.mockReturnValue(mockHoroscope as ChineseHoroscope);
      repository.save.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      jest
        .spyOn(service as unknown as Record<string, jest.Mock>, 'delay')
        .mockResolvedValue(undefined);

      // Act
      const result = await service.generateAllForYear(2026);

      // Assert — todas las 60 exitosas (la primera combinación pasa en reintento)
      expect(result.successful).toBe(60);
      expect(result.failed).toBe(0);
    });

    it('debe no detener el bucle cuando una combinación falla definitivamente', async () => {
      // Arrange — rat/metal falla siempre (primera combinación)
      let callCount = 0;
      repository.findOne.mockResolvedValue(null);
      aiProviderService.generateCompletion.mockImplementation(() => {
        callCount++;
        // Los primeros 3 intentos siempre fallan (MAX_RETRIES para rat/metal)
        if (callCount <= 3) {
          return Promise.reject(new Error('Persistent error'));
        }
        return Promise.resolve(mockAIResponse);
      });
      repository.create.mockReturnValue(mockHoroscope as ChineseHoroscope);
      repository.save.mockResolvedValue(mockHoroscope as ChineseHoroscope);

      jest
        .spyOn(service as unknown as Record<string, jest.Mock>, 'delay')
        .mockResolvedValue(undefined);

      // Act
      const result = await service.generateAllForYear(2026);

      // Assert — continúa procesando el resto (59 exitosos, 1 fallido)
      expect(result.failed).toBe(1);
      expect(result.successful).toBe(59);
      expect(result.results).toHaveLength(60);
    });
  });

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
      jest
        .spyOn(service as unknown as Record<string, jest.Mock>, 'delay')
        .mockResolvedValue(undefined);

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
