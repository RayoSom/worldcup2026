import { NextRequest, NextResponse } from 'next/server'
import { isValidCode } from './logic'

export async function POST(req: NextRequest) {
  let code: unknown
  try {
    const body = await req.json()
    code = body.code
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 })
  }

  const secret = process.env.ACCESS_CODE ?? ''

  if (isValidCode(String(code ?? ''), secret)) {
    return NextResponse.json({ valid: true })
  }
  return NextResponse.json({ valid: false }, { status: 401 })
}
