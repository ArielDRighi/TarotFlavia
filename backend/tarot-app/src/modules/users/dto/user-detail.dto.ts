import { ApiProperty } from '@nestjs/swagger';
import { UserWithoutPassword } from '../entities/user.entity';

export class UserStatisticsDto {
  @ApiProperty({
    description: 'Total de lecturas del usuario',
    example: 45,
  })
  totalReadings: number;

  @ApiProperty({
    description: 'Fecha de la última lectura',
    example: '2023-12-01T10:30:00Z',
    nullable: true,
  })
  lastReadingDate: Date | null;

  @ApiProperty({
    description: 'Total de uso de OpenAI (interpretaciones)',
    example: 42,
  })
  totalAIUsage: number;
}

export class UserDetailDto {
  @ApiProperty({
    description: 'Información completa del usuario sin contraseña',
  })
  user: UserWithoutPassword;

  @ApiProperty({
    description: 'Estadísticas del usuario',
    type: UserStatisticsDto,
  })
  statistics: UserStatisticsDto;
}
