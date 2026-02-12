'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, Button, Input } from '@/components/ui'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
}

interface Store {
  id: string
  name: string
}

interface MemberForm {
  firstName: string
  lastName: string
  firstNameKana: string
  lastNameKana: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  planId: string
  storeId: string
  status: string
  remainingSessions: number
}

export default function EditMemberPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<MemberForm>({
    firstName: '',
    lastName: '',
    firstNameKana: '',
    lastNameKana: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    planId: '',
    storeId: '',
    status: 'active',
    remainingSessions: 0,
  })

  useEffect(() => {
    if (params.id) {
      Promise.all([fetchMember(), fetchPlans(), fetchStores()])
    }
  }, [params.id])

  const fetchMember = async () => {
    try {
      const res = await fetch(`/api/admin/members/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          firstNameKana: data.firstNameKana || '',
          lastNameKana: data.lastNameKana || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
          gender: data.gender || '',
          address: data.address || '',
          emergencyContact: data.emergencyContact || '',
          emergencyPhone: data.emergencyPhone || '',
          planId: data.plan?.id || '',
          storeId: data.store?.id || '',
          status: data.status || 'active',
          remainingSessions: data.remainingSessions || 0,
        })
      }
    } catch (error) {
      console.error(error)
      setError('会員情報の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans?category=membership')
      if (res.ok) {
        const data = await res.json()
        setPlans(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores')
      if (res.ok) {
        const data = await res.json()
        setStores(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'remainingSessions' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      const res = await fetch(`/api/admin/members/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSuccess('会員情報を更新しました')
        setTimeout(() => {
          router.push(`/admin/members/${params.id}`)
        }, 1500)
      } else {
        const data = await res.json()
        setError(data.error || '更新に失敗しました')
      }
    } catch (error) {
      setError('更新中にエラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/admin/members/${params.id}`} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-bebas)' }}>
              会員編集
            </h1>
            <p className="text-gray-500">会員情報を編集します</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-600 mb-6">
              {success}
            </div>
          )}

          {/* 基本情報 */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓</label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名</label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">セイ（カナ）</label>
                <Input
                  name="lastNameKana"
                  value={formData.lastNameKana}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メイ（カナ）</label>
                <Input
                  name="firstNameKana"
                  value={formData.firstNameKana}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">選択してください</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
              </div>
            </div>
          </Card>

          {/* 連絡先 */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">連絡先</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          {/* 緊急連絡先 */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">緊急連絡先</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">氏名</label>
                <Input
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                <Input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          {/* プラン・ステータス */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">プラン・ステータス</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所属店舗</label>
                <select
                  name="storeId"
                  value={formData.storeId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">店舗を選択してください</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">プラン</label>
                <select
                  name="planId"
                  value={formData.planId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">プランなし</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ¥{plan.price.toLocaleString()}/月
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">アクティブ</option>
                  <option value="suspended">休会中</option>
                  <option value="cancelled">退会</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">残りセッション数</label>
                <Input
                  type="number"
                  name="remainingSessions"
                  value={formData.remainingSessions}
                  onChange={handleChange}
                  min={0}
                />
              </div>
            </div>
          </Card>

          {/* 送信ボタン */}
          <div className="flex gap-4">
            <Link href={`/admin/members/${params.id}`} className="flex-1">
              <Button type="button" variant="secondary" className="w-full">
                キャンセル
              </Button>
            </Link>
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  保存
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
