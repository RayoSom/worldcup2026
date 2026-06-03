import { isMatchPlayed, isMatchLive, parseMatchStatus } from '../footballApi'

describe('footballApi helpers', () => {
  it('recognizes finished match', () => {
    expect(isMatchPlayed('FINISHED')).toBe(true)
    expect(isMatchPlayed('SCHEDULED')).toBe(false)
  })

  it('recognizes live match', () => {
    expect(isMatchLive('IN_PLAY')).toBe(true)
    expect(isMatchLive('PAUSED')).toBe(true)
    expect(isMatchLive('FINISHED')).toBe(false)
  })

  it('parses status correctly', () => {
    expect(parseMatchStatus('FINISHED')).toBe('finished')
    expect(parseMatchStatus('SCHEDULED')).toBe('scheduled')
    expect(parseMatchStatus('IN_PLAY')).toBe('live')
    expect(parseMatchStatus('PAUSED')).toBe('live')
  })
})
