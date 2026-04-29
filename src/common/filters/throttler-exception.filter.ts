import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ThrottlerException } from '@nestjs/throttler';

/**
 * Exception filter for handling rate-limiting (throttling) errors.
 * Provides a user-friendly message when a client exceeds the request limit.
 */
@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  /**
   * Catches a ThrottlerException and returns a 429 Too Many Requests response.
   * 
   * @param exception - The ThrottlerException instance.
   * @param host - The arguments host providing request and response context.
   */
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response
      .status(HttpStatus.TOO_MANY_REQUESTS)
      .json({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too Many Requests - Slow Down',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
