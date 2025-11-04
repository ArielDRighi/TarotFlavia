import { CircuitBreaker, CircuitBreakerState } from './circuit-breaker.utils';
import { AIProviderType } from '../ai-provider.interface';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    jest.useFakeTimers();
    circuitBreaker = new CircuitBreaker(AIProviderType.GROQ, 5, 300000); // 5 failures, 5 minutes
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial state', () => {
    it('should start in CLOSED state', () => {
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it('should allow execution in CLOSED state', () => {
      expect(circuitBreaker.canExecute()).toBe(true);
    });
  });

  describe('Recording failures', () => {
    it('should remain CLOSED with fewer failures than threshold', () => {
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();

      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);
      expect(circuitBreaker.canExecute()).toBe(true);
    });

    it('should transition to OPEN after reaching failure threshold', () => {
      // Record 5 consecutive failures
      for (let i = 0; i < 5; i++) {
        circuitBreaker.recordFailure();
      }

      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);
      expect(circuitBreaker.canExecute()).toBe(false);
    });

    it('should reset failure count on success', () => {
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      circuitBreaker.recordSuccess();

      // Now need 5 more failures to open
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();

      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);
      expect(circuitBreaker.canExecute()).toBe(true);
    });
  });

  describe('OPEN state', () => {
    beforeEach(() => {
      // Transition to OPEN
      for (let i = 0; i < 5; i++) {
        circuitBreaker.recordFailure();
      }
    });

    it('should not allow execution in OPEN state', () => {
      expect(circuitBreaker.canExecute()).toBe(false);
    });

    it('should transition to HALF_OPEN after timeout', () => {
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);

      // Advance time by 5 minutes
      jest.advanceTimersByTime(300000);

      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.HALF_OPEN);
      expect(circuitBreaker.canExecute()).toBe(true);
    });

    it('should not transition to HALF_OPEN before timeout', () => {
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);

      // Advance time by 4 minutes (not enough)
      jest.advanceTimersByTime(240000);

      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);
      expect(circuitBreaker.canExecute()).toBe(false);
    });
  });

  describe('HALF_OPEN state', () => {
    beforeEach(() => {
      // Transition to OPEN
      for (let i = 0; i < 5; i++) {
        circuitBreaker.recordFailure();
      }

      // Wait for timeout to transition to HALF_OPEN
      jest.advanceTimersByTime(300000);
    });

    it('should allow execution in HALF_OPEN state', () => {
      expect(circuitBreaker.canExecute()).toBe(true);
    });

    it('should transition to CLOSED after 3 consecutive successes', () => {
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.HALF_OPEN);

      circuitBreaker.recordSuccess();
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.HALF_OPEN);

      circuitBreaker.recordSuccess();
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.HALF_OPEN);

      circuitBreaker.recordSuccess();
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it('should transition back to OPEN on failure', () => {
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.HALF_OPEN);

      circuitBreaker.recordFailure();

      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);
      expect(circuitBreaker.canExecute()).toBe(false);
    });

    it('should reset success count and go back to OPEN on failure', () => {
      circuitBreaker.recordSuccess();
      circuitBreaker.recordSuccess();

      // This should reset and go back to OPEN
      circuitBreaker.recordFailure();

      // After recordFailure in HALF_OPEN, state should be OPEN
      // But need to check before timeout expires again
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);
      expect(circuitBreaker.canExecute()).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('should track total failures', () => {
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();

      const stats = circuitBreaker.getStats();
      expect(stats.totalFailures).toBe(3);
    });

    it('should track total successes', () => {
      circuitBreaker.recordSuccess();
      circuitBreaker.recordSuccess();

      const stats = circuitBreaker.getStats();
      expect(stats.totalSuccesses).toBe(2);
    });

    it('should track consecutive failures', () => {
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();

      const stats = circuitBreaker.getStats();
      expect(stats.consecutiveFailures).toBe(2);
    });

    it('should include provider name in stats', () => {
      const stats = circuitBreaker.getStats();
      expect(stats.provider).toBe(AIProviderType.GROQ);
    });

    it('should include current state in stats', () => {
      const stats = circuitBreaker.getStats();
      expect(stats.state).toBe(CircuitBreakerState.CLOSED);
    });

    it('should track last failure time', () => {
      const beforeFailure = Date.now();
      circuitBreaker.recordFailure();
      const afterFailure = Date.now();

      const stats = circuitBreaker.getStats();
      expect(stats.lastFailureTime).toBeGreaterThanOrEqual(beforeFailure);
      expect(stats.lastFailureTime).toBeLessThanOrEqual(afterFailure);
    });
  });

  describe('Edge cases', () => {
    it('should handle recording success in OPEN state', () => {
      // Transition to OPEN
      for (let i = 0; i < 5; i++) {
        circuitBreaker.recordFailure();
      }

      // Success in OPEN state should not affect state until timeout
      circuitBreaker.recordSuccess();
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);
    });

    it('should handle rapid state transitions', () => {
      // CLOSED → OPEN
      for (let i = 0; i < 5; i++) {
        circuitBreaker.recordFailure();
      }
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);

      // OPEN → HALF_OPEN
      jest.advanceTimersByTime(300000);
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.HALF_OPEN);

      // HALF_OPEN → CLOSED
      circuitBreaker.recordSuccess();
      circuitBreaker.recordSuccess();
      circuitBreaker.recordSuccess();
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);
    });
  });
});
