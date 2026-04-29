import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Trade, Pool, Token } from '@prisma/client';
import { RedisService } from '../common/redis/redis.service';

/**
 * Service handling trade execution, pool management, and token data.
 * Persists data to the database via Prisma and publishes live updates to Redis.
 */
@Injectable()
export class TradeService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  /**
   * Creates a new trade record in the database and broadcasts it via Redis.
   * 
   * @param data - The trade details including pool, user, and amounts.
   * @returns A promise resolving to the created Trade object.
   */
  async createTrade(data: {
    poolId: string;
    userAddress: string;
    amountIn: string;
    amountOut: string;
  }): Promise<Trade> {
    const trade = await this.prisma.trade.create({
      data: {
        ...data,
        timestamp: new Date(),
      },
    });

    await this.redisService.publish('live_trades', JSON.stringify(trade));
    return trade;
  }

  /**
   * Retrieves all trades associated with a specific user address.
   * 
   * @param userAddress - The Stellar public key of the user.
   * @returns A promise resolving to an array of Trade objects.
   */
  async getTradesByUser(userAddress: string): Promise<Trade[]> {
    return this.prisma.trade.findMany({
      where: {
        userAddress,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Retrieves all trades executed in a specific pool.
   * 
   * @param poolId - The unique ID of the pool.
   * @returns A promise resolving to an array of Trade objects.
   */
  async getTradesByPool(poolId: string): Promise<Trade[]> {
    return this.prisma.trade.findMany({
      where: {
        poolId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Retrieves all trade records from the database, sorted by timestamp.
   * 
   * @returns A promise resolving to an array of all Trade objects.
   */
  async getAllTrades(): Promise<Trade[]> {
    return this.prisma.trade.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Creates a new liquidity pool record.
   * 
   * @param data - The pool details including address, tokens, and fee tier.
   * @returns A promise resolving to the created Pool object.
   */
  async createPool(data: {
    address: string;
    tokenA: string;
    tokenB: string;
    fee: string;
  }): Promise<Pool> {
    return this.prisma.pool.create({
      data,
    });
  }

  /**
   * Retrieves a pool by its Stellar contract address, including its trades.
   * 
   * @param address - The contract address of the pool.
   * @returns A promise resolving to the Pool object or null if not found.
   */
  async getPoolByAddress(address: string): Promise<Pool | null> {
    return this.prisma.pool.findUnique({
      where: {
        address,
      },
      include: {
        trades: true,
      },
    });
  }

  /**
   * Registers a new token in the system.
   * 
   * @param data - The token details including address, symbol, name, and decimals.
   * @returns A promise resolving to the created Token object.
   */
  async createToken(data: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  }): Promise<Token> {
    return this.prisma.token.create({
      data,
    });
  }

  /**
   * Retrieves token information by its contract address.
   * 
   * @param address - The contract address of the token.
   * @returns A promise resolving to the Token object or null if not found.
   */
  async getTokenByAddress(address: string): Promise<Token | null> {
    return this.prisma.token.findUnique({
      where: {
        address,
      },
    });
  }
}
