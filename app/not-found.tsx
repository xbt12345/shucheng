import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl mb-6 select-none">📜</div>
      <h1 className="text-3xl font-bold text-[--ink] mb-2">页面未找到</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        此页如空白卷轴，暂无内容。或已移至他处，或从未存在。
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button className="bg-[--ink] text-[--paper]">返回首页</Button>
        </Link>
        <Link href="/books">
          <Button variant="outline">浏览书库</Button>
        </Link>
      </div>
    </div>
  )
}
