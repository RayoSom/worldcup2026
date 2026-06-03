'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'wc2026_access_code'

interface AccessCodeState {
  code: string | null
  isUnlocked: boolean
  validating: boolean
  error: string | null
}

export function useAccessCode() {
  const [state, setState] = useState<AccessCodeState>({
    code: null,
    isUnlocked: false,
    validating: false,
    error: null,
  })

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setState(s => ({ ...s, code: stored, isUnlocked: true }))
  }, [])

  async function unlock(input: string): Promise<boolean> {
    setState(s => ({ ...s, validating: true, error: null }))
    try {
      const res = await fetch('/api/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: input }),
      })
      if (res.ok) {
        localStorage.setItem(STORAGE_KEY, input)
        setState({ code: input, isUnlocked: true, validating: false, error: null })
        return true
      }
      setState(s => ({ ...s, validating: false, error: 'Código incorrecto. Intenta de nuevo.' }))
      return false
    } catch {
      setState(s => ({ ...s, validating: false, error: 'Error de conexión.' }))
      return false
    }
  }

  function lock() {
    localStorage.removeItem(STORAGE_KEY)
    setState({ code: null, isUnlocked: false, validating: false, error: null })
  }

  return { ...state, unlock, lock }
}
