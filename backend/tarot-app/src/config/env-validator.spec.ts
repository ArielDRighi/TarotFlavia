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
    });

    describe('FRONTEND_URL en producción', () => {
      it('falla el boot si no está seteada: los links de los emails saldrían a localhost sin un solo error', () => {
        const config = { ...baseConfig(), NODE_ENV: 'production' };

        expect(() => validate(config)).toThrow(/FRONTEND_URL/);
      });

      it('falla el boot si apunta a localhost', () => {
        const config = {
          ...baseConfig(),
          NODE_ENV: 'production',
          FRONTEND_URL: 'http://localhost:3001',
        };

        expect(() => validate(config)).toThrow(/FRONTEND_URL/);
      });

      it('acepta una URL productiva real', () => {
        const config = {
          ...baseConfig(),
          NODE_ENV: 'production',
          FRONTEND_URL: 'https://auguriatarot.com',
        };

        expect(() => validate(config)).not.toThrow();
      });

      it('fuera de producción sigue cayendo al default de localhost sin quejarse', () => {
        const config = { ...baseConfig(), NODE_ENV: 'development' };

        expect(validate(config).FRONTEND_URL).toBe('http://localhost:3001');
      });
    });
  });
});
