import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { CorrelationIdService } from './correlation-id.service';

export interface LoggerConfig {
  level?: string;
  logDir?: string;
  maxFiles?: string;
  maxSize?: string;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  public readonly logger: winston.Logger;
  private readonly isDevelopment: boolean;

  constructor(private readonly correlationIdService: CorrelationIdService) {
    this.isDevelopment = process.env.NODE_ENV !== 'production';

    const logLevel = process.env.LOG_LEVEL || 'info';
    const logDir = process.env.LOG_DIR || './logs';
    const maxFiles = process.env.LOG_MAX_FILES || '14d';
    const maxSize = process.env.LOG_MAX_SIZE || '20m';

    // Custom format for structured JSON logging
    const jsonFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    );

    // Development format with colors
    const devFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.colorize(),
      winston.format.printf(
        ({
          timestamp,
          level,
          message,
          context,
          ...meta
        }: winston.Logform.TransformableInfo) => {
          const correlationId = this.correlationIdService.getCorrelationId();
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          const corrStr = correlationId ? ` [${correlationId}]` : '';
          const ctxStr = typeof context === 'string' ? ` [${context}]` : '';
          return `${String(timestamp)} ${String(level)}${corrStr}${ctxStr}: ${String(message)} ${metaStr}`;
        },
      ),
    );

    // Configure transports
    const transports: winston.transport[] = [
      // Console transport
      new winston.transports.Console({
        format: this.isDevelopment ? devFormat : jsonFormat,
      }),

      // Combined log file with rotation
      new DailyRotateFile({
        dirname: logDir,
        filename: 'combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize,
        maxFiles,
        format: jsonFormat,
      }),

      // Error log file with rotation
      new DailyRotateFile({
        dirname: logDir,
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize,
        maxFiles,
        format: jsonFormat,
      }),
    ];

    // Create Winston logger
    this.logger = winston.createLogger({
      level: logLevel,
      levels: winston.config.npm.levels,
      transports,
    });
  }

  /**
   * Build log object with common fields
   */
  private buildLogObject(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): Record<string, any> {
    const correlationId = this.correlationIdService.getCorrelationId();

    return {
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context }),
      ...(correlationId && { correlationId }),
      ...metadata,
    };
  }

  /**
   * Log an info level message
   */
  log(message: string, context?: string, metadata?: Record<string, any>): void {
    this.logger.info(this.buildLogObject(message, context, metadata));
  }

  /**
   * Log an error level message
   */
  error(
    message: string,
    trace?: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    this.logger.error(
      this.buildLogObject(message, context, {
        ...metadata,
        ...(trace && { stack: trace }),
      }),
    );
  }

  /**
   * Log a warning level message
   */
  warn(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    this.logger.warn(this.buildLogObject(message, context, metadata));
  }

  /**
   * Log a debug level message
   */
  debug(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    this.logger.debug(this.buildLogObject(message, context, metadata));
  }

  /**
   * Log a verbose level message
   */
  verbose(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    this.logger.verbose(this.buildLogObject(message, context, metadata));
  }

  /**
   * Log an HTTP request (custom level)
   */
  http(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    this.logger.http(this.buildLogObject(message, context, metadata));
  }
}
