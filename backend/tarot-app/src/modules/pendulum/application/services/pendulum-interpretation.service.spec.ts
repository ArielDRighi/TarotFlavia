import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendulumInterpretationService } from './pendulum-interpretation.service';
import { PendulumInterpretation } from '../../entities/pendulum-interpretation.entity';
import { PendulumResponse } from '../../domain/enums/pendulum.enums';

describe('PendulumInterpretationService', () => {
  let service: PendulumInterpretationService;
  let repository: Repository<PendulumInterpretation>;

  const mockInterpretations: PendulumInterpretation[] = [
    {
      id: 1,
      responseType: PendulumResponse.YES,
      text: 'El universo afirma tu camino.',
      isActive: true,
    },
    {
      id: 2,
      responseType: PendulumResponse.YES,
      text: 'Las fuerzas cósmicas se alinean positivamente.',
      isActive: true,
    },
    {
      id: 3,
      responseType: PendulumResponse.NO,
      text: 'El universo sugiere pausa.',
      isActive: true,
    },
    {
      id: 4,
      responseType: PendulumResponse.MAYBE,
      text: 'Las energías están en equilibrio.',
      isActive: true,
    },
    {
      id: 5,
      responseType: PendulumResponse.YES,
      text: 'Interpretación inactiva.',
      isActive: false,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PendulumInterpretationService,
        {
          provide: getRepositoryToken(PendulumInterpretation),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PendulumInterpretationService>(
      PendulumInterpretationService,
    );
    repository = module.get<Repository<PendulumInterpretation>>(
      getRepositoryToken(PendulumInterpretation),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRandomInterpretation', () => {
    it('should return a random interpretation for YES response', async () => {
      const yesInterpretations = mockInterpretations.filter(
        (i) => i.responseType === PendulumResponse.YES && i.isActive,
      );
      jest.spyOn(repository, 'find').mockResolvedValue(yesInterpretations);

      const result = await service.getRandomInterpretation(
        PendulumResponse.YES,
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // Verificar que es una de las interpretaciones esperadas
      const expectedTexts = yesInterpretations.map((i) => i.text);
      expect(expectedTexts).toContain(result);
    });

    it('should return a random interpretation for NO response', async () => {
      const noInterpretations = mockInterpretations.filter(
        (i) => i.responseType === PendulumResponse.NO && i.isActive,
      );
      jest.spyOn(repository, 'find').mockResolvedValue(noInterpretations);

      const result = await service.getRandomInterpretation(PendulumResponse.NO);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      const expectedTexts = noInterpretations.map((i) => i.text);
      expect(expectedTexts).toContain(result);
    });

    it('should return a random interpretation for MAYBE response', async () => {
      const maybeInterpretations = mockInterpretations.filter(
        (i) => i.responseType === PendulumResponse.MAYBE && i.isActive,
      );
      jest.spyOn(repository, 'find').mockResolvedValue(maybeInterpretations);

      const result = await service.getRandomInterpretation(
        PendulumResponse.MAYBE,
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      const expectedTexts = maybeInterpretations.map((i) => i.text);
      expect(expectedTexts).toContain(result);
    });

    it('should only use active interpretations', async () => {
      const activeYesInterpretations = mockInterpretations.filter(
        (i) => i.responseType === PendulumResponse.YES && i.isActive,
      );
      jest
        .spyOn(repository, 'find')
        .mockResolvedValue(activeYesInterpretations);

      const result = await service.getRandomInterpretation(
        PendulumResponse.YES,
      );

      // Verificar que se llamó con el filtro correcto
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          responseType: PendulumResponse.YES,
          isActive: true,
        },
      });

      // Verificar que no retorna interpretaciones inactivas
      expect(result).not.toBe('Interpretación inactiva.');
    });

    it('should return fallback interpretation when no interpretations found for YES', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await service.getRandomInterpretation(
        PendulumResponse.YES,
      );

      expect(result).toBe('El universo afirma tu camino.');
    });

    it('should return fallback interpretation when no interpretations found for NO', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await service.getRandomInterpretation(PendulumResponse.NO);

      expect(result).toBe('El universo sugiere otra dirección.');
    });

    it('should return fallback interpretation when no interpretations found for MAYBE', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await service.getRandomInterpretation(
        PendulumResponse.MAYBE,
      );

      expect(result).toBe('El universo guarda silencio por ahora.');
    });

    it('should handle database errors gracefully', async () => {
      jest
        .spyOn(repository, 'find')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        service.getRandomInterpretation(PendulumResponse.YES),
      ).rejects.toThrow('Database error');
    });

    it('should return different interpretations on multiple calls (randomness check)', async () => {
      // Setup con múltiples interpretaciones
      const yesInterpretations = mockInterpretations.filter(
        (i) => i.responseType === PendulumResponse.YES && i.isActive,
      );
      jest.spyOn(repository, 'find').mockResolvedValue(yesInterpretations);

      // Llamar múltiples veces
      const results = new Set<string>();
      for (let i = 0; i < 20; i++) {
        const result = await service.getRandomInterpretation(
          PendulumResponse.YES,
        );
        results.add(result);
      }

      // Con 20 llamadas y 2 opciones, esperamos al menos 2 resultados diferentes
      // (probabilidad extremadamente alta de variación)
      expect(results.size).toBeGreaterThan(1);
    });
  });
});
