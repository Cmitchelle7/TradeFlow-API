import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { IndexerJob } from './jobs/indexer';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Redis is optional — gracefully fall back to in-memory limiting if unavailable
let redis: any = null;
try {
  redis = require('../config/redis');
} catch {
  // Redis not configured; rate-limiting will use in-memory store
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security: Disable X-Powered-By header to hide Express.js stack
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  
  // Global Rate Limiting (Redis-backed when available, in-memory fallback)
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
      ...(redis
        ? {
            store: new RedisStore({
              sendCommand: (...args: string[]) => redis.call(...args),
            }),
          }
        : {}),
      message: 'Too many requests from this IP, please try again after 15 minutes',
    }),
  );
  
  // Strict Rate Limiter for Webhook Endpoint (DDoS protection)
  const webhookLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // Limit each IP to 50 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    ...(redis
      ? {
          store: new RedisStore({
            sendCommand: (...args: string[]) => redis.call(...args),
          }),
        }
      : {}),
    message: 'Too many webhook requests from this IP, please try again after 1 minute',
  });
  
  // Apply strict webhook limiter to the Stellar webhook route
  app.use('/api/v1/webhooks/stellar', webhookLimiter);
  
  // Environment Variable Validation (failsafe boot sequence)
  const requiredEnvVars = ['PORT', 'NODE_ENV', 'ADMIN_API_KEY', 'WEBHOOK_SECRET'];
  const missingVars = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missingVars.length > 0) {
    missingVars.forEach(key => {
      console.error(`❌ CRITICAL: Missing required environment variable: ${key}`);
    });
    console.error('🛑 Server cannot start due to missing configuration. Please check your .env file.');
    process.exit(1);
  }

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('TradeFlow API')
    .setDescription('TradeFlow API documentation')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  
  // Initialize background jobs
  new IndexerJob();
}

bootstrap();