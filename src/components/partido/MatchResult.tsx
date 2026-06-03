'use client';

import type { MatchSimResult } from '@/lib/simulateMatch';

interface MatchResultProps {
  result: MatchSimResult;
  labels?: {
    topScore: string;
    top5: string;
    wins: string;
    draw: string;
  };
}

export function MatchResult({ result, labels }: MatchResultProps) {
  const { teamAWin, draw, teamBWin, topScores, teamAName, teamBName } = result;

  const pA = (teamAWin * 100).toFixed(1);
  const pD = (draw * 100).toFixed(1);
  const pB = (teamBWin * 100).toFixed(1);

  const topScore = topScores[0] ?? null;

  const winsLabel = labels?.wins ?? 'gana';
  const drawLabel = labels?.draw ?? 'Empate';
  const topScoreLabel = labels?.topScore ?? 'MARCADOR MÁS PROBABLE';
  const top5Label = labels?.top5 ?? 'TOP 5 MARCADORES';

  return (
    <div className="flex flex-col gap-6">
      {/* Probability columns */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--bg-surface)' }}
      >
        {/* Bar */}
        <div
          className="w-full h-3 rounded-full overflow-hidden flex mb-4"
          style={{ background: 'var(--bg-surface-2)' }}
        >
          <div
            style={{
              width: `${teamAWin * 100}%`,
              background: 'var(--col-yellow)',
            }}
          />
          <div
            style={{
              width: `${draw * 100}%`,
              background: 'var(--text-muted)',
            }}
          />
          <div
            style={{
              width: `${teamBWin * 100}%`,
              background: 'var(--col-blue)',
            }}
          />
        </div>

        {/* Columns */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Team A win */}
          <div className="flex flex-col gap-1">
            <span
              className="text-3xl font-black"
              style={{ color: 'var(--col-yellow)' }}
            >
              {pA}%
            </span>
            <span
              className="text-xs font-medium truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {teamAName}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {winsLabel}
            </span>
          </div>

          {/* Draw */}
          <div className="flex flex-col gap-1">
            <span
              className="text-3xl font-black"
              style={{ color: 'var(--text-muted)' }}
            >
              {pD}%
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {drawLabel}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              &nbsp;
            </span>
          </div>

          {/* Team B win */}
          <div className="flex flex-col gap-1">
            <span
              className="text-3xl font-black"
              style={{ color: 'var(--col-blue)' }}
            >
              {pB}%
            </span>
            <span
              className="text-xs font-medium truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {teamBName}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {winsLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Most likely score */}
      {topScore && (
        <div
          className="rounded-xl p-4 flex flex-col gap-2"
          style={{ background: 'var(--bg-surface)' }}
        >
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            {topScoreLabel}
          </p>
          <div className="flex items-center gap-3">
            <span
              className="text-4xl font-black"
              style={{ color: 'var(--text-primary)' }}
            >
              {topScore.score}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {(topScore.probability * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Top 5 scores */}
      {topScores.length > 0 && (
        <div className="flex flex-col gap-2">
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            {top5Label}
          </p>
          <div className="flex flex-wrap gap-2">
            {topScores.map(({ score, probability }) => (
              <span
                key={score}
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: 'var(--bg-surface-2)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {score}{' '}
                <span style={{ color: 'var(--text-muted)' }}>
                  {(probability * 100).toFixed(1)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
