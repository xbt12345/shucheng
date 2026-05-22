'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function CreateBooklistButton() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleCreate = async () => {
    if (!title.trim()) return
    setSaving(true)
    const res = await fetch('/api/booklists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        is_public: isPublic,
      }),
    })
    if (res.ok) {
      const { id } = await res.json()
      toast.success('书单已创建')
      setOpen(false)
      router.push(`/booklists/${id}`)
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
        + 创建书单
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-[--ink] mb-5">创建书单</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  书单名称 <span className="text-red-400">*</span>
                </label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={60}
                  placeholder="如：道家必读十部经典"
                  className="w-full border border-[--border] rounded-lg px-3 py-2 text-sm
                    focus:outline-none focus:ring-1 focus:ring-[--gold]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="介绍这份书单的主题或推荐理由..."
                  className="w-full border border-[--border] rounded-lg px-3 py-2 text-sm
                    resize-none focus:outline-none focus:ring-1 focus:ring-[--gold]"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)}
                  className="w-4 h-4 accent-amber-700" />
                <span className="text-sm text-gray-700">公开书单（其他人可以看到）</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>取消</Button>
              <Button size="sm" onClick={handleCreate} disabled={saving || !title.trim()}
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
