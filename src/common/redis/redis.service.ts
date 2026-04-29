import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Service for managing Redis connections and operations.
 * Provides separate clients for publishing and subscribing to channels.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  public redisPublisher: Redis;
  public redisSubscriber: Redis;

  constructor(private configService: ConfigService) {}

  /**
   * Initializes Redis connections when the module starts.
   */
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

  /**
   * Disconnects Redis clients when the module is destroyed.
   */
  onModuleDestroy() {
    this.redisPublisher.disconnect();
    this.redisSubscriber.disconnect();
  }

  /**
   * Publishes a message to a specific Redis channel.
   * 
   * @param channel - The name of the channel to publish to.
   * @param message - The string message to publish.
   */
  async publish(channel: string, message: string) {
    await this.redisPublisher.publish(channel, message);
  }

  /**
   * Subscribes to a Redis channel and executes a callback on every message.
   * 
   * @param channel - The name of the channel to subscribe to.
   * @param callback - The function to execute when a message is received.
   */
  async subscribe(channel: string, callback: (message: string) => void) {
    await this.redisSubscriber.subscribe(channel);
    this.redisSubscriber.on('message', (chan, msg) => {
      if (chan === channel) {
        callback(msg);
      }
    });
  }
}
