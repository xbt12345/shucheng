import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CATEGORY_COLORS } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '书籍管理 — 后台' }

export default async function AdminBooksPage() {
  const supabase = await createClient()

  const { data: books } = await supabase
    .from('books')
    .select('id, title, author, category, view_count, created_at, file_url, is_public')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[--ink]">书籍管理</h1>
        <Link href="/admin/books/upload"
          className="px-4 py-2 bg-[--ink] text-[--paper] text-sm rounded-lg hover:bg-[--gold] hover:text-[--ink] transition-colors">
          + 上传书籍
        </Link>
      </div>

      <div className="bg-white border border-[--border] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[--paper-dark] border-b border-[--border]">
                <th className="text-left px-4 py-3 font-medium text-gray-600">书名</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">作者</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">分类</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">阅读量</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">状态</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">上传时间</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {(books ?? []).map((book, i) => (
                <tr key={book.id}
                  className={`border-b border-[--border] last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-3">
                    <Link href={`/books/${book.id}`}
                      className="font-medium text-[--ink] hover:text-[--gold] transition-colors">
                      {book.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{book.author}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[book.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {book.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {book.view_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {book.file_url ? (
                      <span className="text-green-600 text-xs">✓ 有文件</span>
                    ) : (
                      <span className="text-gray-400 text-xs">无文件</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(book.created_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/books/${book.id}`}
                      className="text-xs text-[--gold] hover:underline">
                      查看
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(books ?? []).length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>暂无书籍，去上传第一本吧</p>
          </div>
        )}
      </div>
    </div>
  )
}
