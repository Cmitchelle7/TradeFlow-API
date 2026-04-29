import { Injectable, Logger } from '@nestjs/common';
import { Horizon } from '@stellar/stellar-sdk';

/**
 * Service for interacting with Stellar assets and tokens.
 * Handles searching, caching, and retrieving asset information from Horizon.
 */
@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);
  private readonly server: Horizon.Server;
  private cachedAssets: any[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Connect to Stellar Horizon Testnet
    this.server = new Horizon.Server('https://horizon-testnet.stellar.org');
  }

  /**
   * Searches for tokens on the Stellar network based on a query string.
   * Utilizes Redis for distributed caching to optimize performance.
   * 
   * @param searchQuery - The string to search for in asset codes or issuers.
   * @returns A promise resolving to the search results and cache status.
   */
  async searchTokens(searchQuery: string): Promise<{
    message: string;
    searchQuery: string;
    results: any[];
    cached: boolean;
  }> {
    if (!searchQuery) {
      return {
        message: 'No search query provided',
        searchQuery: '',
        results: [],
        cached: false
      };
    }

    const cacheKey = 'tokens:all_assets';
    let assets: any[];
    let isCacheValid = false;

    try {
      // Try to get from Redis
      const redis = require('../../config/redis');
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        assets = JSON.parse(cachedData);
        isCacheValid = true;
        this.logger.log('🎯 Redis Cache HIT - Using distributed asset data');
      } else {
        // Cache miss - fetch fresh data
        this.logger.log('❌ Redis Cache MISS - Fetching fresh data from Stellar');
        assets = await this.fetchAssetsFromHorizon();
        
        // Save to Redis with 5-minute expiration
        await redis.set(cacheKey, JSON.stringify(assets), 'PX', this.CACHE_DURATION_MS);
      }
    } catch (error) {
      this.logger.error('Redis error or fetch error:', error.message);
      // Fallback to mock data if everything fails
      assets = this.getMockAssets();
    }

    // Filter assets based on search query
    const filteredAssets = assets.filter(asset => 
      asset.asset_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.asset_issuer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.asset_type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      message: `Search results for: ${searchQuery}`,
      searchQuery: searchQuery,
      results: filteredAssets,
      cached: isCacheValid
    };
  }

  /**
   * Fetches the latest asset records directly from the Stellar Horizon API.
   * 
   * @returns A promise resolving to an array of transformed asset objects.
   * @private
   */
  private async fetchAssetsFromHorizon(): Promise<any[]> {
    try {
      // Fetch assets from Horizon API
      const assetsResponse = await this.server.assets()
        .limit(20) // Limit to 20 assets for performance
        .call();

      // Transform the data to include relevant information
      return assetsResponse.records.map(asset => ({
        asset_type: asset.asset_type,
        asset_code: asset.asset_code,
        asset_issuer: asset.asset_issuer,
        amount: asset.amount,
        num_accounts: asset.num_accounts,
        flags: asset.flags,
        _links: asset._links
      }));
    } catch (error) {
      this.logger.error('Error fetching assets from Horizon:', error);
      throw error;
    }
  }

  /**
   * Provides a fallback set of mock assets in case of network or cache failures.
   * 
   * @returns An array of mock asset objects resembling the Stellar structure.
   * @private
   */
  private getMockAssets(): any[] {
    // Fallback mock data that resembles Stellar asset structure
    return [
      {
        asset_type: 'credit_alphanum4',
        asset_code: 'USDC',
        asset_issuer: 'GBBD47F6L3WRUIRDRN4Q3GUMF3VUEQBQO4FSKJ3DFOZQY2E4PWSJD3HU',
        amount: '1000000.0000000',
        num_accounts: 100,
        flags: { auth_required: false, auth_revocable: false }
      },
      {
        asset_type: 'credit_alphanum4',
        asset_code: 'EURT',
        asset_issuer: 'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S',
        amount: '500000.0000000',
        num_accounts: 50,
        flags: { auth_required: false, auth_revocable: false }
      },
      {
        asset_type: 'credit_alphanum12',
        asset_code: 'TESTUSD',
        asset_issuer: 'GC5SXL4AMDGUCYVQFIOUJDDG2QJGHJQVQIFJ5RJN4722F5QG3XGS5D2',
        amount: '750000.0000000',
        num_accounts: 75,
        flags: { auth_required: false, auth_revocable: false }
      }
    ];
  }

  async getSpecificAsset(assetCode: string, assetIssuer: string): Promise<any> {
    try {
      const assetResponse = await this.server.assets()
        .forCode(assetCode)
        .forIssuer(assetIssuer)
        .call();

      if (assetResponse.records.length === 0) {
        throw new Error(`Asset ${assetCode} from issuer ${assetIssuer} not found`);
      }

      return assetResponse.records[0];
    } catch (error) {
      this.logger.error(`Error fetching asset ${assetCode}:`, error);
      throw error;
    }
  }
}
