import {
  ArcanaType,
  CourtRank,
  Element,
  Planet,
  Suit,
  ZodiacAssociation,
} from '../enums/tarot.enums';
import { EncyclopediaTarotCard } from './encyclopedia-tarot-card.entity';

describe('EncyclopediaTarotCard Entity', () => {
  let card: EncyclopediaTarotCard;

  beforeEach(() => {
    card = new EncyclopediaTarotCard();
    card.id = 1;
    card.slug = 'the-fool';
    card.nameEn = 'The Fool';
    card.nameEs = 'El Loco';
    card.arcanaType = ArcanaType.MAJOR;
    card.number = 0;
    card.romanNumeral = '0';
    card.suit = null;
    card.courtRank = null;
    card.element = Element.AIR;
    card.planet = Planet.URANUS;
    card.zodiacSign = null;
    card.meaningUpright =
      'Nuevos comienzos, inocencia y espíritu libre. El Loco representa el potencial ilimitado.';
    card.meaningReversed =
      'Imprudencia, decisiones precipitadas y falta de dirección.';
    card.description =
      'Un joven está al borde de un precipicio mirando al cielo.';
    card.keywords = {
      upright: ['Nuevos comienzos', 'Inocencia', 'Aventura'],
      reversed: ['Imprudencia', 'Ingenuidad', 'Miedo'],
    };
    card.imageUrl = '/images/tarot/major/00-the-fool.jpg';
    card.thumbnailUrl = '/images/tarot/major/00-the-fool-thumb.jpg';
    card.relatedCards = null;
    card.viewCount = 0;
    card.createdAt = new Date('2026-01-01');
    card.updatedAt = new Date('2026-01-01');
  });

  describe('Estructura de la entidad', () => {
    it('debería tener todas las propiedades requeridas', () => {
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('slug');
      expect(card).toHaveProperty('nameEn');
      expect(card).toHaveProperty('nameEs');
      expect(card).toHaveProperty('arcanaType');
      expect(card).toHaveProperty('number');
      expect(card).toHaveProperty('romanNumeral');
      expect(card).toHaveProperty('suit');
      expect(card).toHaveProperty('courtRank');
      expect(card).toHaveProperty('element');
      expect(card).toHaveProperty('planet');
      expect(card).toHaveProperty('zodiacSign');
      expect(card).toHaveProperty('meaningUpright');
      expect(card).toHaveProperty('meaningReversed');
      expect(card).toHaveProperty('description');
      expect(card).toHaveProperty('keywords');
      expect(card).toHaveProperty('imageUrl');
      expect(card).toHaveProperty('thumbnailUrl');
      expect(card).toHaveProperty('relatedCards');
      expect(card).toHaveProperty('viewCount');
      expect(card).toHaveProperty('createdAt');
      expect(card).toHaveProperty('updatedAt');
    });

    it('debería tener el ID como número', () => {
      expect(typeof card.id).toBe('number');
      expect(card.id).toBe(1);
    });

    it('debería tener el slug como string único', () => {
      expect(typeof card.slug).toBe('string');
      expect(card.slug).toBe('the-fool');
    });

    it('debería tener nombres en inglés y español', () => {
      expect(card.nameEn).toBe('The Fool');
      expect(card.nameEs).toBe('El Loco');
    });
  });

  describe('Clasificación - Arcanos Mayores', () => {
    it('debería tener arcanaType como MAJOR para El Loco', () => {
      expect(card.arcanaType).toBe(ArcanaType.MAJOR);
    });

    it('debería tener número 0 para El Loco', () => {
      expect(card.number).toBe(0);
    });

    it('debería tener romanNumeral "0" para El Loco', () => {
      expect(card.romanNumeral).toBe('0');
    });

    it('debería tener suit null para Arcanos Mayores', () => {
      expect(card.suit).toBeNull();
    });

    it('debería tener courtRank null para Arcanos Mayores', () => {
      expect(card.courtRank).toBeNull();
    });

    it('debería aceptar el rango numérico 0-21 para Arcanos Mayores', () => {
      for (let i = 0; i <= 21; i++) {
        card.number = i;
        expect(card.number).toBe(i);
      }
    });
  });

  describe('Clasificación - Arcanos Menores', () => {
    let minorCard: EncyclopediaTarotCard;

    beforeEach(() => {
      minorCard = new EncyclopediaTarotCard();
      minorCard.id = 23;
      minorCard.slug = 'ace-of-cups';
      minorCard.nameEn = 'Ace of Cups';
      minorCard.nameEs = 'As de Copas';
      minorCard.arcanaType = ArcanaType.MINOR;
      minorCard.number = 1;
      minorCard.romanNumeral = null;
      minorCard.suit = Suit.CUPS;
      minorCard.courtRank = null;
      minorCard.element = Element.WATER;
      minorCard.planet = null;
      minorCard.zodiacSign = null;
      minorCard.meaningUpright = 'Nuevos comienzos emocionales.';
      minorCard.meaningReversed = 'Bloqueo emocional.';
      minorCard.description = 'Una copa rebosante de amor.';
      minorCard.keywords = {
        upright: ['Amor', 'Emoción'],
        reversed: ['Bloqueo', 'Vacío'],
      };
      minorCard.imageUrl = '/images/tarot/cups/01-ace-of-cups.jpg';
      minorCard.thumbnailUrl = null;
      minorCard.relatedCards = null;
      minorCard.viewCount = 0;
      minorCard.createdAt = new Date('2026-01-01');
      minorCard.updatedAt = new Date('2026-01-01');
    });

    it('debería tener arcanaType como MINOR', () => {
      expect(minorCard.arcanaType).toBe(ArcanaType.MINOR);
    });

    it('debería tener romanNumeral null para Arcanos Menores', () => {
      expect(minorCard.romanNumeral).toBeNull();
    });

    it('debería tener suit asignado para Arcanos Menores', () => {
      expect(minorCard.suit).toBe(Suit.CUPS);
    });

    it('debería aceptar todos los palos válidos', () => {
      minorCard.suit = Suit.WANDS;
      expect(minorCard.suit).toBe(Suit.WANDS);

      minorCard.suit = Suit.CUPS;
      expect(minorCard.suit).toBe(Suit.CUPS);

      minorCard.suit = Suit.SWORDS;
      expect(minorCard.suit).toBe(Suit.SWORDS);

      minorCard.suit = Suit.PENTACLES;
      expect(minorCard.suit).toBe(Suit.PENTACLES);
    });
  });

  describe('Cartas de Corte', () => {
    let courtCard: EncyclopediaTarotCard;

    beforeEach(() => {
      courtCard = new EncyclopediaTarotCard();
      courtCard.id = 36;
      courtCard.slug = 'page-of-cups';
      courtCard.nameEn = 'Page of Cups';
      courtCard.nameEs = 'Paje de Copas';
      courtCard.arcanaType = ArcanaType.MINOR;
      courtCard.number = 11;
      courtCard.romanNumeral = null;
      courtCard.suit = Suit.CUPS;
      courtCard.courtRank = CourtRank.PAGE;
      courtCard.element = Element.WATER;
      courtCard.planet = null;
      courtCard.zodiacSign = null;
      courtCard.meaningUpright = 'Mensajes emocionales.';
      courtCard.meaningReversed = 'Inmadurez emocional.';
      courtCard.description = 'Un joven sostiene una copa.';
      courtCard.keywords = {
        upright: ['Mensajes', 'Creatividad'],
        reversed: ['Inmadurez', 'Decepción'],
      };
      courtCard.imageUrl = '/images/tarot/cups/11-page-of-cups.jpg';
      courtCard.thumbnailUrl = null;
      courtCard.relatedCards = null;
      courtCard.viewCount = 0;
      courtCard.createdAt = new Date('2026-01-01');
      courtCard.updatedAt = new Date('2026-01-01');
    });

    it('debería tener courtRank asignado para cartas de corte', () => {
      expect(courtCard.courtRank).toBe(CourtRank.PAGE);
    });

    it('debería aceptar todos los rangos de corte', () => {
      courtCard.courtRank = CourtRank.PAGE;
      expect(courtCard.courtRank).toBe(CourtRank.PAGE);

      courtCard.courtRank = CourtRank.KNIGHT;
      expect(courtCard.courtRank).toBe(CourtRank.KNIGHT);

      courtCard.courtRank = CourtRank.QUEEN;
      expect(courtCard.courtRank).toBe(CourtRank.QUEEN);

      courtCard.courtRank = CourtRank.KING;
      expect(courtCard.courtRank).toBe(CourtRank.KING);
    });
  });

  describe('Asociaciones esotéricas', () => {
    it('debería aceptar todos los elementos', () => {
      card.element = Element.FIRE;
      expect(card.element).toBe(Element.FIRE);

      card.element = Element.WATER;
      expect(card.element).toBe(Element.WATER);

      card.element = Element.AIR;
      expect(card.element).toBe(Element.AIR);

      card.element = Element.EARTH;
      expect(card.element).toBe(Element.EARTH);

      card.element = Element.SPIRIT;
      expect(card.element).toBe(Element.SPIRIT);
    });

    it('debería aceptar todos los planetas', () => {
      const planets = [
        Planet.SUN,
        Planet.MOON,
        Planet.MERCURY,
        Planet.VENUS,
        Planet.MARS,
        Planet.JUPITER,
        Planet.SATURN,
        Planet.URANUS,
        Planet.NEPTUNE,
        Planet.PLUTO,
      ];

      planets.forEach((planet) => {
        card.planet = planet;
        expect(card.planet).toBe(planet);
      });
    });

    it('debería aceptar todos los signos zodiacales', () => {
      const signs = [
        ZodiacAssociation.ARIES,
        ZodiacAssociation.TAURUS,
        ZodiacAssociation.GEMINI,
        ZodiacAssociation.CANCER,
        ZodiacAssociation.LEO,
        ZodiacAssociation.VIRGO,
        ZodiacAssociation.LIBRA,
        ZodiacAssociation.SCORPIO,
        ZodiacAssociation.SAGITTARIUS,
        ZodiacAssociation.CAPRICORN,
        ZodiacAssociation.AQUARIUS,
        ZodiacAssociation.PISCES,
      ];

      signs.forEach((sign) => {
        card.zodiacSign = sign;
        expect(card.zodiacSign).toBe(sign);
      });
    });

    it('debería permitir element null', () => {
      card.element = null;
      expect(card.element).toBeNull();
    });

    it('debería permitir planet null', () => {
      card.planet = null;
      expect(card.planet).toBeNull();
    });

    it('debería permitir zodiacSign null', () => {
      card.zodiacSign = null;
      expect(card.zodiacSign).toBeNull();
    });
  });

  describe('Keywords JSONB', () => {
    it('debería tener keywords con arrays upright y reversed', () => {
      expect(card.keywords).toHaveProperty('upright');
      expect(card.keywords).toHaveProperty('reversed');
      expect(Array.isArray(card.keywords.upright)).toBe(true);
      expect(Array.isArray(card.keywords.reversed)).toBe(true);
    });

    it('debería tener al menos una keyword upright', () => {
      expect(card.keywords.upright.length).toBeGreaterThan(0);
    });

    it('debería tener al menos una keyword reversed', () => {
      expect(card.keywords.reversed.length).toBeGreaterThan(0);
    });

    it('debería almacenar las keywords correctamente', () => {
      const expectedUpright = ['Nuevos comienzos', 'Inocencia', 'Aventura'];
      const expectedReversed = ['Imprudencia', 'Ingenuidad', 'Miedo'];

      expect(card.keywords.upright).toEqual(expectedUpright);
      expect(card.keywords.reversed).toEqual(expectedReversed);
    });
  });

  describe('Cartas relacionadas', () => {
    it('debería permitir relatedCards null', () => {
      card.relatedCards = null;
      expect(card.relatedCards).toBeNull();
    });

    it('debería almacenar IDs numéricos de cartas relacionadas', () => {
      card.relatedCards = [2, 5, 10];
      expect(card.relatedCards).toEqual([2, 5, 10]);
      expect(card.relatedCards.every((id) => typeof id === 'number')).toBe(
        true,
      );
    });

    it('debería aceptar array vacío de cartas relacionadas', () => {
      card.relatedCards = [];
      expect(card.relatedCards).toEqual([]);
    });
  });

  describe('Imágenes', () => {
    it('debería tener imageUrl como string no vacío', () => {
      expect(typeof card.imageUrl).toBe('string');
      expect(card.imageUrl.length).toBeGreaterThan(0);
    });

    it('debería permitir thumbnailUrl null', () => {
      card.thumbnailUrl = null;
      expect(card.thumbnailUrl).toBeNull();
    });

    it('debería almacenar thumbnailUrl como string', () => {
      card.thumbnailUrl = '/images/tarot/major/00-the-fool-thumb.jpg';
      expect(typeof card.thumbnailUrl).toBe('string');
    });
  });

  describe('Métricas y timestamps', () => {
    it('debería tener viewCount como número', () => {
      expect(typeof card.viewCount).toBe('number');
    });

    it('debería inicializar viewCount en 0', () => {
      const newCard = new EncyclopediaTarotCard();
      newCard.viewCount = 0;
      expect(newCard.viewCount).toBe(0);
    });

    it('debería tener createdAt como Date', () => {
      expect(card.createdAt).toBeInstanceOf(Date);
    });

    it('debería tener updatedAt como Date', () => {
      expect(card.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('isCourtCard helper', () => {
    it('debería retornar true cuando courtRank no es null', () => {
      card.courtRank = CourtRank.QUEEN;
      expect(card.isCourtCard()).toBe(true);
    });

    it('debería retornar false cuando courtRank es null', () => {
      card.courtRank = null;
      expect(card.isCourtCard()).toBe(false);
    });

    it('debería retornar false cuando courtRank es undefined', () => {
      card.courtRank = undefined as unknown as null;
      expect(card.isCourtCard()).toBe(false);
    });
  });

  describe('isMajorArcana helper', () => {
    it('debería retornar true para Arcanos Mayores', () => {
      card.arcanaType = ArcanaType.MAJOR;
      expect(card.isMajorArcana()).toBe(true);
    });

    it('debería retornar false para Arcanos Menores', () => {
      card.arcanaType = ArcanaType.MINOR;
      expect(card.isMajorArcana()).toBe(false);
    });
  });

  describe('getDisplayName helper', () => {
    it('debería retornar el nombre en español por defecto', () => {
      expect(card.getDisplayName()).toBe('El Loco');
    });

    it('debería retornar el nombre en inglés cuando se solicita', () => {
      expect(card.getDisplayName('en')).toBe('The Fool');
    });

    it('debería retornar el nombre en español cuando se solicita explícitamente', () => {
      expect(card.getDisplayName('es')).toBe('El Loco');
    });
  });

  describe('Enums - Valores correctos', () => {
    it('ArcanaType debe tener los valores correctos', () => {
      expect(ArcanaType.MAJOR).toBe('major');
      expect(ArcanaType.MINOR).toBe('minor');
    });

    it('Suit debe tener los 4 palos correctos', () => {
      expect(Suit.WANDS).toBe('wands');
      expect(Suit.CUPS).toBe('cups');
      expect(Suit.SWORDS).toBe('swords');
      expect(Suit.PENTACLES).toBe('pentacles');
    });

    it('CourtRank debe tener los 4 rangos correctos', () => {
      expect(CourtRank.PAGE).toBe('page');
      expect(CourtRank.KNIGHT).toBe('knight');
      expect(CourtRank.QUEEN).toBe('queen');
      expect(CourtRank.KING).toBe('king');
    });

    it('Element debe tener los 5 elementos correctos', () => {
      expect(Element.FIRE).toBe('fire');
      expect(Element.WATER).toBe('water');
      expect(Element.AIR).toBe('air');
      expect(Element.EARTH).toBe('earth');
      expect(Element.SPIRIT).toBe('spirit');
    });

    it('Planet debe tener los 10 planetas correctos', () => {
      expect(Planet.SUN).toBe('sun');
      expect(Planet.MOON).toBe('moon');
      expect(Planet.MERCURY).toBe('mercury');
      expect(Planet.VENUS).toBe('venus');
      expect(Planet.MARS).toBe('mars');
      expect(Planet.JUPITER).toBe('jupiter');
      expect(Planet.SATURN).toBe('saturn');
      expect(Planet.URANUS).toBe('uranus');
      expect(Planet.NEPTUNE).toBe('neptune');
      expect(Planet.PLUTO).toBe('pluto');
    });

    it('ZodiacAssociation debe tener los 12 signos correctos', () => {
      expect(ZodiacAssociation.ARIES).toBe('aries');
      expect(ZodiacAssociation.TAURUS).toBe('taurus');
      expect(ZodiacAssociation.GEMINI).toBe('gemini');
      expect(ZodiacAssociation.CANCER).toBe('cancer');
      expect(ZodiacAssociation.LEO).toBe('leo');
      expect(ZodiacAssociation.VIRGO).toBe('virgo');
      expect(ZodiacAssociation.LIBRA).toBe('libra');
      expect(ZodiacAssociation.SCORPIO).toBe('scorpio');
      expect(ZodiacAssociation.SAGITTARIUS).toBe('sagittarius');
      expect(ZodiacAssociation.CAPRICORN).toBe('capricorn');
      expect(ZodiacAssociation.AQUARIUS).toBe('aquarius');
      expect(ZodiacAssociation.PISCES).toBe('pisces');
    });
  });
});
