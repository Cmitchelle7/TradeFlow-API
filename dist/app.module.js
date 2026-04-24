"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const health_module_1 = require("./health/health.module");
const risk_module_1 = require("./risk/risk.module");
const auth_module_1 = require("./auth/auth.module");
const analytics_module_1 = require("./analytics/analytics.module");
const swap_module_1 = require("./swap/swap.module");
const prisma_module_1 = require("./prisma/prisma.module");
const tokens_module_1 = require("./tokens/tokens.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const og_module_1 = require("./og/og.module");
const require_jwt_middleware_1 = require("./common/middleware/require-jwt.middleware");
const timeout_middleware_1 = require("./common/middleware/timeout.middleware");
const config_module_1 = require("./config/config.module");
const pools_module_1 = require("./pools/pools.module");
const webhook_body_middleware_1 = require("./auth/middleware/webhook-body.middleware");
const prices_module_1 = require("./prices/prices.module");
const invoices_module_1 = require("./invoices/invoices.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(timeout_middleware_1.TimeoutMiddleware)
            .forRoutes({ path: '*', method: common_1.RequestMethod.ALL });
        consumer
            .apply(webhook_body_middleware_1.WebhookBodyMiddleware)
            .forRoutes({ path: 'api/v1/webhook/soroban', method: common_1.RequestMethod.POST });
        consumer
            .apply(require_jwt_middleware_1.RequireJwtMiddleware)
            .forRoutes({ path: 'api/v1/webhook/soroban', method: common_1.RequestMethod.POST }, { path: 'invoices', method: common_1.RequestMethod.POST });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            risk_module_1.RiskModule,
            auth_module_1.AuthModule,
            analytics_module_1.AnalyticsModule,
            swap_module_1.SwapModule,
            tokens_module_1.TokensModule,
            og_module_1.OgModule,
            config_module_1.ConfigModule,
            pools_module_1.PoolsModule,
            prices_module_1.PricesModule,
            invoices_module_1.InvoicesModule,
            webhooks_module_1.WebhooksModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_filter_1.AllExceptionsFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map