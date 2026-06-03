import { NextResponse } from 'next/server'
import { parseMatch } from '@/lib/footballApi'

const WC2026_ID = 'WC'

export async function GET() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey || apiKey === 'REEMPLAZAR') {
    // Return empty matches when key not configured
    return NextResponse.json({ matches: [], configured: false })
  }

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${WC2026_ID}/matches`,
      {
        headers: { 'X-Auth-Token': apiKey },
        next: { revalidate: 300 },
      }
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Football data API error', status: res.status, matches: [] },
        { status: 502 }
      )
    }

    const data = await res.json()
    const matches = (data.matches ?? []).map(parseMatch)
    return NextResponse.json({ matches, configured: true })
  } catch {
    return NextResponse.json({ matches: [], configured: false, error: 'fetch failed' })
  }
}
