import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FollowButton } from './FollowButton'
import { getEarnedBadges } from '@/lib/checkin'

type Props = {
  profile: { id: string; username: string; bio: string | null; avatar_url: string | null }
  followerCount: number
  followingCount: number
  streak: number
  isOwnProfile: boolean
  isFollowing: boolean
}

export function ProfileHeader({ profile, followerCount, followingCount, streak, isOwnProfile, isFollowing }: Props) {
  const badges = getEarnedBadges(streak)

  return (
    <div className="bg-white border border-[--border] rounded-xl p-6 flex items-start gap-5">
      <Avatar className="w-16 h-16">
        <AvatarImage src={profile.avatar_url ?? undefined} />
        <AvatarFallback className="bg-[--paper-dark] text-[--ink] text-xl">
          {profile.username[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-[--ink]">{profile.username}</h1>
          {badges.map(b => (
            <span key={b.days} title={b.name} className="text-lg">{b.emoji}</span>
          ))}
          {!isOwnProfile && (
            <FollowButton targetUserId={profile.id} initialFollowing={isFollowing} />
          )}
        </div>
        {profile.bio && <p className="text-gray-600 text-sm mt-1">{profile.bio}</p>}
        <div className="flex gap-4 mt-3 text-sm text-gray-500">
          <span><strong className="text-[--ink]">{followerCount}</strong> 粉丝</span>
          <span><strong className="text-[--ink]">{followingCount}</strong> 关注</span>
          <span><strong className="text-[--gold]">{streak}</strong> 天连续打卡</span>
        </div>
      </div>
    </div>
  )
}
