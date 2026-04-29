import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * Middleware for putting the application into maintenance mode.
 * When enabled, all non-essential routes return a 503 Service Unavailable status.
 */
@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  /**
   * Checks if maintenance mode is active and blocks requests if necessary.
   * 
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next function in the middleware chain.
   * @returns A response object if in maintenance mode, otherwise calls next().
   */
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
