import { BookUploadForm } from '@/components/admin/BookUploadForm'

export default function UploadBookPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[--ink] mb-6">上传书籍</h1>
      <BookUploadForm />
    </div>
  )
}
