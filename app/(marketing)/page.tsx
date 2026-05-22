import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const revalidate = 600

export const metadata: Metadata = {
  title: '儒典书城 — 传习经典，开启智慧',
  description: '专注儒释道与中国传统文化经典的社会化阅读平台。在线阅读《论语》《道德经》《金刚经》等经典，与读者共同标注、探讨。',
  openGraph: {
    title: '儒典书城 — 传习经典，开启智慧',
    description: '专注儒释道与中国传统文化经典的社会化阅读平台',
    type: 'website',
  },
}

const FEATURES = [
  { icon: '📖', title: '公版经典', desc: '儒释道史集五类，永久免费阅读' },
  { icon: '✏️', title: '共同标注', desc: '高亮画线，看见他人的解读视角' },
  { icon: '💬', title: '书评社区', desc: '写下感悟，与同道中人深度交流' },
  { icon: '📚', title: '个人书单', desc: '整理专属书单，记录阅读轨迹' },
]

export default async function LandingPage() {
  const supabase = await createClient()

  const [{ count: bookCount }, { count: userCount }, { count: highlightCount }] = await Promise.all([
    supabase.from('books').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('highlights').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: '部经典', value: bookCount ?? 0 },
    { label: '位读者', value: userCount ?? 0 },
    { label: '条标注', value: highlightCount ?? 0 },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16
        bg-gradient-to-b from-[--paper] to-[--paper-dark]">
        <div className="text-6xl mb-6 select-none">🏮</div>
        <h1 className="text-4xl sm:text-5xl font-bold text-[--ink] mb-3 tracking-wide">
          儒典书城
        </h1>
        <p className="text-xl text-[--gold] mb-4 tracking-widest">传习经典 · 开启智慧</p>
        <p className="text-gray-600 max-w-lg mb-10 leading-relaxed">
          专注儒释道与中国传统文化经典的社会化阅读平台。
          与读者共读，看见他人如何解读同一段话。
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/books">
            <Button size="lg" className="bg-[--ink] text-[--paper] hover:bg-[--gold] hover:text-[--ink]
              px-8 text-base">
              进入书库
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="lg" variant="outline"
              className="border-[--ink] text-[--ink] hover:bg-[--paper-dark] px-8 text-base">
              免费注册
            </Button>
          </Link>
        </div>

        {/* 统计数字 */}
        <div className="flex gap-10 mt-14">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-[--ink]">{s.value.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 功能特性 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[--ink] mb-10">为何选择儒典书城</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="text-center p-4">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-[--ink] mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 bg-[--paper-dark] text-center">
        <h2 className="text-2xl font-bold text-[--ink] mb-3">开始你的经典之旅</h2>
        <p className="text-gray-600 mb-6">《论语》《道德经》《金刚经》等，随时可读</p>
        <Link href="/books">
          <Button size="lg" className="bg-[--ink] text-[--paper] hover:bg-[--gold] hover:text-[--ink]">
            浏览书库 →
          </Button>
        </Link>
      </section>
    </div>
  )
}
