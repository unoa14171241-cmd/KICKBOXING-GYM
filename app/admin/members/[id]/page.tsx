'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, Badge, Button } from '@/components/ui'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  ArrowLeft, Edit, Mail, Phone, Calendar, 
  CreditCard, Clock, User, MapPin, AlertCircle
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Member {
  id: string
  firstName: string
  lastName: string
  firstNameKana: string
  lastNameKana: string
  email: string
  phone: string
  memberNumber: string
  status: string
  remainingSessions: number
  joinedAt: string
  dateOfBirth: string | null
  gender: string | null
  address: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  plan: {
    id: string
    name: string
    price: number
  } | null
}

export default function MemberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchMember()
    }
  }, [params.id])

  const fetchMember = async () => {
    try {
      const res = await fetch(`/api/admin/members/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setMember(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
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

  if (!member) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">会員が見つかりません</p>
          <Link href="/admin/members">
            <Button variant="secondary" className="mt-4">
              会員一覧に戻る
            </Button>
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/members" className="p-2 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-bebas)' }}>
                {member.lastName} {member.firstName}
              </h1>
              <p className="text-gray-500">{member.lastNameKana} {member.firstNameKana}</p>
            </div>
          </div>
          <Link href={`/admin/members/${member.id}/edit`}>
            <Button>
              <Edit className="w-5 h-5 mr-2" />
              編集
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 基本情報 */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              基本情報
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">会員番号</span>
                <span className="font-mono text-gray-900">{member.memberNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ステータス</span>
                <Badge status={member.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">入会日</span>
                <span className="text-gray-900">{formatDate(member.joinedAt)}</span>
              </div>
              {member.dateOfBirth && (
                <div className="flex justify-between">
                  <span className="text-gray-500">生年月日</span>
                  <span className="text-gray-900">{formatDate(member.dateOfBirth)}</span>
                </div>
              )}
              {member.gender && (
                <div className="flex justify-between">
                  <span className="text-gray-500">性別</span>
                  <span className="text-gray-900">
                    {member.gender === 'male' ? '男性' : member.gender === 'female' ? '女性' : 'その他'}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* 連絡先 */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary-500" />
              連絡先
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">メール</span>
                <a href={`mailto:${member.email}`} className="text-primary-600 hover:underline">
                  {member.email}
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">電話番号</span>
                <a href={`tel:${member.phone}`} className="text-primary-600 hover:underline">
                  {member.phone}
                </a>
              </div>
              {member.address && (
                <div className="flex justify-between">
                  <span className="text-gray-500">住所</span>
                  <span className="text-gray-900">{member.address}</span>
                </div>
              )}
            </div>
          </Card>

          {/* プラン情報 */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary-500" />
              プラン情報
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">プラン</span>
                <span className="text-gray-900">{member.plan?.name || '未設定'}</span>
              </div>
              {member.plan && (
                <div className="flex justify-between">
                  <span className="text-gray-500">月額</span>
                  <span className="text-gray-900">{formatCurrency(member.plan.price)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">残りセッション</span>
                <span className="text-gray-900">{member.remainingSessions}回</span>
              </div>
            </div>
          </Card>

          {/* 緊急連絡先 */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary-500" />
              緊急連絡先
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">氏名</span>
                <span className="text-gray-900">{member.emergencyContact || '未設定'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">電話番号</span>
                <span className="text-gray-900">{member.emergencyPhone || '未設定'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
