import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AuditAction } from '../enums/audit-action.enum';

export class CreateAuditLogDto {
  @ApiProperty({
    description: 'ID del usuario que realiza la acción',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiPropertyOptional({
    description: 'ID del usuario afectado por la acción (nullable)',
    example: 2,
  })
  @IsInt()
  @IsOptional()
  targetUserId?: number;

  @ApiProperty({
    description: 'Tipo de acción realizada',
    enum: AuditAction,
    example: AuditAction.USER_BANNED,
  })
  @IsEnum(AuditAction)
  @IsNotEmpty()
  action: AuditAction;

  @ApiProperty({
    description: 'Tipo de entidad afectada',
    example: 'User',
  })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({
    description: 'ID de la entidad afectada',
    example: '123',
  })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiPropertyOptional({
    description: 'Estado anterior de la entidad (jsonb)',
    example: { status: 'active' },
  })
  @IsOptional()
  oldValue?: Record<string, any>;

  @ApiProperty({
    description: 'Nuevo estado de la entidad (jsonb)',
    example: { status: 'banned', reason: 'Violation' },
  })
  @IsNotEmpty()
  newValue: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Dirección IP del usuario',
    example: '192.168.1.1',
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User agent del navegador',
    example: 'Mozilla/5.0',
  })
  @IsString()
  @IsOptional()
  userAgent?: string;
}
