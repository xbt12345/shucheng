export default function DiscoverLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-14 animate-pulse">
      <div className="space-y-3">
        <div className="h-5 w-20 bg-gray-200 rounded" />
        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded-full" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-5 w-20 bg-gray-200 rounded" />
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-28 space-y-2 shrink-0">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg" />
              <div className="h-3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
