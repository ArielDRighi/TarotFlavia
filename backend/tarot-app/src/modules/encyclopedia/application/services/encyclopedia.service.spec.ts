import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { EncyclopediaService } from './encyclopedia.service';
import { EncyclopediaTarotCard } from '../../entities/encyclopedia-tarot-card.entity';
import { ArcanaType, Suit, Element, CourtRank } from '../../enums/tarot.enums';
import { CardFiltersDto } from '../dto/card-filters.dto';

describe('EncyclopediaService', () => {
  let service: EncyclopediaService;
  let repository: jest.Mocked<Repository<EncyclopediaTarotCard>>;

  const mockCard: EncyclopediaTarotCard = {
    id: 1,
    slug: 'the-fool',
    nameEn: 'The Fool',
    nameEs: 'El Loco',
    arcanaType: ArcanaType.MAJOR,
    number: 0,
    romanNumeral: '0',
    suit: null,
    courtRank: null,
    element: Element.AIR,
    planet: null,
    zodiacSign: null,
    meaningUpright: 'Nuevos comienzos, inocencia y espíritu libre.',
    meaningReversed: 'Imprudencia, decisiones precipitadas.',
    description: 'Un joven al borde de un precipicio.',
    keywords: {
      upright: ['Nuevos comienzos', 'Inocencia', 'Aventura'],
      reversed: ['Imprudencia', 'Ingenuidad', 'Riesgo'],
    },
    imageUrl: '/images/tarot/major/00-the-fool.jpg',
    thumbnailUrl: '/images/tarot/major/00-the-fool-thumb.jpg',
    relatedCards: [2, 3],
    viewCount: 0,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    isCourtCard: jest.fn().mockReturnValue(false),
    isMajorArcana: jest.fn().mockReturnValue(true),
    getDisplayName: jest.fn().mockReturnValue('El Loco'),
  } as EncyclopediaTarotCard;

  const mockCupsCard: EncyclopediaTarotCard = {
    id: 2,
    slug: 'ace-of-cups',
    nameEn: 'Ace of Cups',
    nameEs: 'As de Copas',
    arcanaType: ArcanaType.MINOR,
    number: 1,
    romanNumeral: null,
    suit: Suit.CUPS,
    courtRank: null,
    element: Element.WATER,
    planet: null,
    zodiacSign: null,
    meaningUpright: 'Nuevos comienzos emocionales.',
    meaningReversed: 'Bloqueo emocional.',
    description: 'Una copa rebosante.',
    keywords: {
      upright: ['Amor nuevo', 'Emoción'],
      reversed: ['Bloqueo emocional', 'Vacío'],
    },
    imageUrl: '/images/tarot/cups/01-ace-of-cups.jpg',
    thumbnailUrl: null,
    relatedCards: null,
    viewCount: 0,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    isCourtCard: jest.fn().mockReturnValue(false),
    isMajorArcana: jest.fn().mockReturnValue(false),
    getDisplayName: jest.fn().mockReturnValue('As de Copas'),
  } as EncyclopediaTarotCard;

  const mockCourtCard: EncyclopediaTarotCard = {
    id: 3,
    slug: 'page-of-cups',
    nameEn: 'Page of Cups',
    nameEs: 'Paje de Copas',
    arcanaType: ArcanaType.MINOR,
    number: 11,
    romanNumeral: null,
    suit: Suit.CUPS,
    courtRank: CourtRank.PAGE,
    element: Element.WATER,
    planet: null,
    zodiacSign: null,
    meaningUpright: 'Mensajes emocionales, creatividad juvenil.',
    meaningReversed: 'Inmadurez emocional.',
    description: 'Un joven sostiene una copa.',
    keywords: {
      upright: ['Mensajes', 'Creatividad', 'Sensibilidad'],
      reversed: ['Inmadurez', 'Bloqueo creativo'],
    },
    imageUrl: '/images/tarot/cups/11-page-of-cups.jpg',
    thumbnailUrl: null,
    relatedCards: null,
    viewCount: 0,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    isCourtCard: jest.fn().mockReturnValue(true),
    isMajorArcana: jest.fn().mockReturnValue(false),
    getDisplayName: jest.fn().mockReturnValue('Paje de Copas'),
  } as EncyclopediaTarotCard;

  // Builder mock reutilizable
  const createQueryBuilderMock = (
    results: EncyclopediaTarotCard[],
  ): jest.Mocked<SelectQueryBuilder<EncyclopediaTarotCard>> => {
    const qb = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(results),
    } as unknown as jest.Mocked<SelectQueryBuilder<EncyclopediaTarotCard>>;
    return qb;
  };

  const createUpdateBuilderMock = (): jest.Mocked<
    UpdateQueryBuilder<EncyclopediaTarotCard>
  > => {
    const uqb = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    } as unknown as jest.Mocked<UpdateQueryBuilder<EncyclopediaTarotCard>>;
    return uqb;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncyclopediaService,
        {
          provide: getRepositoryToken(EncyclopediaTarotCard),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EncyclopediaService>(EncyclopediaService);
    repository = module.get(getRepositoryToken(EncyclopediaTarotCard));

    jest.clearAllMocks();
  });

  // ============================================================================
  // findAll
  // ============================================================================

  describe('findAll', () => {
    it('debe retornar todas las cartas sin filtros', async () => {
      const qb = createQueryBuilderMock([mockCard, mockCupsCard]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].slug).toBe('the-fool');
      expect(result[1].slug).toBe('ace-of-cups');
    });

    it('debe aplicar filtro por arcanaType', async () => {
      const qb = createQueryBuilderMock([mockCard]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      const filters: CardFiltersDto = { arcanaType: ArcanaType.MAJOR };
      await service.findAll(filters);

      expect(qb.andWhere).toHaveBeenCalledWith(
        'card.arcanaType = :arcanaType',
        { arcanaType: ArcanaType.MAJOR },
      );
    });

    it('debe aplicar filtro por suit', async () => {
      const qb = createQueryBuilderMock([mockCupsCard]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      const filters: CardFiltersDto = { suit: Suit.CUPS };
      await service.findAll(filters);

      expect(qb.andWhere).toHaveBeenCalledWith('card.suit = :suit', {
        suit: Suit.CUPS,
      });
    });

    it('debe aplicar filtro por element', async () => {
      const qb = createQueryBuilderMock([mockCard]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      const filters: CardFiltersDto = { element: Element.AIR };
      await service.findAll(filters);

      expect(qb.andWhere).toHaveBeenCalledWith('card.element = :element', {
        element: Element.AIR,
      });
    });

    it('debe aplicar filtro courtOnly', async () => {
      const qb = createQueryBuilderMock([mockCourtCard]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      const filters: CardFiltersDto = { courtOnly: true };
      await service.findAll(filters);

      expect(qb.andWhere).toHaveBeenCalledWith('card.courtRank IS NOT NULL');
    });

    it('debe aplicar filtro de búsqueda por nombre', async () => {
      const qb = createQueryBuilderMock([mockCard]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      const filters: CardFiltersDto = { search: 'loco' };
      await service.findAll(filters);

      expect(qb.andWhere).toHaveBeenCalledWith(
        '(card.nameEs ILIKE :search OR card.nameEn ILIKE :search)',
        { search: '%loco%' },
      );
    });

    it('debe ordenar los resultados', async () => {
      const qb = createQueryBuilderMock([]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      await service.findAll();

      expect(qb.orderBy).toHaveBeenCalledWith('card.arcanaType', 'ASC');
      expect(qb.addOrderBy).toHaveBeenCalledWith('card.suit', 'ASC');
      expect(qb.addOrderBy).toHaveBeenCalledWith('card.number', 'ASC');
    });

    it('debe mapear a CardSummaryDto correctamente', async () => {
      const qb = createQueryBuilderMock([mockCard]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      const result = await service.findAll();

      expect(result[0]).toEqual({
        id: 1,
        slug: 'the-fool',
        nameEs: 'El Loco',
        arcanaType: ArcanaType.MAJOR,
        number: 0,
        suit: null,
        thumbnailUrl: '/images/tarot/major/00-the-fool-thumb.jpg',
      });
    });

    it('debe usar imageUrl como fallback si no hay thumbnailUrl', async () => {
      const qb = createQueryBuilderMock([mockCupsCard]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      const result = await service.findAll();

      expect(result[0].thumbnailUrl).toBe(mockCupsCard.imageUrl);
    });
  });

  // ============================================================================
  // getMajorArcana
  // ============================================================================

  describe('getMajorArcana', () => {
    it('debe llamar findAll con arcanaType MAJOR', async () => {
      const qb = createQueryBuilderMock([mockCard]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      const result = await service.getMajorArcana();

      expect(qb.andWhere).toHaveBeenCalledWith(
        'card.arcanaType = :arcanaType',
        { arcanaType: ArcanaType.MAJOR },
      );
      expect(result).toHaveLength(1);
    });
  });

  // ============================================================================
  // getBySuit
  // ============================================================================

  describe('getBySuit', () => {
    it('debe retornar cartas filtradas por palo', async () => {
      const qb = createQueryBuilderMock([mockCupsCard]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      const result = await service.getBySuit(Suit.CUPS);

      expect(qb.andWhere).toHaveBeenCalledWith('card.suit = :suit', {
        suit: Suit.CUPS,
      });
      expect(result).toHaveLength(1);
      expect(result[0].suit).toBe(Suit.CUPS);
    });
  });

  // ============================================================================
  // findBySlug
  // ============================================================================

  describe('findBySlug', () => {
    it('debe retornar el detalle de la carta por slug', async () => {
      repository.findOne.mockResolvedValue(mockCard);
      // Mock del incrementViewCount (query builder para update)
      const uqb = createUpdateBuilderMock();
      repository.createQueryBuilder.mockReturnValue(
        uqb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      const result = await service.findBySlug('the-fool');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { slug: 'the-fool' },
      });
      expect(result.slug).toBe('the-fool');
      expect(result.nameEn).toBe('The Fool');
      expect(result.meaningUpright).toBeDefined();
      expect(result.keywords).toBeDefined();
    });

    it('debe retornar CardDetailDto con todos los campos', async () => {
      repository.findOne.mockResolvedValue(mockCard);
      const uqb = createUpdateBuilderMock();
      repository.createQueryBuilder.mockReturnValue(
        uqb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      const result = await service.findBySlug('the-fool');

      expect(result).toMatchObject({
        id: 1,
        slug: 'the-fool',
        nameEs: 'El Loco',
        nameEn: 'The Fool',
        arcanaType: ArcanaType.MAJOR,
        number: 0,
        romanNumeral: '0',
        element: Element.AIR,
        meaningUpright: expect.any(String),
        meaningReversed: expect.any(String),
        keywords: {
          upright: expect.any(Array),
          reversed: expect.any(Array),
        },
        imageUrl: expect.any(String),
        relatedCards: [2, 3],
      });
    });

    it('debe lanzar NotFoundException si el slug no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('slug-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar NotFoundException con mensaje en español', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('slug-inexistente')).rejects.toThrow(
        'Carta "slug-inexistente" no encontrada',
      );
    });
  });

  // ============================================================================
  // findById
  // ============================================================================

  describe('findById', () => {
    it('debe retornar la carta por ID', async () => {
      repository.findOne.mockResolvedValue(mockCard);

      const result = await service.findById(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result.id).toBe(1);
    });

    it('debe lanzar NotFoundException si el ID no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar NotFoundException con mensaje en español', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(
        'Carta con ID 999 no encontrada',
      );
    });
  });

  // ============================================================================
  // getRelatedCards
  // ============================================================================

  describe('getRelatedCards', () => {
    it('debe retornar cartas relacionadas', async () => {
      repository.findOne.mockResolvedValue(mockCard);
      repository.find.mockResolvedValue([mockCupsCard, mockCourtCard]);

      const result = await service.getRelatedCards(1);

      expect(repository.find).toHaveBeenCalledWith({
        where: { id: expect.objectContaining({}) },
      });
      expect(result).toHaveLength(2);
    });

    it('debe retornar array vacío si no hay cartas relacionadas', async () => {
      const cardWithoutRelated = { ...mockCupsCard, relatedCards: null };
      repository.findOne.mockResolvedValue(
        cardWithoutRelated as EncyclopediaTarotCard,
      );

      const result = await service.getRelatedCards(2);

      expect(result).toEqual([]);
      expect(repository.find).not.toHaveBeenCalled();
    });

    it('debe retornar array vacío si relatedCards es array vacío', async () => {
      const cardWithEmptyRelated = {
        ...mockCupsCard,
        relatedCards: [] as number[],
      } as unknown as EncyclopediaTarotCard;
      repository.findOne.mockResolvedValue(cardWithEmptyRelated);

      const result = await service.getRelatedCards(2);

      expect(result).toEqual([]);
    });
  });

  // ============================================================================
  // search
  // ============================================================================

  describe('search', () => {
    it('debe buscar cartas por término', async () => {
      const qb = createQueryBuilderMock([mockCard]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      const result = await service.search('loco');

      expect(qb.andWhere).toHaveBeenCalledWith(
        '(card.nameEs ILIKE :search OR card.nameEn ILIKE :search)',
        { search: '%loco%' },
      );
      expect(result).toHaveLength(1);
    });
  });

  // ============================================================================
  // getNavigation
  // ============================================================================

  describe('getNavigation', () => {
    it('debe retornar anterior y siguiente para una carta en el medio', async () => {
      // findById para obtener la carta actual
      repository.findOne.mockResolvedValue(mockCupsCard);
      // findAll para obtener todas las cartas
      const qb = createQueryBuilderMock([
        mockCard,
        mockCupsCard,
        mockCourtCard,
      ]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      const result = await service.getNavigation(2);

      expect(result.previous).not.toBeNull();
      expect(result.next).not.toBeNull();
      expect(result.previous?.id).toBe(1);
      expect(result.next?.id).toBe(3);
    });

    it('debe retornar previous null para la primera carta', async () => {
      repository.findOne.mockResolvedValue(mockCard);
      const qb = createQueryBuilderMock([
        mockCard,
        mockCupsCard,
        mockCourtCard,
      ]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      const result = await service.getNavigation(1);

      expect(result.previous).toBeNull();
      expect(result.next).not.toBeNull();
    });

    it('debe retornar next null para la última carta', async () => {
      repository.findOne.mockResolvedValue(mockCourtCard);
      const qb = createQueryBuilderMock([
        mockCard,
        mockCupsCard,
        mockCourtCard,
      ]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<EncyclopediaTarotCard>,
      );

      const result = await service.getNavigation(3);

      expect(result.previous).not.toBeNull();
      expect(result.next).toBeNull();
    });

    it('debe lanzar NotFoundException si el ID no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.getNavigation(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar NotFoundException con mensaje en español', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.getNavigation(999)).rejects.toThrow(
        'Carta con ID 999 no encontrada',
      );
    });
  });
});
