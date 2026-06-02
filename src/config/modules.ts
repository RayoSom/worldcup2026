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
