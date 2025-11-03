import { retryWithBackoff } from './retry.utils';
import { AIErrorType, AIProviderException } from './ai-error.types';
import { AIProviderType } from '../ai-provider.interface';

describe('retryWithBackoff', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should succeed on first attempt without retry', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await retryWithBackoff(fn, 3);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable errors', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(
        new AIProviderException(
          AIProviderType.GROQ,
          AIErrorType.RATE_LIMIT,
          'Rate limit',
          true,
          new Error('Rate limit'),
        ),
      )
      .mockResolvedValue('success');

    const result = await retryWithBackoff(fn, 3);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not retry on non-retryable errors', async () => {
    const nonRetryableError = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.INVALID_KEY,
      'Invalid key',
      false,
      new Error('Invalid key'),
    );

    const fn = jest.fn().mockRejectedValue(nonRetryableError);

    await expect(retryWithBackoff(fn, 3)).rejects.toThrow(nonRetryableError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should throw after max retries exceeded', async () => {
    const retryableError = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.RATE_LIMIT,
      'Rate limit',
      true,
      new Error('Rate limit'),
    );

    const fn = jest.fn().mockRejectedValue(retryableError);

    await expect(retryWithBackoff(fn, 3)).rejects.toThrow(retryableError);
    expect(fn).toHaveBeenCalledTimes(3);
  }, 15000);

  it('should wait with exponential backoff between retries', async () => {
    jest.useFakeTimers();

    const retryableError = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.TIMEOUT,
      'Timeout',
      true,
      new Error('Timeout'),
    );

    const fn = jest
      .fn()
      .mockRejectedValueOnce(retryableError)
      .mockRejectedValueOnce(retryableError)
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, 3);

    // First call - immediate
    await jest.advanceTimersByTimeAsync(0);
    expect(fn).toHaveBeenCalledTimes(1);

    // Second call - wait ~2s (with jitter)
    await jest.advanceTimersByTimeAsync(2500);
    expect(fn).toHaveBeenCalledTimes(2);

    // Third call - wait ~4s (with jitter)
    await jest.advanceTimersByTimeAsync(5000);
    expect(fn).toHaveBeenCalledTimes(3);

    jest.useRealTimers();
    const result = await promise;
    expect(result).toBe('success');
  });

  it('should handle server errors as retryable', async () => {
    const serverError = new AIProviderException(
      AIProviderType.DEEPSEEK,
      AIErrorType.SERVER_ERROR,
      'Server error',
      true,
      new Error('Server error'),
    );

    const fn = jest
      .fn()
      .mockRejectedValueOnce(serverError)
      .mockResolvedValue('success');

    const result = await retryWithBackoff(fn, 3);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should handle network errors as retryable', async () => {
    const networkError = new AIProviderException(
      AIProviderType.GROQ,
      AIErrorType.NETWORK_ERROR,
      'Network error',
      true,
      new Error('Network error'),
    );

    const fn = jest
      .fn()
      .mockRejectedValueOnce(networkError)
      .mockResolvedValue('success');

    const result = await retryWithBackoff(fn, 3);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not retry on context length errors', async () => {
    const contextError = new AIProviderException(
      AIProviderType.OPENAI,
      AIErrorType.CONTEXT_LENGTH,
      'Context too long',
      false,
      new Error('Context too long'),
    );

    const fn = jest.fn().mockRejectedValue(contextError);

    await expect(retryWithBackoff(fn, 3)).rejects.toThrow(contextError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle non-AIProviderException errors gracefully', async () => {
    const genericError = new Error('Generic error');
    const fn = jest.fn().mockRejectedValue(genericError);

    await expect(retryWithBackoff(fn, 3)).rejects.toThrow(genericError);
    expect(fn).toHaveBeenCalledTimes(1); // Should not retry generic errors
  });
});
