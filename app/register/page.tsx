'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button, Input, Card } from '@/components/ui'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { User, Mail, Lock, Phone, Calendar, ArrowRight, Flame, CheckCircle, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  sessionsPerMonth: number
  category: string
  features: string[]
}

interface Store {
  id: string
  name: string
  code: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [plans, setPlans] = useState<Plan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [plansError, setPlansError] = useState('')

  const [stores, setStores] = useState<Store[]>([])

  const [formData, setFormData] = useState({
    storeId: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    firstNameKana: '',
    lastNameKana: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    planId: '',
  })

  useEffect(() => {
    // 通常会員プラン一覧を取得
    setPlansLoading(true)
    setPlansError('')
    fetch('/api/plans?category=membership')
      .then(res => {
        if (!res.ok) throw new Error('プランの取得に失敗しました')
        return res.json()
      })
      .then(data => {
        setPlans(data)
        setPlansLoading(false)
      })
      .catch(err => {
        console.error(err)
        setPlansError('プランを読み込めませんでした。プランなしで登録を続けることができます。')
        setPlansLoading(false)
      })


    // 店舗一覧を取得
    fetch('/api/stores')
      .then(res => res.json())
      .then(data => setStores(data))
      .catch(err => console.error('店舗取得エラー:', err))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません')
      setIsLoading(false)
      return
    }

    if (!formData.storeId) {
      setError('利用店舗を選択してください')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      setStep(3) // 完了ステップへ
    } catch (err: any) {
      setError(err.message || '登録中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <Navbar />

      <div className="flex items-center justify-center min-h-screen px-4 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <Card className="p-8 shadow-xl">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${step >= s
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                    }`}>
                    {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 h-1 mx-2 rounded ${step > s ? 'bg-primary-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {step === 1 && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-500 flex items-center justify-center">
                    <Flame className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-bebas)' }}>
                    会員登録
                  </h1>
                  <p className="text-gray-500">基本情報を入力してください</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                      {error}
                    </div>
                  )}



                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">利用店舗 *</label>
                    <select
                      name="storeId"
                      value={formData.storeId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">店舗を選択してください</option>
                      {stores.map(store => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="lastName"
                      placeholder="姓"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      name="firstName"
                      placeholder="名"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="lastNameKana"
                      placeholder="セイ（カナ）"
                      value={formData.lastNameKana}
                      onChange={handleChange}
                    />
                    <Input
                      name="firstNameKana"
                      placeholder="メイ（カナ）"
                      value={formData.firstNameKana}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="メールアドレス"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-12"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="電話番号"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-12"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="pl-12"
                      />
                    </div>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">性別を選択</option>
                      <option value="male">男性</option>
                      <option value="female">女性</option>
                      <option value="other">その他</option>
                    </select>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      name="password"
                      placeholder="パスワード（8文字以上）"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-12"
                      minLength={8}
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="パスワード（確認）"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-12"
                      minLength={8}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    次へ
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-bebas)' }}>
                    プラン選択
                  </h1>
                  <p className="text-gray-500">ご希望のプランを選択してください</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    {plansLoading ? (
                      <div className="text-center py-8 text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                        <p>プランを読み込み中...</p>
                      </div>
                    ) : plans.length > 0 ? (
                      plans.map((plan) => (
                        <label
                          key={plan.id}
                          className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.planId === plan.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                        >
                          <input
                            type="radio"
                            name="planId"
                            value={plan.id}
                            checked={formData.planId === plan.id}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                              <p className="text-sm text-gray-500">
                                {plan.sessionsPerMonth === 0 ? '無制限' : `月${plan.sessionsPerMonth}回`}
                              </p>
                              {plan.description && (
                                <p className="text-xs text-gray-400 mt-1">{plan.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-bold text-gray-900">
                                {formatCurrency(plan.price)}
                              </span>
                              <span className="text-gray-500 text-sm">/月</span>
                            </div>
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {plansError && (
                          <p className="text-yellow-600 mb-2">{plansError}</p>
                        )}
                        <p>プランは後から選択できます</p>
                        <p className="text-sm mt-2">まずはアカウントを作成しましょう</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
                    <p className="font-medium text-gray-700 mb-2">入会金について</p>
                    <p>入会金 ¥15,000 が別途必要です。</p>
                    <p className="text-primary-600 font-medium">体験当日のご入会で入会金半額！</p>
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">
                      戻る
                    </Button>
                    <Button type="submit" className="flex-1" isLoading={isLoading}>
                      登録する
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </form>
              </>
            )}

            {step === 3 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-bebas)' }}>
                  登録完了！
                </h1>
                <p className="text-gray-600 mb-8">
                  会員登録が完了しました。<br />
                  ログインしてマイページをご確認ください。
                </p>
                <Link href="/login">
                  <Button>
                    ログインする
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            )}

            {step < 3 && (
              <div className="mt-8 text-center">
                <p className="text-gray-500">
                  既にアカウントをお持ちの方は{' '}
                  <Link href="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                    ログイン
                  </Link>
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
