import 'reflect-metadata';
import {
  RateLimit,
  RATE_LIMIT_OPTIONS_KEY,
  RateLimitOptions,
} from './rate-limit.decorator';

describe('RateLimit Decorator', () => {
  describe('Metadata', () => {
    it('should set metadata with ttl, limit, and blockDuration', () => {
      // Arrange
      const options: RateLimitOptions = {
        ttl: 3600,
        limit: 3,
        blockDuration: 3600,
      };

      // Act
      class TestController {
        @RateLimit(options)
        testMethod(): string {
          return 'test';
        }
      }

      // Assert
      const callback = TestController.prototype.testMethod;
      const metadata = Reflect.getMetadata(
        RATE_LIMIT_OPTIONS_KEY,
        callback,
      ) as unknown as RateLimitOptions;
      expect(metadata).toBeDefined();
      expect(metadata).toEqual(options);
    });

    it('should set metadata with default blockDuration if not provided', () => {
      // Arrange
      const options = {
        ttl: 3600,
        limit: 3,
      };

      // Act
      class TestController {
        @RateLimit(options)
        testMethod(): string {
          return 'test';
        }
      }

      // Assert
      const callback = TestController.prototype.testMethod;
      const metadata = Reflect.getMetadata(
        RATE_LIMIT_OPTIONS_KEY,
        callback,
      ) as unknown as RateLimitOptions;
      expect(metadata).toBeDefined();
      expect(metadata).toHaveProperty('ttl', 3600);
      expect(metadata).toHaveProperty('limit', 3);
      expect(metadata).toHaveProperty('blockDuration');
      expect(metadata.blockDuration).toBe(3600);
    });

    it('should allow different options for different methods', () => {
      // Arrange
      const options1: RateLimitOptions = {
        ttl: 3600,
        limit: 3,
        blockDuration: 3600,
      };
      const options2: RateLimitOptions = {
        ttl: 900,
        limit: 5,
        blockDuration: 900,
      };

      class TestController {
        @RateLimit(options1)
        method1(): string {
          return 'method1';
        }

        @RateLimit(options2)
        method2(): string {
          return 'method2';
        }
      }

      // Act & Assert
      const callback1 = TestController.prototype.method1;
      const callback2 = TestController.prototype.method2;

      const metadata1 = Reflect.getMetadata(
        RATE_LIMIT_OPTIONS_KEY,
        callback1,
      ) as unknown as RateLimitOptions;
      const metadata2 = Reflect.getMetadata(
        RATE_LIMIT_OPTIONS_KEY,
        callback2,
      ) as unknown as RateLimitOptions;

      expect(metadata1).toBeDefined();
      expect(metadata1).toEqual(options1);
      expect(metadata2).toBeDefined();
      expect(metadata2).toEqual(options2);
    });
  });
});
