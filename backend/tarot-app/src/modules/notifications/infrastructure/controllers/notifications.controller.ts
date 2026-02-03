import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  ParseBoolPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { User } from '../../../users/entities/user.entity';
import { NotificationsService } from '../../application/services/notifications.service';
import {
  NotificationDto,
  UnreadCountDto,
} from '../../application/dto/notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /notifications
   * Obtener notificaciones del usuario
   */
  @Get()
  @ApiOperation({ summary: 'Obtener mis notificaciones' })
  @ApiQuery({
    name: 'unreadOnly',
    required: false,
    type: Boolean,
    description: 'Si es true, solo retorna notificaciones no leídas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificaciones',
    type: [NotificationDto],
  })
  async getNotifications(
    @CurrentUser() user: User,
    @Query('unreadOnly', new ParseBoolPipe({ optional: true }))
    unreadOnly = false,
  ): Promise<NotificationDto[]> {
    const notifications = await this.notificationsService.getUserNotifications(
      user.id,
      unreadOnly,
    );

    // Map entities to DTOs, explicitly excluding internal fields like userId/user
    return notifications.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ userId, user: userRelation, ...rest }) => rest as NotificationDto,
    );
  }

  /**
   * GET /notifications/count
   * Obtener conteo de notificaciones no leídas
   */
  @Get('count')
  @ApiOperation({ summary: 'Obtener conteo de notificaciones no leídas' })
  @ApiResponse({
    status: 200,
    description: 'Conteo de notificaciones no leídas',
    type: UnreadCountDto,
  })
  async getUnreadCount(@CurrentUser() user: User): Promise<UnreadCountDto> {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  /**
   * PATCH /notifications/:id/read
   * Marcar notificación como leída
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Notificación marcada como leída' })
  @ApiResponse({
    status: 404,
    description: 'Notificación no encontrada o no pertenece al usuario',
  })
  async markAsRead(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.notificationsService.markAsRead(user.id, id);
  }

  /**
   * PATCH /notifications/read-all
   * Marcar todas las notificaciones como leídas
   */
  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({
    status: 204,
    description: 'Todas las notificaciones marcadas como leídas',
  })
  async markAllAsRead(@CurrentUser() user: User): Promise<void> {
    await this.notificationsService.markAllAsRead(user.id);
  }
}
