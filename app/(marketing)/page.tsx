import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-[--ink] mb-4">
        儒典书城
      </h1>
      <p className="text-xl text-[--gold] mb-2">传习经典 · 开启智慧</p>
      <p className="text-gray-600 max-w-md mb-8">
        专注儒释道与中国传统文化经典的社会化阅读平台。
        与千万读者共读，看见他人如何解读同一段话。
      </p>
      <div className="flex gap-4">
        <Link href="/books">
          <Button size="lg" className="bg-[--ink] text-[--paper] hover:bg-[--gold] hover:text-[--ink]">
            进入书库
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button size="lg" variant="outline"
            className="border-[--ink] text-[--ink] hover:bg-[--paper-dark]">
            免费注册
          </Button>
        </Link>
      </div>
    </div>
  )
}
