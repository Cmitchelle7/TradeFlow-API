import { ApiProperty } from '@nestjs/swagger';

export class ApyHistoryPoint {
  @ApiProperty({ example: '2026-04-17' })
  date: string; // YYYY-MM-DD

  @ApiProperty({ example: 12.35 })
  apyPercentage: number;
}

const LCG_A = 1664525;
const LCG_C = 1013904223;
const LCG_M = 4294967296;

function toUtcDateString(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function hashToSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const next = (LCG_A * seed + LCG_C) % LCG_M;
  return next / LCG_M;
}

function roundTo(value: number, decimals: number): number {
  const p = 10 ** decimals;
  return Math.round(value * p) / p;
}

/**
 * Generates 7 days of deterministic mock APY history.
 * Base 12.5% with ±0.5% to ±1.5% daily fluctuation, seeded by poolId + date.
 */
export function generateMockApyHistory(poolId: string, now: Date = new Date()): ApyHistoryPoint[] {
  const utcMidnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0,
  ));

  const points: ApyHistoryPoint[] = [];
  const BASE_APY = 12.5;

  // Oldest -> newest (last 7 days including today)
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const d = new Date(utcMidnight);
    d.setUTCDate(d.getUTCDate() - daysAgo);

    const date = toUtcDateString(d);
    const seed = hashToSeed(`${poolId}-${date}`);
    const rand = seededRandom(seed); // 0..1
    // Map 0..1 to ±0.5..±1.5% noise
    const noiseRange = 0.5 + rand; // 0.5 to 1.5
    const noiseSign = rand > 0.5 ? 1 : -1;
    const variability = noiseSign * noiseRange;
    const apyPercentage = roundTo(BASE_APY + variability, 2);

    points.push({ date, apyPercentage });
  }

  return points;
}

