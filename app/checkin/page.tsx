'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Card, Button } from '@/components/ui'
import { CheckCircle, XCircle, LogIn, Loader, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SelfCheckInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [checkInStatus, setCheckInStatus] = useState<'loading' | 'success' | 'checkout' | 'error' | 'not-member'>('loading')
  const [message, setMessage] = useState('')
  const [memberName, setMemberName] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      // 未ログインの場合はログインページへ（チェックインページに戻るよう設定）
      router.push('/login?callbackUrl=/checkin')
      return
    }

    if (session.user.role !== 'member') {
      setCheckInStatus('not-member')
      setMessage('会員アカウントでログインしてください')
      return
    }

    // 自動チェックイン処理
    performCheckIn()
  }, [session, status])

  const performCheckIn = async () => {
    try {
      const res = await fetch('/api/checkin/self', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'チェックインに失敗しました')
      }

      setMemberName(data.member.name)
      
      if (data.action === 'checkin') {
        setCheckInStatus('success')
        setMessage('チェックインしました！')
      } else {
        setCheckInStatus('checkout')
        setMessage('チェックアウトしました！')
      }
    } catch (err: any) {
      setCheckInStatus('error')
      setMessage(err.message)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-primary-50 to-white flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-primary-50 to-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4 pt-20">
          <Card className="max-w-md w-full text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
              <LogIn className="w-10 h-10 text-primary-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ログインが必要です</h1>
            <p className="text-gray-600 mb-6">
              チェックインするにはログインしてください
            </p>
            <Link href="/login?callbackUrl=/checkin">
              <Button className="w-full">
                ログインする
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50 to-white">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-screen px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="text-center py-12">
            {checkInStatus === 'loading' && (
              <>
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
                  <Loader className="w-12 h-12 animate-spin text-primary-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">処理中...</h1>
                <p className="text-gray-600">チェックイン処理を行っています</p>
              </>
            )}

            {checkInStatus === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-green-600 mb-2">CHECK IN</h1>
                <p className="text-xl text-gray-900 mb-2">{memberName} 様</p>
                <p className="text-gray-600 mb-6">{message}</p>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </motion.div>
            )}

            {checkInStatus === 'checkout' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold text-blue-600 mb-2">CHECK OUT</h1>
                <p className="text-xl text-gray-900 mb-2">{memberName} 様</p>
                <p className="text-gray-600 mb-6">{message}</p>
                <p className="text-sm text-gray-500">
                  お疲れさまでした！またのご来店をお待ちしております。
                </p>
              </motion.div>
            )}

            {checkInStatus === 'error' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-red-600 mb-2">エラー</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <Button onClick={performCheckIn} variant="secondary">
                  再試行
                </Button>
              </motion.div>
            )}

            {checkInStatus === 'not-member' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-yellow-100 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-yellow-500" />
                </div>
                <h1 className="text-2xl font-bold text-yellow-600 mb-2">会員専用</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link href="/">
                  <Button variant="secondary">トップページへ</Button>
                </Link>
              </motion.div>
            )}

            {(checkInStatus === 'success' || checkInStatus === 'checkout') && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <Link href="/dashboard">
                  <Button variant="secondary" className="w-full">
                    マイページへ
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
