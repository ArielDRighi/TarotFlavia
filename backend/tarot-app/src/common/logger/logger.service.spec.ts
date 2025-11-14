import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './logger.service';
import { CorrelationIdService } from './correlation-id.service';
import * as winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';

describe('LoggerService', () => {
  let service: LoggerService;
  let correlationIdService: CorrelationIdService;
  const testLogDir = path.join(__dirname, '../../../test-logs');

  beforeAll(() => {
    // Create and clean test logs directory
    if (!fs.existsSync(testLogDir)) {
      fs.mkdirSync(testLogDir, { recursive: true });
    } else {
      fs.rmSync(testLogDir, { recursive: true, force: true });
      fs.mkdirSync(testLogDir, { recursive: true });
    }
  });

  beforeEach(async () => {
    // Set environment variables for testing
    process.env.NODE_ENV = 'test'; // Prevent file logging in tests
    process.env.LOG_LEVEL = 'debug';
    process.env.LOG_DIR = testLogDir;
    process.env.LOG_MAX_FILES = '1d';
    process.env.LOG_MAX_SIZE = '1m';

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
      providers: [LoggerService, CorrelationIdService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
    correlationIdService =
      module.get<CorrelationIdService>(CorrelationIdService);
  });

  afterAll(() => {
    // Clean test logs after all tests
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should log with info level', () => {
      const spy = jest.spyOn(service.logger, 'info');
      service.log('Test message', 'TestContext');

      expect(spy).toHaveBeenCalled();
      const call = spy.mock.calls[0][0] as Record<string, any>;
      expect(call.message).toBe('Test message');
      spy.mockRestore();
    });

    it('should include context in log', () => {
      const spy = jest.spyOn(service.logger, 'info');
      service.log('Test message', 'MyContext');

      expect(spy).toHaveBeenCalled();
      const call = spy.mock.calls[0][0] as Record<string, any>;
      expect(call).toMatchObject({
        context: 'MyContext',
      });
      spy.mockRestore();
    });

    it('should include correlationId if present', async () => {
      const testId = 'test-correlation-123';
      const spy = jest.spyOn(service.logger, 'info');

      await correlationIdService.runWithCorrelationId(testId, () => {
        service.log('Test with correlation', 'TestContext');
      });

      expect(spy).toHaveBeenCalled();
      const call = spy.mock.calls[0][0] as Record<string, any>;
      expect(call).toMatchObject({
        correlationId: testId,
      });
      spy.mockRestore();
    });

    it('should include metadata if provided', () => {
      const spy = jest.spyOn(service.logger, 'info');
      const metadata = { userId: 123, action: 'test' };

      service.log('Test with metadata', 'TestContext', metadata);

      expect(spy).toHaveBeenCalled();
      const call = spy.mock.calls[0][0] as Record<string, any>;
      expect(call).toMatchObject(metadata);
      spy.mockRestore();
    });
  });

  describe('error', () => {
    it('should log with error level', () => {
      const spy = jest.spyOn(service.logger, 'error');
      service.error('Error message', undefined, 'TestContext');

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should include stack trace if provided', () => {
      const spy = jest.spyOn(service.logger, 'error');
      const error = new Error('Test error');

      service.error('Error occurred', error.stack, 'TestContext');

      expect(spy).toHaveBeenCalled();
      const call = spy.mock.calls[0][0] as Record<string, any>;
      expect(call).toMatchObject({
        stack: error.stack,
      });
      spy.mockRestore();
    });
  });

  describe('warn', () => {
    it('should log with warn level', () => {
      const spy = jest.spyOn(service.logger, 'warn');
      service.warn('Warning message', 'TestContext');

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('debug', () => {
    it('should log with debug level', () => {
      const spy = jest.spyOn(service.logger, 'debug');
      service.debug('Debug message', 'TestContext');

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('verbose', () => {
    it('should log with verbose level', () => {
      const spy = jest.spyOn(service.logger, 'verbose');
      service.verbose('Verbose message', 'TestContext');

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('http', () => {
    it('should log with http level', () => {
      const spy = jest.spyOn(service.logger, 'http');
      service.http('HTTP request', 'HTTPContext', {
        method: 'GET',
        url: '/test',
      });

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('format', () => {
    it('should create structured JSON logs', () => {
      const spy = jest.spyOn(service.logger, 'info');
      service.log('Test', 'Context');

      expect(spy).toHaveBeenCalled();
      const logObject = spy.mock.calls[0][0];

      expect(logObject).toHaveProperty('timestamp');
      expect(logObject).toHaveProperty('message');
      expect(logObject).toHaveProperty('context');

      spy.mockRestore();
    });
  });

  describe('transports', () => {
    it('should have console transport', () => {
      const transports = service.logger.transports;
      const hasConsole = transports.some(
        (t: winston.transport) => t instanceof winston.transports.Console,
      );
      expect(hasConsole).toBe(true);
    });

    it('should NOT have file transports in test environment', () => {
      const transports = service.logger.transports;
      const hasFile = transports.some(
        (t: winston.transport) => t.constructor.name === 'DailyRotateFile',
      );
      expect(hasFile).toBe(false);
    });
  });

  afterAll(() => {
    // Close logger to prevent hanging file handles
    if (service && service.logger) {
      // Suppress errors during close
      service.logger.on('error', () => {
        // Ignore errors during cleanup
      });
      service.logger.close();
    }

    // Clean up test logs
    if (fs.existsSync(testLogDir)) {
      try {
        fs.rmSync(testLogDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  });
});
