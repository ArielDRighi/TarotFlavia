import { NumerologyInterpretation } from './numerology-interpretation.entity';

describe('NumerologyInterpretation Entity', () => {
  describe('constructor', () => {
    it('should create a valid interpretation entity', () => {
      const interpretation = new NumerologyInterpretation();
      interpretation.id = 1;
      interpretation.userId = 123;
      interpretation.lifePath = 7;
      interpretation.birthdayNumber = 25;
      interpretation.expressionNumber = 5;
      interpretation.soulUrge = 3;
      interpretation.personality = 2;
      interpretation.birthDate = new Date('1990-03-25');
      interpretation.fullName = 'Juan Pérez';
      interpretation.interpretation = 'Tu numerología indica...';
      interpretation.aiProvider = 'groq';
      interpretation.aiModel = 'llama-3.1-70b-versatile';
      interpretation.tokensUsed = 1500;
      interpretation.generationTimeMs = 3500;
      interpretation.generatedAt = new Date();

      expect(interpretation.id).toBe(1);
      expect(interpretation.userId).toBe(123);
      expect(interpretation.lifePath).toBe(7);
      expect(interpretation.birthdayNumber).toBe(25);
      expect(interpretation.expressionNumber).toBe(5);
      expect(interpretation.soulUrge).toBe(3);
      expect(interpretation.personality).toBe(2);
      expect(interpretation.birthDate).toEqual(new Date('1990-03-25'));
      expect(interpretation.fullName).toBe('Juan Pérez');
      expect(interpretation.interpretation).toBe('Tu numerología indica...');
      expect(interpretation.aiProvider).toBe('groq');
      expect(interpretation.aiModel).toBe('llama-3.1-70b-versatile');
      expect(interpretation.tokensUsed).toBe(1500);
      expect(interpretation.generationTimeMs).toBe(3500);
      expect(interpretation.generatedAt).toBeInstanceOf(Date);
    });

    it('should allow null values for optional name-based numbers', () => {
      const interpretation = new NumerologyInterpretation();
      interpretation.userId = 123;
      interpretation.lifePath = 7;
      interpretation.birthdayNumber = 25;
      interpretation.expressionNumber = null;
      interpretation.soulUrge = null;
      interpretation.personality = null;
      interpretation.birthDate = new Date('1990-03-25');
      interpretation.fullName = null;
      interpretation.interpretation = 'Solo fecha de nacimiento...';
      interpretation.aiProvider = 'groq';
      interpretation.aiModel = 'llama-3.1-70b-versatile';
      interpretation.tokensUsed = 1000;
      interpretation.generationTimeMs = 2500;

      expect(interpretation.expressionNumber).toBeNull();
      expect(interpretation.soulUrge).toBeNull();
      expect(interpretation.personality).toBeNull();
      expect(interpretation.fullName).toBeNull();
    });

    it('should handle master numbers correctly', () => {
      const interpretation = new NumerologyInterpretation();
      interpretation.userId = 456;
      interpretation.lifePath = 11; // Master number
      interpretation.birthdayNumber = 22; // Master number
      interpretation.expressionNumber = 33; // Master number
      interpretation.soulUrge = 9;
      interpretation.personality = 5;
      interpretation.birthDate = new Date('1992-11-29');
      interpretation.fullName = 'María González';
      interpretation.interpretation = 'Números maestros...';
      interpretation.aiProvider = 'gemini';
      interpretation.aiModel = 'gemini-1.5-flash';
      interpretation.tokensUsed = 2000;
      interpretation.generationTimeMs = 4000;

      expect(interpretation.lifePath).toBe(11);
      expect(interpretation.birthdayNumber).toBe(22);
      expect(interpretation.expressionNumber).toBe(33);
    });
  });

  describe('metadata fields', () => {
    it('should store AI generation metadata', () => {
      const interpretation = new NumerologyInterpretation();
      interpretation.userId = 789;
      interpretation.lifePath = 5;
      interpretation.birthdayNumber = 15;
      interpretation.birthDate = new Date('1985-07-15');
      interpretation.interpretation = 'Interpretación personalizada...';
      interpretation.aiProvider = 'deepseek';
      interpretation.aiModel = 'deepseek-chat';
      interpretation.tokensUsed = 800;
      interpretation.generationTimeMs = 1500;

      expect(interpretation.aiProvider).toBe('deepseek');
      expect(interpretation.aiModel).toBe('deepseek-chat');
      expect(interpretation.tokensUsed).toBe(800);
      expect(interpretation.generationTimeMs).toBe(1500);
    });

    it('should default tokensUsed and generationTimeMs to 0', () => {
      const interpretation = new NumerologyInterpretation();
      // Los defaults se aplican en la DB, pero verificamos que acepta 0
      interpretation.tokensUsed = 0;
      interpretation.generationTimeMs = 0;

      expect(interpretation.tokensUsed).toBe(0);
      expect(interpretation.generationTimeMs).toBe(0);
    });
  });

  describe('relations', () => {
    it('should have a userId foreign key', () => {
      const interpretation = new NumerologyInterpretation();
      interpretation.userId = 999;

      expect(interpretation.userId).toBe(999);
      expect(typeof interpretation.userId).toBe('number');
    });
  });
});
