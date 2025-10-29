import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AIHealthService, AIHealthCheckResult } from './ai-health.service';

@ApiTags('health')
@Controller('health')
export class AIHealthController {
  constructor(private readonly aiHealthService: AIHealthService) {}

  @Get('ai')
  @ApiOperation({
    summary: 'Check AI providers health',
    description:
      'Returns the health status of all configured AI providers (Groq, DeepSeek, OpenAI)',
  })
  @ApiResponse({
    status: 200,
    description: 'Health status of AI providers',
    schema: {
      type: 'object',
      properties: {
        primary: {
          type: 'object',
          properties: {
            provider: { type: 'string', example: 'groq' },
            configured: { type: 'boolean', example: true },
            status: { type: 'string', enum: ['ok', 'error', 'not_configured'] },
            model: { type: 'string', example: 'llama-3.1-70b-versatile' },
            responseTime: { type: 'number', example: 150 },
            error: { type: 'string', nullable: true },
            rateLimits: {
              type: 'object',
              properties: {
                remaining: { type: 'number', nullable: true },
                limit: { type: 'number' },
                reset: { type: 'string', nullable: true },
              },
            },
          },
        },
        fallback: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              provider: { type: 'string' },
              configured: { type: 'boolean' },
              status: { type: 'string' },
              model: { type: 'string', nullable: true },
              responseTime: { type: 'number', nullable: true },
              error: { type: 'string', nullable: true },
            },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async checkHealth(): Promise<AIHealthCheckResult> {
    return this.aiHealthService.checkAllProviders();
  }
}
