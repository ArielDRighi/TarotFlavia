import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  Matches,
  Min,
} from 'class-validator';
import { SessionType } from '../enums';

export class BookSessionDto {
  @ApiProperty({
    description: 'Tarotist ID',
    example: 1,
  })
  @IsInt()
  @Min(1)
  tarotistaId: number;

  @ApiProperty({
    description: 'Session date in YYYY-MM-DD format',
    example: '2025-11-20',
  })
  @IsDateString()
  sessionDate: string;

  @ApiProperty({
    description: 'Session time in HH:MM format',
    example: '10:00',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'sessionTime must be in HH:MM format',
  })
  sessionTime: string;

  @ApiProperty({
    description: 'Duration in minutes (30, 60, or 90)',
    example: 60,
    enum: [30, 60, 90],
  })
  @IsInt()
  @IsEnum([30, 60, 90])
  durationMinutes: number;

  @ApiProperty({
    description: 'Type of session',
    enum: SessionType,
    example: SessionType.TAROT_READING,
  })
  @IsEnum(SessionType)
  sessionType: SessionType;

  @ApiProperty({
    description: 'User notes or comments',
    example: 'I need guidance on my career path',
    required: false,
  })
  @IsOptional()
  @IsString()
  userNotes?: string;
}
