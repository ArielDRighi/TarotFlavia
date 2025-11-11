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
        generateInterpretation: true,
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
        generateInterpretation: true,
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
        generateInterpretation: true,
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

    it('debe rechazar si ninguno de los campos está presente', async () => {
      const dto = plainToInstance(CreateReadingDto, {
        deckId: 1,
        spreadId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'pasado', isReversed: false },
          { cardId: 2, position: 'presente', isReversed: false },
          { cardId: 3, position: 'futuro', isReversed: false },
        ],
        generateInterpretation: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const errorMessages = errors.map((e) =>
        Object.values(e.constraints || {}),
      );
      expect(errorMessages.flat()).toContain(
        'Debes proporcionar una pregunta predefinida o una pregunta personalizada',
      );
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
        generateInterpretation: true,
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
        generateInterpretation: true,
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
        generateInterpretation: true,
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
        generateInterpretation: true,
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
        generateInterpretation: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
