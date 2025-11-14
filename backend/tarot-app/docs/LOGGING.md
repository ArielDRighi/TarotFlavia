# 📋 Logging System Documentation

## Overview

The Tarot application uses **Winston** for structured JSON logging with correlation ID tracing for debugging and observability in production. All logs are formatted consistently and can be easily searched and analyzed.

## Architecture

### Components

1. **LoggerService** - Wrapper around Winston with structured JSON logging
2. **CorrelationIdService** - Manages correlation IDs using Node.js AsyncLocalStorage
3. **CorrelationIdMiddleware** - Generates/extracts correlation ID for each HTTP request
4. **LoggingInterceptor** - Logs HTTP requests and responses with duration

### Features

- ✅ Structured JSON logging
- ✅ Correlation ID for request tracing
- ✅ Multiple log levels (error, warn, info, http, debug, verbose)
- ✅ Multiple transports (console, rotating files)
- ✅ Automatic log rotation (daily, size-based)
- ✅ Different formats for development vs production
- ✅ HTTP request/response logging with duration
- ✅ Error logging with stack traces
- ✅ Configurable via environment variables

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Log level: 'error', 'warn', 'info', 'http', 'verbose', 'debug'
LOG_LEVEL=info

# Log files directory
LOG_DIR=./logs

# Log file retention period (examples: '7d', '14d', '30d')
LOG_MAX_FILES=14d

# Maximum log file size (examples: '10m', '20m', '50m')
LOG_MAX_SIZE=20m
```

### Defaults

If environment variables are not set, the following defaults apply:

- `LOG_LEVEL`: `info`
- `LOG_DIR`: `./logs`
- `LOG_MAX_FILES`: `14d` (14 days)
- `LOG_MAX_SIZE`: `20m` (20 MB)

## Usage

### Basic Logging

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class MyService {
  constructor(private readonly logger: LoggerService) {}

  someMethod() {
    // Info level
    this.logger.log('User created successfully', 'MyService', {
      userId: 123,
      email: 'user@example.com',
    });

    // Warning level
    this.logger.warn('API rate limit approaching', 'MyService', {
      currentUsage: 95,
      limit: 100,
    });

    // Error level with stack trace
    try {
      // ... some code
    } catch (error) {
      this.logger.error(
        'Failed to process payment',
        error instanceof Error ? error.stack : undefined,
        'MyService',
        {
          userId: 123,
          amount: 50.0,
        },
      );
    }

    // Debug level (only in debug mode)
    this.logger.debug('Processing reading request', 'MyService', {
      spreadType: 'three-card',
      userId: 123,
    });

    // HTTP level (for custom HTTP logs)
    this.logger.http('External API called', 'MyService', {
      url: 'https://api.example.com/v1/data',
      method: 'POST',
      statusCode: 200,
    });

    // Verbose level
    this.logger.verbose('Cache hit for user data', 'MyService', {
      userId: 123,
      cacheKey: 'user:123',
    });
  }
}
```

### Log Levels

Levels in order of priority (highest to lowest):

1. **error** - Errors and exceptions
2. **warn** - Warning messages
3. **info** - General informational messages (default)
4. **http** - HTTP request/response logs
5. **verbose** - Detailed operation logs
6. **debug** - Debug information for development

**Note**: When `LOG_LEVEL` is set to a level, all higher priority levels are also logged.  
Example: `LOG_LEVEL=info` will log `error`, `warn`, and `info`, but not `http`, `verbose`, or `debug`.

### Log Methods

```typescript
// Info (general information)
logger.log(message: string, context?: string, metadata?: object): void

// Error (with optional stack trace)
logger.error(message: string, trace?: string, context?: string, metadata?: object): void

// Warning
logger.warn(message: string, context?: string, metadata?: object): void

// Debug
logger.debug(message: string, context?: string, metadata?: object): void

// Verbose
logger.verbose(message: string, context?: string, metadata?: object): void

// HTTP
logger.http(message: string, context?: string, metadata?: object): void
```

### Parameters

- **message** (required): The log message
- **context** (optional): The source of the log (usually service/controller name)
- **metadata** (optional): Additional structured data to log
- **trace** (error only): Stack trace string

## Correlation ID Tracing

Every HTTP request gets a unique **correlation ID** that is propagated through the entire request lifecycle.

### How It Works

1. **CorrelationIdMiddleware** generates a UUID for each request (or uses existing from header)
2. Correlation ID is stored in **AsyncLocalStorage** (available throughout the request)
3. **LoggerService** automatically includes correlation ID in all logs
4. Correlation ID is returned in `X-Correlation-ID` response header

### Using Correlation ID

The correlation ID is automatically included in logs when available:

```typescript
// Within an HTTP request handler
this.logger.log('Reading created', 'ReadingsController', {
  readingId: 456,
  userId: 123,
});
```

**Output**:

```json
{
  "timestamp": "2025-11-13T10:30:00.000Z",
  "level": "info",
  "message": "Reading created",
  "context": "ReadingsController",
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "readingId": 456,
  "userId": 123
}
```

### Searching Logs by Correlation ID

To trace a specific request across all logs:

```bash
# In combined logs
grep "a1b2c3d4-e5f6-7890-abcd-ef1234567890" logs/combined-2025-11-13.log

# With jq for pretty JSON
grep "a1b2c3d4" logs/combined-2025-11-13.log | jq '.'
```

### Client Usage

Clients can send their own correlation ID:

```bash
curl -H "X-Correlation-ID: my-custom-id-123" https://api.tarot.com/readings
```

The server will use this ID and return it in the response header.

## Log Structure

### Development Format

Colored, human-readable format for console:

```
2025-11-13 10:30:00 info [a1b2c3d4] [ReadingsService]: Reading created {"userId":123,"readingId":456}
```

### Production Format

Structured JSON for parsing and analysis:

```json
{
  "timestamp": "2025-11-13T10:30:00.000Z",
  "level": "info",
  "message": "Reading created",
  "context": "ReadingsService",
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": 123,
  "readingId": 456
}
```

## Log Files

### File Structure

```
logs/
├── combined-2025-11-13.log    # All logs (info and above)
├── combined-2025-11-14.log
├── error-2025-11-13.log       # Error logs only
├── error-2025-11-14.log
└── ...
```

### Rotation

- **Daily rotation**: New file created each day
- **Size-based rotation**: New file when current exceeds `LOG_MAX_SIZE`
- **Retention**: Old files deleted after `LOG_MAX_FILES` period
- **Naming**: Files include date in format `YYYY-MM-DD`

## HTTP Request Logging

All HTTP requests are automatically logged by **LoggingInterceptor**:

### Request Log

```json
{
  "timestamp": "2025-11-13T10:30:00.000Z",
  "level": "http",
  "message": "HTTP Request",
  "context": "HTTPLogger",
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "method": "POST",
  "url": "/readings",
  "userId": 123
}
```

### Response Log

```json
{
  "timestamp": "2025-11-13T10:30:01.245Z",
  "level": "http",
  "message": "HTTP Response",
  "context": "HTTPLogger",
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "method": "POST",
  "url": "/readings",
  "statusCode": 201,
  "duration": "245ms",
  "userId": 123
}
```

### Error Log

```json
{
  "timestamp": "2025-11-13T10:30:01.100Z",
  "level": "error",
  "message": "HTTP Request Error",
  "context": "HTTPLogger",
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "method": "POST",
  "url": "/readings",
  "duration": "100ms",
  "error": "Insufficient credits",
  "userId": 123,
  "stack": "Error: Insufficient credits\n    at ..."
}
```

## Best Practices

### ✅ DO

- **Always provide context** (service/controller name) for better log filtering
- **Include relevant metadata** (userId, readingId, etc.) for debugging
- **Log important business events** (user created, reading generated, payment processed)
- **Log errors with stack traces** for debugging
- **Use appropriate log levels** based on severity
- **Use correlation ID** to trace requests across logs

### ❌ DON'T

- **Don't log sensitive data** (passwords, tokens, credit card numbers, PII)
- **Don't log in tight loops** (can overwhelm logs and impact performance)
- **Don't use `console.log`** in production code (use LoggerService instead)
- **Don't log entire objects** (log only relevant fields)
- **Don't use debug logs in production** (set `LOG_LEVEL=info` or higher)

### Security & Privacy

```typescript
// ❌ BAD - Logging sensitive data
this.logger.log('User login', 'AuthService', {
  email: 'user@example.com',
  password: 'secretpassword123', // NEVER LOG PASSWORDS
  token: 'eyJhbGciOiJIUzI1NiIs...', // NEVER LOG TOKENS
});

// ✅ GOOD - Logging safe data
this.logger.log('User login successful', 'AuthService', {
  userId: 123,
  email: 'user@example.com',
});
```

### Performance

```typescript
// ❌ BAD - Logging in tight loops
for (const card of cards) {
  this.logger.debug('Processing card', 'CardsService', card); // Avoid in loops
}

// ✅ GOOD - Log once with summary
this.logger.debug('Processing cards batch', 'CardsService', {
  count: cards.length,
  cardIds: cards.map((c) => c.id),
});
```

## Querying Logs

### Using grep

```bash
# Find all errors
grep '"level":"error"' logs/combined-2025-11-13.log

# Find logs for specific user
grep '"userId":123' logs/combined-2025-11-13.log

# Find logs by correlation ID
grep "a1b2c3d4" logs/combined-2025-11-13.log

# Find logs by context
grep '"context":"ReadingsService"' logs/combined-2025-11-13.log
```

### Using jq (JSON processor)

```bash
# Pretty print all logs
cat logs/combined-2025-11-13.log | jq '.'

# Filter by level
cat logs/combined-2025-11-13.log | jq 'select(.level == "error")'

# Filter by user
cat logs/combined-2025-11-13.log | jq 'select(.userId == 123)'

# Filter by context
cat logs/combined-2025-11-13.log | jq 'select(.context == "ReadingsService")'

# Get unique contexts
cat logs/combined-2025-11-13.log | jq -r '.context' | sort | uniq

# Count errors
cat logs/combined-2025-11-13.log | jq 'select(.level == "error")' | wc -l
```

## Cloud Logging (Production)

For production deployments, consider sending logs to external services:

### Supported Services

- **Datadog** - Full observability platform
- **Logtail** - Log management and analysis
- **AWS CloudWatch** - AWS native logging
- **Google Cloud Logging** - GCP native logging
- **Splunk** - Enterprise log management

### Example: Datadog Integration

```typescript
// In logger.service.ts - add Datadog transport
import { DatadogTransport } from 'winston-datadog';

transports.push(
  new DatadogTransport({
    apiKey: process.env.DATADOG_API_KEY,
    hostname: process.env.HOSTNAME,
    service: 'tarot-api',
    ddsource: 'nodejs',
    ddtags: `env:${process.env.NODE_ENV}`,
  }),
);
```

## Troubleshooting

### Logs not appearing

1. Check `LOG_LEVEL` environment variable
2. Verify `logs/` directory exists and is writable
3. Check console for startup errors
4. Ensure `LoggerModule` is imported in `AppModule`

### File rotation not working

1. Check `LOG_MAX_FILES` and `LOG_MAX_SIZE` configuration
2. Verify disk space is available
3. Check file permissions on `logs/` directory

### Performance issues

1. Reduce `LOG_LEVEL` (use `info` or `warn` in production)
2. Avoid logging in tight loops
3. Consider async logging for high-throughput applications
4. Use log sampling for very high-volume logs

## References

- [Winston Documentation](https://github.com/winstonjs/winston)
- [Winston Daily Rotate File](https://github.com/winstonjs/winston-daily-rotate-file)
- [NestJS Logging](https://docs.nestjs.com/techniques/logger)
- [Node.js AsyncLocalStorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage)

## Examples

### Example 1: Reading Creation

```typescript
@Injectable()
export class ReadingsService {
  constructor(private readonly logger: LoggerService) {}

  async create(userId: number, data: CreateReadingDto) {
    this.logger.log('Creating reading', 'ReadingsService', {
      userId,
      spreadType: data.spreadType,
    });

    try {
      const reading = await this.readingsRepository.save({
        userId,
        ...data,
      });

      this.logger.log('Reading created successfully', 'ReadingsService', {
        userId,
        readingId: reading.id,
        spreadType: reading.spreadType,
      });

      return reading;
    } catch (error) {
      this.logger.error(
        'Failed to create reading',
        error.stack,
        'ReadingsService',
        {
          userId,
          spreadType: data.spreadType,
          error: error.message,
        },
      );
      throw error;
    }
  }
}
```

### Example 2: AI Service Call

```typescript
@Injectable()
export class InterpretationsService {
  constructor(private readonly logger: LoggerService) {}

  async generateInterpretation(reading: Reading) {
    const startTime = Date.now();

    this.logger.debug('Calling AI service', 'InterpretationsService', {
      provider: 'groq',
      model: 'llama-3.3-70b-versatile',
      readingId: reading.id,
    });

    try {
      const result = await this.aiClient.complete(prompt);
      const duration = Date.now() - startTime;

      this.logger.log('AI interpretation generated', 'InterpretationsService', {
        readingId: reading.id,
        provider: 'groq',
        duration: `${duration}ms`,
        tokens: result.usage.total_tokens,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        'AI service call failed',
        error.stack,
        'InterpretationsService',
        {
          readingId: reading.id,
          provider: 'groq',
          duration: `${duration}ms`,
          error: error.message,
        },
      );

      throw error;
    }
  }
}
```

---

**Last Updated**: November 13, 2025  
**Version**: 1.0.0  
**Author**: Tarot Development Team
