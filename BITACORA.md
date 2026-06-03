# Bitácora — WC2026 Predictor

**Repositorio:** https://github.com/RayoSom/worldcup2026  
**Deploy:** https://worldcup2026-dusky.vercel.app  
**Sesión:** 2026-06-02

---

## Resumen ejecutivo

Se construyó una app web pública para fans del Mundial 2026 sobre el fork del repositorio `kmanus88/worldcup2026`. La app combina un simulador estadístico ELO+Poisson con análisis narrativo pre-generado y un chat IA (Google Gemini Flash) con acceso por código secreto. Todo desplegado en Vercel desde la cuenta `RayoSom`.

---

## Lo que se hizo (11 tareas completadas)

### Task 1 — Setup del repositorio
- Fork de `kmanus88/worldcup2026` → `RayoSom/worldcup2026`
- Clon local, instalación de dependencias
- Instalación de `ai@6.0.194` y `@ai-sdk/google@3.0.80` (Vercel AI SDK)
- Creación de `.env.local` y `.env.local.example`

### Task 2 — Config de módulos y tema visual
- `src/config/modules.ts` — feature flags para activar/desactivar cada módulo via env vars
- Tokens CSS del tema Colombia Premium en `globals.css`:
  - Fondo oscuro `#080810`, superficie `#0d0d1f`
  - Colores bandera Colombia: amarillo `#FCD116`, azul `#003893`, rojo `#CE1126`
  - Morado IA `#a855f7` para el módulo Predictor
  - Gradientes CSS reutilizables

### Task 3 — Rediseño del Navbar
- `src/components/layout/Header.tsx` rediseñado con:
  - Logo `WC2026 ⚽` con gradiente bandera Colombia
  - 3 tabs condicionales: Torneo / Partido / Predictor IA
  - Predictor IA en morado; los demás en gradiente Colombia
  - Selector de idioma ES/EN preservado

### Task 4 — Narrativas de equipos
- `scripts/generate-narratives.ts` — genera análisis bilingüe (EN/ES) por equipo via Gemini
- `src/data/team-narratives.json` — 48 equipos con: nombre, ELO, estilo, fortalezas, jugadores clave, análisis
  - 19 generados con IA (Gemini 2.5 Flash)
  - 29 con datos estáticos curados (pendiente completar con IA)
- Costo: ~$0 (free tier de Google AI Studio)

### Task 5 — Módulo Partido (`/partido`)
- `src/lib/simulateMatch.ts` — wrapper sobre el motor ELO+Poisson existente (10.000 simulaciones)
- `src/components/partido/TeamSelector.tsx` — selector A vs B con ELO display
- `src/components/partido/MatchResult.tsx` — probabilidades + top 5 marcadores
- `src/components/partido/NarrativeCard.tsx` — análisis pre-generado por equipo
- `src/app/[locale]/partido/page.tsx` + `PartidoClient.tsx`
- 19 tests unitarios pasando

### Task 6 — API de resultados reales
- `src/lib/footballApi.ts` — tipos y helpers de estado de partido
- `src/app/api/matches/route.ts` — proxy a football-data.org con caché 5 minutos
- `src/hooks/useMatches.ts` — hook con polling cada 5 minutos
- Banner rojo "EN VIVO" en el módulo Torneo cuando hay partidos activos
- Funciona con degradación elegante cuando no hay API key configurada

### Task 7 — Validación de código y chat IA
- `src/app/api/validate-code/route.ts` — POST que valida el código secreto
- `src/app/api/ai-chat/route.ts` — streaming Gemini Flash con validación de código
- `src/lib/systemPrompt.ts` — prompt con ELO de 48 equipos + contexto de partido
- `src/hooks/useAccessCode.ts` — persistencia del código en localStorage
- 5 tests unitarios pasando

### Task 8 — Panel Predictor IA en /partido
- `src/components/partido/PredictorPanel.tsx`
  - Estado bloqueado: campo de código + botón "Activar"
  - Estado desbloqueado: chat streaming con contexto del partido simulado
  - Integrado en PartidoClient después de las narrativas

### Task 9 — Página Predictor IA (`/predictor`)
- `src/components/predictor/AccessGate.tsx` — pantalla con 🔒, 3 features, input de código
- `src/components/predictor/ChatInterface.tsx` — chat libre sobre el Mundial con Gemini
- `src/app/[locale]/predictor/page.tsx` + `PredictorPageClient.tsx`
- Chat libre sobre cualquier equipo, partido o escenario del torneo

### Task 10 — i18n (ES/EN)
- Namespace `"partido"` en `messages/es.json` y `messages/en.json`
- Namespace `"predictor"` en ambos archivos
- Todos los componentes nuevos usan `useTranslations()` de next-intl

### Task 11 — Deploy en Vercel
- Push a `RayoSom/worldcup2026` en GitHub
- Proyecto vinculado a Vercel (cuenta `rayosom`)
- Variables de entorno configuradas en producción
- **Deploy exitoso:** https://worldcup2026-dusky.vercel.app

---

## Arquitectura final

```
worldcup2026/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── partido/          ← NUEVO: simulador de partido
│   │   │   ├── predictor/        ← NUEVO: chat IA
│   │   │   └── (torneo existente rediseñado)
│   │   └── api/
│   │       ├── ai-chat/          ← NUEVO: Gemini streaming
│   │       ├── validate-code/    ← NUEVO: validación de código
│   │       └── matches/          ← NUEVO: proxy football-data.org
│   ├── components/
│   │   ├── partido/              ← NUEVO: TeamSelector, MatchResult, NarrativeCard, PredictorPanel
│   │   ├── predictor/            ← NUEVO: AccessGate, ChatInterface
│   │   └── layout/Header.tsx     ← MODIFICADO: tema Colombia Premium
│   ├── config/modules.ts         ← NUEVO: feature flags
│   ├── data/team-narratives.json ← NUEVO: 48 equipos bilingüe
│   ├── hooks/
│   │   ├── useAccessCode.ts      ← NUEVO
│   │   └── useMatches.ts         ← NUEVO
│   └── lib/
│       ├── simulateMatch.ts      ← NUEVO: wrapper del motor ELO+Poisson
│       ├── systemPrompt.ts       ← NUEVO: contexto del Mundial para Gemini
│       └── footballApi.ts        ← NUEVO: tipos y helpers
├── scripts/generate-narratives.ts ← NUEVO: generador de narrativas con Gemini
└── .env.local.example            ← NUEVO: guía de variables
```

---

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| Next.js 15 + TypeScript | Framework base |
| Tailwind CSS v4 | Estilos |
| next-intl | i18n ES/EN |
| Motor ELO+Poisson (existente) | Simulación estadística |
| Vercel AI SDK v6 | Streaming con Gemini |
| @ai-sdk/google | Provider Gemini Flash |
| football-data.org API | Resultados reales del torneo |
| Vitest | Tests (30 tests, 5 archivos) |

---

## Variables de entorno requeridas

```env
GOOGLE_GENERATIVE_AI_API_KEY=...   # Google AI Studio (gratis)
ACCESS_CODE=worldcup2026-acceso    # Código de acceso al Predictor IA
FOOTBALL_DATA_API_KEY=...          # football-data.org (gratis, registrar)
NEXT_PUBLIC_TORNEO_ENABLED=true
NEXT_PUBLIC_PARTIDO_ENABLED=true
NEXT_PUBLIC_PREDICTOR_ENABLED=true
NEXT_PUBLIC_PREDICTOR_PANEL_ENABLED=true
```

---

## Tareas pendientes para la próxima sesión

### 🔴 Urgente (antes del torneo — 11 jun 2026)

1. **Regenerar Google AI API key**
   - La key fue compartida en el chat de la sesión — riesgo de seguridad
   - Ir a: https://aistudio.google.com/apikey → revocar la actual → crear nueva
   - Actualizar en Vercel: Settings → Environment Variables → `GOOGLE_GENERATIVE_AI_API_KEY`

2. **Activar resultados reales (football-data.org)**
   - Registrarse en: https://www.football-data.org/client/register
   - Obtener API key gratuita
   - Actualizar en Vercel: `FOOTBALL_DATA_API_KEY`
   - El banner "🔴 EN VIVO" del módulo Torneo se activará automáticamente

3. **Completar narrativas de los 29 equipos restantes con IA**
   - El script tiene soporte de reanudación — solo genera los que faltan
   - Ejecutar: `npm run generate:narratives` (límite: 20 req/día free tier)
   - Repetir en días consecutivos hasta completar los 48
   - Hacer commit y push del `team-narratives.json` actualizado

### 🟡 Mejoras para el torneo (durante la competencia)

4. **Mostrar resultado real en /partido cuando el partido ya se jugó**
   - Si el partido existe en `/api/matches` con status `FINISHED`, mostrar el marcador real
   - Badge verde "RESULTADO FINAL" en lugar de la predicción
   - Requiere cruzar los equipos del simulador con los partidos de la API

5. **Dominio personalizado en Vercel**
   - El dominio actual es `worldcup2026-dusky.vercel.app`
   - Configurar dominio propio en: Vercel → Settings → Domains

6. **Completar i18n en ChatInterface**
   - `"Mundial 2026 · Análisis con Gemini"` — subtítulo hardcodeado sin clave i18n
   - Mensajes de error menores sin traducir al inglés

### 🟢 Futuras mejoras opcionales

7. **Distribución de marcadores como histograma visual**
   - El motor ya calcula la distribución completa
   - Añadir un gráfico de barras D3.js (ya incluido en el repo) en MatchResult

8. **Simulación del bracket del Mundial**
   - Conectar el simulador de partido individual con el módulo de torneo existente
   - Permitir al usuario modificar el bracket y ver cómo cambian las probabilidades

9. **Rate limiting básico en /api/ai-chat**
   - Sin límite actualmente — un usuario con el código puede hacer llamadas ilimitadas
   - Implementar límite simple por IP con Vercel Edge Middleware

10. **Modo oscuro / claro**
    - El tema actual es solo oscuro
    - Considerar toggle opcional

---

## Notas técnicas importantes

- **`ai/react` NO existe en ai@6.0.194** — el streaming está implementado con `fetch` + `ReadableStream` manual en `PredictorPanel` y `ChatInterface`
- **`zod` es peer dep obligatorio** del AI SDK aunque no se use directamente en el código
- **Caché de `.next/` en OneDrive** puede generar errores `EINVAL` — ejecutar `rm -rf .next` antes de `npm run build` si falla
- **Gemini 2.5 Flash free tier**: 20 requests/día — suficiente para narrativas pero monitorear en producción
- El spec completo está en: `docs/superpowers/specs/2026-06-02-worldcup2026-predictor-design.md`
- El plan de implementación en: `docs/superpowers/plans/2026-06-02-worldcup2026-predictor.md`
