import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EncyclopediaController } from './encyclopedia.controller';
import { EncyclopediaService } from '../../application/services/encyclopedia.service';
import { CardFiltersDto } from '../../application/dto/card-filters.dto';
import {
  CardDetailDto,
  CardSummaryDto,
} from '../../application/dto/card-response.dto';
import { ArcanaType, Element, Suit } from '../../enums/tarot.enums';

// ─── Helpers de fixtures ────────────────────────────────────────────────────

function buildSummary(overrides: Partial<CardSummaryDto> = {}): CardSummaryDto {
  return {
    id: 1,
    slug: 'the-fool',
    nameEs: 'El Loco',
    arcanaType: ArcanaType.MAJOR,
    number: 0,
    suit: null,
    thumbnailUrl: '/images/tarot/major/00-the-fool-thumb.jpg',
    ...overrides,
  };
}

function buildDetail(overrides: Partial<CardDetailDto> = {}): CardDetailDto {
  return {
    ...buildSummary(),
    nameEn: 'The Fool',
    romanNumeral: '0',
    courtRank: null,
    element: Element.AIR,
    planet: null,
    zodiacSign: null,
    meaningUpright: 'Nuevos comienzos y aventura.',
    meaningReversed: 'Imprudencia y precipitación.',
    description: 'Un joven al borde de un precipicio.',
    keywords: {
      upright: ['Aventura', 'Libertad'],
      reversed: ['Imprudencia', 'Riesgo'],
    },
    imageUrl: '/images/tarot/major/00-the-fool.jpg',
    relatedCards: null,
    ...overrides,
  };
}

// ─── Mock del servicio ───────────────────────────────────────────────────────

const mockEncyclopediaService: jest.Mocked<
  Pick<
    EncyclopediaService,
    | 'findAll'
    | 'getMajorArcana'
    | 'getBySuit'
    | 'search'
    | 'findBySlug'
    | 'findIdBySlug'
    | 'getRelatedCards'
    | 'getNavigation'
  >
> = {
  findAll: jest.fn(),
  getMajorArcana: jest.fn(),
  getBySuit: jest.fn(),
  search: jest.fn(),
  findBySlug: jest.fn(),
  findIdBySlug: jest.fn(),
  getRelatedCards: jest.fn(),
  getNavigation: jest.fn(),
};

// ─── Suite principal ─────────────────────────────────────────────────────────

describe('EncyclopediaController', () => {
  let controller: EncyclopediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EncyclopediaController],
      providers: [
        { provide: EncyclopediaService, useValue: mockEncyclopediaService },
      ],
    }).compile();

    controller = module.get<EncyclopediaController>(EncyclopediaController);
    jest.clearAllMocks();
  });

  // ── GET /encyclopedia/cards ─────────────────────────────────────────────

  describe('getCards', () => {
    it('debe retornar el listado completo cuando no hay filtros', async () => {
      const cards = [buildSummary({ id: 1 }), buildSummary({ id: 2 })];
      mockEncyclopediaService.findAll.mockResolvedValue(cards);

      const result = await controller.getCards({} as CardFiltersDto);

      expect(mockEncyclopediaService.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(cards);
      expect(result).toHaveLength(2);
    });

    it('debe pasar los filtros recibidos al servicio', async () => {
      const filters: CardFiltersDto = { arcanaType: ArcanaType.MAJOR };
      mockEncyclopediaService.findAll.mockResolvedValue([]);

      await controller.getCards(filters);

      expect(mockEncyclopediaService.findAll).toHaveBeenCalledWith(filters);
    });

    it('debe retornar array vacío cuando no hay cartas', async () => {
      mockEncyclopediaService.findAll.mockResolvedValue([]);

      const result = await controller.getCards({} as CardFiltersDto);

      expect(result).toEqual([]);
    });
  });

  // ── GET /encyclopedia/cards/major ───────────────────────────────────────

  describe('getMajorArcana', () => {
    it('debe retornar los 22 Arcanos Mayores', async () => {
      const majors = Array.from({ length: 22 }, (_, i) =>
        buildSummary({ id: i + 1, number: i }),
      );
      mockEncyclopediaService.getMajorArcana.mockResolvedValue(majors);

      const result = await controller.getMajorArcana();

      expect(mockEncyclopediaService.getMajorArcana).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(22);
    });
  });

  // ── GET /encyclopedia/cards/suit/:suit ──────────────────────────────────

  describe('getBySuit', () => {
    it('debe retornar las 14 cartas del palo indicado', async () => {
      const cups = Array.from({ length: 14 }, (_, i) =>
        buildSummary({
          id: i + 1,
          suit: Suit.CUPS,
          arcanaType: ArcanaType.MINOR,
        }),
      );
      mockEncyclopediaService.getBySuit.mockResolvedValue(cups);

      const result = await controller.getBySuit(Suit.CUPS);

      expect(mockEncyclopediaService.getBySuit).toHaveBeenCalledWith(Suit.CUPS);
      expect(result).toHaveLength(14);
    });

    it('debe llamar al servicio con el palo correcto para wands', async () => {
      mockEncyclopediaService.getBySuit.mockResolvedValue([]);

      await controller.getBySuit(Suit.WANDS);

      expect(mockEncyclopediaService.getBySuit).toHaveBeenCalledWith(
        Suit.WANDS,
      );
    });
  });

  // ── GET /encyclopedia/cards/search ──────────────────────────────────────

  describe('searchCards', () => {
    it('debe retornar resultados cuando el query tiene 2 o más caracteres', async () => {
      const found = [buildSummary({ nameEs: 'El Mago' })];
      mockEncyclopediaService.search.mockResolvedValue(found);

      const result = await controller.searchCards('ma');

      expect(mockEncyclopediaService.search).toHaveBeenCalledWith('ma');
      expect(result).toEqual(found);
    });

    it('debe normalizar (trim) el query antes de validar la longitud mínima', async () => {
      const result = await controller.searchCards('  a  ');

      expect(mockEncyclopediaService.search).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('debe pasar el query normalizado (trim) al servicio', async () => {
      const found = [buildSummary({ nameEs: 'El Mago' })];
      mockEncyclopediaService.search.mockResolvedValue(found);

      const result = await controller.searchCards('  ma  ');

      expect(mockEncyclopediaService.search).toHaveBeenCalledWith('ma');
      expect(result).toEqual(found);
    });

    it('debe retornar array vacío sin llamar al servicio cuando query tiene menos de 2 caracteres', async () => {
      const result = await controller.searchCards('a');

      expect(mockEncyclopediaService.search).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('debe retornar array vacío sin llamar al servicio cuando query está vacío', async () => {
      const result = await controller.searchCards('');

      expect(mockEncyclopediaService.search).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('debe retornar array vacío sin llamar al servicio cuando query es undefined', async () => {
      const result = await controller.searchCards(
        undefined as unknown as string,
      );

      expect(mockEncyclopediaService.search).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  // ── GET /encyclopedia/cards/:slug ───────────────────────────────────────

  describe('getCardBySlug', () => {
    it('debe retornar el detalle completo de la carta por slug', async () => {
      const detail = buildDetail();
      mockEncyclopediaService.findBySlug.mockResolvedValue(detail);

      const result = await controller.getCardBySlug('the-fool');

      expect(mockEncyclopediaService.findBySlug).toHaveBeenCalledWith(
        'the-fool',
      );
      expect(result).toEqual(detail);
    });

    it('debe propagar NotFoundException cuando el slug no existe', async () => {
      mockEncyclopediaService.findBySlug.mockRejectedValue(
        new NotFoundException('Carta "invalid-slug" no encontrada'),
      );

      await expect(controller.getCardBySlug('invalid-slug')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── GET /encyclopedia/cards/:slug/related ───────────────────────────────

  describe('getRelatedCards', () => {
    it('debe retornar las cartas relacionadas del slug indicado sin incrementar vistas', async () => {
      const related = [buildSummary({ id: 2 }), buildSummary({ id: 3 })];
      mockEncyclopediaService.findIdBySlug.mockResolvedValue(1);
      mockEncyclopediaService.getRelatedCards.mockResolvedValue(related);

      const result = await controller.getRelatedCards('the-fool');

      // Usa findIdBySlug (sin incremento de vistas), NO findBySlug
      expect(mockEncyclopediaService.findIdBySlug).toHaveBeenCalledWith(
        'the-fool',
      );
      expect(mockEncyclopediaService.findBySlug).not.toHaveBeenCalled();
      expect(mockEncyclopediaService.getRelatedCards).toHaveBeenCalledWith(1);
      expect(result).toEqual(related);
    });

    it('debe retornar array vacío cuando la carta no tiene relacionadas', async () => {
      mockEncyclopediaService.findIdBySlug.mockResolvedValue(1);
      mockEncyclopediaService.getRelatedCards.mockResolvedValue([]);

      const result = await controller.getRelatedCards('the-fool');

      expect(result).toEqual([]);
    });

    it('debe propagar NotFoundException cuando el slug no existe', async () => {
      mockEncyclopediaService.findIdBySlug.mockRejectedValue(
        new NotFoundException('Carta "invalid-slug" no encontrada'),
      );

      await expect(controller.getRelatedCards('invalid-slug')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── GET /encyclopedia/cards/:slug/navigation ────────────────────────────

  describe('getNavigation', () => {
    it('debe retornar la navegación anterior/siguiente para una carta sin incrementar vistas', async () => {
      const navigation = {
        previous: buildSummary({ id: 1, slug: 'previous-card' }),
        next: buildSummary({ id: 3, slug: 'next-card' }),
      };
      mockEncyclopediaService.findIdBySlug.mockResolvedValue(2);
      mockEncyclopediaService.getNavigation.mockResolvedValue(navigation);

      const result = await controller.getNavigation('the-magician');

      // Usa findIdBySlug (sin incremento de vistas), NO findBySlug
      expect(mockEncyclopediaService.findIdBySlug).toHaveBeenCalledWith(
        'the-magician',
      );
      expect(mockEncyclopediaService.findBySlug).not.toHaveBeenCalled();
      expect(mockEncyclopediaService.getNavigation).toHaveBeenCalledWith(2);
      expect(result).toEqual(navigation);
    });

    it('debe retornar null en previous cuando la carta es la primera', async () => {
      const navigation = {
        previous: null,
        next: buildSummary({ id: 2, slug: 'the-magician' }),
      };
      mockEncyclopediaService.findIdBySlug.mockResolvedValue(1);
      mockEncyclopediaService.getNavigation.mockResolvedValue(navigation);

      const result = await controller.getNavigation('the-fool');

      expect(result.previous).toBeNull();
      expect(result.next).not.toBeNull();
    });

    it('debe retornar null en next cuando la carta es la última', async () => {
      const navigation = {
        previous: buildSummary({ id: 77, slug: 'judgement' }),
        next: null,
      };
      mockEncyclopediaService.findIdBySlug.mockResolvedValue(78);
      mockEncyclopediaService.getNavigation.mockResolvedValue(navigation);

      const result = await controller.getNavigation('the-world');

      expect(result.previous).not.toBeNull();
      expect(result.next).toBeNull();
    });

    it('debe propagar NotFoundException cuando el slug no existe', async () => {
      mockEncyclopediaService.findIdBySlug.mockRejectedValue(
        new NotFoundException('Carta "invalid-slug" no encontrada'),
      );

      await expect(controller.getNavigation('invalid-slug')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── Cobertura de court cards en getCards ────────────────────────────────

  describe('getCards con courtOnly', () => {
    it('debe filtrar las 16 cartas de corte cuando courtOnly=true', async () => {
      const courtCards = Array.from({ length: 16 }, (_, i) =>
        buildSummary({
          id: i + 1,
          arcanaType: ArcanaType.MINOR,
          suit: Suit.CUPS,
        }),
      );
      mockEncyclopediaService.findAll.mockResolvedValue(courtCards);

      const filters: CardFiltersDto = { courtOnly: true };
      const result = await controller.getCards(filters);

      expect(mockEncyclopediaService.findAll).toHaveBeenCalledWith(filters);
      expect(result).toHaveLength(16);
    });
  });
});
