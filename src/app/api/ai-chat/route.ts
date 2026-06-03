import { streamText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { NextRequest } from 'next/server'
import { isValidCode } from '../validate-code/logic'
import { buildSystemPrompt } from '@/lib/systemPrompt'

export const runtime = 'edge'

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

  const { messages, context } = await req.json()

  const google = createGoogleGenerativeAI({ apiKey })

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: buildSystemPrompt(context),
    messages,
    maxOutputTokens: 600,
  })

  return result.toTextStreamResponse()
}
