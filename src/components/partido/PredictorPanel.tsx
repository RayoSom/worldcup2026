'use client';

import { useState, useRef, useCallback } from 'react';
import { useAccessCode } from '@/hooks/useAccessCode';
import { modules } from '@/config/modules';

interface Props {
  teamA: { code: string; name: string; elo: number };
  teamB: { code: string; name: string; elo: number };
  matchResult: { teamAWin: number; draw: number; teamBWin: number };
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function PredictorPanel({ teamA, teamB, matchResult }: Props) {
  if (!modules.predictor.panelEnabled) return null;

  return <PredictorPanelInner teamA={teamA} teamB={teamB} matchResult={matchResult} />;
}

function PredictorPanelInner({ teamA, teamB, matchResult }: Props) {
  const { code, isUnlocked, validating, error, unlock } = useAccessCode();
  const [inputCode, setInputCode] = useState('');

  if (!isUnlocked) {
    return (
      <div
        className="rounded-xl p-5 flex flex-col gap-3"
        style={{
          border: '2px dashed var(--ia-purple)',
          background: 'var(--bg-surface)',
        }}
      >
        <h3
          className="text-sm font-black tracking-widest uppercase"
          style={{ color: 'var(--ia-purple)' }}
        >
          🤖 PREDICTOR IA
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Análisis táctico con IA. Ingresa tu código para activar.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && inputCode.trim()) {
                unlock(inputCode.trim());
              }
            }}
            placeholder="Código de acceso"
            className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              background: 'var(--bg-surface-2)',
              color: 'var(--text-primary)',
              border: '1px solid var(--ia-purple)',
            }}
          />
          <button
            onClick={() => {
              if (inputCode.trim()) unlock(inputCode.trim());
            }}
            disabled={validating || !inputCode.trim()}
            className="rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-50"
            style={{
              background: 'var(--ia-purple)',
              color: '#fff',
            }}
          >
            {validating ? 'Verificando…' : 'Activar'}
          </button>
        </div>
        {error && (
          <p className="text-xs" style={{ color: 'var(--col-red)' }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <UnlockedChat
      teamA={teamA}
      teamB={teamB}
      matchResult={matchResult}
      code={code ?? ''}
    />
  );
}

interface UnlockedChatProps extends Props {
  code: string;
}

function UnlockedChat({ teamA, teamB, matchResult, code }: UnlockedChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Analizando ${teamA.name} vs ${teamB.name}. ¿Qué quieres saber sobre este partido?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const idRef = useRef(0);

  const nextId = () => {
    idRef.current += 1;
    return String(idRef.current);
  };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = { id: nextId(), role: 'user', content: text.trim() };
      const aiId = nextId();

      setMessages(prev => [...prev, userMsg, { id: aiId, role: 'assistant', content: '' }]);
      setInput('');
      setIsLoading(true);

      try {
        // Build model messages from history (exclude welcome placeholder for the API)
        const history = messages
          .filter(m => m.id !== 'welcome' && m.content.trim())
          .map(m => ({ role: m.role, content: m.content }));

        const res = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-code': code,
          },
          body: JSON.stringify({
            messages: [...history, { role: 'user', content: text.trim() }],
            context: {
              teamA: { name: teamA.name, elo: teamA.elo },
              teamB: { name: teamB.name, elo: teamB.elo },
              matchResult,
            },
          }),
        });

        if (!res.ok) {
          const errorText = res.status === 401 ? 'Código no válido.' : 'Error del servidor.';
          setMessages(prev =>
            prev.map(m => (m.id === aiId ? { ...m, content: errorText } : m)),
          );
          return;
        }

        if (!res.body) {
          setMessages(prev =>
            prev.map(m => (m.id === aiId ? { ...m, content: 'Sin respuesta.' } : m)),
          );
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages(prev =>
            prev.map(m => (m.id === aiId ? { ...m, content: accumulated } : m)),
          );
        }
      } catch {
        setMessages(prev =>
          prev.map(m =>
            m.id === aiId ? { ...m, content: 'Error de conexión. Intenta de nuevo.' } : m,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, code, teamA, teamB, matchResult],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4"
      style={{ background: 'var(--bg-surface)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3
          className="text-sm font-black tracking-widest uppercase"
          style={{ color: 'var(--ia-purple)' }}
        >
          🤖 PREDICTOR IA
        </h3>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: '#16a34a22', color: '#16a34a' }}
        >
          ● ACTIVO
        </span>
      </div>

      {/* Messages */}
      <div
        className="flex flex-col gap-2 overflow-y-auto"
        style={{ maxHeight: '256px' }}
      >
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap"
              style={
                m.role === 'user'
                  ? {
                      background: '#1e3a5f',
                      color: 'var(--text-primary)',
                    }
                  : {
                      background: 'var(--bg-surface-2)',
                      color: 'var(--text-primary)',
                      borderLeft: '3px solid var(--ia-purple)',
                    }
              }
            >
              {m.content || (isLoading ? 'Analizando…' : '')}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Pregunta sobre el partido…"
          disabled={isLoading}
          className="flex-1 rounded-lg px-3 py-2 text-sm outline-none disabled:opacity-50"
          style={{
            background: 'var(--bg-surface-2)',
            color: 'var(--text-primary)',
            border: '1px solid var(--ia-purple)',
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-50"
          style={{
            background: 'var(--gradient-ia)',
            color: '#fff',
          }}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
