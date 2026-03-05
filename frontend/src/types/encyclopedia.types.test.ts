/**
 * Tests for Encyclopedia Types
 */

import { describe, it, expect } from 'vitest';
import {
  ArcanaType,
  Suit,
  CourtRank,
  Element,
  SUIT_INFO,
  ELEMENT_INFO,
  type CardKeywords,
  type CardSummary,
  type CardDetail,
  type CardNavigation,
  type CardFilters,
  type SuitInfo,
} from './encyclopedia.types';

describe('encyclopedia types', () => {
  describe('ArcanaType enum', () => {
    it('should have all 2 arcana types', () => {
      const types = Object.values(ArcanaType);
      expect(types).toHaveLength(2);
    });

    it('should have correct arcana type values', () => {
      expect(ArcanaType.MAJOR).toBe('major');
      expect(ArcanaType.MINOR).toBe('minor');
    });
  });

  describe('Suit enum', () => {
    it('should have all 4 suits', () => {
      const suits = Object.values(Suit);
      expect(suits).toHaveLength(4);
    });

    it('should have correct suit values', () => {
      expect(Suit.WANDS).toBe('wands');
      expect(Suit.CUPS).toBe('cups');
      expect(Suit.SWORDS).toBe('swords');
      expect(Suit.PENTACLES).toBe('pentacles');
    });
  });

  describe('CourtRank enum', () => {
    it('should have all 4 court ranks', () => {
      const ranks = Object.values(CourtRank);
      expect(ranks).toHaveLength(4);
    });

    it('should have correct court rank values', () => {
      expect(CourtRank.PAGE).toBe('page');
      expect(CourtRank.KNIGHT).toBe('knight');
      expect(CourtRank.QUEEN).toBe('queen');
      expect(CourtRank.KING).toBe('king');
    });
  });

  describe('Element enum', () => {
    it('should have all 5 elements', () => {
      const elements = Object.values(Element);
      expect(elements).toHaveLength(5);
    });

    it('should have correct element values', () => {
      expect(Element.FIRE).toBe('fire');
      expect(Element.WATER).toBe('water');
      expect(Element.AIR).toBe('air');
      expect(Element.EARTH).toBe('earth');
      expect(Element.SPIRIT).toBe('spirit');
    });
  });

  describe('CardKeywords interface', () => {
    it('should accept valid keywords object', () => {
      const keywords: CardKeywords = {
        upright: ['Amor', 'Intuición', 'Creatividad'],
        reversed: ['Bloqueo', 'Represión'],
      };

      expect(keywords.upright).toHaveLength(3);
      expect(keywords.reversed).toHaveLength(2);
    });

    it('should accept empty keyword arrays', () => {
      const keywords: CardKeywords = {
        upright: [],
        reversed: [],
      };

      expect(keywords.upright).toHaveLength(0);
      expect(keywords.reversed).toHaveLength(0);
    });
  });

  describe('CardSummary interface', () => {
    it('should accept valid card summary for major arcana', () => {
      const card: CardSummary = {
        id: 1,
        slug: 'the-fool',
        nameEs: 'El Loco',
        arcanaType: ArcanaType.MAJOR,
        number: 0,
        suit: null,
        thumbnailUrl: '/images/tarot/major/00-the-fool.jpg',
      };

      expect(card.id).toBe(1);
      expect(card.slug).toBe('the-fool');
      expect(card.arcanaType).toBe(ArcanaType.MAJOR);
      expect(card.suit).toBeNull();
    });

    it('should accept valid card summary for minor arcana', () => {
      const card: CardSummary = {
        id: 23,
        slug: 'ace-of-cups',
        nameEs: 'As de Copas',
        arcanaType: ArcanaType.MINOR,
        number: 1,
        suit: Suit.CUPS,
        thumbnailUrl: '/images/tarot/cups/01-ace-of-cups.jpg',
      };

      expect(card.suit).toBe(Suit.CUPS);
      expect(card.arcanaType).toBe(ArcanaType.MINOR);
    });

    it('should have numeric id (not string)', () => {
      const card: CardSummary = {
        id: 42,
        slug: 'the-world',
        nameEs: 'El Mundo',
        arcanaType: ArcanaType.MAJOR,
        number: 21,
        suit: null,
        thumbnailUrl: '/images/tarot/major/21-the-world.jpg',
      };

      expect(typeof card.id).toBe('number');
    });
  });

  describe('CardDetail interface', () => {
    it('should extend CardSummary with additional fields', () => {
      const card: CardDetail = {
        id: 1,
        slug: 'the-fool',
        nameEs: 'El Loco',
        nameEn: 'The Fool',
        arcanaType: ArcanaType.MAJOR,
        number: 0,
        suit: null,
        thumbnailUrl: '/images/tarot/major/00-the-fool.jpg',
        romanNumeral: '0',
        courtRank: null,
        element: Element.AIR,
        meaningUpright: 'Nuevos comienzos e inocencia',
        meaningReversed: 'Imprudencia y decisiones precipitadas',
        description: 'Un joven al borde de un precipicio',
        keywords: {
          upright: ['Nuevos comienzos', 'Inocencia'],
          reversed: ['Imprudencia', 'Ingenuidad'],
        },
        imageUrl: '/images/tarot/major/00-the-fool.jpg',
        relatedCards: [2, 3],
      };

      expect(card.nameEn).toBe('The Fool');
      expect(card.element).toBe(Element.AIR);
      expect(card.meaningUpright).toBeDefined();
      expect(card.meaningReversed).toBeDefined();
      expect(card.relatedCards).toHaveLength(2);
    });

    it('should accept null for optional fields', () => {
      const card: CardDetail = {
        id: 22,
        slug: 'ace-of-wands',
        nameEs: 'As de Bastos',
        nameEn: 'Ace of Wands',
        arcanaType: ArcanaType.MINOR,
        number: 1,
        suit: Suit.WANDS,
        thumbnailUrl: '/images/tarot/wands/01-ace-of-wands.jpg',
        romanNumeral: null,
        courtRank: null,
        element: Element.FIRE,
        meaningUpright: 'Creatividad y nuevos proyectos',
        meaningReversed: 'Bloqueo creativo',
        description: null,
        keywords: {
          upright: ['Creatividad'],
          reversed: ['Bloqueo'],
        },
        imageUrl: '/images/tarot/wands/01-ace-of-wands.jpg',
        relatedCards: null,
      };

      expect(card.romanNumeral).toBeNull();
      expect(card.description).toBeNull();
      expect(card.relatedCards).toBeNull();
    });

    it('should accept court card with courtRank', () => {
      const card: CardDetail = {
        id: 57,
        slug: 'queen-of-swords',
        nameEs: 'Reina de Espadas',
        nameEn: 'Queen of Swords',
        arcanaType: ArcanaType.MINOR,
        number: 13,
        suit: Suit.SWORDS,
        thumbnailUrl: '/images/tarot/swords/13-queen-of-swords.jpg',
        romanNumeral: null,
        courtRank: CourtRank.QUEEN,
        element: Element.AIR,
        meaningUpright: 'Claridad mental y comunicación directa',
        meaningReversed: 'Frialdad emocional',
        description: 'Una reina sentada en su trono',
        keywords: {
          upright: ['Claridad', 'Comunicación'],
          reversed: ['Frialdad', 'Aislamiento'],
        },
        imageUrl: '/images/tarot/swords/13-queen-of-swords.jpg',
        relatedCards: null,
      };

      expect(card.courtRank).toBe(CourtRank.QUEEN);
    });
  });

  describe('CardNavigation interface', () => {
    it('should accept navigation with both previous and next', () => {
      const prevCard: CardSummary = {
        id: 1,
        slug: 'the-fool',
        nameEs: 'El Loco',
        arcanaType: ArcanaType.MAJOR,
        number: 0,
        suit: null,
        thumbnailUrl: '/images/tarot/major/00-the-fool.jpg',
      };
      const nextCard: CardSummary = {
        id: 3,
        slug: 'the-high-priestess',
        nameEs: 'La Sacerdotisa',
        arcanaType: ArcanaType.MAJOR,
        number: 2,
        suit: null,
        thumbnailUrl: '/images/tarot/major/02-the-high-priestess.jpg',
      };

      const nav: CardNavigation = {
        previous: prevCard,
        next: nextCard,
      };

      expect(nav.previous?.slug).toBe('the-fool');
      expect(nav.next?.slug).toBe('the-high-priestess');
    });

    it('should accept null for previous and next', () => {
      const nav: CardNavigation = {
        previous: null,
        next: null,
      };

      expect(nav.previous).toBeNull();
      expect(nav.next).toBeNull();
    });
  });

  describe('CardFilters interface', () => {
    it('should accept empty filters', () => {
      const filters: CardFilters = {};
      expect(filters).toBeDefined();
    });

    it('should accept partial filters', () => {
      const filters: CardFilters = {
        arcanaType: ArcanaType.MAJOR,
      };

      expect(filters.arcanaType).toBe(ArcanaType.MAJOR);
    });

    it('should accept all filters', () => {
      const filters: CardFilters = {
        arcanaType: ArcanaType.MINOR,
        suit: Suit.CUPS,
        element: Element.WATER,
        search: 'copa',
        courtOnly: true,
      };

      expect(filters.suit).toBe(Suit.CUPS);
      expect(filters.element).toBe(Element.WATER);
      expect(filters.courtOnly).toBe(true);
    });
  });

  describe('SUIT_INFO constant', () => {
    it('should have info for all 4 suits', () => {
      const suits = Object.values(Suit);
      suits.forEach((suit) => {
        expect(SUIT_INFO[suit]).toBeDefined();
      });
    });

    it('should have required fields for each suit', () => {
      const suits = Object.values(Suit);
      suits.forEach((suit) => {
        const info: SuitInfo = SUIT_INFO[suit];
        expect(info.suit).toBe(suit);
        expect(info.nameEs).toBeDefined();
        expect(info.nameEn).toBeDefined();
        expect(info.element).toBeDefined();
        expect(info.symbol).toBeDefined();
        expect(info.color).toBeDefined();
      });
    });

    it('should have correct Spanish names for suits', () => {
      expect(SUIT_INFO[Suit.WANDS].nameEs).toBe('Bastos');
      expect(SUIT_INFO[Suit.CUPS].nameEs).toBe('Copas');
      expect(SUIT_INFO[Suit.SWORDS].nameEs).toBe('Espadas');
      expect(SUIT_INFO[Suit.PENTACLES].nameEs).toBe('Oros');
    });

    it('should have correct elements for suits', () => {
      expect(SUIT_INFO[Suit.WANDS].element).toBe(Element.FIRE);
      expect(SUIT_INFO[Suit.CUPS].element).toBe(Element.WATER);
      expect(SUIT_INFO[Suit.SWORDS].element).toBe(Element.AIR);
      expect(SUIT_INFO[Suit.PENTACLES].element).toBe(Element.EARTH);
    });
  });

  describe('ELEMENT_INFO constant', () => {
    it('should have info for all 5 elements', () => {
      const elements = Object.values(Element);
      elements.forEach((element) => {
        expect(ELEMENT_INFO[element]).toBeDefined();
      });
    });

    it('should have nameEs and color for each element', () => {
      const elements = Object.values(Element);
      elements.forEach((element) => {
        expect(ELEMENT_INFO[element].nameEs).toBeDefined();
        expect(ELEMENT_INFO[element].color).toBeDefined();
      });
    });

    it('should have correct Spanish names for elements', () => {
      expect(ELEMENT_INFO[Element.FIRE].nameEs).toBe('Fuego');
      expect(ELEMENT_INFO[Element.WATER].nameEs).toBe('Agua');
      expect(ELEMENT_INFO[Element.AIR].nameEs).toBe('Aire');
      expect(ELEMENT_INFO[Element.EARTH].nameEs).toBe('Tierra');
      expect(ELEMENT_INFO[Element.SPIRIT].nameEs).toBe('Espíritu');
    });
  });
});
