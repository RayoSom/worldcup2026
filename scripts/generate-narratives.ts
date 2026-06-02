/**
 * Generates team narratives for all 48 World Cup 2026 teams using Google Gemini Flash.
 *
 * Usage: npm run generate:narratives
 *
 * Reads team data from src/data/teams.json (fields: id, name_en, name_es, elo)
 * Writes output to src/data/team-narratives.json
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import fs from 'fs'
import path from 'path'

// Load team data — structure: { teams: Array<{ id, name_en, name_es, elo, ... }> }
const teamsData = JSON.parse(fs.readFileSync('src/data/teams.json', 'utf-8'))

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
})

interface TeamNarrative {
  name: string
  nameEs: string
  elo: number
  style: string
  styleEs: string
  strengths: string[]
  strengthsEs: string[]
  keyPlayers: string[]
  analysis: string
  analysisEs: string
}

async function generateNarrative(team: {
  id: string
  name_en: string
  name_es: string
  elo: number
}): Promise<TeamNarrative> {
  const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    prompt: `Generate a concise FIFA World Cup 2026 team analysis for ${team.name_en} (ELO rating: ${team.elo}).

Return ONLY valid JSON with this exact structure, no markdown, no extra text:
{
  "name": "${team.name_en}",
  "nameEs": "${team.name_es}",
  "elo": ${team.elo},
  "style": "<playing style in 1 sentence in English>",
  "styleEs": "<estilo de juego en 1 frase en español>",
  "strengths": ["<strength 1 in English>", "<strength 2>", "<strength 3>"],
  "strengthsEs": ["<fortaleza 1 en español>", "<fortaleza 2>", "<fortaleza 3>"],
  "keyPlayers": ["<player 1 full name>", "<player 2>", "<player 3>"],
  "analysis": "<2-sentence World Cup 2026 outlook in English>",
  "analysisEs": "<perspectiva del Mundial 2026 en 2 frases en español>"
}`,
    maxTokens: 500,
  })

  // Strip any markdown code blocks if present
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
  return JSON.parse(cleaned)
}

const OUTPUT_PATH = path.join('src/data/team-narratives.json')

async function main() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error('Error: GOOGLE_GENERATIVE_AI_API_KEY is not set.')
    process.exit(1)
  }

  // Load existing narratives so we can resume without re-generating
  let narratives: Record<string, TeamNarrative> = {}
  if (fs.existsSync(OUTPUT_PATH)) {
    narratives = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'))
    console.log(`Loaded ${Object.keys(narratives).length} existing narratives, will skip those.`)
  }

  const teams: Array<{ id: string; name_en: string; name_es: string; elo: number }> =
    teamsData.teams

  const remaining = teams.filter(t => !narratives[t.id])
  console.log(`Generating narratives for ${remaining.length} remaining teams (${teams.length} total) with Gemini Flash...`)
  // gemini-2.5-flash free tier: 5 RPM -> wait 13s between requests to be safe
  const DELAY_MS = 13_000

  for (const team of remaining) {
    try {
      process.stdout.write(`  -> ${team.name_en} (${team.id})... `)
      narratives[team.id] = await generateNarrative(team)
      console.log('OK')
      // Save after each successful generation to preserve progress
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(narratives, null, 2))
      await new Promise(r => setTimeout(r, DELAY_MS))
    } catch (err) {
      console.error(`\n  ERROR with ${team.id}:`, err)
      // Continue with remaining teams
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(narratives, null, 2))
  console.log(`\nSaved ${Object.keys(narratives).length}/${teams.length} narratives to ${OUTPUT_PATH}`)
}

main().catch(console.error)
