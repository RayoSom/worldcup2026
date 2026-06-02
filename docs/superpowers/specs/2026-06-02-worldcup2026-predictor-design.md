# WC2026 Predictor — Diseño

**Fecha:** 2026-06-02  
**Repo base:** `kmanus88/worldcup2026` → fork a `RayoSom/worldcup2026`  
**Deploy:** Vercel desde cuenta GitHub `RayoSom`  
**Stack:** Next.js 15 · TypeScript · Tailwind v4 · Vercel AI SDK

---

## 1. Objetivo

App web pública para fans del Mundial 2026 que combina:
- Simulador estadístico (ELO + Poisson, motor existente)
- Resultados reales vía API durante el torneo
- Análisis narrativo pre-generado por equipo
- Chat IA interactivo (Claude API) con acceso por código secreto

---

## 2. Arquitectura de módulos

Tres módulos independientes, cada uno activable/desactivable con variables de entorno. Desactivar un módulo lo oculta del navbar y deshabilita sus rutas.

| Módulo | Ruta | Estado | Flag |
|---|---|---|---|
| 🏆 Torneo | `/[locale]/torneo` | Existente + rediseño visual | `NEXT_PUBLIC_TORNEO_ENABLED` |
| ⚔️ Partido | `/[locale]/partido` | **Nuevo** | `NEXT_PUBLIC_PARTIDO_ENABLED` |
| 🤖 Predictor IA | `/[locale]/predictor` | **Nuevo** · requiere código | `NEXT_PUBLIC_PREDICTOR_ENABLED` |

**Config central** (`src/config/modules.ts`):
```ts
export const modules = {
  torneo:    { enabled: process.env.NEXT_PUBLIC_TORNEO_ENABLED    !== 'false' },
  partido:   { enabled: process.env.NEXT_PUBLIC_PARTIDO_ENABLED   !== 'false' },
  predictor: {
    enabled:      process.env.NEXT_PUBLIC_PREDICTOR_ENABLED       !== 'false',
    panelEnabled: process.env.NEXT_PUBLIC_PREDICTOR_PANEL_ENABLED !== 'false',
  },
}
```

---

## 3. Identidad visual

**Tema oscuro premium con bandera Colombia integrada.**

| Token | Valor | Uso |
|---|---|---|
| Background | `#080810` | Fondo global |
| Surface | `#0d0d1f` | Cards, navbar |
| Colombia Yellow | `#FCD116` | Acentos primarios, logo |
| Colombia Blue | `#003893` | Acentos secundarios |
| Colombia Red | `#CE1126` | Acentos terciarios |
| IA Purple | `#a855f7` | Módulo Predictor IA exclusivamente |

**Logo:** `WC2026 ⚽` con gradiente CSS `#FCD116 → #003893 → #CE1126`.  
**Navbar:** Top horizontal. Módulo activo resaltado con gradiente Colombia. Predictor IA usa morado.  
**Cards de datos:** Borde con color Colombia según contexto (amarillo = líder, azul = dato neutro, rojo = alerta/eliminado).

---

## 4. Módulo Torneo (`/torneo`)

Sin cambios funcionales. Solo rediseño visual al nuevo tema. Reutiliza:
- Motor ELO+Poisson existente (Web Workers, 100K sims)
- Componentes de grupos, bracket y estadísticas existentes

Adición: banner en la parte superior que muestra si hay partidos en juego en este momento (conectado a la API de resultados reales).

---

## 5. Módulo Partido (`/partido`) — NUEVO

### Flujo progresivo (layout B)

**Paso 1 — Selector de equipos**
- Dos dropdowns con búsqueda: Equipo A vs Equipo B
- Flags via `circle-flags` (ya incluida en el repo)
- Muestra ELO actual de cada equipo al seleccionar
- Botón "SIMULAR" con gradiente Colombia

**Paso 2 — Resultado de la simulación**
- Reutiliza el motor ELO+Poisson existente (10K simulaciones, instantáneo en browser)
- Muestra: % victoria A / % empate / % victoria B con barra de progreso
- Marcador más probable con su probabilidad (ej. "1-0 Brasil — 12.4%")
- Top 5 marcadores más frecuentes como chips

**Paso 3 — Narrativa pre-generada**
- Tarjeta por equipo con análisis de fortalezas, estilo y jugadores clave
- Datos desde `src/data/team-narratives.json` (generado offline con Claude, sin costo en runtime)

**Paso 4 — Panel Predictor IA** *(si `panelEnabled = true`)*
- Aparece al pie del resultado
- Estado bloqueado: campo de código + descripción de lo que desbloquea
- Estado desbloqueado: chat contextual pre-cargado con el contexto del partido simulado
- Código validado en el servidor (`/api/validate-code`), sesión guardada en `localStorage`

### Datos reales vs simulación
Si el partido ya fue jugado (según la API de resultados), el módulo muestra el resultado real en lugar de la simulación, con badge "RESULTADO FINAL".

---

## 6. Módulo Predictor IA (`/predictor`) — NUEVO

### Página dedicada

**Estado bloqueado** (sin código válido):
- Pantalla centrada con icono 🔒, nombre del módulo en morado
- Preview de 3 funciones disponibles (análisis táctico, stats históricas, chat libre)
- Campo de código de acceso + botón validar
- Sin llamada a la API hasta que el código sea válido

**Estado desbloqueado**:
- Interfaz de chat estilo terminal oscuro
- Mensaje inicial del sistema contextualizado: datos de grupos oficiales FIFA 2026, ELO de los 48 equipos, fase actual del torneo
- Chat libre: el fan puede preguntar sobre cualquier partido, equipo o escenario del Mundial
- Streaming de respuesta (Vercel AI SDK `useChat`)

### API Route (`/api/ai-chat`)

```
POST /api/ai-chat
Headers: X-Access-Code: <code>
Body: { messages: Message[], context?: { teamA?, teamB?, matchResult? } }
```

1. Valida `X-Access-Code` contra `process.env.ACCESS_CODE`
2. Si inválido: `401 Unauthorized`
3. Si válido: llama Claude API (modelo: `claude-haiku-4-5-20251001` para costo bajo) con streaming
4. System prompt incluye: ELO de 48 equipos, grupos FIFA, fase actual, y contexto del partido si se envía

---

## 7. Integración API de resultados reales

**Proveedor:** [football-data.org](https://www.football-data.org/) — tier gratuito cubre Copa del Mundo.

**Implementación:**
- API Route `/api/matches` que actúa como proxy (oculta la API key del cliente)
- Caché de 5 minutos (revalidación con `next: { revalidate: 300 }`)
- Datos: fixture completo, resultados en tiempo real, fase actual

**Variable de entorno:** `FOOTBALL_DATA_API_KEY`

**Lógica en cliente:**
```
partido jugado  → muestra resultado real (badge verde "FINAL")
partido en curso → muestra marcador live + badge rojo "EN VIVO"
partido futuro  → muestra predicción ELO+Poisson
```

---

## 8. Datos pre-generados

**`src/data/team-narratives.json`**

Generado offline con un script de Node.js que llama Claude una vez. Estructura:
```json
{
  "BRA": {
    "name": "Brasil",
    "elo": 2150,
    "style": "Presión alta, transiciones rápidas...",
    "strengths": ["Delantera de clase mundial", "..."],
    "keyPlayers": ["Vinicius Jr.", "Rodrygo"],
    "analysis": "Brasil llega como favorito con una generación..."
  }
}
```

Costo estimado: ~$0.10 total para los 48 equipos. Se regenera solo si cambia el equipo técnico o plantel.

---

## 9. Variables de entorno

```env
# IA
ANTHROPIC_API_KEY=sk-ant-...
ACCESS_CODE=codigo-secreto-para-fans

# Resultados reales
FOOTBALL_DATA_API_KEY=...

# Feature flags (true por defecto si se omiten)
NEXT_PUBLIC_TORNEO_ENABLED=true
NEXT_PUBLIC_PARTIDO_ENABLED=true
NEXT_PUBLIC_PREDICTOR_ENABLED=true
NEXT_PUBLIC_PREDICTOR_PANEL_ENABLED=true
```

---

## 10. Setup inicial

1. Fork `kmanus88/worldcup2026` → `RayoSom/worldcup2026` en GitHub
2. Clonar localmente en `worldcup2026/`
3. Instalar dependencias: `npm install`
4. Añadir `@ai-sdk/anthropic` y `ai` (Vercel AI SDK)
5. Registrar en [football-data.org](https://www.football-data.org/) para obtener API key gratuita
6. Configurar `.env.local` con las variables anteriores
7. Conectar repo a Vercel desde cuenta `RayoSom`
8. Generar `team-narratives.json` con script offline

---

## 11. Orden de implementación

1. Fork + clone + setup local
2. Rediseño visual (tema Colombia Premium en globals.css + navbar)
3. `src/config/modules.ts` + navbar condicional
4. Script de generación de `team-narratives.json`
5. Módulo Partido (`/partido`) — simulación + narrativa (sin IA)
6. API proxy de resultados reales (`/api/matches`)
7. API route de chat IA (`/api/ai-chat`) + validación de código
8. Panel Predictor IA en `/partido`
9. Página Predictor IA (`/predictor`)
10. i18n (ES/EN) para textos nuevos
11. Deploy en Vercel desde `RayoSom`
