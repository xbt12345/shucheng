'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function CreateCircleButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleCreate = async () => {
    if (!name.trim()) return
    setSaving(true)
    const res = await fetch('/api/circles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
    })
    if (res.ok) {
      const { id } = await res.json()
      toast.success('话题圈已创建')
      setOpen(false)
      router.push(`/circles/${id}`)
      router.refresh()
    } else {
      const { error } = await res.json()
      toast.error('创建失败', { description: error })
    }
    setSaving(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-[--ink] text-[--paper]">
        + 创建话题圈
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-[--ink] mb-5">创建话题圈</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  圈子名称 <span className="text-red-400">*</span>
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={50}
                  placeholder="如：《道德经》研读圈"
                  className="w-full border border-[--border] rounded-lg px-3 py-2 text-sm
                    focus:outline-none focus:ring-1 focus:ring-[--gold]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">圈子简介</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="介绍这个话题圈的主题和目的..."
                  className="w-full border border-[--border] rounded-lg px-3 py-2 text-sm
                    resize-none focus:outline-none focus:ring-1 focus:ring-[--gold]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>取消</Button>
              <Button size="sm" onClick={handleCreate} disabled={saving || !name.trim()}
                className="bg-[--ink] text-[--paper]">
                {saving ? '创建中...' : '创建'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
