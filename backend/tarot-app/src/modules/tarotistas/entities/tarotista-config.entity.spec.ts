import { TarotistaConfig } from './tarotista-config.entity';
import { Tarotista } from './tarotista.entity';

describe('TarotistaConfig Entity', () => {
  describe('creation and validation', () => {
    it('should create a config with required fields', () => {
      const config = new TarotistaConfig();
      config.id = 1;
      config.tarotistaId = 1;
      config.systemPrompt = 'You are a mystical tarot reader...';
      config.version = 1;
      config.isActive = true;

      expect(config.id).toBe(1);
      expect(config.tarotistaId).toBe(1);
      expect(config.systemPrompt).toBe('You are a mystical tarot reader...');
      expect(config.version).toBe(1);
      expect(config.isActive).toBe(true);
    });

    it('should have default values for AI parameters', () => {
      const config = new TarotistaConfig();
      config.tarotistaId = 1;

      expect(config.temperature).toBeUndefined(); // Will be set by default in entity
      expect(config.maxTokens).toBeUndefined();
      expect(config.topP).toBeUndefined();
    });

    it('should store AI generation parameters', () => {
      const config = new TarotistaConfig();
      config.temperature = 0.7;
      config.maxTokens = 1000;
      config.topP = 0.9;

      expect(config.temperature).toBe(0.7);
      expect(config.maxTokens).toBe(1000);
      expect(config.topP).toBe(0.9);
    });

    it('should accept styleConfig as jsonb', () => {
      const config = new TarotistaConfig();
      config.styleConfig = {
        tone: 'mystical',
        language: 'formal',
        cardDescriptionStyle: 'detailed',
      };

      expect(config.styleConfig).toBeDefined();
      expect(config.styleConfig.tone).toBe('mystical');
      expect(config.styleConfig.language).toBe('formal');
      expect(config.styleConfig.cardDescriptionStyle).toBe('detailed');
    });

    it('should accept customKeywords as array', () => {
      const config = new TarotistaConfig();
      config.customKeywords = ['energía', 'camino', 'transformación'];

      expect(Array.isArray(config.customKeywords)).toBe(true);
      expect(config.customKeywords.length).toBe(3);
      expect(config.customKeywords).toContain('energía');
    });

    it('should store additional instructions', () => {
      const config = new TarotistaConfig();
      config.additionalInstructions =
        'Always mention the spiritual aspect of the cards';

      expect(config.additionalInstructions).toBe(
        'Always mention the spiritual aspect of the cards',
      );
    });
  });

  describe('relationships', () => {
    it('should have a tarotista relationship', () => {
      const config = new TarotistaConfig();
      const tarotista = new Tarotista();
      tarotista.id = 1;
      tarotista.nombrePublico = 'Flavia';

      config.tarotista = tarotista;
      config.tarotistaId = tarotista.id;

      expect(config.tarotista).toBeDefined();
      expect(config.tarotistaId).toBe(1);
      expect(config.tarotista.nombrePublico).toBe('Flavia');
    });
  });

  describe('business logic', () => {
    it('should validate temperature range (0-2)', () => {
      const config = new TarotistaConfig();

      // Valid values
      config.temperature = 0;
      expect(config.temperature).toBe(0);

      config.temperature = 1;
      expect(config.temperature).toBe(1);

      config.temperature = 2;
      expect(config.temperature).toBe(2);

      // Note: Actual validation happens at DB level via CHECK constraint
    });

    it('should validate topP range (0-1)', () => {
      const config = new TarotistaConfig();

      // Valid values
      config.topP = 0;
      expect(config.topP).toBe(0);

      config.topP = 0.5;
      expect(config.topP).toBe(0.5);

      config.topP = 1;
      expect(config.topP).toBe(1);

      // Note: Actual validation happens at DB level via CHECK constraint
    });

    it('should track version number', () => {
      const config = new TarotistaConfig();
      config.version = 1;

      expect(config.version).toBe(1);

      config.version = 2;
      expect(config.version).toBe(2);
    });

    it('should track active status', () => {
      const config = new TarotistaConfig();
      config.isActive = true;

      expect(config.isActive).toBe(true);

      config.isActive = false;
      expect(config.isActive).toBe(false);
    });
  });

  describe('versioning', () => {
    it('should support multiple versions per tarotista', () => {
      const tarotista = new Tarotista();
      tarotista.id = 1;

      const configV1 = new TarotistaConfig();
      configV1.tarotistaId = 1;
      configV1.version = 1;
      configV1.isActive = false;

      const configV2 = new TarotistaConfig();
      configV2.tarotistaId = 1;
      configV2.version = 2;
      configV2.isActive = true;

      expect(configV1.version).toBe(1);
      expect(configV1.isActive).toBe(false);
      expect(configV2.version).toBe(2);
      expect(configV2.isActive).toBe(true);
    });
  });

  describe('timestamps', () => {
    it('should have createdAt and updatedAt fields', () => {
      const config = new TarotistaConfig();
      const now = new Date();

      config.createdAt = now;
      config.updatedAt = now;

      expect(config.createdAt).toEqual(now);
      expect(config.updatedAt).toEqual(now);
    });
  });
});
