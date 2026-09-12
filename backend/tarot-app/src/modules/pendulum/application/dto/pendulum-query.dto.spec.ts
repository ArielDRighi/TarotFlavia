import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PendulumQueryDto } from './pendulum-query.dto';

/**
 * TASK-515: el frontend manda `fingerprint` en el body para que el guard
 * registre el consumo anónimo bajo el mismo fingerprint que usa
 * GET /users/capabilities. Con `forbidNonWhitelisted: true` global, el DTO
 * debe declararlo o la consulta falla con 400 (después de que el guard ya
 * consumió la consulta gratuita).
 */
describe('PendulumQueryDto', () => {
  const VALID_FINGERPRINT = 'a'.repeat(64);

  it('acepta un body vacío', async () => {
    const dto = plainToInstance(PendulumQueryDto, {});
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect(errors).toHaveLength(0);
  });

  it('acepta fingerprint hexadecimal de 64 caracteres junto con la pregunta', async () => {
    const dto = plainToInstance(PendulumQueryDto, {
      question: '¿Debo aceptar este trabajo?',
      fingerprint: VALID_FINGERPRINT,
    });
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect(errors).toHaveLength(0);
    expect(dto.fingerprint).toBe(VALID_FINGERPRINT);
  });

  it('acepta el fingerprint de fallback (~44 hex) del navegador sin crypto.subtle', async () => {
    const dto = plainToInstance(PendulumQueryDto, {
      fingerprint: 'f'.repeat(32) + '0'.repeat(12),
    });
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect(errors).toHaveLength(0);
  });

  it('rechaza un fingerprint que no es hexadecimal', async () => {
    const dto = plainToInstance(PendulumQueryDto, {
      fingerprint: 'Z'.repeat(64),
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('fingerprint');
  });

  it('rechaza un fingerprint demasiado corto', async () => {
    const dto = plainToInstance(PendulumQueryDto, {
      fingerprint: 'abc',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('fingerprint');
  });

  it('sigue rechazando preguntas de más de 500 caracteres', async () => {
    const dto = plainToInstance(PendulumQueryDto, {
      question: 'a'.repeat(501),
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('question');
  });
});
