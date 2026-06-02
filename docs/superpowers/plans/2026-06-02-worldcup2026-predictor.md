# WC2026 Predictor — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extender el fork de `kmanus88/worldcup2026` con simulador de partido individual, resultados reales via API y chat IA (Claude) con acceso por código secreto, todo con tema visual Colombia Premium.

**Architecture:** Fork del repo base → nueva config de módulos → rediseño visual → nuevas rutas `/partido` y `/predictor` → API routes para resultados reales y chat IA. Cada módulo es independiente y se puede desactivar con una variable de entorno.

**Tech Stack:** Next.js 15 · TypeScript · Tailwind v4 · next-intl · Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) · football-data.org API · Claude Haiku

---

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/config/modules.ts` | CREAR | Flags de activación por módulo |
| `src/styles/globals.css` | MODIFICAR | Tokens CSS del tema Colombia Premium |
| `src/components/layout/Navbar.tsx` | MODIFICAR | Nav horizontal con módulos condicionales |
| `src/data/team-narratives.json` | CREAR | Análisis pre-generado de 48 equipos |
| `scripts/generate-narratives.ts` | CREAR | Script offline para generar narrativas con Claude |
| `src/app/[locale]/partido/page.tsx` | CREAR | Página simulador de partido |
| `src/components/partido/TeamSelector.tsx` | CREAR | Dropdowns A vs B con flags y ELO |
| `src/components/partido/MatchResult.tsx` | CREAR | Probas + marcadores + barra de progreso |
| `src/components/partido/NarrativeCard.tsx` | CREAR | Tarjeta narrativa por equipo |
| `src/components/partido/PredictorPanel.tsx` | CREAR | Panel IA contextual (bloqueado/desbloqueado) |
| `src/app/[locale]/predictor/page.tsx` | CREAR | Página chat IA dedicada |
| `src/components/predictor/AccessGate.tsx` | CREAR | Pantalla de bloqueo con campo de código |
| `src/components/predictor/ChatInterface.tsx` | CREAR | Chat con streaming (useChat) |
| `src/hooks/useAccessCode.ts` | CREAR | Persistencia de código validado en localStorage |
| `src/hooks/useMatches.ts` | CREAR | Fetch de partidos reales con caché SWR |
| `src/app/api/matches/route.ts` | CREAR | Proxy football-data.org con caché 5min |
| `src/app/api/ai-chat/route.ts` | CREAR | Validación de código + streaming Claude |
| `src/app/api/validate-code/route.ts` | CREAR | Endpoint de validación de código |
| `src/lib/footballApi.ts` | CREAR | Tipos y helpers para football-data.org |
| `src/lib/systemPrompt.ts` | CREAR | System prompt con contexto del Mundial |
| `messages/es.json` | MODIFICAR | Claves i18n para módulos nuevos |
| `messages/en.json` | MODIFICAR | Claves i18n para módulos nuevos |
| `.env.local` | CREAR | Variables de entorno locales |

---

## Task 1: Fork, clone y setup local

**Files:**
- Create: `.env.local`
- Create: `.env.local.example`

- [ ] **Paso 1: Fork en GitHub**

  En el navegador, ir a `https://github.com/kmanus88/worldcup2026` → clic en **Fork** → seleccionar cuenta `RayoSom` → repo queda en `https://github.com/RayoSom/worldcup2026`

- [ ] **Paso 2: Clonar localmente**

  ```bash
  cd "C:/Users/COMFICA/OneDrive - COMFICA SOLUCIONES INTEGRALES S.L. SUCURSAL COL/Documents/Claude/Projects"
  git clone https://github.com/RayoSom/worldcup2026.git worldcup2026
  cd worldcup2026
  ```

- [ ] **Paso 3: Instalar dependencias existentes**

  ```bash
  npm install
  ```
  
  Esperado: instalación sin errores. Si hay error de versión de Node, usar Node >= 20.

- [ ] **Paso 4: Verificar que la app existente arranca**

  ```bash
  npm run dev
  ```
  
  Abrir `http://localhost:3000` — debe mostrar el simulador de torneo existente.

- [ ] **Paso 5: Instalar dependencias nuevas**

  ```bash
  npm install ai @ai-sdk/anthropic
  ```

- [ ] **Paso 6: Verificar framework de tests**

  ```bash
  cat package.json | grep -E "jest|vitest|test"
  ```
  
  Si usa **vitest**: `npm run test` para verificar que los tests existentes pasan.  
  Si usa **jest**: `npm test` para lo mismo.  
  Anotar el comando de test — se usa en todas las tareas siguientes.

- [ ] **Paso 7: Crear `.env.local`**

  ```env
  # IA
  ANTHROPIC_API_KEY=sk-ant-REEMPLAZAR
  ACCESS_CODE=worldcup2026-acceso

  # Resultados reales (registrar en https://www.football-data.org/client/register)
  FOOTBALL_DATA_API_KEY=REEMPLAZAR

  # Feature flags
  NEXT_PUBLIC_TORNEO_ENABLED=true
  NEXT_PUBLIC_PARTIDO_ENABLED=true
  NEXT_PUBLIC_PREDICTOR_ENABLED=true
  NEXT_PUBLIC_PREDICTOR_PANEL_ENABLED=true
  ```

- [ ] **Paso 8: Crear `.env.local.example`** (para commit)

  ```env
  ANTHROPIC_API_KEY=sk-ant-...
  ACCESS_CODE=tu-codigo-secreto
  FOOTBALL_DATA_API_KEY=...
  NEXT_PUBLIC_TORNEO_ENABLED=true
  NEXT_PUBLIC_PARTIDO_ENABLED=true
  NEXT_PUBLIC_PREDICTOR_ENABLED=true
  NEXT_PUBLIC_PREDICTOR_PANEL_ENABLED=true
  ```

- [ ] **Paso 9: Verificar .gitignore incluye .env.local**

  ```bash
  grep ".env.local" .gitignore
  ```
  
  Si no aparece, añadir la línea `.env.local` al `.gitignore`.

- [ ] **Paso 10: Commit**

  ```bash
  git add .env.local.example .gitignore
  git commit -m "chore: add env template and new dependencies"
  ```

---

## Task 2: Config de módulos y tema visual Colombia Premium

**Files:**
- Create: `src/config/modules.ts`
- Modify: `src/styles/globals.css` (o el archivo de estilos globales del proyecto)

- [ ] **Paso 1: Localizar el archivo de estilos globales**

  ```bash
  find src -name "globals.css" -o -name "global.css" | head -5
  ```

- [ ] **Paso 2: Escribir test para modules.ts**

  Crear `src/config/__tests__/modules.test.ts`:

  ```typescript
  import { modules } from '../modules'

  describe('modules config', () => {
    it('torneo habilitado por defecto', () => {
      expect(modules.torneo.enabled).toBe(true)
    })

    it('partido habilitado por defecto', () => {
      expect(modules.partido.enabled).toBe(true)
    })

    it('predictor habilitado por defecto', () => {
      expect(modules.predictor.enabled).toBe(true)
      expect(modules.predictor.panelEnabled).toBe(true)
    })
  })
  ```

- [ ] **Paso 3: Ejecutar test — debe fallar**

  ```bash
  npm test src/config/__tests__/modules.test.ts
  ```
  
  Esperado: error "Cannot find module '../modules'"

- [ ] **Paso 4: Crear `src/config/modules.ts`**

  ```typescript
  export const modules = {
    torneo: {
      enabled: process.env.NEXT_PUBLIC_TORNEO_ENABLED !== 'false',
    },
    partido: {
      enabled: process.env.NEXT_PUBLIC_PARTIDO_ENABLED !== 'false',
    },
    predictor: {
      enabled: process.env.NEXT_PUBLIC_PREDICTOR_ENABLED !== 'false',
      panelEnabled: process.env.NEXT_PUBLIC_PREDICTOR_PANEL_ENABLED !== 'false',
    },
  } as const

  export type ModuleKey = keyof typeof modules
  ```

- [ ] **Paso 5: Ejecutar test — debe pasar**

  ```bash
  npm test src/config/__tests__/modules.test.ts
  ```
  
  Esperado: 3 tests PASS

- [ ] **Paso 6: Añadir tokens CSS de tema Colombia Premium**

  En el archivo `globals.css` del proyecto, añadir/reemplazar las variables CSS en `:root`:

  ```css
  :root {
    /* Backgrounds */
    --bg-base: #080810;
    --bg-surface: #0d0d1f;
    --bg-surface-2: #1a1a2e;

    /* Colombia flag */
    --col-yellow: #FCD116;
    --col-blue: #003893;
    --col-red: #CE1126;

    /* IA module */
    --ia-purple: #a855f7;
    --ia-purple-dark: #6d28d9;

    /* Text */
    --text-primary: #f1f5f9;
    --text-muted: #6b7280;
    --text-subtle: #374151;

    /* Gradients */
    --gradient-colombia: linear-gradient(90deg, #FCD116, #003893, #CE1126);
    --gradient-colombia-logo: linear-gradient(90deg, #FCD116 0%, #f59e0b 50%, #CE1126 100%);
    --gradient-ia: linear-gradient(90deg, #a855f7, #e879f9);
  }
  ```

- [ ] **Paso 7: Verificar la app sigue corriendo**

  ```bash
  npm run dev
  ```
  
  Abrir `http://localhost:3000` — no debe haber errores en consola.

- [ ] **Paso 8: Commit**

  ```bash
  git add src/config/ src/styles/
  git commit -m "feat: add module config and Colombia Premium theme tokens"
  ```

---

## Task 3: Rediseño del Navbar con módulos condicionales

**Files:**
- Modify: `src/components/layout/Navbar.tsx` (o el componente de navegación existente)

- [ ] **Paso 1: Localizar el componente de navegación existente**

  ```bash
  find src/components -name "Nav*" -o -name "Header*" -o -name "nav*" | head -10
  ```

- [ ] **Paso 2: Leer el componente existente**

  ```bash
  cat <archivo encontrado en paso 1>
  ```
  
  Entender cómo maneja la navegación actual (links, i18n, active state).

- [ ] **Paso 3: Reemplazar/adaptar el navbar con el nuevo diseño**

  El nuevo navbar debe:
  1. Mostrar logo `WC2026 ⚽` con gradiente Colombia
  2. Mostrar tabs condicionales según `modules.X.enabled`
  3. Resaltar el módulo activo con gradiente Colombia (o morado para Predictor IA)
  4. Mantener el selector de idioma existente

  ```typescript
  // src/components/layout/Navbar.tsx
  'use client'

  import Link from 'next/link'
  import { usePathname } from 'next/navigation'
  import { useTranslations } from 'next-intl'
  import { modules } from '@/config/modules'

  export function Navbar({ locale }: { locale: string }) {
    const pathname = usePathname()
    const t = useTranslations('nav')

    const isActive = (path: string) => pathname.includes(path)

    return (
      <nav className="sticky top-0 z-50 border-b border-white/5"
           style={{ background: 'var(--bg-surface)' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
          {/* Logo */}
          <Link href={`/${locale}/torneo`}
                className="font-bold text-sm tracking-wide"
                style={{ background: 'var(--gradient-colombia)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            WC2026 ⚽
          </Link>

          {/* Módulos */}
          <div className="flex items-center gap-1 ml-2">
            {modules.torneo.enabled && (
              <NavLink href={`/${locale}/torneo`} active={isActive('/torneo')} variant="colombia">
                {t('torneo')}
              </NavLink>
            )}
            {modules.partido.enabled && (
              <NavLink href={`/${locale}/partido`} active={isActive('/partido')} variant="colombia">
                {t('partido')}
              </NavLink>
            )}
            {modules.predictor.enabled && (
              <NavLink href={`/${locale}/predictor`} active={isActive('/predictor')} variant="ia">
                {t('predictor')}
              </NavLink>
            )}
          </div>

          {/* Selector de idioma — mantener el existente */}
          <div className="ml-auto">
            {/* Pegar aquí el selector de idioma que ya existe */}
          </div>
        </div>
      </nav>
    )
  }

  function NavLink({
    href, active, variant, children
  }: {
    href: string
    active: boolean
    variant: 'colombia' | 'ia'
    children: React.ReactNode
  }) {
    const activeStyle = variant === 'ia'
      ? { background: 'var(--gradient-ia)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
      : { background: 'var(--gradient-colombia-logo)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }

    return (
      <Link href={href}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${active ? '' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            style={active ? activeStyle : {}}>
        {children}
      </Link>
    )
  }
  ```

- [ ] **Paso 4: Añadir claves i18n para el navbar**

  En `messages/es.json`, añadir dentro del objeto existente:
  ```json
  "nav": {
    "torneo": "Torneo",
    "partido": "Partido",
    "predictor": "Predictor IA"
  }
  ```

  En `messages/en.json`:
  ```json
  "nav": {
    "torneo": "Tournament",
    "partido": "Match",
    "predictor": "AI Predictor"
  }
  ```

- [ ] **Paso 5: Verificar visualmente**

  ```bash
  npm run dev
  ```
  
  Abrir `http://localhost:3000` — el navbar debe mostrar los 3 módulos. El activo debe tener gradiente Colombia.

- [ ] **Paso 6: Commit**

  ```bash
  git add src/components/ messages/
  git commit -m "feat: redesign navbar with Colombia Premium theme and conditional modules"
  ```

---

## Task 4: Script de generación de narrativas de equipos

**Files:**
- Create: `scripts/generate-narratives.ts`
- Create: `src/data/team-narratives.json`

- [ ] **Paso 1: Identificar los equipos existentes en el repo**

  ```bash
  cat src/data/teams.json | head -50
  ```
  
  Entender la estructura: cómo están identificados los equipos (código ISO3 o similar).

- [ ] **Paso 2: Crear el script de generación**

  Crear `scripts/generate-narratives.ts`:

  ```typescript
  import Anthropic from '@anthropic-ai/sdk'
  import fs from 'fs'
  import path from 'path'

  // Cargar equipos del repo existente
  const teamsRaw = JSON.parse(fs.readFileSync('src/data/teams.json', 'utf-8'))

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  interface TeamNarrative {
    name: string
    nameEs: string
    elo: number
    style: string
    strengths: string[]
    weaknesses: string[]
    keyPlayers: string[]
    analysis: string
    analysisEs: string
  }

  async function generateNarrative(team: { code: string; name: string; elo: number }): Promise<TeamNarrative> {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Generate a concise World Cup 2026 team analysis for ${team.name} (ELO: ${team.elo}).

Return ONLY valid JSON with this exact structure:
{
  "name": "${team.name}",
  "nameEs": "<nombre en español>",
  "elo": ${team.elo},
  "style": "<playing style, 1 sentence in English>",
  "styleEs": "<estilo de juego, 1 frase en español>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "strengthsEs": ["<fortaleza 1>", "<fortaleza 2>", "<fortaleza 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "weaknessesEs": ["<debilidad 1>", "<debilidad 2>"],
  "keyPlayers": ["<player 1>", "<player 2>", "<player 3>"],
  "analysis": "<2-sentence tournament outlook in English>",
  "analysisEs": "<perspectiva del torneo en 2 frases en español>"
}`
      }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')
    return JSON.parse(content.text)
  }

  async function main() {
    const narratives: Record<string, TeamNarrative> = {}
    const teams = Array.isArray(teamsRaw) ? teamsRaw : Object.values(teamsRaw)

    console.log(`Generating narratives for ${teams.length} teams...`)

    for (const team of teams) {
      try {
        console.log(`  → ${team.name || team.code}`)
        narratives[team.code] = await generateNarrative(team)
        // Pausa para respetar rate limits
        await new Promise(r => setTimeout(r, 300))
      } catch (err) {
        console.error(`  ✗ Error with ${team.code}:`, err)
      }
    }

    const outputPath = path.join('src/data/team-narratives.json')
    fs.writeFileSync(outputPath, JSON.stringify(narratives, null, 2))
    console.log(`\n✅ Saved to ${outputPath}`)
  }

  main()
  ```

- [ ] **Paso 3: Añadir script al package.json**

  En `package.json`, dentro de `"scripts"`:
  ```json
  "generate:narratives": "tsx scripts/generate-narratives.ts"
  ```

- [ ] **Paso 4: Instalar tsx si no existe**

  ```bash
  npm install -D tsx
  ```

- [ ] **Paso 5: Ejecutar el script (requiere ANTHROPIC_API_KEY válida)**

  ```bash
  npm run generate:narratives
  ```
  
  Esperado: archivo `src/data/team-narratives.json` creado con los 48 equipos. Costo: ~$0.10.

- [ ] **Paso 6: Verificar el JSON generado**

  ```bash
  cat src/data/team-narratives.json | python -m json.tool > /dev/null && echo "JSON válido"
  ```

- [ ] **Paso 7: Commit**

  ```bash
  git add src/data/team-narratives.json scripts/generate-narratives.ts package.json
  git commit -m "feat: add team narratives generation script and pre-generated data"
  ```

---

## Task 5: Módulo Partido — Selector y simulación

**Files:**
- Create: `src/app/[locale]/partido/page.tsx`
- Create: `src/components/partido/TeamSelector.tsx`
- Create: `src/components/partido/MatchResult.tsx`
- Create: `src/components/partido/NarrativeCard.tsx`

- [ ] **Paso 1: Identificar cómo se usa el motor ELO+Poisson existente**

  ```bash
  find src/lib -name "*.ts" | xargs grep -l "simulate\|runSimulation\|ELO\|poisson" | head -5
  cat src/hooks/useSimulation* 2>/dev/null || find src/hooks -name "*.ts" | head -5
  ```
  
  Entender la interfaz del motor: qué función llamar, qué parámetros recibe, qué devuelve.

- [ ] **Paso 2: Escribir test para TeamSelector**

  Crear `src/components/partido/__tests__/TeamSelector.test.tsx`:

  ```typescript
  import { render, screen, fireEvent } from '@testing-library/react'
  import { TeamSelector } from '../TeamSelector'

  const mockTeams = [
    { code: 'BRA', name: 'Brazil', elo: 2150, flag: 'br' },
    { code: 'ARG', name: 'Argentina', elo: 2081, flag: 'ar' },
  ]

  describe('TeamSelector', () => {
    it('renders both team dropdowns', () => {
      render(<TeamSelector teams={mockTeams} onSelect={jest.fn()} />)
      expect(screen.getAllByRole('combobox')).toHaveLength(2)
    })

    it('calls onSelect when both teams are chosen', () => {
      const onSelect = jest.fn()
      render(<TeamSelector teams={mockTeams} onSelect={onSelect} />)
      // seleccionar equipo A
      fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'BRA' } })
      // seleccionar equipo B
      fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'ARG' } })
      // clic en Simular
      fireEvent.click(screen.getByText(/simular/i))
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'BRA' }),
        expect.objectContaining({ code: 'ARG' })
      )
    })

    it('disables Simular button when same team selected', () => {
      render(<TeamSelector teams={mockTeams} onSelect={jest.fn()} />)
      fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'BRA' } })
      fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'BRA' } })
      expect(screen.getByText(/simular/i).closest('button')).toBeDisabled()
    })
  })
  ```

- [ ] **Paso 3: Ejecutar test — debe fallar**

  ```bash
  npm test src/components/partido/__tests__/TeamSelector.test.tsx
  ```

- [ ] **Paso 4: Crear `TeamSelector.tsx`**

  ```typescript
  // src/components/partido/TeamSelector.tsx
  'use client'

  import { useState } from 'react'

  interface Team {
    code: string
    name: string
    elo: number
    flag: string
  }

  interface Props {
    teams: Team[]
    onSelect: (teamA: Team, teamB: Team) => void
    disabled?: boolean
  }

  export function TeamSelector({ teams, onSelect, disabled }: Props) {
    const [teamACode, setTeamACode] = useState('')
    const [teamBCode, setTeamBCode] = useState('')

    const teamA = teams.find(t => t.code === teamACode)
    const teamB = teams.find(t => t.code === teamBCode)
    const canSimulate = teamA && teamB && teamACode !== teamBCode

    return (
      <div className="rounded-lg p-6" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          PASO 1 — ELIGE LOS EQUIPOS
        </p>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* Equipo A */}
          <TeamDropdown
            teams={teams}
            value={teamACode}
            onChange={setTeamACode}
            excludeCode={teamBCode}
            label="Equipo A"
          />

          <span className="text-center text-sm font-bold" style={{ color: 'var(--text-muted)' }}>VS</span>

          {/* Equipo B */}
          <TeamDropdown
            teams={teams}
            value={teamBCode}
            onChange={setTeamBCode}
            excludeCode={teamACode}
            label="Equipo B"
          />
        </div>

        {/* ELO display */}
        {(teamA || teamB) && (
          <div className="grid grid-cols-2 gap-4 mt-4 text-center">
            <div>
              {teamA && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ELO: <span style={{ color: 'var(--col-yellow)' }}>{teamA.elo}</span></p>}
            </div>
            <div>
              {teamB && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ELO: <span style={{ color: 'var(--col-blue)' }}>{teamB.elo}</span></p>}
            </div>
          </div>
        )}

        {/* Botón simular */}
        <button
          onClick={() => canSimulate && onSelect(teamA!, teamB!)}
          disabled={!canSimulate || disabled}
          className="mt-5 w-full py-2.5 rounded font-bold text-sm transition-opacity disabled:opacity-30"
          style={{ background: 'var(--gradient-colombia)', color: '#000' }}
        >
          SIMULAR
        </button>
      </div>
    )
  }

  function TeamDropdown({ teams, value, onChange, excludeCode, label }: {
    teams: { code: string; name: string; flag: string }[]
    value: string
    onChange: (v: string) => void
    excludeCode: string
    label: string
  }) {
    return (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={label}
        className="w-full rounded px-3 py-2 text-sm"
        style={{ background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <option value="">Selecciona equipo...</option>
        {teams
          .filter(t => t.code !== excludeCode)
          .map(t => (
            <option key={t.code} value={t.code}>{t.name}</option>
          ))}
      </select>
    )
  }
  ```

- [ ] **Paso 5: Ejecutar test TeamSelector — debe pasar**

  ```bash
  npm test src/components/partido/__tests__/TeamSelector.test.tsx
  ```

- [ ] **Paso 6: Escribir test para MatchResult**

  Crear `src/components/partido/__tests__/MatchResult.test.tsx`:

  ```typescript
  import { render, screen } from '@testing-library/react'
  import { MatchResult } from '../MatchResult'

  const mockResult = {
    teamAWin: 0.52,
    draw: 0.22,
    teamBWin: 0.26,
    topScores: [
      { score: '1-0', probability: 0.124 },
      { score: '2-1', probability: 0.089 },
      { score: '1-1', probability: 0.082 },
      { score: '2-0', probability: 0.071 },
      { score: '0-1', probability: 0.065 },
    ],
    teamAName: 'Brasil',
    teamBName: 'Argentina',
  }

  describe('MatchResult', () => {
    it('muestra las tres probabilidades', () => {
      render(<MatchResult result={mockResult} />)
      expect(screen.getByText('52%')).toBeInTheDocument()
      expect(screen.getByText('22%')).toBeInTheDocument()
      expect(screen.getByText('26%')).toBeInTheDocument()
    })

    it('muestra el marcador más probable', () => {
      render(<MatchResult result={mockResult} />)
      expect(screen.getByText(/1-0/)).toBeInTheDocument()
      expect(screen.getByText(/12\.4%/)).toBeInTheDocument()
    })

    it('muestra top 5 marcadores', () => {
      render(<MatchResult result={mockResult} />)
      expect(screen.getAllByRole('listitem')).toHaveLength(5)
    })
  })
  ```

- [ ] **Paso 7: Crear `MatchResult.tsx`**

  ```typescript
  // src/components/partido/MatchResult.tsx

  interface Score {
    score: string
    probability: number
  }

  interface Result {
    teamAWin: number
    draw: number
    teamBWin: number
    topScores: Score[]
    teamAName: string
    teamBName: string
  }

  export function MatchResult({ result }: { result: Result }) {
    const { teamAWin, draw, teamBWin, topScores, teamAName, teamBName } = result
    const topScore = topScores[0]

    return (
      <div className="rounded-lg p-6 mt-4" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          PASO 2 — RESULTADO DE 10.000 SIMULACIONES
        </p>

        {/* Barras de probabilidad */}
        <div className="grid grid-cols-3 gap-2 text-center mb-4">
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--col-yellow)' }}>{Math.round(teamAWin * 100)}%</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{teamAName} gana</p>
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-muted)' }}>{Math.round(draw * 100)}%</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Empate</p>
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--col-blue)' }}>{Math.round(teamBWin * 100)}%</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{teamBName} gana</p>
          </div>
        </div>

        {/* Barra visual */}
        <div className="flex rounded overflow-hidden h-2 mb-5">
          <div style={{ width: `${teamAWin * 100}%`, background: 'var(--col-yellow)' }} />
          <div style={{ width: `${draw * 100}%`, background: 'var(--text-subtle)' }} />
          <div style={{ width: `${teamBWin * 100}%`, background: 'var(--col-blue)' }} />
        </div>

        {/* Marcador más probable */}
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>MARCADOR MÁS PROBABLE</p>
        <p className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          {topScore.score}
          <span className="text-sm font-normal ml-2" style={{ color: 'var(--text-muted)' }}>
            ({(topScore.probability * 100).toFixed(1)}%)
          </span>
        </p>

        {/* Top 5 marcadores */}
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>TOP 5 MARCADORES</p>
        <ul className="flex flex-wrap gap-2">
          {topScores.map(s => (
            <li key={s.score}
                className="px-3 py-1 rounded text-xs"
                style={{ background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {s.score} <span style={{ color: 'var(--text-muted)' }}>{(s.probability * 100).toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  ```

- [ ] **Paso 8: Ejecutar tests — deben pasar**

  ```bash
  npm test src/components/partido/
  ```

- [ ] **Paso 9: Crear `NarrativeCard.tsx`**

  ```typescript
  // src/components/partido/NarrativeCard.tsx
  import narrativesData from '@/data/team-narratives.json'

  interface Props {
    teamCode: string
    locale: string
  }

  export function NarrativeCard({ teamCode, locale }: Props) {
    const data = (narrativesData as Record<string, any>)[teamCode]
    if (!data) return null

    const isEs = locale === 'es'
    const style = isEs ? data.styleEs : data.style
    const strengths = isEs ? data.strengthsEs : data.strengths
    const analysis = isEs ? data.analysisEs : data.analysis

    return (
      <div className="rounded-lg p-5" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2 mb-3">
          <img src={`/flags/${teamCode.toLowerCase()}.svg`} alt={data.name} className="w-6 h-4 object-cover rounded-sm" />
          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{isEs ? data.nameEs : data.name}</p>
          <span className="ml-auto text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)' }}>
            ELO {data.elo}
          </span>
        </div>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{style}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {strengths.map((s: string) => (
            <span key={s} className="px-2 py-0.5 rounded text-xs"
                  style={{ background: 'rgba(252,209,22,0.1)', color: 'var(--col-yellow)', border: '1px solid rgba(252,209,22,0.2)' }}>
              {s}
            </span>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{analysis}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {data.keyPlayers.map((p: string) => (
            <span key={p} className="text-xs px-2 py-0.5 rounded"
                  style={{ background: 'var(--bg-surface-2)', color: 'var(--text-primary)' }}>
              {p}
            </span>
          ))}
        </div>
      </div>
    )
  }
  ```

- [ ] **Paso 10: Crear página `/partido`**

  Crear `src/app/[locale]/partido/page.tsx`:

  ```typescript
  'use client'

  import { useState } from 'react'
  import { useParams } from 'next/navigation'
  import { TeamSelector } from '@/components/partido/TeamSelector'
  import { MatchResult } from '@/components/partido/MatchResult'
  import { NarrativeCard } from '@/components/partido/NarrativeCard'
  import teamsData from '@/data/teams.json'
  // Importar la función de simulación del motor existente
  // Ajustar este import según lo encontrado en Paso 1
  import { simulateMatch } from '@/lib/simulation'

  export default function PartidoPage() {
    const { locale } = useParams<{ locale: string }>()
    const [result, setResult] = useState<any>(null)
    const [selectedTeams, setSelectedTeams] = useState<{ a: any; b: any } | null>(null)
    const [simulating, setSimulating] = useState(false)

    const teams = Array.isArray(teamsData) ? teamsData : Object.values(teamsData)

    async function handleSimulate(teamA: any, teamB: any) {
      setSimulating(true)
      setSelectedTeams({ a: teamA, b: teamB })
      // El motor existente es síncrono en browser — ejecutar en setTimeout para no bloquear UI
      await new Promise(r => setTimeout(r, 10))
      const simResult = simulateMatch(teamA, teamB, 10000)
      setResult(simResult)
      setSimulating(false)
    }

    return (
      <main className="max-w-2xl mx-auto px-4 py-8" style={{ color: 'var(--text-primary)' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ background: 'var(--gradient-colombia)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Simulador de Partido
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Elige dos selecciones y simula el resultado con nuestro modelo ELO + Poisson.
        </p>

        <TeamSelector teams={teams} onSelect={handleSimulate} disabled={simulating} />

        {simulating && (
          <div className="mt-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Simulando 10.000 partidos...
          </div>
        )}

        {result && selectedTeams && (
          <>
            <MatchResult result={result} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <NarrativeCard teamCode={selectedTeams.a.code} locale={locale} />
              <NarrativeCard teamCode={selectedTeams.b.code} locale={locale} />
            </div>
          </>
        )}
      </main>
    )
  }
  ```

- [ ] **Paso 11: Adaptar `simulateMatch` al motor existente**

  > ⚠️ El import `simulateMatch` de `@/lib/simulation` debe ajustarse al nombre real de la función del motor existente (encontrado en Paso 1). Si el motor solo simula torneos completos, crear un wrapper en `src/lib/simulation.ts`:

  ```typescript
  // src/lib/simulation.ts
  // Wrapper que usa el motor ELO+Poisson existente para un partido individual
  import { calculateWinProbability } from './elo'   // ajustar imports reales
  import { generateGoals } from './goals'            // ajustar imports reales

  interface SimResult {
    teamAWin: number
    draw: number
    teamBWin: number
    topScores: { score: string; probability: number }[]
    teamAName: string
    teamBName: string
  }

  export function simulateMatch(teamA: { code: string; name: string; elo: number }, teamB: { code: string; name: string; elo: number }, n = 10000): SimResult {
    const scoreCounts: Record<string, number> = {}
    let aWins = 0, draws = 0, bWins = 0

    for (let i = 0; i < n; i++) {
      const goalsA = generateGoals(teamA.elo, teamB.elo)
      const goalsB = generateGoals(teamB.elo, teamA.elo)
      const key = `${goalsA}-${goalsB}`
      scoreCounts[key] = (scoreCounts[key] ?? 0) + 1
      if (goalsA > goalsB) aWins++
      else if (goalsA === goalsB) draws++
      else bWins++
    }

    const topScores = Object.entries(scoreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([score, count]) => ({ score, probability: count / n }))

    return {
      teamAWin: aWins / n,
      draw: draws / n,
      teamBWin: bWins / n,
      topScores,
      teamAName: teamA.name,
      teamBName: teamB.name,
    }
  }
  ```

- [ ] **Paso 12: Verificar visualmente**

  ```bash
  npm run dev
  ```
  
  Ir a `http://localhost:3000/es/partido` — el simulador debe funcionar: elegir Brasil vs Argentina → ver probabilidades y marcadores.

- [ ] **Paso 13: Commit**

  ```bash
  git add src/app/[locale]/partido/ src/components/partido/ src/lib/simulation.ts
  git commit -m "feat: add match simulator with ELO+Poisson and team narratives"
  ```

---

## Task 6: API proxy de resultados reales (football-data.org)

**Files:**
- Create: `src/lib/footballApi.ts`
- Create: `src/app/api/matches/route.ts`
- Create: `src/hooks/useMatches.ts`

- [ ] **Paso 1: Registrar en football-data.org**

  Ir a `https://www.football-data.org/client/register` → registrar con email → obtener API key gratuita → añadir a `.env.local` como `FOOTBALL_DATA_API_KEY`.

- [ ] **Paso 2: Escribir test para footballApi.ts**

  Crear `src/lib/__tests__/footballApi.test.ts`:

  ```typescript
  import { parseMatchStatus, isMatchPlayed, isMatchLive } from '../footballApi'

  describe('footballApi helpers', () => {
    it('reconoce partido terminado', () => {
      expect(isMatchPlayed('FINISHED')).toBe(true)
      expect(isMatchPlayed('SCHEDULED')).toBe(false)
    })

    it('reconoce partido en vivo', () => {
      expect(isMatchLive('IN_PLAY')).toBe(true)
      expect(isMatchLive('PAUSED')).toBe(true)
      expect(isMatchLive('FINISHED')).toBe(false)
    })

    it('parsea status correctamente', () => {
      expect(parseMatchStatus('FINISHED')).toBe('finished')
      expect(parseMatchStatus('SCHEDULED')).toBe('scheduled')
      expect(parseMatchStatus('IN_PLAY')).toBe('live')
    })
  })
  ```

- [ ] **Paso 3: Ejecutar test — debe fallar**

  ```bash
  npm test src/lib/__tests__/footballApi.test.ts
  ```

- [ ] **Paso 4: Crear `src/lib/footballApi.ts`**

  ```typescript
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
  ```

- [ ] **Paso 5: Ejecutar test — debe pasar**

  ```bash
  npm test src/lib/__tests__/footballApi.test.ts
  ```

- [ ] **Paso 6: Crear API route `/api/matches`**

  Crear `src/app/api/matches/route.ts`:

  ```typescript
  import { NextResponse } from 'next/server'
  import { parseMatch } from '@/lib/footballApi'

  // ID de la Copa del Mundo 2026 en football-data.org (verificar en su documentación)
  const WC2026_COMPETITION_ID = 'WC'

  export async function GET() {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${WC2026_COMPETITION_ID}/matches`,
      {
        headers: { 'X-Auth-Token': apiKey },
        next: { revalidate: 300 }, // caché 5 minutos
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Football data API error', status: res.status }, { status: 502 })
    }

    const data = await res.json()
    const matches = (data.matches ?? []).map(parseMatch)
    return NextResponse.json({ matches })
  }
  ```

- [ ] **Paso 7: Crear hook `useMatches.ts`**

  Crear `src/hooks/useMatches.ts`:

  ```typescript
  'use client'

  import { useEffect, useState } from 'react'
  import type { ParsedMatch } from '@/lib/footballApi'

  interface MatchesState {
    matches: ParsedMatch[]
    loading: boolean
    error: string | null
    liveCount: number
  }

  export function useMatches(): MatchesState {
    const [state, setState] = useState<MatchesState>({
      matches: [],
      loading: true,
      error: null,
      liveCount: 0,
    })

    useEffect(() => {
      async function load() {
        try {
          const res = await fetch('/api/matches')
          if (!res.ok) throw new Error('Failed to fetch matches')
          const data = await res.json()
          const liveCount = data.matches.filter((m: ParsedMatch) => m.matchStatus === 'live').length
          setState({ matches: data.matches, loading: false, error: null, liveCount })
        } catch (err) {
          setState(s => ({ ...s, loading: false, error: 'No se pudieron cargar los partidos' }))
        }
      }

      load()
      // Recargar cada 5 minutos
      const interval = setInterval(load, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }, [])

    return state
  }
  ```

- [ ] **Paso 8: Verificar la API route**

  Con el servidor corriendo:
  ```bash
  curl http://localhost:3000/api/matches
  ```
  
  Esperado: JSON con `{ matches: [...] }`. Si el torneo aún no empezó, devolverá partidos con status `SCHEDULED`.

- [ ] **Paso 9: Integrar badge de partidos en vivo en el banner del módulo Torneo**

  En la página principal del torneo (encontrar `src/app/[locale]/torneo/page.tsx`), añadir al inicio:

  ```typescript
  import { useMatches } from '@/hooks/useMatches'

  // Dentro del componente:
  const { liveCount } = useMatches()

  // En el JSX, antes del contenido del torneo:
  {liveCount > 0 && (
    <div className="w-full py-2 px-4 text-center text-xs font-bold mb-4 rounded"
         style={{ background: 'rgba(206,17,38,0.15)', color: 'var(--col-red)', border: '1px solid rgba(206,17,38,0.3)' }}>
      🔴 {liveCount} PARTIDO{liveCount > 1 ? 'S' : ''} EN VIVO AHORA
    </div>
  )}
  ```

- [ ] **Paso 10: Commit**

  ```bash
  git add src/lib/footballApi.ts src/app/api/matches/ src/hooks/useMatches.ts src/app/[locale]/torneo/
  git commit -m "feat: add football-data.org proxy and live match banner"
  ```

---

## Task 7: Validación de código de acceso y API de chat IA

**Files:**
- Create: `src/app/api/validate-code/route.ts`
- Create: `src/app/api/ai-chat/route.ts`
- Create: `src/lib/systemPrompt.ts`
- Create: `src/hooks/useAccessCode.ts`

- [ ] **Paso 1: Escribir tests para la validación de código**

  Crear `src/app/api/validate-code/__tests__/route.test.ts`:

  ```typescript
  // Test básico de la lógica de validación (sin montar el servidor)
  import { isValidCode } from '../logic'

  describe('isValidCode', () => {
    it('acepta código correcto', () => {
      expect(isValidCode('mi-codigo', 'mi-codigo')).toBe(true)
    })

    it('rechaza código incorrecto', () => {
      expect(isValidCode('otro', 'mi-codigo')).toBe(false)
    })

    it('rechaza código vacío', () => {
      expect(isValidCode('', 'mi-codigo')).toBe(false)
    })

    it('es case-insensitive', () => {
      expect(isValidCode('MI-CODIGO', 'mi-codigo')).toBe(true)
    })
  })
  ```

- [ ] **Paso 2: Ejecutar test — debe fallar**

  ```bash
  npm test src/app/api/validate-code/__tests__/route.test.ts
  ```

- [ ] **Paso 3: Crear `src/app/api/validate-code/logic.ts`**

  ```typescript
  export function isValidCode(input: string, secret: string): boolean {
    if (!input || !secret) return false
    return input.trim().toLowerCase() === secret.trim().toLowerCase()
  }
  ```

- [ ] **Paso 4: Crear `src/app/api/validate-code/route.ts`**

  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  import { isValidCode } from './logic'

  export async function POST(req: NextRequest) {
    const { code } = await req.json()
    const secret = process.env.ACCESS_CODE ?? ''

    if (isValidCode(code, secret)) {
      return NextResponse.json({ valid: true })
    }
    return NextResponse.json({ valid: false }, { status: 401 })
  }
  ```

- [ ] **Paso 5: Ejecutar test — debe pasar**

  ```bash
  npm test src/app/api/validate-code/__tests__/route.test.ts
  ```

- [ ] **Paso 6: Crear `src/lib/systemPrompt.ts`**

  ```typescript
  import teamsData from '@/data/teams.json'
  import narrativesData from '@/data/team-narratives.json'

  export function buildSystemPrompt(context?: {
    teamA?: { code: string; name: string; elo: number }
    teamB?: { code: string; name: string; elo: number }
    matchResult?: { teamAWin: number; draw: number; teamBWin: number }
  }): string {
    const teams = Array.isArray(teamsData) ? teamsData : Object.values(teamsData)
    const eloList = teams.map((t: any) => `${t.name} (ELO: ${t.elo})`).join(', ')

    let base = `Eres un experto analista de fútbol especializado en el Mundial FIFA 2026.
El torneo se juega en Estados Unidos, México y Canadá. Hay 48 selecciones en 12 grupos.
Los equipos con sus ratings ELO actuales son: ${eloList}.
Responde de forma concisa, técnica y apasionante. Mezcla inglés y español según el idioma del usuario.
Fecha actual: ${new Date().toLocaleDateString('es-CO', { timeZone: 'America/Bogota' })}.`

    if (context?.teamA && context?.teamB) {
      const narA = (narrativesData as any)[context.teamA.code]
      const narB = (narrativesData as any)[context.teamB.code]
      base += `\n\nCONTEXTO DEL PARTIDO SIMULADO:
Equipo A: ${context.teamA.name} (ELO: ${context.teamA.elo})${narA ? ` — ${narA.style}` : ''}
Equipo B: ${context.teamB.name} (ELO: ${context.teamB.elo})${narB ? ` — ${narB.style}` : ''}`

      if (context.matchResult) {
        const { teamAWin, draw, teamBWin } = context.matchResult
        base += `\nResultado simulado: ${Math.round(teamAWin * 100)}% ${context.teamA.name} / ${Math.round(draw * 100)}% empate / ${Math.round(teamBWin * 100)}% ${context.teamB.name}`
      }
    }

    return base
  }
  ```

- [ ] **Paso 7: Crear `src/app/api/ai-chat/route.ts`**

  ```typescript
  import { streamText } from 'ai'
  import { createAnthropic } from '@ai-sdk/anthropic'
  import { NextRequest } from 'next/server'
  import { isValidCode } from '../validate-code/logic'
  import { buildSystemPrompt } from '@/lib/systemPrompt'

  export const runtime = 'edge'

  export async function POST(req: NextRequest) {
    const accessCode = req.headers.get('x-access-code') ?? ''
    const secret = process.env.ACCESS_CODE ?? ''

    if (!isValidCode(accessCode, secret)) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { messages, context } = await req.json()
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    const result = streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: buildSystemPrompt(context),
      messages,
      maxTokens: 600,
    })

    return result.toDataStreamResponse()
  }
  ```

- [ ] **Paso 8: Crear `src/hooks/useAccessCode.ts`**

  ```typescript
  'use client'

  import { useState, useEffect } from 'react'

  const STORAGE_KEY = 'wc2026_access_code'

  export function useAccessCode() {
    const [code, setCode] = useState<string | null>(null)
    const [validating, setValidating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setCode(stored)
    }, [])

    const isUnlocked = code !== null

    async function unlock(input: string): Promise<boolean> {
      setValidating(true)
      setError(null)
      try {
        const res = await fetch('/api/validate-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: input }),
        })
        if (res.ok) {
          localStorage.setItem(STORAGE_KEY, input)
          setCode(input)
          setValidating(false)
          return true
        }
        setError('Código incorrecto. Intenta de nuevo.')
        setValidating(false)
        return false
      } catch {
        setError('Error de conexión.')
        setValidating(false)
        return false
      }
    }

    function lock() {
      localStorage.removeItem(STORAGE_KEY)
      setCode(null)
    }

    return { code, isUnlocked, unlock, lock, validating, error }
  }
  ```

- [ ] **Paso 9: Commit**

  ```bash
  git add src/app/api/ src/lib/systemPrompt.ts src/hooks/useAccessCode.ts
  git commit -m "feat: add code validation API and Claude streaming chat route"
  ```

---

## Task 8: Panel Predictor IA en /partido

**Files:**
- Create: `src/components/partido/PredictorPanel.tsx`
- Modify: `src/app/[locale]/partido/page.tsx`

- [ ] **Paso 1: Crear `PredictorPanel.tsx`**

  ```typescript
  // src/components/partido/PredictorPanel.tsx
  'use client'

  import { useChat } from 'ai/react'
  import { useAccessCode } from '@/hooks/useAccessCode'
  import { modules } from '@/config/modules'
  import { useState } from 'react'

  interface Props {
    teamA: { code: string; name: string; elo: number }
    teamB: { code: string; name: string; elo: number }
    matchResult: { teamAWin: number; draw: number; teamBWin: number }
  }

  export function PredictorPanel({ teamA, teamB, matchResult }: Props) {
    if (!modules.predictor.panelEnabled) return null

    const { code, isUnlocked, unlock, validating, error } = useAccessCode()
    const [codeInput, setCodeInput] = useState('')

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
      api: '/api/ai-chat',
      headers: { 'x-access-code': code ?? '' },
      body: { context: { teamA, teamB, matchResult } },
      initialMessages: [{
        id: 'welcome',
        role: 'assistant',
        content: `Analizando ${teamA.name} vs ${teamB.name}... Puedo responder preguntas sobre este partido, tácticas, jugadores clave o cualquier escenario del Mundial. ¿Qué quieres saber?`,
      }],
    })

    if (!isUnlocked) {
      return (
        <div className="mt-4 rounded-lg p-5" style={{ background: 'var(--bg-surface)', border: '1px dashed rgba(168,85,247,0.4)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: 'var(--ia-purple)' }}>🤖 PREDICTOR IA</p>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            Análisis táctico profundo con IA. Ingresa tu código de acceso para activarlo.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && unlock(codeInput)}
              placeholder="Código de acceso..."
              className="flex-1 px-3 py-1.5 rounded text-xs"
              style={{ background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1px solid rgba(168,85,247,0.3)' }}
            />
            <button
              onClick={() => unlock(codeInput)}
              disabled={validating || !codeInput}
              className="px-4 py-1.5 rounded text-xs font-bold disabled:opacity-40"
              style={{ background: 'var(--gradient-ia)', color: 'white' }}>
              {validating ? '...' : 'Activar'}
            </button>
          </div>
          {error && <p className="text-xs mt-2" style={{ color: 'var(--col-red)' }}>{error}</p>}
        </div>
      )
    }

    return (
      <div className="mt-4 rounded-lg p-5" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(168,85,247,0.3)' }}>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-bold" style={{ color: 'var(--ia-purple)' }}>🤖 PREDICTOR IA</p>
          <span className="ml-auto text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>● ACTIVO</span>
        </div>

        {/* Mensajes */}
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {messages.map(m => (
            <div key={m.id}
                 className={`text-xs rounded p-3 ${m.role === 'user' ? 'ml-8' : 'mr-8'}`}
                 style={{ background: m.role === 'user' ? 'var(--bg-surface-2)' : 'rgba(168,85,247,0.1)', color: 'var(--text-primary)' }}>
              {m.content}
            </div>
          ))}
          {isLoading && (
            <div className="text-xs rounded p-3 mr-8" style={{ background: 'rgba(168,85,247,0.1)', color: 'var(--text-muted)' }}>
              Analizando...
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Pregunta algo sobre este partido..."
            className="flex-1 px-3 py-1.5 rounded text-xs"
            style={{ background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1px solid rgba(168,85,247,0.2)' }}
          />
          <button type="submit" disabled={isLoading || !input}
                  className="px-3 py-1.5 rounded text-xs font-bold disabled:opacity-40"
                  style={{ background: 'var(--gradient-ia)', color: 'white' }}>
            ↑
          </button>
        </form>
      </div>
    )
  }
  ```

- [ ] **Paso 2: Integrar PredictorPanel en la página `/partido`**

  En `src/app/[locale]/partido/page.tsx`, añadir después de `<NarrativeCard>`:

  ```typescript
  import { PredictorPanel } from '@/components/partido/PredictorPanel'

  // En el JSX, después de las NarrativeCards:
  {result && selectedTeams && modules.predictor.panelEnabled && (
    <PredictorPanel
      teamA={selectedTeams.a}
      teamB={selectedTeams.b}
      matchResult={result}
    />
  )}
  ```

- [ ] **Paso 3: Verificar visualmente**

  ```bash
  npm run dev
  ```
  
  Ir a `/es/partido` → simular Brasil vs Argentina → scroll al panel IA → ingresar código `worldcup2026-acceso` → verificar que el chat se desbloquea y responde.

- [ ] **Paso 4: Commit**

  ```bash
  git add src/components/partido/PredictorPanel.tsx src/app/[locale]/partido/
  git commit -m "feat: add contextual AI predictor panel to match simulator"
  ```

---

## Task 9: Página Predictor IA dedicada (/predictor)

**Files:**
- Create: `src/app/[locale]/predictor/page.tsx`
- Create: `src/components/predictor/AccessGate.tsx`
- Create: `src/components/predictor/ChatInterface.tsx`

- [ ] **Paso 1: Crear `AccessGate.tsx`**

  ```typescript
  // src/components/predictor/AccessGate.tsx
  'use client'

  import { useState } from 'react'

  interface Props {
    onUnlock: (code: string) => Promise<boolean>
    validating: boolean
    error: string | null
  }

  export function AccessGate({ onUnlock, validating, error }: Props) {
    const [input, setInput] = useState('')

    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--ia-purple)' }}>
            Predictor IA
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Análisis táctico profundo con IA generativa. Requiere código de acceso.
          </p>

          {/* Preview de funciones */}
          <div className="grid grid-cols-3 gap-3 mb-6 text-left">
            {[
              { icon: '🧠', label: 'Análisis táctico' },
              { icon: '📊', label: 'Stats históricas' },
              { icon: '💬', label: 'Chat libre' },
            ].map(f => (
              <div key={f.label} className="rounded-lg p-3 text-center"
                   style={{ background: 'var(--bg-surface)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <div className="text-xl mb-1">{f.icon}</div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
              </div>
            ))}
          </div>

          {/* Input de código */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onUnlock(input)}
              placeholder="Código de acceso..."
              className="flex-1 px-4 py-2 rounded text-sm"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid rgba(168,85,247,0.3)' }}
            />
            <button
              onClick={() => onUnlock(input)}
              disabled={validating || !input}
              className="px-5 py-2 rounded text-sm font-bold disabled:opacity-40"
              style={{ background: 'var(--gradient-ia)', color: 'white' }}>
              {validating ? '...' : 'Entrar'}
            </button>
          </div>
          {error && <p className="text-xs mt-2" style={{ color: 'var(--col-red)' }}>{error}</p>}
        </div>
      </div>
    )
  }
  ```

- [ ] **Paso 2: Crear `ChatInterface.tsx`**

  ```typescript
  // src/components/predictor/ChatInterface.tsx
  'use client'

  import { useChat } from 'ai/react'
  import { useAccessCode } from '@/hooks/useAccessCode'

  export function ChatInterface() {
    const { code, lock } = useAccessCode()

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
      api: '/api/ai-chat',
      headers: { 'x-access-code': code ?? '' },
      initialMessages: [{
        id: 'welcome',
        role: 'assistant',
        content: '¡Bienvenido al Predictor IA del Mundial 2026! Puedo analizar cualquier equipo, partido, grupo o escenario del torneo. ¿Sobre qué quieres hablar?',
      }],
    })

    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div>
            <h2 className="font-bold" style={{ background: 'var(--gradient-ia)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Predictor IA
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Mundial 2026 · Análisis con Claude</p>
          </div>
          <button onClick={lock} className="ml-auto text-xs px-3 py-1 rounded"
                  style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)' }}>
            Cerrar sesión
          </button>
        </div>

        {/* Mensajes */}
        <div className="space-y-4 mb-6 min-h-[300px] max-h-[500px] overflow-y-auto">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg px-4 py-3 text-sm max-w-[80%] ${m.role === 'user' ? 'ml-8' : 'mr-8'}`}
                   style={{
                     background: m.role === 'user' ? 'rgba(0,56,147,0.3)' : 'rgba(168,85,247,0.1)',
                     color: 'var(--text-primary)',
                     border: m.role === 'assistant' ? '1px solid rgba(168,85,247,0.2)' : 'none'
                   }}>
                {m.role === 'assistant' && (
                  <span className="text-xs font-bold block mb-1" style={{ color: 'var(--ia-purple)' }}>🤖 IA</span>
                )}
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg px-4 py-3 text-sm"
                   style={{ background: 'rgba(168,85,247,0.1)', color: 'var(--text-muted)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <span className="text-xs font-bold block mb-1" style={{ color: 'var(--ia-purple)' }}>🤖 IA</span>
                Analizando...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="¿Quién ganará el grupo A? ¿Brasil es favorito? ..."
            className="flex-1 px-4 py-3 rounded-lg text-sm"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid rgba(168,85,247,0.3)' }}
          />
          <button type="submit" disabled={isLoading || !input}
                  className="px-5 py-3 rounded-lg font-bold text-sm disabled:opacity-40"
                  style={{ background: 'var(--gradient-ia)', color: 'white' }}>
            ↑
          </button>
        </form>
      </div>
    )
  }
  ```

- [ ] **Paso 3: Crear página `/predictor`**

  ```typescript
  // src/app/[locale]/predictor/page.tsx
  'use client'

  import { useAccessCode } from '@/hooks/useAccessCode'
  import { AccessGate } from '@/components/predictor/AccessGate'
  import { ChatInterface } from '@/components/predictor/ChatInterface'
  import { modules } from '@/config/modules'
  import { redirect } from 'next/navigation'
  import { useParams } from 'next/navigation'

  export default function PredictorPage() {
    const { locale } = useParams<{ locale: string }>()
    const { isUnlocked, unlock, validating, error } = useAccessCode()

    if (!modules.predictor.enabled) {
      redirect(`/${locale}/torneo`)
    }

    return (
      <main className="max-w-2xl mx-auto px-4 py-8" style={{ color: 'var(--text-primary)' }}>
        {isUnlocked ? (
          <ChatInterface />
        ) : (
          <AccessGate onUnlock={unlock} validating={validating} error={error} />
        )}
      </main>
    )
  }
  ```

- [ ] **Paso 4: Verificar visualmente**

  ```bash
  npm run dev
  ```
  
  Ir a `http://localhost:3000/es/predictor` → pantalla de bloqueo → ingresar código → chat libre con IA.

- [ ] **Paso 5: Commit**

  ```bash
  git add src/app/[locale]/predictor/ src/components/predictor/
  git commit -m "feat: add dedicated AI predictor page with access gate and chat"
  ```

---

## Task 10: i18n — Claves para módulos nuevos

**Files:**
- Modify: `messages/es.json`
- Modify: `messages/en.json`

- [ ] **Paso 1: Verificar estructura de los archivos de mensajes**

  ```bash
  cat messages/es.json | head -30
  ```

- [ ] **Paso 2: Añadir claves ES**

  En `messages/es.json`, añadir:
  ```json
  "partido": {
    "title": "Simulador de Partido",
    "subtitle": "Elige dos selecciones y simula el resultado con nuestro modelo ELO + Poisson.",
    "step1": "PASO 1 — ELIGE LOS EQUIPOS",
    "step2": "RESULTADO DE 10.000 SIMULACIONES",
    "step3": "ANÁLISIS DE EQUIPOS",
    "selectTeam": "Selecciona equipo...",
    "simulate": "SIMULAR",
    "simulating": "Simulando 10.000 partidos...",
    "wins": "gana",
    "draw": "Empate",
    "topScore": "MARCADOR MÁS PROBABLE",
    "top5": "TOP 5 MARCADORES",
    "realResult": "RESULTADO FINAL",
    "liveResult": "EN VIVO"
  },
  "predictor": {
    "title": "Predictor IA",
    "subtitle": "Análisis táctico profundo con IA generativa.",
    "locked": "Requiere código de acceso",
    "placeholder": "Código de acceso...",
    "enter": "Entrar",
    "wrongCode": "Código incorrecto. Intenta de nuevo.",
    "connectionError": "Error de conexión.",
    "chatPlaceholder": "¿Quién ganará el grupo A? ¿Brasil es favorito? ...",
    "logout": "Cerrar sesión",
    "analyzing": "Analizando...",
    "activatePanel": "Activar",
    "panelPlaceholder": "Pregunta algo sobre este partido..."
  }
  ```

- [ ] **Paso 3: Añadir claves EN**

  En `messages/en.json`, añadir:
  ```json
  "partido": {
    "title": "Match Simulator",
    "subtitle": "Pick two teams and simulate the result with our ELO + Poisson model.",
    "step1": "STEP 1 — PICK THE TEAMS",
    "step2": "RESULT OF 10,000 SIMULATIONS",
    "step3": "TEAM ANALYSIS",
    "selectTeam": "Select team...",
    "simulate": "SIMULATE",
    "simulating": "Simulating 10,000 matches...",
    "wins": "wins",
    "draw": "Draw",
    "topScore": "MOST LIKELY SCORE",
    "top5": "TOP 5 SCORES",
    "realResult": "FINAL RESULT",
    "liveResult": "LIVE"
  },
  "predictor": {
    "title": "AI Predictor",
    "subtitle": "Deep tactical analysis with generative AI.",
    "locked": "Requires access code",
    "placeholder": "Access code...",
    "enter": "Enter",
    "wrongCode": "Wrong code. Try again.",
    "connectionError": "Connection error.",
    "chatPlaceholder": "Who will win Group A? Is Brazil the favorite? ...",
    "logout": "Log out",
    "analyzing": "Analyzing...",
    "activatePanel": "Activate",
    "panelPlaceholder": "Ask something about this match..."
  }
  ```

- [ ] **Paso 4: Aplicar traducciones en los componentes**

  En cada componente nuevo, reemplazar los textos hardcoded con `useTranslations('partido')` o `useTranslations('predictor')` según corresponda.

- [ ] **Paso 5: Verificar en inglés**

  ```bash
  npm run dev
  ```
  
  Ir a `http://localhost:3000/en/partido` y `http://localhost:3000/en/predictor` — verificar que los textos aparecen en inglés.

- [ ] **Paso 6: Commit**

  ```bash
  git add messages/
  git commit -m "feat: add i18n keys for partido and predictor modules"
  ```

---

## Task 11: Deploy en Vercel desde cuenta RayoSom

**Files:** ninguno (configuración en Vercel)

- [ ] **Paso 1: Asegurarse de que todos los tests pasan**

  ```bash
  npm test
  ```
  
  Esperado: todos los tests en verde.

- [ ] **Paso 2: Verificar build local**

  ```bash
  npm run build
  ```
  
  Esperado: build exitoso sin errores de TypeScript. Corregir cualquier error antes de continuar.

- [ ] **Paso 3: Push al repo de RayoSom**

  ```bash
  git push origin main
  ```

- [ ] **Paso 4: Crear proyecto en Vercel**

  1. Ir a `https://vercel.com` → iniciar sesión con GitHub (cuenta RayoSom)
  2. **New Project** → importar `RayoSom/worldcup2026`
  3. Framework: **Next.js** (detección automática)
  4. **NO hacer deploy aún** — primero configurar variables de entorno

- [ ] **Paso 5: Configurar variables de entorno en Vercel**

  En la configuración del proyecto → **Environment Variables**, añadir:

  | Nombre | Valor | Entorno |
  |---|---|---|
  | `ANTHROPIC_API_KEY` | sk-ant-... | Production + Preview |
  | `ACCESS_CODE` | tu-codigo-secreto | Production + Preview |
  | `FOOTBALL_DATA_API_KEY` | ... | Production + Preview |
  | `NEXT_PUBLIC_TORNEO_ENABLED` | true | Production + Preview |
  | `NEXT_PUBLIC_PARTIDO_ENABLED` | true | Production + Preview |
  | `NEXT_PUBLIC_PREDICTOR_ENABLED` | true | Production + Preview |
  | `NEXT_PUBLIC_PREDICTOR_PANEL_ENABLED` | true | Production + Preview |

- [ ] **Paso 6: Hacer deploy**

  Clic en **Deploy** → esperar a que termine (~2 minutos).

- [ ] **Paso 7: Verificar deploy**

  Abrir la URL de Vercel que aparece tras el deploy. Verificar:
  - `/es/torneo` → simulador de torneo funciona
  - `/es/partido` → elegir dos equipos, simular, ver resultado
  - `/es/predictor` → pantalla de bloqueo, ingresar código, chat IA responde
  - `/en/partido` → textos en inglés

- [ ] **Paso 8: Commit final**

  ```bash
  git tag v1.0.0
  git push origin v1.0.0
  ```
