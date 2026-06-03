import { streamText, type ModelMessage } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { NextRequest } from 'next/server'
import { isValidCode } from '../validate-code/logic'
import { buildSystemPrompt } from '@/lib/systemPrompt'

// Node.js runtime — edge has webpack bundling issues with the ai SDK
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const accessCode = req.headers.get('x-access-code') ?? ''
  const secret = process.env.ACCESS_CODE ?? ''

  if (!isValidCode(accessCode, secret)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    return new Response('AI not configured', { status: 503 })
  }

  let messages: ModelMessage[], context: Parameters<typeof buildSystemPrompt>[0]
  try {
    const body = await req.json()
    messages = body.messages
    context = body.context
  } catch {
    return new Response('Bad Request: invalid JSON', { status: 400 })
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('Bad Request: messages must be a non-empty array', { status: 400 })
  }

  const google = createGoogleGenerativeAI({ apiKey })

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: buildSystemPrompt(context),
    messages,
    maxOutputTokens: 600,
  })

  return result.toTextStreamResponse()
}
