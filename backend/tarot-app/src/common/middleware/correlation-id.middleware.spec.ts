import { Test, TestingModule } from '@nestjs/testing';
import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { CorrelationIdService } from '../logger/correlation-id.service';
import { Request, Response, NextFunction } from 'express';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;
  let correlationIdService: CorrelationIdService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorrelationIdMiddleware, CorrelationIdService],
    }).compile();

    middleware = module.get<CorrelationIdMiddleware>(CorrelationIdMiddleware);
    correlationIdService =
      module.get<CorrelationIdService>(CorrelationIdService);

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      setHeader: jest.fn(),
    };

    mockNext = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should generate new correlation ID if not present in request headers', () => {
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.setHeader).toHaveBeenCalled();
      const setHeaderCalls = (mockResponse.setHeader as jest.Mock).mock
        .calls as [string, string][];
      const correlationIdCall = setHeaderCalls.find(
        (call) => call[0] === 'X-Correlation-ID',
      );

      expect(correlationIdCall).toBeDefined();
      if (correlationIdCall) {
        expect(correlationIdCall[1]).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        );
      }
    });

    it('should use existing correlation ID from request headers', () => {
      const existingId = '12345678-1234-4234-b234-123456789012';
      mockRequest.headers = {
        'x-correlation-id': existingId,
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Correlation-ID',
        existingId,
      );
    });

    it('should set correlation ID in CorrelationIdService', () => {
      const spy = jest.spyOn(correlationIdService, 'runWithCorrelationId');

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should call next() function', () => {
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle lowercase header name', () => {
      const existingId = '12345678-1234-4234-b234-123456789012';
      mockRequest.headers = {
        'x-correlation-id': existingId,
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Correlation-ID',
        existingId,
      );
    });

    it('should set correlation ID available within context', async () => {
      let capturedId: string | undefined;

      const customNext = jest.fn(() => {
        capturedId = correlationIdService.getCorrelationId();
      });

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        customNext,
      );

      // Wait for async context to be set
      await new Promise<void>((resolve) => setImmediate(resolve));

      expect(capturedId).toBeDefined();
      if (capturedId) {
        expect(capturedId).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        );
      }
    });
  });
});
