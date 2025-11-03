import { AIErrorType, AIProviderException } from './ai-error.types';
import { AIProviderType } from '../ai-provider.interface';
import { HttpStatus } from '@nestjs/common';

describe('AIErrorType', () => {
  it('should have all required error types', () => {
    expect(AIErrorType.RATE_LIMIT).toBe('rate_limit');
    expect(AIErrorType.INVALID_KEY).toBe('invalid_key');
    expect(AIErrorType.TIMEOUT).toBe('timeout');
    expect(AIErrorType.CONTEXT_LENGTH).toBe('context_length');
    expect(AIErrorType.SERVER_ERROR).toBe('server_error');
    expect(AIErrorType.NETWORK_ERROR).toBe('network_error');
    expect(AIErrorType.PROVIDER_UNAVAILABLE).toBe('provider_unavailable');
  });
});

describe('AIProviderException', () => {
  const originalError = new Error('Original error message');

  it('should create exception with all required fields', () => {
    const exception = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.RATE_LIMIT,
      'Rate limit exceeded',
      true,
      originalError,
    );

    expect(exception.provider).toBe(AIProviderType.GROQ);
    expect(exception.errorType).toBe(AIErrorType.RATE_LIMIT);
    expect(exception.retryable).toBe(true);
    expect(exception.originalError).toBe(originalError);
    expect(exception.message).toBe('Rate limit exceeded');
  });

  it('should extend HttpException', () => {
    const exception = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.RATE_LIMIT,
      'Rate limit exceeded',
      true,
      originalError,
    );

    expect(exception).toBeInstanceOf(Error);
    expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
  });

  it('should have correct HTTP status for rate limit errors', () => {
    const exception = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.RATE_LIMIT,
      'Rate limit exceeded',
      true,
      originalError,
    );

    expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
  });

  it('should have correct HTTP status for invalid key errors', () => {
    const exception = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.INVALID_KEY,
      'Invalid API key',
      false,
      originalError,
    );

    expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should mark rate limit errors as retryable', () => {
    const exception = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.RATE_LIMIT,
      'Rate limit exceeded',
      true,
      originalError,
    );

    expect(exception.retryable).toBe(true);
  });

  it('should mark invalid key errors as not retryable', () => {
    const exception = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.INVALID_KEY,
      'Invalid API key',
      false,
      originalError,
    );

    expect(exception.retryable).toBe(false);
  });

  it('should store provider information correctly', () => {
    const exceptionGroq = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.TIMEOUT,
      'Timeout',
      true,
      originalError,
    );

    const exceptionDeepSeek = new AIProviderException(
      AIProviderType.DEEPSEEK,
      AIErrorType.SERVER_ERROR,
      'Server error',
      true,
      originalError,
    );

    expect(exceptionGroq.provider).toBe(AIProviderType.GROQ);
    expect(exceptionDeepSeek.provider).toBe(AIProviderType.DEEPSEEK);
  });

  it('should include error type in exception details', () => {
    const exception = new AIProviderException(
      AIProviderType.OPENAI,
      AIErrorType.CONTEXT_LENGTH,
      'Context too long',
      false,
      originalError,
    );

    expect(exception.errorType).toBe(AIErrorType.CONTEXT_LENGTH);
  });

  it('should preserve original error', () => {
    const customError = new Error('Custom error with details');
    const exception = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.NETWORK_ERROR,
      'Network failed',
      true,
      customError,
    );

    expect(exception.originalError).toBe(customError);
    expect(exception.originalError.message).toBe('Custom error with details');
  });
});
