import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  FindOptionsWhere,
} from 'typeorm';
import { SecurityEvent } from './entities/security-event.entity';
import { CreateSecurityEventDto } from './dto/create-security-event.dto';
import { QuerySecurityEventDto } from './dto/query-security-event.dto';
import { SecurityEventType } from './enums/security-event-type.enum';
import { SecurityEventSeverity } from './enums/security-event-severity.enum';
import { LoggerService } from '../../common/logger/logger.service';

export interface SecurityEventListResponse {
  events: SecurityEvent[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

@Injectable()
export class SecurityEventService {
  constructor(
    @InjectRepository(SecurityEvent)
    private readonly securityEventRepository: Repository<SecurityEvent>,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Log a security event to database and Winston logger
   */
  async logSecurityEvent(data: CreateSecurityEventDto): Promise<SecurityEvent> {
    const event = this.securityEventRepository.create(data);
    const savedEvent = await this.securityEventRepository.save(event);

    // Log to Winston based on severity
    this.logToWinston(savedEvent);

    return savedEvent;
  }

  /**
   * Log security event to Winston logger based on severity
   */
  private logToWinston(event: SecurityEvent): void {
    const logMessage = `Security Event: ${event.eventType}`;
    const metadata = {
      eventType: event.eventType,
      severity: event.severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      details: event.details,
    };

    switch (event.severity) {
      case SecurityEventSeverity.CRITICAL:
        this.logger.error(
          `CRITICAL ${logMessage}`,
          undefined,
          'SecurityEventService',
          metadata,
        );
        break;
      case SecurityEventSeverity.HIGH:
        this.logger.warn(logMessage, 'SecurityEventService', metadata);
        break;
      case SecurityEventSeverity.MEDIUM:
        this.logger.warn(logMessage, 'SecurityEventService', metadata);
        break;
      case SecurityEventSeverity.LOW:
        this.logger.log(logMessage, 'SecurityEventService', metadata);
        break;
    }
  }

  /**
   * Find all security events with filters and pagination
   */
  async findAll(
    query: QuerySecurityEventDto,
  ): Promise<SecurityEventListResponse> {
    const {
      userId,
      eventType,
      severity,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query;

    const where: FindOptionsWhere<SecurityEvent> = {};

    if (userId !== undefined) {
      where.userId = userId;
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (severity) {
      where.severity = severity;
    }

    // Support partial date ranges for flexible querying
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(new Date(endDate));
    }

    const skip = (page - 1) * limit;

    const [events, totalItems] =
      await this.securityEventRepository.findAndCount({
        where,
        relations: ['user'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

    return {
      events,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  /**
   * Detect suspicious activity based on failed login attempts
   */
  async detectSuspiciousActivity(
    ipAddress: string,
    userId?: number,
  ): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const where: FindOptionsWhere<SecurityEvent> = {
      eventType: SecurityEventType.FAILED_LOGIN,
      createdAt: MoreThanOrEqual(oneHourAgo),
      ipAddress,
    };

    if (userId) {
      where.userId = userId;
    }

    const failedAttempts = await this.securityEventRepository.count({
      where,
    });

    // Consider suspicious if more than 5 failed attempts in 1 hour
    return failedAttempts >= 5;
  }

  /**
   * Get count of failed login attempts for a user in the last hour
   */
  async getFailedLoginCount(userId: number): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    return await this.securityEventRepository.count({
      where: {
        userId,
        eventType: SecurityEventType.FAILED_LOGIN,
        createdAt: MoreThanOrEqual(oneHourAgo),
      },
    });
  }
}
