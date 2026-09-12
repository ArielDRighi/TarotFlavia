import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YMYL_LANGUAGE_RULES } from './ymyl-language.prompt';
import { HOROSCOPE_SYSTEM_PROMPT } from '../../modules/horoscope/application/prompts/horoscope.prompts';
import { CHINESE_HOROSCOPE_SYSTEM_PROMPT } from '../../modules/horoscope/application/prompts/chinese-horoscope.prompts';
import { TarotPrompts } from '../../modules/ai/application/prompts/tarot-prompts';
import { NUMEROLOGY_SYSTEM_PROMPT } from '../../modules/numerology/prompts/numerology-interpretation.prompt';
import { flaviaIAConfigData } from '../../database/seeds/data/flavia-ia-config.data';
import { PromptBuilderService } from '../../modules/ai/application/services/prompt-builder.service';
import { TarotistaConfig } from '../../modules/tarotistas/entities/tarotista-config.entity';
import { TarotCard } from '../../modules/tarot/cards/entities/tarot-card.entity';
import { TarotistaCardMeaning } from '../../modules/tarotistas/entities/tarotista-card-meaning.entity';
import { Tarotista } from '../../modules/tarotistas/entities/tarotista.entity';

/**
 * T-SEO-018 — criterio de aceptación: "Prompts de IA (horóscopo, lecturas) con
 * la instrucción explícita de no usar lenguaje determinista ni de salud".
 *
 * Cada generador de texto del sitio tiene que llevar `YMYL_LANGUAGE_RULES`
 * completo. Se verifica el bloque entero (y no una frase) para que nadie lo
 * recorte a mano en un prompt y deje ese generador sin cobertura.
 *
 * El sexto generador —la síntesis de carta natal— arma su prompt de sistema en
 * un método privado y necesita el `AIProviderService` mockeado: su caso vive en
 * `chart-ai-synthesis.service.spec.ts`, junto a los mocks que ya existen.
 */
describe('Cobertura de YMYL_LANGUAGE_RULES en los prompts de IA (T-SEO-018)', () => {
  it('horóscopo diario (occidental)', () => {
    expect(HOROSCOPE_SYSTEM_PROMPT).toContain(YMYL_LANGUAGE_RULES);
  });

  it('horóscopo chino anual', () => {
    expect(CHINESE_HOROSCOPE_SYSTEM_PROMPT).toContain(YMYL_LANGUAGE_RULES);
  });

  it('lecturas de tarot: prompt de sistema estático y seed de la configuración de Flavia', () => {
    expect(TarotPrompts.getSystemPrompt()).toContain(YMYL_LANGUAGE_RULES);
    expect(flaviaIAConfigData.systemPrompt).toContain(YMYL_LANGUAGE_RULES);
  });

  it('carta del día', () => {
    expect(TarotPrompts.getDailyCardSystemPrompt('Flavia')).toContain(
      YMYL_LANGUAGE_RULES,
    );
  });

  it('numerología', () => {
    expect(NUMEROLOGY_SYSTEM_PROMPT).toContain(YMYL_LANGUAGE_RULES);
  });

  /**
   * El prompt de sistema de las lecturas viene de la base (la tarotista lo
   * edita), así que puede ser viejo o estar recortado. La regla tiene que
   * viajar igual: va en las instrucciones finales que arma el servicio.
   */
  it('lecturas de tarot: instrucciones finales aunque la configuración guardada no la traiga', async () => {
    const configVieja = {
      id: 1,
      tarotistaId: 1,
      isActive: true,
      systemPrompt: 'Eres una tarotista. Responde en markdown.',
      temperature: '0.7',
      maxTokens: 1000,
      topP: '0.9',
    } as unknown as TarotistaConfig;
    const carta = {
      id: 10,
      name: 'El Sol',
      meaningUpright: 'Alegría',
      meaningReversed: 'Nubes',
      keywords: 'alegría, claridad',
    } as TarotCard;

    const mockConfigRepo: jest.Mocked<
      Pick<Repository<TarotistaConfig>, 'findOne'>
    > = {
      findOne: jest.fn().mockResolvedValue(configVieja),
    };
    const mockCardRepo: jest.Mocked<Pick<Repository<TarotCard>, 'find'>> = {
      find: jest.fn().mockResolvedValue([carta]),
    };
    const mockMeaningRepo: jest.Mocked<
      Pick<Repository<TarotistaCardMeaning>, 'find'>
    > = {
      find: jest.fn().mockResolvedValue([]),
    };
    const mockTarotistaRepo: jest.Mocked<
      Pick<Repository<Tarotista>, 'findOne'>
    > = {
      findOne: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        PromptBuilderService,
        {
          provide: getRepositoryToken(TarotistaConfig),
          useValue: mockConfigRepo,
        },
        { provide: getRepositoryToken(TarotCard), useValue: mockCardRepo },
        {
          provide: getRepositoryToken(TarotistaCardMeaning),
          useValue: mockMeaningRepo,
        },
        { provide: getRepositoryToken(Tarotista), useValue: mockTarotistaRepo },
      ],
    }).compile();
    const service = module.get(PromptBuilderService);

    const prompt = await service.buildInterpretationPrompt(
      1,
      [{ cardId: 10, position: 'Presente', isReversed: false }],
      '¿Qué energía me acompaña hoy?',
      'general',
    );

    expect(prompt.systemPrompt).not.toContain(YMYL_LANGUAGE_RULES);
    expect(prompt.userPrompt).toContain(YMYL_LANGUAGE_RULES);
  });
});
