/**
 * TeamSelector logic tests.
 * Tests the can-simulate predicate logic without DOM rendering,
 * since vitest is configured with the 'node' environment.
 */
import { describe, it, expect } from 'vitest';
import type { Team } from '@/lib/sim/types';

const makeTeam = (id: string, elo = 1800): Team => ({
  id,
  name_en: id,
  name_es: id,
  flag: id.toLowerCase(),
  elo,
  is_host: false,
  elo_1y_ago: null,
});

// Mirrors the canSimulate logic in TeamSelector.tsx
function canSimulate(
  teamAId: string,
  teamBId: string,
  disabled: boolean,
): boolean {
  const hasA = teamAId !== '';
  const hasB = teamBId !== '';
  return !disabled && hasA && hasB && teamAId !== teamBId;
}

describe('TeamSelector canSimulate logic', () => {
  it('returns false when teamA is empty', () => {
    expect(canSimulate('', 'ARG', false)).toBe(false);
  });

  it('returns false when teamB is empty', () => {
    expect(canSimulate('ESP', '', false)).toBe(false);
  });

  it('returns false when teamA === teamB', () => {
    expect(canSimulate('ESP', 'ESP', false)).toBe(false);
  });

  it('returns false when disabled=true even if teams are different', () => {
    expect(canSimulate('ESP', 'ARG', true)).toBe(false);
  });

  it('returns true when two different teams selected and not disabled', () => {
    expect(canSimulate('ESP', 'ARG', false)).toBe(true);
  });

  it('returns true for any two distinct team IDs', () => {
    expect(canSimulate('BRA', 'FRA', false)).toBe(true);
  });
});

describe('TeamSelector team list helpers', () => {
  const teams = [
    makeTeam('ESP', 2165),
    makeTeam('ARG', 2113),
    makeTeam('FRA', 2098),
  ];

  it('can find a team by id', () => {
    const found = teams.find((t) => t.id === 'ARG');
    expect(found).toBeDefined();
    expect(found?.elo).toBe(2113);
  });

  it('returns undefined for unknown id', () => {
    const found = teams.find((t) => t.id === 'ZZZ');
    expect(found).toBeUndefined();
  });

  it('has 3 teams in test fixture', () => {
    expect(teams).toHaveLength(3);
  });
});
