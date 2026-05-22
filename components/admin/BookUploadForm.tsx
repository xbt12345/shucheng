'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const CATEGORIES = ['儒', '释', '道', '史', '集']

// 生成安全的存储路径，避免中文/特殊字符导致 Invalid key 错误
function safeStoragePath(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const id = crypto.randomUUID()
  return `${id}.${ext}`
}

export function BookUploadForm() {
  const [form, setForm] = useState({
    title: '', author: '', category: '儒', description: '', publishedAt: '',
  })
  const [bookFile, setBookFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const uploadFile = async (file: File, bucket: string): Promise<string> => {
    const path = safeStoragePath(file)
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) throw new Error(error.message)
    return path
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookFile) { toast.error('书籍文件必须上传（epub 或 pdf）'); return }

    const ext = bookFile.name.split('.').pop()?.toLowerCase()
    if (ext !== 'epub' && ext !== 'pdf') {
      toast.error('仅支持 .epub 或 .pdf 格式')
      return
    }

    setUploading(true)
    try {
      const fileUrl = await uploadFile(bookFile, 'books')
      let coverUrl: string | null = null
      if (coverFile) {
        coverUrl = await uploadFile(coverFile, 'covers')
      }

      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, fileUrl, coverUrl }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error)
      }

      toast.success('书籍上传成功！')
      setForm({ title: '', author: '', category: '儒', description: '', publishedAt: '' })
      setBookFile(null)
      setCoverFile(null)
      ;(e.target as HTMLFormElement).reset()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '上传失败'
      toast.error('上传失败', { description: msg })
    }
    setUploading(false)
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label>书名 *</Label>
        <Input {...field('title')} placeholder="如：论语" required />
      </div>
      <div className="space-y-2">
        <Label>作者 *</Label>
        <Input {...field('author')} placeholder="如：孔子" required />
      </div>
      <div className="space-y-2">
        <Label>分类 *</Label>
        <select {...field('category')} className="w-full border border-[--border] rounded-md p-2 text-sm">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <Label>简介</Label>
        <textarea {...field('description')}
          className="w-full h-20 border border-[--border] rounded-md p-2 text-sm resize-none"
          placeholder="书籍简介" />
      </div>
      <div className="space-y-2">
        <Label>书籍文件 * <span className="text-xs text-muted-foreground ml-1">支持 .epub / .pdf</span></Label>
        <Input type="file" accept=".epub,.pdf"
          onChange={e => setBookFile(e.target.files?.[0] ?? null)} required />
        {bookFile && (
          <p className="text-xs text-muted-foreground">
            已选：{bookFile.name}（{(bookFile.size / 1024 / 1024).toFixed(1)} MB）
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>封面图片</Label>
        <Input type="file" accept="image/*"
          onChange={e => setCoverFile(e.target.files?.[0] ?? null)} />
      </div>
      <Button type="submit" disabled={uploading} className="w-full bg-[--ink] text-[--paper]">
        {uploading ? '上传中...' : '上传书籍'}
      </Button>
    </form>
  )
}
