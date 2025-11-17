import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  MaxLength,
} from 'class-validator';
import { SecurityEventType } from '../enums/security-event-type.enum';
import { SecurityEventSeverity } from '../enums/security-event-severity.enum';

export class CreateSecurityEventDto {
  @IsEnum(SecurityEventType)
  eventType: SecurityEventType;

  @IsOptional()
  @IsNumber()
  userId?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress?: string | null;

  @IsOptional()
  @IsString()
  userAgent?: string | null;

  @IsEnum(SecurityEventSeverity)
  severity: SecurityEventSeverity;

  @IsOptional()
  @IsObject()
  details?: Record<string, unknown> | null;
}
