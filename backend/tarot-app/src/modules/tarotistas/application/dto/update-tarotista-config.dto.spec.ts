import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateTarotistaConfigDto } from './update-tarotista-config.dto';

describe('UpdateTarotistaConfigDto', () => {
  it('should validate successfully with all fields', async () => {
    const dto = plainToInstance(UpdateTarotistaConfigDto, {
      systemPrompt: 'Eres Luna, una tarotista especializada...',
      temperature: 0.7,
      maxTokens: 500,
      topP: 0.9,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate successfully with partial fields', async () => {
    const dto = plainToInstance(UpdateTarotistaConfigDto, {
      systemPrompt: 'Nuevo prompt personalizado para lecturas',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when temperature is out of range', async () => {
    const dto = plainToInstance(UpdateTarotistaConfigDto, {
      temperature: 1.5,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('temperature');
  });

  it('should fail when maxTokens is too low', async () => {
    const dto = plainToInstance(UpdateTarotistaConfigDto, {
      maxTokens: 50,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('maxTokens');
  });

  it('should fail when topP is out of range', async () => {
    const dto = plainToInstance(UpdateTarotistaConfigDto, {
      topP: 1.5,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('topP');
  });

  it('should accept optional styleConfig', async () => {
    const dto = plainToInstance(UpdateTarotistaConfigDto, {
      systemPrompt: 'System prompt test with sufficient length for validation',
      styleConfig: {
        tono: 'empático',
        longitud: 'detallada',
      },
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
