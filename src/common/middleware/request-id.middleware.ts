import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requestContextStorage } from '../storage/request-context.storage';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
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
