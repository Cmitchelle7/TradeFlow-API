import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  public redisPublisher: Redis;
  public redisSubscriber: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const port = this.configService.get<number>('REDIS_PORT') || 6379;

    this.redisPublisher = new Redis({ host, port });
    this.redisSubscriber = new Redis({ host, port });

    this.redisPublisher.on('connect', () => this.logger.log('Redis Publisher connected'));
    this.redisSubscriber.on('connect', () => this.logger.log('Redis Subscriber connected'));

    this.redisPublisher.on('error', (err) => this.logger.error('Redis Publisher error', err));
    this.redisSubscriber.on('error', (err) => this.logger.error('Redis Subscriber error', err));
  }

  onModuleDestroy() {
    this.redisPublisher.disconnect();
    this.redisSubscriber.disconnect();
  }

  async publish(channel: string, message: string) {
    await this.redisPublisher.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void) {
    await this.redisSubscriber.subscribe(channel);
    this.redisSubscriber.on('message', (chan, msg) => {
      if (chan === channel) {
        callback(msg);
      }
    });
  }
}
