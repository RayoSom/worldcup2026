import teamsRaw from '@/data/teams.json'
import narrativesRaw from '@/data/team-narratives.json'

// teams.json has a "teams" array
const teams = (teamsRaw as any).teams ?? (Array.isArray(teamsRaw) ? teamsRaw : Object.values(teamsRaw))

export function buildSystemPrompt(context?: {
  teamA?: { name: string; elo: number }
  teamB?: { name: string; elo: number }
  matchResult?: { teamAWin: number; draw: number; teamBWin: number }
}): string {
  const eloList = teams
    .map((t: any) => `${t.name_en ?? t.name} (ELO: ${t.elo})`)
    .join(', ')

  let base = `You are an expert football analyst specializing in the 2026 FIFA World Cup.
The tournament is hosted in the USA, Mexico, and Canada. 48 teams compete in 12 groups.
Teams with their current ELO ratings: ${eloList}.
Respond concisely and with passion. Match the user's language (Spanish or English).
Current date: ${new Date().toLocaleDateString('en-US')}.
Keep responses under 250 words unless the user asks for more detail.`

  if (context?.teamA && context?.teamB) {
    const narratives = narrativesRaw as Record<string, any>
    // Find team narratives by name matching (English or Spanish name)
    const narA = Object.values(narratives).find((n: any) =>
      n.name === context.teamA!.name || n.nameEs === context.teamA!.name
    )
    const narB = Object.values(narratives).find((n: any) =>
      n.name === context.teamB!.name || n.nameEs === context.teamB!.name
    )

    base += `\n\nMATCH CONTEXT:
Team A: ${context.teamA.name} (ELO: ${context.teamA.elo})${narA ? ` — ${narA.style}` : ''}
Team B: ${context.teamB.name} (ELO: ${context.teamB.elo})${narB ? ` — ${narB.style}` : ''}`

    if (context.matchResult) {
      const { teamAWin, draw, teamBWin } = context.matchResult
      base += `\nSimulation result: ${Math.round(teamAWin * 100)}% ${context.teamA.name} / ${Math.round(draw * 100)}% draw / ${Math.round(teamBWin * 100)}% ${context.teamB.name}`
    }
  }

  return base
}
