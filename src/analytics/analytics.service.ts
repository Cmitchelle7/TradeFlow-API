import { Injectable } from '@nestjs/common';

export interface VolumeData {
  date: string;
  volumeUSD: number;
}

export interface ImpermanentLossData {
  entryPriceRatio: number;
  currentPriceRatio: number;
  impermanentLossPercentage: number;
}

export interface LeaderboardEntry {
  walletAddress: string;
  volumeUSD: number;
  rank: number;
}

export interface LiquidityProvider {
  rank: number;
  walletAddress: string;
  liquidityUSD: number;
  poolId: string;
  poolPair: string;
  sharePercentage: number;
}

@Injectable()
export class AnalyticsService {
  generateMockVolumeData(): VolumeData[] {
    const data: VolumeData[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const baseVolume = 250000;
      const variation = Math.random() * 200000 - 100000;
      const volumeUSD = Math.round(baseVolume + variation);

      data.push({
        date: date.toISOString().split('T')[0],
        volumeUSD,
      });
    }

    return data;
  }

  calculateImpermanentLoss(entryPriceRatio: number, currentPriceRatio: number): ImpermanentLossData {
    if (entryPriceRatio <= 0 || currentPriceRatio <= 0) {
      throw new Error('Price ratios must be positive numbers');
    }

    const priceRatio = currentPriceRatio / entryPriceRatio;
    const impermanentLoss = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1;
    const impermanentLossPercentage = impermanentLoss * 100;

    return {
      entryPriceRatio,
      currentPriceRatio,
      impermanentLossPercentage,
    };
  }

  generateLeaderboard(): LeaderboardEntry[] {
    const dummyWallets = [
      '0x742d...8b4c',
      '0x8f3a...2d1e',
      '0x1a9c...5f7b',
      '0x6e2d...9a3c',
      '0x4b8f...1e2d',
      '0x9c3a...7f5b',
      '0x2d8f...4c1e',
      '0x5a7b...9d2f',
      '0x8e1c...3a6b',
      '0x3f9d...2e8c',
    ];

    const baseVolumes = [850000, 720000, 650000, 580000, 490000, 420000, 380000, 310000, 270000, 220000];

    const leaderboard: LeaderboardEntry[] = dummyWallets.map((wallet, index) => ({
      walletAddress: wallet,
      volumeUSD: baseVolumes[index] + Math.round(Math.random() * 50000 - 25000),
      rank: index + 1,
    }));

    return leaderboard;
  }

  getTopLiquidityProviders(poolId?: string): LiquidityProvider[] {
    const pools = [
      { poolId: 'pool-001', poolPair: 'USDC/XLM' },
      { poolId: 'pool-002', poolPair: 'XLM/BTC' },
      { poolId: 'pool-003', poolPair: 'USDC/BTC' },
    ];

    const wallets = [
      '0x742d...8b4c',
      '0x8f3a...2d1e',
      '0x1a9c...5f7b',
      '0x6e2d...9a3c',
      '0x4b8f...1e2d',
      '0x9c3a...7f5b',
      '0x2d8f...4c1e',
      '0x5a7b...9d2f',
      '0x8e1c...3a6b',
      '0x3f9d...2e8c',
    ];

    const baseLiquidity = [500000, 420000, 380000, 310000, 270000, 230000, 190000, 150000, 120000, 90000];
    const totalLiquidity = baseLiquidity.reduce((sum, v) => sum + v, 0);

    let providers: LiquidityProvider[] = wallets.map((wallet, index) => {
      const pool = pools[index % pools.length];
      const liquidityUSD = baseLiquidity[index] + Math.round(Math.random() * 20000 - 10000);
      return {
        rank: index + 1,
        walletAddress: wallet,
        liquidityUSD,
        poolId: pool.poolId,
        poolPair: pool.poolPair,
        sharePercentage: parseFloat(((liquidityUSD / totalLiquidity) * 100).toFixed(2)),
      };
    });

    if (poolId) {
      providers = providers.filter((p) => p.poolId === poolId);
      // Re-rank after filtering
      providers = providers.map((p, index) => ({ ...p, rank: index + 1 }));
    }

    return providers;
  }
}