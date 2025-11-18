import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IPBlockingService } from '../../../common/services/ip-blocking.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Admin - Rate Limiting')
@Controller('admin/rate-limits')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('JWT-auth')
export class RateLimitsAdminController {
  constructor(private readonly ipBlockingService: IPBlockingService) {}

  @Get('violations')
  @ApiOperation({
    summary: 'Obtener estadísticas de violaciones de rate limiting',
    description:
      'Retorna información sobre IPs con violaciones activas, IPs bloqueadas y estadísticas generales. Solo accesible por administradores.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de rate limiting',
    schema: {
      properties: {
        violations: {
          type: 'array',
          description: 'IPs con violaciones activas',
          items: {
            properties: {
              ip: { type: 'string', example: '192.168.1.100' },
              count: { type: 'number', example: 5 },
              firstViolation: {
                type: 'string',
                format: 'date-time',
                example: '2025-11-13T10:00:00.000Z',
              },
              lastViolation: {
                type: 'string',
                format: 'date-time',
                example: '2025-11-13T10:30:00.000Z',
              },
            },
          },
        },
        blockedIps: {
          type: 'array',
          description: 'IPs actualmente bloqueadas',
          items: {
            properties: {
              ip: { type: 'string', example: '192.168.1.101' },
              reason: {
                type: 'string',
                example: 'Too many rate limit violations',
              },
              blockedAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-11-13T11:00:00.000Z',
              },
              expiresAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-11-13T12:00:00.000Z',
              },
            },
          },
        },
        stats: {
          type: 'object',
          properties: {
            totalViolations: { type: 'number', example: 15 },
            totalBlockedIps: { type: 'number', example: 2 },
            activeViolationsCount: { type: 'number', example: 3 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Usuario no es administrador',
  })
  getViolationsStats() {
    const violations = this.ipBlockingService.getAllViolations();
    const blockedIps = this.ipBlockingService.getBlockedIPs();

    // Calcular stats
    const totalViolations = violations.reduce((sum, v) => sum + v.count, 0);
    const totalBlockedIps = blockedIps.length;
    const activeViolationsCount = violations.length;

    return {
      violations,
      blockedIps,
      stats: {
        totalViolations,
        totalBlockedIps,
        activeViolationsCount,
      },
    };
  }
}
