import { Controller, Get, Query } from '@nestjs/common';

/**
 * Controller for retrieving global network and protocol statistics.
 * Provides endpoints for Total Value Locked (TVL) and historical growth data.
 */
@Controller('api/v1/stats')
export class StatsController {
  /**
   * Retrieves the current Total Value Locked (TVL) in the protocol.
   * Supports optional formatting (e.g., "14.5M").
   * 
   * @param format - Optional format style ('short' or 'full').
   * @returns An object containing the TVL in USD and the last update timestamp.
   */
  @Get('tvl')
  async getTVL(@Query('format') format?: string) {
    const staticTVL = 14500000.50;
    const lastUpdated = '2026-03-19T00:00:00Z';

    if (format === 'short') {
      // Format as "14.5M" for short display
      const formattedTVL = this.formatTVL(staticTVL);
      return {
        tvlUSD: formattedTVL,
        lastUpdated,
      };
    }

    return {
      tvlUSD: staticTVL,
      lastUpdated,
    };
  }

  /**
   * Retrieves the historical TVL data for the past 30 days.
   * Generates a realistic growth trend with simulated daily volatility.
   * 
   * @returns An array of daily TVL history points.
   */
  @Get('tvl/history')
  async getTVLHistory() {
    const history = [];
    const baseTVL = 10000000; // Starting TVL: $10M
    const growthRate = 0.015; // 1.5% daily growth rate
    const volatility = 0.02; // 2% daily volatility for realism
    
    // Generate 30 days of data ending today
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setUTCHours(0, 0, 0, 0);
      
      // Calculate TVL with growth and some volatility
      const daysPassed = 29 - i;
      const trendFactor = Math.pow(1 + growthRate, daysPassed);
      const randomFactor = 1 + (Math.random() - 0.5) * volatility;
      const tvlUSD = baseTVL * trendFactor * randomFactor;
      
      history.push({
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        tvlUSD: Math.round(tvlUSD * 100) / 100, // Round to 2 decimal places
      });
    }
    
    return history;
  }

  /**
   * Formats a numeric value into a human-readable string (K, M, B).
   * 
   * @param amount - The numeric value to format.
   * @returns A formatted string representation.
   * @private
   */
  private formatTVL(amount: number): string {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    } else {
      return amount.toString();
    }
  }
}
