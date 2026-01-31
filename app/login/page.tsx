'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button, Input, Card } from '@/components/ui'
import { Navbar } from '@/components/layout/Navbar'
import { Mail, Lock, ArrowRight, Flame } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        // セッションを取得して役割に応じてリダイレクト
        const session = await getSession()
        if (session?.user?.role === 'owner' || session?.user?.role === 'trainer') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
        router.refresh()
      }
    } catch (err) {
      setError('ログイン中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50 to-white">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-screen px-4 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-500 flex items-center justify-center">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-bebas)' }}>
                WELCOME BACK
              </h1>
              <p className="text-gray-500">アカウントにログイン</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" className="rounded border-gray-300 bg-white text-primary-500" />
                  ログイン状態を保持
                </label>
                <Link href="/forgot-password" className="text-primary-500 hover:text-primary-600">
                  パスワードを忘れた方
                </Link>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                ログイン
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500">
                アカウントをお持ちでない方は{' '}
                <Link href="/register" className="text-primary-500 hover:text-primary-600 font-medium">
                  新規登録
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
