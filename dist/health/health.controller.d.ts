import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        components: {
            database: {
                status: "healthy" | "unhealthy";
            };
            indexer: {
                status: "healthy" | "unhealthy" | "lagging";
                lastIndexedAt: string;
                totalTradesIndexed: number;
            };
            pools: {
                status: "healthy" | "unhealthy";
                activePools: number;
            };
        };
    }>;
}
