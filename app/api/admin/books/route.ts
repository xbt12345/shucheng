import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-check'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    await requireAdmin(supabase)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'FORBIDDEN'
    return NextResponse.json({ error: msg }, { status: msg === 'UNAUTHORIZED' ? 401 : 403 })
  }

  const body = await request.json()
  const { title, author, category, description, coverUrl, fileUrl, publishedAt, isPublic } = body

  if (!title || !author || !category || !fileUrl) {
    return NextResponse.json({ error: '标题、作者、分类、文件路径必填' }, { status: 400 })
  }

  // Use admin client to bypass RLS for insert
  const admin = createAdminClient()
  const { data, error } = await admin.from('books').insert({
    title,
    author,
    category,
    description: description ?? null,
    cover_url: coverUrl ?? null,
    file_url: fileUrl,
    published_at: publishedAt ?? null,
    is_public: isPublic ?? true,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
