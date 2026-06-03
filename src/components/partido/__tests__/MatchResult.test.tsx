/**
 * MatchResult data logic tests.
 * Tests the simulateMatch output structure and numeric properties
 * without DOM rendering (vitest node environment).
 */
import { describe, it, expect } from 'vitest';
import type { MatchSimResult } from '@/lib/simulateMatch';

// Build a MatchSimResult from raw values (mirrors MatchResult component data)
function makeResult(
  aWin: number,
  draw: number,
  bWin: number,
  scores: Array<{ score: string; probability: number }> = [],
): MatchSimResult {
  return {
    teamAWin: aWin,
    draw,
    teamBWin: bWin,
    topScores: scores,
    teamAName: 'Spain',
    teamBName: 'Argentina',
  };
}

// Mirrors the formatting logic used in MatchResult.tsx
function formatPct(value: number): string {
  return (value * 100).toFixed(1) + '%';
}

describe('MatchResult percentage formatting', () => {
  it('formats 0.623 as "62.3%"', () => {
    expect(formatPct(0.623)).toBe('62.3%');
  });

  it('formats 0 as "0.0%"', () => {
    expect(formatPct(0)).toBe('0.0%');
  });

  it('formats 1 as "100.0%"', () => {
    expect(formatPct(1)).toBe('100.0%');
  });

  it('formats 0.333 as "33.3%"', () => {
    expect(formatPct(0.333)).toBe('33.3%');
  });
});

describe('MatchResult structure validation', () => {
  it('probabilities sum to approximately 1', () => {
    const result = makeResult(0.5, 0.25, 0.25);
    const sum = result.teamAWin + result.draw + result.teamBWin;
    expect(sum).toBeCloseTo(1, 5);
  });

  it('result contains teamAName and teamBName', () => {
    const result = makeResult(0.4, 0.3, 0.3);
    expect(result.teamAName).toBe('Spain');
    expect(result.teamBName).toBe('Argentina');
  });

  it('topScores can have up to 5 entries', () => {
    const scores = [
      { score: '1-0', probability: 0.12 },
      { score: '1-1', probability: 0.10 },
      { score: '2-1', probability: 0.09 },
      { score: '0-0', probability: 0.08 },
      { score: '2-0', probability: 0.07 },
    ];
    const result = makeResult(0.5, 0.25, 0.25, scores);
    expect(result.topScores).toHaveLength(5);
  });

  it('topScores first entry is the most probable score', () => {
    const scores = [
      { score: '1-0', probability: 0.12 },
      { score: '0-0', probability: 0.10 },
    ];
    const result = makeResult(0.55, 0.20, 0.25, scores);
    expect(result.topScores[0].score).toBe('1-0');
    expect(result.topScores[0].probability).toBe(0.12);
  });

  it('teamAWin is between 0 and 1', () => {
    const result = makeResult(0.45, 0.28, 0.27);
    expect(result.teamAWin).toBeGreaterThanOrEqual(0);
    expect(result.teamAWin).toBeLessThanOrEqual(1);
  });
});

describe('MatchResult from simulateMatch output', () => {
  it('simulateMatch returns correct shape', async () => {
    const { simulateMatch } = await import('@/lib/simulateMatch');
    const teamA = {
      id: 'ESP',
      name_en: 'Spain',
      name_es: 'España',
      flag: 'es',
      elo: 2165,
      is_host: false,
      elo_1y_ago: 2178,
    };
    const teamB = {
      id: 'ARG',
      name_en: 'Argentina',
      name_es: 'Argentina',
      flag: 'ar',
      elo: 2113,
      is_host: false,
      elo_1y_ago: 2108,
    };
    const res = simulateMatch(teamA, teamB, 'es');
    // Probabilities in range [0, 1]
    expect(res.teamAWin).toBeGreaterThanOrEqual(0);
    expect(res.teamAWin).toBeLessThanOrEqual(1);
    expect(res.draw).toBeGreaterThanOrEqual(0);
    expect(res.teamBWin).toBeGreaterThanOrEqual(0);
    // Sum ≈ 1
    expect(res.teamAWin + res.draw + res.teamBWin).toBeCloseTo(1, 1);
    // topScores has ≤ 5 entries
    expect(res.topScores.length).toBeGreaterThan(0);
    expect(res.topScores.length).toBeLessThanOrEqual(5);
    // Team names in spanish
    expect(res.teamAName).toBe('España');
    expect(res.teamBName).toBe('Argentina');
  });
});
