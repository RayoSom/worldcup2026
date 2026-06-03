'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useAccessCode } from '@/hooks/useAccessCode'

interface ChatInterfaceProps {
  code: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ChatInterface({ code }: ChatInterfaceProps) {
  const t = useTranslations('predictor')
  const { lock } = useAccessCode()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: t('welcome'),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const nextId = () => {
    idRef.current += 1
    return String(idRef.current)
  }

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      const userMsg: Message = { id: nextId(), role: 'user', content: text.trim() }
      const aiId = nextId()

      setMessages(prev => [...prev, userMsg, { id: aiId, role: 'assistant', content: '' }])
      setInput('')
      setIsLoading(true)

      try {
        const history = messages
          .filter(m => m.id !== 'welcome' && m.content.trim())
          .map(m => ({ role: m.role, content: m.content }))

        const res = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-code': code,
          },
          body: JSON.stringify({
            messages: [...history, { role: 'user', content: text.trim() }],
          }),
        })

        if (!res.ok) {
          // 'Error del servidor.' has no matching i18n key — left hardcoded
          const errorText = res.status === 401 ? t('wrongCode') : 'Error del servidor.'
          setMessages(prev =>
            prev.map(m => (m.id === aiId ? { ...m, content: errorText } : m)),
          )
          return
        }

        if (!res.body) {
          setMessages(prev =>
            prev.map(m => (m.id === aiId ? { ...m, content: 'Sin respuesta.' } : m)),
          )
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          setMessages(prev =>
            prev.map(m => (m.id === aiId ? { ...m, content: accumulated } : m)),
          )
        }
      } catch {
        setMessages(prev =>
          prev.map(m =>
            m.id === aiId ? { ...m, content: t('connectionError') } : m,
          ),
        )
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading, code, t],
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1
              className="text-2xl font-black tracking-tight"
              style={{
                background: 'var(--gradient-ia)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('title')}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {/* "Mundial 2026 · Análisis con Gemini" has no matching i18n key — left hardcoded */}
              Mundial 2026 · Análisis con Gemini
            </p>
          </div>

          {/* Logout button */}
          <button
            onClick={lock}
            className="shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-opacity hover:opacity-70"
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-muted)',
              border: '1px solid color-mix(in srgb, var(--text-muted) 20%, transparent)',
            }}
          >
            {t('logout')}
          </button>
        </div>

        {/* Messages container */}
        <div
          className="flex flex-col gap-3 overflow-y-auto rounded-xl p-4"
          style={{
            minHeight: '300px',
            maxHeight: '500px',
            background: 'var(--bg-surface)',
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[85%] rounded-xl px-4 py-3 text-sm"
                style={
                  msg.role === 'assistant'
                    ? {
                        background: 'color-mix(in srgb, var(--ia-purple) 10%, var(--bg-surface-2))',
                        border: '1px solid color-mix(in srgb, var(--ia-purple) 25%, transparent)',
                        color: 'var(--text-primary)',
                      }
                    : {
                        background: 'color-mix(in srgb, #3b82f6 15%, var(--bg-surface-2))',
                        border: '1px solid color-mix(in srgb, #3b82f6 30%, transparent)',
                        color: 'var(--text-primary)',
                      }
                }
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {msg.content || (isLoading && msg.role === 'assistant' ? '' : msg.content)}
                </p>
              </div>
            </div>
          ))}

          {/* Analyzing placeholder */}
          {isLoading && (
            <div className="flex justify-start">
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: 'color-mix(in srgb, var(--ia-purple) 10%, var(--bg-surface-2))',
                  border: '1px solid color-mix(in srgb, var(--ia-purple) 25%, transparent)',
                  color: 'var(--text-muted)',
                }}
              >
                <span className="animate-pulse">{t('analyzing')}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('chatPlaceholder')}
            disabled={isLoading}
            className="flex-1 rounded-lg px-4 py-3 text-sm outline-none disabled:opacity-50"
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid color-mix(in srgb, var(--ia-purple) 30%, transparent)',
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 rounded-lg text-sm font-bold disabled:opacity-50 transition-opacity"
            style={{
              background: 'var(--gradient-ia)',
              color: '#fff',
            }}
          >
            →
          </button>
        </form>
      </div>
    </div>
  )
}
