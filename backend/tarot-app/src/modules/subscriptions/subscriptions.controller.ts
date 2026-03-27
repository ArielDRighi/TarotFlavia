import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  SubscriptionsService,
  SubscriptionInfo,
} from './subscriptions.service';
import { SetFavoriteTarotistaDto } from './dto/set-favorite-tarotista.dto';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { UserTarotistaSubscription } from '../tarotistas/entities/user-tarotista-subscription.entity';
import { CreatePreapprovalUseCase } from './application/use-cases/create-preapproval.use-case';
import { CreatePreapprovalResponseDto } from './application/dto/create-preapproval-response.dto';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly createPreapprovalUseCase: CreatePreapprovalUseCase,
  ) {}

  @Post('set-favorite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Establecer tarotista favorito',
    description:
      'Permite a un usuario elegir su tarotista favorito. FREE: cooldown de 30 días. PREMIUM: sin cooldown.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarotista favorito establecido correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Cooldown activo o tarotista inactivo',
  })
  @ApiResponse({ status: 404, description: 'Tarotista no encontrado' })
  async setFavoriteTarotista(
    @Request() req: { user: { userId: number } },
    @Body() dto: SetFavoriteTarotistaDto,
  ) {
    const subscription = await this.subscriptionsService.setFavoriteTarotista(
      req.user.userId,
      dto.tarotistaId,
    );

    return {
      message: 'Tarotista favorito establecido correctamente',
      subscription,
    };
  }

  @Get('my-subscription')
  @ApiOperation({
    summary: 'Obtener mi suscripción actual',
    description:
      'Retorna información de la suscripción del usuario: tipo, tarotista, cooldown, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de suscripción',
  })
  async getMySubscription(
    @Request() req: { user: { userId: number } },
  ): Promise<SubscriptionInfo | null> {
    return this.subscriptionsService.getSubscriptionInfo(req.user.userId);
  }

  @Post('enable-all-access')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activar modo all-access',
    description:
      'Permite a usuarios PREMIUM activar el acceso a todos los tarotistas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Modo all-access activado',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo usuarios PREMIUM pueden activar all-access',
  })
  async enableAllAccess(@Request() req: { user: { userId: number } }): Promise<{
    message: string;
    subscription: UserTarotistaSubscription;
  }> {
    const subscription = await this.subscriptionsService.enableAllAccessMode(
      req.user.userId,
    );

    return {
      message: 'Modo all-access activado correctamente',
      subscription,
    };
  }

  @Post('create-preapproval')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Crear suscripción premium en Mercado Pago',
    description:
      'Inicia el flujo de suscripción premium creando un preapproval en Mercado Pago. Retorna la URL de checkout para redirigir al usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Preapproval creado exitosamente',
    type: CreatePreapprovalResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'El usuario ya tiene un plan premium activo',
  })
  @ApiResponse({
    status: 502,
    description: 'Error al comunicarse con Mercado Pago',
  })
  async createPreapproval(
    @Request() req: { user: { userId: number; email: string } },
  ): Promise<CreatePreapprovalResponseDto> {
    return this.createPreapprovalUseCase.execute(
      req.user.userId,
      req.user.email,
    );
  }
}
