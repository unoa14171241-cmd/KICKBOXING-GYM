'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Card, Button, Input, Badge } from '@/components/ui'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { User, Mail, Phone, Calendar, MapPin, Save } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Member {
  firstName: string
  lastName: string
  firstNameKana: string
  lastNameKana: string
  phone: string
  dateOfBirth: string | null
  gender: string | null
  address: string | null
  memberNumber: string
  status: string
  joinedAt: string
  plan: {
    name: string
  } | null
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetch('/api/members/me')
        .then(res => res.json())
        .then(data => {
          setMember(data.member)
          setIsLoading(false)
        })
        .catch(err => {
          console.error(err)
          setIsLoading(false)
        })
    }
  }, [session])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
        </div>
      </DashboardLayout>
    )
  }

  if (!member) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-dark-400">会員情報を取得できませんでした</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-bebas)' }}>
            PROFILE
          </h1>
          <p className="text-dark-400">プロフィール設定</p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-8 border-b border-dark-700">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-orange/20 flex items-center justify-center">
                <User className="w-12 h-12 text-primary-500" />
              </div>
              
              {/* Basic Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">
                  {member.lastName} {member.firstName}
                </h2>
                <p className="text-dark-400">
                  {member.lastNameKana} {member.firstNameKana}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge status={member.status} />
                  {member.plan && (
                    <Badge variant="info">{member.plan.name}プラン</Badge>
                  )}
                </div>
              </div>

              {/* Member Number */}
              <div className="text-right">
                <p className="text-sm text-dark-400">会員番号</p>
                <p className="font-mono text-lg text-white">{member.memberNumber}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    メールアドレス
                  </label>
                  <p className="text-white">{session?.user?.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    電話番号
                  </label>
                  <p className="text-white">{member.phone}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    生年月日
                  </label>
                  <p className="text-white">
                    {member.dateOfBirth ? formatDate(member.dateOfBirth) : '未設定'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    性別
                  </label>
                  <p className="text-white">
                    {member.gender === 'male' ? '男性' : member.gender === 'female' ? '女性' : member.gender === 'other' ? 'その他' : '未設定'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    住所
                  </label>
                  <p className="text-white">{member.address || '未設定'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    入会日
                  </label>
                  <p className="text-white">{formatDate(member.joinedAt)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-dark-700 flex justify-end">
              <Button variant="secondary">
                <Save className="w-5 h-5 mr-2" />
                プロフィールを編集
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <Card className="border-red-500/30">
          <h3 className="text-lg font-semibold text-red-400 mb-4">アカウント設定</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">パスワード変更</p>
                <p className="text-sm text-dark-400">アカウントのパスワードを変更します</p>
              </div>
              <Button variant="secondary" size="sm">変更</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">休会申請</p>
                <p className="text-sm text-dark-400">一時的に会員資格を休止します</p>
              </div>
              <Button variant="secondary" size="sm">申請</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 font-medium">退会申請</p>
                <p className="text-sm text-dark-400">会員資格を終了します</p>
              </div>
              <Button variant="danger" size="sm">申請</Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
