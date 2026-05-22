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
    <div className="px-6 py-5 hover:bg-[--paper-dark]/20 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar className="w-9 h-9 shrink-0">
          <AvatarImage src={comment.profiles.avatar_url ?? undefined} />
          <AvatarFallback className="bg-[--paper-dark] text-[--ink] text-sm font-bold">
            {comment.profiles.username[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-sm font-bold text-[--ink]">{comment.profiles.username}</span>
            {comment.rating && (
              <span className="flex">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={`text-sm ${s <= comment.rating! ? 'text-[--gold]' : 'text-gray-200'}`}>
                    ★
                  </span>
                ))}
              </span>
            )}
            <span className="text-xs text-gray-400 ml-auto">{date}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
        </div>
      </div>
    </div>
  )
}
