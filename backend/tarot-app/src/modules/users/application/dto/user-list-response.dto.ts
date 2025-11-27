import { ApiProperty } from '@nestjs/swagger';
import { UserWithoutPassword } from '../../entities/user.entity';

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Número de página actual',
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    description: 'Cantidad de resultados por página',
    example: 10,
  })
  itemsPerPage: number;

  @ApiProperty({
    description: 'Total de resultados',
    example: 150,
  })
  totalItems: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 15,
  })
  totalPages: number;
}

export class UserListResponseDto {
  @ApiProperty({
    description: 'Lista de usuarios',
    type: [Object],
  })
  users: UserWithoutPassword[];

  @ApiProperty({
    description: 'Metadatos de paginación',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
