import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getProtocolHealth() {
    const timestamp = new Date().toISOString();

    // 1. Database health check
    let dbStatus: 'healthy' | 'unhealthy' = 'healthy';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unhealthy';
    }

    // 2. Indexer health - based on latest Trade record
    let indexerStatus: 'healthy' | 'lagging' | 'unhealthy' = 'unhealthy';
    let lastIndexedAt: string | null = null;
    let totalTrades = 0;

    try {
      const [latestTrade, tradeCount] = await Promise.all([
        this.prisma.trade.findFirst({ orderBy: { timestamp: 'desc' } }),
        this.prisma.trade.count(),
      ]);

      totalTrades = tradeCount;

      if (latestTrade) {
        lastIndexedAt = latestTrade.timestamp.toISOString();
        const ageMs = Date.now() - new Date(latestTrade.timestamp).getTime();
        indexerStatus = ageMs < 10 * 60 * 1000 ? 'healthy' : 'lagging';
      } else {
        indexerStatus = 'lagging';
      }
    } catch {
      indexerStatus = 'unhealthy';
    }

    // 3. Pools health
    let poolsStatus: 'healthy' | 'unhealthy' = 'healthy';
    let activePools = 0;

    try {
      activePools = await this.prisma.pool.count();
    } catch {
      poolsStatus = 'unhealthy';
    }

    // 4. Overall status
    const overallStatus =
      dbStatus === 'healthy' && poolsStatus === 'healthy'
        ? 'operational'
        : 'degraded';

    return {
      status: overallStatus,
      timestamp,
      components: {
        database: { status: dbStatus },
        indexer: {
          status: indexerStatus,
          lastIndexedAt,
          totalTradesIndexed: totalTrades,
        },
        pools: {
          status: poolsStatus,
          activePools,
        },
      },
    };
  }
}
