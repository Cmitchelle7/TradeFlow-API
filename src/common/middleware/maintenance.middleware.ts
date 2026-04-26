import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const isMaintenanceMode = this.configService.get<string>('MAINTENANCE_MODE') === 'true';

    // List of endpoints that bypass maintenance mode
    const bypassRoutes = ['/ping', '/health', '/api/v1/status'];

    if (isMaintenanceMode && !bypassRoutes.includes(req.originalUrl)) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'TradeFlow is currently undergoing maintenance. Please try again later.',
      });
    }

    next();
  }
}
