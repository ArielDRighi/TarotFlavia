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
  @ApiPropertyOptional({
    description:
      'ID del usuario que realiza la acción (nullable si el admin fue eliminado)',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  userId?: number | null;

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
    description: 'Dirección IP desde donde se realizó la acción',
    example: '192.168.1.1',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  ipAddress?: string | null;

  @ApiPropertyOptional({
    description: 'User agent del navegador',
    example: 'Mozilla/5.0',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  userAgent?: string | null;
}
