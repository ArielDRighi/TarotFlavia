import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { EnvironmentVariables } from './env.validation';

describe('EnvironmentVariables', () => {
  describe('Database Variables', () => {
    it('should fail if POSTGRES_HOST is missing', async () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
      });

      const errors = await validate(envConfig);
      const hostError = errors.find((e) => e.property === 'POSTGRES_HOST');

      expect(hostError).toBeDefined();
      expect(hostError?.constraints).toBeDefined();
    });

    it('should fail if POSTGRES_PORT is not a valid port', async () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '99999', // Invalid port
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
      });

      const errors = await validate(envConfig);
      const portError = errors.find((e) => e.property === 'POSTGRES_PORT');

      expect(portError).toBeDefined();
    });

    it('should fail if POSTGRES_USER is missing', async () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
      });

      const errors = await validate(envConfig);
      const userError = errors.find((e) => e.property === 'POSTGRES_USER');

      expect(userError).toBeDefined();
    });

    it('should fail if POSTGRES_PASSWORD is missing', async () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
      });

      const errors = await validate(envConfig);
      const passwordError = errors.find(
        (e) => e.property === 'POSTGRES_PASSWORD',
      );

      expect(passwordError).toBeDefined();
    });

    it('should fail if POSTGRES_DB is missing', async () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
      });

      const errors = await validate(envConfig);
      const dbError = errors.find((e) => e.property === 'POSTGRES_DB');

      expect(dbError).toBeDefined();
    });

    it('should pass with valid database configuration', async () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'password',
        POSTGRES_DB: 'database',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
      });

      const errors = await validate(envConfig);
      const dbErrors = errors.filter((e) =>
        [
          'POSTGRES_HOST',
          'POSTGRES_PORT',
          'POSTGRES_USER',
          'POSTGRES_PASSWORD',
          'POSTGRES_DB',
        ].includes(e.property),
      );

      expect(dbErrors).toHaveLength(0);
    });
  });

  describe('JWT Variables', () => {
    it('should fail if JWT_SECRET is less than 32 characters', async () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'short', // Less than 32 chars
        JWT_EXPIRES_IN: '1h',
      });

      const errors = await validate(envConfig);
      const secretError = errors.find((e) => e.property === 'JWT_SECRET');

      expect(secretError).toBeDefined();
      expect(secretError?.constraints).toHaveProperty('minLength');
    });

    it('should fail if JWT_SECRET is missing', async () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_EXPIRES_IN: '1h',
      });

      const errors = await validate(envConfig);
      const secretError = errors.find((e) => e.property === 'JWT_SECRET');

      expect(secretError).toBeDefined();
    });

    it('should fail if JWT_EXPIRES_IN is missing', async () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
      });

      const errors = await validate(envConfig);
      const expiresError = errors.find((e) => e.property === 'JWT_EXPIRES_IN');

      expect(expiresError).toBeDefined();
    });

    it('should pass with valid JWT configuration', async () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
      });

      const errors = await validate(envConfig);
      const jwtErrors = errors.filter((e) =>
        ['JWT_SECRET', 'JWT_EXPIRES_IN'].includes(e.property),
      );

      expect(jwtErrors).toHaveLength(0);
    });
  });

  describe('AI Provider Variables', () => {
    describe('Groq (Primary Provider)', () => {
      it('should fail if GROQ_API_KEY is missing', async () => {
        const envConfig = plainToClass(EnvironmentVariables, {
          POSTGRES_HOST: 'localhost',
          POSTGRES_PORT: '5432',
          POSTGRES_USER: 'user',
          POSTGRES_PASSWORD: 'pass',
          POSTGRES_DB: 'db',
          JWT_SECRET: 'a'.repeat(32),
          JWT_EXPIRES_IN: '1h',
        });

        const errors = await validate(envConfig);
        const apiKeyError = errors.find((e) => e.property === 'GROQ_API_KEY');

        expect(apiKeyError).toBeDefined();
      });

      it('should fail if GROQ_API_KEY does not start with gsk_', async () => {
        const envConfig = plainToClass(EnvironmentVariables, {
          POSTGRES_HOST: 'localhost',
          POSTGRES_PORT: '5432',
          POSTGRES_USER: 'user',
          POSTGRES_PASSWORD: 'pass',
          POSTGRES_DB: 'db',
          JWT_SECRET: 'a'.repeat(32),
          JWT_EXPIRES_IN: '1h',
          GROQ_API_KEY: 'invalid-key',
        });

        const errors = await validate(envConfig);
        const apiKeyError = errors.find((e) => e.property === 'GROQ_API_KEY');

        expect(apiKeyError).toBeDefined();
        expect(apiKeyError?.constraints).toHaveProperty('matches');
      });

      it('should pass with valid Groq API key', async () => {
        const envConfig = plainToClass(EnvironmentVariables, {
          POSTGRES_HOST: 'localhost',
          POSTGRES_PORT: '5432',
          POSTGRES_USER: 'user',
          POSTGRES_PASSWORD: 'pass',
          POSTGRES_DB: 'db',
          JWT_SECRET: 'a'.repeat(32),
          JWT_EXPIRES_IN: '1h',
          GROQ_API_KEY: 'gsk_1234567890abcdef',
        });

        const errors = await validate(envConfig);
        const apiKeyError = errors.find((e) => e.property === 'GROQ_API_KEY');

        expect(apiKeyError).toBeUndefined();
      });

      it('should use default GROQ_MODEL if not provided', () => {
        const envConfig = plainToClass(EnvironmentVariables, {
          POSTGRES_HOST: 'localhost',
          POSTGRES_PORT: '5432',
          POSTGRES_USER: 'user',
          POSTGRES_PASSWORD: 'pass',
          POSTGRES_DB: 'db',
          JWT_SECRET: 'a'.repeat(32),
          JWT_EXPIRES_IN: '1h',
          GROQ_API_KEY: 'gsk_test',
        });

        expect(envConfig.GROQ_MODEL).toBe('llama-3.1-70b-versatile');
      });

      it('should accept custom GROQ_MODEL', () => {
        const envConfig = plainToClass(EnvironmentVariables, {
          POSTGRES_HOST: 'localhost',
          POSTGRES_PORT: '5432',
          POSTGRES_USER: 'user',
          POSTGRES_PASSWORD: 'pass',
          POSTGRES_DB: 'db',
          JWT_SECRET: 'a'.repeat(32),
          JWT_EXPIRES_IN: '1h',
          GROQ_API_KEY: 'gsk_test',
          GROQ_MODEL: 'llama-3.2-90b-text-preview',
        });

        expect(envConfig.GROQ_MODEL).toBe('llama-3.2-90b-text-preview');
      });
    });

    describe('DeepSeek (Optional Growth Provider)', () => {
      it('should be optional', async () => {
        const envConfig = plainToClass(EnvironmentVariables, {
          POSTGRES_HOST: 'localhost',
          POSTGRES_PORT: '5432',
          POSTGRES_USER: 'user',
          POSTGRES_PASSWORD: 'pass',
          POSTGRES_DB: 'db',
          JWT_SECRET: 'a'.repeat(32),
          JWT_EXPIRES_IN: '1h',
          GROQ_API_KEY: 'gsk_test',
        });

        const errors = await validate(envConfig);
        const apiKeyError = errors.find(
          (e) => e.property === 'DEEPSEEK_API_KEY',
        );

        expect(apiKeyError).toBeUndefined();
      });

      it('should accept valid DeepSeek API key', async () => {
        const envConfig = plainToClass(EnvironmentVariables, {
          POSTGRES_HOST: 'localhost',
          POSTGRES_PORT: '5432',
          POSTGRES_USER: 'user',
          POSTGRES_PASSWORD: 'pass',
          POSTGRES_DB: 'db',
          JWT_SECRET: 'a'.repeat(32),
          JWT_EXPIRES_IN: '1h',
          GROQ_API_KEY: 'gsk_test',
          DEEPSEEK_API_KEY: 'sk-deepseek-1234',
        });

        const errors = await validate(envConfig);
        const apiKeyError = errors.find(
          (e) => e.property === 'DEEPSEEK_API_KEY',
        );

        expect(apiKeyError).toBeUndefined();
      });

      it('should use default DEEPSEEK_MODEL if not provided', () => {
        const envConfig = plainToClass(EnvironmentVariables, {
          POSTGRES_HOST: 'localhost',
          POSTGRES_PORT: '5432',
          POSTGRES_USER: 'user',
          POSTGRES_PASSWORD: 'pass',
          POSTGRES_DB: 'db',
          JWT_SECRET: 'a'.repeat(32),
          JWT_EXPIRES_IN: '1h',
          GROQ_API_KEY: 'gsk_test',
          DEEPSEEK_API_KEY: 'sk-deepseek-1234',
        });

        expect(envConfig.DEEPSEEK_MODEL).toBe('deepseek-chat');
      });
    });

    describe('OpenAI (Optional Fallback Provider)', () => {
      it('should be optional', async () => {
        const envConfig = plainToClass(EnvironmentVariables, {
          POSTGRES_HOST: 'localhost',
          POSTGRES_PORT: '5432',
          POSTGRES_USER: 'user',
          POSTGRES_PASSWORD: 'pass',
          POSTGRES_DB: 'db',
          JWT_SECRET: 'a'.repeat(32),
          JWT_EXPIRES_IN: '1h',
          GROQ_API_KEY: 'gsk_test',
        });

        const errors = await validate(envConfig);
        const apiKeyError = errors.find((e) => e.property === 'OPENAI_API_KEY');

        expect(apiKeyError).toBeUndefined();
      });

      it('should fail if OPENAI_API_KEY does not start with sk- when provided', async () => {
        const envConfig = plainToClass(EnvironmentVariables, {
          POSTGRES_HOST: 'localhost',
          POSTGRES_PORT: '5432',
          POSTGRES_USER: 'user',
          POSTGRES_PASSWORD: 'pass',
          POSTGRES_DB: 'db',
          JWT_SECRET: 'a'.repeat(32),
          JWT_EXPIRES_IN: '1h',
          GROQ_API_KEY: 'gsk_test',
          OPENAI_API_KEY: 'invalid-key',
        });

        const errors = await validate(envConfig);
        const apiKeyError = errors.find((e) => e.property === 'OPENAI_API_KEY');

        expect(apiKeyError).toBeDefined();
        expect(apiKeyError?.constraints).toHaveProperty('matches');
      });

      it('should pass with valid OpenAI API key', async () => {
        const envConfig = plainToClass(EnvironmentVariables, {
          POSTGRES_HOST: 'localhost',
          POSTGRES_PORT: '5432',
          POSTGRES_USER: 'user',
          POSTGRES_PASSWORD: 'pass',
          POSTGRES_DB: 'db',
          JWT_SECRET: 'a'.repeat(32),
          JWT_EXPIRES_IN: '1h',
          GROQ_API_KEY: 'gsk_test',
          OPENAI_API_KEY: 'sk-1234567890abcdef',
        });

        const errors = await validate(envConfig);
        const apiKeyError = errors.find((e) => e.property === 'OPENAI_API_KEY');

        expect(apiKeyError).toBeUndefined();
      });

      it('should use default OPENAI_MODEL if not provided', () => {
        const envConfig = plainToClass(EnvironmentVariables, {
          POSTGRES_HOST: 'localhost',
          POSTGRES_PORT: '5432',
          POSTGRES_USER: 'user',
          POSTGRES_PASSWORD: 'pass',
          POSTGRES_DB: 'db',
          JWT_SECRET: 'a'.repeat(32),
          JWT_EXPIRES_IN: '1h',
          GROQ_API_KEY: 'gsk_test',
          OPENAI_API_KEY: 'sk-test',
        });

        expect(envConfig.OPENAI_MODEL).toBe('gpt-4o-mini');
      });
    });
  });

  describe('Optional Variables with Defaults', () => {
    it('should use default NODE_ENV if not provided', () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
        GROQ_API_KEY: 'gsk_test',
      });

      expect(envConfig.NODE_ENV).toBe('development');
    });

    it('should use default NODE_ENV when empty string is provided', () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
        GROQ_API_KEY: 'gsk_test',
        NODE_ENV: '',
      });

      expect(envConfig.NODE_ENV).toBe('development');
    });

    it('should use default PORT if not provided', () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
        GROQ_API_KEY: 'gsk_test',
      });

      expect(envConfig.PORT).toBe(3000);
    });

    it('should accept custom PORT value', () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
        GROQ_API_KEY: 'gsk_test',
        PORT: '8080',
      });

      expect(envConfig.PORT).toBe(8080);
    });

    it('should validate NODE_ENV values', async () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
        GROQ_API_KEY: 'gsk_test',
        NODE_ENV: 'invalid',
      });

      const errors = await validate(envConfig);
      const nodeEnvError = errors.find((e) => e.property === 'NODE_ENV');

      expect(nodeEnvError).toBeDefined();
    });
  });

  describe('CORS Configuration', () => {
    it('should accept valid CORS_ORIGINS URLs', async () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
        GROQ_API_KEY: 'gsk_test',
        CORS_ORIGINS: 'http://localhost:3000,https://app.example.com',
      });

      const errors = await validate(envConfig);
      const corsError = errors.find((e) => e.property === 'CORS_ORIGINS');

      expect(corsError).toBeUndefined();
    });

    it('should use default CORS_ORIGINS if not provided', () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
        GROQ_API_KEY: 'gsk_test',
      });

      expect(envConfig.CORS_ORIGINS).toBe('http://localhost:3000');
    });

    it('should use default CORS_ORIGINS when empty string is provided', () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
        GROQ_API_KEY: 'gsk_test',
        CORS_ORIGINS: '',
      });

      expect(envConfig.CORS_ORIGINS).toBe('http://localhost:3000');
    });
  });

  describe('Rate Limiting Configuration', () => {
    it('should use default RATE_LIMIT_TTL if not provided', () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
        GROQ_API_KEY: 'gsk_test',
      });

      expect(envConfig.RATE_LIMIT_TTL).toBe(60);
    });

    it('should use default RATE_LIMIT_MAX if not provided', () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
        GROQ_API_KEY: 'gsk_test',
      });

      expect(envConfig.RATE_LIMIT_MAX).toBe(100);
    });

    it('should accept custom rate limit values', () => {
      const envConfig = plainToClass(EnvironmentVariables, {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'pass',
        POSTGRES_DB: 'db',
        JWT_SECRET: 'a'.repeat(32),
        JWT_EXPIRES_IN: '1h',
        GROQ_API_KEY: 'gsk_test',
        RATE_LIMIT_TTL: '120',
        RATE_LIMIT_MAX: '200',
      });

      expect(envConfig.RATE_LIMIT_TTL).toBe(120);
      expect(envConfig.RATE_LIMIT_MAX).toBe(200);
    });
  });
});
