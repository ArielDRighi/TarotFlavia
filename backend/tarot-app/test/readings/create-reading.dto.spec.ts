import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateReadingDto } from '../../src/modules/tarot/readings/dto/create-reading.dto';

describe('CreateReadingDto', () => {
  describe('Validación de preguntas predefinidas vs custom', () => {
    it('debe aceptar predefined_question_id válido', async () => {
      const dto = plainToInstance(CreateReadingDto, {
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'pasado', isReversed: false },
          { cardId: 2, position: 'presente', isReversed: false },
          { cardId: 3, position: 'futuro', isReversed: false },
        ],
        predefinedQuestionId: 5,
        useAI: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('debe aceptar custom_question válida', async () => {
      const dto = plainToInstance(CreateReadingDto, {
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'pasado', isReversed: false },
          { cardId: 2, position: 'presente', isReversed: false },
          { cardId: 3, position: 'futuro', isReversed: false },
        ],
        customQuestion: '¿Cuál es mi propósito en la vida?',
        useAI: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('debe rechazar si ambos campos están presentes', async () => {
      const dto = plainToInstance(CreateReadingDto, {
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'pasado', isReversed: false },
          { cardId: 2, position: 'presente', isReversed: false },
          { cardId: 3, position: 'futuro', isReversed: false },
        ],
        predefinedQuestionId: 5,
        customQuestion: '¿Cuál es mi propósito en la vida?',
        useAI: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const errorMessages = errors.map((e) =>
        Object.values(e.constraints || {}),
      );
      expect(errorMessages.flat()).toContain(
        'Debes proporcionar solo una: pregunta predefinida o pregunta personalizada, no ambas',
      );
    });

    it('debe rechazar si ninguno de los campos está presente cuando useAI es true', async () => {
      const dto = plainToInstance(CreateReadingDto, {
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'pasado', isReversed: false },
          { cardId: 2, position: 'presente', isReversed: false },
          { cardId: 3, position: 'futuro', isReversed: false },
        ],
        useAI: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const errorMessages = errors.map((e) =>
        Object.values(e.constraints || {}),
      );
      expect(errorMessages.flat()).toContain(
        'Debes proporcionar una pregunta predefinida o una pregunta personalizada cuando se solicita interpretación con IA',
      );
    });

    it('debe ACEPTAR si no hay pregunta cuando useAI es false (usuarios FREE)', async () => {
      const dto = plainToInstance(CreateReadingDto, {
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'pasado', isReversed: false },
          { cardId: 2, position: 'presente', isReversed: false },
          { cardId: 3, position: 'futuro', isReversed: false },
        ],
        useAI: false,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('debe ACEPTAR si no hay pregunta cuando useAI es undefined (usuarios FREE)', async () => {
      const dto = plainToInstance(CreateReadingDto, {
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'pasado', isReversed: false },
          { cardId: 2, position: 'presente', isReversed: false },
          { cardId: 3, position: 'futuro', isReversed: false },
        ],
        // useAI no definido
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('debe rechazar predefinedQuestionId si no es un número entero', async () => {
      const dto = plainToInstance(CreateReadingDto, {
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'pasado', isReversed: false },
          { cardId: 2, position: 'presente', isReversed: false },
          { cardId: 3, position: 'futuro', isReversed: false },
        ],
        predefinedQuestionId: 'invalid',
        useAI: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('debe rechazar customQuestion si está vacía', async () => {
      const dto = plainToInstance(CreateReadingDto, {
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'pasado', isReversed: false },
          { cardId: 2, position: 'presente', isReversed: false },
          { cardId: 3, position: 'futuro', isReversed: false },
        ],
        customQuestion: '',
        useAI: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const errorMessages = errors.map((e) =>
        Object.values(e.constraints || {}),
      );
      expect(errorMessages.flat()).toContain(
        'La pregunta personalizada no puede estar vacía',
      );
    });

    it('debe rechazar customQuestion si excede 500 caracteres', async () => {
      const dto = plainToInstance(CreateReadingDto, {
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'pasado', isReversed: false },
          { cardId: 2, position: 'presente', isReversed: false },
          { cardId: 3, position: 'futuro', isReversed: false },
        ],
        customQuestion: 'a'.repeat(501),
        useAI: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const errorMessages = errors.map((e) =>
        Object.values(e.constraints || {}),
      );
      expect(errorMessages.flat()).toContain(
        'La pregunta personalizada no debe exceder los 500 caracteres',
      );
    });
  });

  describe('Campos existentes', () => {
    it('debe validar campos requeridos', async () => {
      const dto = plainToInstance(CreateReadingDto, {
        predefinedQuestionId: 1,
        useAI: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('debe aceptar DTO completo válido con pregunta predefinida', async () => {
      const dto = plainToInstance(CreateReadingDto, {
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'pasado', isReversed: false },
          { cardId: 2, position: 'presente', isReversed: false },
          { cardId: 3, position: 'futuro', isReversed: false },
        ],
        predefinedQuestionId: 3,
        useAI: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  // TASK-005: Campo generateInterpretation eliminado, reemplazado por useAI

  describe('Campo useAI', () => {
    it('debe aceptar useAI como true', async () => {
      const dto = plainToInstance(CreateReadingDto, {
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'pasado', isReversed: false },
          { cardId: 2, position: 'presente', isReversed: false },
          { cardId: 3, position: 'futuro', isReversed: false },
        ],
        predefinedQuestionId: 5,
        useAI: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.useAI).toBe(true);
    });

    it('debe aceptar useAI como false', async () => {
      const dto = plainToInstance(CreateReadingDto, {
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'pasado', isReversed: false },
          { cardId: 2, position: 'presente', isReversed: false },
          { cardId: 3, position: 'futuro', isReversed: false },
        ],
        predefinedQuestionId: 5,
        useAI: false,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.useAI).toBe(false);
    });

    it('debe aceptar useAI como undefined (campo opcional)', async () => {
      const dto = plainToInstance(CreateReadingDto, {
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'pasado', isReversed: false },
          { cardId: 2, position: 'presente', isReversed: false },
          { cardId: 3, position: 'futuro', isReversed: false },
        ],
        predefinedQuestionId: 5,
        // useAI no se proporciona
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.useAI).toBeUndefined();
    });

    it('debe rechazar useAI si no es booleano', async () => {
      const dto = plainToInstance(CreateReadingDto, {
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'pasado', isReversed: false },
          { cardId: 2, position: 'presente', isReversed: false },
          { cardId: 3, position: 'futuro', isReversed: false },
        ],
        predefinedQuestionId: 5,
        useAI: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const errorMessages = errors.map((e) =>
        Object.values(e.constraints || {}),
      );
      expect(errorMessages.flat().some((msg) => msg.includes('boolean'))).toBe(
        true,
      );
    });
  });
});
