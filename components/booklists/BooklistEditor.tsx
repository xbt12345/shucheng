'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

function coverSrc(path: string | null | undefined) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${SUPABASE_URL}/storage/v1/object/public/covers/${path}`
}

type Book = { id: string; title: string; author: string; cover_url: string | null }
type Item = { book_id: string; order_num: number; books: Book }
type Booklist = { id: string; title: string; description: string | null; is_public: boolean }

export function BooklistEditor({ booklist, items }: { booklist: Booklist; items: Item[] }) {
  const router = useRouter()
  const [title, setTitle] = useState(booklist.title)
  const [description, setDescription] = useState(booklist.description ?? '')
  const [isPublic, setIsPublic] = useState(booklist.is_public)
  const [list, setList] = useState<Item[]>(items)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  const moveUp = (index: number) => {
    if (index === 0) return
    const next = [...list]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    setList(next)
  }

  const moveDown = (index: number) => {
    if (index === list.length - 1) return
    const next = [...list]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    setList(next)
  }

  const removeBook = async (bookId: string) => {
    setRemoving(bookId)
    const res = await fetch(`/api/booklists/items?booklistId=${booklist.id}&bookId=${bookId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setList(prev => prev.filter(i => i.book_id !== bookId))
      toast.success('已移除')
    } else {
      toast.error('移除失败')
    }
    setRemoving(null)
  }

  const handleSave = async () => {
    setSaving(true)

    // 更新书单信息
    const infoRes = await fetch(`/api/booklists/${booklist.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        is_public: isPublic,
      }),
    })

    // 更新排序
    const orderRes = await fetch('/api/booklists/items/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booklistId: booklist.id,
        order: list.map((item, i) => ({ bookId: item.book_id, orderNum: i + 1 })),
      }),
    })

    if (infoRes.ok && orderRes.ok) {
      toast.success('书单已保存')
      router.push(`/booklists/${booklist.id}`)
      router.refresh()
    } else {
      toast.error('保存失败，请重试')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      {/* 顶部 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[--ink]">编辑书单</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>取消</Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !title.trim()}
            className="bg-[--ink] text-[--paper]">
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="bg-white border border-[--border] rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">基本信息</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">书单名称</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={60}
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
            className="w-full border border-[--border] rounded-lg px-3 py-2 text-sm
              resize-none focus:outline-none focus:ring-1 focus:ring-[--gold]"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)}
            className="w-4 h-4 accent-amber-700" />
          <span className="text-sm text-gray-700">公开书单</span>
        </label>
      </div>

      {/* 书籍列表 */}
      <div className="bg-white border border-[--border] rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
          书籍列表 ({list.length} 本)
        </h2>

        {list.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">书单暂无书籍</p>
        ) : (
          <div className="space-y-2">
            {list.map((item, index) => {
              const book = item.books
              const url = coverSrc(book?.cover_url)
              return (
                <div key={item.book_id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[--border]
                    hover:bg-[--paper-dark] transition-colors group">
                  {/* 排序按钮 */}
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveUp(index)} disabled={index === 0}
                      className="text-gray-300 hover:text-[--ink] disabled:opacity-30 text-xs leading-none">
                      ▲
                    </button>
                    <button onClick={() => moveDown(index)} disabled={index === list.length - 1}
                      className="text-gray-300 hover:text-[--ink] disabled:opacity-30 text-xs leading-none">
                      ▼
                    </button>
                  </div>

                  {/* 序号 */}
                  <span className="text-sm text-gray-400 w-5 text-center shrink-0">{index + 1}</span>

                  {/* 封面 */}
                  <div className="w-9 h-12 rounded overflow-hidden bg-[--paper-dark] shrink-0">
                    {url
                      ? <img src={url} alt={book?.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">📖</div>
                    }
                  </div>

                  {/* 书名 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[--ink] line-clamp-1">{book?.title}</p>
                    <p className="text-xs text-gray-400">{book?.author}</p>
                  </div>

                  {/* 移除 */}
                  <button
                    onClick={() => removeBook(item.book_id)}
                    disabled={removing === item.book_id}
                    className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100
                      transition-opacity disabled:opacity-50 shrink-0">
                    {removing === item.book_id ? '移除中' : '移除'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
