'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username.length < 2) {
      toast.error('用户名至少 2 个字符')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) {
      toast.error('注册失败', { description: error.message })
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-medium">注册成功！</p>
        <p className="text-gray-600 mt-2">请查收邮件，点击确认链接后即可登录。</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">用户名</Label>
        <Input id="username" value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="如：墨言禅心" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input id="email" type="email" value={email}
          onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">密码（至少 8 位）</Label>
        <Input id="password" type="password" value={password}
          onChange={e => setPassword(e.target.value)}
          minLength={8} required />
      </div>
      <Button type="submit" className="w-full bg-[--ink] text-[--paper]" disabled={loading}>
        {loading ? '注册中...' : '免费注册'}
      </Button>
    </form>
  )
}
