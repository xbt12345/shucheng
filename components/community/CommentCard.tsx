import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Comment = {
  id: string
  content: string
  rating: number | null
  like_count: number
  created_at: string
  profiles: { username: string; avatar_url: string | null }
}

export function CommentCard({ comment }: { comment: Comment }) {
  const date = new Date(comment.created_at).toLocaleDateString('zh-CN')

  return (
    <div className="py-4 border-b border-[--border] last:border-0">
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.profiles.avatar_url ?? undefined} />
          <AvatarFallback className="bg-[--paper-dark] text-[--ink] text-xs">
            {comment.profiles.username[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-[--ink]">{comment.profiles.username}</span>
            {comment.rating && (
              <span className="text-[--gold] text-sm">{'★'.repeat(comment.rating)}</span>
            )}
            <span className="text-xs text-gray-400 ml-auto">{date}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
        </div>
      </div>
    </div>
  )
}
