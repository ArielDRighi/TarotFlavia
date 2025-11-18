import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

class ShareEmailDto {
  recipientEmail: string;
  subject?: string;
  additionalMessage?: string;
}

class ShareSocialDto {
  network: string;
  message?: string;
}

@ApiTags('Compartir Lecturas')
@Controller('readings/:id/share')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ShareController {
  constructor() {}

  @Post('email')
  @ApiOperation({
    summary: 'Compartir lectura por email',
    description:
      'Envía la interpretación de una lectura a un correo electrónico',
  })
  @ApiParam({ name: 'id', description: 'ID de la lectura a compartir' })
  @ApiBody({ type: ShareEmailDto })
  shareByEmail(
    @Param('id', ParseIntPipe) id: number,
    @Body() emailDto: ShareEmailDto,
    @Request() req: { user: { userId: number } },
  ) {
    const userId: number = req.user.userId;
    return {
      message: 'Share by email functionality to be implemented',
      readingId: id,
      userId: userId,
      emailDto,
    };
  }

  @Post('social')
  @ApiOperation({
    summary: 'Compartir lectura en redes sociales',
    description: 'Comparte la interpretación en una red social',
  })
  @ApiParam({ name: 'id', description: 'ID de la lectura a compartir' })
  @ApiBody({ type: ShareSocialDto })
  shareSocial(
    @Param('id', ParseIntPipe) id: number,
    @Body() socialDto: ShareSocialDto,
    @Request() req: { user: { userId: number } },
  ) {
    const userId: number = req.user.userId;
    return {
      message: 'Share on social media functionality to be implemented',
      readingId: id,
      userId: userId,
      network: socialDto.network,
    };
  }
}
