import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SetCustomMeaningDto } from './set-custom-meaning.dto';

describe('SetCustomMeaningDto', () => {
  it('should validate successfully with cardId and upright meaning', async () => {
    const dto = plainToInstance(SetCustomMeaningDto, {
      cardId: 1,
      customMeaningUpright:
        'Representa un nuevo comienzo lleno de posibilidades infinitas',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when cardId is missing', async () => {
    const dto = plainToInstance(SetCustomMeaningDto, {
      customMeaningUpright: 'Test meaning',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('cardId');
  });

  it('should validate with all optional fields', async () => {
    const dto = plainToInstance(SetCustomMeaningDto, {
      cardId: 1,
      customMeaningUpright: 'Significado derecha',
      customMeaningReversed: 'Significado invertida',
      customKeywords: 'cambio, transformación',
      customDescription: 'Descripción personalizada',
      privateNotes: 'Notas privadas',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when customMeaningUpright is too short', async () => {
    const dto = plainToInstance(SetCustomMeaningDto, {
      cardId: 1,
      customMeaningUpright: 'Short',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const meaningError = errors.find(
      (e) => e.property === 'customMeaningUpright',
    );
    expect(meaningError).toBeDefined();
  });

  it('should validate with only cardId', async () => {
    const dto = plainToInstance(SetCustomMeaningDto, {
      cardId: 1,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
