import {
  Controller,
  Get,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RateLimitService } from './rate-limit.service';

@ApiTags('Rate Limiting')
@Controller('rate-limit')
export class RateLimitController {
  constructor(private readonly rateLimitService: RateLimitService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current rate limit status',
    description:
      'Returns rate limits for the current user plan, current usage, and time until reset',
  })
  async getStatus(@Request() req: unknown) {
    const request = req as {
      user?: { userId: number; plan: string; isAdmin?: boolean };
      ip?: string;
    };

    if (!request.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const userId = request.user.userId;

    return this.rateLimitService.getRateLimitStatus(userId);
  }
}
