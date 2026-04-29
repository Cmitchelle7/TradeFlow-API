import { Injectable, NestMiddleware, RequestTimeoutException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS ?? '30000', 10);

/**
 * Middleware that enforces a maximum request duration (timeout).
 * Prevents long-running requests from hanging indefinitely and consuming server resources.
 */
@Injectable()
export class TimeoutMiddleware implements NestMiddleware {
  /**
   * Sets a timer for each request and returns a 408 status if it takes too long.
   * 
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next function in the middleware chain.
   */
  use(req: Request, res: Response, next: NextFunction) {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: 'Request timeout - the server took too long to respond',
          timestamp: new Date().toISOString(),
          path: req.url,
        });
      }
    }, REQUEST_TIMEOUT_MS);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
  }
}
