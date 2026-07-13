import { ConfigService } from '@nestjs/config';
import { createMailerOptions } from './mailer.config';

/**
 * Configuración SMTP completa y válida (la forma que tiene en Railway).
 */
const COMPLETE_SMTP: Record<string, string> = {
  SMTP_HOST: 'smtp.resend.com',
  SMTP_PORT: '587',
  SMTP_USER: 'resend',
  SMTP_PASS: 're_test_key',
  EMAIL_FROM: 'noreply@auguriatarot.com',
};

/**
 * ConfigService mockeado: devuelve lo que haya en `env` y `undefined` para el resto,
 * igual que el ConfigService real cuando la variable no está seteada.
 */
function mockConfigService(env: Record<string, string>): ConfigService {
  const configService: Pick<ConfigService, 'get'> = {
    get: jest.fn((key: string) => env[key]),
  } as Pick<ConfigService, 'get'>;

  return configService as ConfigService;
}

describe('createMailerOptions', () => {
  describe('fail-fast en producción (T-PROD-012)', () => {
    it.each(['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'])(
      'lanza al arranque si falta %s en producción (nunca cae a jsonTransport)',
      (missingKey) => {
        const env = { ...COMPLETE_SMTP, NODE_ENV: 'production' };
        delete env[missingKey];

        expect(() => createMailerOptions(mockConfigService(env))).toThrow(
          /SMTP configuration is incomplete/i,
        );
      },
    );

    it('nombra en el error TODAS las variables que faltan', () => {
      const env = {
        NODE_ENV: 'production',
        SMTP_HOST: 'smtp.resend.com',
        SMTP_PORT: '587',
      };

      expect(() => createMailerOptions(mockConfigService(env))).toThrow(
        /SMTP_USER, SMTP_PASS, EMAIL_FROM/,
      );
    });

    it('no lanza en producción cuando la configuración SMTP está completa', () => {
      const env = { ...COMPLETE_SMTP, NODE_ENV: 'production' };

      expect(() => createMailerOptions(mockConfigService(env))).not.toThrow();
    });
  });

  describe('fallback a jsonTransport fuera de producción', () => {
    it.each(['development', 'test'])(
      'en %s con SMTP incompleto devuelve jsonTransport sin lanzar',
      (nodeEnv) => {
        const options = createMailerOptions(
          mockConfigService({ NODE_ENV: nodeEnv }),
        );

        expect(options.transport).toEqual({ jsonTransport: true });
      },
    );

    it('configura el HandlebarsAdapter también en modo jsonTransport (un template roto se detecta en los tests, no en producción)', () => {
      const options = createMailerOptions(
        mockConfigService({ NODE_ENV: 'development' }),
      );

      expect(options.template).toBeDefined();
      expect(options.template?.adapter).toBeDefined();
    });
  });

  describe('transporte real', () => {
    it('arma el transporte con host, puerto y credenciales', () => {
      const options = createMailerOptions(mockConfigService(COMPLETE_SMTP));

      expect(options.transport).toMatchObject({
        host: 'smtp.resend.com',
        port: 587,
        auth: { user: 'resend', pass: 're_test_key' },
      });
    });

    it('usa TLS implícito (secure) solo en el puerto 465', () => {
      const secure = createMailerOptions(
        mockConfigService({ ...COMPLETE_SMTP, SMTP_PORT: '465' }),
      );
      const notSecure = createMailerOptions(mockConfigService(COMPLETE_SMTP));

      expect(secure.transport).toMatchObject({ port: 465, secure: true });
      expect(notSecure.transport).toMatchObject({ port: 587, secure: false });
    });
  });

  describe('replyTo (T-PROD-012)', () => {
    it('usa EMAIL_REPLY_TO cuando está seteado: responder a noreply@ aterriza en el buzón humano', () => {
      const options = createMailerOptions(
        mockConfigService({
          ...COMPLETE_SMTP,
          EMAIL_REPLY_TO: 'consultas@auguriatarot.com',
        }),
      );

      expect(options.defaults).toMatchObject({
        from: 'noreply@auguriatarot.com',
        replyTo: 'consultas@auguriatarot.com',
      });
    });

    it('cae a EMAIL_FROM cuando EMAIL_REPLY_TO no está seteado', () => {
      const options = createMailerOptions(mockConfigService(COMPLETE_SMTP));

      expect(options.defaults).toMatchObject({
        from: 'noreply@auguriatarot.com',
        replyTo: 'noreply@auguriatarot.com',
      });
    });
  });
});
