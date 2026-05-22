import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 200 })

  const { data } = await supabase
    .from('booklists')
    .select('id, title')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}
