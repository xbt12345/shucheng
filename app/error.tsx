'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-6">⚠️</div>
      <h2 className="text-2xl font-bold text-[--ink] mb-2">页面出错了</h2>
      <p className="text-gray-500 mb-8 max-w-sm text-sm">
        遇到了一个意外问题，请尝试刷新页面。如反复出现，请稍后再试。
      </p>
      <Button onClick={reset} className="bg-[--ink] text-[--paper]">
        重试
      </Button>
    </div>
  )
}
