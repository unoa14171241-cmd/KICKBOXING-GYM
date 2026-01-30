'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Card, Button, Input } from '@/components/ui'
import { Database, CheckCircle, AlertCircle, Loader } from 'lucide-react'

export default function SetupPage() {
  const [status, setStatus] = useState<{
    initialized: boolean
    counts?: {
      plans: number
      trainers: number
      products: number
      events: number
      users: number
    }
    error?: string
  } | null>(null)
  const [secretKey, setSecretKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  useEffect(() => {
    // 現在のステータスを取得
    fetch('/api/admin/seed')
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(err => setStatus({ initialized: false, error: err.message }))
  }, [])

  const handleSeed = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey }),
      })

      const data = await res.json()
      
      if (res.ok) {
        setResult({ success: true, message: data.message })
        // ステータスを再取得
        const statusRes = await fetch('/api/admin/seed')
        const statusData = await statusRes.json()
        setStatus(statusData)
      } else {
        setResult({ error: data.error })
      }
    } catch (err: any) {
      setResult({ error: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50 to-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
              <Database className="w-8 h-8 text-primary-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-bebas)' }}>
              システム初期設定
            </h1>
            <p className="text-gray-600">
              データベースの初期化とサンプルデータの投入を行います
            </p>
          </div>

          {/* ステータス表示 */}
          <Card className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">現在の状態</h2>
            
            {!status ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : status.error ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">データベース接続エラー</p>
                  <p className="text-sm">{status.error}</p>
                </div>
              </div>
            ) : status.initialized ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl text-green-700">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">初期化完了</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{status.counts?.plans || 0}</p>
                    <p className="text-sm text-gray-600">プラン</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{status.counts?.trainers || 0}</p>
                    <p className="text-sm text-gray-600">トレーナー</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{status.counts?.users || 0}</p>
                    <p className="text-sm text-gray-600">ユーザー</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{status.counts?.products || 0}</p>
                    <p className="text-sm text-gray-600">商品</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{status.counts?.events || 0}</p>
                    <p className="text-sm text-gray-600">イベント</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl text-yellow-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">未初期化 - 初期データの投入が必要です</span>
              </div>
            )}
          </Card>

          {/* 初期化フォーム */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">初期データ投入</h2>
            
            {result && (
              <div className={`mb-4 p-4 rounded-xl ${
                result.success 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {result.success ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {result.message}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {result.error}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="シークレットキー"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="初期化用のシークレットキーを入力"
              />
              <p className="text-sm text-gray-500">
                ※ デフォルトキー: <code className="bg-gray-100 px-2 py-1 rounded">kickboxing-gym-seed-2024</code>
              </p>
              <Button
                onClick={handleSeed}
                isLoading={isLoading}
                disabled={!secretKey}
                className="w-full"
              >
                初期データを投入
              </Button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-2">投入されるデータ:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 3つの料金プラン（ライト、スタンダード、プレミアム）</li>
                <li>• 管理者アカウント（admin@trim-gym.jp / admin123）</li>
                <li>• トレーナーアカウント（yamada@trim-gym.jp / trainer123）</li>
                <li>• トレーナーのスケジュール</li>
                <li>• サンプル商品（グローブ、バンテージ、Tシャツ）</li>
                <li>• サンプルイベント</li>
              </ul>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
