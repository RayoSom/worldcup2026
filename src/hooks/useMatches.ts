'use client'

import { useEffect, useState } from 'react'
import type { ParsedMatch } from '@/lib/footballApi'

interface MatchesState {
  matches: ParsedMatch[]
  loading: boolean
  error: string | null
  liveCount: number
  configured: boolean
}

export function useMatches(): MatchesState {
  const [state, setState] = useState<MatchesState>({
    matches: [],
    loading: true,
    error: null,
    liveCount: 0,
    configured: false,
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/matches')
        const data = await res.json()
        const liveCount = (data.matches as ParsedMatch[]).filter(m => m.matchStatus === 'live').length
        setState({ matches: data.matches, loading: false, error: null, liveCount, configured: data.configured ?? false })
      } catch {
        setState(s => ({ ...s, loading: false, error: 'Error cargando partidos' }))
      }
    }

    load()
    const interval = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return state
}
