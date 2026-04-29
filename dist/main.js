"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const indexer_1 = require("./jobs/indexer");
const custom_logger_1 = require("./common/logger/custom.logger");
const express_rate_limit_1 = require("express-rate-limit");
const rate_limit_redis_1 = require("rate-limit-redis");
const compression_1 = require("compression");
let redis = null;
try {
    redis = require('../config/redis');
}
catch (_a) {
}
function getLogLevels(nodeEnv) {
    switch (nodeEnv) {
        case 'production':
            return ['error', 'warn', 'log'];
        case 'test':
            return ['error'];
        case 'development':
        default:
            return ['error', 'warn', 'log', 'debug', 'verbose'];
    }
}
async function bootstrap() {
    var _a, _b;
    const nodeEnv = (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : 'development';
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: new custom_logger_1.CustomLogger('App', {
            logLevels: getLogLevels(nodeEnv),
        }),
    });
    app.getHttpAdapter().getInstance().disable('x-powered-by');
    app.use((0, compression_1.default)());
    app.use((0, express_rate_limit_1.default)(Object.assign(Object.assign({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }, (redis
        ? {
            store: new rate_limit_redis_1.default({
                sendCommand: (...args) => redis.call(...args),
            }),
        }
        : {})), { message: 'Too many requests from this IP, please try again after 15 minutes' })));
    const webhookLimiter = (0, express_rate_limit_1.default)(Object.assign(Object.assign({ windowMs: 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false }, (redis
        ? {
            store: new rate_limit_redis_1.default({
                sendCommand: (...args) => redis.call(...args),
            }),
        }
        : {})), { message: 'Too many webhook requests from this IP, please try again after 1 minute' }));
    app.use('/api/v1/webhooks/stellar', webhookLimiter);
    const requiredEnvVars = ['PORT', 'NODE_ENV', 'ADMIN_API_KEY', 'WEBHOOK_SECRET'];
    const missingVars = requiredEnvVars.filter(key => !process.env[key]);
    if (missingVars.length > 0) {
        missingVars.forEach(key => {
            console.error(`CRITICAL: Missing required environment variable: ${key}`);
        });
        console.error('Server cannot start due to missing configuration. Please check your .env file.');
        process.exit(1);
    }
    const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : ['http://localhost:3000', 'https://localhost:3000'];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'), false);
            }
        },
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('TradeFlow API')
        .setDescription('TradeFlow API documentation')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = (_b = process.env.PORT) !== null && _b !== void 0 ? _b : 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Environment: ${nodeEnv} | Log levels: ${getLogLevels(nodeEnv).join(', ')}`);
    new indexer_1.IndexerJob();
}
bootstrap();
//# sourceMappingURL=main.js.map