'use client';

import { useState } from 'react';
import type { Team } from '@/lib/sim/types';
import { Flag } from '@/components/Flag';

interface TeamSelectorProps {
  teams: Team[];
  onSelect: (teamA: Team, teamB: Team) => void;
  disabled?: boolean;
  locale?: string;
  labels?: {
    selectTeam: string;
    simulate: string;
    simulating: string;
  };
}

export function TeamSelector({
  teams,
  onSelect,
  disabled = false,
  locale = 'es',
  labels,
}: TeamSelectorProps) {
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');

  const teamA = teams.find((t) => t.id === teamAId) ?? null;
  const teamB = teams.find((t) => t.id === teamBId) ?? null;

  const canSimulate =
    !disabled &&
    teamA !== null &&
    teamB !== null &&
    teamAId !== teamBId;

  function handleSimulate() {
    if (!teamA || !teamB) return;
    onSelect(teamA, teamB);
  }

  const selectPlaceholder = labels?.selectTeam ?? 'Selecciona equipo...';
  const simulateLabel = disabled
    ? (labels?.simulating ?? 'Simulando 10.000 partidos...')
    : (labels?.simulate ?? 'SIMULAR');

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        {/* Team A */}
        <TeamPickerSlot
          teams={teams}
          selectedId={teamAId}
          onChange={setTeamAId}
          placeholder={selectPlaceholder}
          locale={locale}
          disabled={disabled}
        />

        {/* VS divider */}
        <div
          className="hidden sm:flex items-center justify-center text-xl font-bold"
          style={{ color: 'var(--text-muted)' }}
        >
          VS
        </div>

        {/* Team B */}
        <TeamPickerSlot
          teams={teams}
          selectedId={teamBId}
          onChange={setTeamBId}
          placeholder={selectPlaceholder}
          locale={locale}
          disabled={disabled}
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSimulate}
          disabled={!canSimulate}
          className="px-8 py-3 rounded-lg font-bold text-sm tracking-widest uppercase transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: canSimulate
              ? 'var(--gradient-colombia)'
              : 'var(--bg-surface-2)',
            color: canSimulate ? '#000' : 'var(--text-muted)',
          }}
        >
          {simulateLabel}
        </button>
      </div>
    </div>
  );
}

interface TeamPickerSlotProps {
  teams: Team[];
  selectedId: string;
  onChange: (id: string) => void;
  placeholder: string;
  locale: string;
  disabled: boolean;
}

function TeamPickerSlot({
  teams,
  selectedId,
  onChange,
  placeholder,
  locale,
  disabled,
}: TeamPickerSlotProps) {
  const selected = teams.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-2">
      <div
        className="rounded-lg border overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <select
          aria-label={placeholder}
          value={selectedId}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'transparent',
            color: selectedId ? 'var(--text-primary)' : 'var(--text-muted)',
          }}
        >
          <option value="">{placeholder}</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {locale === 'es' ? t.name_es : t.name_en}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="flex items-center gap-2 px-1">
          <Flag code={selected.flag} size={20} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            ELO {selected.elo}
          </span>
        </div>
      )}
    </div>
  );
}
