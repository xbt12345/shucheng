import { createClient } from '@/lib/supabase/server'
import { ReviewQueue } from '@/components/admin/ReviewQueue'

export default async function ReviewsPage() {
  const supabase = await createClient()

  const { data: comments } = await supabase
    .from('comments')
    .select('id, content, created_at, profiles(username), books(title)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[--ink] mb-6">评论审核</h1>
      <ReviewQueue initialComments={(comments as any) ?? []} />
    </div>
  )
}
