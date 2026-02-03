import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../../entities/user-notification.entity';

export class NotificationDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.SACRED_EVENT,
  })
  type: NotificationType;

  @ApiProperty({ example: 'Hoy: Luna Nueva en Acuario' })
  title: string;

  @ApiProperty({
    example:
      'La luna nueva en Acuario es perfecta para rituales de innovación y nuevos comienzos.',
  })
  message: string;

  @ApiPropertyOptional({
    example: { eventId: 5, lunarPhase: 'new_moon' },
    nullable: true,
  })
  data: Record<string, any> | null;

  @ApiPropertyOptional({
    example: '/rituales?lunar=new_moon',
    nullable: true,
  })
  actionUrl: string | null;

  @ApiProperty({ example: false })
  read: boolean;

  @ApiPropertyOptional({ example: '2026-02-02T10:30:00Z', nullable: true })
  readAt: Date | null;

  @ApiProperty({ example: '2026-02-02T09:00:00Z' })
  createdAt: Date;
}

export class UnreadCountDto {
  @ApiProperty({ example: 5 })
  count: number;
}
