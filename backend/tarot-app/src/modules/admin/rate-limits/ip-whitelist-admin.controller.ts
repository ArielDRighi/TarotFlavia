import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { IPWhitelistService } from '../../../common/services/ip-whitelist.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IsIP, IsNotEmpty } from 'class-validator';

class AddIPDto {
  @IsIP()
  @IsNotEmpty()
  ip: string;
}

@ApiTags('Admin - IP Whitelist')
@Controller('admin/ip-whitelist')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class IPWhitelistAdminController {
  constructor(private readonly ipWhitelistService: IPWhitelistService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener lista de IPs en whitelist',
    description:
      'Retorna todas las IPs que están en la whitelist y no son afectadas por rate limiting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de IPs whitelisted',
    schema: {
      properties: {
        ips: {
          type: 'array',
          items: { type: 'string' },
          example: ['127.0.0.1', '::1', '192.168.1.50'],
        },
        count: { type: 'number', example: 3 },
      },
    },
  })
  getWhitelist() {
    const ips = this.ipWhitelistService.getWhitelistedIPs();
    return {
      ips,
      count: ips.length,
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Agregar IP a la whitelist',
    description:
      'Agrega una IP a la whitelist. Las IPs whitelisted no están sujetas a rate limiting.',
  })
  @ApiBody({ type: AddIPDto })
  @ApiResponse({
    status: 201,
    description: 'IP agregada exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuario no es administrador',
  })
  addIP(@Body() dto: AddIPDto) {
    this.ipWhitelistService.addIP(dto.ip);
    return {
      message: `IP ${dto.ip} added to whitelist`,
      ip: dto.ip,
    };
  }

  @Delete(':ip')
  @ApiOperation({
    summary: 'Eliminar IP de la whitelist',
    description:
      'Elimina una IP de la whitelist. La IP volverá a estar sujeta a rate limiting.',
  })
  @ApiParam({ name: 'ip', description: 'IP address to remove' })
  @ApiResponse({
    status: 200,
    description: 'IP eliminada exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuario no es administrador',
  })
  removeIP(@Param('ip') ip: string) {
    this.ipWhitelistService.removeIP(ip);
    return {
      message: `IP ${ip} removed from whitelist`,
      ip,
    };
  }
}
