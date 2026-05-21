'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('登录失败', { description: error.message })
    } else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input id="email" type="email" value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <Input id="password" type="password" value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••" required />
      </div>
      <Button type="submit" className="w-full bg-[--ink] text-[--paper]" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </Button>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[--border]" />
        </div>
        <div className="relative flex justify-center text-xs text-gray-500">
          <span className="bg-[--paper] px-2">或</span>
        </div>
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={handleGitHubLogin}>
        使用 GitHub 登录
      </Button>
    </form>
  )
}
