import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error message to the server console for debugging
  console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
  console.error(err.stack);

  // Check if running in production mode
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Prepare error response
  const errorResponse: any = {
    success: false,
    message: isProduction ? "Internal Server Error" : err.message
  };

  // Include stack trace only in development mode
  if (!isProduction && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Return a 500 Internal Server Error status with appropriate response
  res.status(500).json(errorResponse);
}
