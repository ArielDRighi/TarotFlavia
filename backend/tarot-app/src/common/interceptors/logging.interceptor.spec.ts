import { Test, TestingModule } from '@nestjs/testing';
import { LoggingInterceptor } from './logging.interceptor';
import { LoggerService } from '../logger/logger.service';
import { CorrelationIdService } from '../logger/correlation-id.service';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let loggerService: LoggerService;
  let correlationIdService: CorrelationIdService;

  const mockRequest = {
    method: 'GET',
    url: '/test-endpoint',
    user: { id: 123 },
  };

  const mockResponse = {
    statusCode: 200,
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn().mockReturnValue(mockResponse),
    } as unknown as HttpArgumentsHost),
  } as unknown as ExecutionContext;

  const mockCallHandler = {
    handle: jest.fn(),
  } as unknown as CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingInterceptor,
        {
          provide: LoggerService,
          useValue: {
            http: jest.fn(),
            error: jest.fn(),
          },
        },
        CorrelationIdService,
      ],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
    loggerService = module.get<LoggerService>(LoggerService);
    correlationIdService =
      module.get<CorrelationIdService>(CorrelationIdService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should log HTTP request on start', (done) => {
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of('test'));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        complete: () => {
          expect(loggerService.http).toHaveBeenCalledWith(
            'HTTP Request',
            'HTTPLogger',
            expect.objectContaining({
              method: 'GET',
              url: '/test-endpoint',
              userId: 123,
            }),
          );
          done();
        },
      });
    });

    it('should log HTTP response on completion', (done) => {
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of('test'));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        complete: () => {
          expect(loggerService.http).toHaveBeenCalledWith(
            'HTTP Response',
            'HTTPLogger',
            expect.objectContaining({
              method: 'GET',
              url: '/test-endpoint',
              statusCode: 200,
            }),
          );
          done();
        },
      });
    });

    it('should include duration in response log', (done) => {
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of('test'));

      void interceptor
        .intercept(mockExecutionContext, mockCallHandler)
        .subscribe({
          complete: () => {
            const responseCalls = (
              loggerService.http as jest.Mock
            ).mock.calls.filter(
              (call: unknown[]) => call[0] === 'HTTP Response',
            ) as [string, string, Record<string, unknown>][];

            expect(responseCalls).toHaveLength(1);
            expect(responseCalls[0][2]).toHaveProperty('duration');
            expect(String(responseCalls[0][2].duration)).toMatch(/^\d+ms$/);
            done();
          },
        });
    });

    it('should include correlationId if present', (done) => {
      const testCorrelationId = 'test-correlation-123';
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of('test'));

      void correlationIdService.runWithCorrelationId(testCorrelationId, () => {
        void interceptor
          .intercept(mockExecutionContext, mockCallHandler)
          .subscribe({
            complete: () => {
              expect(loggerService.http).toHaveBeenCalledWith(
                'HTTP Request',
                'HTTPLogger',
                expect.objectContaining({
                  correlationId: testCorrelationId,
                }),
              );
              done();
            },
          });
      });
    });

    it('should handle requests without user', (done) => {
      const mockRequestNoUser = {
        method: 'POST',
        url: '/public-endpoint',
      };

      const mockContextNoUser = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequestNoUser),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      } as unknown as ExecutionContext;

      (mockCallHandler.handle as jest.Mock).mockReturnValue(of('test'));

      void interceptor.intercept(mockContextNoUser, mockCallHandler).subscribe({
        complete: () => {
          expect(loggerService.http).toHaveBeenCalledWith(
            'HTTP Request',
            'HTTPLogger',
            expect.objectContaining({
              method: 'POST',
              url: '/public-endpoint',
            }),
          );

          const requestCall = (loggerService.http as jest.Mock).mock.calls.find(
            (call: unknown[]) => call[0] === 'HTTP Request',
          ) as [string, string, Record<string, unknown>] | undefined;

          if (requestCall) {
            expect(requestCall[2]).not.toHaveProperty('userId');
          }
          done();
        },
      });
    });

    it('should log errors', (done) => {
      const testError = new Error('Test error');
      (mockCallHandler.handle as jest.Mock).mockReturnValue(
        throwError(() => testError),
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: (error) => {
          expect(loggerService.error).toHaveBeenCalledWith(
            'HTTP Request Error',
            expect.any(String),
            'HTTPLogger',
            expect.objectContaining({
              method: 'GET',
              url: '/test-endpoint',
              error: testError.message,
            }),
          );
          expect(error).toBe(testError);
          done();
        },
      });
    });
  });
});
