export type MatchStatus = 'scheduled' | 'live' | 'finished'

export interface FootballMatch {
  id: number
  homeTeam: { name: string; tla: string }
  awayTeam: { name: string; tla: string }
  score: { fullTime: { home: number | null; away: number | null } }
  status: string
  utcDate: string
  matchday: number
}

export interface ParsedMatch extends FootballMatch {
  matchStatus: MatchStatus
}

export function isMatchPlayed(status: string): boolean {
  return status === 'FINISHED'
}

export function isMatchLive(status: string): boolean {
  return status === 'IN_PLAY' || status === 'PAUSED'
}

export function parseMatchStatus(status: string): MatchStatus {
  if (isMatchLive(status)) return 'live'
  if (isMatchPlayed(status)) return 'finished'
  return 'scheduled'
}

export function parseMatch(raw: FootballMatch): ParsedMatch {
  return { ...raw, matchStatus: parseMatchStatus(raw.status) }
}
