'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { modules } from '@/config/modules'
import { useAccessCode } from '@/hooks/useAccessCode'
import { AccessGate } from '@/components/predictor/AccessGate'
import { ChatInterface } from '@/components/predictor/ChatInterface'

export function PredictorPageClient({ locale }: { locale: string }) {
  const router = useRouter()
  const { code, isUnlocked, validating, error, unlock } = useAccessCode()

  useEffect(() => {
    if (!modules.predictor.enabled) {
      router.replace(`/${locale}/torneo`)
    }
  }, [router, locale])

  if (!modules.predictor.enabled) {
    return null
  }

  if (!isUnlocked) {
    return (
      <AccessGate
        onUnlock={unlock}
        validating={validating}
        error={error}
      />
    )
  }

  return <ChatInterface code={code!} />
}
