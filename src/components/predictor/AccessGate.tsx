'use client'

import { useState, KeyboardEvent } from 'react'
import { useTranslations } from 'next-intl'

interface AccessGateProps {
  onUnlock: (code: string) => Promise<boolean>
  validating: boolean
  error: string | null
}

export function AccessGate({ onUnlock, validating, error }: AccessGateProps) {
  const t = useTranslations('predictor')
  const [input, setInput] = useState('')

  function handleSubmit() {
    if (input.trim()) {
      onUnlock(input.trim())
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const features = [
    { icon: '🧠', label: t('feature1') },
    { icon: '📊', label: t('feature2') },
    { icon: '💬', label: t('feature3') },
  ]

  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-16"
      style={{ minHeight: '60vh' }}
    >
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        {/* Lock icon */}
        <div className="text-6xl">🔒</div>

        {/* Title */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1
            className="text-3xl font-black tracking-tight"
            style={{
              background: 'var(--gradient-ia)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('title')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('subtitle')}
          </p>
        </div>

        {/* Feature preview cards */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {features.map(({ icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-xl p-4 text-center"
              style={{ background: 'var(--bg-surface)' }}
            >
              <span className="text-2xl">{icon}</span>
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Access code form */}
        <div className="flex flex-col gap-3 w-full">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder')}
              disabled={validating}
              className="flex-1 rounded-lg px-4 py-3 text-sm outline-none disabled:opacity-50"
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid color-mix(in srgb, var(--ia-purple) 30%, transparent)',
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={validating || !input.trim()}
              className="px-5 py-3 rounded-lg text-sm font-bold tracking-wide disabled:opacity-50 transition-opacity"
              style={{
                background: 'var(--gradient-ia)',
                color: '#fff',
              }}
            >
              {validating ? '...' : t('enter')}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <p
              className="text-xs text-center font-medium"
              style={{ color: 'var(--col-red, #ef4444)' }}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
