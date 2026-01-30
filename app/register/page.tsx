'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button, Input, Card } from '@/components/ui'
import { Navbar } from '@/components/layout/Navbar'
import { User, Mail, Lock, Phone, Calendar, ArrowRight, Flame, CheckCircle } from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  sessionsPerMonth: number
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [plans, setPlans] = useState<Plan[]>([])
  
  const [formData, setFormData] = useState({
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
    // プラン一覧を取得
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => setPlans(data.plans || []))
      .catch(console.error)
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
    <div className="min-h-screen pattern-grid">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-screen px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <Card variant="glass" className="p-8">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step >= s 
                      ? 'bg-gradient-to-r from-primary-500 to-accent-orange text-white' 
                      : 'bg-dark-700 text-dark-400'
                  }`}>
                    {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 h-1 mx-2 rounded ${step > s ? 'bg-primary-500' : 'bg-dark-700'}`} />
                  )}
                </div>
              ))}
            </div>

            {step === 1 && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-bebas)' }}>
                    CREATE ACCOUNT
                  </h1>
                  <p className="text-dark-400">基本情報を入力してください</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

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
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
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
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
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
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
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
                      className="input"
                    >
                      <option value="">性別を選択</option>
                      <option value="male">男性</option>
                      <option value="female">女性</option>
                      <option value="other">その他</option>
                    </select>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
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
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
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
                  <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-bebas)' }}>
                    SELECT PLAN
                  </h1>
                  <p className="text-dark-400">プランを選択してください</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div className="grid gap-4">
                    {plans.length > 0 ? plans.map((plan) => (
                      <label
                        key={plan.id}
                        className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.planId === plan.id
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-dark-600 hover:border-dark-500'
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
                            <h3 className="font-semibold text-white">{plan.name}</h3>
                            <p className="text-sm text-dark-400">
                              月{plan.sessionsPerMonth === 0 ? '無制限' : `${plan.sessionsPerMonth}回`}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-white">
                              ¥{plan.price.toLocaleString()}
                            </span>
                            <span className="text-dark-400">/月</span>
                          </div>
                        </div>
                      </label>
                    )) : (
                      <div className="text-center py-8 text-dark-400">
                        <p>プランを読み込み中...</p>
                        <p className="text-sm mt-2">（後からプランを選択することもできます）</p>
                      </div>
                    )}
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
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-bebas)' }}>
                  WELCOME TO BLAZE!
                </h1>
                <p className="text-dark-400 mb-8">
                  会員登録が完了しました。<br />
                  ログインしてトレーニングを始めましょう！
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
                <p className="text-dark-400">
                  既にアカウントをお持ちの方は{' '}
                  <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                    ログイン
                  </Link>
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
