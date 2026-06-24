import * as cron from 'node-cron';
import { RedisService } from '../common/redis/redis.service';

export class IndexerJob {
  private redisService: RedisService;

  constructor(redisService?: RedisService) {
    this.redisService = redisService;
    this.initializeJobs();
  }

  private initializeJobs() {
    cron.schedule('*/1 * * * *', () => {
      this.syncBlockchainData();
    });

    console.log('Background indexer jobs initialized');
  }

  private syncBlockchainData() {
    console.log([] Starting blockchain data sync...);

    const events = [
      { event: 'InvoiceStatusChanged', data: { invoiceId: 'inv_001', status: 'FUNDED' } },
      { event: 'LiquidityPoolUpdated', data: { poolId: 'pool_001', liquidity: '150000' } },
      { event: 'YieldAccrued', data: { userId: 'user_001', yield: '0.05' } },
    ];

    for (const ev of events) {
      const payload = {
        ...ev,
        room: 'room:global',
        timestamp: Date.now(),
      };

      if (this.redisService) {
        this.redisService.redisPublisher.publish('ws:events', JSON.stringify(payload));
      }

      console.log([Indexer] Emitted: , ev.data);
    }
  }
}
