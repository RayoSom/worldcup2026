'use client';

import narrativesData from '@/data/team-narratives.json';
import type { Team } from '@/lib/sim/types';
import { Flag } from '@/components/Flag';

type NarrativeEntry = {
  name: string;
  nameEs: string;
  elo: number;
  style: string;
  styleEs: string;
  strengths: string[];
  strengthsEs: string[];
  keyPlayers: string[];
  analysis: string;
  analysisEs: string;
};

const narratives = narrativesData as Record<string, NarrativeEntry>;

interface NarrativeCardProps {
  team: Team;
  locale: string;
}

export function NarrativeCard({ team, locale }: NarrativeCardProps) {
  const entry = narratives[team.id];

  if (!entry) {
    return null;
  }

  const name = locale === 'es' ? entry.nameEs : entry.name;
  const style = locale === 'es' ? entry.styleEs : entry.style;
  const strengths = locale === 'es' ? entry.strengthsEs : entry.strengths;
  const analysis = locale === 'es' ? entry.analysisEs : entry.analysis;

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Flag code={team.flag} size={32} />
        <div className="flex flex-col">
          <span
            className="font-bold text-base"
            style={{ color: 'var(--text-primary)' }}
          >
            {name}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-mono self-start mt-0.5"
            style={{
              background: 'var(--bg-surface-2)',
              color: 'var(--col-yellow)',
              border: '1px solid rgba(252,209,22,0.3)',
            }}
          >
            ELO {team.elo}
          </span>
        </div>
      </div>

      {/* Style */}
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {style}
      </p>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {strengths.map((s) => (
            <span
              key={s}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(252,209,22,0.08)',
                color: 'var(--col-yellow)',
                border: '1px solid rgba(252,209,22,0.2)',
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Key players */}
      {entry.keyPlayers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.keyPlayers.map((p) => (
            <span
              key={p}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--bg-surface-2)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Analysis */}
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {analysis}
      </p>
    </div>
  );
}
