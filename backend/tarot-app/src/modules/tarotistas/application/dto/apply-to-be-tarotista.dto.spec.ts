import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ApplyToBeTarotistaDto } from './apply-to-be-tarotista.dto';

describe('ApplyToBeTarotistaDto', () => {
  it('should validate successfully with all required fields', async () => {
    const dto = plainToInstance(ApplyToBeTarotistaDto, {
      nombrePublico: 'Luna Mística',
      biografia: 'Tarotista con 15 años de experiencia en lecturas de amor',
      especialidades: ['amor', 'trabajo'],
      motivacion: 'Deseo compartir mi don con personas que buscan guía',
      experiencia: 'He realizado más de 1000 lecturas en los últimos 10 años',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when nombrePublico is too short', async () => {
    const dto = plainToInstance(ApplyToBeTarotistaDto, {
      nombrePublico: 'AB',
      biografia: 'Tarotista con experiencia en lecturas profesionales',
      especialidades: ['amor'],
      motivacion: 'Deseo compartir mi don',
      experiencia: 'Tengo experiencia significativa',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('nombrePublico');
  });

  it('should fail when biografia is too short', async () => {
    const dto = plainToInstance(ApplyToBeTarotistaDto, {
      nombrePublico: 'Luna Mística',
      biografia: 'Short bio',
      especialidades: ['amor'],
      motivacion: 'Deseo compartir mi don con personas',
      experiencia: 'Tengo experiencia significativa',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const bioError = errors.find((e) => e.property === 'biografia');
    expect(bioError).toBeDefined();
  });

  it('should fail when especialidades is empty', async () => {
    const dto = plainToInstance(ApplyToBeTarotistaDto, {
      nombrePublico: 'Luna Mística',
      biografia: 'Tarotista con experiencia en lecturas profesionales',
      especialidades: [],
      motivacion: 'Deseo compartir mi don',
      experiencia: 'Tengo experiencia significativa',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const especialidadesError = errors.find(
      (e) => e.property === 'especialidades',
    );
    expect(especialidadesError).toBeDefined();
  });

  it('should fail when motivacion is too short', async () => {
    const dto = plainToInstance(ApplyToBeTarotistaDto, {
      nombrePublico: 'Luna Mística',
      biografia: 'Tarotista con experiencia en lecturas profesionales',
      especialidades: ['amor'],
      motivacion: 'Short',
      experiencia: 'Tengo experiencia significativa en lecturas',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const motivacionError = errors.find((e) => e.property === 'motivacion');
    expect(motivacionError).toBeDefined();
  });

  it('should fail when experiencia is too short', async () => {
    const dto = plainToInstance(ApplyToBeTarotistaDto, {
      nombrePublico: 'Luna Mística',
      biografia: 'Tarotista con experiencia en lecturas profesionales',
      especialidades: ['amor'],
      motivacion: 'Deseo compartir mi don con personas',
      experiencia: 'Short',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const experienciaError = errors.find((e) => e.property === 'experiencia');
    expect(experienciaError).toBeDefined();
  });
});
