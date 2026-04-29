import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../auth/auth.service';

/**
 * Middleware that enforces JWT authentication for protected routes.
 * Verifies the Bearer token in the Authorization header and attaches the decoded user to the request.
 */
@Injectable()
export class RequireJwtMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  /**
   * Validates the Authorization header and decodes the JWT.
   * 
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next function in the middleware chain.
   * @throws UnauthorizedException if the token is missing, invalid, or expired.
   */
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.authService.verifyJWT(token);
      req['user'] = decoded;
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
