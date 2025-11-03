import { HttpException, HttpStatus } from '@nestjs/common';
import { AIProviderType } from '../ai-provider.interface';

/**
 * Enum for AI error types
 */
export enum AIErrorType {
  RATE_LIMIT = 'rate_limit',
  INVALID_KEY = 'invalid_key',
  TIMEOUT = 'timeout',
  CONTEXT_LENGTH = 'context_length',
  SERVER_ERROR = 'server_error',
  NETWORK_ERROR = 'network_error',
  PROVIDER_UNAVAILABLE = 'provider_unavailable',
}

/**
 * Custom exception for AI provider errors
 */
export class AIProviderException extends HttpException {
  public readonly provider: AIProviderType;
  public readonly errorType: AIErrorType;
  public readonly retryable: boolean;
  public readonly originalError: Error;

  constructor(
    provider: AIProviderType,
    errorType: AIErrorType,
    message: string,
    retryable: boolean,
    originalError: Error,
  ) {
    // Determine HTTP status based on error type
    const status =
      errorType === AIErrorType.INVALID_KEY
        ? HttpStatus.INTERNAL_SERVER_ERROR
        : HttpStatus.SERVICE_UNAVAILABLE;

    super(message, status);

    this.provider = provider;
    this.errorType = errorType;
    this.retryable = retryable;
    this.originalError = originalError;
  }
}
