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
      OPENAI_API_KEY: 'sk-test123',
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
      OPENAI_API_KEY: 'invalid', // Wrong format
    };

    expect(() => validate(config)).toThrow(
      'Environment variable validation failed',
    );
    expect(() => validate(config)).toThrow('POSTGRES_PASSWORD');
    expect(() => validate(config)).toThrow('JWT_SECRET');
    expect(() => validate(config)).toThrow('OPENAI_API_KEY');
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
      OPENAI_API_KEY: 'sk-test',
    };

    const result = validate(config);

    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe(3000);
    expect(result.CORS_ORIGINS).toBe('http://localhost:3000');
    expect(result.RATE_LIMIT_TTL).toBe(60);
    expect(result.RATE_LIMIT_MAX).toBe(100);
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
      OPENAI_API_KEY: 'sk-test',
      NODE_ENV: 'production',
      PORT: '8080',
      CORS_ORIGINS: 'https://example.com',
      RATE_LIMIT_TTL: '120',
      RATE_LIMIT_MAX: '200',
    };

    const result = validate(config);

    expect(result.NODE_ENV).toBe('production');
    expect(result.PORT).toBe(8080);
    expect(result.CORS_ORIGINS).toBe('https://example.com');
    expect(result.RATE_LIMIT_TTL).toBe(120);
    expect(result.RATE_LIMIT_MAX).toBe(200);
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
});
