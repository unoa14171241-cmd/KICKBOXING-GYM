'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Button, Input, Badge } from '@/components/ui'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  QrCode, CheckCircle, XCircle, User, Clock, 
  Camera, Keyboard, RefreshCw
} from 'lucide-react'

interface CheckInResult {
  action: 'checkin' | 'checkout'
  message: string
  member: {
    name: string
    memberNumber: string
    plan?: string
  }
  checkedInAt?: string
  checkedOutAt?: string
}

interface RecentCheckIn {
  id: string
  memberName: string
  memberNumber: string
  time: string
  action: 'in' | 'out'
}

export default function CheckInPage() {
  const [qrCode, setQrCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const [error, setError] = useState('')
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // フォーカスを維持
    inputRef.current?.focus()
  }, [result, error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qrCode.trim() || isProcessing) return

    setIsProcessing(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: qrCode.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      setResult(data)
      
      // 最近のチェックインに追加
      setRecentCheckIns(prev => [
        {
          id: Date.now().toString(),
          memberName: data.member.name,
          memberNumber: data.member.memberNumber,
          time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
          action: data.action === 'checkin' ? 'in' : 'out',
        },
        ...prev.slice(0, 9),
      ])

      // 3秒後にリセット
      setTimeout(() => {
        setResult(null)
        setQrCode('')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'チェックイン処理に失敗しました')
      setTimeout(() => {
        setError('')
        setQrCode('')
      }, 3000)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-bebas)' }}>
            CHECK-IN STATION
          </h1>
          <p className="text-dark-400">会員証をスキャンしてチェックイン/アウト</p>
        </div>

        {/* Main Scanner Area */}
        <Card variant="glass" className="text-center py-12">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                  result.action === 'checkin' ? 'bg-green-500/20' : 'bg-blue-500/20'
                }`}>
                  <CheckCircle className={`w-12 h-12 ${
                    result.action === 'checkin' ? 'text-green-500' : 'text-blue-500'
                  }`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {result.action === 'checkin' ? 'チェックイン完了' : 'チェックアウト完了'}
                  </h2>
                  <p className="text-xl text-white">{result.member.name}</p>
                  <p className="text-dark-400">{result.member.memberNumber}</p>
                  {result.member.plan && (
                    <Badge variant="info" className="mt-2">{result.member.plan}</Badge>
                  )}
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">エラー</h2>
                  <p className="text-red-400">{error}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="scanner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-primary-500/20 flex items-center justify-center animate-pulse">
                  <QrCode className="w-12 h-12 text-primary-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    会員証をスキャンしてください
                  </h2>
                  <p className="text-dark-400 text-sm">
                    QRコードリーダーで読み取るか、会員番号を入力
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Manual Input */}
          <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Keyboard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                <Input
                  ref={inputRef}
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="QRコード / 会員番号"
                  className="pl-12"
                  autoFocus
                />
              </div>
              <Button type="submit" isLoading={isProcessing}>
                確認
              </Button>
            </div>
          </form>
        </Card>

        {/* Recent Check-ins */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              最近のチェックイン
            </h2>
            <button
              onClick={() => setRecentCheckIns([])}
              className="text-dark-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {recentCheckIns.length > 0 ? (
            <div className="space-y-2">
              {recentCheckIns.map((checkIn) => (
                <motion.div
                  key={checkIn.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      checkIn.action === 'in' ? 'bg-green-500/20' : 'bg-blue-500/20'
                    }`}>
                      <User className={`w-5 h-5 ${
                        checkIn.action === 'in' ? 'text-green-500' : 'text-blue-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{checkIn.memberName}</p>
                      <p className="text-xs text-dark-400">{checkIn.memberNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={checkIn.action === 'in' ? 'success' : 'info'}>
                      {checkIn.action === 'in' ? 'IN' : 'OUT'}
                    </Badge>
                    <p className="text-xs text-dark-400 mt-1">{checkIn.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400">まだチェックイン履歴がありません</p>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}
