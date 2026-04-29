import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

const cache = require('../../utils/cache');

const CACHE_KEY = 'prices:all';

const MOCK_PRICES = [
  { symbol: 'USDC', price: 1.0 },
  { symbol: 'XLM', price: 0.12 },
];

/**
 * Service responsible for fetching and caching asset prices.
 * Integrates with CoinGecko for real-time data and uses a local cache for performance.
 */
@Injectable()
export class PricesService {
  private readonly logger = new Logger(PricesService.name);

  /**
   * Retrieves the current prices for supported assets.
   * Checks the local cache first before attempting an external API call.
   * 
   * @returns A promise resolving to the price data and cache status.
   */
  async getPrices(): Promise<{ data: { symbol: string; price: number }[]; cached: boolean }> {
    const cached = cache.get(CACHE_KEY);

    if (cached) {
      this.logger.log('🎯 Cache HIT - Returning cached prices');
      return { data: cached, cached: true };
    }

    this.logger.log('❌ Cache MISS - Fetching prices from external API');
    const prices = await this.fetchPrices();
    cache.set(CACHE_KEY, prices);

    return { data: prices, cached: false };
  }

  /**
   * Fetches real-time price data from the CoinGecko API.
   * Implements a fallback mechanism to mock data if the API request fails.
   * 
   * @returns A promise resolving to an array of asset price objects.
   * @private
   */
  private async fetchPrices(): Promise<{ symbol: string; price: number }[]> {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=stellar,usd-coin&vs_currencies=usd',
      );

      return [
        { symbol: 'USDC', price: response.data['usd-coin']?.usd ?? 1.0 },
        { symbol: 'XLM', price: response.data['stellar']?.usd ?? 0.12 },
      ];
    } catch (error) {
      this.logger.error('Failed to fetch prices from CoinGecko, using fallback data', error.message);
      return MOCK_PRICES;
    }
  }
}
