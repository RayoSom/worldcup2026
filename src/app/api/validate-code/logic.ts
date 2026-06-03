export function isValidCode(input: string, secret: string): boolean {
  if (!input || !secret) return false
  return input.trim().toLowerCase() === secret.trim().toLowerCase()
}
