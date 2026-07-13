import 'reflect-metadata';
import { validate } from './env-validator';

describe('env-validator', () => {
  it('should validate successfully with all required variables', () => {
    const config = {
      POSTGRES_HOST: 'localhost',
      POSTGRES_PORT: '5432',
      POSTGRES_USER: 'user',
      POSTGRES_PASSWORD: 'password',
      POSTGRES_DB: 'database',
      JWT_SECRET: 'a'.repeat(32),
      JWT_EXPIRES_IN: '1h',
      GROQ_API_KEY: 'gsk_test123',
    };

    expect(() => validate(config)).not.toThrow();
  });

  it('should validate successfully with optional email variables', () => {
    const config = {
      POSTGRES_HOST: 'localhost',
      POSTGRES_PORT: '5432',
      POSTGRES_USER: 'user',
      POSTGRES_PASSWORD: 'password',
      POSTGRES_DB: 'database',
      JWT_SECRET: 'a'.repeat(32),
      JWT_EXPIRES_IN: '1h',
      GROQ_API_KEY: 'gsk_test123',
      SMTP_HOST: 'smtp.test.com',
      SMTP_PORT: '587',
      SMTP_USER: 'test@test.com',
      SMTP_PASS: 'testpass',
      EMAIL_FROM: 'noreply@test.com',
    };

    expect(() => validate(config)).not.toThrow();
  });

  it('should throw descriptive error when validation fails', () => {
    const config = {
      POSTGRES_HOST: 'localhost',
      POSTGRES_PORT: '5432',
      POSTGRES_USER: 'user',
      // Missing POSTGRES_PASSWORD
      POSTGRES_DB: 'database',
      JWT_SECRET: 'short', // Too short
      JWT_EXPIRES_IN: '1h',
      GROQ_API_KEY: 'invalid', // Wrong format
    };

    expect(() => validate(config)).toThrow(
      'Environment variable validation failed',
    );
    expect(() => validate(config)).toThrow('POSTGRES_PASSWORD');
    expect(() => validate(config)).toThrow('JWT_SECRET');
    expect(() => validate(config)).toThrow('GROQ_API_KEY');
  });

  it('should apply default values for optional variables', () => {
    const config = {
      POSTGRES_HOST: 'localhost',
      POSTGRES_PORT: '5432',
      POSTGRES_USER: 'user',
      POSTGRES_PASSWORD: 'password',
      POSTGRES_DB: 'database',
      JWT_SECRET: 'a'.repeat(32),
      JWT_EXPIRES_IN: '1h',
      GROQ_API_KEY: 'gsk_test',
    };

    const result = validate(config);

    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe(3000);
    expect(result.CORS_ORIGIN).toBe('http://localhost:3000');
    expect(result.RATE_LIMIT_TTL).toBe(60);
    expect(result.RATE_LIMIT_MAX).toBe(100);
    expect(result.GROQ_MODEL).toBe('llama-3.3-70b-versatile');
    // El frontend corre en 3001; 3000 es el puerto del backend (T-PROD-015)
    expect(result.FRONTEND_URL).toBe('http://localhost:3001');
  });

  it('should preserve custom values for optional variables', () => {
    const config = {
      POSTGRES_HOST: 'localhost',
      POSTGRES_PORT: '5432',
      POSTGRES_USER: 'user',
      POSTGRES_PASSWORD: 'password',
      POSTGRES_DB: 'database',
      JWT_SECRET: 'a'.repeat(32),
      JWT_EXPIRES_IN: '1h',
      GROQ_API_KEY: 'gsk_test',
      NODE_ENV: 'production',
      PORT: '8080',
      CORS_ORIGIN: 'https://example.com',
      RATE_LIMIT_TTL: '120',
      RATE_LIMIT_MAX: '200',
      GROQ_MODEL: 'llama-3.2-90b-text-preview',
      FRONTEND_URL: 'https://app.example.com',
      // Obligatorias en producción desde T-PROD-012: sin ellas el boot falla.
      SMTP_HOST: 'smtp.resend.com',
      SMTP_PORT: '587',
      SMTP_USER: 'resend',
      SMTP_PASS: 're_test_key',
      EMAIL_FROM: 'noreply@auguriatarot.com',
    };

    const result = validate(config);

    expect(result.NODE_ENV).toBe('production');
    expect(result.PORT).toBe(8080);
    expect(result.CORS_ORIGIN).toBe('https://example.com');
    expect(result.RATE_LIMIT_TTL).toBe(120);
    expect(result.RATE_LIMIT_MAX).toBe(200);
    expect(result.GROQ_MODEL).toBe('llama-3.2-90b-text-preview');
    expect(result.FRONTEND_URL).toBe('https://app.example.com');
  });

  it('should include helpful error message in exception', () => {
    const config = {
      POSTGRES_HOST: 'localhost',
      // Missing several required fields
    };

    try {
      validate(config);
      fail('Should have thrown an error');
    } catch (error) {
      const message = (error as Error).message;
      expect(message).toContain('Environment variable validation failed');
      expect(message).toContain('Please check your .env file');
      expect(message).toContain('.env.example');
    }
  });

  // ===========================================================================
  // T-PROD-012: variables de email que fallaban en silencio
  // ===========================================================================

  describe('email configuration (T-PROD-012)', () => {
    const baseConfig = (): Record<string, string> => ({
      POSTGRES_HOST: 'localhost',
      POSTGRES_PORT: '5432',
      POSTGRES_USER: 'user',
      POSTGRES_PASSWORD: 'password',
      POSTGRES_DB: 'database',
      JWT_SECRET: 'a'.repeat(32),
      JWT_EXPIRES_IN: '1h',
      GROQ_API_KEY: 'gsk_test',
    });

    /** Config productiva completa: lo que Railway tiene cargado y hace arrancar la app. */
    const productionConfig = (): Record<string, string> => ({
      ...baseConfig(),
      NODE_ENV: 'production',
      SMTP_HOST: 'smtp.resend.com',
      SMTP_PORT: '587',
      SMTP_USER: 'resend',
      SMTP_PASS: 're_test_key',
      EMAIL_FROM: 'noreply@auguriatarot.com',
      FRONTEND_URL: 'https://auguriatarot.com',
    });

    it('una config productiva completa arranca sin quejas', () => {
      expect(() => validate(productionConfig())).not.toThrow();
    });

    describe('EMAIL_REPLY_TO', () => {
      it('acepta una dirección válida', () => {
        const config = {
          ...baseConfig(),
          EMAIL_REPLY_TO: 'consultas@auguriatarot.com',
        };

        expect(validate(config).EMAIL_REPLY_TO).toBe(
          'consultas@auguriatarot.com',
        );
      });

      it('rechaza una dirección inválida', () => {
        const config = { ...baseConfig(), EMAIL_REPLY_TO: 'no-es-un-email' };

        expect(() => validate(config)).toThrow('EMAIL_REPLY_TO');
      });

      it('es opcional (sin ella, el replyTo cae a EMAIL_FROM)', () => {
        expect(() => validate(baseConfig())).not.toThrow();
      });

      it('tolera el string vacío: dejar la variable vacía es la forma habitual de desactivarla, no debe tumbar el boot', () => {
        const config = { ...baseConfig(), EMAIL_REPLY_TO: '' };

        expect(() => validate(config)).not.toThrow();
        expect(validate(config).EMAIL_REPLY_TO).toBeUndefined();
      });
    });

    describe('ADMIN_EMAIL_COST_ALERTS', () => {
      it('acepta una dirección válida', () => {
        const config = {
          ...baseConfig(),
          ADMIN_EMAIL_COST_ALERTS: 'consultas@auguriatarot.com',
        };

        expect(validate(config).ADMIN_EMAIL_COST_ALERTS).toBe(
          'consultas@auguriatarot.com',
        );
      });

      it('rechaza una dirección inválida: un typo dejaba las alertas de costo mudas', () => {
        const config = {
          ...baseConfig(),
          ADMIN_EMAIL_COST_ALERTS: 'admin@',
        };

        expect(() => validate(config)).toThrow('ADMIN_EMAIL_COST_ALERTS');
      });

      it('tolera el string vacío: sin destinatario, el servicio ya saltea la alerta con un warning', () => {
        const config = { ...baseConfig(), ADMIN_EMAIL_COST_ALERTS: '' };

        expect(() => validate(config)).not.toThrow();
        expect(validate(config).ADMIN_EMAIL_COST_ALERTS).toBeUndefined();
      });
    });

    describe('SMTP en producción', () => {
      it.each([
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_USER',
        'SMTP_PASS',
        'EMAIL_FROM',
      ])('falla el boot si falta %s', (missingKey) => {
        const config = productionConfig();
        delete config[missingKey];

        expect(() => validate(config)).toThrow(missingKey);
      });

      it('falla ANTES de conectar la base: la validación de entorno corre en ConfigModule, no en el factory del mailer (así un deploy incompleto no corre las migraciones y muere después)', () => {
        const config = productionConfig();
        delete config.SMTP_PASS;

        expect(() => validate(config)).toThrow(
          /SMTP configuration is incomplete/i,
        );
      });

      it('reporta TODAS las variables faltantes de una vez, no de a una por deploy', () => {
        const config = productionConfig();
        delete config.SMTP_PASS;
        delete config.EMAIL_FROM;
        delete config.FRONTEND_URL;

        try {
          validate(config);
          fail('debería haber lanzado');
        } catch (error) {
          const message = (error as Error).message;
          expect(message).toContain('SMTP_PASS');
          expect(message).toContain('EMAIL_FROM');
          expect(message).toContain('FRONTEND_URL');
        }
      });

      it('fuera de producción, un SMTP incompleto no molesta (el mailer cae a jsonTransport)', () => {
        expect(() => validate(baseConfig())).not.toThrow();
      });
    });

    describe('FRONTEND_URL en producción', () => {
      it('falla el boot si no está seteada: los links de los emails saldrían a localhost sin un solo error', () => {
        const config = productionConfig();
        delete config.FRONTEND_URL;

        expect(() => validate(config)).toThrow(/FRONTEND_URL/);
      });

      it.each(['http://localhost:3001', 'http://127.0.0.1:3001'])(
        'falla el boot si apunta a %s',
        (frontendUrl) => {
          const config = { ...productionConfig(), FRONTEND_URL: frontendUrl };

          expect(() => validate(config)).toThrow(/FRONTEND_URL/);
        },
      );

      it.each(['www.auguriatarot.com', 'auguriatarot.com'])(
        'falla el boot si le falta el esquema (%s): los links saldrían rotos, otra vez en silencio',
        (frontendUrl) => {
          const config = { ...productionConfig(), FRONTEND_URL: frontendUrl };

          expect(() => validate(config)).toThrow(/FRONTEND_URL/);
        },
      );

      it('acepta una URL productiva real', () => {
        expect(() => validate(productionConfig())).not.toThrow();
      });

      it('no confunde un host legítimo que contenga "localhost" con el localhost real', () => {
        const config = {
          ...productionConfig(),
          FRONTEND_URL: 'https://localhost.auguriatarot.com',
        };

        expect(() => validate(config)).not.toThrow();
      });

      it('recorta los espacios: la app consume el valor validado, así que no puede quedar con un espacio adelante', () => {
        const config = {
          ...productionConfig(),
          FRONTEND_URL: '  https://auguriatarot.com  ',
        };

        expect(validate(config).FRONTEND_URL).toBe('https://auguriatarot.com');
      });

      it('fuera de producción sigue cayendo al default de localhost sin quejarse', () => {
        const config = { ...baseConfig(), NODE_ENV: 'development' };

        expect(validate(config).FRONTEND_URL).toBe('http://localhost:3001');
      });
    });
  });
});
