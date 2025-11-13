import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CorrelationIdService } from '../logger/correlation-id.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly correlationIdService: CorrelationIdService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // Get correlation ID from header or generate new one
    const correlationId =
      (req.headers['x-correlation-id'] as string) || uuidv4();

    // Set correlation ID in response header
    res.setHeader('X-Correlation-ID', correlationId);

    // Run the rest of the request within correlation ID context
    void this.correlationIdService.runWithCorrelationId(correlationId, () => {
      next();
    });
  }
}
