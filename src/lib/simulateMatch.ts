/**
 * Single-match simulator wrapper.
 *
 * Runs N Monte Carlo simulations of a single match between two teams
 * using the existing ELO+Poisson engine (lambdaFor + samplePoisson).
 * Returns win probabilities and a score frequency histogram.
 */

import type { Team } from './sim/types';
import { XoshiroRNG } from './sim/rng';
import { lambdaFor, samplePoisson } from './sim/goals';
import { effectiveElo } from './sim/match';

export interface MatchSimResult {
  teamAWin: number;   // 0–1
  draw: number;       // 0–1
  teamBWin: number;   // 0–1
  topScores: Array<{ score: string; probability: number }>;
  teamAName: string;
  teamBName: string;
}

const N = 10_000;
const MAX_SCORE_GOALS = 7; // cap for histogram display

export function simulateMatch(
  teamA: Team,
  teamB: Team,
  locale: string = 'es',
): MatchSimResult {
  const rng = new XoshiroRNG(Date.now());
  const eloA = effectiveElo(teamA, 'group');
  const eloB = effectiveElo(teamB, 'group');
  const lambdaA = lambdaFor(eloA, eloB);
  const lambdaB = lambdaFor(eloB, eloA);

  let winsA = 0;
  let draws = 0;
  let winsB = 0;

  // Score histogram: key = "ga-gb"
  const scoreMap = new Map<string, number>();

  for (let i = 0; i < N; i++) {
    const ga = samplePoisson(lambdaA, rng);
    const gb = samplePoisson(lambdaB, rng);

    if (ga > gb) winsA++;
    else if (ga < gb) winsB++;
    else draws++;

    // Only track scores within display range
    const ka = Math.min(ga, MAX_SCORE_GOALS);
    const kb = Math.min(gb, MAX_SCORE_GOALS);
    const key = `${ka}-${kb}`;
    scoreMap.set(key, (scoreMap.get(key) ?? 0) + 1);
  }

  // Sort scores by frequency, take top 5
  const topScores = Array.from(scoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([score, count]) => ({
      score,
      probability: count / N,
    }));

  const teamAName = locale === 'es' ? teamA.name_es : teamA.name_en;
  const teamBName = locale === 'es' ? teamB.name_es : teamB.name_en;

  return {
    teamAWin: winsA / N,
    draw: draws / N,
    teamBWin: winsB / N,
    topScores,
    teamAName,
    teamBName,
  };
}
