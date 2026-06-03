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
