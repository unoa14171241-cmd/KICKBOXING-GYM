'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, Button, Input } from '@/components/ui'
import { ArrowLeft, UserPlus } from 'lucide-react'
import Link from 'next/link'

interface Plan {
  id: string
  name: string
  price: number
  sessionsPerMonth: number
}

export default function NewMemberPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [plans, setPlans] = useState<Plan[]>([])

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    fetch('/api/admin/plans')
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

    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '会員登録に失敗しました')
      }

      router.push('/admin/members')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/members"
            className="inline-flex items-center gap-2 text-dark-500 hover:text-dark-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            会員管理に戻る
          </Link>
        </div>

        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-dark-900">新規会員登録</h1>
              <p className="text-dark-500">管理者による会員追加</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="姓"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              <Input
                label="名"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="セイ（カナ）"
                name="lastNameKana"
                value={formData.lastNameKana}
                onChange={handleChange}
              />
              <Input
                label="メイ（カナ）"
                name="firstNameKana"
                value={formData.firstNameKana}
                onChange={handleChange}
              />
            </div>

            <Input
              label="メールアドレス"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="パスワード"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="8文字以上"
              required
            />

            <Input
              label="電話番号"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="生年月日"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">性別</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-white border border-dark-200 rounded-xl px-4 py-3 text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  <option value="">選択してください</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">プラン</label>
              <select
                name="planId"
                value={formData.planId}
                onChange={handleChange}
                className="w-full bg-white border border-dark-200 rounded-xl px-4 py-3 text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="">プランを選択（任意）</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - ¥{plan.price.toLocaleString()}/月
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button type="submit" isLoading={isLoading} className="flex-1">
                <UserPlus className="w-5 h-5 mr-2" />
                会員を登録
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  )
}
