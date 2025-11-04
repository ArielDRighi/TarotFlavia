import { AIProviderType } from '../ai-provider.interface';

export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

export interface CircuitBreakerStats {
  provider: AIProviderType;
  state: CircuitBreakerState;
  consecutiveFailures: number;
  totalFailures: number;
  totalSuccesses: number;
  lastFailureTime: number | null;
}

/**
 * Circuit Breaker pattern implementation
 * Prevents cascading failures by temporarily blocking requests to failing providers
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private consecutiveFailures = 0;
  private consecutiveSuccesses = 0;
  private totalFailures = 0;
  private totalSuccesses = 0;
  private lastFailureTime: number | null = null;
  private openedAt: number | null = null;

  constructor(
    private readonly provider: AIProviderType,
    private readonly failureThreshold: number,
    private readonly timeoutMs: number,
  ) {}

  /**
   * Check if the circuit breaker allows execution
   */
  canExecute(): boolean {
    // If OPEN, check if timeout has passed
    if (this.state === CircuitBreakerState.OPEN && this.openedAt) {
      const timeSinceOpen = Date.now() - this.openedAt;
      if (timeSinceOpen >= this.timeoutMs) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.consecutiveSuccesses = 0;
        return true;
      }
      return false;
    }

    return this.state !== CircuitBreakerState.OPEN;
  }

  /**
   * Record a successful execution
   */
  recordSuccess(): void {
    this.totalSuccesses++;
    this.consecutiveFailures = 0;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.consecutiveSuccesses++;

      // Need 3 consecutive successes to close
      if (this.consecutiveSuccesses >= 3) {
        this.state = CircuitBreakerState.CLOSED;
        this.consecutiveSuccesses = 0;
        this.openedAt = null;
      }
    }
  }

  /**
   * Record a failed execution
   */
  recordFailure(): void {
    this.totalFailures++;
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      // Any failure in HALF_OPEN goes back to OPEN
      this.state = CircuitBreakerState.OPEN;
      // Reset openedAt to restart the timeout
      this.openedAt = Date.now();
      this.consecutiveSuccesses = 0;
    } else if (this.state === CircuitBreakerState.CLOSED) {
      // Check if we've reached the failure threshold
      if (this.consecutiveFailures >= this.failureThreshold) {
        this.state = CircuitBreakerState.OPEN;
        this.openedAt = Date.now();
      }
    } else if (this.state === CircuitBreakerState.OPEN) {
      // Update openedAt to extend the timeout
      this.openedAt = Date.now();
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    // Update state if needed
    this.canExecute();
    return this.state;
  }

  /**
   * Get statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      provider: this.provider,
      state: this.getState(),
      consecutiveFailures: this.consecutiveFailures,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
      lastFailureTime: this.lastFailureTime,
    };
  }
}
