import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmCardFreeInterpretationRepository } from './typeorm-card-free-interpretation.repository';
import { CardFreeInterpretation } from '../../entities/card-free-interpretation.entity';

type MockRepository = jest.Mocked<Partial<Repository<CardFreeInterpretation>>>;

const mockTypeOrmRepo: MockRepository = {
  find: jest.fn(),
};

describe('TypeOrmCardFreeInterpretationRepository', () => {
  let repository: TypeOrmCardFreeInterpretationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmCardFreeInterpretationRepository,
        {
          provide: getRepositoryToken(CardFreeInterpretation),
          useValue: mockTypeOrmRepo,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmCardFreeInterpretationRepository>(
      TypeOrmCardFreeInterpretationRepository,
    );
    jest.clearAllMocks();
  });

  describe('findByCardsAndCategory', () => {
    it('debería retornar interpretaciones para combinación card+categoría+orientación', async () => {
      const mockInterpretations: CardFreeInterpretation[] = [
        {
          id: 1,
          cardId: 1,
          categoryId: 2,
          orientation: 'upright',
          content: 'El Loco en amor derecha...',
          card: { id: 1 } as CardFreeInterpretation['card'],
          category: { id: 2 } as CardFreeInterpretation['category'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          cardId: 3,
          categoryId: 2,
          orientation: 'reversed',
          content: 'La Torre en amor invertida...',
          card: { id: 3 } as CardFreeInterpretation['card'],
          category: { id: 2 } as CardFreeInterpretation['category'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockTypeOrmRepo.find as jest.Mock).mockResolvedValue(
        mockInterpretations,
      );

      const result = await repository.findByCardsAndCategory(
        [1, 3],
        ['upright', 'reversed'],
        2,
      );

      expect(result).toEqual(mockInterpretations);
      expect(mockTypeOrmRepo.find).toHaveBeenCalledWith({
        where: expect.arrayContaining([
          expect.objectContaining({
            cardId: 1,
            categoryId: 2,
            orientation: 'upright',
          }),
          expect.objectContaining({
            cardId: 1,
            categoryId: 2,
            orientation: 'reversed',
          }),
          expect.objectContaining({
            cardId: 3,
            categoryId: 2,
            orientation: 'upright',
          }),
          expect.objectContaining({
            cardId: 3,
            categoryId: 2,
            orientation: 'reversed',
          }),
        ]),
      });
    });

    it('debería retornar array vacío cuando no hay interpretaciones para la combinación', async () => {
      (mockTypeOrmRepo.find as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByCardsAndCategory(
        [99],
        ['upright'],
        1,
      );

      expect(result).toEqual([]);
    });

    it('debería construir condiciones WHERE para todas las combinaciones cardId x orientación', async () => {
      (mockTypeOrmRepo.find as jest.Mock).mockResolvedValue([]);

      await repository.findByCardsAndCategory(
        [1, 2],
        ['upright', 'reversed'],
        5,
      );

      const callArg = (mockTypeOrmRepo.find as jest.Mock).mock.calls[0][0];
      // 2 cards × 2 orientations = 4 condiciones
      expect(callArg.where).toHaveLength(4);
      callArg.where.forEach((condition: Record<string, unknown>) => {
        expect(condition.categoryId).toBe(5);
      });
    });

    it('debería retornar solo las interpretaciones para la categoría indicada', async () => {
      const interpretationCat1: CardFreeInterpretation = {
        id: 10,
        cardId: 1,
        categoryId: 1,
        orientation: 'upright',
        content: 'Texto para categoría 1...',
        card: { id: 1 } as CardFreeInterpretation['card'],
        category: { id: 1 } as CardFreeInterpretation['category'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockTypeOrmRepo.find as jest.Mock).mockResolvedValue([
        interpretationCat1,
      ]);

      const result = await repository.findByCardsAndCategory(
        [1],
        ['upright'],
        1,
      );

      expect(result).toHaveLength(1);
      expect(result[0].categoryId).toBe(1);
    });

    it('debería manejar array de cardIds vacío retornando array vacío', async () => {
      const result = await repository.findByCardsAndCategory(
        [],
        ['upright'],
        1,
      );

      expect(result).toEqual([]);
      expect(mockTypeOrmRepo.find).not.toHaveBeenCalled();
    });
  });
});
