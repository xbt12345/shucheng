'use client'

/**
 * 统一封面图片组件
 * - Supabase Storage: 用 Next.js Image（优化）
 * - 外链（openlibrary 等）: 用 <img>（跟随重定向，不走优化）
 * - 无封面: 首字艺术占位
 */

import Image from 'next/image'

const CAT_BG: Record<string, string> = {
  儒: '#78350f',
  释: '#581c87',
  道: '#134e4a',
  史: '#1e3a5f',
  集: '#881337',
  哲: '#312e81',
  文: '#064e3b',
}

type Props = {
  src: string | null | undefined
  alt: string
  category?: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
}

function isSupabase(url: string) {
  return url.includes('supabase.co')
}

export function BookCover({ src, alt, category = '', className = '', fill, width = 160, height = 213, priority }: Props) {
  const bg = CAT_BG[category] ?? '#3d2c1e'
  const firstChar = alt?.[0] ?? '典'

  if (!src) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}
        style={{ backgroundColor: bg }}>
        <span className="font-bold text-white/90 font-serif"
          style={{ fontSize: Math.min(width, height) * 0.28 }}>
          {firstChar}
        </span>
        <span className="text-white/40 text-center px-1 leading-tight mt-1"
          style={{ fontSize: Math.max(8, Math.min(width, height) * 0.07) }}>
          {alt}
        </span>
      </div>
    )
  }

  if (isSupabase(src)) {
    return fill ? (
      <Image src={src} alt={alt} fill className={`object-cover ${className}`} priority={priority} />
    ) : (
      <Image src={src} alt={alt} width={width} height={height}
        className={`object-cover ${className}`} priority={priority} />
    )
  }

  // 外链图片：普通 img 标签，浏览器自动跟随重定向
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      className={`object-cover ${className}`}
      style={fill ? { width: '100%', height: '100%', position: 'absolute', inset: 0 } : { width, height }}
      onError={(e) => {
        // 图片加载失败时换成占位背景
        const el = e.currentTarget
        el.style.display = 'none'
        const parent = el.parentElement
        if (parent) {
          parent.style.backgroundColor = bg
          parent.innerHTML = `<span style="color:rgba(255,255,255,0.85);font-size:${Math.min(width, height) * 0.28}px;font-family:serif;font-weight:bold">${firstChar}</span>`
        }
      }}
    />
  )
}
