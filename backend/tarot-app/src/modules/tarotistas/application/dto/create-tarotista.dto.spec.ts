import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTarotistaDto } from './create-tarotista.dto';

describe('CreateTarotistaDto', () => {
  it('should validate successfully with all required fields', async () => {
    const dto = plainToInstance(CreateTarotistaDto, {
      userId: 1,
      nombrePublico: 'Luna Mística',
      biografia: 'Tarotista con 15 años de experiencia especializada en amor',
      especialidades: ['amor', 'trabajo'],
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when userId is missing', async () => {
    const dto = plainToInstance(CreateTarotistaDto, {
      nombrePublico: 'Luna Mística',
      biografia: 'Bio test',
      especialidades: ['amor'],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('userId');
  });

  it('should fail validation when nombrePublico is too short', async () => {
    const dto = plainToInstance(CreateTarotistaDto, {
      userId: 1,
      nombrePublico: 'AB',
      biografia: 'Bio test with sufficient length to pass validation',
      especialidades: ['amor'],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const nombreError = errors.find((e) => e.property === 'nombrePublico');
    expect(nombreError).toBeDefined();
  });

  it('should fail validation when biografia is too short', async () => {
    const dto = plainToInstance(CreateTarotistaDto, {
      userId: 1,
      nombrePublico: 'Luna Mística',
      biografia: 'Too short',
      especialidades: ['amor'],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const bioError = errors.find((e) => e.property === 'biografia');
    expect(bioError).toBeDefined();
  });

  it('should fail validation when especialidades is empty array', async () => {
    const dto = plainToInstance(CreateTarotistaDto, {
      userId: 1,
      nombrePublico: 'Luna Mística',
      biografia: 'Tarotista con experiencia en lecturas de amor y trabajo',
      especialidades: [],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const especialidadesError = errors.find(
      (e) => e.property === 'especialidades',
    );
    expect(especialidadesError).toBeDefined();
  });

  it('should accept optional fields when provided', async () => {
    const dto = plainToInstance(CreateTarotistaDto, {
      userId: 1,
      nombrePublico: 'Luna Mística',
      biografia: 'Tarotista con experiencia en lecturas de amor y trabajo',
      especialidades: ['amor'],
      fotoPerfil: 'https://example.com/photo.jpg',
      systemPromptIdentity: 'Soy Luna, una tarotista...',
      systemPromptGuidelines: 'Mis lecturas se enfocan en...',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
