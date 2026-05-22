import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { redirect } from 'next/navigation'
import { calcStreak } from '@/lib/checkin'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { count: followerCount }, { count: followingCount }, { data: logs }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
      supabase.from('reading_logs').select('logged_at').eq('user_id', user.id)
        .order('logged_at', { ascending: false }).limit(400),
    ])

  if (!profile) redirect('/auth/login')

  const streak = calcStreak((logs ?? []).map((l: { logged_at: string }) => l.logged_at))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <ProfileHeader
        profile={profile}
        followerCount={followerCount ?? 0}
        followingCount={followingCount ?? 0}
        streak={streak}
        isOwnProfile={true}
        isFollowing={false}
      />
    </div>
  )
}
