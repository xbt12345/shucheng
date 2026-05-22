import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileTabs } from '@/components/profile/ProfileTabs'
import { EditProfileButton } from '@/components/profile/EditProfileButton'
import { redirect } from 'next/navigation'
import { calcStreak } from '@/lib/checkin'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '个人主页 — 儒典书城' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [
    { data: profile },
    { count: followerCount },
    { count: followingCount },
    { data: logs },
    { data: readingLogs },
    { data: highlights },
    { data: reviews },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
    supabase.from('reading_logs').select('logged_at').eq('user_id', user.id)
      .order('logged_at', { ascending: false }).limit(400),
    supabase.from('reading_logs')
      .select('id, book_id, logged_at, books(title, author, cover_url)')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(200),
    supabase.from('highlights')
      .select('id, text, note, color, created_at, books(title, author)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('comments')
      .select('id, content, rating, created_at, book_id, books(title, author, cover_url)')
      .eq('user_id', user.id)
      .is('highlight_id', null)
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  if (!profile) redirect('/auth/login')

  const streak = calcStreak((logs ?? []).map((l: { logged_at: string }) => l.logged_at))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="relative">
        <ProfileHeader
          profile={profile}
          followerCount={followerCount ?? 0}
          followingCount={followingCount ?? 0}
          streak={streak}
          isOwnProfile={true}
          isFollowing={false}
        />
        <div className="absolute top-4 right-4">
          <EditProfileButton profile={profile} />
        </div>
      </div>

      <ProfileTabs
        logs={(readingLogs ?? []) as any}
        highlights={(highlights ?? []) as any}
        reviews={(reviews ?? []) as any}
      />
    </div>
  )
}
