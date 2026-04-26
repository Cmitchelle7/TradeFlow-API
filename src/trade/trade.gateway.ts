import { WebSocketGateway, WebSocketServer, OnModuleInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RedisService } from '../common/redis/redis.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TradeGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TradeGateway.name);

  constructor(private readonly redisService: RedisService) {}

  onModuleInit() {
    this.redisService.subscribe('live_trades', (message) => {
      this.logger.log(`Received trade from Redis: ${message}`);
      this.server.emit('trade', JSON.parse(message));
    });
  }
}
