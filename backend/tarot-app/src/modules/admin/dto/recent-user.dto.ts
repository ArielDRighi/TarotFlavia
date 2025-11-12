import { ApiProperty } from '@nestjs/swagger';
import { UserPlan } from '../../users/entities/user.entity';

export class RecentUserDto {
  @ApiProperty({
    example: 1,
    description: 'ID único del usuario',
  })
  id: number;

  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email del usuario',
  })
  email: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario',
  })
  name: string;

  @ApiProperty({
    example: 'free',
    description: 'Plan del usuario',
    enum: UserPlan,
  })
  plan: UserPlan;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Fecha de registro del usuario',
  })
  createdAt: Date;
}
