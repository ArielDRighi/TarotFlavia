import { ApiProperty } from '@nestjs/swagger';

export class NumberDetailDto {
  @ApiProperty({ example: 7 })
  value: number;

  @ApiProperty({ example: 'El Buscador' })
  name: string;

  @ApiProperty({ example: ['Análisis', 'Introspección'] })
  keywords: string[];

  @ApiProperty()
  description: string;

  @ApiProperty({ example: false })
  isMaster: boolean;
}

export class NumerologyResponseDto {
  @ApiProperty({ type: NumberDetailDto })
  lifePath: NumberDetailDto;

  @ApiProperty({ type: NumberDetailDto })
  birthday: NumberDetailDto;

  @ApiProperty({ type: NumberDetailDto, nullable: true })
  expression: NumberDetailDto | null;

  @ApiProperty({ type: NumberDetailDto, nullable: true })
  soulUrge: NumberDetailDto | null;

  @ApiProperty({ type: NumberDetailDto, nullable: true })
  personality: NumberDetailDto | null;

  @ApiProperty({ example: 5 })
  personalYear: number;

  @ApiProperty({ example: 8 })
  personalMonth: number;

  @ApiProperty({ example: '1990-03-25' })
  birthDate: string;

  @ApiProperty({ example: 'Juan Pérez', nullable: true })
  fullName: string | null;
}
