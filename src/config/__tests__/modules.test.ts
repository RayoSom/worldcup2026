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
