import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, Matches } from 'class-validator';
import { DayOfWeek } from '../enums';

export class SetWeeklyAvailabilityDto {
  @ApiProperty({
    description: 'Day of the week (0=Sunday, 6=Saturday)',
    example: 1,
    enum: DayOfWeek,
  })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({
    description: 'Start time in HH:MM format',
    example: '09:00',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time in HH:MM format',
    example: '18:00',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:MM format',
  })
  endTime: string;
}
