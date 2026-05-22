'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Profile = {
  id: string
  username: string
  bio: string | null
  avatar_url: string | null
}

export function EditProfileButton({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!username.trim()) return
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), bio: bio.trim() || null }),
    })
    if (res.ok) {
      toast.success('资料已更新')
      setOpen(false)
      window.location.reload()
    } else {
      const { error } = await res.json()
      toast.error('更新失败', { description: error })
    }
    setSaving(false)
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}
        className="border-[--border] text-[--ink] hover:bg-[--paper-dark]">
        编辑资料
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-[--ink] mb-5">编辑个人资料</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  maxLength={30}
                  className="w-full border border-[--border] rounded-lg px-3 py-2 text-sm
                    focus:outline-none focus:ring-1 focus:ring-[--gold]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="介绍一下自己..."
                  className="w-full border border-[--border] rounded-lg px-3 py-2 text-sm
                    resize-none focus:outline-none focus:ring-1 focus:ring-[--gold]"
                />
                <p className="text-xs text-gray-400 mt-1">{bio.length}/200</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>取消</Button>
              <Button size="sm" onClick={handleSave} disabled={saving || !username.trim()}
                className="bg-[--ink] text-[--paper]">
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
