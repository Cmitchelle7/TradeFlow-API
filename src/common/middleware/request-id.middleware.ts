import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requestContextStorage } from '../storage/request-context.storage';

/**
 * Middleware responsible for generating and attaching a unique request ID to every incoming HTTP request.
 * It also initializes the request context for tracing logs.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  /**
   * Generates a UUID, attaches it to the request and response headers, and runs the next handler in context.
   * 
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next function in the middleware chain.
   */
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = uuidv4();
    
    // Attach ID to request object
    req.id = requestId;
    
    // Attach ID to response headers
    res.setHeader('X-Request-ID', requestId);
    
    // Wrap the rest of the request in the context
    requestContextStorage.run({ requestId }, () => {
      next();
    });
  }
}
