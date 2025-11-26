import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateTarotistaDto } from './update-tarotista.dto';

describe('UpdateTarotistaDto', () => {
  it('should validate successfully with partial fields', async () => {
    const dto = plainToInstance(UpdateTarotistaDto, {
      nombrePublico: 'Luna Mística Actualizada',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate successfully with multiple fields', async () => {
    const dto = plainToInstance(UpdateTarotistaDto, {
      nombrePublico: 'Luna Mística',
      biografia: 'Nueva biografía actualizada con más detalles',
      especialidades: ['amor', 'trabajo', 'espiritualidad'],
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when nombrePublico is too short', async () => {
    const dto = plainToInstance(UpdateTarotistaDto, {
      nombrePublico: 'AB',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('nombrePublico');
  });

  it('should fail when biografia is too short', async () => {
    const dto = plainToInstance(UpdateTarotistaDto, {
      biografia: 'Too short',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('biografia');
  });

  it('should fail when especialidades is empty array', async () => {
    const dto = plainToInstance(UpdateTarotistaDto, {
      especialidades: [],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const especialidadesError = errors.find(
      (e) => e.property === 'especialidades',
    );
    expect(especialidadesError).toBeDefined();
  });

  it('should validate successfully with empty object', async () => {
    const dto = plainToInstance(UpdateTarotistaDto, {});

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate fotoPerfil URL format', async () => {
    const dto = plainToInstance(UpdateTarotistaDto, {
      fotoPerfil: 'invalid-url',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('fotoPerfil');
  });
});
