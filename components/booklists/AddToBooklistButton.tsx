'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Booklist = { id: string; title: string }

export function AddToBooklistButton({ bookId }: { bookId: string }) {
  const [open, setOpen] = useState(false)
  const [lists, setLists] = useState<Booklist[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)

  const fetchLists = async () => {
    setLoading(true)
    const res = await fetch('/api/booklists/mine')
    if (res.ok) setLists(await res.json())
    setLoading(false)
  }

  const handleAdd = async (booklistId: string) => {
    setAdding(booklistId)
    const res = await fetch('/api/booklists/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booklistId, bookId }),
    })
    if (res.ok) {
      toast.success('已加入书单')
      setOpen(false)
    } else {
      const { error } = await res.json()
      toast.error('操作失败', { description: error })
    }
    setAdding(null)
  }

  const handleOpen = () => {
    setOpen(true)
    fetchLists()
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}
        className="border-[--border] hover:border-[--gold] hover:text-[--gold]">
        + 加入书单
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-base font-bold text-[--ink] mb-4">选择书单</h2>

            {loading ? (
              <p className="text-center text-gray-400 py-4 text-sm">加载中...</p>
            ) : lists.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                <p>你还没有书单</p>
                <a href="/booklists" className="text-[--gold] hover:underline mt-1 block">
                  去创建一个 →
                </a>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {lists.map(bl => (
                  <button key={bl.id} onClick={() => handleAdd(bl.id)}
                    disabled={adding === bl.id}
                    className="w-full text-left px-4 py-3 rounded-lg border border-[--border]
                      hover:bg-[--paper-dark] hover:border-[--gold] transition-colors text-sm
                      disabled:opacity-50">
                    {adding === bl.id ? '添加中...' : bl.title}
                  </button>
                ))}
              </div>
            )}

            <Button variant="outline" size="sm" onClick={() => setOpen(false)} className="w-full mt-4">
              关闭
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
