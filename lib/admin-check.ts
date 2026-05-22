import type { SupabaseClient } from '@supabase/supabase-js'

export async function requireAdmin(supabase: SupabaseClient): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHORIZED')

  const role = user.user_metadata?.role
  if (role !== 'admin') throw new Error('FORBIDDEN')

  return user.id
}
