'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import teamsData from '@/data/teams.json';
import type { Team } from '@/lib/sim/types';
import { TeamSelector } from '@/components/partido/TeamSelector';
import { MatchResult } from '@/components/partido/MatchResult';
import { NarrativeCard } from '@/components/partido/NarrativeCard';
import { PredictorPanel } from '@/components/partido/PredictorPanel';
import { simulateMatch, type MatchSimResult } from '@/lib/simulateMatch';
import { modules } from '@/config/modules';

const teams: Team[] = (teamsData as { teams: Team[] }).teams;

interface PartidoClientProps {
  locale: string;
}

export function PartidoClient({ locale }: PartidoClientProps) {
  const t = useTranslations('partido');
  const [result, setResult] = useState<MatchSimResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);

  function handleSelect(a: Team, b: Team) {
    setIsSimulating(true);
    setTeamA(a);
    setTeamB(b);
    // Run synchronously on next tick to allow the "simulating" state to render
    setTimeout(() => {
      const res = simulateMatch(a, b, locale);
      setResult(res);
      setIsSimulating(false);
    }, 50);
  }

  const selectorLabels = {
    selectTeam: t('selectTeam'),
    simulate: t('simulate'),
    simulating: t('simulating'),
  };

  const resultLabels = {
    topScore: t('topScore'),
    top5: t('top5'),
    wins: t('wins'),
    draw: t('draw'),
  };

  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-10">
        {/* Header */}
        <div className="text-center flex flex-col gap-2">
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('title')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('subtitle')}
          </p>
        </div>

        {/* Step 1 — Team selector */}
        <section className="flex flex-col gap-3">
          <StepLabel label={t('step1')} />
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-surface)' }}
          >
            <TeamSelector
              teams={teams}
              onSelect={handleSelect}
              disabled={isSimulating}
              locale={locale}
              labels={selectorLabels}
            />
          </div>
        </section>

        {/* Simulating indicator */}
        {isSimulating && (
          <p
            className="text-center text-sm font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            {t('simulating')}
          </p>
        )}

        {/* Step 2 — Result */}
        {result && !isSimulating && (
          <section className="flex flex-col gap-3">
            <StepLabel label={t('step2')} />
            <MatchResult result={result} labels={resultLabels} />
          </section>
        )}

        {/* Step 3 — Analysis */}
        {result && !isSimulating && teamA && teamB && (
          <section className="flex flex-col gap-3">
            <StepLabel label={t('step3')} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NarrativeCard team={teamA} locale={locale} />
              <NarrativeCard team={teamB} locale={locale} />
            </div>
          </section>
        )}

        {/* Step 4 — AI Predictor Panel */}
        {result && !isSimulating && teamA && teamB && modules.predictor.panelEnabled && (
          <section className="flex flex-col gap-3">
            <StepLabel label="Predictor IA" />
            <PredictorPanel
              teamA={{ code: teamA.id, name: locale === 'es' ? teamA.name_es : teamA.name_en, elo: teamA.elo }}
              teamB={{ code: teamB.id, name: locale === 'es' ? teamB.name_es : teamB.name_en, elo: teamB.elo }}
              matchResult={{ teamAWin: result.teamAWin, draw: result.draw, teamBWin: result.teamBWin }}
            />
          </section>
        )}
      </div>
    </div>
  );
}

function StepLabel({ label }: { label: string }) {
  return (
    <p
      className="text-xs font-bold tracking-widest uppercase"
      style={{ color: 'var(--text-muted)' }}
    >
      {label}
    </p>
  );
}
