import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsDateString,
  IsOptional,
  Matches,
} from 'class-validator';
import { ExceptionType } from '../../domain/enums';

export class AddExceptionDto {
  @ApiProperty({
    description: 'Exception date in YYYY-MM-DD format',
    example: '2025-12-25',
  })
  @IsDateString()
  exceptionDate: string;

  @ApiProperty({
    description: 'Type of exception',
    enum: ExceptionType,
    example: ExceptionType.BLOCKED,
  })
  @IsEnum(ExceptionType)
  exceptionType: ExceptionType;

  @ApiProperty({
    description: 'Start time (required for custom_hours type)',
    example: '10:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime?: string;

  @ApiProperty({
    description: 'End time (required for custom_hours type)',
    example: '14:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:MM format',
  })
  endTime?: string;

  @ApiProperty({
    description: 'Reason for the exception',
    example: 'Christmas Holiday',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
