import { RegisterForm } from '@/components/auth/RegisterForm'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-[--border]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">加入儒典书城</CardTitle>
          <p className="text-sm text-gray-500">
            已有账号？
            <Link href="/auth/login" className="text-[--gold] hover:underline ml-1">
              直接登录
            </Link>
          </p>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  )
}
