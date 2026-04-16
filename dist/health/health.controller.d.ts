import { DataSource } from 'typeorm';
export declare class HealthController {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    healthCheck(): Promise<{
        status: string;
        database: string;
        timestamp: string;
    }>;
    systemStatus(): Promise<{
        operational: string;
        uptime: number;
        services: {
            database: string;
            stellar_rpc: string;
        };
        timestamp: string;
    }>;
}
