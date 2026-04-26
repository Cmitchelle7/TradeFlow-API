import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import {
  AnalyticsService,
  VolumeData,
  ImpermanentLossData,
  LeaderboardEntry,
  LiquidityProvider,
} from './analytics.service';

@ApiTags('Analytics')
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('volume')
  @ApiOperation({ summary: 'Get historical trading volume data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved volume data',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string', example: '2024-01-15' },
          volumeUSD: { type: 'number', example: 250000 },
        },
      },
    },
  })
  getVolumeData(): VolumeData[] {
    return this.analyticsService.generateMockVolumeData();
  }

  @Get('impermanent-loss')
  @ApiOperation({ summary: 'Calculate impermanent loss for liquidity providers' })
  @ApiQuery({
    name: 'entryPriceRatio',
    type: 'number',
    description: 'Entry price ratio of the liquidity position',
    example: 1.0,
    required: true,
  })
  @ApiQuery({
    name: 'currentPriceRatio',
    type: 'number',
    description: 'Current price ratio of the liquidity position',
    example: 1.5,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully calculated impermanent loss',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            entryPriceRatio: { type: 'number', example: 1.0 },
            currentPriceRatio: { type: 'number', example: 1.5 },
            impermanentLossPercentage: { type: 'number', example: -2.5 },
          },
        },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
      },
    },
  })
  getImpermanentLoss(
    @Query('entryPriceRatio') entryPriceRatio: number,
    @Query('currentPriceRatio') currentPriceRatio: number,
  ): { success: boolean; data: ImpermanentLossData; timestamp: string } {
    const result = this.analyticsService.calculateImpermanentLoss(
      entryPriceRatio,
      currentPriceRatio,
    );

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get top volume traders leaderboard' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved leaderboard data',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          rank: { type: 'number', example: 1 },
          walletAddress: { type: 'string', example: '0x742d...8b4c' },
          volumeUSD: { type: 'number', example: 850000 },
        },
      },
    },
  })
  getLeaderboard(): LeaderboardEntry[] {
    return this.analyticsService.generateLeaderboard();
  }

  @Get('liquidity-providers')
  @ApiOperation({ summary: 'Get top liquidity providers by pool' })
  @ApiQuery({
    name: 'poolId',
    type: 'string',
    description: 'Filter by pool ID (optional). If omitted, returns top providers across all pools.',
    example: 'pool-001',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved top liquidity providers',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          rank: { type: 'number', example: 1 },
          walletAddress: { type: 'string', example: '0x742d...8b4c' },
          liquidityUSD: { type: 'number', example: 500000 },
          poolId: { type: 'string', example: 'pool-001' },
          poolPair: { type: 'string', example: 'USDC/XLM' },
          sharePercentage: { type: 'number', example: 18.5 },
        },
      },
    },
  })
  getTopLiquidityProviders(
    @Query('poolId') poolId?: string,
  ): LiquidityProvider[] {
    return this.analyticsService.getTopLiquidityProviders(poolId);
  }
}
