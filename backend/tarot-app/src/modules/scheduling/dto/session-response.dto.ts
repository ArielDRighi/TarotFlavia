import { ApiProperty } from '@nestjs/swagger';
import { SessionStatus, SessionType, PaymentStatus } from '../enums';

export class SessionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  tarotistaId: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: '2025-11-15' })
  sessionDate: string;

  @ApiProperty({ example: '10:00' })
  sessionTime: string;

  @ApiProperty({ example: 60 })
  durationMinutes: number;

  @ApiProperty({ enum: SessionType, example: SessionType.TAROT_READING })
  sessionType: SessionType;

  @ApiProperty({ enum: SessionStatus, example: SessionStatus.PENDING })
  status: SessionStatus;

  @ApiProperty({ example: 50.0 })
  priceUsd: number;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @ApiProperty({ example: 'https://meet.google.com/abc-defg-hij' })
  googleMeetLink: string;

  @ApiProperty({ example: 'user@example.com' })
  userEmail: string;

  @ApiProperty({
    example: 'Quisiera enfocarme en mi carrera profesional',
    required: false,
  })
  userNotes?: string;

  @ApiProperty({ example: 'Cliente muy receptivo', required: false })
  tarotistNotes?: string;

  @ApiProperty({ example: null, required: false })
  cancelledAt?: Date;

  @ApiProperty({ example: null, required: false })
  cancellationReason?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  confirmedAt?: Date;

  @ApiProperty({ required: false })
  completedAt?: Date;
}

export class AvailableSlotDto {
  @ApiProperty({ example: '2025-11-15' })
  date: string;

  @ApiProperty({ example: '10:00' })
  time: string;

  @ApiProperty({ example: 60 })
  durationMinutes: number;

  @ApiProperty({ example: true })
  available: boolean;
}
