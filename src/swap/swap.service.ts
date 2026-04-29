import { Injectable, BadRequestException } from '@nestjs/common';

/**
 * Service responsible for swap-related calculations and operations.
 */
@Injectable()
export class SwapService {
  /**
   * Calculates the estimated price impact for a swap based on the input amount.
   * This uses a tiered approach with linear interpolation for mid-range amounts.
   * 
   * @param amountIn - The amount of the input asset being swapped.
   * @returns An object containing the original amount, calculated price impact, and timestamp.
   * @throws BadRequestException if amountIn is not a positive number.
   */
  calculatePriceImpact(amountIn: number) {
    if (!amountIn || amountIn <= 0) {
      throw new BadRequestException('amountIn must be a positive number');
    }

    let priceImpact: string;

    if (amountIn < 1000) {
      priceImpact = '0.1%';
    } else if (amountIn > 10000) {
      priceImpact = '2.5%';
    } else {
      // For amounts between 1000 and 10000, we can add linear scaling
      // This is a simple linear interpolation between 0.1% and 2.5%
      const ratio = (amountIn - 1000) / (10000 - 1000);
      const impactPercentage = 0.1 + ratio * (2.5 - 0.1);
      priceImpact = `${impactPercentage.toFixed(2)}%`;
    }

    return {
      amountIn,
      priceImpact,
      timestamp: new Date().toISOString(),
    };
  }
}
