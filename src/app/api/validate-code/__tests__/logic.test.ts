import { isValidCode } from '../logic'

describe('isValidCode', () => {
  it('accepts correct code', () => {
    expect(isValidCode('mi-codigo', 'mi-codigo')).toBe(true)
  })
  it('rejects wrong code', () => {
    expect(isValidCode('otro', 'mi-codigo')).toBe(false)
  })
  it('rejects empty input', () => {
    expect(isValidCode('', 'mi-codigo')).toBe(false)
  })
  it('is case-insensitive', () => {
    expect(isValidCode('MI-CODIGO', 'mi-codigo')).toBe(true)
  })
  it('trims whitespace', () => {
    expect(isValidCode('  mi-codigo  ', 'mi-codigo')).toBe(true)
  })
})
