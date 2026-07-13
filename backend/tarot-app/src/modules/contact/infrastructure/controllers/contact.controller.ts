import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RateLimit } from '../../../../common/decorators/rate-limit.decorator';
import { SendContactMessageDto } from '../../application/dto/send-contact-message.dto';
import {
  SendContactMessageResult,
  SendContactMessageUseCase,
} from '../../application/use-cases/send-contact-message.use-case';

@ApiTags('Contacto')
@Controller('contact')
export class ContactController {
  constructor(
    private readonly sendContactMessageUseCase: SendContactMessageUseCase,
  ) {}

  /**
   * Endpoint público (sin JwtAuthGuard): lo usa un visitante sin cuenta.
   * Por eso el rate limit es obligatorio — sin él sería un buzón de spam abierto.
   */
  @Post()
  @RateLimit({ ttl: 3600, limit: 3, blockDuration: 3600 }) // 3 mensajes/hora por IP
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // Enforce: 3 req/hour (ttl en ms)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Enviar un mensaje desde el formulario de contacto',
    description:
      'Envía el mensaje al buzón de contacto de Auguria, con el email del remitente como Reply-To. Endpoint público, limitado a 3 mensajes por hora por IP.',
  })
  @ApiBody({
    type: SendContactMessageDto,
    examples: {
      ejemplo1: {
        summary: 'Consulta de un visitante',
        value: {
          name: 'Ana Pérez',
          email: 'ana@example.com',
          subject: 'Consulta por una lectura',
          message: 'Hola, quería saber cómo reservar una sesión.',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Mensaje enviado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos del formulario inválidos' })
  @ApiResponse({
    status: 429,
    description: 'Demasiados mensajes. Límite: 3 por hora',
  })
  @ApiResponse({
    status: 500,
    description: 'El mensaje no pudo enviarse (fallo del servicio de email)',
  })
  async sendMessage(
    @Body() dto: SendContactMessageDto,
  ): Promise<SendContactMessageResult> {
    return this.sendContactMessageUseCase.execute(dto);
  }
}
