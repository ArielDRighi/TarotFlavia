import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetFavoriteTarotistaDto {
  @ApiProperty({
    example: 2,
    description: 'ID del tarotista a establecer como favorito',
  })
  @IsInt()
  @IsPositive()
  tarotistaId: number;
}
