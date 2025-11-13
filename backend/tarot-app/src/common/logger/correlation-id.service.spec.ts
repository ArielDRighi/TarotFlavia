import { Test, TestingModule } from '@nestjs/testing';
import { CorrelationIdService } from './correlation-id.service';

describe('CorrelationIdService', () => {
  let service: CorrelationIdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorrelationIdService],
    }).compile();

    service = module.get<CorrelationIdService>(CorrelationIdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setCorrelationId', () => {
    it('should set correlationId in AsyncLocalStorage within context', async () => {
      const testId = 'test-correlation-id';
      const newId = 'updated-id';
      let retrieved: string | undefined;

      await service.runWithCorrelationId(testId, () => {
        service.setCorrelationId(newId);
        retrieved = service.getCorrelationId();
      });

      expect(retrieved).toBe(newId);
    });
  });

  describe('getCorrelationId', () => {
    it('should return correlationId if set', async () => {
      const testId = 'my-correlation-id';
      let result: string | undefined;

      await service.runWithCorrelationId(testId, () => {
        result = service.getCorrelationId();
      });

      expect(result).toBe(testId);
    });

    it('should return undefined if no correlationId is set', () => {
      const result = service.getCorrelationId();

      expect(result).toBeUndefined();
    });
  });

  describe('runWithCorrelationId', () => {
    it('should execute callback with correlationId in context', async () => {
      const testId = 'test-id-123';
      let capturedId: string | undefined;

      await service.runWithCorrelationId(testId, () => {
        capturedId = service.getCorrelationId();
      });

      expect(capturedId).toBe(testId);
    });

    it('should isolate correlationId between different executions', async () => {
      const id1 = 'id-1';
      const id2 = 'id-2';
      const results: string[] = [];

      const promise1 = service.runWithCorrelationId(id1, () => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            results.push(service.getCorrelationId() || 'undefined');
            resolve();
          }, 10);
        });
      });

      const promise2 = service.runWithCorrelationId(id2, () => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            results.push(service.getCorrelationId() || 'undefined');
            resolve();
          }, 5);
        });
      });

      await Promise.all([promise1, promise2]);

      expect(results).toContain(id1);
      expect(results).toContain(id2);
    });

    it('should return the result of the callback', async () => {
      const testId = 'test-id';
      const expectedResult = 'callback-result';

      const result = await service.runWithCorrelationId(testId, () => {
        return expectedResult;
      });

      expect(result).toBe(expectedResult);
    });
  });

  describe('generateCorrelationId', () => {
    it('should generate a valid UUID v4', () => {
      const id = service.generateCorrelationId();

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it('should generate unique IDs', () => {
      const id1 = service.generateCorrelationId();
      const id2 = service.generateCorrelationId();

      expect(id1).not.toBe(id2);
    });
  });
});
