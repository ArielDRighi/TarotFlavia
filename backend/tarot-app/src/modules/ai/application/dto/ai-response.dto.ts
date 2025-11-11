import { ApiProperty } from '@nestjs/swagger';

export class AIResponseDto {
  @ApiProperty()
  content: string;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  model: string;

  @ApiProperty({ required: false })
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  @ApiProperty({ required: false })
  metadata?: Record<string, any>;
}
