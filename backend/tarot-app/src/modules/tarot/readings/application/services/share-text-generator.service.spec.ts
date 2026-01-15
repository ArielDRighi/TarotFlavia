import { Test, TestingModule } from '@nestjs/testing';
import { ShareTextGeneratorService } from './share-text-generator.service';
import { TarotReading } from '../../entities/tarot-reading.entity';
import { DailyReading } from '../../../daily-reading/entities/daily-reading.entity';

describe('ShareTextGeneratorService', () => {
  let service: ShareTextGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShareTextGeneratorService],
    }).compile();

    service = module.get<ShareTextGeneratorService>(ShareTextGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateShareText - Daily Reading', () => {
    const mockDailyReading: Partial<DailyReading> = {
      id: 1,
      card: {
        id: 1,
        name: 'El Sol',
        meaningUpright:
          'Éxito, vitalidad, alegría. La carta del Sol representa un periodo de claridad y optimismo. Tus esfuerzos están siendo recompensados y experimentas una sensación de logro y satisfacción.',
        meaningReversed:
          'Desilusión temporal, pérdida de confianza. La energía del Sol está bloqueada momentáneamente.',
      } as any,
      isReversed: false,
      interpretation:
        'Tu energía está en su punto más alto. Este es el momento perfecto para avanzar en ese proyecto que has estado postergando. La claridad mental que experimentas hoy te permite ver oportunidades que antes pasaban desapercibidas. Aprovecha esta vibración positiva.',
    };

    it('should generate share text for ANONYMOUS user with daily reading', () => {
      const result = service.generateShareText(
        mockDailyReading as DailyReading,
        'anonymous',
        'daily',
      );

      expect(result).toContain('🌟 Carta del Día en Auguria');
      expect(result).toContain('🃏 El Sol');
      expect(result).toContain('Éxito, vitalidad, alegría');
      expect(result).toContain('✨ Regístrate gratis');
      expect(result).toContain('auguriatarot.com');
      expect(result).not.toContain('💭 Interpretación personalizada');
      expect(result).not.toContain('IA');
    });

    it('should generate share text for FREE user with daily reading', () => {
      const result = service.generateShareText(
        mockDailyReading as DailyReading,
        'free',
        'daily',
      );

      expect(result).toContain('🌟 Carta del Día en Auguria');
      expect(result).toContain('🃏 El Sol');
      expect(result).toContain('Éxito, vitalidad, alegría');
      expect(result).toContain('✨ Descubre más lecturas');
      expect(result).toContain('auguriatarot.com');
      expect(result).not.toContain('💭 Interpretación personalizada');
      expect(result).not.toContain('IA');
    });

    it('should generate share text for PREMIUM user with daily reading', () => {
      const result = service.generateShareText(
        mockDailyReading as DailyReading,
        'premium',
        'daily',
      );

      expect(result).toContain('🌟 Mi Carta del Día en Auguria ✨');
      expect(result).toContain('🃏 El Sol');
      expect(result).toContain('💭 Interpretación personalizada:');
      expect(result).toContain('Tu energía está en su punto más alto');
      expect(result).toContain('✨ Obtén interpretaciones personalizadas');
      expect(result).toContain('auguriatarot.com');
      expect(result).not.toContain('IA');
    });

    it('should handle reversed daily card for ANONYMOUS user', () => {
      const reversedReading: Partial<DailyReading> = {
        ...mockDailyReading,
        isReversed: true,
      };

      const result = service.generateShareText(
        reversedReading as DailyReading,
        'anonymous',
        'daily',
      );

      expect(result).toContain('🃏 El Sol (Invertida)');
      expect(result).toContain('Desilusión temporal');
    });
  });

  describe('generateShareText - Tarot Reading', () => {
    const mockTarotReading: Partial<TarotReading> = {
      id: 1,
      customQuestion: '¿Qué debo saber sobre mi amor?',
      cards: [
        {
          id: 1,
          name: 'El Mago',
          meaningUpright: 'Potencial y nuevos comienzos',
          meaningReversed: 'Bloqueos creativos',
        } as any,
        {
          id: 2,
          name: 'La Luna',
          meaningUpright: 'Intuición y misterio',
          meaningReversed: 'Confusión que se disipa',
        } as any,
        {
          id: 3,
          name: 'El Sol',
          meaningUpright: 'Éxito y claridad',
          meaningReversed: 'Optimismo forzado',
        } as any,
      ],
      cardPositions: [
        { cardId: 1, position: 'Pasado', isReversed: false },
        { cardId: 2, position: 'Presente', isReversed: true },
        { cardId: 3, position: 'Futuro', isReversed: false },
      ],
      interpretation:
        'Tu pasado amoroso muestra un periodo de gran potencial donde tenías el poder de crear la relación que deseabas. El presente revela que las confusiones están comenzando a disiparse, la niebla emocional se aclara. El futuro promete un periodo luminoso donde el amor florecerá con autenticidad.',
    };

    it('should generate share text for FREE user with tarot reading', () => {
      const result = service.generateShareText(
        mockTarotReading as TarotReading,
        'free',
        'tarot',
      );

      expect(result).toContain('🌟 Mi Lectura de Tarot en Auguria');
      expect(result).toContain('❓ ¿Qué debo saber sobre mi amor?');
      expect(result).toContain('🃏 El Mago, La Luna ↓, El Sol');
      expect(result).toContain('Pasado:');
      expect(result).toContain('Potencial y nuevos comienzos');
      expect(result).toContain('✨ Descubre más lecturas');
      expect(result).toContain('auguriatarot.com');
      expect(result).not.toContain('💭 Interpretación personalizada');
    });

    it('should generate share text for PREMIUM user with tarot reading', () => {
      const result = service.generateShareText(
        mockTarotReading as TarotReading,
        'premium',
        'tarot',
      );

      expect(result).toContain('✨ Mi Lectura de Tarot en Auguria');
      expect(result).toContain('❓ ¿Qué debo saber sobre mi amor?');
      expect(result).toContain('🃏 El Mago, La Luna ↓, El Sol');
      expect(result).toContain('💭 Interpretación personalizada:');
      expect(result).toContain('Tu pasado amoroso muestra un periodo');
      expect(result).toContain('✨ Obtén interpretaciones personalizadas');
      expect(result).toContain('auguriatarot.com');
      expect(result).not.toContain('IA');
    });

    it('should use predefined question when customQuestion is null', () => {
      const readingWithPredefined: Partial<TarotReading> = {
        ...mockTarotReading,
        customQuestion: undefined,
        question: '¿Qué me depara el futuro?',
      };

      const result = service.generateShareText(
        readingWithPredefined as TarotReading,
        'free',
        'tarot',
      );

      expect(result).toContain('❓ ¿Qué me depara el futuro?');
    });

    it('should use default question when both questions are undefined', () => {
      const readingNoQuestion: Partial<TarotReading> = {
        ...mockTarotReading,
        customQuestion: undefined,
        question: undefined,
      };

      const result = service.generateShareText(
        readingNoQuestion as TarotReading,
        'free',
        'tarot',
      );

      expect(result).toContain('❓ Lectura general');
    });
  });

  describe('CTA differentiation', () => {
    const mockDailyReading: Partial<DailyReading> = {
      card: {
        id: 1,
        name: 'El Loco',
        meaningUpright: 'Nuevos comienzos',
      } as any,
      isReversed: false,
    };

    it('should include "Regístrate gratis" CTA for ANONYMOUS users', () => {
      const result = service.generateShareText(
        mockDailyReading as DailyReading,
        'anonymous',
        'daily',
      );

      expect(result).toContain('Regístrate gratis');
      expect(result).not.toContain('Descubre más lecturas');
    });

    it('should include "Descubre más" CTA for FREE users', () => {
      const result = service.generateShareText(
        mockDailyReading as DailyReading,
        'free',
        'daily',
      );

      expect(result).toContain('Descubre más lecturas');
      expect(result).not.toContain('Regístrate gratis');
    });

    it('should include "interpretaciones personalizadas" CTA for PREMIUM users', () => {
      const mockPremiumReading: Partial<DailyReading> = {
        ...mockDailyReading,
        interpretation: 'Interpretación personalizada',
      };

      const result = service.generateShareText(
        mockPremiumReading as DailyReading,
        'premium',
        'daily',
      );

      expect(result).toContain('interpretaciones personalizadas');
    });
  });

  describe('Text formatting', () => {
    it('should include visual separators', () => {
      const mockReading: Partial<DailyReading> = {
        card: { id: 1, name: 'Test', meaningUpright: 'Test meaning' } as any,
        isReversed: false,
      };

      const result = service.generateShareText(
        mockReading as DailyReading,
        'free',
        'daily',
      );

      expect(result).toContain('━━━━━━━━━━━━━━━━━━');
    });

    it('should truncate long interpretations to ~200 characters', () => {
      const longInterpretation = 'A'.repeat(300);
      const mockReading: Partial<DailyReading> = {
        card: { id: 1, name: 'Test', meaningUpright: 'Test' } as any,
        isReversed: false,
        interpretation: longInterpretation,
      };

      const result = service.generateShareText(
        mockReading as DailyReading,
        'premium',
        'daily',
      );

      const interpretationPart = result.match(/"([^"]+)"/)?.[1] || '';
      expect(interpretationPart.length).toBeLessThanOrEqual(210);
      expect(result).toContain('...');
    });
  });
});
