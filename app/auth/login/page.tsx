import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-[--border]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">登录儒典书城</CardTitle>
          <p className="text-sm text-gray-500">
            还没有账号？
            <Link href="/auth/register" className="text-[--gold] hover:underline ml-1">
              免费注册
            </Link>
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
