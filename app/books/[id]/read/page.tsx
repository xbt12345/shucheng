import { createClient } from '@/lib/supabase/server'
import { EpubReader } from '@/components/reader/EpubReader'
import { PdfReader } from '@/components/reader/PdfReader'
import { notFound, redirect } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

export default async function ReadPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirectTo=/books/${id}/read`)

  const { data: book } = await supabase
    .from('books').select('id, title, file_url').eq('id', id).single()
  if (!book || !book.file_url) notFound()

  const { data: { publicUrl } } = supabase.storage
    .from('books').getPublicUrl(book.file_url)

  const isPdf = book.file_url.toLowerCase().endsWith('.pdf')

  if (isPdf) {
    return <PdfReader pdfUrl={publicUrl} bookId={id} bookTitle={book.title} />
  }

  // epub 路径
  const { data: log } = await supabase
    .from('reading_logs')
    .select('progress_cfi')
    .eq('user_id', user.id)
    .eq('book_id', id)
    .order('logged_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <EpubReader
      epubUrl={publicUrl}
      bookId={id}
      initialCfi={log?.progress_cfi ?? undefined}
    />
  )
}
