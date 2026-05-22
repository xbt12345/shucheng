import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

/** 将 Storage 相对路径转换为完整 URL */
export function coverSrc(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${SUPABASE_URL}/storage/v1/object/public/covers/${path}`
}

/** 将 Storage books bucket 路径转换为完整 URL */
export function bookFileSrc(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${SUPABASE_URL}/storage/v1/object/public/books/${path}`
}

/** 格式化日期为中文短日期 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

export const CATEGORY_COLORS: Record<string, string> = {
  儒: 'bg-amber-100 text-amber-800',
  释: 'bg-purple-100 text-purple-800',
  道: 'bg-teal-100 text-teal-800',
  史: 'bg-blue-100 text-blue-800',
  集: 'bg-rose-100 text-rose-800',
}

